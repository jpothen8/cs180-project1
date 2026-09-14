// The report is complete without JavaScript. This adds the gallery comparison.
(() => {
  const buttons = document.querySelectorAll('[data-mode]');
  const cards = document.querySelectorAll('#gallery [data-name]');
  const status = document.getElementById('gallery-status');
  let measurements;
  async function setMode(mode) {
    try {
      if (!measurements) {
        const response = await fetch('measurements.json');
        if (!response.ok) throw new Error('Measurements are unavailable');
        measurements = await response.json();
      }
      const label = mode === 'pyramid' ? 'Raw-pixel NCC' : 'Edges + NCC';
      for (const card of cards) {
        const name = card.dataset.name;
        const result = measurements[name][mode];
        const image = card.querySelector('img');
        const link = card.querySelector('.image-link');
        image.src = `images/${mode}/${name}.jpg`;
        image.alt = `${card.querySelector('figcaption').textContent}: ${label}`;
        link.href = image.getAttribute('src');
        card.querySelector('[data-offset]').textContent =
          `G (${result.green_offset_xy.join(', ')})   R (${result.red_offset_xy.join(', ')})`;
      }
      for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.mode === mode));
      status.textContent = `${label} · offsets in (x, y)`;
    } catch (error) {
      status.textContent = 'Comparison could not load. The raw-pixel results and CSV remain available.';
    }
  }
  for (const button of buttons) button.addEventListener('click', () => setMode(button.dataset.mode));
  // Browsers prepare printing synchronously; store the default view without fetch.
  window.addEventListener('beforeprint', () => {
    for (const card of cards) {
      const name = card.dataset.name;
      card.querySelector('img').src = `images/pyramid/${name}.jpg`;
      card.querySelector('.image-link').href = `images/pyramid/${name}.jpg`;
      if (measurements) {
        const r = measurements[name].pyramid;
        card.querySelector('[data-offset]').textContent = `G (${r.green_offset_xy.join(', ')})   R (${r.red_offset_xy.join(', ')})`;
      }
    }
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.mode === 'pyramid'));
    status.textContent = 'Raw-pixel NCC · offsets in (x, y)';
  });
})();
