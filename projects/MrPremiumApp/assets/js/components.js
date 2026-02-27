/**
 * components.js — Shared Header & Footer for Mr.Premium App
 * Include this script (non-deferred) before other scripts so the DOM
 * placeholders are filled before page-specific JS runs.
 */
(function () {
    /* ── Header ────────────────────────────────────────────────── */
    function renderHeader() {
        var el = document.getElementById('site-header');
        if (!el) return;

        // Check if admin page for extra nav link
        var isAdmin = window.location.pathname.indexOf('admin') !== -1;
        var isContact = window.location.pathname.indexOf('contact') !== -1;

        var adminLink = isAdmin
            ? '<a href="admin.html">Admin</a>'
            : '';

        // Sign-out button for admin, search button for all pages
        var signOutBtn = isAdmin
            ? '<button id="signOutBtn" class="link-danger hidden" type="button">Sign out</button>'
            : '';

        var searchBtn = '<button id="searchToggle" class="search-toggle" aria-label="Toggle search">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<circle cx="11" cy="11" r="8"></circle>' +
            '<line x1="21" y1="21" x2="16.65" y2="16.65"></line>' +
            '</svg>' +
            '</button>';

        var headerActions = '<div class="header-actions">' +
            signOutBtn +
            searchBtn +
            '<div class="menu-toggle" role="button" tabindex="0" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="primary-navigation" id="menuToggle">' +
            '<span></span><span></span><span></span>' +
            '</div>' +
            '</div>';

        el.innerHTML =
            '<div class="header-inner">' +
            '<a href="index.html" class="header-brand">' +
            '<img src="logo.png" alt="Mr.Premium App" />' +
            '</a>' +
            '<nav id="primary-navigation" aria-label="Primary navigation">' +
            '<a href="index.html">Home</a>' +
            '<a href="products.html?type=offer">Offer &amp; Combo</a>' +
            '<a href="products.html?type=subscription">Subscription</a>' +
            '<a href="products.html?type=pc">For PC</a>' +
            '<a href="products.html?type=android">For Android</a>' +
            '<a href="contact.html">Contact</a>' +
            adminLink +
            '</nav>' +
            headerActions +
            '</div>';
    }

    /* ── Footer ────────────────────────────────────────────────── */
    function renderFooter() {
        var el = document.getElementById('site-footer');
        if (!el) return;

        el.className = 'site-footer';
        el.innerHTML =
            '<div class="footer-grid">' +
            /* Column 1 — Brand */
            '<div class="footer-col footer-brand-col">' +
            '<a href="index.html" class="footer-brand">' +
            '<img src="logo.png" alt="Mr.Premium App" />' +
            '<span>Mr.Premium App</span>' +
            '</a>' +
            '<p class="footer-tagline">Your trusted destination for premium digital products, subscriptions, and exclusive deals for PC &amp; Android.</p>' +
            '<div class="footer-social" aria-label="Social links">' +
            '<a href="https://www.facebook.com/stationeryhouse11" target="_blank" rel="noopener noreferrer" aria-label="Facebook" class="facebook">' +
            '<img src="https://upload.wikimedia.org/wikipedia/commons/c/cd/Facebook_logo_%28square%29.png" alt="Facebook" />' +
            '</a>' +
            '<a href="https://wa.me/+8801704336936" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" class="whatsapp">' +
            '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/240px-WhatsApp.svg.png" alt="WhatsApp" />' +
            '</a>' +
            '<a href="mailto:mrpremiumapp@gmail.com" aria-label="Email" class="email">' +
            '<img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" alt="Email" />' +
            '</a>' +
            '<a href="https://www.youtube.com/@mrpremiumapp" target="_blank" rel="noopener noreferrer" aria-label="YouTube" class="youtube">' +
            '<img src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg" alt="YouTube" />' +
            '</a>' +
            '</div>' +
            '</div>' +

            /* Column 2 — Quick Links */
            '<div class="footer-col">' +
            '<h4 class="footer-heading">Quick Links</h4>' +
            '<ul class="footer-links">' +
            '<li><a href="index.html">Home</a></li>' +
            '<li><a href="products.html?type=offer">Offer &amp; Combo</a></li>' +
            '<li><a href="products.html?type=subscription">Subscription</a></li>' +
            '<li><a href="products.html?type=pc">For PC</a></li>' +
            '<li><a href="products.html?type=android">For Android</a></li>' +
            '<li><a href="contact.html">Contact Us</a></li>' +
            '</ul>' +
            '</div>' +

            /* Column 3 — Policies */
            '<div class="footer-col">' +
            '<h4 class="footer-heading">Policies</h4>' +
            '<ul class="footer-links">' +
            '<li><a href=\"about-us.html\">About Us</a></li>' +
            '<li><a href=\"privacy-policy.html\">Privacy Policy</a></li>' +
            '<li><a href=\"terms-and-conditions.html\">Terms &amp; Conditions</a></li>' +
            '<li><a href=\"refund-return-policy.html\">Refund Policy</a></li>' +
            '<li><a href=\"shipping-policy.html\">Shipping Policy</a></li>' +
            '<li><a href=\"cancellation-policy.html\">Cancellation Policy</a></li>' +
            '</ul>' +
            '</div>' +

            /* Column 4 — Contact */
            '<div class="footer-col">' +
            '<h4 class="footer-heading">Get in Touch</h4>' +
            '<ul class="footer-links footer-contact-list">' +
            '<li>' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>' +
            '<a href="mailto:mrpremiumapp@gmail.com">mrpremiumapp@gmail.com</a>' +
            '</li>' +
            '<li>' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>' +
            '<a href="https://wa.me/+8801704336936" target="_blank" rel="noopener noreferrer">+880 1704 336936</a>' +
            '</li>' +
            '</ul>' +
            '</div>' +
            '</div>' +
            '<div class="footer-bottom">' +
            '<p>&copy; 2026 Mr.Premium App. All rights reserved.</p>' +
            '</div>';
    }

    /* ── Init ───────────────────────────────────────────────────── */
    renderHeader();
    renderFooter();
})();
