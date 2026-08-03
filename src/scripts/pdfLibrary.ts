export function pdfLibrary() {
  return `
    document.addEventListener('DOMContentLoaded', () => {
      const search = document.getElementById('pdf-search');
      const filters = document.querySelectorAll('.filter-btn');
      const cards = document.querySelectorAll('.pdf-card');

      if (!search) return;

      const applyFilter = () => {
        const q = search.value.toLowerCase();
        const activeFilter = document.querySelector('.filter-btn.active')?.getAttribute('data-filter') || 'all';
        cards.forEach((card) => {
          const title = (card.querySelector('.pdf-title')?.textContent || '').toLowerCase();
          const desc = (card.querySelector('.pdf-desc')?.textContent || '').toLowerCase();
          const cat = card.getAttribute('data-category') || '';
          const matchQ = !q || title.includes(q) || desc.includes(q);
          const matchF = activeFilter === 'all' || cat === activeFilter;
          card.style.display = matchQ && matchF ? '' : 'none';
        });
      };

      search.addEventListener('input', applyFilter);
      filters.forEach((btn) => {
        btn.addEventListener('click', () => {
          filters.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          applyFilter();
        });
      });
    });
  `;
}