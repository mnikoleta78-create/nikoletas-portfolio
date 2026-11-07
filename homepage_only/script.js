// ==========================================================
// HOMEPAGE INTERACTIONS
// - Hover/focus over a project to preview its video and text.
// - Click a project to open its own HTML page.
// - Touchscreens navigate directly because hover is unavailable.
// ==========================================================

const projectLinks = Array.from(document.querySelectorAll(".project-button"));
const backgroundVideo = document.querySelector("#background-video");
const nextVideo = document.querySelector("#background-video-next");
const siteShell = document.querySelector(".site-shell");
const projectTitle = document.querySelector("#project-title");
const projectDescription = document.querySelector("#project-description");
const projectStatus = document.querySelector("#project-status");

let activeVideoPath = "";
let glitchTimeout;

// Change the homepage preview to match the project link being previewed.
function previewProject(link, shouldGlitch = true) {
  if (!link) return;

  // Update the large headline, description, and small project status.
  projectTitle.textContent = link.dataset.title;
  projectDescription.textContent = link.dataset.description;
  projectStatus.textContent = `PROJECT ${link.dataset.number} / PREVIEW`;

  // Keep the active visual state in sync with the selected project.
  projectLinks.forEach((item) => {
    const isActive = item === link;
    item.classList.toggle("is-active", isActive);

    if (isActive) {
      item.setAttribute("aria-current", "true");
    } else {
      item.removeAttribute("aria-current");
    }
  });

  // Swap the full-screen video. The background remains dark if a file is missing.
  const nextPath = link.dataset.video;

  // const nextPath = link.dataset.video;

  if (nextPath && nextPath !== activeVideoPath) {
    const incomingVideo = backgroundVideo.classList.contains("is-visible")
      ? nextVideo
      : backgroundVideo;

    const outgoingVideo = incomingVideo === backgroundVideo
      ? nextVideo
      : backgroundVideo;

    activeVideoPath = nextPath;

    incomingVideo.classList.remove("is-visible");
    incomingVideo.pause();
    incomingVideo.src = nextPath;
    incomingVideo.load();

    incomingVideo.oncanplay = () => {
      incomingVideo.play()
        .then(() => {
          incomingVideo.classList.add("is-visible");
          outgoingVideo.classList.remove("is-visible");

          window.setTimeout(() => {
            outgoingVideo.pause();
            outgoingVideo.oncanplay = null;
          }, 600);
        })
        .catch(() => {
          incomingVideo.classList.remove("is-visible");
        });
    };

    incomingVideo.onerror = () => {
      incomingVideo.classList.remove("is-visible");
    };
  }

  // Restart the short glitch animation whenever the preview changes.
  if (shouldGlitch && siteShell) {
    siteShell.classList.remove("glitching");
    void siteShell.offsetWidth; // Forces the browser to restart the animation.
    siteShell.classList.add("glitching");

    window.clearTimeout(glitchTimeout);
    glitchTimeout = window.setTimeout(() => {
      siteShell.classList.remove("glitching");
    }, 280);
  }
}

const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

projectLinks.forEach((link) => {
  // Desktop: preview on hover. Clicking still follows the link to its HTML page.
  link.addEventListener("pointerenter", () => {
    if (supportsHover) previewProject(link);
  });

  // Keyboard users can preview a project by tabbing to its link.
  link.addEventListener("focus", () => previewProject(link));
});

// Start with the first project's text and background video.
if (projectLinks.length > 0) {
  previewProject(projectLinks[0], false);
}

// ------------------------------------------------

