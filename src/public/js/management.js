document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('management-search-input');
  const filterBtns = document.querySelectorAll('.btn-filter');
  const rows = document.querySelectorAll('.orders-table tbody tr');

  let currentSearch = '';
  let currentStatus = 'todos';

  const filterOrders = () => {
    rows.forEach((row) => {
      const text = row.textContent.toLowerCase();
      const statusPill = row.querySelector('.status-pill');
      const rowStatus = statusPill?.innerText.trim().toLowerCase() || '';

      const matchesSearch = text.includes(currentSearch);
      const matchesStatus =
        currentStatus === 'todos' || rowStatus === currentStatus;

      row.style.display = matchesSearch && matchesStatus ? '' : 'none';
    });
  };

  searchInput?.addEventListener('input', (e) => {
    currentSearch = e.target.value.toLowerCase();
    filterOrders();
  });

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('btn-filter-active'));
      btn.classList.add('btn-filter-active');
      currentStatus = btn.getAttribute('data-status').toLowerCase();
      filterOrders();
    });
  });
});
