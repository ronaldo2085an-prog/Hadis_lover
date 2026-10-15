(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const steps = [...document.querySelectorAll('.step')];
  const noBtn = $('#no'), msg = $('#msg');
  const MESSAGES = [
    'مطمئنی؟ سن یه عدده ها 😉',
    'دکمه نه داره کوچیک می‌شه... فرصتت کم‌کم تموم می‌شه! ⏳',
    'این فرصت آخرته دیگه! همچین پیشنهادی دیگه برات نمیاد 😤☕',
    'آخرین شانسه! دستگاه داره دکمه نه رو جمع می‌کنه... 🙈💔',
    'دکمه نه رفت! 😈 حالا فقط یه گزینه مونده... ❤️'
  ];
  let noCount = 0;

  function show(n) {
    steps.forEach(s => s.classList.toggle('is-active', +s.dataset.step === n));
    if (n === 3) return startFinale();
    const h = $('.step.is-active [tabindex="-1"]');
    if (h) h.focus({ preventScroll: true });
  }

  function startFinale() {
    const step = $('[data-step="3"]');
    step.classList.remove('done');
    $('#finale').hidden = true;
    requestAnimationFrame(() => HeartAnimation.start($('#heartCanvas'), () => {
      step.classList.add('done');
      $('#finale').hidden = false;
      $('#t3').focus({ preventScroll: true });
    }));
  }

  function burst(el) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    for (let i = 0; i < 6; i++) {
      const h = document.createElement('span');
      h.className = 'burst'; h.textContent = '💗'; h.setAttribute('aria-hidden', 'true');
      h.style.left = r.left + r.width / 2 + 'px'; h.style.top = r.top + r.height / 2 + 'px';
      h.style.fontSize = 10 + Math.random() * 10 + 'px';
      h.style.setProperty('--dx', (Math.random() - .5) * 120 + 'px');
      h.style.setProperty('--dy', -30 - Math.random() * 80 + 'px');
      document.body.appendChild(h);
      setTimeout(() => h.remove(), 950);
    }
  }

  noBtn.addEventListener('click', () => {
    noCount++;
    msg.textContent = MESSAGES[noCount - 1];
    burst(noBtn);
    if (noCount >= MESSAGES.length) { // دکمه نه کاملاً حذف می‌شود
      noBtn.classList.add('gone');
      $('#yes').classList.add('big');
      setTimeout(() => { noBtn.hidden = true; }, 500);
      $('#yes').focus({ preventScroll: true });
      return;
    }
    noBtn.style.setProperty('--k', (1 - noCount * 0.2).toFixed(2));
    noBtn.classList.remove('shake'); void noBtn.offsetWidth; noBtn.classList.add('shake');
  });

  $('#restart').addEventListener('click', () => {
    HeartAnimation.stop();
    noCount = 0; noBtn.style.setProperty('--k', 1); msg.textContent = '';
    noBtn.hidden = false; noBtn.classList.remove('gone', 'shake'); $('#yes').classList.remove('big');
    $('#finale').hidden = true; $('[data-step="3"]').classList.remove('done');
    show(0);
  });

  document.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => show(+b.dataset.go)));
  $('#yes').addEventListener('click', () => show(3));

  const bg = $('#bgHearts');
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    for (let i = 0; i < 12; i++) {
      const s = document.createElement('span');
      s.textContent = '♥';
      s.style.left = Math.random() * 100 + '%';
      s.style.fontSize = 10 + Math.random() * 18 + 'px';
      s.style.animationDuration = 9 + Math.random() * 9 + 's';
      s.style.animationDelay = -Math.random() * 12 + 's';
      bg.appendChild(s);
    }
  }
})();
