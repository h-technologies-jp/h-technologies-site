const modal = document.getElementById("modal");
const mPhoto = document.getElementById("m-photo");
const mName = document.getElementById("m-name");
const mRole = document.getElementById("m-role");
const mBio = document.getElementById("m-bio");
const btnClose = document.getElementById("m-close");

if (modal && mPhoto && mName && mRole && mBio) {
  const closeModal = () => modal.classList.add("hidden");

  document.querySelectorAll(".member").forEach((card) => {
    card.addEventListener("click", () => {
      const photo = card.querySelector("img");
      if (!photo) return;

      mPhoto.src = photo.src;
      mPhoto.alt = `${card.dataset.name} の写真`;
      mName.textContent = card.dataset.name || "";
      mRole.textContent = card.dataset.role || "";
      mBio.textContent = card.dataset.bio || "";
      modal.classList.remove("hidden");
    });
  });

  btnClose?.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

const nav = document.querySelector(".main-nav");
if (nav) {
  const navPanel = nav.querySelector(".nav-panel") || nav.querySelector("ul");
  const menuToggle = nav.querySelector(".menu-toggle");
  const closeButton = nav.querySelector(".menu-close");

  const setExpanded = (isExpanded) => {
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", String(isExpanded));
    }
  };

  const openNav = () => {
    nav.classList.add("open");
    document.body.classList.add("nav-open");
    setExpanded(true);
  };

  const closeNav = () => {
    nav.classList.remove("open");
    document.body.classList.remove("nav-open");
    setExpanded(false);
  };

  if (menuToggle) {
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      if (nav.classList.contains("open")) {
        closeNav();
      } else {
        openNav();
      }
    });
  } else {
    // 旧マークアップへのフォールバック
    nav.addEventListener("click", () => openNav());
  }

  closeButton?.addEventListener("click", (e) => {
    e.stopPropagation();
    closeNav();
  });

  navPanel?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("click", (e) => {
    if (!nav.classList.contains("open")) return;
    if (!nav.contains(e.target)) closeNav();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });
}

const revealTargets = document.querySelectorAll(".reveal");
if (revealTargets.length > 0) {
  document.body.classList.add("motion");

  if (!("IntersectionObserver" in window)) {
    revealTargets.forEach((el) => el.classList.add("in-view"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.2 }
    );

    revealTargets.forEach((el) => observer.observe(el));
  }
}
