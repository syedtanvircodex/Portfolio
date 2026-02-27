document.addEventListener('DOMContentLoaded', function () {
  // Always start at the very top of the page to avoid any perceived
  // "blank space" above the sticky header caused by restored scroll position.
  if (window.scrollY !== 0) {
    window.scrollTo(0, 0);
  }

  // Header scroll shadow
  var header = document.querySelector('header');
  if (header) {
    function onScroll() {
      if (window.scrollY > 10) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Create nav overlay for mobile menu
  var overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  document.body.appendChild(overlay);

  // Menu toggle functionality
  var menuToggle = document.getElementById('menuToggle');
  var nav = document.getElementById('primary-navigation');

  if (menuToggle && nav) {
    function toggleMenu() {
      var expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', (!expanded).toString());
      nav.classList.toggle('active');
      overlay.classList.toggle('active');
    }

    menuToggle.addEventListener('click', toggleMenu);
    menuToggle.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMenu();
      }
    });

    // Close mobile menu when overlay is clicked
    overlay.addEventListener('click', function () {
      menuToggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('active');
      overlay.classList.remove('active');
    });

    // Close mobile menu when a nav link is clicked
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth <= 768) {
          menuToggle.setAttribute('aria-expanded', 'false');
          nav.classList.remove('active');
          overlay.classList.remove('active');
        }
      });
    });
  }

  // Search toggle functionality
  const searchToggle = document.getElementById('searchToggle');
  const searchContainer = document.querySelector('.search-container');
  const searchInput = document.getElementById('searchInput');

  if (searchToggle) {
    searchToggle.addEventListener('click', function () {
      // Redirect to products page if on index page
      if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        window.location.href = 'products.html';
        return;
      }

      // Toggle search on products page
      if (searchContainer) {
        searchContainer.style.display = searchContainer.style.display === 'none' ? 'block' : 'none';
        if (searchContainer.style.display === 'block' && searchInput) {
          searchInput.focus();
        }
      } else {
        // Redirect to products page if search container doesn't exist (product-detail, checkout, thank-you, etc.)
        window.location.href = 'products.html';
      }
    });
  }

  // Initialize search visibility
  if (searchContainer && window.location.pathname.includes('products.html')) {
    searchContainer.style.display = 'block';
  }

  // Active Navigation Highlight
  function setActiveNav() {
    const navLinks = document.querySelectorAll('#primary-navigation a');
    const currentPath = window.location.pathname;
    const currentSearch = new URLSearchParams(window.location.search);
    const currentType = currentSearch.get('type');

    navLinks.forEach(link => {
      link.removeAttribute('aria-current');

      const linkUrl = new URL(link.href, window.location.origin);
      const linkPath = linkUrl.pathname;
      const linkSearch = new URLSearchParams(linkUrl.search);
      const linkType = linkSearch.get('type');

      // Normalize paths to handle / vs /index.html
      const normCurrent = currentPath.endsWith('/') ? currentPath + 'index.html' : currentPath;
      const normLink = linkPath.endsWith('/') ? linkPath + 'index.html' : linkPath;

      // Check if paths match (ignoring leading slash differences if any)
      if (normCurrent.replace(/^\//, '') === normLink.replace(/^\//, '')) {
        if (normCurrent.includes('products.html')) {
          if (currentType === linkType) {
            link.setAttribute('aria-current', 'page');
          }
        } else {
          link.setAttribute('aria-current', 'page');
        }
      }
    });
  }

  setActiveNav();
});
