// ------------------------------------
// SETTINGS
// ------------------------------------
const scriptURL = "https://script.google.com/macros/s/AKfycbwayfh4qjReq72sjps9Zki-SUuwLujV5gyF_1mNuwK-PqEmButrg0Ki6iA7pZPRjixS/exec";

// FIXED COUNTDOWN DATE (30.04.2026 17:00)
const eventDate = new Date(2026, 3, 30, 17, 0, 0).getTime(); // April = 3 (Januar = 0)

// ------------------------------------
// Guest Name from URL (?to=Name)
// ------------------------------------
const params = new URLSearchParams(window.location.search);
const guestName = params.get("to");

const guestWelcomeEl = document.getElementById("guestWelcome");
const nameInputEl = document.getElementById("name");
const rsvpHeadlineEl = document.getElementById("rsvpHeadline");

if (guestName && guestWelcomeEl && nameInputEl && rsvpHeadlineEl) {
  guestWelcomeEl.innerText = `Hallo ${guestName} ✨\nDu bist herzlich eingeladen!`;
  nameInputEl.value = guestName;
  rsvpHeadlineEl.innerText = `💌 RSVP für ${guestName}`;
}

// ------------------------------------
// OPEN ENVELOPE + MUSIC
// ------------------------------------
const opening = document.getElementById("opening");
const openBtn = document.getElementById("openBtn");
const mainContent = document.getElementById("mainContent");

const bgMusic = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");

let musicPlaying = false;

function tryPlayMusic() {
  if (!bgMusic) return;
  bgMusic.play().then(() => {
    musicPlaying = true;
    if (musicBtn) musicBtn.innerText = "🔊";
  }).catch(() => {
    musicPlaying = false;
    if (musicBtn) musicBtn.innerText = "🔇";
  });
}

if (openBtn && opening && mainContent) {
  openBtn.addEventListener("click", () => {
    opening.style.display = "none";
    mainContent.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
    tryPlayMusic();
  });
}

if (musicBtn) {
  musicBtn.addEventListener("click", () => {
    if (!musicPlaying) {
      tryPlayMusic();
    } else {
      if (bgMusic) bgMusic.pause();
      musicPlaying = false;
      musicBtn.innerText = "🔇";
    }
  });
}

// ------------------------------------
// COUNTDOWN (fixed)
// ------------------------------------
function updateCountdown() {
  const now = new Date().getTime();
  const distance = eventDate - now;

  const ids = ["days", "hours", "minutes", "seconds"];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerText = "0";
  });

  if (distance <= 0) return;

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  if (document.getElementById("days")) document.getElementById("days").innerText = days;
  if (document.getElementById("hours")) document.getElementById("hours").innerText = hours;
  if (document.getElementById("minutes")) document.getElementById("minutes").innerText = minutes;
  if (document.getElementById("seconds")) document.getElementById("seconds").innerText = seconds;
}

setInterval(updateCountdown, 1000);
updateCountdown();

// ------------------------------------
// RSVP SUBMIT (Google Sheet)
// ------------------------------------
const rsvpForm = document.getElementById("rsvpForm");
const successMessage = document.getElementById("successMessage");

if (rsvpForm) {
  rsvpForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
      type: "rsvp",
      name: nameInputEl ? nameInputEl.value : "Unbekannt",
      kommt: document.getElementById("kommt")?.value || "",
      anzahl: document.getElementById("anzahl")?.value || 1,
      nachricht: document.getElementById("nachricht")?.value || "",
      song: document.getElementById("song")?.value || ""
    };

    try {
      const response = await fetch(scriptURL, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });

      const result = await response.json();

      if (result.status === "success" && successMessage && rsvpForm) {
        successMessage.style.display = "block";
        rsvpForm.reset();
        if (guestName && nameInputEl) {
          nameInputEl.value = guestName;
        }
      }
    } catch (error) {
      alert("Fehler beim Senden 😢 Bitte später nochmal versuchen.");
      console.error(error);
    }
  });
}

// ------------------------------------
// GIFTS reserve (Google Sheet Tracking)
// ------------------------------------
window.reserveGift = async function (btn, giftName) {
  const guest = guestName || (nameInputEl ? nameInputEl.value : "Unbekannt");

  if (!btn) return;

  btn.disabled = true;
  btn.innerText = "Reserviert ✔";
  const span = btn.parentElement.querySelector("span");
  if (span) span.style.textDecoration = "line-through";

  try {
    await fetch(scriptURL, {
      method: "POST",
      body: JSON.stringify({
        type: "gift",
        name: guest,
        gift: giftName
      }),
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error(error);
  }
};
