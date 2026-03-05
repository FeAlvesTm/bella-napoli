document.addEventListener('click', (e) => {
  if (e.target.classList.contains('js-add-to-cart')) {
    const btn = e.target;
    const item = {
      id: btn.dataset.id,
      name: btn.dataset.name,
      price: btn.dataset.price,
      image_url: btn.dataset.image,
      description: btn.dataset.desc,
    };
    addToCart(item);
  }
});

document.getElementById('cart-items-list').addEventListener('click', (e) => {
  const removeBtn = e.target.closest('.js-remove-item');
  if (removeBtn) {
    const id = removeBtn.dataset.id;
    removeFromCart(id);
  }
});

function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  updateCartUI();

  if (cart.length === 0) toggleCart();
}

const btnCheckout = document.getElementById('btn-checkout');
if (btnCheckout) {
  btnCheckout.addEventListener('click', async (e) => {
    e.preventDefault();
    btnCheckout.disabled = true;
    btnCheckout.innerText = 'Processando...';
    await sendToStripe();
  });
}

document.addEventListener('click', (e) => {
  if (e.target.closest('.close-cart') || e.target.closest('.cart-icon')) {
    toggleCart();
  }
});

let cart = JSON.parse(localStorage.getItem('menu_cart')) || [];

document.addEventListener('DOMContentLoaded', updateCartUI);

function toggleCart() {
  document.getElementById('sidebar-cart').classList.toggle('active');
}

function addToCart(item) {
  const { id, name, price, image_url, description } = item;

  const existing = cart.find((i) => i.id === id);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({
      id,
      name,
      price: parseFloat(price),
      image: image_url,
      description,
      quantity: 1,
    });
  }

  const sidebar = document.getElementById('sidebar-cart');
  sidebar.classList.add('active');

  updateCartUI();
}

function updateCartUI() {
  const list = document.getElementById('cart-items-list');
  const totalEl = document.getElementById('cart-total');
  const badge = document.getElementById('cart-badge');
  const subtotalEl = document.getElementById('cart-subtotal');
  const deliveryEl = document.getElementById('cart-delivery-fee');
  const promoBadge = document.getElementById('free-delivery-promo');
  const promoText = document.getElementById('promo-text');
  const btnCheckout = document.getElementById('btn-checkout');

  if (!list || !totalEl) return;

  let htmlContent = '';
  let subtotal = 0;
  let count = 0;

  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    count += item.quantity;

    htmlContent += `
      <div class="cart-item-row">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-info">
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-qty">x${item.quantity}</span>
        </div>
        <div class="cart-item-price-area">
          <span class="cart-item-price">R$ ${itemTotal.toFixed(2)}</span>
          <button class="btn-remove-item js-remove-item" data-id="${item.id}" title="Remover">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </div>`;
  });

  localStorage.setItem('menu_cart', JSON.stringify(cart));

  list.innerHTML =
    htmlContent || '<p class="empty-msg">Seu carrinho está vazio 🍕</p>';

  if (window.lucide) {
    window.lucide.createIcons();
  }

  const config = window.storeConfig || {};
  const deliveryFeeBase = parseFloat(config.delivery_fee || 0);
  const freeThreshold = parseFloat(config.free_delivery_threshold || 0);
  const minOrderValue = parseFloat(config.min_order_value || 0);
  const isFreeActive =
    config.free_delivery_active === true ||
    config.free_delivery_active === 'true';

  let finalDeliveryFee = subtotal > 0 ? deliveryFeeBase : 0;

  if (promoBadge && isFreeActive && subtotal > 0) {
    promoBadge.classList.remove('hidden');
    if (subtotal >= freeThreshold) {
      finalDeliveryFee = 0;
      promoBadge.classList.add('is-free');
      promoText.innerText = 'Frete Grátis liberado! 🍕';
    } else {
      const remaining = freeThreshold - subtotal;
      promoBadge.classList.remove('is-free');
      promoText.innerText = `Faltam R$ ${remaining.toFixed(2)} para Frete Grátis!`;
    }
  } else if (promoBadge) {
    promoBadge.classList.add('hidden');
  }

  if (badge) badge.innerText = count;
  if (subtotalEl) subtotalEl.innerText = `R$ ${subtotal.toFixed(2)}`;
  if (deliveryEl)
    deliveryEl.innerText =
      finalDeliveryFee === 0 ? 'GRÁTIS' : `R$ ${finalDeliveryFee.toFixed(2)}`;

  const totalGeral = subtotal + finalDeliveryFee;
  totalEl.innerText = `R$ ${totalGeral.toFixed(2)}`;

  if (btnCheckout) {
    if (subtotal > 0 && subtotal < minOrderValue) {
      btnCheckout.disabled = true;
      btnCheckout.innerText = `Mínimo R$ ${minOrderValue.toFixed(2)}`;
    } else {
      btnCheckout.disabled = cart.length === 0;
      btnCheckout.innerText =
        cart.length === 0 ? 'Carrinho Vazio' : 'Finalizar Pedido';
    }
  }
}

async function sendToStripe() {
  if (cart.length === 0) return alert('Carrinho vazio!');

  const cartData = cart.map((item) => ({
    id: item.id,
    quantity: item.quantity,
  }));

  try {
    const response = await fetch('/order/checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart: cartData }),
    });

    const data = await response.json();

    if (data.url) {
      localStorage.removeItem('menu_cart');
      cart = [];
      updateCartUI();

      window.location.href = data.url;
    } else {
      alert(data.error || 'Erro ao gerar link de pagamento');
    }
  } catch (err) {
    console.error('Erro ao processar checkout:', err);
    alert('Erro de conexão com o servidor. Tente novamente.');
  }
}
