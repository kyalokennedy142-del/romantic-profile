/* ========================================
   SCRIPT.JS — All interactions & magic
   ======================================== */
// ========== YOUTUBE PLAYER API ==========
// Loads YouTube iframe API so we can unmute after user interaction

// 1. Inject the YouTube API script dynamically
const ytScript = document.createElement("script");
ytScript.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(ytScript);

// 2. This function is called automatically when API is ready
let ytPlayer;

function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player("yt-player", {
    videoId: "59Vf7oQV9pg",
    playerVars: {
      autoplay: 1,
      mute: 1,           // starts muted (browser requirement)
      loop: 1,
      playlist: "59Vf7oQV9pg",
      controls: 0,
      showinfo: 0,
      rel: 0,
      modestbranding: 1,
      playsinline: 1,
    },
    events: {
      onReady: function (event) {
        event.target.playVideo();
      },
    },
  });
}

// 3. After first user interaction — unmute the video smoothly
let videoUnmuted = false;

document.addEventListener("click", function unmuteVideo() {
  if (!videoUnmuted && ytPlayer && typeof ytPlayer.unMute === "function") {
    ytPlayer.unMute();
    ytPlayer.setVolume(60); // 0–100, keep it atmospheric
    videoUnmuted = true;
  }
}, { once: false }); // keep listening in case player loads slowly

// ========== 1. TYPING ANIMATION ==========
// Types out a message letter by letter in the hero tagline

const phrases = [
  "Developer in progress...",
  "Arsenal till I die ⚽",
  "Music is my therapy 🎵",
  "Building something real 💻",
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typingEl = document.getElementById("typing-text");

function typeLoop() {
  const current = phrases[phraseIndex];

  if (isDeleting) {
    // Remove one character
    typingEl.textContent = current.substring(0, charIndex - 1);
    charIndex--;
  } else {
    // Add one character
    typingEl.textContent = current.substring(0, charIndex + 1);
    charIndex++;
  }

  // Finished typing the full phrase
  if (!isDeleting && charIndex === current.length) {
    setTimeout(() => { isDeleting = true; }, 1800); // pause before deleting
  }

  // Finished deleting
  if (isDeleting && charIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length; // move to next phrase
  }

  // Speed: faster when deleting, slower when typing
  const speed = isDeleting ? 45 : 90;
  setTimeout(typeLoop, speed);
}

// Start typing after a short delay
setTimeout(typeLoop, 800);


// ========== 2. SCROLL REVEAL ANIMATION ==========
// Watches sections and fades them in when they enter the screen

const revealEls = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        // Stop watching once revealed (no need to repeat)
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15, // trigger when 15% of section is visible
  }
);

revealEls.forEach((el) => observer.observe(el));


// ========== 3. MUSIC PLAYER ==========
// Toggle background music on/off with the floating button

const audio = document.getElementById("bg-music");
const toggleBtn = document.getElementById("music-toggle");
const musicLabel = document.getElementById("music-label");

let musicPlaying = false;

// Try autoplay on first user interaction anywhere on the page
document.addEventListener("click", function startMusic() {
  if (!musicPlaying) {
    audio.volume = 0.35; // soft volume
    audio.play().then(() => {
      musicPlaying = true;
      toggleBtn.textContent = "🎵";
      musicLabel.textContent = "Now Playing";
      // Fade in smoothly
      fadeIn(audio);
    }).catch(() => {
      // Autoplay blocked — user must click the button manually
      musicLabel.textContent = "Tap to Play";
    });
  }
}, { once: true }); // only fires once

// Toggle button click
toggleBtn.addEventListener("click", (e) => {
  e.stopPropagation(); // don't trigger the document click above

  if (musicPlaying) {
    fadeOut(audio);
    musicPlaying = false;
    toggleBtn.textContent = "🔇";
    musicLabel.textContent = "Paused";
  } else {
    audio.play();
    fadeIn(audio);
    musicPlaying = true;
    toggleBtn.textContent = "🎵";
    musicLabel.textContent = "Now Playing";
  }
});

// Smooth fade in
function fadeIn(audioEl) {
  audioEl.volume = 0;
  const fade = setInterval(() => {
    if (audioEl.volume < 0.33) {
      audioEl.volume = Math.min(audioEl.volume + 0.03, 0.35);
    } else {
      clearInterval(fade);
    }
  }, 80);
}

// Smooth fade out
function fadeOut(audioEl) {
  const fade = setInterval(() => {
    if (audioEl.volume > 0.03) {
      audioEl.volume = Math.max(audioEl.volume - 0.03, 0);
    } else {
      audioEl.pause();
      audioEl.volume = 0;
      clearInterval(fade);
    }
  }, 80);
}


// ========== 4. HERO PARALLAX ==========
// Subtle depth effect — content moves slightly as you scroll

window.addEventListener("scroll", () => {
  const heroContent = document.querySelector(".hero-content");
  const scrollY = window.scrollY;

  if (heroContent && scrollY < window.innerHeight) {
    // Moves up slowly as you scroll down = depth feel
    heroContent.style.transform = `translateY(${scrollY * 0.25}px)`;
    heroContent.style.opacity = 1 - scrollY / 500;
  }
});


// ========== 5. ACTIVE NAV GLOW (subtle badge highlight) ==========
// Highlights badges based on which section is in view

const sections = document.querySelectorAll("section");

window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 200;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute("id");
    }
  });
});
// ========== VP PHOTO STRIP — DRAG TO SCROLL ==========
// Lets desktop users click & drag the photo strip left/right

const strip = document.querySelector(".vp-scroll-strip");

if (strip) {
  let isDown = false;
  let startX;
  let scrollLeft;

  strip.addEventListener("mousedown", (e) => {
    isDown = true;
    strip.style.cursor = "grabbing";
    startX = e.pageX - strip.offsetLeft;
    scrollLeft = strip.scrollLeft;
  });

  strip.addEventListener("mouseleave", () => {
    isDown = false;
    strip.style.cursor = "grab";
  });

  strip.addEventListener("mouseup", () => {
    isDown = false;
    strip.style.cursor = "grab";
  });

  strip.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - strip.offsetLeft;
    const walk = (x - startX) * 1.5; // scroll speed
    strip.scrollLeft = scrollLeft - walk;
  });
}

