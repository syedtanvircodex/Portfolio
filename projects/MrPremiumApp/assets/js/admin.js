/* global firebase */
(function () {
  if (typeof firebase === 'undefined') {
    // Firebase SDK not loaded in this environment
    return;
  }

  var auth = firebase.auth();
  var db = firebase.firestore();
  var CURRENCY = '\u09F3'; // Bangladeshi Taka symbol

  var loginSection = document.getElementById('loginSection');
  var adminHero = document.querySelector('.admin-hero');
  var ordersSection = document.getElementById('ordersSection');
  var productsSection = document.getElementById('productsSection');
  var adminNav = document.getElementById('adminNav');
  var loginBtn = document.getElementById('loginBtn');
  var emailEl = document.getElementById('adminEmail');
  var passEl = document.getElementById('adminPassword');
  var signOutBtn = document.getElementById('signOutBtn');
  var refreshBtn = document.getElementById('refreshBtn');
  var ordersTbody = document.getElementById('ordersTbody');
  var ordersInfo = document.getElementById('ordersInfo');
  var orderSearch = document.getElementById('orderSearch');
  var orderStatusFilter = document.getElementById('orderStatusFilter');
  var statGrid = document.getElementById('statGrid');
  var lastSyncEl = document.getElementById('lastSync');
  var ordersTotalEl = document.getElementById('ordersTotal');
  var ordersInfoMini = document.getElementById('ordersInfoMini');
  var ordersCompleteEl = document.getElementById('ordersComplete');
  var ordersCompletionRateEl = document.getElementById('ordersCompletionRate');
  var ordersRevenueEl = document.getElementById('ordersRevenue');
  var averageTicketEl = document.getElementById('averageTicket');

  // Product management elements
  var addProductBtn = document.getElementById('addProductBtn');
  var refreshProductsBtn = document.getElementById('refreshProductsBtn');
  var productModalOverlay = document.getElementById('productModalOverlay');
  var productFormSection = document.getElementById('productFormSection');
  var productFormTitle = document.getElementById('productFormTitle');
  var productName = document.getElementById('productName');
  var productDescription = document.getElementById('productDescription');
  var regularPrice = document.getElementById('regularPrice');
  var discountPrice = document.getElementById('discountPrice');
  var productImageUrl = document.getElementById('productImageUrl');
  var productCategory = document.getElementById('productCategory');
  var productType = document.getElementById('productType');
  var productStatus = document.getElementById('productStatus');
  var saveProductBtn = document.getElementById('saveProductBtn');
  var cancelProductBtn = document.getElementById('cancelProductBtn');
  var productsTbody = document.getElementById('productsTbody');
  var productsInfo = document.getElementById('productsInfo');
  var productSearch = document.getElementById('productSearch');
  var ordersTab = document.getElementById('ordersTab');
  var productsTab = document.getElementById('productsTab');
  var productsActiveEl = document.getElementById('productsActive');
  var productsInfoMiniEl = document.getElementById('productsInfoMini');
  var productStatusFilter = document.getElementById('productStatusFilter');
  var productTypeFilter = document.getElementById('productTypeFilter');

  var currentEditingProductId = null;
  var ordersData = [];
  var productsData = [];

  function resetStatsUI() {
    if (ordersTotalEl) ordersTotalEl.textContent = '0';
    if (ordersCompleteEl) ordersCompleteEl.textContent = '0';
    if (ordersRevenueEl) ordersRevenueEl.textContent = CURRENCY + '0';
    if (ordersCompletionRateEl) ordersCompletionRateEl.textContent = '--';
    if (averageTicketEl) averageTicketEl.textContent = 'Avg ticket --';
    if (ordersInfoMini) ordersInfoMini.textContent = 'Latest orders hidden';
    if (productsActiveEl) productsActiveEl.textContent = '0';
    if (productsInfoMiniEl) productsInfoMiniEl.textContent = 'Catalog hidden';
    if (lastSyncEl) lastSyncEl.textContent = '--';
  }

  function clearTablesUI() {
    if (ordersTbody) ordersTbody.innerHTML = '';
    if (productsTbody) productsTbody.innerHTML = '';
    if (ordersInfo) ordersInfo.textContent = 'Sign in to view orders';
    if (productsInfo) productsInfo.textContent = 'Sign in to view products';
    if (orderSearch) orderSearch.value = '';
    if (orderStatusFilter) orderStatusFilter.value = 'all';
    if (productSearch) productSearch.value = '';
    if (productStatusFilter) productStatusFilter.value = 'all';
    if (productTypeFilter) productTypeFilter.value = 'all';
  }

  function applySignedOutUI() {
    if (loginSection) loginSection.classList.remove('hidden');
    if (adminNav) adminNav.classList.add('hidden');
    if (ordersSection) ordersSection.classList.add('hidden');
    if (productsSection) productsSection.classList.add('hidden');
    if (adminHero) adminHero.classList.add('hidden');
    if (statGrid) statGrid.classList.add('hidden');
    if (signOutBtn) signOutBtn.classList.add('hidden');
    if (ordersTab) ordersTab.classList.add('active');
    if (productsTab) productsTab.classList.remove('active');
    clearTablesUI();
    resetStatsUI();
  }

  function applySignedInUI() {
    if (loginSection) loginSection.classList.add('hidden');
    if (adminNav) adminNav.classList.remove('hidden');
    if (adminHero) adminHero.classList.remove('hidden');
    if (signOutBtn) signOutBtn.classList.remove('hidden');
  }

  // Prevent brief admin-data flash before auth resolves.
  applySignedOutUI();

  // Auth State Listener
  auth.onAuthStateChanged(function (user) {
    if (user) {
      applySignedInUI();

      // Load initial view
      showOrdersTab();
      loadProducts();
    } else {
      if (ordersUnsubscribe) {
        ordersUnsubscribe();
        ordersUnsubscribe = null;
      }
      if (productsUnsubscribe) {
        productsUnsubscribe();
        productsUnsubscribe = null;
      }
      ordersData = [];
      productsData = [];
      applySignedOutUI();
    }
  });

  // Login
  if (loginBtn) {
    loginBtn.addEventListener('click', function () {
      var email = emailEl.value;
      var pass = passEl.value;
      if (!email || !pass) {
        alert('Please enter email and password');
        return;
      }
      loginBtn.textContent = 'Signing in...';
      loginBtn.disabled = true;

      auth.signInWithEmailAndPassword(email, pass)
        .catch(function (error) {
          alert('Login failed: ' + error.message);
        })
        .finally(function () {
          loginBtn.textContent = 'Sign In';
          loginBtn.disabled = false;
        });
    });
  }

  // Sign Out
  if (signOutBtn) {
    signOutBtn.addEventListener('click', function () {
      applySignedOutUI();
      auth.signOut();
    });
  }

  // Tab Navigation
  function showOrdersTab() {
    if (ordersSection) ordersSection.classList.remove('hidden');
    if (productsSection) productsSection.classList.add('hidden');
    if (ordersTab) ordersTab.classList.add('active');
    if (productsTab) productsTab.classList.remove('active');
    loadOrders();
  }

  function showProductsTab() {
    if (ordersSection) ordersSection.classList.add('hidden');
    if (productsSection) productsSection.classList.remove('hidden');
    if (ordersTab) ordersTab.classList.remove('active');
    if (productsTab) productsTab.classList.add('active');
    loadProducts();
  }

  if (ordersTab) ordersTab.addEventListener('click', showOrdersTab);
  if (productsTab) productsTab.addEventListener('click', showProductsTab);

  // Refresh Buttons
  if (refreshBtn) refreshBtn.addEventListener('click', loadOrders);
  if (refreshProductsBtn) {
    refreshProductsBtn.addEventListener('click', function () {
      loadProducts(true);
    });
  }

  // Search & Filter
  if (orderSearch) orderSearch.addEventListener('input', updateOrdersView);
  if (orderStatusFilter) orderStatusFilter.addEventListener('change', updateOrdersView);
  if (productSearch) productSearch.addEventListener('input', updateProductsView);
  if (productStatusFilter) productStatusFilter.addEventListener('change', updateProductsView);
  if (productTypeFilter) productTypeFilter.addEventListener('change', updateProductsView);

  // Product Form Actions
  if (addProductBtn) addProductBtn.addEventListener('click', showProductForm);
  if (cancelProductBtn) cancelProductBtn.addEventListener('click', hideProductForm);
  if (saveProductBtn) saveProductBtn.addEventListener('click', saveProduct);

  // Close modal on backdrop click
  if (productModalOverlay) {
    productModalOverlay.addEventListener('click', function (e) {
      if (e.target === productModalOverlay) {
        hideProductForm();
      }
    });
  }

  function setLoading(isLoading) {
    if (!ordersInfo) return;
    if (isLoading) {
      ordersInfo.textContent = 'Loading orders...';
    }
  }

  function formatTimestamp(ts) {
    if (!ts) return '';
    var date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleString();
  }

  function setLastSync() {
    if (lastSyncEl) {
      lastSyncEl.textContent = new Date().toLocaleString();
    }
  }

  function toNumber(value) {
    var num = parseFloat(value);
    return isNaN(num) ? null : num;
  }

  function formatCurrency(value) {
    var num = toNumber(value);
    if (num === null) return '';
    return CURRENCY + num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  function updateOrdersStats(allDocs) {
    if (!ordersTotalEl) return;
    var total = allDocs.length;
    var completed = 0;
    var revenue = 0;
    var pricedCount = 0;

    allDocs.forEach(function (doc) {
      var data = doc.data() || {};
      var isComplete = (data.status === 'complete') || (data.completed === true);
      if (isComplete) completed += 1;
      var price = toNumber(data.productPrice != null ? data.productPrice : data.discountPrice);
      if (price !== null) {
        revenue += price;
        pricedCount += 1;
      }
    });

    ordersTotalEl.textContent = total;
    if (ordersInfoMini) {
      ordersInfoMini.textContent = total ? ('Latest ' + total + ' orders loaded') : 'No orders yet';
    }
    if (ordersCompleteEl) {
      ordersCompleteEl.textContent = completed;
    }
    if (ordersCompletionRateEl) {
      var pct = total ? Math.round((completed / total) * 100) : 0;
      ordersCompletionRateEl.textContent = total ? (pct + '% completion') : 'No orders yet';
    }
    if (ordersRevenueEl) {
      ordersRevenueEl.textContent = revenue ? (CURRENCY + revenue.toLocaleString('en-US', { maximumFractionDigits: 2 })) : CURRENCY + '0';
    }
    if (averageTicketEl) {
      averageTicketEl.textContent = pricedCount ? ('Avg ticket ' + CURRENCY + (revenue / pricedCount).toFixed(0)) : 'Avg ticket n/a';
    }
  }

  function updateProductsStats(allDocs) {
    if (!productsActiveEl) return;
    var total = allDocs.length;
    var active = 0;
    var inactive = 0;

    allDocs.forEach(function (doc) {
      var status = (doc.data().status || '').toLowerCase();
      if (status === 'inactive') {
        inactive += 1;
      } else {
        active += 1;
      }
    });

    productsActiveEl.textContent = active;
    if (productsInfoMiniEl) {
      productsInfoMiniEl.textContent = active + ' active / ' + total + ' total';
    }
    if (productsInfo) {
      productsInfo.textContent = total ? ('Showing ' + total + ' products') : 'No products found';
    }
  }

  function filterOrders(data) {
    var query = orderSearch ? orderSearch.value.trim().toLowerCase() : '';
    var statusFilter = orderStatusFilter ? orderStatusFilter.value : 'all';

    return data.filter(function (doc) {
      var d = doc.data() || {};
      var isComplete = (d.status === 'complete') || (d.completed === true);
      if (statusFilter === 'complete' && !isComplete) return false;
      if (statusFilter === 'incomplete' && isComplete) return false;

      if (!query) return true;

      var haystack = [
        doc.id,
        d.customerName,
        d.customerEmail,
        d.customerPhone,
        d.bkashDigits,
        d.productName
      ];

      return haystack.some(function (val) {
        return (val || '').toString().toLowerCase().indexOf(query) !== -1;
      });
    });
  }

  function updateOrdersView() {
    if (!ordersData || !ordersData.length) {
      renderOrders([]);
      if (ordersInfo) {
        ordersInfo.textContent = 'No orders yet';
      }
      return;
    }
    var filtered = filterOrders(ordersData);
    renderOrders(filtered);
    if (ordersInfo) {
      var infoText = ordersData.length
        ? 'Showing ' + filtered.length + ' of ' + ordersData.length + ' orders (Live)'
        : 'No orders yet';
      ordersInfo.textContent = infoText;
    }
  }

  // Toast Notification
  function showToast(message) {
    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = '<span class="toast-icon">&#10003;</span><span>' + message + '</span>';
    document.body.appendChild(toast);

    // Trigger reflow
    void toast.offsetWidth;
    toast.classList.add('show');

    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  // Copy to Clipboard
  window.copyToClipboard = function (text, label) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(function () {
      showToast((label || 'Text') + ' copied!');
    }).catch(function (err) {
      // Copy failed (suppressed logging)
      // Fallback
      var textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        showToast((label || 'Text') + ' copied!');
      } catch (err) {
        // Fallback copy failed (suppressed logging)
      }
      document.body.removeChild(textArea);
    });
  };

  function renderOrders(docs) {
    if (!ordersTbody) return;
    ordersTbody.innerHTML = '';
    if (!docs.length) {
      var tr = document.createElement('tr');
      var td = document.createElement('td');
      td.colSpan = 10;
      td.textContent = 'No orders found.';
      tr.appendChild(td);
      ordersTbody.appendChild(tr);
      return;
    }
    docs.forEach(function (doc) {
      var data = doc.data();
      var tr = document.createElement('tr');
      
      // Helper to create copy button
      function createCopyBtn(text, label) {
        if (!text) return null;
        var btn = document.createElement('button');
        btn.className = 'copy-btn-icon';
        btn.title = 'Copy ' + label;
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16 1H4C3 1 2 2 2 3v14h2V3h12V1zm3 4H8C7 4 6 5 6 6v14c0 1 1 2 2 2h11c1 0 2-1 2-2V6c0-1-1-2-2-2zm0 16H8V6h11v15z"/></svg>';
        btn.onclick = function(e) {
          e.stopPropagation();
          copyToClipboard(text, label);
        };
        return btn;
      }

      function td(content, className, label) {
        var c = document.createElement('td');
        if (typeof content === 'string' || typeof content === 'number') {
           c.textContent = content;
        } else if (content) {
           c.appendChild(content);
        }
        
        if (className) c.className = className;
        if (label) c.setAttribute('data-label', label);
        return c;
      }

      var isComplete = (data.status === 'complete') || (data.completed === true);
      var priceValue = data.productPrice != null ? data.productPrice : data.discountPrice;

      tr.appendChild(td(doc.id, 'small order-id-cell', 'Order ID'));
      tr.appendChild(td(data.customerName || '', '', 'Customer'));
      
      // Email with copy
      var emailContainer = document.createElement('div');
      emailContainer.className = 'cell-copy-wrap';
      var emailSpan = document.createElement('span');
      emailSpan.className = 'cell-copy-text';
      emailSpan.textContent = data.customerEmail || '';
      emailContainer.appendChild(emailSpan);
      if (data.customerEmail) {
          var emailCopyBtn = createCopyBtn(data.customerEmail, 'Email');
          emailContainer.appendChild(emailCopyBtn);
      }
      tr.appendChild(td(emailContainer, 'small hide-mobile', 'Email'));

      // Phone with copy
      var phoneContainer = document.createElement('div');
      phoneContainer.className = 'cell-copy-wrap';
      var phoneSpan = document.createElement('span');
      phoneSpan.className = 'cell-copy-text';
      phoneSpan.textContent = data.customerPhone || '';
      phoneContainer.appendChild(phoneSpan);
      if (data.customerPhone) {
          var phoneCopyBtn = createCopyBtn(data.customerPhone, 'Phone');
          phoneContainer.appendChild(phoneCopyBtn);
      }
      tr.appendChild(td(phoneContainer, 'small hide-mobile', 'WhatsApp'));

      tr.appendChild(td(data.bkashDigits || '', 'small trx-cell', 'Trx ID'));
      tr.appendChild(td(data.productName || '', '', 'Product'));
      tr.appendChild(td(formatCurrency(priceValue), '', 'Price'));
      tr.appendChild(td(formatTimestamp(data.createdAt), 'small hide-mobile', 'Created'));

      var statusTd = document.createElement('td');
      statusTd.className = 'status-cell';
      statusTd.setAttribute('data-label', 'Status');
      var statusChip = document.createElement('span');
      statusChip.className = 'status-chip ' + (isComplete ? 'success' : 'pending');
      statusChip.textContent = isComplete ? 'Complete' : 'Pending';
      statusTd.appendChild(statusChip);
      tr.appendChild(statusTd);

      var actionsTd = document.createElement('td');
      actionsTd.className = 'actions-cell';
      actionsTd.setAttribute('data-label', 'Actions');

      var toggleBtn = document.createElement('button');
      toggleBtn.className = 'action-btn ' + (isComplete ? 'warning' : 'primary');
      toggleBtn.textContent = isComplete ? 'Mark Incomplete' : 'Mark Complete';
      toggleBtn.onclick = function () {
        updateOrderStatus(doc.id, !isComplete);
      };

      var deleteBtn = document.createElement('button');
      deleteBtn.className = 'action-btn danger';
      deleteBtn.textContent = 'Delete';
      deleteBtn.onclick = function () {
        deleteOrder(doc.id);
      };

      var actionsWrap = document.createElement('div');
      actionsWrap.className = 'action-buttons';
      actionsWrap.appendChild(toggleBtn);
      actionsWrap.appendChild(deleteBtn);
      actionsTd.appendChild(actionsWrap);
      tr.appendChild(actionsTd);

      ordersTbody.appendChild(tr);
    });
  }

  // Real-time Orders Listener
  var ordersUnsubscribe = null;

  function loadOrders() {
    // If already listening, do nothing
    if (ordersUnsubscribe) {
        return; 
    }

    setLoading(true);
    
    ordersUnsubscribe = db.collection('orders')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .onSnapshot(function(snap) {
         ordersData = snap.docs;
         updateOrdersStats(ordersData);
         updateOrdersView();
         if (statGrid) {
           statGrid.classList.remove('hidden');
           statGrid.style.display = 'grid'; 
         }
         setLastSync();
         setLoading(false);
         
         // Optional: Show a subtle indicator that data is live
         if (ordersInfo && ordersData.length > 0) {
           ordersInfo.textContent = 'Showing ' + ordersData.length + ' orders (Live)';
         }
      }, function(error) {
        // Error fetching orders (suppressed logging)
        if (ordersInfo) ordersInfo.textContent = 'Error loading live updates';
        setLoading(false);
      });
  }

  function updateOrderStatus(orderId, complete) {
    if (!orderId) return;
    db.collection('orders').doc(orderId).update({
      status: complete ? 'complete' : 'incomplete',
      completed: complete,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function () {
      showToast(complete ? 'Order marked complete' : 'Order marked pending');
    }).catch(function (err) {
      // Update order failed (suppressed logging)
      alert('Failed to update order: ' + err.message);
    });
  }

  function deleteOrder(orderId) {
    if (!orderId || !confirm('Delete this order? This cannot be undone.')) return;
    db.collection('orders').doc(orderId).delete()
      .then(function () {
        showToast('Order deleted');
      })
      .catch(function (err) {
        alert('Error deleting order: ' + err.message);
      });
  }

  function setProductsLoading(isLoading) {
    if (!productsInfo) return;
    if (isLoading) {
      productsInfo.textContent = 'Loading products...';
    }
  }

  function renderProducts(docs) {
    if (!productsTbody) return;
    productsTbody.innerHTML = '';
    if (!docs.length) {
      var tr = document.createElement('tr');
      var td = document.createElement('td');
      td.colSpan = 8;
      td.textContent = 'No products found.';
      tr.appendChild(td);
      productsTbody.appendChild(tr);
      return;
    }
    docs.forEach(function (doc) {
      var data = doc.data();
      var tr = document.createElement('tr');
      function td(val, className, label) {
        var c = document.createElement('td');
        c.textContent = val == null ? '' : String(val);
        if (className) c.className = className;
        if (label) c.setAttribute('data-label', label);
        return c;
      }

      tr.appendChild(td(data.name || '', '', 'Name'));
      // Description column removed from table for cleaner UI
      tr.appendChild(td(formatCurrency(data.regularPrice), 'hide-mobile', 'Reg. Price'));
      tr.appendChild(td(formatCurrency(data.discountPrice), '', 'Disc. Price'));
      tr.appendChild(td(data.category || '', 'hide-mobile', 'Category'));

      var statusTd = document.createElement('td');
      statusTd.className = 'status-cell';
      statusTd.setAttribute('data-label', 'Status');
      var statusChip = document.createElement('span');
      var statusValue = (data.status || '').toLowerCase();
      var statusClass = statusValue === 'active' ? 'success' : 'pending';
      statusChip.className = 'status-chip ' + statusClass;
      statusChip.textContent = statusValue || 'pending';
      statusTd.appendChild(statusChip);
      tr.appendChild(statusTd);

      tr.appendChild(td(formatTimestamp(data.createdAt), 'small hide-mobile', 'Created'));

      var actionsTd = document.createElement('td');
      actionsTd.className = 'actions-cell';
      actionsTd.setAttribute('data-label', 'Actions');

      var editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.className = 'action-btn primary';
      editBtn.onclick = function () { editProduct(doc.id, data); };

      var deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.className = 'action-btn danger';
      deleteBtn.onclick = function () { deleteProduct(doc.id); };

      var actionsWrap = document.createElement('div');
      actionsWrap.className = 'action-buttons';
      actionsWrap.appendChild(editBtn);
      actionsWrap.appendChild(deleteBtn);
      actionsTd.appendChild(actionsWrap);
      tr.appendChild(actionsTd);
      productsTbody.appendChild(tr);
    });
  }

  function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    db.collection('products').doc(productId).delete()
      .then(function () {
        loadProducts();
      })
      .catch(function (err) {
        alert('Error deleting product: ' + err.message);
      });
  }

  var productsUnsubscribe = null;

  function filterProducts(data) {
    var query = productSearch ? productSearch.value.trim().toLowerCase() : '';
    var statusFilter = productStatusFilter ? productStatusFilter.value : 'all';
    var typeFilter = productTypeFilter ? productTypeFilter.value : 'all';

    return data.filter(function (doc) {
      var d = doc.data() || {};
      var status = (d.status || '').toLowerCase();
      var type = (d.type || '').toLowerCase();
      
      // Apply status filter
      if (statusFilter === 'active' && status !== 'active') return false;
      if (statusFilter === 'inactive' && status !== 'inactive') return false;

      // Apply type filter
      if (typeFilter !== 'all' && type !== typeFilter) return false;

      // Apply text search
      if (!query) return true;

      var haystack = [
        d.name,
        d.category,
        d.description
      ];

      return haystack.some(function (val) {
        return (val || '').toString().toLowerCase().indexOf(query) !== -1;
      });
    });
  }

  function updateProductsView() {
    if (!productsData || !productsData.length) {
      renderProducts([]);
      if (productsInfo) productsInfo.textContent = 'No products found';
      return;
    }
    var filtered = filterProducts(productsData);
    renderProducts(filtered);
    if (productsInfo) {
      productsInfo.textContent = 'Showing ' + filtered.length + ' of ' + productsData.length + ' products (Live)';
    }
  }

  function loadProducts(forceRefresh) {
    if (!forceRefresh && productsUnsubscribe) {
      return;
    }

    if (productsUnsubscribe) {
      productsUnsubscribe();
      productsUnsubscribe = null;
    }

    setProductsLoading(true);
    productsUnsubscribe = db.collection('products')
      .orderBy('createdAt', 'desc')
      .onSnapshot(function (snap) {
        productsData = snap.docs;
        updateProductsStats(productsData);
        updateProductsView();
        setProductsLoading(false);
      }, function (err) {
        // Error loading products (suppressed)
        if (productsInfo) productsInfo.textContent = 'Failed to load products';
        setProductsLoading(false);
      });
  }

  function clearProductForm() {
    productName.value = '';
    productDescription.value = '';
    regularPrice.value = '';
    discountPrice.value = '';
    productImageUrl.value = '';
    productCategory.value = '';
    if (productType) productType.value = 'offer';
    productStatus.value = 'active';
    currentEditingProductId = null;
    productFormTitle.textContent = 'Add Product';
  }

  function showProductForm() {
    if (!productModalOverlay) return;
    productModalOverlay.classList.remove('hidden');
    // Ensure form is visible within modal
    if (productFormSection) productFormSection.classList.remove('hidden');
    clearProductForm();
  }

  function hideProductForm() {
    if (productModalOverlay) productModalOverlay.classList.add('hidden');
    clearProductForm();
  }

  function editProduct(productId, productData) {
    currentEditingProductId = productId;
    productName.value = productData.name || '';
    productDescription.value = productData.description || '';
    regularPrice.value = productData.regularPrice || '';
    discountPrice.value = productData.discountPrice || '';
    productImageUrl.value = productData.imageUrl || '';
    productCategory.value = productData.category || '';
    if (productType) productType.value = productData.type || 'offer';
    productStatus.value = productData.status || 'active';
    productFormTitle.textContent = 'Edit Product';
    // Show modal
    if (productModalOverlay) productModalOverlay.classList.remove('hidden');
    if (productFormSection) productFormSection.classList.remove('hidden');
  }

  function saveProduct() {
    

    if (!productName || !regularPrice || !discountPrice) {
      alert('Form elements not found. Please refresh the page.');
      return;
    }

    var name = productName.value.trim();
    var description = productDescription.value.trim();
    var regPrice = parseFloat(regularPrice.value);
    var discPrice = parseFloat(discountPrice.value);
    var imageUrl = productImageUrl.value.trim();
    var category = productCategory.value.trim();
    var type = productType ? productType.value : 'offer';
    var status = productStatus.value;

    

    if (!name || isNaN(regPrice) || isNaN(discPrice)) {
      alert('Please fill in product name and valid prices');
      return;
    }

    var productData = {
      name: name,
      description: description,
      regularPrice: regPrice,
      discountPrice: discPrice,
      imageUrl: imageUrl,
      category: category,
      type: type,
      status: status,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    var promise;
    if (currentEditingProductId) {
      promise = db.collection('products').doc(currentEditingProductId).update(productData);
    } else {
      productData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      promise = db.collection('products').add(productData);
    }

    saveProductBtn.disabled = true;
    saveProductBtn.textContent = 'Saving...';

    promise.then(function () {
      hideProductForm();
      showToast('Product saved');
    }).catch(function (error) {
      alert('Error saving product: ' + error.message);
    }).finally(function () {
      saveProductBtn.disabled = false;
      saveProductBtn.textContent = 'Save Product';
    });
  }
})();
