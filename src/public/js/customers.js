document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector(
    '.customers-list-search-input input'
  );
  const rows = document.querySelectorAll('.customers-list-table tbody tr');
  const countDisplay = document.getElementById('customers-count');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      let visibleCount = 0;

      rows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
          row.style.display = '';
          visibleCount++;
        } else {
          row.style.display = 'none';
        }
      });

      if (countDisplay) countDisplay.innerText = visibleCount;
    });
  }
});
