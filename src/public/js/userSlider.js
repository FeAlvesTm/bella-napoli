document.addEventListener('DOMContentLoaded', () => {
  const list = document.querySelector('.js-carousel-list');
  const nextBtn = document.getElementById('next-orders');
  const prevBtn = document.getElementById('prev-orders');
  const pageIndicator = document.getElementById('page-indicator');

  if (!list || !nextBtn) return;

  let currentPage = 0;
  const cards = document.querySelectorAll('.order-card');
  const totalCards = cards.length;

  const totalPages = Math.ceil(totalCards / 5);

  function updateCarousel() {
    const windowWidth = document.querySelector('.orders-window').offsetWidth;
    const move = currentPage * windowWidth;
    list.style.transform = `translateX(-${move}px)`;

    if (pageIndicator) {
      pageIndicator.textContent = `${currentPage + 1} / ${totalPages || 1}`;
    }

    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage >= totalPages - 1;
  }

  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages - 1) {
      currentPage++;
      updateCarousel();
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentPage > 0) {
      currentPage--;
      updateCarousel();
    }
  });

  updateCarousel();
});
