
// ------------------------------------
// SETTINGS
// ------------------------------------
const scriptURL = "https://script.google.com/macros/s/AKfycbwayfh4qjReq72sjps9Zki-SUuwLujV5gyF_1mNuwK-PqEmButrg0Ki6iA7pZPRjixS/exec";

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
  if (guestWelcomeEl) guestWelcomeEl.innerText = "Hallo " + guestName + " ✨\nDu bist herzlich eingeladen!";
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

function tryPlayMusic(){
  if(!bgMusic) return;
  bgMusic.play().then(() => {
    musicPlaying = true;
    if (musicBtn) musicBtn.innerText = "🔊";
  }).catch(() => {
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
    ["days","hours","minutes","seconds"].forEach(id => {
      const el = document.getElementById(id);
      if(el) el.innerText = 0;
    });
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  if(document.getElementById("days")) document.getElementById("days").innerText = days;
  if(document.getElementById("hours")) document.getElementById("hours").innerText = hours;
  if(document.getElementById("minutes")) document.getElementById("minutes").innerText = minutes;
  if(document.getElementById("seconds")) document.getElementById("seconds").innerText = seconds;
}

setInterval(updateCountdown, 1000);
updateCountdown();

// ------------------------------------
// RSVP FORM
// ------------------------------------
const rsvpForm = document.getElementById("rsvpForm");
const successMessage = document.getElementById("successMessage");

if (rsvpForm) {
  rsvpForm.addEventListener("submit", async function(e){
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
        mode: "cors",           // wichtig für GitHub Pages
        cache: "no-cache",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(data)
      });

      if(!response.ok) throw new Error("HTTP-Fehler: " + response.status);

      const result = await response.json();
      console.log("RSVP Antwort:", result);

      if(result.status === "success" && successMessage){
        successMessage.style.display = "block";
        rsvpForm.reset();
        if(guestName && nameInputEl) nameInputEl.value = guestName;
      }

    } catch(err) {
      console.error("RSVP fehlgeschlagen:", err);
      alert("Fehler beim Senden 😢 Bitte später nochmal versuchen.");
    }
  });
}

// ------------------------------------
// GIFTS RESERVIEREN
// ------------------------------------
window.reserveGift = async function(btn, giftName){
  const guest = guestName || (nameInputEl ? nameInputEl.value : "Unbekannt");
  if(!btn) return;

  btn.disabled = true;
  btn.innerText = "Reserviert ✔";

  const span = btn.parentElement.querySelector("span");
  if(span) span.style.textDecoration = "line-through";

  try {
    const response = await fetch(scriptURL, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({type:"gift", name:guest, gift:giftName})
    });

    if(!response.ok) throw new Error("HTTP-Fehler: "+response.status);

    const result = await response.json();
    console.log("Gift Antwort:", result);

  } catch(err){
    console.error("Gift Reservierung fehlgeschlagen:", err);
  }
};
