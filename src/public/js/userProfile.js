import { initZipCode } from './getCep.js';

window.previewImage = function (input) {
  const fileNameDisplay = document.getElementById('avatar-preview-name');
  if (input.files && input.files[0]) {
    fileNameDisplay.textContent = `Selecionado: ${input.files[0].name}`;
    fileNameDisplay.style.color = '#28a745';
  } else {
    fileNameDisplay.textContent = 'Nenhum arquivo selecionado';
    fileNameDisplay.style.color = '#666';
  }
};

export function toggleEditProfile() {
  const modal = document.getElementById('edit-profile-modal');
  if (modal) modal.classList.toggle('active');
}
window.toggleEditProfile = toggleEditProfile;

document.addEventListener('DOMContentLoaded', () => {
  initZipCode();

  const profileTriggers = document.querySelectorAll(
    '.btn-edit-profile, .close-modal, .btn-cancel-profile, .btn-sec'
  );
  profileTriggers.forEach((btn) => {
    btn.addEventListener('click', toggleEditProfile);
  });

  const modalOverlay = document.getElementById('edit-profile-modal');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) toggleEditProfile();
    });
  }

  const cepInput = document.getElementById('zip_code');
  if (cepInput) {
    cepInput.addEventListener('input', function () {
      let value = this.value.replace(/\D/g, '');
      if (value.length > 5) value = value.replace(/^(\d{5})(\d{1,3})/, '$1-$2');
      this.value = value;
    });
  }

  const profileForm = document.getElementById('profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const formData = new FormData(this);

      try {
        const response = await fetch('/user/update-profile', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          alert('Dados atualizados com sucesso! 🍕');
          location.reload();
        } else {
          alert('Erro: ' + (data.message || 'Falha na atualização'));
        }
      } catch (error) {
        console.error('Erro no Fetch:', error);
        alert('Erro técnico ao atualizar perfil');
      }
    });
  }
});

setInterval(async () => {
  try {
    const res = await fetch(`/user/my-orders-api?t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
    const orders = await res.json();

    orders.forEach((order) => {
      const card = document.querySelector(`.order-card[data-id="${order.id}"]`);
      if (card) {
        const pill = card.querySelector('.order-status');
        const statusNoBanco = String(order.status).toLowerCase().trim();
        const statusNaTela = pill.innerText.toLowerCase().trim();

        if (statusNoBanco !== statusNaTela) {
          pill.innerText = order.status.toUpperCase();
          pill.className = `order-status status-${statusNoBanco}`;
          updateDeliveryTimers();
        }
      }
    });
  } catch (err) {}
}, 3000);

const updateDeliveryTimers = () => {
  const cards = document.querySelectorAll('.order-card');

  cards.forEach((card) => {
    const timerEl = card.querySelector('.delivery-timer');
    const pill = card.querySelector('.order-status');
    if (!timerEl || !pill) return;

    const createdAt = new Date(card.dataset.created);
    const maxMinutes = parseFloat(card.dataset.deliveryMax || 1);
    const totalMs = maxMinutes * 60 * 1000;
    const msPassados = new Date() - createdAt;
    const statusAtual = pill.innerText.toLowerCase().trim();

    if (statusAtual === 'concluido' || msPassados >= totalMs) {
      timerEl.innerText = '✅ Pedido Entregue!';
      timerEl.style.color = '#10b981';
    } else if (
      statusAtual === 'entregando' ||
      msPassados >= (totalMs * 2) / 3
    ) {
      timerEl.innerText = '🛵 A caminho agora!';
      timerEl.style.color = '#83ef44';
    } else if (
      statusAtual === 'preparando' ||
      msPassados >= (totalMs * 1) / 3
    ) {
      timerEl.innerText = '🔥 No forno...';
      pill.innerText;
      timerEl.style.color = '#f59e0b';
    } else {
      timerEl.innerText = '⏳ Aguardando...';
      timerEl.style.color = '#666';
    }
  });
};

setInterval(updateDeliveryTimers, 1000);
updateDeliveryTimers();
