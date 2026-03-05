export const initSettingsTabs = () => {
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');
  if (!tabs.length || !panels.length) return;

  tabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      tabs.forEach((t) => t.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      const activePanel = document.getElementById(target);
      if (activePanel) activePanel.classList.add('active');
    });
  });
};

export const initCustomSelects = () => {
  const wrappers = document.querySelectorAll('.custom-select-wrapper');

  wrappers.forEach((wrapper) => {
    const trigger = wrapper.querySelector('.select-trigger');
    const items = wrapper.querySelectorAll('.select-options-list li');
    const hiddenInput = wrapper.querySelector('input[type="hidden"]');

    if (!trigger) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.custom-select-wrapper').forEach((w) => {
        if (w !== wrapper) w.classList.remove('active');
      });
      wrapper.classList.toggle('active');
    });

    items.forEach((item) => {
      item.addEventListener('click', () => {
        const value = item.dataset.value || item.innerText;

        trigger.querySelector('span').innerText = value;

        if (hiddenInput) hiddenInput.value = value;

        wrapper.classList.remove('active');
      });
    });
  });

  document.addEventListener('click', () => {
    document
      .querySelectorAll('.custom-select-wrapper')
      .forEach((w) => w.classList.remove('active'));
  });
};

export const initDeliverySlider = () => {
  const container = document.getElementById('delivery-slider');
  if (!container) return;

  const thumb = container.querySelector('.slider-thumb');
  const range = container.querySelector('.slider-range');
  const label = document.querySelector('.text-orange');
  const hiddenInput = document.querySelector('input[name="delivery_time"]');

  let isDragging = false;

  const updateSlider = (e) => {
    const rect = container.getBoundingClientRect();
    let percent = ((e.clientX - rect.left) / rect.width) * 100;
    percent = Math.max(0, Math.min(100, percent));

    thumb.style.left = `${percent}%`;
    range.style.width = `${percent}%`;

    const minutes = Math.round((percent / 100) * 120);
    if (label) label.innerText = `${minutes} min`;

    if (hiddenInput) hiddenInput.value = minutes;
  };

  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    updateSlider(e);
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) updateSlider(e);
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
};
