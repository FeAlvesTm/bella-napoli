export function saveScrollPage(e) {
  e.preventDefault();
  sessionStorage.setItem('scrollPos', window.scrollY);
  window.location.href = e.currentTarget.href;
}

export function initScrollPage() {
  const scrollPos = sessionStorage.getItem('scrollPos');
  if (scrollPos) {
    window.scrollTo(0, parseInt(scrollPos));
    sessionStorage.removeItem('scrollPos');
  }

  const categoryButtons = document.querySelectorAll('.category-btn');
  categoryButtons.forEach((btn) => {
    btn.addEventListener('click', saveScrollPage);
  });
}
