/*
  SCROLL ANIMATION
  - Scroll progress scales the feature video down, but never pauses it.
  - Gallery images reveal at staggered points and drift into their individual
    CSS positions. Their positions are art-directed, not generated as a grid.
  - The information buttons open one reusable, accessible dialog.
*/
(() => {
  const stage = document.querySelector(".reveal-stage");
  const videoFrame = document.querySelector("#featureVideo");
  const items = [...document.querySelectorAll(".scatter-item")];
  const scrollHint = document.querySelector("#scrollHint");
  if (!stage || !videoFrame || !items.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp01 = value => Math.min(1, Math.max(0, value));
  const smoothstep = value => {
    const t = clamp01(value);
    return t * t * (3 - 2 * t);
  };
  let ticking = false;

  function updateAnimation() {
    ticking = false;
    const stageRect = stage.getBoundingClientRect();
    const scrollDistance = Math.max(1, stage.offsetHeight - window.innerHeight);
    const progress = reduceMotion ? 1 : clamp01(-stageRect.top / scrollDistance);
    const videoProgress = smoothstep(progress);

    // 1 = original size; 0.32 = final compact size. Playback continues normally.
    const videoScale = 1 - videoProgress * 0.68;
    videoFrame.style.transform = `translate(-50%, -50%) scale(${videoScale})`;
    videoFrame.style.borderRadius = `${videoProgress * 8}px`;

    const caption = videoFrame.querySelector(".video-caption");
    if (caption) caption.style.opacity = String(1 - videoProgress * 0.35);

    // Stagger each image using its --delay custom property from the HTML.
    items.forEach((item, index) => {
      const delay = Number.parseFloat(getComputedStyle(item).getPropertyValue("--delay")) || 0;
      const reveal = smoothstep(clamp01((progress - 0.08 - delay) / 0.62));
      const driftX = (index % 2 === 0 ? -1 : 1) * (1 - reveal) * 24;
      const driftY = (index % 3 === 0 ? 1 : -1) * (1 - reveal) * 28;
      const rotation = (index % 2 === 0 ? -1 : 1) * (1 - reveal) * 3;
      const scale = 0.72 + reveal * 0.28;

      item.style.opacity = String(reveal);
      item.style.transform = `translate3d(${driftX}px, ${driftY}px, 0) rotate(${rotation}deg) scale(${scale})`;
      // Hidden image controls should not be clickable until the tile is visible.
      item.style.pointerEvents = reveal > 0.8 ? "auto" : "none";
    });

    if (scrollHint) scrollHint.style.opacity = String(1 - smoothstep(progress / 0.22));
  }

  function requestUpdate() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateAnimation);
    }
  }
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  updateAnimation();

  // Ask the browser to play the video. Muted autoplay is more widely supported.
  // If autoplay is blocked, visitors may need a visible play control (add controls
  // to the <video> element in the HTML if you want to offer that fallback).
  const video = videoFrame.querySelector("video");
  if (video) {
    const playAttempt = video.play();
    if (playAttempt?.catch) playAttempt.catch(() => {});
  }

  // Accessible reusable image-note dialog.
  const dialog = document.querySelector("#imagePopover");
  const dialogTitle = document.querySelector("#popoverTitle");
  const dialogText = document.querySelector("#popoverText");
  const closeButton = dialog?.querySelector(".popover-close");

  document.querySelectorAll(".info-button").forEach(button => {
    button.addEventListener("click", () => {
      if (!dialog || !dialogTitle || !dialogText) return;
      dialogTitle.textContent = button.dataset.title || "Image note";
      dialogText.textContent = button.dataset.info || "";
      button.setAttribute("aria-expanded", "true");
      dialog.returnFocusTo = button;
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    });
  });

  function closeDialog() {
    if (!dialog) return;
    const returnFocusTo = dialog.returnFocusTo;
    if (typeof dialog.close === "function" && dialog.open) dialog.close();
    else dialog.removeAttribute("open");
    document.querySelectorAll(".info-button[aria-expanded='true']").forEach(button => {
      button.setAttribute("aria-expanded", "false");
    });
    returnFocusTo?.focus();
  }

  closeButton?.addEventListener("click", closeDialog);
  dialog?.addEventListener("click", event => {
    if (event.target === dialog) closeDialog();
  });
  dialog?.addEventListener("close", () => {
    document.querySelectorAll(".info-button[aria-expanded='true']").forEach(button => {
      button.setAttribute("aria-expanded", "false");
    });
  });
})();
