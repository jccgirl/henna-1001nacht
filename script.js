// ------------------------------
// 1001 Nacht Henna Einladung JS
// ------------------------------

// ------------------------------------
// SETTINGS
// ------------------------------------
const scriptURL =
  "https://script.google.com/macros/s/AKfycbwvp4LDIchAM4yTr-bnh8kjeUmwop9aEZnsL39XBu7i9LMwmxT41ghTlF_wIBW1mNmZ/exec"; // <-- HIER DEINE URL

// Fixed Event Date: 30.04.2026, 17:00 Uhr
const eventDate = new Date(2026, 3, 30, 17, 0, 0).getTime(); // Monate: Januar=0

// ------------------------------------
// Guest Name from URL (?to=Name)
// ------------------------------------
const params = new URLSearchParams(window.location.search);
const guestName = params.get("to");

const nameInputEl = document.getElementById("name");
const guestWelcomeEl = document.getElementById("guestWelcome");
const rsvpHeadlineEl = document.getElementById("rsvpHeadline");

if (guestName) {
  if (guestWelcomeEl)
    guestWelcomeEl.innerText =
      "Hallo " + guestName + " ✨\nDu bist herzlich eingeladen!";
  if (nameInputEl) nameInputEl.value = guestName;
  if (rsvpHeadlineEl) rsvpHeadlineEl.innerText = "💌 RSVP für " + guestName;
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

  bgMusic
    .play()
    .then(() => {
      musicPlaying = true;
      if (musicBtn) musicBtn.innerText = "🔊";
    })
    .catch(() => {
      musicPlaying = false;
      if (musicBtn) musicBtn.innerText = "🔇";
    });
}

if (openBtn) {
  openBtn.addEventListener("click", () => {
    if (opening) opening.style.display = "none";
    if (mainContent) mainContent.classList.remove("hidden");
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
// COUNTDOWN
// ------------------------------------
function updateCountdown() {
  const now = new Date().getTime();
  const distance = eventDate - now;

  if (distance <= 0) {
    ["days", "hours", "minutes", "seconds"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.innerText = 0;
    });
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  if (document.getElementById("days"))
    document.getElementById("days").innerText = days;
  if (document.getElementById("hours"))
    document.getElementById("hours").innerText = hours;
  if (document.getElementById("minutes"))
    document.getElementById("minutes").innerText = minutes;
  if (document.getElementById("seconds"))
    document.getElementById("seconds").innerText = seconds;
}

setInterval(updateCountdown, 1000);
updateCountdown();

// ------------------------------------
// HELPER: SEND TO GOOGLE SCRIPT (NO CORS ERROR)
// ------------------------------------
async function sendToSheet(payload) {
  const formData = new FormData();
  formData.append("data", JSON.stringify(payload));

  const response = await fetch(scriptURL, {
    method: "POST",
    body: formData
  });

  return response.json();
}

// ------------------------------------
// RSVP FORM SUBMIT
// ------------------------------------
const rsvpForm = document.getElementById("rsvpForm");
const successMessage = document.getElementById("successMessage");

if (rsvpForm) {
  rsvpForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const payload = {
      type: "rsvp",
      name: nameInputEl ? nameInputEl.value : "Unbekannt",
      kommt: document.getElementById("kommt")?.value || "",
      anzahl: document.getElementById("anzahl")?.value || 1,
      nachricht: document.getElementById("nachricht")?.value || "",
      song: document.getElementById("song")?.value || ""
    };

    try {
      const result = await sendToSheet(payload);
      console.log("RSVP Antwort:", result);

      if (result.status === "success") {
        if (successMessage) successMessage.style.display = "block";

        rsvpForm.reset();

        if (guestName && nameInputEl) {
          nameInputEl.value = guestName;
        }
      } else {
        alert("Fehler beim Speichern 😢");
      }
    } catch (error) {
      alert("Fehler beim Senden 😢 Bitte später nochmal versuchen.");
      console.error("RSVP Fehler:", error);
    }
  });
}

// ------------------------------------
// GIFTS RESERVIEREN
// ------------------------------------
window.reserveGift = async function (btn, giftName) {
  const guest = guestName || (nameInputEl ? nameInputEl.value : "Unbekannt");
  if (!btn) return;

  btn.disabled = true;
  btn.innerText = "Reserviert ✔";

  const span = btn.parentElement.querySelector("span");
  if (span) span.style.textDecoration = "line-through";

  try {
    const result = await sendToSheet({
      type: "gift",
      name: guest,
      gift: giftName
    });

    console.log("Gift Antwort:", result);

    if (result.status !== "success") {
      alert("Geschenk konnte nicht gespeichert werden 😢");
    }
  } catch (error) {
    console.error("Gift Fehler:", error);
  }
};
