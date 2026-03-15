// ===== Scroll progress =====
const prog = document.getElementById("scrollProgress");
function setProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const val = max > 0 ? (window.scrollY / max) * 100 : 0;
  prog.style.width = val + "%";
}
window.addEventListener("scroll", setProgress, { passive: true });
setProgress();

// ===== Navbar morph + active link highlight =====
const nav = document.getElementById("mainNav");
const links = [...document.querySelectorAll(".nav-link.creative")];
const sections = [...document.querySelectorAll("header[id], section[id]")];

function onScroll() {
  if (window.scrollY > 10) nav.classList.add("is-scrolled");
  else nav.classList.remove("is-scrolled");

  const pos = window.scrollY + 120;
  sections.forEach((sec) => {
    if (pos >= sec.offsetTop && pos < sec.offsetTop + sec.offsetHeight) {
      links.forEach((a) => a.classList.remove("active"));
      const a = document.querySelector('.nav-link[href="#' + sec.id + '"]');
      if (a) a.classList.add("active");
    }
  });
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// ===== Logo reveal glow after draw+fill =====
window.addEventListener("load", () => {
  const svg = document.querySelector(".logo-svg");
  if (!svg) return;
  setTimeout(() => svg.classList.add("revealed"), 1400);
});

// ===== Card carousel: click to activate =====
const optionCards = document.querySelectorAll(".option");
optionCards.forEach((card) => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".option").forEach((c) => c.classList.remove("active"));
    card.classList.add("active");
  });
});

// ===== Reveal on Scroll =====
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("revealed");
    });
  },
  { threshold: 0.15 },
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// ===== Hero background subtle parallax =====
window.addEventListener(
  "scroll",
  () => {
    const offset = window.pageYOffset;
    const home = document.querySelector("#home");
    if (home) home.style.backgroundPositionY = offset * 0.35 + "px";
  },
  { passive: true },
);

// ===== 3D Scroll Parallax layers =====
(() => {
  const layers = [...document.querySelectorAll("#home .parallax .layer")];
  if (!layers.length) return;

  let sx = 0,
    sy = 0,
    scrollY = 0,
    ticking = false;
  function apply() {
    layers.forEach((el) => {
      const speed = parseFloat(el.dataset.speed || "0.1");
      const tx = (sx - 0.5) * 40 * speed; // mouse tilt
      const ty = (sy - 0.5) * 30 * speed + scrollY * speed * 0.2; // scroll drift
      el.style.transform = `translate(${tx}px, ${ty}px)`;
    });
    ticking = false;
  }
  function request() {
    if (!ticking) {
      requestAnimationFrame(apply);
      ticking = true;
    }
  }
  window.addEventListener(
    "mousemove",
    (e) => {
      const w = window.innerWidth,
        h = window.innerHeight;
      sx = e.clientX / w;
      sy = e.clientY / h;
      request();
    },
    { passive: true },
  );
  window.addEventListener(
    "scroll",
    () => {
      scrollY = window.scrollY;
      request();
    },
    { passive: true },
  );
})();

// ===== Soft Page Transition =====
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("page-fade-in");
});

// ===== Magnetic Cursor + magnetized hover =====
// (() => {
//   const cursor = document.createElement("div");
//   cursor.id = "cursor";
//   document.body.appendChild(cursor);

//   let x = 0,
//     y = 0,
//     tx = 0,
//     ty = 0;
//   function loop() {
//     tx += (x - tx) * 0.2;
//     ty += (y - ty) * 0.2;
//     cursor.style.transform = `translate(${tx}px, ${ty}px)`;
//     requestAnimationFrame(loop);
//   }
//   loop();

//   window.addEventListener(
//     "mousemove",
//     (e) => {
//       x = e.clientX;
//       y = e.clientY;
//     },
//     { passive: true },
//   );

//   // Enlarge over interactive elements
//   const hoverables = "a, button, .btn, .option, .magnet, .nav-link";
//   document.addEventListener("mouseover", (e) => {
//     if (e.target.closest(hoverables)) {
//       cursor.style.width = "28px";
//       cursor.style.height = "28px";
//       cursor.style.borderColor = "#ffdca0";
//     }
//   });
//   document.addEventListener("mouseout", (e) => {
//     if (e.target.closest(hoverables)) {
//       cursor.style.width = "18px";
//       cursor.style.height = "18px";
//       cursor.style.borderColor = "var(--gold)";
//     }
//   });

//   // Light attraction for elements with .magnet
//   const strength = 10;
//   document.querySelectorAll(".magnet").forEach((el) => {
//     el.addEventListener("mousemove", (e) => {
//       const r = el.getBoundingClientRect();
//       const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
//       const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
//       el.style.transform = `translate(${(dx * strength).toFixed(1)}px, ${(dy * strength * 0.6).toFixed(1)}px)`;
//     });
//     el.addEventListener("mouseleave", () => (el.style.transform = "translate(0,0)"));
//   });
// })();

// === Magnetic Cursor: Dot + Ring Combo ===
(() => {
  // Build DOM
  const cursor = document.createElement("div");
  cursor.id = "cursor";
  cursor.innerHTML = `<span class="ring"></span><span class="dot"></span>`;
  document.body.appendChild(cursor);

  const ring = cursor.querySelector(".ring");
  const dot = cursor.querySelector(".dot");

  // Track positions (ring lags slightly, dot follows tighter)
  let x = 0,
    y = 0; // mouse
  let rx = 0,
    ry = 0; // ring position
  let dx = 0,
    dy = 0; // dot position

  const ringEase = 0.18; // larger lag
  const dotEase = 0.35; // tighter follow

  // Hover detection over interactive targets
  const hoverables = "a, button, .btn, .option, .magnet, .nav-link, input, textarea, [role='button']";

  // Render loop
  function loop() {
    rx += (x - rx) * ringEase;
    ry += (y - ry) * ringEase;
    dx += (x - dx) * dotEase;
    dy += (y - dy) * dotEase;

    // Move the whole container to ring position (centered via translate -50%/-50% in CSS)
    cursor.style.transform = `translate(${rx}px, ${ry}px)`;

    // Dot is positioned inside the container; since container is centered, keep dot centered via CSS
    // (No extra transform here other than scale which we toggle via classes.)

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // Mouse move
  window.addEventListener(
    "mousemove",
    (e) => {
      x = e.clientX;
      y = e.clientY;

      // Toggle hover state (grow ring + dot)
      const isHover = !!e.target.closest(hoverables);
      cursor.classList.toggle("cursor-hover", isHover);
    },
    { passive: true },
  );

  // Click pulse
  window.addEventListener(
    "mousedown",
    () => {
      cursor.classList.add("cursor-click");
    },
    { passive: true },
  );
  window.addEventListener(
    "mouseup",
    () => {
      // let the animation play; remove after a tick
      setTimeout(() => cursor.classList.remove("cursor-click"), 120);
    },
    { passive: true },
  );

  // Existing "magnet" light attraction you already use in nav
  const strength = 10;
  document.querySelectorAll(".magnet").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      el.style.transform = `translate(${(dx * strength).toFixed(1)}px, ${(dy * strength * 0.6).toFixed(1)}px)`;
    });
    el.addEventListener("mouseleave", () => (el.style.transform = "translate(0,0)"));
  });
})();

// ===== Responsive Carousel Enhancements (drag, snap, keys) =====
() => {
  const optionsContainer = document.querySelector(".options");
  const cards = [...document.querySelectorAll(".option")];
  if (!optionsContainer || !cards.length) return;

  // Activate & center
  function activateCard(el) {
    cards.forEach((c) => c.classList.remove("active"));
    el.classList.add("active");
    el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }
  cards.forEach((card) => {
    card.setAttribute("tabindex", "0");
    card.addEventListener("click", () => activateCard(card));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activateCard(card);
      }
    });
  });

  // Drag to scroll (pointer events)
  let isDown = false,
    startX = 0,
    scrollLeft = 0,
    moved = false,
    pid = null;
  optionsContainer.addEventListener("pointerdown", (e) => {
    isDown = true;
    moved = false;
    pid = e.pointerId;
    optionsContainer.setPointerCapture(pid);
    startX = e.clientX;
    scrollLeft = optionsContainer.scrollLeft;
  });
  optionsContainer.addEventListener("pointermove", (e) => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 3) moved = true;
    optionsContainer.scrollLeft = scrollLeft - dx;
  });
  ["pointerup", "pointerleave", "pointercancel"].forEach((t) =>
    optionsContainer.addEventListener(t, () => {
      isDown = false;
      pid = null;
    }),
  );

  // Snap to closest card after scroll settles
  let scrollTimer;
  function snapToClosest() {
    const rect = optionsContainer.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    let closest = null,
      min = Infinity;
    cards.forEach((c) => {
      const r = c.getBoundingClientRect();
      const cCenter = r.left + r.width / 2;
      const dist = Math.abs(cCenter - center);
      if (dist < min) {
        min = dist;
        closest = c;
      }
    });
    if (closest) closest.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }
  optionsContainer.addEventListener("scroll", () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(snapToClosest, 120);
  });

  // Arrow keys to navigate
  window.addEventListener("keydown", (e) => {
    if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
    const idx = cards.findIndex((c) => c.classList.contains("active"));
    const curr = idx >= 0 ? idx : 0;
    const nextIdx = e.key === "ArrowRight" ? Math.min(cards.length - 1, curr + 1) : Math.max(0, curr - 1);
    activateCard(cards[nextIdx]);
  });

  // Prevent click activation after a drag
  cards.forEach((card) => {
    card.addEventListener(
      "click",
      (e) => {
        if (moved) e.stopImmediatePropagation();
      },
      true,
    );
  });
};
/* ============ CONTACT page scripts ============ */

// 3D tilt on the glass card (subtle)
(() => {
  const tilt = document.querySelector("#contact .contact-card.tilt");
  if (!tilt) return;

  let rx = 0,
    ry = 0,
    tx = 0,
    ty = 0;
  const damp = 0.12;

  function animate() {
    rx += (tx - rx) * damp;
    ry += (ty - ry) * damp;
    tilt.style.transform = `perspective(1000px) rotateX(${ry}deg) rotateY(${rx}deg)`;
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  tilt.addEventListener("mousemove", (e) => {
    const r = tilt.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    tx = x * 6; // rotateY
    ty = -y * 6; // rotateX (invert)
  });
  tilt.addEventListener("mouseleave", () => {
    tx = 0;
    ty = 0;
  });
})();

// Button ripple (works with .ripple on the submit button)
(() => {
  document.querySelectorAll("#contact .ripple").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left,
        y = e.clientY - rect.top;
      this.style.setProperty("--rx", `${x}px`);
      this.style.setProperty("--ry", `${y}px`);
      this.classList.remove("is-rippling");
      // reflow to restart animation
      void this.offsetWidth;
      this.classList.add("is-rippling");
      setTimeout(() => this.classList.remove("is-rippling"), 550);
    });
  });
})();

// const form = document.getElementById('form');
// const submitBtn = form.querySelector('button[type="submit"]');

// form.addEventListener('submit', async (e) => {
//     e.preventDefault();

//     const formData = new FormData(form);
//     formData.append("access_key", "2ae03305-83a8-48b9-9071-fd24bc057a6a");

//     const originalText = submitBtn.textContent;

//     submitBtn.textContent = "Sending...";
//     submitBtn.disabled = true;

//     try {
//         const response = await fetch("https://api.web3forms.com/submit", {
//             method: "POST",
//             body: formData
//         });

//         const data = await response.json();

//         if (response.ok) {
//             alert("Success! Your message has been sent.");
//             form.reset();
//         } else {
//             alert("Error: " + data.message);
//         }

//     } catch (error) {
//         alert("Something went wrong. Please try again.");
//     } finally {
//         submitBtn.textContent = originalText;
//         submitBtn.disabled = false;
//     }
// });
const form = document.getElementById("form");
const submitBtn = form.querySelector('button[type="submit"]');

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  formData.append("access_key", "2ae03305-83a8-48b9-9071-fd24bc057a6a");

  const originalText = submitBtn.textContent;

  submitBtn.textContent = "Sending...";
  submitBtn.disabled = true;

  try {
    const response = await fetch("https://api.web3forms.com/submit", { method: "POST", body: formData });

    const data = await response.json();

    if (response.ok) {
      alert("Success! Your message has been sent.");
      form.reset();
    } else {
      alert("Error: " + data.message);
    }
  } catch (error) {
    alert("Something went wrong. Please try again.");
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

// ===== Services carousel animations + seamless multi-card fill =====
// document.addEventListener("DOMContentLoaded", () => {
//   const sc = document.getElementById("servicesCarousel");
//   if (!sc || typeof bootstrap === "undefined" || !bootstrap.Carousel) return;

//   // Start carousel
//   new bootstrap.Carousel(sc, { interval: 3500, ride: "carousel", wrap: true, pause: "hover", touch: true, keyboard: true });

//   // Ensure each slide visually has 3 columns (on desktop) by cloning
//   ensureMultiCardSeamless(sc, 3, ".col-12");

//   // Add outgoing class just before slide change for a nicer transition
//   sc.addEventListener("slide.bs.carousel", (e) => {
//     const curr = sc.querySelector(".carousel-item.active");
//     if (curr) {
//       curr.classList.add("anim-out"); // triggers cardOut
//       // Remove after animation to reset
//       setTimeout(() => curr.classList.remove("anim-out"), 420);
//     }
//   });

//   function ensureMultiCardSeamless(container, minCols = 3, colSelector = ".col-12") {
//     const items = container.querySelectorAll(".carousel-item");
//     if (!items.length) return;

//     items.forEach((item) => {
//       const row = item.querySelector(".row");
//       if (!row) return;

//       let count = row.querySelectorAll(colSelector).length;
//       let next = item.nextElementSibling || items[0];

//       // Borrow until we have minCols
//       while (count < minCols) {
//         const col = next.querySelector(colSelector);
//         if (col) {
//           row.appendChild(col.cloneNode(true));
//           count++;
//         }
//         next = next.nextElementSibling || items[0];
//         if (next === item) break; // safety
//       }
//     });
//   }
// });

// ===== Services carousel: init + seamless multi-card fill =====
document.addEventListener("DOMContentLoaded", () => {
  const sc = document.getElementById("servicesCarousel");
  if (!sc || typeof bootstrap === "undefined" || !bootstrap.Carousel) return;

  // Start carousel
  new bootstrap.Carousel(sc, { interval: 3500, ride: "carousel", wrap: true, pause: "hover", touch: true, keyboard: true });

  // Keep each slide visually full at wrap edges
  ensureMultiCardSeamless(sc, 3, ".col-12");

  function ensureMultiCardSeamless(container, minCols = 3, colSelector = ".col-12") {
    const items = container.querySelectorAll(".carousel-item");
    if (!items.length) return;

    items.forEach((item) => {
      const row = item.querySelector(".row");
      if (!row) return;

      let count = row.querySelectorAll(colSelector).length;
      let next = item.nextElementSibling || items[0];

      while (count < minCols) {
        const col = next.querySelector(colSelector);
        if (col) {
          row.appendChild(col.cloneNode(true));
          count++;
        }
        next = next.nextElementSibling || items[0];
        if (next === item) break; // safety
      }
    });
  }
});
