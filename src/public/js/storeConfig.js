document.addEventListener('DOMContentLoaded', () => {
  const btnSave = document.querySelector('.btn-store-settings');

  document.querySelectorAll('.select-options-list li').forEach((option) => {
    option.addEventListener('click', (e) => {
      const value = e.currentTarget.dataset.value;
      const wrapper = e.currentTarget.closest('.custom-select-wrapper');

      const hiddenInput = wrapper.querySelector('input[type="hidden"]');
      if (hiddenInput) hiddenInput.value = value;

      wrapper.querySelector('.select-trigger span').innerText = value;
    });
  });

  btnSave.addEventListener('click', async () => {
    const inputs = document.querySelectorAll(
      '.tab-panel input, .tab-panel select'
    );
    const data = {};

    inputs.forEach((input) => {
      if (!input.name || input.name.trim() === '') return;

      if (input.type === 'checkbox') {
        data[input.name] = input.checked;
      } else {
        data[input.name] = input.value;
      }
    });

    try {
      const response = await fetch('/adminPanel/updateStoreConfig', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.success) {
        alert('✅ Configurações salvas com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('❌ Erro ao conectar com o servidor.');
    }
  });
});
