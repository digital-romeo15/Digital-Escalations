/* Digital Escalations — site interactions */
(function () {
  // Header background on scroll
  const header = document.querySelector('.site-header');
  const onScroll = () => header && header.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile nav
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open);
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('open'); toggle.classList.remove('open'); toggle.setAttribute('aria-expanded', false);
    }));
  }

  // Reveal on scroll
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  // Footer year
  document.querySelectorAll('[data-year]').forEach(el => (el.textContent = new Date().getFullYear()));

  // Web3Forms AJAX submit (falls back to normal POST if JS fails)
  document.addEventListener('submit', async (e) => {
    const form = e.target;
    if (!form.matches('form[data-web3]')) return;
    e.preventDefault();
    const status = form.querySelector('.form-status');
    const btn = form.querySelector('button[type=submit]');
    const original = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
    if (status) { status.className = 'form-status'; status.textContent = ''; }
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      });
      const data = await res.json();
      if (data.success) {
        form.reset();
        const counter = form.querySelector('.char-count');
        if (counter) counter.textContent = '300 characters remaining';
        if (status) { status.classList.add('ok'); status.textContent = form.dataset.success || 'Thank you! Your message has been sent. We’ll be in touch shortly.'; }
      } else {
        throw new Error(data.message || 'Something went wrong');
      }
    } catch (err) {
      if (status) { status.classList.add('err'); status.textContent = 'Sorry, your message could not be sent. Please try again or WhatsApp us on 073 072 9250.'; }
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = original; }
    }
  });

  // Review character counter
  document.querySelectorAll('textarea[data-count]').forEach(t => {
    const max = parseInt(t.getAttribute('maxlength'), 10) || 300;
    const out = t.parentElement.querySelector('.char-count');
    t.addEventListener('input', () => { if (out) out.textContent = `${max - t.value.length} characters remaining`; });
  });
})();

// Booking dropdown on service cards (same behaviour as the original site)
function toggleBookingForm(buttonElement, serviceName) {
  const card = buttonElement.closest('.card');
  const existing = card.querySelector('.booking-dropdown');
  if (existing) {
    existing.classList.toggle('active');
    return;
  }
  document.querySelectorAll('.card .booking-dropdown').forEach(el => el.classList.remove('active'));
  const template = document.getElementById('bookingDropdownTemplate');
  const newForm = template.cloneNode(true);
  newForm.removeAttribute('id');
  newForm.querySelector('.service-title-display').textContent = serviceName;
  newForm.querySelector('.selected-service-input').value = serviceName;
  card.appendChild(newForm);
  newForm.classList.add('active');
  const first = newForm.querySelector('input[name=name]');
  if (first) first.focus({ preventScroll: true });
}
