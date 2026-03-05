document.addEventListener('DOMContentLoaded', () => {
  const modalAdd = document.getElementById('product-modal');
  const modalEdit = document.getElementById('edit-product-modal');
  const openAddBtn = document.querySelector('.btn-add-product');
  const rows = document.querySelectorAll('.orders-table tbody tr');
  const countDisplay = document.getElementById('products-count');

  const searchInput = document.getElementById('products-search-input');
  const filterToggleBtn = document.getElementById('btn-filter-toggle');
  const filterMenu = document.getElementById('filter-menu');
  const filterLabel = document.getElementById('selected-category');

  let currentFilter = 'all';
  let currentSearch = '';

  const applyAllFilters = () => {
    let visibleCount = 0;
    rows.forEach((row) => {
      const text = row.textContent.toLowerCase();
      const categoryCell = row.querySelector('.category-text');
      const statusPill = row.querySelector('.status-pill');

      const rowCategory = categoryCell?.innerText.trim().toLowerCase() || '';
      const rowStatus = statusPill?.classList.contains('ativado')
        ? 'ativado'
        : 'desativado';

      const matchesFilter =
        currentFilter === 'all' ||
        (currentFilter === 'ativado' || currentFilter === 'desativado'
          ? rowStatus === currentFilter
          : rowCategory === currentFilter);

      const matchesSearch = text.includes(currentSearch);

      if (matchesFilter && matchesSearch) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });
    if (countDisplay) countDisplay.innerText = visibleCount;
  };

  const toggleModal = (modalEl, action = 'open') => {
    if (!modalEl) return;
    modalEl.classList[action === 'open' ? 'add' : 'remove']('active');
    document.body.style.overflow = action === 'open' ? 'hidden' : 'auto';
  };

  openAddBtn?.addEventListener('click', () => toggleModal(modalAdd, 'open'));
  document
    .getElementById('close-modal-btn')
    ?.addEventListener('click', () => toggleModal(modalAdd, 'close'));
  document
    .getElementById('cancel-btn')
    ?.addEventListener('click', () => toggleModal(modalAdd, 'close'));
  document
    .getElementById('close-edit-modal-btn')
    ?.addEventListener('click', () => toggleModal(modalEdit, 'close'));
  document
    .getElementById('cancel-edit-btn')
    ?.addEventListener('click', () => toggleModal(modalEdit, 'close'));

  document
    .querySelector('.orders-table')
    ?.addEventListener('click', async (e) => {
      const editBtn = e.target.closest('.btn-action.edit');
      if (editBtn) {
        const row = editBtn.closest('tr');
        const productId = editBtn.getAttribute('data-id');

        document.getElementById('edit-id').value = productId;
        document.getElementById('edit-name').value =
          row.querySelector('strong').innerText;
        document.getElementById('edit-description').value =
          row.querySelector('.product-meta p').innerText;
        document.getElementById('edit-category').value = row
          .querySelector('.category-text')
          .innerText.trim()
          .toLowerCase();
        document.getElementById('edit-price').value = row
          .querySelector('.price-text')
          .innerText.replace('R$', '')
          .replace(',', '.')
          .trim();
        document.getElementById('edit-status').value = row
          .querySelector('.status-pill')
          .classList.contains('ativado')
          ? 'ativado'
          : 'desativado';

        toggleModal(modalEdit, 'open');
        return;
      }

      const deleteBtn = e.target.closest('.btn-action.delete');

      if (deleteBtn) {
        const productId = deleteBtn.getAttribute('data-id');
        const originalHTML = deleteBtn.innerHTML;
        let countdown = 5;
        deleteBtn.style.pointerEvents = 'none';
        deleteBtn.style.opacity = '0.6';

        const timer = setInterval(() => {
          deleteBtn.innerHTML = `<span style="font-size: 11px; font-weight: bold; color: #ef4444;">${countdown}s</span>`;
          if (countdown <= 0) {
            clearInterval(timer);
            deleteBtn.innerHTML = originalHTML;
            deleteBtn.style.pointerEvents = 'auto';
            deleteBtn.style.opacity = '1';

            if (confirm('⚠️ Excluir produto permanentemente?')) {
              fetch(`/adminPanel/deleteProduct/${productId}`, {
                method: 'DELETE',
              })
                .then((res) => res.ok && window.location.reload())
                .catch(() => alert('Erro ao excluir'));
            }
          }
          countdown--;
        }, 1000);
      }
    });

  const handleFormSubmit = async (e, url, method) => {
    e.preventDefault();
    const modal = e.target.closest('.modal-content');
    const submitBtn = modal.querySelector('.btn-save');
    const originalText = submitBtn.innerText;
    submitBtn.disabled = true;
    submitBtn.innerText = 'Processando...';

    try {
      const response = await fetch(url, {
        method,
        body: new FormData(e.target),
      });
      const result = await response.json();
      if (result.success) window.location.reload();
      else {
        alert(result.message);
        submitBtn.disabled = false;
        submitBtn.innerText = originalText;
      }
    } catch (err) {
      alert('Erro no servidor');
      submitBtn.disabled = false;
      submitBtn.innerText = originalText;
    }
  };

  document
    .getElementById('product-form')
    ?.addEventListener('submit', (e) =>
      handleFormSubmit(
        e,
        '/adminPanel/createNewProduct',
        'POST'
      )
    );
  document
    .getElementById('edit-product-form')
    ?.addEventListener('submit', (e) =>
      handleFormSubmit(
        e,
        `/adminPanel/updateProduct/${document.getElementById('edit-id').value}`,
        'PUT'
      )
    );

  filterMenu?.querySelectorAll('li').forEach((item) => {
    item.addEventListener('click', () => {
      currentFilter = item.getAttribute('data-value').toLowerCase();
      if (filterLabel) filterLabel.innerText = item.innerText;
      filterMenu.classList.remove('active');
      applyAllFilters();
    });
  });

  searchInput?.addEventListener('input', (e) => {
    currentSearch = e.target.value.toLowerCase();
    applyAllFilters();
  });

  filterToggleBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    filterMenu.classList.toggle('active');
  });
});

window.previewProductImage = function (input, isEdit = false) {
  const prefix = isEdit ? 'edit-' : '';
  const display = document.getElementById(`${prefix}image-preview-name`);
  if (input.files && input.files[0])
    display.textContent = `Selecionado: ${input.files[0].name}`;
};
