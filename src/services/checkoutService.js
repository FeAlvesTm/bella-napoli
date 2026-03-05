import { pool } from '../../db/database.js';
import Stripe from 'stripe';
import { Orders } from '../models/ordersModel.js';
import AppError from '../middlewares/appError.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const getStripeCustomerByEmail = async (email) => {
  const customers = await stripe.customers.list({ email, limit: 1 });
  return customers.data[0];
};

const createStripeCustomer = async (user) => {
  const customer = await getStripeCustomerByEmail(user.email);
  if (customer) return customer;

  return stripe.customers.create({
    email: user.email,
    name: user.name,
  });
};

const iniciarProgressoAutomatico = async (orderId) => {
  const { rows } = await pool.query(
    'SELECT delivery_time FROM store_config LIMIT 1'
  );

  const tempoTotal = parseFloat(rows[0]?.delivery_time || 1);
  const msPorEtapa = (tempoTotal / 3) * 60 * 1000;

  const etapas = ['preparando', 'entregando', 'concluido'];
  let i = 0;

  const intervalo = setInterval(async () => {
    if (i < etapas.length) {
      await Orders.updateStatus(orderId, etapas[i]);
      i++;
    } else {
      clearInterval(intervalo);
    }
  }, msPorEtapa);
};

export const CheckoutService = {
  async createSession(user, cart, baseUrl) {
    const productIds = cart.map((i) => i.id);

    const { rows: dbProducts } = await pool.query(
      'SELECT id, name, price, description, image_url FROM products WHERE id = ANY($1)',
      [productIds]
    );

    const { rows: configRows } = await pool.query(
      'SELECT * FROM store_config LIMIT 1'
    );
    const storeConfig = configRows[0];

    const validatedItems = cart.map((item) => {
      const product = dbProducts.find((p) => String(p.id) === String(item.id));
      if (!product) {
        throw new AppError('Produto inválido no carrinho', 400);
      }

      return {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        quantity: item.quantity,
        image: product.image_url,
        description: product.description,
      };
    });

    const subtotal = validatedItems.reduce(
      (acc, i) => acc + i.price * i.quantity,
      0
    );

    let deliveryFee = parseFloat(storeConfig.delivery_fee || 0);
    if (
      storeConfig.free_delivery_active &&
      subtotal >= parseFloat(storeConfig.free_delivery_threshold)
    ) {
      deliveryFee = 0;
    }

    const line_items = validatedItems.map((item) => ({
      price_data: {
        currency: 'brl',
        unit_amount: Math.round(item.price * 100),
        product_data: {
          name: item.name,
          description: item.description || 'Pizza deliciosa',
          images: item.image ? [item.image] : [],
        },
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: 'brl',
        unit_amount: Math.round(deliveryFee * 100),
        product_data: {
          name:
            deliveryFee === 0
              ? '🎉 Parabéns! A entrega hoje é por nossa conta'
              : '🚚 Taxa de entrega para o seu endereço',
        },
      },
      quantity: 1,
    });

    const customer = await createStripeCustomer(user);

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      metadata: {
        userId: user.id,
        address: `${user.street}, ${user.number} - ${user.neighborhood}`,
        totalAmount: (subtotal + deliveryFee).toFixed(2),
        cartData: JSON.stringify(
          cart.map((i) => ({ id: i.id, q: i.quantity }))
        ),
      },
      success_url: `${baseUrl}/user/perfil?success=true`,
      cancel_url: `${baseUrl}/menu/pizzas`,
    });

    return session.url;
  },

  async handleWebhook(event) {
    if (event.type !== 'checkout.session.completed') return;

    const session = event.data.object;
    const { userId, address, totalAmount, cartData } = session.metadata;
    const itemsRaw = JSON.parse(cartData);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const orderId = await Orders.create(client, userId, totalAmount, address);

      const productIds = itemsRaw.map((i) => i.id);
      const { rows: dbProds } = await client.query(
        'SELECT id, price FROM products WHERE id = ANY($1)',
        [productIds]
      );

      const items = itemsRaw.map((item) => {
        const p = dbProds.find((db) => String(db.id) === String(item.id));
        if (!p) throw new AppError('Produto inválido', 400);
        return { id: item.id, price: p.price, quantity: item.q };
      });

      await Orders.addItems(client, orderId, items);
      await Orders.updateStatus(orderId, 'pendente');

      await client.query('COMMIT');
      iniciarProgressoAutomatico(orderId);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
};
