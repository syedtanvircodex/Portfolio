/* global firebase */
(function() {
  const CURRENCY = '&#2547;'; // Bangladeshi Taka symbol

  var db = firebase.firestore();
  var orderId = getOrderIdFromUrl();
  
  var orderIdEl = document.getElementById('order-id');
  var productNameEl = document.getElementById('product-name');
  var orderAmountEl = document.getElementById('order-amount');
  var customerNameEl = document.getElementById('customer-name');
  
  function getOrderIdFromUrl() {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('orderId');
  }
  
  function loadOrder() {
    if (!orderId) {
      showDefaultInfo();
      return;
    }
    
    
    db.collection('orders').doc(orderId).get()
      .then(function(doc) {
        if (!doc.exists) {
          showDefaultInfo();
          return;
        }
        
        var order = doc.data();
        displayOrder(order);
      })
      .catch(function(error) {
        // error handling: removed debug output for production
        showDefaultInfo();
      });
  }
  
  function displayOrder(order) {
    orderIdEl.textContent = orderId;
    productNameEl.textContent = order.productName || 'Unknown Product';
    var amount = (order.productPrice || 0).toLocaleString();
    orderAmountEl.innerHTML = '<span class="currency">' + CURRENCY + '</span><span class="amount">' + amount + '</span>';
    customerNameEl.textContent = order.customerName || 'Unknown Customer';
  }
  
  function showDefaultInfo() {
    orderIdEl.textContent = 'N/A';
    productNameEl.textContent = 'Product Order';
    orderAmountEl.innerHTML = '<span class="currency">' + CURRENCY + '</span><span class="amount">0</span>';
    customerNameEl.textContent = 'Customer';
  }
  
  // Load order when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadOrder);
  } else {
    loadOrder();
  }
})();
