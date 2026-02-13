(function () {
  'use strict';

  const REASONS = [
    'Because you make everything feel warmer 💛',
    'Because my best days start with you ✨',
    'Because your smile is my favorite view 😊',
    'Because I choose you—every single time 💍',
    "Because you're my calm and my chaos (in a cute way) 🌷",
    'Because love looks a lot like you ❤️',
  ];
  const FINAL_MESSAGE = "Okayyy, I'll stop teasing 😄 Just know you'll always be my favorite person. 💖";
  const DODGE_RADIUS = 80;
  const YES_SCALE_CAP = 2.2;
  const NO_SCALE_MIN = 0.4;

  let valentineName = '';
  let noCount = 0;
  let noDodges = true; // true = No runs away, false = No stays put
  let lastNoX = 0;
  let lastNoY = 0;
  let noButtonInitialized = false;

  const $ = (id) => document.getElementById(id);
  const screen1 = $('screen1');
  const screen2 = $('screen2');
  const proposalCard = $('proposalCard');
  const formName = $('formName');
  const inputName = $('inputName');
  const screen1Error = $('screen1Error');
  const proposalHeading = $('proposalHeading');
  const valentineNameDisplay = $('valentineNameDisplay');
  const firstNoLead = $('firstNoLead');
  const reasonText = $('reasonText');
  const finalMessage = $('finalMessage');
  const buttonsWrap = $('buttonsWrap');
  const noButtonContainer = $('noButtonContainer');
  const btnYes = $('btnYes');
  const btnNo = $('btnNo');
  const restartWrap = $('restartWrap');
  const btnRestart = $('btnRestart');
  const successOverlay = $('successOverlay');
  const successMessage = $('successMessage');
  const successName = $('successName');
  const btnReplay = $('btnReplay');
  const confettiCanvas = $('confettiCanvas');

  function showScreen(screen) {
    screen1.classList.toggle('screen--active', screen === 1);
    screen2.classList.toggle('screen--active', screen === 2);
    screen1.hidden = screen !== 1;
    screen2.hidden = screen !== 2;
    if (screen === 2) {
      valentineNameDisplay.textContent = valentineName;
      proposalCard.classList.toggle('card--static-no', !noDodges);
      resetProposalState();
      if (noDodges) {
        requestAnimationFrame(() => initNoButtonPosition());
      } else {
        noButtonContainer.style.left = '';
        noButtonContainer.style.top = '';
      }
    }
  }

  function resetProposalState() {
    noCount = 0;
    firstNoLead.hidden = true;
    reasonText.hidden = true;
    finalMessage.hidden = true;
    restartWrap.hidden = true;
    buttonsWrap.hidden = false;
    noButtonContainer.hidden = false;
    btnYes.style.transform = 'scale(1)';
    btnNo.style.transform = 'scale(1)';
    noButtonInitialized = false;
  }

  function getContainerBounds() {
    const rect = buttonsWrap.getBoundingClientRect();
    const noRect = btnNo.getBoundingClientRect();
    const padding = 8;
    return {
      left: padding,
      top: padding,
      right: rect.width - noRect.width - padding,
      bottom: rect.height - noRect.height - padding,
      width: rect.width,
      height: rect.height,
    };
  }

  function randomPositionInBounds(bounds) {
    const x = bounds.left + Math.random() * Math.max(0, bounds.right - bounds.left);
    const y = bounds.top + Math.random() * Math.max(0, bounds.bottom - bounds.top);
    return { x, y };
  }

  function moveNoButton(x, y) {
    noButtonContainer.style.left = x + 'px';
    noButtonContainer.style.top = y + 'px';
    lastNoX = x;
    lastNoY = y;
  }

  function initNoButtonPosition() {
    const bounds = getContainerBounds();
    const { x, y } = randomPositionInBounds(bounds);
    moveNoButton(x, y);
    noButtonInitialized = true;
  }

  function handlePointerNear(clientX, clientY) {
    if (!noDodges || noCount >= 6) return;
    const wrapRect = buttonsWrap.getBoundingClientRect();
    const noRect = noButtonContainer.getBoundingClientRect();
    const noCenterX = noRect.left + noRect.width / 2;
    const noCenterY = noRect.top + noRect.height / 2;
    const dx = clientX - noCenterX;
    const dy = clientY - noCenterY;
    const distance = Math.hypot(dx, dy);
    const radius = Math.max(40, DODGE_RADIUS - noCount * 8);
    if (distance < radius) {
      const bounds = getContainerBounds();
      const { x, y } = randomPositionInBounds(bounds);
      moveNoButton(x, y);
    }
  }

  function setupDodgeListeners() {
    function onMove(e) {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      handlePointerNear(x, y);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length) handlePointerNear(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
  }

  function applyButtonScales() {
    const yesScale = Math.min(YES_SCALE_CAP, 1 + noCount * 0.15);
    const noScale = Math.max(NO_SCALE_MIN, 1 - noCount * 0.1);
    btnYes.style.transform = `scale(${yesScale})`;
    btnNo.style.transform = `scale(${noScale})`;
  }

  function onNoClick() {
    if (noCount >= 6) return;
    noCount += 1;

    if (noCount === 1) {
      firstNoLead.hidden = false;
      firstNoLead.textContent = 'Haww 😭 okay but listen…';
    }
    reasonText.hidden = false;
    const reason = REASONS[noCount - 1];
    reasonText.textContent = `${valentineName}, ${reason.charAt(0).toLowerCase()}${reason.slice(1)}`;

    applyButtonScales();

    if (noCount >= 6) {
      finalMessage.hidden = false;
      noButtonContainer.hidden = true;
      restartWrap.hidden = false;
    }
  }

  function runConfetti() {
    const ctx = confettiCanvas.getContext('2d');
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    const colors = ['#e91e63', '#ff80ab', '#ffd6e8', '#e8d6ff', '#ce93d8'];
    const pieces = [];
    const count = 80;
    for (let i = 0; i < count; i++) {
      pieces.push({
        x: Math.random() * confettiCanvas.width,
        y: confettiCanvas.height,
        vx: (Math.random() - 0.5) * 6,
        vy: -Math.random() * 12 - 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        spin: (Math.random() - 0.5) * 20,
      });
    }
    let raf;
    function draw() {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      let anyAlive = false;
      pieces.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3;
        p.rotation += p.spin;
        if (p.y < confettiCanvas.height + 20) anyAlive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });
      if (anyAlive) raf = requestAnimationFrame(draw);
    }
    draw();
  }

  function showSuccess() {
    successName.textContent = valentineName;
    successOverlay.hidden = false;
    runConfetti();
  }

  function hideSuccess() {
    successOverlay.hidden = true;
  }

  formName.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = inputName.value.trim();
    screen1Error.hidden = true;
    if (!name) {
      screen1Error.textContent = 'Please enter a name.';
      screen1Error.hidden = false;
      return;
    }
    valentineName = name;
    const flowInput = formName.querySelector('input[name="flow"]:checked');
    noDodges = flowInput ? flowInput.value === 'dodge' : true;
    try {
      localStorage.setItem('valentineName', valentineName);
    } catch (_) {}
    showScreen(2);
  });

  btnYes.addEventListener('click', () => {
    showSuccess();
  });

  btnNo.addEventListener('click', () => {
    onNoClick();
  });

  btnRestart.addEventListener('click', () => {
    showScreen(1);
    inputName.value = '';
    inputName.focus();
  });

  btnReplay.addEventListener('click', () => {
    hideSuccess();
    showScreen(1);
    inputName.value = '';
    inputName.focus();
  });

  // Load name from localStorage for convenience
  try {
    const saved = localStorage.getItem('valentineName');
    if (saved) inputName.value = saved;
  } catch (_) {}

  // Floating heart particles in background
  const heartsContainer = document.querySelector('.hearts-bg');
  if (heartsContainer) {
    for (let i = 0; i < 5; i++) {
      const el = document.createElement('span');
      el.className = 'heart-particle';
      el.textContent = '♥';
      el.setAttribute('aria-hidden', 'true');
      heartsContainer.appendChild(el);
    }
  }

  setupDodgeListeners();
  showScreen(1);
})();
