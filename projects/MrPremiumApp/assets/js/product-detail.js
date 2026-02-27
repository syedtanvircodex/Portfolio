/* global firebase */
(() => {
  const CURRENCY = '&#2547;'; // Bangladeshi Taka symbol

  // Element references
  const loadingEl = document.getElementById('loading');
  const errorEl = document.getElementById('error');
  const productDetailEl = document.getElementById('product-detail');
  const productImageEl = document.getElementById('product-image');
  const productNameEl = document.getElementById('product-name');
  const productCategoryEl = document.getElementById('product-category');
  const regularPriceEl = document.getElementById('regular-price');
  const discountPriceEl = document.getElementById('discount-price');
  const productDescriptionEl = document.getElementById('product-description');
  const buyNowBtn = document.getElementById('buy-now-btn');
  
  // Firebase reference
  let db = null;

  // Helper Functions
  function getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  }

  function showError(message) {
    if (errorEl) {
      errorEl.textContent = message;
      if (loadingEl) loadingEl.classList.add('hidden');
      if (productDetailEl) productDetailEl.classList.add('hidden');
      errorEl.classList.remove('hidden');
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function sanitizeHtml(input) {
    if (!input) return '';
    
    // If content doesn't look like HTML, escape and convert newlines to <br>
    const looksLikeHtml = /<[^>]+>/.test(input);
    if (!looksLikeHtml) {
      return escapeHtml(input).replace(/\n/g, '<br>');
    }
    
    const template = document.createElement('template');
    template.innerHTML = input.trim();
    
    const allowedTags = new Set(['A','B','STRONG','EM','I','U','P','BR','UL','OL','LI','H1','H2','H3','H4','H5','H6','SPAN']);
    const allowedAttrs = {
      'A': new Set(['href','title','target','rel']),
      'SPAN': new Set(['style'])
    };
    
    function walk(node) {
      // Remove comments
      if (node.nodeType === Node.COMMENT_NODE) {
        node.remove();
        return;
      }
      
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = node.tagName;
        if (!allowedTags.has(tag)) {
          const text = document.createTextNode(node.textContent || '');
          node.replaceWith(text);
          return;
        }
        
        Array.from(node.attributes || []).forEach(attr => {
          const name = attr.name.toLowerCase();
          
          // Drop event handlers and javascript: URLs
          if (name.startsWith('on')) {
            node.removeAttribute(name);
            return;
          }
          
          if (tag === 'A') {
            if (!allowedAttrs.A.has(name)) {
              node.removeAttribute(name);
              return;
            }
            if (name === 'href') {
              const safe = attr.value.trim();
              if (!/^https?:\/\//i.test(safe)) {
                node.removeAttribute(name);
                return;
              }
              node.setAttribute('rel', 'noopener noreferrer');
              node.setAttribute('target', '_blank');
            }
          } else if (tag === 'SPAN') {
            if (!allowedAttrs.SPAN.has(name)) {
              node.removeAttribute(name);
            }
          } else {
            // No attributes on other tags
            node.removeAttribute(name);
          }
        });
      }
      
      Array.from(node.childNodes || []).forEach(walk);
    }
    
    Array.from(template.content.childNodes).forEach(walk);
    return template.innerHTML;
  }

  function formatCurrency(amount) {
    const num = Number(amount) || 0;
    return '<span class="currency">' + CURRENCY + '</span><span class="amount">' + num.toLocaleString() + '</span>';
  }

  // Firebase initialization
  async function initFirebase() {
    try {
      return new Promise((resolve, reject) => {
        let attempts = 0;
        const checkFirebase = () => {
          attempts++;
          if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
            db = firebase.firestore();
            resolve();
          } else if (attempts < 20) {
            setTimeout(checkFirebase, 250);
          } else {
            reject(new Error('Firebase failed to initialize after 20 attempts'));
          }
        };
        checkFirebase();
      });
    } catch (error) {
      throw error;
    }
  }

  async function loadProduct() {
    const productId = getProductIdFromUrl();
    
    
    if (!productId) {
      showError('Product ID not found in URL. Please go back to products and try again.');
      return;
    }
    
    if (!db) {
      showError('Database not initialized. Please try refreshing the page.');
      return;
    }

    try {
      // Show loading state
      if (loadingEl) loadingEl.classList.remove('hidden');
      if (errorEl) errorEl.classList.add('hidden');
      if (productDetailEl) productDetailEl.classList.add('hidden');
      
      const doc = await db.collection('products').doc(productId).get();
      
      if (!doc.exists) {
        showError('Product not found in database. It may have been deleted.');
        return;
      }
      
      const product = doc.data();
      product.id = doc.id;
      
      
      displayProduct(product);
    } catch (error) {
      
      if (error.code === 'permission-denied') {
        showError('Permission denied. Check Firestore rules.');
      } else if (error.code === 'unavailable') {
        showError('Database unavailable. Check your internet connection.');
      } else {
        showError('Failed to load product: ' + error.message);
      }
    }
  }

  function displayProduct(product) {
    if (!product) return;

    // Update page title
    document.title = `${product.name} - Mr.Premium App`;
    
    // Update product image
    if (productImageEl) {
      productImageEl.src = product.imageUrl || 'https://via.placeholder.com/400x400?text=No+Image';
      productImageEl.alt = product.name;
    }
    
    // Update product info
    if (productNameEl) {
      productNameEl.textContent = product.name || 'Unnamed Product';
    }
    
    if (productCategoryEl) {
      productCategoryEl.textContent = product.category || 'General';
    }
    
    // Update prices
    if (regularPriceEl) {
      const regularPrice = product.regularPrice || 0;
      regularPriceEl.innerHTML = formatCurrency(regularPrice);
      regularPriceEl.style.display = product.discountPrice ? 'block' : 'none';
    }

    if (discountPriceEl) {
      const displayPrice = product.discountPrice || product.regularPrice || 0;
      discountPriceEl.innerHTML = formatCurrency(displayPrice);
    }
    
    // Update description with sanitized HTML
    if (productDescriptionEl) {
      productDescriptionEl.innerHTML = sanitizeHtml(product.description || 'No description available.');
    }
    
    // Setup buy now button
    if (buyNowBtn) {
      buyNowBtn.onclick = () => window.location.href = `checkout.html?id=${product.id}`;
    }
    
    // Show product details and hide loading/error states
    if (loadingEl) loadingEl.classList.add('hidden');
    if (errorEl) errorEl.classList.add('hidden');
    if (productDetailEl) productDetailEl.classList.remove('hidden');

    // Update document meta for SEO and social sharing
    try {
      var title = product.name + ' — Mr.Premium App';
      document.title = title;

      // description
      var desc = (product.description || '').replace(/<[^>]+>/g, '').substring(0, 160);
      var metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = desc || 'Product details from Mr.Premium App.';

      // canonical
      var canonical = document.querySelector('link[rel="canonical"]');
      var productUrl = window.location.origin + window.location.pathname + '?id=' + product.id;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = productUrl;

      // Open Graph tags
      function upsertMeta(prop, value, isProperty) {
        var selector = isProperty ? 'meta[property="' + prop + '"]' : 'meta[name="' + prop + '"]';
        var el = document.head.querySelector(selector);
        if (!el) {
          el = document.createElement('meta');
          if (isProperty) el.setAttribute('property', prop); else el.setAttribute('name', prop);
          document.head.appendChild(el);
        }
        el.content = value;
      }

      upsertMeta('og:title', title, true);
      upsertMeta('og:description', desc, true);
      upsertMeta('og:url', productUrl, true);
      upsertMeta('og:image', product.imageUrl || window.location.origin + '/logo.png', true);
      upsertMeta('twitter:title', title, false);
      upsertMeta('twitter:description', desc, false);
      upsertMeta('twitter:image', product.imageUrl || window.location.origin + '/logo.png', false);

      // Remove existing product JSON-LD if present
      var existing = document.getElementById('product-jsonld');
      if (existing) existing.remove();

      var jsonld = {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        'name': product.name,
        'image': [ product.imageUrl || window.location.origin + '/logo.png' ],
        'description': (product.description || '').replace(/<[^>]+>/g, '').substring(0, 500),
        'sku': product.id,
        'offers': {
          '@type': 'Offer',
          'url': productUrl,
          'priceCurrency': 'BDT',
          'price': (product.discountPrice || product.regularPrice || 0),
          'availability': product.stock && product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
        }
      };

      var script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'product-jsonld';
      script.text = JSON.stringify(jsonld);
      document.head.appendChild(script);
    } catch (e) {
      // Ignore meta update failures in production
    }
  }

  // Initialize when the page is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAndLoad);
  } else {
    initAndLoad();
  }

  async function initAndLoad() {
    try {
      await initFirebase();
      await loadProduct();
    } catch (error) {
      showError('Failed to initialize: ' + error.message);
    }
  }
})();
