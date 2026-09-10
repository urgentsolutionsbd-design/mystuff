const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach((el) => observer.observe(el));

const cinematic = document.querySelector('.cinematic-photo');
if (cinematic) new IntersectionObserver(([e]) => cinematic.classList.toggle('inview', e.isIntersecting), {threshold:.15}).observe(cinematic);

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const parallaxEls = [...document.querySelectorAll('[data-parallax]')];
let ticking = false;
function updateParallax(){
  const mobile = innerWidth < 800;
  parallaxEls.forEach(el => {
    if (reduceMotion || mobile) { el.style.transform=''; return; }
    const r=el.getBoundingClientRect();
    if(r.bottom<0 || r.top>innerHeight) return;
    const speed=parseFloat(el.dataset.parallax||0);
    const offset=(r.top + r.height/2 - innerHeight/2)*speed;
    el.style.transform=`translate3d(0, ${offset.toFixed(1)}px, 0)`;
  });
  ticking=false;
}
addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(updateParallax);ticking=true;}},{passive:true});
addEventListener('resize',updateParallax); updateParallax();

const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
toggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.textContent = open ? 'Close' : 'Menu';
});
nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  toggle?.setAttribute('aria-expanded', 'false');
  if (toggle) toggle.textContent = 'Menu';
}));


// Submit the inquiry without leaving the page, then show a branded thank-you modal.
const inquiryForm = document.querySelector('#inquiry-form');
const thankYouModal = document.querySelector('#thank-you-modal');
const formStatus = document.querySelector('#form-status');
const submitButton = inquiryForm?.querySelector('button[type="submit"]');

function openThankYouModal() {
  if (!thankYouModal) return;
  thankYouModal.classList.add('is-open');
  thankYouModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  thankYouModal.querySelector('.thank-you-close')?.focus();
}
function closeThankYouModal() {
  if (!thankYouModal) return;
  thankYouModal.classList.remove('is-open');
  thankYouModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}
thankYouModal?.querySelectorAll('[data-close-modal]').forEach(el => el.addEventListener('click', closeThankYouModal));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeThankYouModal(); });

inquiryForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (formStatus) formStatus.textContent = '';
  if (submitButton) { submitButton.disabled = true; submitButton.innerHTML = 'Sending…'; }
  try {
    const response = await fetch(inquiryForm.action, {
      method: 'POST',
      body: new FormData(inquiryForm),
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) throw new Error('Submission failed');
    inquiryForm.reset();
    openThankYouModal();
  } catch (error) {
    if (formStatus) formStatus.textContent = 'Something went wrong. Please try again in a moment.';
  } finally {
    if (submitButton) { submitButton.disabled = false; submitButton.innerHTML = 'Send inquiry <span>↗</span>'; }
  }
});
