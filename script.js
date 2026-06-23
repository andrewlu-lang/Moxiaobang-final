const toggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");
const header = document.querySelector(".site-header");
const scrollLinks = [...document.querySelectorAll('a[href^="#"]')];
const navLinks = [...document.querySelectorAll(".main-nav a")];
const floatingLinks = [...document.querySelectorAll(".floating-actions a")];
const sectionIds = navLinks
  .map((link) => link.getAttribute("href"))
  .filter((href) => href && href.startsWith("#"))
  .map((href) => href.slice(1));
const sections = sectionIds
  .map((id) => document.getElementById(id))
  .filter(Boolean);

const getHeaderOffset = () => (header ? Math.ceil(header.getBoundingClientRect().height) : 0);
const setHeaderOffset = () => {
  document.documentElement.style.setProperty("--header-offset", `${getHeaderOffset()}px`);
};

const scrollToSection = (target) => {
  setHeaderOffset();
  const top = Math.max(0, Math.round(target.getBoundingClientRect().top + window.scrollY - getHeaderOffset()));
  window.scrollTo({ top, behavior: "smooth" });
};

setHeaderOffset();
window.addEventListener("load", setHeaderOffset);
window.addEventListener("resize", () => {
  setHeaderOffset();
  setActiveNav();
});

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

scrollLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href || href === "#") return;

    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();
    scrollToSection(target);
    history.pushState(null, "", href);
  });
});

const setActiveNav = () => {
  let current = null;
  const activationLine = getHeaderOffset() + Math.min(window.innerHeight * 0.34, 260);

  sections.forEach((section) => {
    if (section.getBoundingClientRect().top <= activationLine) current = section;
  });
  if (!current) current = sections[0];

  [...navLinks, ...floatingLinks].forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${current.id}`);
  });
};

let navTicking = false;
window.addEventListener(
  "scroll",
  () => {
    if (navTicking) return;
    navTicking = true;
    requestAnimationFrame(() => {
      setActiveNav();
      navTicking = false;
    });
  },
  { passive: true }
);
setActiveNav();

const revealTargets = [
  ...document.querySelectorAll(
    ".service-card, .grade-card, .recycling-card, .process-list li, .scenario-card, .tutorial-card, .contact-form, .contact-copy"
  ),
];

if ("IntersectionObserver" in window && revealTargets.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.16 }
  );

  revealTargets.forEach((target) => {
    target.classList.add("reveal-on-scroll");
    revealObserver.observe(target);
  });
} else {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
}

const contactForm = document.querySelector(".contact-form");

if (contactForm) {
  const formNote = contactForm.querySelector(".form-note");

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;

    if (formNote) {
      formNote.textContent = "已收到您的询盘信息，请通过微信二维码继续联系以便快速确认。";
    }
  });
}

const zoomableImages = [
  ...document.querySelectorAll("#products .grade-visual img"),
  ...document.querySelectorAll("#recycling .recycling-card-image img"),
  ...document.querySelectorAll("#oem .process-list img"),
  ...document.querySelectorAll("#scenarios .scenario-image img"),
  ...document.querySelectorAll("#guide .tutorial-card img"),
];

if (zoomableImages.length) {
  const lightbox = document.createElement("div");
  lightbox.className = "image-lightbox";
  lightbox.setAttribute("aria-hidden", "true");
  lightbox.innerHTML = `
    <button class="image-lightbox-close" type="button" aria-label="关闭大图">×</button>
    <img class="image-lightbox-img" alt="" />
  `;
  document.body.appendChild(lightbox);

  const lightboxImg = lightbox.querySelector(".image-lightbox-img");
  const closeButton = lightbox.querySelector(".image-lightbox-close");

  const closeLightbox = () => {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    lightboxImg.removeAttribute("src");
  };

  const openLightbox = (img) => {
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt || "回收墨盒图片";
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    closeButton.focus();
  };

  zoomableImages.forEach((img) => {
    img.classList.add("is-zoomable");
    img.setAttribute("tabindex", "0");
    img.setAttribute("role", "button");
    img.setAttribute("title", "点击放大查看");
    img.setAttribute("aria-label", `${img.alt || "回收墨盒图片"}，点击放大查看`);

    img.addEventListener("click", () => openLightbox(img));
    img.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(img);
      }
    });
  });

  closeButton.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("open")) closeLightbox();
  });
}
