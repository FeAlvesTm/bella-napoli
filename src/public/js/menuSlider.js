export function initSlider() {
  const slider = document.querySelector('.items-menu');
  const slideItems = document.querySelectorAll('.card');
  const btnNext = document.querySelector('.menu-next-btn');
  const btnPrev = document.querySelector('.menu-prev-btn');

  let index = 0;
  const total = slideItems.length / 4;

  if (!slider || !btnNext || !btnPrev) return;

  btnNext.addEventListener('click', () => {
    index = (index + 1) % total;
    slider.style.transform = `translateX(-${index * 100}%)`;
  });

  btnPrev.addEventListener('click', () => {
    index = (index - 1 + total) % total;
    slider.style.transform = `translateX(-${index * 100}%)`;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const btnCats = document.getElementById('btn-open-categories');
  const listCats = document.getElementById('categories-list');
  if (!listCats) {
    return;
  }

  const activeBtn = listCats.querySelector('.category-btn-active');
  if (activeBtn && btnCats) {
    const categoryText = activeBtn.querySelector('.category-text').innerText;
    btnCats.querySelector('span').innerText = `Categoria: ${categoryText}`;
  }

  if (btnCats) {
    btnCats.addEventListener('click', () => {
      const isShowing = listCats.classList.toggle('show-mobile');
      listCats.classList.toggle('mobile-hidden');

      document.body.style.overflow = isShowing ? 'hidden' : '';

      if (!isShowing) {
        const currentActive = listCats.querySelector('.category-btn-active');
        const txt = currentActive
          ? currentActive.querySelector('.category-text').innerText
          : 'Selecionar';
        btnCats.querySelector('span').innerText = `Categoria: ${txt}`;
      } else {
        btnCats.querySelector('span').innerText = 'Fechar Menu';
      }
    });
  }
});
