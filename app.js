// Brew & Bean - Interactive Application Controller & Live Visual Editor
(function() {
  'use strict';

  // ==========================================
  // 1. Toast Notification System
  // ==========================================
  function showToast(message, type = 'success', duration = 3000) {
    let container = document.getElementById('bb-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'bb-toast-container';
      container.className = 'fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-xl bg-primary text-surface shadow-2xl transition-all duration-300 transform translate-y-4 opacity-0 border border-secondary/30';
    
    let icon = 'check_circle';
    if (type === 'info') icon = 'info';
    if (type === 'coffee') icon = 'local_cafe';
    if (type === 'heart') icon = 'favorite';
    if (type === 'edit') icon = 'edit';

    toast.innerHTML = `
      <span class="material-symbols-outlined text-secondary-fixed text-xl leading-none">${icon}</span>
      <span class="font-body-md text-sm font-medium text-surface">${message}</span>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-4', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });

    setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-2', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // ==========================================
  // 2. Global State & Header Badge Updates
  // ==========================================
  function getCartState() {
    try {
      const saved = localStorage.getItem('bb_cart_state');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return { count: 4, total: 102.00, items: [] };
  }

  function saveCartState(state) {
    try {
      localStorage.setItem('bb_cart_state', JSON.stringify(state));
    } catch(e) {}
    updateHeaderBadges();
  }

  function updateHeaderBadges() {
    const state = getCartState();
    
    // Update cart badge counts
    document.querySelectorAll('header a[data-path="cart"]').forEach(cartBtn => {
      const countEl = cartBtn.querySelector('.absolute');
      if (countEl) countEl.textContent = state.count;
      
      const priceEl = cartBtn.querySelector('.font-label-md');
      if (priceEl && !priceEl.classList.contains('absolute')) {
        priceEl.textContent = '$' + state.total.toFixed(2);
      }
    });

    // Wishlist badge
    const wishCount = parseInt(localStorage.getItem('bb_wishlist_count') || '2', 10);
    document.querySelectorAll('header a[data-path="wishlist"] .absolute').forEach(b => {
      b.textContent = wishCount;
    });
  }

  function addToCart(productName, price = 22.00) {
    const state = getCartState();
    state.count += 1;
    state.total += price;
    saveCartState(state);
    showToast(`Added "${productName}" to bag! ☕ Total: $${state.total.toFixed(2)}`, 'coffee');
  }

  // ==========================================
  // 3. Navigation Routes Mapping
  // ==========================================
  const routeMap = {
    'home': 'index.html',
    'shop': 'shop.html',
    'coffee': 'shop.html',
    'cups-mugs': 'shop.html',
    'signature-blends': 'shop.html',
    'pour-over-gear': 'shop.html',
    'gift-sets': 'shop.html',
    'coffee-bundles': 'shop.html',
    'about-us': 'about.html',
    'roastery-tour': 'about.html',
    'wholesale': 'about.html',
    'contact': 'contact.html',
    'cart': 'cart.html',
    'bag': 'cart.html',
    'checkout': 'checkout.html',
    'product': 'product.html'
  };

  // ==========================================
  // 4. Cart Page Interactive Logic
  // ==========================================
  function openEditPreferencesModal(lineRow) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm animate-fade-in';
    modal.innerHTML = `
      <div class="bg-surface rounded-2xl max-w-md w-full p-6 shadow-2xl border border-secondary-container flex flex-col gap-4">
        <div class="flex items-center justify-between pb-2 border-b border-surface-container-high">
          <h3 class="font-headline-sm text-lg font-bold text-primary">Edit Item Preferences</h3>
          <button id="bb-close-pref" class="text-on-surface-variant hover:text-primary material-symbols-outlined text-xl">close</button>
        </div>
        <div>
          <label class="block font-label-sm uppercase tracking-wider text-secondary font-bold mb-1.5">Grind Size</label>
          <select id="bb-pref-grind" class="w-full bg-surface-container-low text-primary p-2.5 rounded-lg border border-outline-variant focus:outline-none font-body-sm">
            <option value="Whole Bean">Whole Bean (Maximum Freshness)</option>
            <option value="Medium • Pour Over">Medium (Drip / V60 / Chemex)</option>
            <option value="Fine • Espresso">Fine (Espresso / Moka Pot)</option>
            <option value="Coarse • French Press">Coarse (French Press / Cold Brew)</option>
          </select>
        </div>
        <div>
          <label class="block font-label-sm uppercase tracking-wider text-secondary font-bold mb-1.5">Roast Profile</label>
          <select id="bb-pref-roast" class="w-full bg-surface-container-low text-primary p-2.5 rounded-lg border border-outline-variant focus:outline-none font-body-sm">
            <option value="Light Roast">Light Roast (Bright Floral & Citrus)</option>
            <option value="Medium Roast">Medium Roast (Balanced Caramel & Nut)</option>
            <option value="Dark Medium">Dark Medium (Rich Cocoa & Velvet)</option>
            <option value="Dark French">Dark French (Smoky & Bold)</option>
          </select>
        </div>
        <div>
          <label class="block font-label-sm uppercase tracking-wider text-secondary font-bold mb-1.5">Package Weight</label>
          <select id="bb-pref-size" class="w-full bg-surface-container-low text-primary p-2.5 rounded-lg border border-outline-variant focus:outline-none font-body-sm">
            <option value="12oz / 340g">Standard 12oz (340g)</option>
            <option value="2lb Bag">Reserve 2lb Bag</option>
            <option value="5lb Roastery Bulk">Roastery Bulk 5lb</option>
          </select>
        </div>
        <div class="flex items-center gap-3 pt-2">
          <button id="bb-save-pref" class="flex-1 py-2.5 rounded-xl bg-primary-container text-surface font-label-md uppercase tracking-wider font-semibold hover:bg-secondary transition-all shadow-sm">Save Changes</button>
          <button id="bb-cancel-pref" class="px-4 py-2.5 rounded-xl bg-surface-container text-on-surface font-label-md uppercase tracking-wider hover:bg-surface-container-high transition-all">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const close = () => modal.remove();
    modal.querySelector('#bb-close-pref').onclick = close;
    modal.querySelector('#bb-cancel-pref').onclick = close;

    modal.querySelector('#bb-save-pref').onclick = () => {
      const grind = modal.querySelector('#bb-pref-grind').value;
      const roast = modal.querySelector('#bb-pref-roast').value;
      const size = modal.querySelector('#bb-pref-size').value;

      const prefContainer = lineRow.querySelector('.font-body-sm');
      if (prefContainer) {
        prefContainer.innerHTML = `
          <span>Grind: <strong class="text-on-surface font-medium">${grind}</strong></span>
          <span>•</span>
          <span>Roast: <strong class="text-on-surface font-medium">${roast}</strong></span>
          <span>•</span>
          <span>Size: <strong class="text-on-surface font-medium">${size}</strong></span>
        `;
      }
      showToast('Item preferences updated! ✨', 'coffee');
      close();
    };
  }

  function setupCartPage() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPath !== 'cart.html') return;

    function recalculateCart() {
      let subtotal = 0;
      let totalItems = 0;

      // Find all line item rows in cart table
      const lineRows = document.querySelectorAll('main .bg-surface-container-lowest');
      lineRows.forEach(row => {
        if (row.closest('.lg\\:col-span-4') || row.querySelector('h2')) return;

        const cols = row.querySelectorAll('.md\\:col-span-2');
        if (cols.length >= 3) {
          const priceEl = cols[0].querySelector('.font-title-md');
          const qtyInput = cols[1].querySelector('input');
          const lineTotalEl = cols[2].querySelector('.font-title-md');

          if (priceEl && qtyInput && lineTotalEl) {
            const unitPrice = parseFloat(priceEl.textContent.replace('$', '').trim()) || 0;
            let qty = parseInt(qtyInput.value, 10);
            if (isNaN(qty) || qty < 1) qty = 1;
            qtyInput.value = qty;

            const itemTotal = unitPrice * qty;
            lineTotalEl.textContent = '$' + itemTotal.toFixed(2);
            subtotal += itemTotal;
            totalItems += qty;
          }
        }
      });

      // Update Subtotal display in Order Summary
      const subtotalDisplay = Array.from(document.querySelectorAll('span')).find(s => 
        s.textContent.includes('Items Subtotal')
      );
      if (subtotalDisplay) {
        subtotalDisplay.textContent = `Items Subtotal (${totalItems} items)`;
        const amountEl = subtotalDisplay.nextElementSibling;
        if (amountEl) amountEl.textContent = '$' + subtotal.toFixed(2);
      }

      // Check discount row
      const discountRow = Array.from(document.querySelectorAll('span')).find(s => 
        s.textContent.includes('Promo code')
      );
      let discount = 0;
      if (discountRow) {
        const discountValEl = discountRow.closest('.flex').querySelector('span:last-child');
        if (discountValEl) {
          discount = subtotal * 0.10; // 10%
          discountValEl.textContent = '-$' + discount.toFixed(2);
        }
      }

      // Tax (7%)
      const taxRow = Array.from(document.querySelectorAll('span')).find(s => 
        s.textContent.includes('Estimated Sales Tax')
      );
      let tax = subtotal * 0.07;
      if (taxRow) {
        const taxValEl = taxRow.nextElementSibling;
        if (taxValEl) taxValEl.textContent = '$' + tax.toFixed(2);
      }

      // Total
      const finalTotal = Math.max(0, subtotal + tax - discount);
      const totalDisplay = document.querySelector('.text-display-lg-mobile');
      if (totalDisplay) {
        totalDisplay.textContent = '$' + finalTotal.toFixed(2);
      }

      // Save global state
      saveCartState({ count: totalItems, total: finalTotal, items: [] });
    }

    // Add Edit Preferences button to each line row
    document.querySelectorAll('main .bg-surface-container-lowest').forEach(lineRow => {
      if (lineRow.closest('.lg\\:col-span-4') || lineRow.querySelector('h2')) return;

      const actionsDiv = lineRow.querySelector('.flex.items-center.gap-space-md');
      if (actionsDiv && !actionsDiv.querySelector('.bb-edit-pref-btn')) {
        const editBtn = document.createElement('button');
        editBtn.className = 'bb-edit-pref-btn font-label-sm text-label-sm text-secondary hover:text-primary transition-colors flex items-center gap-1';
        editBtn.type = 'button';
        editBtn.innerHTML = `<span class="material-symbols-outlined text-sm">tune</span> Edit`;
        editBtn.onclick = (e) => {
          e.preventDefault();
          openEditPreferencesModal(lineRow);
        };
        actionsDiv.prepend(editBtn);
      }
    });

    // Attach listeners to all +/- buttons in cart
    document.querySelectorAll('main button').forEach(btn => {
      const label = btn.getAttribute('aria-label') || '';
      const text = btn.textContent.trim();

      // Decrease
      if (label.includes('Decrease') || text === 'remove' || text === '-') {
        btn.onclick = (e) => {
          e.preventDefault();
          const row = btn.closest('.grid') || btn.closest('.inline-flex');
          const input = row?.querySelector('input');
          if (input) {
            let val = parseInt(input.value, 10) || 1;
            if (val > 1) {
              input.value = val - 1;
              recalculateCart();
              showToast('Updated item quantity', 'info', 1500);
            }
          }
        };
      }

      // Increase
      if (label.includes('Increase') || text === 'add' || text === '+') {
        btn.onclick = (e) => {
          e.preventDefault();
          const row = btn.closest('.grid') || btn.closest('.inline-flex');
          const input = row?.querySelector('input');
          if (input) {
            let val = parseInt(input.value, 10) || 1;
            input.value = val + 1;
            recalculateCart();
            showToast('Updated item quantity', 'info', 1500);
          }
        };
      }

      // Remove button
      if (text.includes('Remove') || btn.querySelector('.material-symbols-outlined')?.textContent.trim() === 'delete_outline') {
        btn.onclick = (e) => {
          e.preventDefault();
          const lineRow = btn.closest('.p-space-md') || btn.closest('.bg-surface-container-lowest');
          if (lineRow && !lineRow.closest('.lg\\:col-span-4')) {
            lineRow.style.transition = 'all 0.3s ease';
            lineRow.style.opacity = '0';
            lineRow.style.transform = 'translateX(-20px)';
            setTimeout(() => {
              lineRow.remove();
              recalculateCart();
              showToast('Item removed from cart 🗑️', 'info');
            }, 300);
          }
        };
      }

      // Save for Later
      if (text.includes('Save for Later') || btn.querySelector('.material-symbols-outlined')?.textContent.trim() === 'bookmark') {
        btn.onclick = (e) => {
          e.preventDefault();
          showToast('Saved for later in your favorites! 🔖', 'coffee');
        };
      }

      // Clear Bag
      if (text.includes('Clear Bag')) {
        btn.onclick = (e) => {
          e.preventDefault();
          if (confirm('Are you sure you want to clear your shopping bag?')) {
            document.querySelectorAll('main .bg-surface-container-lowest').forEach(row => {
              if (!row.closest('.lg\\:col-span-4') && !row.querySelector('h2')) {
                row.remove();
              }
            });
            recalculateCart();
            showToast('Shopping bag cleared', 'info');
          }
        };
      }

      // Promo Apply
      if (text === 'Apply' && btn.closest('.pt-space-xs')) {
        btn.onclick = (e) => {
          e.preventDefault();
          const input = btn.closest('.flex')?.querySelector('input');
          const code = input?.value.trim().toUpperCase();
          if (code === 'COFFEE10' || code === 'SAVE10' || code === 'BREW') {
            recalculateCart();
            showToast('Coupon code applied: 10% discount! 🎉', 'coffee');
          } else if (code) {
            showToast(`Promo "${code}" applied successfully!`, 'coffee');
            recalculateCart();
          }
        };
      }

      // Express checkout buttons
      if (text.includes('Apple Pay') || text.includes('PayPal') || text.includes('Google Pay')) {
        btn.onclick = (e) => {
          e.preventDefault();
          window.location.href = 'checkout.html';
        };
      }
    });

    // Directly typing quantity input
    document.querySelectorAll('main input[type="text"], main input[type="number"]').forEach(input => {
      if (input.closest('.md\\:col-span-2') || input.closest('.inline-flex')) {
        input.removeAttribute('readonly');
        input.oninput = () => recalculateCart();
        input.onchange = () => recalculateCart();
      }
    });

    // Initial recalculate
    recalculateCart();
  }

  // ==========================================
  // 5. Shop Page Filters & Product Card Interactivity
  // ==========================================
  function setupShopPage() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPath !== 'shop.html' && currentPath !== 'index.html') return;

    // Filter Chips on shop / home
    const filterTabs = document.querySelectorAll('.filter-tab, .category-chip, .roast-pill');
    filterTabs.forEach(tab => {
      tab.onclick = (e) => {
        e.preventDefault();
        const tabText = tab.textContent.trim().toLowerCase();
        
        // Update styling
        const siblings = tab.parentElement.querySelectorAll('button');
        siblings.forEach(s => {
          s.classList.remove('bg-primary-container', 'text-surface', 'bg-secondary-container', 'text-on-secondary-container');
          s.classList.add('bg-surface-container', 'text-on-surface');
        });
        tab.classList.remove('bg-surface-container', 'text-on-surface');
        tab.classList.add('bg-primary-container', 'text-surface');

        // Filter products in grid
        const cards = document.querySelectorAll('main .grid > div');
        let matchCount = 0;
        cards.forEach(card => {
          const text = card.textContent.toLowerCase();
          const isCategoryOrAll = tabText.includes('all') || text.includes(tabText);
          if (isCategoryOrAll) {
            card.style.display = '';
            matchCount++;
          } else {
            card.style.display = 'none';
          }
        });

        showToast(`Filtered by "${tab.textContent.trim()}" (${matchCount} items)`, 'coffee', 1500);
      };
    });

    // Make product cards clickable to open product.html
    const cards = document.querySelectorAll('main .grid > div');
    cards.forEach(card => {
      const hasImg = card.querySelector('img');
      const hasPrice = card.textContent.includes('$');
      if (hasImg && hasPrice) {
        card.style.cursor = 'pointer';
        card.onclick = (e) => {
          if (isEditModeActive) return;
          if (e.target.closest('button') || e.target.closest('a')) return;
          window.location.href = 'product.html';
        };
      }
    });

    // Add to Bag buttons on cards
    document.querySelectorAll('main button').forEach(btn => {
      const text = btn.textContent.trim().toLowerCase();
      const isAddBtn = text.includes('add to bag') || text.includes('quick add') || btn.classList.contains('quick-add-btn');

      if (isAddBtn) {
        btn.onclick = (e) => {
          e.stopPropagation();
          e.preventDefault();
          
          const card = btn.closest('.grid > div') || btn.closest('.relative');
          const titleEl = card?.querySelector('h3, h4, .font-title-md, .font-headline-sm');
          const priceEl = card?.querySelector('.font-title-md, .font-headline-sm, span');
          const title = titleEl ? titleEl.textContent.trim() : 'Artisanal Coffee Roast';
          
          let price = 22.00;
          if (priceEl && priceEl.textContent.includes('$')) {
            const match = priceEl.textContent.match(/\$([0-9]+(\.[0-9]{2})?)/);
            if (match) price = parseFloat(match[1]);
          }

          // Visual button feedback
          const originalHTML = btn.innerHTML;
          btn.innerHTML = `<span class="material-symbols-outlined text-base leading-none animate-spin">sync</span> Adding...`;
          btn.disabled = true;

          setTimeout(() => {
            btn.innerHTML = `<span class="material-symbols-outlined text-base leading-none">done</span> Added!`;
            btn.classList.add('bg-emerald-800');
            addToCart(title, price);

            setTimeout(() => {
              btn.innerHTML = originalHTML;
              btn.classList.remove('bg-emerald-800');
              btn.disabled = false;
            }, 1500);
          }, 400);
        };
      }

      // Wishlist buttons on cards
      if (btn.classList.contains('wishlist-btn') || btn.getAttribute('aria-label')?.includes('Wishlist')) {
        btn.onclick = (e) => {
          e.stopPropagation();
          e.preventDefault();
          const icon = btn.querySelector('.material-symbols-outlined');
          if (icon) {
            const isFilled = icon.style.fontVariationSettings?.includes('1') || icon.classList.contains('text-rose-600');
            if (isFilled) {
              icon.style.fontVariationSettings = "'FILL' 0";
              icon.classList.remove('text-rose-600');
              showToast('Removed from Wishlist', 'info');
            } else {
              icon.style.fontVariationSettings = "'FILL' 1";
              icon.classList.add('text-rose-600');
              let cur = parseInt(localStorage.getItem('bb_wishlist_count') || '2', 10);
              localStorage.setItem('bb_wishlist_count', cur + 1);
              updateHeaderBadges();
              showToast('Saved to Wishlist! ❤️', 'heart');
            }
          }
        };
      }
    });

    // View switcher (Grid vs List)
    const viewButtons = document.querySelectorAll('button .material-symbols-outlined');
    viewButtons.forEach(icon => {
      if (icon.textContent === 'grid_view' || icon.textContent === 'view_list') {
        const btn = icon.closest('button');
        btn.onclick = (e) => {
          e.preventDefault();
          const grid = document.querySelector('main .grid');
          if (!grid) return;
          if (icon.textContent === 'view_list') {
            grid.className = 'flex flex-col gap-6';
            showToast('Switched to List View', 'info', 1200);
          } else {
            grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter';
            showToast('Switched to Grid View', 'info', 1200);
          }
        };
      }
    });
  }

  // ==========================================
  // 6. Product Detail Page Enhancements
  // ==========================================
  function setupProductPage() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPath !== 'product.html') return;

    // Enhance gallery thumbnails to swap source
    const thumbBtns = document.querySelectorAll('.thumbnail-btn');
    thumbBtns.forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        const mainImg = document.getElementById('mainProductImage');
        const thumbImg = btn.querySelector('img');
        if (mainImg && thumbImg) {
          mainImg.style.opacity = '0.4';
          thumbBtns.forEach(b => {
            b.classList.remove('ring-2', 'ring-primary-container');
            b.classList.add('opacity-70');
          });
          btn.classList.remove('opacity-70');
          btn.classList.add('ring-2', 'ring-primary-container');
          setTimeout(() => {
            mainImg.src = thumbImg.src;
            mainImg.style.opacity = '1';
          }, 150);
        }
      };
    });

    // Quantity Input typing directly
    const qtyInput = document.getElementById('qtyInput');
    if (qtyInput) {
      qtyInput.removeAttribute('readonly');
      qtyInput.oninput = () => {
        let val = parseInt(qtyInput.value, 10);
        if (isNaN(val) || val < 1) val = 1;
        const basePrice = 46.00;
        const total = (basePrice * val).toFixed(2);
        const display = document.getElementById('displayPrice');
        const btnPrice = document.getElementById('cartBtnPrice');
        if (display) display.textContent = '$' + total;
        if (btnPrice) btnPrice.textContent = '$' + total;
      };
    }

    // Buy Now button directly to checkout
    document.querySelectorAll('button').forEach(btn => {
      if (btn.textContent.includes('Instant Buy') || btn.textContent.includes('Buy Now')) {
        btn.onclick = (e) => {
          e.preventDefault();
          addToCart('Reserve Pairing Bundle', 46.00);
          window.location.href = 'checkout.html';
        };
      }
    });
  }

  // ==========================================
  // 7. Checkout Page Enhancements
  // ==========================================
  function setupCheckoutPage() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPath !== 'checkout.html') return;

    // Payment Tabs (Credit Card, Apple Pay, PayPal, etc.)
    const paymentTabs = document.querySelectorAll('.grid-cols-3 button');
    paymentTabs.forEach(tab => {
      tab.onclick = (e) => {
        e.preventDefault();
        paymentTabs.forEach(t => {
          t.classList.remove('bg-surface-container-lowest', 'text-primary', 'shadow-sm');
          t.classList.add('text-on-surface-variant');
        });
        tab.classList.remove('text-on-surface-variant');
        tab.classList.add('bg-surface-container-lowest', 'text-primary', 'shadow-sm');
        showToast(`Payment method selected: ${tab.textContent.trim()}`, 'info', 1500);
      };
    });

    // Discount code apply button in checkout
    document.querySelectorAll('button').forEach(btn => {
      if (btn.textContent.trim() === 'Apply' && btn.closest('.flex')) {
        btn.onclick = (e) => {
          e.preventDefault();
          showToast('Discount code COFFEE10 applied! (10% saved)', 'coffee');
        };
      }
    });
  }

  // ==========================================
  // 8. Order Placed Success Modal
  // ==========================================
  function showOrderSuccessModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-primary/60 backdrop-blur-sm animate-fade-in';
    modal.innerHTML = `
      <div class="bg-surface rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-secondary-container text-center flex flex-col items-center gap-4">
        <div class="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 shadow-inner">
          <span class="material-symbols-outlined text-4xl">check_circle</span>
        </div>
        <h2 class="font-headline-md text-2xl md:text-3xl font-bold text-primary">Order Confirmed!</h2>
        <p class="font-label-sm uppercase tracking-widest text-secondary font-semibold">Order #BB-${Math.floor(100000 + Math.random() * 900000)}</p>
        <p class="font-body-md text-on-surface-variant max-w-md leading-relaxed">
          Thank you for choosing Brew & Bean. Your freshly roasted coffee and handcrafted pieces are being prepared with care. We've sent the receipt to your email.
        </p>
        <div class="w-full bg-surface-container-low rounded-xl p-4 my-2 flex items-center justify-between text-left font-body-sm text-sm">
          <div>
            <span class="block font-semibold text-primary">Estimated Delivery</span>
            <span class="text-on-surface-variant">2-3 business days (Free Artisanal Delivery)</span>
          </div>
          <span class="material-symbols-outlined text-2xl text-secondary">local_shipping</span>
        </div>
        <div class="flex items-center gap-4 w-full pt-2">
          <a href="index.html" class="flex-1 py-3 px-4 rounded-xl bg-primary-container text-surface hover:bg-secondary transition-all font-label-md text-center uppercase tracking-wider font-semibold shadow-md">
            Back to Home
          </a>
          <a href="shop.html" class="flex-1 py-3 px-4 rounded-xl bg-surface border border-outline-variant text-primary hover:bg-surface-container transition-all font-label-md text-center uppercase tracking-wider font-semibold">
            Continue Shopping
          </a>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Reset cart on successful checkout
    saveCartState({ count: 0, total: 0.00, items: [] });
  }

  // ==========================================
  // 9. LIVE VISUAL CONTENT EDITOR ("✏️ Edit Mode")
  // ==========================================
  let isEditModeActive = false;
  const pageStorageKey = 'bb_edited_content_' + (window.location.pathname.split('/').pop() || 'index.html');

  function restoreSavedPageEdits() {
    try {
      const saved = localStorage.getItem(pageStorageKey);
      if (saved) {
        const main = document.querySelector('main');
        if (main) {
          main.innerHTML = saved;
        }
      }
    } catch(e) {}
  }

  function toggleLiveEditMode() {
    isEditModeActive = !isEditModeActive;
    const editableElements = document.querySelectorAll('main h1, main h2, main h3, main h4, main p, main span:not(.material-symbols-outlined), main a, main button, main label');

    const toggleBtn = document.getElementById('bb-edit-toggle-btn');
    const saveBtn = document.getElementById('bb-edit-save-btn');
    const resetBtn = document.getElementById('bb-edit-reset-btn');

    if (isEditModeActive) {
      // Turn ON
      document.body.classList.add('bb-editing-active');
      editableElements.forEach(el => {
        el.setAttribute('contenteditable', 'true');
        el.setAttribute('spellcheck', 'false');
      });

      if (toggleBtn) {
        toggleBtn.innerHTML = `<span class="material-symbols-outlined text-base">check</span> <span>Editing ON</span>`;
        toggleBtn.className = 'px-3.5 py-2 rounded-xl bg-amber-600 text-white font-label-sm text-xs uppercase tracking-wider font-bold shadow-lg flex items-center gap-1.5 transition-all';
      }
      if (saveBtn) saveBtn.classList.remove('hidden');
      if (resetBtn) resetBtn.classList.remove('hidden');

      showToast('✏️ Edit Mode ON: Click any text, price, or heading to edit directly!', 'edit', 4000);
    } else {
      // Turn OFF
      document.body.classList.remove('bb-editing-active');
      editableElements.forEach(el => {
        el.removeAttribute('contenteditable');
      });

      if (toggleBtn) {
        toggleBtn.innerHTML = `<span class="material-symbols-outlined text-base">edit</span> <span>Edit Page Text</span>`;
        toggleBtn.className = 'px-3.5 py-2 rounded-xl bg-primary text-surface font-label-sm text-xs uppercase tracking-wider font-bold shadow-lg flex items-center gap-1.5 hover:bg-secondary transition-all';
      }
      if (saveBtn) saveBtn.classList.add('hidden');
      if (resetBtn) resetBtn.classList.add('hidden');

      showToast('Edit Mode OFF', 'info');
    }
  }

  function saveLiveEdits() {
    const main = document.querySelector('main');
    if (main) {
      main.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
      localStorage.setItem(pageStorageKey, main.innerHTML);
      showToast('💾 All edits saved! Changes will persist on reload.', 'coffee', 3000);
      toggleLiveEditMode();
    }
  }

  function resetLiveEdits() {
    if (confirm('Reset page to original text and discard all custom edits?')) {
      localStorage.removeItem(pageStorageKey);
      window.location.reload();
    }
  }

  function createLiveEditToolbar() {
    if (document.getElementById('bb-edit-toolbar')) return;

    // Inject styles for edit mode hover highlight
    const style = document.createElement('style');
    style.textContent = `
      body.bb-editing-active [contenteditable="true"]:hover {
        outline: 2px dashed #C58B55 !important;
        outline-offset: 3px !important;
        cursor: text !important;
        background-color: rgba(197, 139, 85, 0.08) !important;
      }
      body.bb-editing-active a, body.bb-editing-active button {
        cursor: text !important;
      }
    `;
    document.head.appendChild(style);

    const toolbar = document.createElement('div');
    toolbar.id = 'bb-edit-toolbar';
    toolbar.className = 'fixed bottom-6 left-6 z-[9999] flex items-center gap-2 p-1.5 rounded-2xl bg-surface/95 backdrop-blur-md shadow-2xl border border-secondary/20 transition-all';

    toolbar.innerHTML = `
      <button id="bb-edit-toggle-btn" class="px-3.5 py-2 rounded-xl bg-primary text-surface font-label-sm text-xs uppercase tracking-wider font-bold shadow-lg flex items-center gap-1.5 hover:bg-secondary transition-all" type="button" title="Toggle inline text editing">
        <span class="material-symbols-outlined text-base">edit</span>
        <span>Edit Page Text</span>
      </button>
      <button id="bb-edit-save-btn" class="hidden px-3.5 py-2 rounded-xl bg-emerald-800 text-white font-label-sm text-xs uppercase tracking-wider font-bold shadow-md flex items-center gap-1 hover:bg-emerald-900 transition-all" type="button" title="Save changes">
        <span class="material-symbols-outlined text-base">save</span>
        <span>Save</span>
      </button>
      <button id="bb-edit-reset-btn" class="hidden px-2.5 py-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high font-label-sm text-xs uppercase tracking-wider transition-all" type="button" title="Reset to original">
        <span class="material-symbols-outlined text-base">restart_alt</span>
      </button>
    `;

    document.body.appendChild(toolbar);

    document.getElementById('bb-edit-toggle-btn').onclick = toggleLiveEditMode;
    document.getElementById('bb-edit-save-btn').onclick = saveLiveEdits;
    document.getElementById('bb-edit-reset-btn').onclick = resetLiveEdits;
  }

  // ==========================================
  // 10. Navigation & Standard Route Interception
  // ==========================================
  function setupNavigation() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    // Handle all data-path elements
    document.querySelectorAll('[data-path]').forEach(el => {
      const pathKey = el.getAttribute('data-path');
      if (routeMap[pathKey]) {
        el.setAttribute('href', routeMap[pathKey]);
      } else if (pathKey === 'wishlist') {
        el.onclick = (e) => {
          if (isEditModeActive) return;
          e.preventDefault();
          showToast('Wishlist: 2 artisanal items saved ❤️', 'heart');
        };
      } else if (pathKey === 'account') {
        el.onclick = (e) => {
          if (isEditModeActive) return;
          e.preventDefault();
          showToast('Customer Account: Logged in as Roastery Member ☕', 'coffee');
        };
      } else if (['privacy-policy', 'terms-of-service', 'accessibility', 'shipping-returns', 'faq', 'brewing-guides', 'track-order', 'journal'].includes(pathKey)) {
        el.onclick = (e) => {
          if (isEditModeActive) return;
          e.preventDefault();
          showToast(`Opening ${el.textContent.trim()} section...`, 'info');
        };
      }
    });

    // Update active nav link styling in header
    const navLinks = document.querySelectorAll('header nav a');
    navLinks.forEach(link => {
      const linkPath = link.getAttribute('data-path');
      
      const isHome = (currentPath === '' || currentPath === 'index.html') && linkPath === 'home';
      const isShop = currentPath === 'shop.html' && (linkPath === 'shop' || linkPath === 'coffee');
      const isAbout = currentPath === 'about.html' && linkPath === 'about-us';
      const isContact = currentPath === 'contact.html' && linkPath === 'contact';

      if (isHome || isShop || isAbout || isContact) {
        link.className = 'uppercase tracking-wider transition-colors text-primary font-semibold border-b-2 border-primary-container pb-1';
        link.setAttribute('aria-current', 'page');
      } else {
        link.className = 'font-label-md text-label-md uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors';
        link.removeAttribute('aria-current');
      }
    });

    // Logo click handling
    document.querySelectorAll('header a[data-path="home"]').forEach(logo => {
      logo.setAttribute('href', 'index.html');
    });

    // Return to Cart buttons in checkout
    document.querySelectorAll('a').forEach(a => {
      const text = a.textContent.toLowerCase();
      if (text.includes('return to cart') || text.includes('back to cart')) {
        a.setAttribute('href', 'cart.html');
      } else if (text.includes('continue shopping') || text.includes('explore collection')) {
        a.setAttribute('href', 'shop.html');
      }
    });

    // Proceed to Checkout buttons
    document.querySelectorAll('button, a').forEach(el => {
      const text = el.textContent.trim();
      if (text.includes('Proceed to Checkout') || text.includes('PROCEED TO CHECKOUT')) {
        el.onclick = (e) => {
          if (isEditModeActive) return;
          e.preventDefault();
          window.location.href = 'checkout.html';
        };
      }
    });

    // Checkout page Complete Order button
    if (currentPath === 'checkout.html') {
      const completeOrderBtn = Array.from(document.querySelectorAll('button')).find(b => 
        b.textContent.includes('COMPLETE ORDER') || b.textContent.includes('Complete Order')
      );
      if (completeOrderBtn) {
        completeOrderBtn.onclick = (e) => {
          if (isEditModeActive) return;
          e.preventDefault();
          showOrderSuccessModal();
        };
      }
    }

    // Search button
    document.querySelectorAll('button').forEach(btn => {
      if (btn.querySelector('.material-symbols-outlined')?.textContent.trim() === 'search') {
        btn.onclick = (e) => {
          if (isEditModeActive) return;
          e.preventDefault();
          showToast('Search: Try searching for "Ethiopia", "Espresso", or "Ceramic Mugs" 🔍', 'info');
        };
      }
    });

    // Newsletter subscribe forms
    document.querySelectorAll('form').forEach(form => {
      form.onsubmit = (e) => {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        if (input && input.value) {
          showToast(`Subscribed ${input.value} to Brew & Bean updates! ☕`, 'coffee');
          input.value = '';
        } else {
          showToast('Please enter a valid email address.', 'info');
        }
      };
    });
  }

  // ==========================================
  // 11. Master Initialization
  // ==========================================
  function init() {
    restoreSavedPageEdits();
    setupNavigation();
    updateHeaderBadges();
    setupCartPage();
    setupShopPage();
    setupProductPage();
    setupCheckoutPage();
    createLiveEditToolbar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.BB = {
    showToast,
    showOrderSuccessModal,
    addToCart,
    toggleLiveEditMode,
    saveLiveEdits,
    resetLiveEdits
  };
})();
