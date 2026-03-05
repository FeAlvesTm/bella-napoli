import { initSlider } from './menuSlider.js';
import { initScrollPage } from './navigation.js';
import { dashboardCharts } from './dashboardCharts.js';
import { initZipCode } from './getCep.js';
import {
  initSettingsTabs,
  initCustomSelects,
  initDeliverySlider,
} from './adminConfig.js';

document.addEventListener('DOMContentLoaded', () => {
  initScrollPage();
  initSlider();
  dashboardCharts();
  initSettingsTabs();
  initCustomSelects();
  initDeliverySlider();
  initZipCode();
});
