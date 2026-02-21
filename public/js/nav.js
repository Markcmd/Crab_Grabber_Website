// public/js/nav.js

(function () {
  const toggle = document.getElementById("menuToggle");
  const links = document.getElementById("navLinks");

  function createActiveIndicator() {
    if (!links) return;

    const activeLink = links.querySelector("a.active");
    if (!activeLink) return;

    // prevent duplicate indicator
    if (document.querySelector(".active-indicator")) return;

    const nav = document.querySelector(".nav");
    if (!nav) return;

    const indicator = document.createElement("a");
    indicator.className = "active-indicator";
    indicator.href = activeLink.getAttribute("href") || "#";
    indicator.textContent = activeLink.textContent || "";
    indicator.setAttribute("aria-current", "page");

    // insert before hamburger
    if (toggle && toggle.parentNode === nav) {
      nav.insertBefore(indicator, toggle);
    } else {
      nav.appendChild(indicator);
    }
  }

  function syncActiveIndicator() {
    const indicator = document.querySelector(".active-indicator");
    const activeLink = links?.querySelector("a.active");
    if (!indicator || !activeLink) return;

    indicator.textContent = activeLink.textContent || "";
    indicator.href = activeLink.getAttribute("href") || "#";
  }

  document.addEventListener("DOMContentLoaded", () => {
    createActiveIndicator();
    syncActiveIndicator();

    if (toggle && links) {
      toggle.addEventListener("click", () => {
        links.classList.toggle("open");
      });

      // close drawer when link clicked
      links.addEventListener("click", (e) => {
        if (e.target.closest("a")) {
          links.classList.remove("open");
        }
      });
    }

    // update indicator when language changes
    const langToggle = document.getElementById("langToggle");
    if (langToggle) {
      langToggle.addEventListener("click", () => {
        setTimeout(syncActiveIndicator, 0);
      });
    }
  });
})();