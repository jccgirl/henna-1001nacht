// ------------------------------
// 1001 Nacht Henna Einladung JS
// ------------------------------

// SETTINGS
const scriptURL = "https://script.google.com/macros/s/AKfycbxCEtCuqQr8zsmdXhnZdrXBzIMlPDoTQsoklP5vWfdxK74zFqE13FgFUwnp_2B-tWco/exec"; // <-- Web-App URL

const eventDate = new Date(2026, 3, 30, 17, 0, 0).getTime(); // 30.04.2026 17:00
let currentPage = 1;
const itemsPerPage = 6;
let giftsCache = null;
let giftsLastFetch = 0;

// Guest Name
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

// OPEN ENVELOPE + MUSIC
const opening = document.getElementById("opening");
const openBtn = document.getElementById("openBtn");
const mainContent = document.getElementById("mainContent");
const bgMusic = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");

let musicPlaying = false;
let wasPlayingBeforeHidden = false;
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

if (openBtn) openBtn.addEventListener("click", () => {
  if (opening) opening.style.display = "none";
  if (mainContent) mainContent.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
  tryPlayMusic();
});

if (musicBtn) musicBtn.addEventListener("click", () => {
  if (!musicPlaying) tryPlayMusic();
  else {
    if (bgMusic) bgMusic.pause();
    musicPlaying = false;
    musicBtn.innerText = "🔇";
  }
});

// Pause music when the page becomes hidden or is unloaded.
document.addEventListener('visibilitychange', () => {
  if (!bgMusic) return;
  if (document.hidden) {
    wasPlayingBeforeHidden = !bgMusic.paused;
    if (!bgMusic.paused) bgMusic.pause();
    musicPlaying = false;
    if (musicBtn) musicBtn.innerText = "🔇";
  } else {
    if (wasPlayingBeforeHidden) {
      // Try to resume when user returns.
      tryPlayMusic();
      wasPlayingBeforeHidden = false;
    }
  }
});

window.addEventListener('pagehide', () => {
  if (bgMusic && !bgMusic.paused) bgMusic.pause();
  musicPlaying = false;
  if (musicBtn) musicBtn.innerText = "🔇";
});

window.addEventListener('beforeunload', () => {
  if (bgMusic && !bgMusic.paused) bgMusic.pause();
});

// COUNTDOWN
function updateCountdown() {
  const now = new Date().getTime();
  const distance = eventDate - now;
  const ids = ["days", "hours", "minutes", "seconds"];
  if (distance <= 0) {
    ids.forEach(id => {
      const el = document.getElementById(id);
      if(el) el.innerText = 0;
    });
    return;
  }

  const days = Math.floor(distance / (1000*60*60*24));
  const hours = Math.floor((distance % (1000*60*60*24)) / (1000*60*60));
  const minutes = Math.floor((distance % (1000*60*60)) / (1000*60));
  const seconds = Math.floor((distance % (1000*60)) / 1000);

  if(document.getElementById("days")) document.getElementById("days").innerText = days;
  if(document.getElementById("hours")) document.getElementById("hours").innerText = hours;
  if(document.getElementById("minutes")) document.getElementById("minutes").innerText = minutes;
  if(document.getElementById("seconds")) document.getElementById("seconds").innerText = seconds;
}
setInterval(updateCountdown, 1000);
updateCountdown();

// ---------------------
// RSVP Formular
// ---------------------
const rsvpForm = document.getElementById("rsvpForm");
const successMessage = document.getElementById("successMessage");

// Prevent double-submits
let rsvpSubmitting = false;

if (rsvpForm) {
  const submitBtn = rsvpForm.querySelector('button[type="submit"]');

  rsvpForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (rsvpSubmitting) return; // already sending
    rsvpSubmitting = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = "Sende...";
    }

    const formData = new FormData();
    formData.append("type", "rsvp");
    formData.append("name", nameInputEl.value);
    formData.append("kommt", document.getElementById("kommt").value);
    //formData.append("anzahl", document.getElementById("anzahl").value);
    formData.append("nachricht", document.getElementById("nachricht").value);
    formData.append("song", document.getElementById("song").value);
    formData.append("kuchen", document.getElementById("kuchen")?.value || "");


    try {
      const response = await fetch(scriptURL, { method: "POST", body: formData });
      const result = await response.json();
      if (result.status === "success") {
        successMessage.style.display = "block";
        rsvpForm.reset();
        if (guestName) nameInputEl.value = guestName;
      }
    } catch (err) {
      console.error("RSVP fehlgeschlagen:", err);
      alert("Fehler beim Senden 😢 Bitte später nochmal versuchen.");
    } finally {
      rsvpSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = "Antwort senden";
      }
    }
  });
}

// ---------------------
// Geschenke reservieren (confirmation flow implemented further below)
// ---------------------


function makeClickableContent(text) {
  // Convert URLs in text into anchor elements. Returns a DocumentFragment.
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const frag = document.createDocumentFragment();

  let lastIndex = 0;
  let match;
  while ((match = urlRegex.exec(text)) !== null) {
    const pre = text.substring(lastIndex, match.index);
    if (pre) frag.appendChild(document.createTextNode(pre));

    const a = document.createElement('a');
    a.href = match[0];
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = match[0];
    frag.appendChild(a);

    lastIndex = match.index + match[0].length;
  }

  const rest = text.substring(lastIndex);
  if (rest) frag.appendChild(document.createTextNode(rest));

  return frag;
}

function renderGifts(gifts) {
  const giftListEl = document.getElementById("giftList");
  const paginationEl = document.getElementById("pagination");

  giftListEl.innerHTML = "";
  paginationEl.innerHTML = "";

  const totalPages = Math.max(1, Math.ceil(gifts.length / itemsPerPage));
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  const paginatedGifts = gifts.slice(start, end);

  paginatedGifts.forEach(gift => {
    const li = document.createElement("li");

    const span = document.createElement("span");
    // If a separate link column exists, wrap the gift name in an anchor
    if (gift.link) {
      const a = document.createElement('a');
      a.href = gift.link;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = gift.gift || gift.link;
      span.appendChild(a);
    } else {
      // Allow plain-text URLs inside the gift text
      const content = makeClickableContent(gift.gift || "");
      span.appendChild(content);
    }
    li.appendChild(span);

    const btn = document.createElement("button");
    btn.innerText = gift.status === "reserviert" ? "Reserviert ✔" : "Reservieren";
    btn.disabled = gift.status === "reserviert";
    btn.addEventListener("click", () => reserveGift(btn, gift.gift));

    li.appendChild(btn);
    giftListEl.appendChild(li);
  });

  // Seitenzahlen generieren
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.innerText = i;
    if (i === currentPage) pageBtn.classList.add("active");

    pageBtn.addEventListener("click", () => {
      currentPage = i;
      // Render from cache immediately (no network)
      if (giftsCache) renderGifts(giftsCache);
      else loadGifts();
    });

    paginationEl.appendChild(pageBtn);
  }
}

async function loadGifts(forceReload = false) {
  try {
    // Use cached data when available to avoid refetching on every page click
    const cacheTTL = 1000 * 60 * 5; // 5 minutes
    const now = Date.now();
    if (giftsCache && !forceReload && (now - giftsLastFetch) < cacheTTL) {
      renderGifts(giftsCache);
      return;
    }

    const response = await fetch(`${scriptURL}?type=gifts`);
    const data = await response.json();
    if (data.status !== "success") return;

    giftsCache = data.gifts || [];
    giftsLastFetch = Date.now();

    renderGifts(giftsCache);
  } catch (err) {
    console.error("Fehler beim Laden:", err);
  }
}
// Lade Geschenke direkt beim Start
loadGifts();

let pendingReservation = null;

window.reserveGift = async function(btn, giftName) {
  if (!btn) return;

  const guest = nameInputEl.value || "Unbekannt";

  // -----------------------------
  // 1️⃣ Erste Bestätigung
  // -----------------------------
  if (pendingReservation !== giftName) {

    // Falls ein anderer Button aktiv war → neu rendern
    if (pendingReservation) {
      if (giftsCache) renderGifts(giftsCache);
      else loadGifts();
    }

    pendingReservation = giftName;

    btn.innerText = "Wirklich reservieren?";
    btn.classList.add("confirming");

    // Nach 5 Sekunden zurücksetzen
    setTimeout(() => {
      if (pendingReservation === giftName) {
        pendingReservation = null;
        if (giftsCache) renderGifts(giftsCache);
        else loadGifts();
      }
    }, 5000);

    return;
  }

  // -----------------------------
  // 2️⃣ Zweiter Klick = Reservieren
  // -----------------------------
  pendingReservation = null;

  btn.disabled = true;
  btn.innerText = "Reserviert";
  btn.classList.remove("confirming");

  const formData = new FormData();
  formData.append("type", "gift");
  formData.append("name", guest);
  formData.append("gift", giftName);

  try {
    const response = await fetch(scriptURL, {
      method: "POST",
      body: formData
    });

    const result = await response.json();

    if (result.status !== "success") {
      alert("Fehler beim Reservieren 😢");
      loadGifts();
      return;
    }

    // -----------------------------
    // ✨ Animation starten
    // -----------------------------
    btn.classList.add("reserved");

    const span = btn.parentElement.querySelector("span");
    if (span) {
      span.classList.add("gift-reserved");
    }

    // Update cache and re-render (small delay for animation)
    if (giftsCache) {
      const item = giftsCache.find(g => g.gift === giftName);
      if (item) item.status = 'reserviert';
      setTimeout(() => renderGifts(giftsCache), 600);
    } else {
      setTimeout(() => loadGifts(), 600);
    }

  } catch (err) {
    console.error(err);
    alert("Fehler beim Reservieren 😢");
    loadGifts();
  }
};

