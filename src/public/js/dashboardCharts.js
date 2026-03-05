export const dashboardCharts = () => {
  const barEl = document.getElementById('salesBarChart');
  const donutEl = document.getElementById('donutChart');
  const barDataInput = document.getElementById('weekly-sales-data');
  const donutDataInput = document.getElementById('top-products-data');

  if (barEl && barDataInput) {
    try {
      const rawData = JSON.parse(barDataInput.value || '[]');

      const weeklyValues = new Array(7).fill(0);

      rawData.forEach((item) => {
        let index = parseInt(item.dia_semana) - 1;
        if (index === -1) index = 6;

        if (index >= 0 && index < 7) {
          weeklyValues[index] = parseFloat(item.vendas);
        }
      });

      new Chart(barEl, {
        type: 'bar',
        data: {
          labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
          datasets: [
            {
              label: 'Vendas (R$)',
              data: weeklyValues,
              backgroundColor: '#ff6b00',
              borderRadius: 6,
              barPercentage: 0.6,
              categoryPercentage: 0.8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false } },
            y: {
              grid: {
                color: '#e5e7eb',
                borderDash: [5, 5],
                drawTicks: false,
              },
              border: { display: false },
              ticks: { padding: 10, beginAtZero: true },
            },
          },
        },
      });
    } catch (err) {
      console.error('Erro ao processar gráfico de barras:', err);
    }
  }

  if (donutEl) {
    const rawDonutData = JSON.parse(donutDataInput.value || '[]');

    const labels = rawDonutData.map((d) => d.label);
    const values = rawDonutData.map((d) => parseInt(d.value));

    const donutChartInstance = new Chart(donutEl, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [
          {
            data: values,
            backgroundColor: [
              '#ff6b00',
              '#1a7f37',
              '#ffbb00',
              '#800080',
              '#ff0000',
            ],
            borderWidth: 0,
            spacing: 10,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: 40 },
        plugins: { legend: { display: false } },
        cutout: '70%',
      },
    });
    generateCustomLegend(donutChartInstance, 'chart-legend-container');
  }
};

function generateCustomLegend(chart, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const { datasets, labels } = chart.data;
  const data = datasets[0].data;
  const colors = datasets[0].backgroundColor;
  const total = data.reduce((a, b) => a + b, 0);

  const html = labels
    .map((label, i) => {
      const percentage = ((data[i] / total) * 100).toFixed(1);
      return `
      <li style="display: flex; justify-content: space-between; gap: 10px; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
          <div style="display: flex; align-items: center;">
              <span style="width: 12px; height: 12px; background: ${colors[i]}; border-radius: 50%; margin-right: 10px;"></span>
              <span style="color: #4d4d4d; font-size: 0.875rem; font-weight: 500;">${label}</span>
          </div>
          <span style="color: #706863; font-size: 0.875rem; font-weight: 700;">${percentage}%</span>
      </li>`;
    })
    .join('');

  container.innerHTML = `<ul style="list-style: none; padding: 0; margin: 0;">${html}</ul>`;
}
