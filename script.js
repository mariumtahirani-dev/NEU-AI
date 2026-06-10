// ===== NEU AI Job Portal – Main Script =====

document.addEventListener('DOMContentLoaded', () => {

  // ── DOM References ──
  const searchInput     = document.getElementById('searchInput');
  const jobsGrid        = document.getElementById('jobsGrid');
  const noResults       = document.getElementById('noResults');
  const jobsHeading     = document.getElementById('jobsHeading');
  const resultsCount    = document.getElementById('resultsCount');
  const totalJobsStat   = document.getElementById('totalJobs');
  const modalOverlay    = document.getElementById('modalOverlay');
  const modalClose      = document.getElementById('modalClose');
  const modalIcon       = document.getElementById('modalIcon');
  const modalTitle      = document.getElementById('modalTitle');
  const modalCompany    = document.getElementById('modalCompany');
  const modalTags       = document.getElementById('modalTags');
  const modalDesc       = document.getElementById('modalDesc');
  const modalApply      = document.getElementById('modalApply');
  const categoryBtns    = document.querySelectorAll('.category-card');

  let jobsData = [];
  let activeCategory = 'all';

  // ── Load Data ──
  fetch('jobs.json')
    .then(r => r.json())
    .then(data => {
      jobsData = data;
      totalJobsStat.textContent = data.length;
      updateCategoryCounts();
      renderJobs(jobsData);
    })
    .catch(() => {
      jobsGrid.innerHTML = '<p style="color:var(--text-muted);text-align:center;">Failed to load jobs.</p>';
    });

  // ── Category Counts ──
  function updateCategoryCounts() {
    const countAll = document.getElementById('count-all');
    if (countAll) countAll.textContent = jobsData.length + ' jobs';

    const categories = ['Engineering', 'Architecture', 'Mobile Repairing', 'Driving'];
    categories.forEach(cat => {
      const el = document.getElementById('count-' + cat);
      if (el) {
        const n = jobsData.filter(j => j.category === cat).length;
        el.textContent = n + ' jobs';
      }
    });
  }

  // ── Render Job Cards ──
  function renderJobs(list) {
    jobsGrid.innerHTML = '';

    if (list.length === 0) {
      noResults.classList.remove('hidden');
      resultsCount.textContent = '';
      return;
    }

    noResults.classList.add('hidden');
    resultsCount.textContent = list.length + ' result' + (list.length !== 1 ? 's' : '');

    list.forEach((job, i) => {
      const card = document.createElement('div');
      card.className = 'job-card';
      card.style.animationDelay = (i * 0.06) + 's';

      card.innerHTML = `
        <div class="job-card-header">
          <div class="job-card-icon">${job.icon || '💼'}</div>
          <div class="job-card-info">
            <div class="job-card-title">${job.title}</div>
            <div class="job-card-company">${job.company || ''}</div>
          </div>
        </div>
        <div class="job-card-meta">
          <span class="meta-tag">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${job.location}
          </span>
          <span class="meta-tag">${job.type}</span>
          <span class="meta-tag">${job.category}</span>
        </div>
        <div class="job-card-footer">
          <span class="job-salary">${job.salary || ''}</span>
          <span class="job-posted">${job.posted || ''}</span>
        </div>
      `;

      card.addEventListener('click', () => openModal(job));
      jobsGrid.appendChild(card);
    });
  }

  // ── Filtering ──
  function filterJobs() {
    const query = searchInput.value.trim().toLowerCase();
    let filtered = jobsData;

    // Category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter(j => j.category === activeCategory);
    }

    // Text search
    if (query) {
      filtered = filtered.filter(j => {
        const haystack = `${j.title} ${j.company} ${j.category} ${j.location} ${j.description}`.toLowerCase();
        return haystack.includes(query);
      });
    }

    // Update heading
    if (activeCategory !== 'all') {
      jobsHeading.textContent = activeCategory + ' Jobs';
    } else {
      jobsHeading.textContent = query ? 'Search Results' : 'All Jobs';
    }

    renderJobs(filtered);
  }

  // ── Search Events ──
  searchInput.addEventListener('input', filterJobs);

  // ── Category Click ──
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.category;
      filterJobs();

      // Smooth scroll to jobs section
      document.querySelector('.jobs-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ── Modal ──
  function openModal(job) {
    modalIcon.textContent = job.icon || '💼';
    modalTitle.textContent = job.title;
    modalCompany.textContent = job.company || '';
    modalDesc.textContent = job.description;

    modalTags.innerHTML = '';
    const tags = [job.location, job.type, job.category, job.salary].filter(Boolean);
    tags.forEach(t => {
      const span = document.createElement('span');
      span.className = 'modal-tag';
      span.textContent = t;
      modalTags.appendChild(span);
    });

    modalOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOverlay.classList.add('hidden');
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', e => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  modalApply.addEventListener('click', () => {
    alert('🎉 Application submitted! We will get back to you soon.');
    closeModal();
  });

});
