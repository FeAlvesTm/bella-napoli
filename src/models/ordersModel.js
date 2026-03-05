import { pool } from '../../db/database.js';

export class Orders {
  static async create(client, userId, totalAmount, address) {
    const query = `
    INSERT INTO orders (user_id, status, total_amount, delivery_address_snapshot, payment_status)
    VALUES ($1, 'pendente', $2, $3, 'paid') 
    RETURNING id
  `;

    const res = await client.query(query, [userId, totalAmount, address]);
    return res.rows[0].id;
  }

  static async addItems(client, orderId, items) {
    for (const item of items) {
      const query = `
      INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
      VALUES ($1, $2, $3, $4)`;

      await client.query(query, [orderId, item.id, item.quantity, item.price]);
    }
  }

  static async updateStatus(orderId, newStatus) {
    const allowedStatus = ['pendente', 'preparando', 'entregando', 'concluido'];

    if (!allowedStatus.includes(newStatus)) {
      throw new AppError('Status inválido', 400);
    }
    const query = `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`;
    const { rows } = await pool.query(query, [newStatus, orderId]);
    return rows[0];
  }

  static async getOrdersByUser(userId) {
    const query = `
      SELECT 
        o.id, 
        o.created_at AS "createdAt", 
        o.status, 
        o.total_amount AS "total_price", 
        oi.quantity, 
        oi.price_at_purchase, 
        p.name AS "productName", 
        p.image_url AS "productImage"
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = $1
      ORDER BY o.id DESC;
    `;

    const { rows } = await pool.query(query, [userId]);

    const ordersMap = new Map();

    rows.forEach((row) => {
      if (!ordersMap.has(row.id)) {
        ordersMap.set(row.id, {
          id: row.id,
          createdAt: row.createdAt,
          status: row.status,
          total_price: Number(row.total_price),
          OrderItems: [],
        });
      }

      ordersMap.get(row.id).OrderItems.push({
        quantity: row.quantity,
        price_at_purchase: Number(row.price_at_purchase),
        Product: {
          name: row.productName,
          image: row.productImage,
        },
      });
    });

    return Array.from(ordersMap.values());
  }

  static async getUserDashboard(userId) {
    const orders = await this.getOrdersByUser(userId);

    if (!orders || orders.length === 0) {
      return {
        orders: [],
        totalOrders: 0,
        favoritePizza: 'Nenhum ainda 🍕',
        totalSpent: 0,
      };
    }

    const pizzaCounts = {};
    orders.forEach((order) => {
      order.OrderItems.forEach((item) => {
        const name = item.Product.name;
        pizzaCounts[name] = (pizzaCounts[name] || 0) + item.quantity;
      });
    });

    const favoritePizza = Object.entries(pizzaCounts).reduce(
      (a, b) => (a[1] > b[1] ? a : b),
      ['Nenhuma ainda', 0]
    )[0];

    return {
      orders,
      totalOrders: orders.length,
      favoritePizza,
    };
  }
}
