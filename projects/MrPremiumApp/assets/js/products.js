/* global firebase */
(function () {
  // Bail out early if Firebase isn't present
  if (typeof firebase === 'undefined') {
    // Firebase not available in this environment
    return;
  }

  const CURRENCY = '&#2547;'; // Bangladeshi Taka symbol
  const db = firebase.firestore();
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearch');
  let allProducts = []; // Cached products for search/filter

  // Choose the correct container (grid or "other products" rail on detail page)
  let productsContainer = document.querySelector('.products');
  if (window.location.pathname.includes('product-detail.html')) {
    productsContainer = document.getElementById('other-products');
  }

  if (!productsContainer) {
    return;
  }

  // Search functionality
  function initializeSearch() {
    if (searchInput) {
      searchInput.addEventListener('input', function (e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        filterProducts(searchTerm);
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', function () {
        searchInput.value = '';
        filterProducts('');
        searchInput.focus();
      });
    }
  }

  function filterProducts(searchTerm) {
    if (!searchTerm) {
      displayProducts(allProducts);
      return;
    }

    const filteredProducts = allProducts.filter(product => {
      const name = (product.name || '').toLowerCase();
      const description = (product.description || '').toLowerCase();
      const category = (product.category || '').toLowerCase();

      return name.includes(searchTerm) ||
        description.includes(searchTerm) ||
        category.includes(searchTerm);
    });

    displayProducts(filteredProducts);
  }

  function displayProducts(products) {
    productsContainer.innerHTML = '';
    if (products.length === 0) {
      productsContainer.innerHTML = '<div class="no-results">No products found</div>';
      return;
    }
    products.forEach(product => {
      productsContainer.appendChild(createProductCard(product));
    });
  }

  function formatCurrency(amount) {
    const num = Number(amount) || 0;
    return '<span class="currency">' + CURRENCY + '</span><span class="amount">' + num.toLocaleString() + '</span>';
  }

  function createProductCard(product) {
    const productDiv = document.createElement('div');
    productDiv.className = 'product';

    // Make entire card clickable to product detail
    productDiv.onclick = function (e) {
      // Don't navigate if a button was clicked
      if (e.target.closest('.card-buy-btn') || e.target.closest('.card-view-btn')) return;
      window.location.href = 'product-detail.html?id=' + product.id;
    };

    // Image with wrapper for padded rounded corners
    const imgWrapper = document.createElement('div');
    imgWrapper.className = 'product-img-wrapper';
    const img = document.createElement('img');
    img.src = product.imageUrl || 'https://via.placeholder.com/200x200?text=No+Image';
    img.alt = product.name || 'Product';
    img.loading = 'lazy';
    imgWrapper.appendChild(img);

    const h3 = document.createElement('h3');
    h3.textContent = product.name || 'Unnamed Product';

    // Price row: discount price + original price + discount badge
    const priceRow = document.createElement('div');
    priceRow.className = 'price-row';

    const cardPrice = document.createElement('span');
    cardPrice.className = 'card-price';
    cardPrice.innerHTML = product.discountPrice ? formatCurrency(product.discountPrice) : (product.regularPrice ? formatCurrency(product.regularPrice) : 'Price TBD');
    priceRow.appendChild(cardPrice);

    if (product.regularPrice && product.discountPrice && Number(product.regularPrice) > Number(product.discountPrice)) {
      const originalPrice = document.createElement('span');
      originalPrice.className = 'card-original-price';
      originalPrice.innerHTML = formatCurrency(product.regularPrice);
      priceRow.appendChild(originalPrice);

      // Compute discount percentage
      const pct = Math.round((1 - Number(product.discountPrice) / Number(product.regularPrice)) * 100);
      if (pct > 0) {
        const discBadge = document.createElement('span');
        discBadge.className = 'card-discount-badge';
        discBadge.textContent = '-' + pct + '%';
        priceRow.appendChild(discBadge);
      }
    }

    // Button row: View Details + Buy Now
    const btnRow = document.createElement('div');
    btnRow.className = 'card-btn-row';

    const viewBtn = document.createElement('button');
    viewBtn.textContent = 'View Details';
    viewBtn.className = 'card-view-btn';
    viewBtn.onclick = function (e) {
      e.stopPropagation();
      window.location.href = 'product-detail.html?id=' + product.id;
    };

    const buyNowBtn = document.createElement('button');
    buyNowBtn.textContent = 'Buy Now';
    buyNowBtn.className = 'card-buy-btn';
    buyNowBtn.onclick = function (e) {
      e.stopPropagation();
      window.location.href = 'checkout.html?id=' + product.id;
    };

    btnRow.appendChild(viewBtn);
    btnRow.appendChild(buyNowBtn);

    // Content container
    const productContent = document.createElement('div');
    productContent.className = 'product-content';

    productContent.appendChild(h3);
    productContent.appendChild(priceRow);
    productContent.appendChild(btnRow);

    productDiv.appendChild(imgWrapper);
    productDiv.appendChild(productContent);

    return productDiv;
  }

  function loadProducts() {
    // Loading products from Firestore

    // Show loading state
    productsContainer.innerHTML = '<div style="text-align: center; padding: 40px;">Loading products...</div>';

    // Initialize search before loading products
    initializeSearch();

    const isIndexPage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
    const urlParams = new URLSearchParams(window.location.search);
    const urlType = urlParams.get('type');

    // Don't filter by type on index page or product detail page
    let productType = null;
    const isProductDetailPage = window.location.pathname.includes('product-detail.html');

    // Current product ID to exclude from "Other products" rail
    const currentProductId = isProductDetailPage ? new URLSearchParams(window.location.search).get('id') : null;

    if (!isIndexPage && !isProductDetailPage && urlType) {
      productType = urlType;
    }

    db.collection('products')
      .get()
      .then(function (snapshot) {

        // Filter active products and by type (if not on index page)
        const activeProducts = snapshot.docs.filter(function (doc) {
          const data = doc.data();
          const isActive = data.status === 'active' || !data.status;

          // Skip current product on product detail page
          if (isProductDetailPage && doc.id === currentProductId) {
            return false;
          }

          // On index page, show all active products regardless of type
          if (isIndexPage) {
            return isActive;
          }

          // On product detail page, show up to 10 active products
          if (isProductDetailPage) {
            return isActive;
          }

          // On other pages, filter by type
          if (productType) {
            return isActive && (data.type === productType);
          }
          return isActive;
        });

        

        // Cache products for search
        allProducts = activeProducts.map(doc => ({ ...doc.data(), id: doc.id }));

        if (activeProducts.length === 0) {
          productsContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">Coming soon...</div>';
          return;
        }

        // Clear container
        productsContainer.innerHTML = '';

        // Add each product, limit to 10 for product detail page
        activeProducts.slice(0, isProductDetailPage ? 10 : undefined).forEach(function (doc) {
          const product = doc.data();
          product.id = doc.id;
          const productCard = createProductCard(product);
          productsContainer.appendChild(productCard);
        });

        // Add fade-in animation
        const products = productsContainer.querySelectorAll('.product');
        products.forEach(function (product, index) {
          product.style.opacity = '0';
          product.style.transform = 'translateY(20px)';
          setTimeout(function () {
            product.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            product.style.opacity = '1';
            product.style.transform = 'translateY(0)';
          }, index * 100);
        });
      })
      .catch(function (error) {
        // Suppressed product loading errors in logs

        let errorMessage = 'Failed to load products. ';
        if (error.code === 'permission-denied') {
          errorMessage += 'Permission denied. Check Firestore rules.';
        } else if (error.code === 'unavailable') {
          errorMessage += 'Service unavailable. Check your internet connection.';
        } else {
          errorMessage += 'Error: ' + error.message;
        }

        productsContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #f44336;">' + errorMessage + '</div>';
      });
  }

  // Test Firestore connection first
  function testConnection() {
    db.collection('test').doc('connection').get()
      .then(function () {
        loadProducts();
      })
      .catch(function (error) {
        // Firestore connection test failed (suppressed)
        productsContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: #f44336;">Cannot connect to database. Check Firebase configuration and internet connection.</div>';
      });
  }

  // Load products when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testConnection);
  } else {
    testConnection();
  }

  // Make loadProducts available globally for manual refresh
  window.loadProducts = loadProducts;
})();
