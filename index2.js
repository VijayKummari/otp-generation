// Configuration constants
const MAX_ATTEMPTS = 5;
const COOLDOWN_SECONDS = 30; // 30-second cooldown between requests

let count = 0;
let countdownTimer = null;

// 1. Function to generate a random 6-digit OTP
function generateotp() {
  const otp = Math.floor(100000 + Math.random() * 900000);
  console.log(`Generated OTP: ${otp}`);
  return otp;
}

// 2. Function to update DOM elements (if running in browser)
function renderOtpInUI(otp) {
  if (typeof document === 'undefined') return;

  const digits = String(otp).split('');
  const slots = document.querySelectorAll('.digit-slot');
  slots.forEach((slot, index) => {
    slot.textContent = digits[index] || '-';
    slot.classList.add('active');
  });

  // Update Attempt Badge
  const attemptBadge = document.getElementById('attemptBadge');
  if (attemptBadge) {
    attemptBadge.textContent = `Attempts: ${count} / ${MAX_ATTEMPTS}`;
    if (count === MAX_ATTEMPTS) {
      attemptBadge.classList.add('limit');
    }
  }

  // Add to History
  const historySection = document.getElementById('historySection');
  const historyList = document.getElementById('historyList');
  if (historySection && historyList) {
    historySection.style.display = 'block';
    const li = document.createElement('li');
    li.className = 'history-item';
    const now = new Date().toLocaleTimeString();
    li.innerHTML = `<span>Attempt #${count} (${now})</span> <span class="history-otp">${otp}</span>`;
    historyList.prepend(li);
  }
}

// 3. Main OTP Handler triggered on Button Click
function otpHandling() {
  const btn = typeof document !== 'undefined' ? document.getElementById('otpBtn') : null;
  const statusMsg = typeof document !== 'undefined' ? document.getElementById('statusMessage') : null;

  // Guard: if limit already reached, prevent any further action
  if (count >= MAX_ATTEMPTS) {
    if (btn) {
      btn.disabled = true;
      btn.textContent = "You reached your OTP limit";
      btn.classList.add('limit-reached');
    }
    return;
  }

  // 1. Generate OTP IMMEDIATELY on click
  const currentOtp = generateotp();
  count++;

  // Update UI with the new OTP
  renderOtpInUI(currentOtp);

  // Check if user has now completed all 5 attempts
  if (count >= MAX_ATTEMPTS) {
    if (btn) {
      btn.disabled = true;
      btn.textContent = "You reached your OTP limit";
      btn.classList.add('limit-reached');
    }
    if (statusMsg) {
      statusMsg.textContent = "You have used all 5 attempts. No more OTPs can be generated.";
      statusMsg.style.color = "#f87171";
    }
    console.log("Maximum limit of 5 OTPs reached. Button permanently disabled.");
    return;
  }

  // 2. Disable button and start 30-second cooldown
  let remainingTime = COOLDOWN_SECONDS;

  if (btn) {
    btn.disabled = true;
    btn.textContent = `Resend OTP in ${remainingTime}s`;
  }
  if (statusMsg) {
    statusMsg.textContent = `Please wait ${remainingTime} seconds before requesting another OTP.`;
    statusMsg.style.color = "#94a3b8";
  }

  // Clear any existing timer just in case
  if (countdownTimer) clearInterval(countdownTimer);

  countdownTimer = setInterval(() => {
    remainingTime--;

    if (remainingTime > 0) {
      if (btn) {
        btn.textContent = `Resend OTP in ${remainingTime}s`;
      }
      if (statusMsg) {
        statusMsg.textContent = `Please wait ${remainingTime} seconds before requesting another OTP.`;
      }
    } else {
      // 3. Cooldown complete: re-enable button for the next click
      clearInterval(countdownTimer);
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Resend OTP";
      }
      if (statusMsg) {
        statusMsg.textContent = "You can now generate another OTP.";
        statusMsg.style.color = "#38bdf8";
      }
      console.log("Cooldown finished. Button is re-enabled.");
    }
  }, 1000);
}

// Alias for compatibility
const otpandlig = otpHandling;

// 4. Attach Event Listener when page loads (Browser environment)
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('otpBtn');
    if (btn) {
      btn.addEventListener('click', otpHandling);
    }
  });
} else {
  // If run via Node.js terminal directly
  console.log("Terminal Run (Node.js):");
  generateotp();
  console.log("Tip: Open index2.html in your browser to test the interactive 30s cooldown button and limits!");
}