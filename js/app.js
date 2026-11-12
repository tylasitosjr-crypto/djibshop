/**
 * DjibSHOP - Contrôleur de la Boutique Client (Storefront)
 * Expérience Client Premium, Rapide & Synchronisée en Temps Réel
 */

class ClientApp {
  constructor() {
    this.selectedCategory = "all";
    this.currentSearchQuery = "";
    this.currentSortBy = "newest";
    this.onlyInStock = false;
    this.activeProductModal = null;
    this.selectedModalSize = null;
    this.selectedModalPrice = 0;
    this.modalQuantity = 1;
    this.flashTimers = [];

    this.initElements();
    this.bindEvents();
    this.renderProducts();
    this.updateCartBadge();
    this.updateWishlistBadge();
    this.startGlobalFlashSaleTicker();
  }

  initElements() {
    // Éléments du Catalogue
    this.productsGrid = document.getElementById("products-grid-container");
    this.flashShowcaseSection = document.getElementById("flash-sale-showcase-section");
    this.flashProductsContainer = document.getElementById("flash-products-container");
    this.showcaseFlashTimer = document.getElementById("showcase-flash-timer");
    this.regularCatalogTitleBar = document.getElementById("regular-catalog-title-bar");
    this.catalogCountElem = document.getElementById("catalog-item-count");
    this.searchInput = document.getElementById("site-search-input");
    this.searchClearBtn = document.getElementById("site-search-clear");
    this.categoryNav = document.getElementById("category-nav-list");
    this.sortSelect = document.getElementById("catalog-sort-select");
    this.inStockToggle = document.getElementById("filter-in-stock-only");
    this.manualRefreshBtn = document.getElementById("btn-manual-refresh");
    this.headerWishlistBtn = document.getElementById("header-wishlist-toggle-btn");

    // Navigation Mobile
    this.mobileNavHome = document.getElementById("mobile-nav-home");
    this.mobileNavSearch = document.getElementById("mobile-nav-search");
    this.mobileNavWishlist = document.getElementById("mobile-nav-wishlist");

    // Modal Produit
    this.productModalBackdrop = document.getElementById("product-detail-modal");
    this.modalCloseBtn = document.getElementById("btn-close-product-modal");
    this.modalGalleryMainWrap = document.getElementById("modal-gallery-main-wrap");
    this.modalGalleryMain = document.getElementById("modal-gallery-main-img");
    this.modalThumbnails = document.getElementById("modal-gallery-thumbnails");
    this.modalTitle = document.getElementById("modal-product-title");
    this.modalRef = document.getElementById("modal-product-ref");
    this.modalCategoryBadge = document.getElementById("modal-category-badge");
    this.modalCurrentPrice = document.getElementById("modal-current-price");
    this.modalOldPrice = document.getElementById("modal-old-price");
    this.modalDiscountTag = document.getElementById("modal-discount-tag");
    this.modalFlashSaleBanner = document.getElementById("modal-flash-sale-banner");
    this.modalDescription = document.getElementById("modal-product-desc");
    this.modalVariantContainer = document.getElementById("modal-variant-container");
    this.modalSizeStockFeedback = document.getElementById("modal-size-stock-feedback");
    this.modalQtyInput = document.getElementById("modal-qty-input");
    this.modalQtyMinus = document.getElementById("modal-qty-minus");
    this.modalQtyPlus = document.getElementById("modal-qty-plus");
    this.modalDirectWaBtn = document.getElementById("modal-btn-direct-wa");
    this.modalAddToCartBtn = document.getElementById("modal-btn-add-cart");
    this.modalWaAppToggle = document.getElementById("modal-wa-app-toggle");
    this.modalBtnWaLabel = document.getElementById("modal-btn-wa-label");

    // Modal Info (Livraison / Guide des tailles)
    this.infoModalBackdrop = document.getElementById("info-helper-modal");
    this.infoModalCloseBtn = document.getElementById("btn-close-info-modal");
    this.infoModalBody = document.getElementById("info-modal-body");

    // Tiroir Panier (Cart Drawer)
    this.cartDrawerBackdrop = document.getElementById("cart-drawer-backdrop");
    this.cartDrawerCloseBtn = document.getElementById("cart-drawer-close");
    this.cartDrawerItemsList = document.getElementById("cart-drawer-items-list");
    this.cartDrawerSubtotal = document.getElementById("cart-drawer-subtotal");
    this.cartDrawerCountBadge = document.getElementById("cart-drawer-total-count");
    this.headerCartBtn = document.getElementById("header-cart-toggle-btn");
    this.floatingCartBtn = document.getElementById("floating-mobile-cart-btn");
    this.cartCheckoutWaBtn = document.getElementById("cart-btn-checkout-wa");
    this.cartWaAppToggle = document.getElementById("cart-wa-app-toggle");
    this.cartBtnWaLabel = document.getElementById("cart-btn-wa-label");
    this.cartCustomerName = document.getElementById("cart-customer-name");
    this.cartCustomerDistrict = document.getElementById("cart-customer-district");
    this.cartCustomerPhone = document.getElementById("cart-customer-phone");
  }

  bindEvents() {
    // Recherche en direct (cherche aussi par taille disponible !)
    if (this.searchInput) {
      this.searchInput.addEventListener("input", (e) => {
        this.currentSearchQuery = e.target.value.toLowerCase().trim();
        if (this.searchClearBtn) {
          this.searchClearBtn.style.display = this.currentSearchQuery ? "block" : "none";
        }
        this.renderProducts();
      });
    }

    if (this.searchClearBtn) {
      this.searchClearBtn.addEventListener("click", () => {
        if (this.searchInput) this.searchInput.value = "";
        this.currentSearchQuery = "";
        this.searchClearBtn.style.display = "none";
        this.renderProducts();
      });
    }

    // Catégories
    if (this.categoryNav) {
      this.categoryNav.querySelectorAll(".category-nav-item").forEach(btn => {
        btn.addEventListener("click", () => {
          this.selectCategory(btn.dataset.category);
        });
      });
    }

    // Boutons Favoris Header & Mobile
    if (this.headerWishlistBtn) {
      this.headerWishlistBtn.addEventListener("click", () => {
        this.selectCategory(this.selectedCategory === "wishlist" ? "all" : "wishlist");
        document.getElementById("catalog-anchor")?.scrollIntoView({ behavior: "smooth" });
      });
    }

    if (this.mobileNavHome) {
      this.mobileNavHome.addEventListener("click", () => {
        this.selectCategory("all");
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    if (this.mobileNavSearch) {
      this.mobileNavSearch.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => this.searchInput?.focus(), 200);
      });
    }

    if (this.mobileNavWishlist) {
      this.mobileNavWishlist.addEventListener("click", () => {
        this.selectCategory(this.selectedCategory === "wishlist" ? "all" : "wishlist");
        document.getElementById("catalog-anchor")?.scrollIntoView({ behavior: "smooth" });
      });
    }

    // Actualisation manuelle depuis Supabase
    if (this.manualRefreshBtn) {
      this.manualRefreshBtn.addEventListener("click", async () => {
        this.manualRefreshBtn.classList.add("spinning");
        await store.syncFromSupabase();
        setTimeout(() => {
          this.manualRefreshBtn.classList.remove("spinning");
        }, 400);
        window.showToast("Catalogue mis à jour en direct !", "success");
      });
    }

    // Tri
    if (this.sortSelect) {
      this.sortSelect.addEventListener("change", (e) => {
        this.currentSortBy = e.target.value;
        this.renderProducts();
      });
    }

    // Filtre En Stock
    if (this.inStockToggle) {
      this.inStockToggle.addEventListener("change", (e) => {
        this.onlyInStock = e.target.checked;
        this.renderProducts();
      });
    }

    // Modal Produit
    if (this.modalCloseBtn) {
      this.modalCloseBtn.addEventListener("click", () => this.closeProductModal());
    }
    if (this.productModalBackdrop) {
      this.productModalBackdrop.addEventListener("click", (e) => {
        if (e.target === this.productModalBackdrop) this.closeProductModal();
      });
    }

    // Modal Info
    if (this.infoModalCloseBtn) {
      this.infoModalCloseBtn.addEventListener("click", () => this.closeInfoModal());
    }
    if (this.infoModalBackdrop) {
      this.infoModalBackdrop.addEventListener("click", (e) => {
        if (e.target === this.infoModalBackdrop) this.closeInfoModal();
      });
    }

    document.querySelectorAll("[data-info-modal]").forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        this.openInfoModal(link.dataset.infoModal);
      });
    });

    document.querySelectorAll("[data-footer-cat]").forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        this.selectCategory(link.dataset.footerCat);
        document.getElementById("catalog-anchor")?.scrollIntoView({ behavior: "smooth" });
      });
    });

    // Quantité dans la modal
    if (this.modalQtyMinus) {
      this.modalQtyMinus.addEventListener("click", () => this.adjustModalQty(-1));
    }
    if (this.modalQtyPlus) {
      this.modalQtyPlus.addEventListener("click", () => this.adjustModalQty(1));
    }

    // Boutons de commande de la modal
    if (this.modalDirectWaBtn) {
      this.modalDirectWaBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.orderCurrentModalViaWhatsApp();
      });
    }
    if (this.modalAddToCartBtn) {
      this.modalAddToCartBtn.addEventListener("click", () => this.addCurrentModalToCart());
    }

    // Panier Drawer
    if (this.headerCartBtn) {
      this.headerCartBtn.addEventListener("click", () => this.openCartDrawer());
    }
    if (this.floatingCartBtn) {
      this.floatingCartBtn.addEventListener("click", () => this.openCartDrawer());
    }
    if (this.cartDrawerCloseBtn) {
      this.cartDrawerCloseBtn.addEventListener("click", () => this.closeCartDrawer());
    }
    if (this.cartDrawerBackdrop) {
      this.cartDrawerBackdrop.addEventListener("click", (e) => {
        if (e.target === this.cartDrawerBackdrop) this.closeCartDrawer();
      });
    }
    if (this.cartCheckoutWaBtn) {
      this.cartCheckoutWaBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.checkoutCartViaWhatsApp();
      });
    }

    // Mises à jour du panier
    window.addEventListener("cart-updated", () => {
      this.updateCartBadge();
      if (this.cartDrawerBackdrop && this.cartDrawerBackdrop.classList.contains("active")) {
        this.renderCartItems();
      }
    });

    // Mises à jour des favoris
    window.addEventListener("wishlist-updated", () => {
      this.updateWishlistBadge();
      this.updateCategoryCounts();
      if (this.selectedCategory === "wishlist") {
        this.renderProducts();
      }
    });

    // Synchronisation Cloud Supabase
    window.addEventListener("catalog-synced", () => {
      this.renderProducts();
    });

    // Touche Échap
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeProductModal();
        this.closeCartDrawer();
        this.closeInfoModal();
      }
    });

    // Interception universelle des boutons et liens WhatsApp pour garantir l'ouverture native
    const heroBtn = document.getElementById("hero-wa-btn");
    if (heroBtn) {
      heroBtn.addEventListener("click", (e) => {
        e.preventDefault();
        store.openWhatsApp("Bonjour DjibSHOP ! Je souhaite me renseigner sur vos articles disponibles.");
      });
    }

    document.querySelectorAll(".announcement-link, .footer-wa-link, [data-wa-direct]").forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        store.openWhatsApp("Bonjour DjibSHOP ! Je souhaite contacter votre équipe.");
      });
    });

    // Bascule et synchronisation WhatsApp Business / WhatsApp Normal
    const setupWaToggle = (container) => {
      if (!container) return;
      container.querySelectorAll(".wa-toggle-pill").forEach(pill => {
        pill.addEventListener("click", () => {
          const app = pill.dataset.app;
          store.setPreferredWhatsAppApp(app);
        });
      });
    };
    setupWaToggle(this.modalWaAppToggle);
    setupWaToggle(this.cartWaAppToggle);

    const syncWaAppDisplay = (appType) => {
      const isBiz = (appType === "business");
      document.querySelectorAll(".wa-pill-toggle").forEach(toggle => {
        toggle.querySelectorAll(".wa-toggle-pill").forEach(p => {
          p.classList.toggle("active", p.dataset.app === appType);
        });
      });
      if (this.modalBtnWaLabel) {
        this.modalBtnWaLabel.textContent = isBiz ? "Commander sur WhatsApp Business" : "Commander sur WhatsApp";
      }
      if (this.cartBtnWaLabel) {
        this.cartBtnWaLabel.textContent = isBiz ? "Finaliser sur WhatsApp Business" : "Finaliser la commande sur WhatsApp";
      }
      this.updateModalWhatsAppHref();
    };

    window.addEventListener("wa-pref-changed", (e) => {
      syncWaAppDisplay(e.detail);
    });

    syncWaAppDisplay(store.getPreferredWhatsAppApp());
  }

  selectCategory(cat) {
    this.selectedCategory = cat || "all";
    if (this.categoryNav) {
      this.categoryNav.querySelectorAll(".category-nav-item").forEach(b => {
        b.classList.toggle("active", b.dataset.category === this.selectedCategory);
      });
    }
    if (this.mobileNavHome && this.mobileNavWishlist) {
      this.mobileNavHome.classList.toggle("active", this.selectedCategory !== "wishlist");
      this.mobileNavWishlist.classList.toggle("active", this.selectedCategory === "wishlist");
    }
    this.renderProducts();
  }

  updateCategoryCounts() {
    const allProducts = store.getProducts();
    const wishlistIds = store.getWishlist();
    const counts = {
      all: allProducts.length,
      vetements: allProducts.filter(p => p.category === "vetements").length,
      chaussures: allProducts.filter(p => p.category === "chaussures").length,
      accessoires: allProducts.filter(p => p.category === "accessoires").length,
      autres: allProducts.filter(p => p.category === "autres").length,
      wishlist: allProducts.filter(p => wishlistIds.includes(p.id)).length
    };

    document.querySelectorAll("[data-cat-count]").forEach(el => {
      const cat = el.dataset.catCount;
      const val = counts[cat] || 0;
      el.textContent = val > 0 ? val : "";
      el.style.display = val > 0 ? "inline-flex" : "none";
    });
  }

  updateWishlistBadge() {
    const allIds = new Set(store.getProducts().map(p => p.id));
    const count = store.getWishlist().filter(id => allIds.size === 0 || allIds.has(id)).length;
    document.querySelectorAll(".wishlist-count-display").forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? "inline-flex" : "none";
    });
  }

  // --- COMPTE À REBOURS VENTES FLASH ---
  startGlobalFlashSaleTicker() {
    setInterval(() => {
      document.querySelectorAll(".flash-timer-display").forEach(elem => {
        const endStr = elem.dataset.end;
        if (!endStr) return;
        const diff = new Date(endStr).getTime() - Date.now();
        if (diff <= 0) {
          elem.textContent = "Offre terminée";
        } else {
          const h = Math.floor(diff / (1000 * 60 * 60));
          const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((diff % (1000 * 60)) / 1000);
          elem.textContent = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
      });
    }, 1000);
  }

  renderSkeletonCards(count = 6) {
    if (!this.productsGrid) return;
    if (this.catalogCountElem) {
      this.catalogCountElem.textContent = "Synchronisation des articles en direct...";
    }
    let html = "";
    for (let i = 0; i < count; i++) {
      html += `
        <div class="product-card skeleton-card">
          <div class="card-media-wrapper skeleton-shimmer"></div>
          <div class="card-content">
            <div class="skeleton-line skeleton-shimmer" style="width: 45%; height: 12px; margin-bottom: 8px;"></div>
            <div class="skeleton-line skeleton-shimmer" style="width: 85%; height: 18px; margin-bottom: 10px;"></div>
            <div class="skeleton-line skeleton-shimmer" style="width: 65%; height: 16px; margin-bottom: 14px;"></div>
            <div class="skeleton-line skeleton-shimmer" style="width: 55%; height: 22px; margin-bottom: 12px;"></div>
            <div class="skeleton-line skeleton-shimmer" style="width: 100%; height: 36px; border-radius: 8px;"></div>
          </div>
        </div>
      `;
    }
    this.productsGrid.innerHTML = html;
  }

  // --- RENDU DU CATALOGUE PRODUITS ---
  renderProducts() {
    if (!this.productsGrid) return;

    let products = [...store.getProducts()];
    this.updateCategoryCounts();
    this.updateWishlistBadge();

    // Si le catalogue est en cours de chargement initial depuis Supabase, afficher les cartes squelettes animées
    if (store.isLoadingCatalog && products.length === 0) {
      this.renderSkeletonCards(6);
      return;
    }

    // Filtre Catégorie ou Favoris
    if (this.selectedCategory === "wishlist") {
      const wishIds = store.getWishlist();
      products = products.filter(p => wishIds.includes(p.id));
    } else if (this.selectedCategory !== "all") {
      products = products.filter(p => p.category === this.selectedCategory);
    }

    // Filtre Recherche (titre, réf, catégorie, description, ou taille ex: "XL", "42")
    if (this.currentSearchQuery) {
      const q = this.currentSearchQuery;
      products = products.filter(p => {
        const matchText =
          (p.title && p.title.toLowerCase().includes(q)) ||
          (p.ref && p.ref.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q));
        if (matchText) return true;
        if (p.sizes && typeof p.sizes === "object") {
          return Object.keys(p.sizes).some(sizeKey => sizeKey.toLowerCase() === q);
        }
        return false;
      });
    }

    // Filtre En stock
    if (this.onlyInStock) {
      products = products.filter(p => p.totalStock > 0);
    }

    // Tri précis (avec départage par ID timestamp pour que le dernier article ajouté soit toujours en tête)
    if (this.currentSortBy === "price-asc") {
      products.sort((a, b) => a.price - b.price);
    } else if (this.currentSortBy === "price-desc") {
      products.sort((a, b) => b.price - a.price);
    } else if (this.currentSortBy === "name") {
      products.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else {
      products.sort((a, b) => {
        const dateCmp = (b.createdAt || "").localeCompare(a.createdAt || "");
        if (dateCmp !== 0) return dateCmp;
        return (b.id || "").localeCompare(a.id || "");
      });
    }

    // Compteur
    if (this.catalogCountElem) {
      const labelPrefix = this.selectedCategory === "wishlist" ? "dans vos favoris" : "disponible" + (products.length > 1 ? "s" : "");
      this.catalogCountElem.textContent = `${products.length} article${products.length > 1 ? "s" : ""} ${labelPrefix}`;
    }

    if (products.length === 0) {
      if (this.flashShowcaseSection) this.flashShowcaseSection.style.display = "none";
      if (this.regularCatalogTitleBar) this.regularCatalogTitleBar.style.display = "none";

      const isWishlistEmpty = this.selectedCategory === "wishlist";
      this.productsGrid.innerHTML = `
        <div class="empty-catalog-box">
          <div class="empty-catalog-icon">
            ${isWishlistEmpty
              ? `<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`
              : `<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`
            }
          </div>
          <h3>${isWishlistEmpty ? "Vous n'avez pas encore d'articles favoris" : "Aucun article trouvé"}</h3>
          <p>${isWishlistEmpty ? "Cliquez sur le cœur ❤️ en haut d'un article pour le retrouver facilement ici." : "Essayez d'autres mots-clés ou affichez l'ensemble du catalogue."}</p>
          <button class="action-btn action-btn-cart" id="btn-reset-filters" style="margin: 0 auto;">Voir tout le catalogue</button>
        </div>
      `;

      document.getElementById("btn-reset-filters")?.addEventListener("click", () => {
        this.currentSearchQuery = "";
        this.onlyInStock = false;
        if (this.searchInput) this.searchInput.value = "";
        if (this.searchClearBtn) this.searchClearBtn.style.display = "none";
        if (this.inStockToggle) this.inStockToggle.checked = false;
        this.selectCategory("all");
      });
      return;
    }

    // Séparation des produits Vente Flash en haut et Produits Réguliers en bas
    const flashProducts = products.filter(p => p.flashSale);
    const regularProducts = products.filter(p => !p.flashSale);

    // 1. Vitrine Ventes Flash du Jour
    if (this.flashShowcaseSection && this.flashProductsContainer) {
      if (flashProducts.length > 0) {
        this.flashShowcaseSection.style.display = "block";
        this.flashProductsContainer.innerHTML = "";
        flashProducts.forEach(prod => {
          this.flashProductsContainer.appendChild(this.createProductCard(prod));
        });

        if (this.showcaseFlashTimer) {
          const nextEnding = flashProducts.find(p => p.flashSaleEnds)?.flashSaleEnds || new Date(Date.now() + 18 * 3600 * 1000).toISOString();
          this.showcaseFlashTimer.dataset.end = nextEnding;
        }

        if (this.regularCatalogTitleBar) {
          this.regularCatalogTitleBar.style.display = regularProducts.length > 0 ? "flex" : "none";
        }
      } else {
        this.flashShowcaseSection.style.display = "none";
        if (this.regularCatalogTitleBar) {
          this.regularCatalogTitleBar.style.display = "none";
        }
      }
    }

    // 2. Grille de tous les autres articles
    this.productsGrid.innerHTML = "";
    regularProducts.forEach(product => {
      const card = this.createProductCard(product);
      this.productsGrid.appendChild(card);
    });
  }

  // --- CRÉATION DE LA CARTE PRODUIT (DESIGN E-COMMERCE HAUT DE GAMME) ---
  createProductCard(product) {
    const card = document.createElement("article");
    card.className = "product-card";
    card.dataset.id = product.id;

    const mainImage = (product.images && product.images[0]) || "";
    const photoCount = (product.images && product.images.length) || 1;
    const isOutOfStock = product.totalStock <= 0;

    // Arrière-plan Studio
    const bgMap = {
      "studio-white": "#FFFFFF",
      "studio-gray": "#F1F5F9",
      "studio-blue": "#EFF6FF"
    };
    const cardBgColor = bgMap[product.bgStyle] || "#FFFFFF";

    // Prix calculé (min price si plusieurs tailles)
    let displayPrice = product.price;
    let hasVariablePrices = false;
    if (product.sizes && typeof product.sizes === "object") {
      const prices = Object.values(product.sizes)
        .map(v => typeof v === "object" ? v.price : null)
        .filter(p => p !== null && !isNaN(p));
      if (prices.length > 0) {
        const minP = Math.min(...prices);
        const maxP = Math.max(...prices);
        displayPrice = minP;
        if (maxP > minP) hasVariablePrices = true;
      }
    }

    // Calcul remise %
    let discountPercent = 0;
    if (product.originalPrice && product.originalPrice > displayPrice) {
      discountPercent = Math.round(((product.originalPrice - displayPrice) / product.originalPrice) * 100);
    }

    // Badges & Vente Flash
    let badgeHtml = "";
    if (product.flashSale) {
      badgeHtml = `<span class="card-badge badge-flash-sale">OFFRE</span>`;
    } else if (discountPercent > 0) {
      badgeHtml = `<span class="card-badge badge-promo">-${discountPercent}%</span>`;
    } else if (product.badge && product.badge !== "Aucun") {
      const badgeClass = `badge-${product.badge.toLowerCase()}`;
      badgeHtml = `<span class="card-badge ${badgeClass}">${product.badge}</span>`;
    }

    // Bannière Compte à Rebours Flash
    let flashCountdownHtml = "";
    if (product.flashSale && product.flashSaleEnds) {
      flashCountdownHtml = `
        <div class="card-flash-timer-bar">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span class="flash-timer-display" data-end="${product.flashSaleEnds}">Calcul...</span>
        </div>
      `;
    }

    // Mini pilules de tailles (Format compact Alibaba)
    let sizesHtml = "";
    if (product.sizes && typeof product.sizes === "object") {
      const keys = Object.keys(product.sizes);
      const displayKeys = keys.slice(0, 4);
      sizesHtml = displayKeys.map(size => {
        const val = product.sizes[size];
        const stockCount = typeof val === "object" ? val.stock : val;
        const inStock = stockCount > 0;
        return `<span class="size-mini-tag ${inStock ? "" : "out"}">${size}</span>`;
      }).join("");
      if (keys.length > 4) {
        sizesHtml += `<span class="size-mini-tag">+${keys.length - 4}</span>`;
      }
    } else {
      sizesHtml = `<span class="size-mini-tag">Unique</span>`;
    }

    // Petit indicateur discret de disponibilité style Alibaba
    let stockBadgeHtml = "";
    if (isOutOfStock) {
      stockBadgeHtml = `<span class="alibaba-stock-txt out">Épuisé</span>`;
    } else {
      stockBadgeHtml = `<span class="alibaba-stock-txt">${product.totalStock} disp.</span>`;
    }

    const isWishlisted = store.isInWishlist(product.id);

    card.innerHTML = `
      <div class="card-media-wrapper" style="background-color: ${cardBgColor};">
        ${badgeHtml}
        <button type="button" class="card-wish-btn ${isWishlisted ? "active" : ""}" title="Ajouter aux favoris" aria-label="Favoris">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="${isWishlisted ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        </button>
        ${photoCount > 1 ? `<span class="card-photo-count-pill">1/${photoCount}</span>` : ""}
        <img src="${mainImage}" class="product-card-img" alt="${product.title}" loading="lazy">
        ${flashCountdownHtml}
      </div>

      <div class="card-content">
        <h3 class="card-title" title="${product.title}">${product.title}</h3>

        <div class="card-price-row">
          <div class="price-wrap">
            <span class="current-price">${hasVariablePrices ? "Dès " : ""}${store.formatPrice(displayPrice)}</span>
            ${product.originalPrice ? `<span class="original-price">${store.formatPrice(product.originalPrice)}</span>` : ""}
          </div>
        </div>

        <div class="alibaba-meta-strip">
          <div class="card-sizes-pill-list">
            ${sizesHtml}
          </div>
          ${stockBadgeHtml}
        </div>

        <div class="card-actions-row">
          <button type="button" class="btn-card-order-wa btn-quick-wa" ${isOutOfStock ? "disabled" : ""}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.06-1.08l-.29-.17-3.12.82.83-3.04-.19-.3a8.163 8.163 0 0 1-1.25-4.46c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.19.53-1.08 1.02-1.5 1.07-.39.05-.9.08-2.66-.65-2.25-.93-3.7-3.23-3.81-3.38-.11-.15-.92-1.22-.92-2.33 0-1.11.58-1.65.79-1.88.21-.23.46-.28.61-.28.15 0 .31 0 .44.01.14.01.33-.05.51.39.19.46.65 1.58.71 1.7.06.11.1.25.02.4-.08.15-.12.25-.24.39-.12.14-.25.31-.36.42-.12.12-.25.25-.11.49.14.24.62 1.02 1.33 1.65.91.81 1.68 1.06 1.92 1.18.24.12.38.1.52-.06.14-.17.6-.7.76-.94.16-.24.32-.2.53-.12.21.08 1.34.63 1.57.75.23.12.38.17.44.27.06.09.06.55-.13 1.08z"/></svg>
            <span>${isOutOfStock ? "Épuisé" : "Commander"}</span>
          </button>
          <button type="button" class="btn-card-add-cart btn-quick-cart" title="Ajouter au panier" ${isOutOfStock ? "disabled" : ""}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </button>
        </div>
      </div>
    `;

    card.addEventListener("click", (e) => {
      if (e.target.closest(".card-wish-btn") || e.target.closest(".btn-quick-wa") || e.target.closest(".btn-quick-cart")) {
        return;
      }
      this.openProductModal(product);
    });

    const quickWaBtn = card.querySelector(".btn-quick-wa");
    quickWaBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const hasSizes = product.sizes && typeof product.sizes === "object" && Object.keys(product.sizes).length > 0;
      if (!hasSizes) {
        store.createOrder(
          { name: "Client WhatsApp", district: "Djibouti", phone: "WhatsApp Direct" },
          [{ id: product.id, ref: product.ref, title: product.title, size: null, quantity: 1, price: product.price }],
          product.price,
          "En cours de collecte"
        );
        const message = store.buildDirectOrderMessage(product, null, 1, product.price);
        store.openWhatsApp(message);
      } else {
        this.openProductModal(product);
      }
    });

    const quickCartBtn = card.querySelector(".btn-quick-cart");
    quickCartBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.openProductModal(product);
    });

    const wishBtn = card.querySelector(".card-wish-btn");
    wishBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const added = store.toggleWishlist(product.id);
      wishBtn.classList.toggle("active", added);
      wishBtn.querySelector("svg").setAttribute("fill", added ? "currentColor" : "none");
      window.showToast(added ? "Ajouté aux favoris" : "Retiré des favoris", "info");
    });

    return card;
  }

  // --- MODAL DÉTAIL PRODUIT ---
  openProductModal(product) {
    this.activeProductModal = product;
    this.selectedModalSize = null;
    this.selectedModalPrice = product.price;
    this.modalQuantity = 1;

    this.modalTitle.textContent = product.title;
    this.modalRef.textContent = `Réf : ${product.ref}`;
    this.modalCategoryBadge.textContent = product.category;
    this.modalCurrentPrice.textContent = store.formatPrice(product.price);

    if (product.originalPrice && product.originalPrice > product.price) {
      this.modalOldPrice.textContent = store.formatPrice(product.originalPrice);
      this.modalOldPrice.style.display = "inline";
      const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
      const savedAmount = product.originalPrice - product.price;
      this.modalDiscountTag.textContent = `-${discount}% (Économisez ${store.formatPrice(savedAmount)})`;
      this.modalDiscountTag.style.display = "inline-block";
    } else {
      this.modalOldPrice.style.display = "none";
      this.modalDiscountTag.style.display = "none";
    }

    if (this.modalFlashSaleBanner) {
      if (product.flashSale && product.flashSaleEnds) {
        this.modalFlashSaleBanner.style.display = "flex";
        const timerElem = this.modalFlashSaleBanner.querySelector(".modal-flash-timer");
        if (timerElem) {
          timerElem.dataset.end = product.flashSaleEnds;
        }
      } else {
        this.modalFlashSaleBanner.style.display = "none";
      }
    }

    // Description intelligente si non renseignée en base
    const cleanDesc = (product.description || "").trim();
    if (cleanDesc) {
      this.modalDescription.textContent = cleanDesc;
    } else {
      this.modalDescription.textContent = `${product.title} — Article de qualité supérieure disponible immédiatement chez DjibSHOP. Tissu respirant et finitions soignées. Sélectionnez votre taille ci-dessous et commandez en 1 clic sur WhatsApp avec livraison rapide à Djibouti et paiement à la réception.`;
    }

    this.modalQtyInput.value = 1;

    const bgMap = {
      "studio-white": "#FFFFFF",
      "studio-gray": "#F1F5F9",
      "studio-blue": "#EFF6FF"
    };
    const modalBg = bgMap[product.bgStyle] || "#FFFFFF";
    if (this.modalGalleryMainWrap) {
      this.modalGalleryMainWrap.style.backgroundColor = modalBg;
    }

    const images = (product.images && product.images.length > 0) ? product.images : [];
    this.modalGalleryMain.src = images[0] || "";
    this.modalGalleryMain.alt = product.title;

    this.modalThumbnails.innerHTML = "";
    if (images.length > 1) {
      this.modalThumbnails.style.display = "flex";
      images.forEach((imgUrl, idx) => {
        const thumbBtn = document.createElement("button");
        thumbBtn.className = `modal-thumbnail-btn ${idx === 0 ? "active" : ""}`;
        thumbBtn.style.backgroundColor = modalBg;
        thumbBtn.innerHTML = `<img src="${imgUrl}" alt="Vignette ${idx + 1}">`;
        thumbBtn.addEventListener("click", () => {
          this.modalGalleryMain.src = imgUrl;
          this.modalThumbnails.querySelectorAll(".modal-thumbnail-btn").forEach(b => b.classList.remove("active"));
          thumbBtn.classList.add("active");
        });
        this.modalThumbnails.appendChild(thumbBtn);
      });
    } else {
      this.modalThumbnails.style.display = "none";
    }

    this.renderModalSizeSelector(product);
    this.updateModalWhatsAppHref();

    this.productModalBackdrop.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  renderModalSizeSelector(product) {
    this.modalVariantContainer.innerHTML = "";
    this.modalSizeStockFeedback.textContent = "";

    const hasSizes = product.sizes && typeof product.sizes === "object" && Object.keys(product.sizes).length > 0;

    if (hasSizes) {
      const isShoes = product.category === "chaussures";
      const variantTitle = isShoes ? "Choisissez votre pointure" : "Choisissez votre taille";

      let html = `
        <div class="variant-header">
          <span class="variant-title">${variantTitle} :</span>
          <button type="button" class="size-guide-inline-btn" id="btn-modal-open-size-guide">Guide des tailles</button>
        </div>
        <div class="size-options-container" id="modal-size-btn-group">
      `;

      let firstAvailableSize = null;

      Object.entries(product.sizes).forEach(([sizeKey, sizeData]) => {
        const stockCount = typeof sizeData === "object" ? sizeData.stock : sizeData;
        const sizePrice = typeof sizeData === "object" && sizeData.price ? sizeData.price : product.price;
        const inStock = stockCount > 0;

        if (inStock && !firstAvailableSize) {
          firstAvailableSize = sizeKey;
        }

        html += `
          <button type="button" class="size-choice-btn ${!inStock ? "out-of-stock" : ""}" data-size="${sizeKey}" data-stock="${stockCount}" data-price="${sizePrice}" ${!inStock ? "disabled" : ""}>
            <span class="size-name">${sizeKey}</span>
            <span class="size-price-tag">${store.formatPrice(sizePrice)}</span>
            <span class="size-badge-sub">${inStock ? `${stockCount} en stock` : "Épuisé"}</span>
          </button>
        `;
      });

      html += `</div>
        <div id="feedback-stock-text" style="margin-top: 0.5rem; font-size: 0.8125rem; font-weight: 700; color: var(--blue-700);"></div>
      `;
      this.modalVariantContainer.innerHTML = html;

      document.getElementById("btn-modal-open-size-guide")?.addEventListener("click", () => {
        this.openInfoModal("sizes");
      });

      const btnGroup = document.getElementById("modal-size-btn-group");
      const feedback = document.getElementById("feedback-stock-text");

      btnGroup.querySelectorAll(".size-choice-btn:not([disabled])").forEach(btn => {
        btn.addEventListener("click", () => {
          btnGroup.querySelectorAll(".size-choice-btn").forEach(b => b.classList.remove("selected"));
          btn.classList.add("selected");

          this.selectedModalSize = btn.dataset.size;
          const count = parseInt(btn.dataset.stock) || 0;
          const price = parseFloat(btn.dataset.price) || product.price;

          this.selectedModalPrice = price;
          this.modalCurrentPrice.textContent = store.formatPrice(price);

          feedback.textContent = `✓ Taille ${this.selectedModalSize} sélectionnée (${count} disponible${count > 1 ? "s" : ""} • ${store.formatPrice(price)})`;
          feedback.style.color = count <= 2 ? "var(--warning-amber)" : "var(--success-emerald)";

          this.modalQuantity = 1;
          this.modalQtyInput.value = 1;
          this.updateModalWhatsAppHref();
        });
      });

      if (firstAvailableSize) {
        const initialBtn = btnGroup.querySelector(`[data-size="${firstAvailableSize}"]`);
        if (initialBtn) initialBtn.click();
      }
    } else {
      const stock = product.totalStock || 0;
      this.selectedModalSize = null;
      this.selectedModalPrice = product.price;
      this.modalVariantContainer.innerHTML = `
        <div style="background: var(--slate-100); padding: 0.75rem 1rem; border-radius: var(--radius-md); font-size: 0.845rem; display: flex; align-items: center; justify-content: space-between;">
          <span style="font-weight: 700; color: var(--slate-700);">Disponibilité :</span>
          <span style="font-weight: 800; color: ${stock > 0 ? 'var(--success-emerald)' : 'var(--danger-crimson)'};">
            ${stock > 0 ? `✓ ${stock} unité(s) en stock` : 'Rupture temporaire'}
          </span>
        </div>
      `;
      this.updateModalWhatsAppHref();
    }
  }

  adjustModalQty(delta) {
    if (!this.activeProductModal) return;

    let maxStock = 99;
    if (this.selectedModalSize && this.activeProductModal.sizes) {
      const val = this.activeProductModal.sizes[this.selectedModalSize];
      maxStock = typeof val === "object" ? val.stock : (parseInt(val) || 0);
    } else {
      maxStock = parseInt(this.activeProductModal.totalStock) || 0;
    }

    if (maxStock <= 0) return;

    const nextVal = this.modalQuantity + delta;
    if (nextVal >= 1 && nextVal <= maxStock) {
      this.modalQuantity = nextVal;
      this.modalQtyInput.value = nextVal;
      this.updateModalWhatsAppHref();
    } else if (nextVal > maxStock) {
      window.showToast(`Stock maximal disponible pour cette taille : ${maxStock}`, "warning");
    }
  }

  updateModalWhatsAppHref() {
    if (!this.activeProductModal || !this.modalDirectWaBtn) return;
    const message = store.buildDirectOrderMessage(
      this.activeProductModal,
      this.selectedModalSize,
      this.modalQuantity,
      this.selectedModalPrice
    );
    const pref = store.getPreferredWhatsAppApp();
    this.modalDirectWaBtn.href = store.getWhatsAppUrl(message, pref);
    const totalPriceStr = store.formatPrice((this.selectedModalPrice || this.activeProductModal.price) * this.modalQuantity);
    if (this.modalBtnWaLabel) {
      const appName = (pref === "business") ? "WhatsApp Business" : "WhatsApp";
      this.modalBtnWaLabel.textContent = `Commander sur ${appName} (${totalPriceStr})`;
    }
  }

  orderCurrentModalViaWhatsApp() {
    if (!this.activeProductModal) return;

    const hasSizes = this.activeProductModal.sizes && Object.keys(this.activeProductModal.sizes).length > 0;
    if (hasSizes && !this.selectedModalSize) {
      const firstAvailable = Object.keys(this.activeProductModal.sizes).find(k => {
        const v = this.activeProductModal.sizes[k];
        const stock = typeof v === "object" ? v.stock : v;
        return stock > 0;
      }) || Object.keys(this.activeProductModal.sizes)[0];

      this.selectedModalSize = firstAvailable;
      const sizeVal = this.activeProductModal.sizes[firstAvailable];
      this.selectedModalPrice = typeof sizeVal === "object" && sizeVal.price ? sizeVal.price : this.activeProductModal.price;
    }

    const unitPrice = this.selectedModalPrice || this.activeProductModal.price;
    const qty = this.modalQuantity || 1;

    // Enregistrer la commande dans le tableau de bord Admin avec statut type Shein ("En cours de collecte")
    store.createOrder(
      { name: "Client WhatsApp", district: "Djibouti", phone: "WhatsApp Direct" },
      [{
        id: this.activeProductModal.id,
        ref: this.activeProductModal.ref,
        title: this.activeProductModal.title,
        size: this.selectedModalSize,
        quantity: qty,
        price: unitPrice
      }],
      unitPrice * qty,
      "En cours de collecte"
    );

    const message = store.buildDirectOrderMessage(
      this.activeProductModal, 
      this.selectedModalSize, 
      qty,
      unitPrice
    );
    const pref = store.getPreferredWhatsAppApp();
    store.openWhatsApp(message, pref);
  }

  addCurrentModalToCart() {
    if (!this.activeProductModal) return;

    const hasSizes = this.activeProductModal.sizes && Object.keys(this.activeProductModal.sizes).length > 0;
    if (hasSizes && !this.selectedModalSize) {
      window.showToast("Veuillez sélectionner une taille ou pointure", "warning");
      return;
    }

    const res = store.addToCart(
      this.activeProductModal, 
      this.selectedModalSize, 
      this.modalQuantity,
      this.selectedModalPrice
    );

    if (res.success) {
      const sizeText = this.selectedModalSize ? ` (Taille ${this.selectedModalSize})` : "";
      window.showToast(`Ajouté au panier : ${this.activeProductModal.title}${sizeText}`, "success");
      this.closeProductModal();
      this.openCartDrawer();
    } else {
      window.showToast(res.reason || "Impossible d'ajouter au panier", "warning");
    }
  }

  closeProductModal() {
    if (this.productModalBackdrop) {
      this.productModalBackdrop.classList.remove("active");
    }
    document.body.style.overflow = "";
    this.activeProductModal = null;
  }

  // --- MODAL INFO (GUIDE DES TAILLES, LIVRAISON, SUIVI) ---
  openInfoModal(type) {
    if (!this.infoModalBackdrop || !this.infoModalBody) return;

    if (type === "sizes") {
      this.infoModalBody.innerHTML = `
        <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--slate-900); margin-bottom: 0.5rem;">Guide des Tailles & Pointures</h3>
        <p style="font-size: 0.84rem; color: var(--slate-600); margin-bottom: 1.25rem;">Nos maillots et vêtements taillent normalement (coupe européenne standard). Si vous préférez une coupe ample, prenez une taille au-dessus.</p>
        <div style="overflow-x: auto; margin-bottom: 1.25rem;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.8125rem; text-align: left;">
            <thead>
              <tr style="background: var(--slate-100); color: var(--slate-900);">
                <th style="padding: 8px 10px; border: 1px solid var(--slate-200);">Taille</th>
                <th style="padding: 8px 10px; border: 1px solid var(--slate-200);">Tour de poitrine</th>
                <th style="padding: 8px 10px; border: 1px solid var(--slate-200);">Stature recommandée</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style="padding: 7px 10px; border: 1px solid var(--slate-200); font-weight:700;">S</td><td style="padding: 7px 10px; border: 1px solid var(--slate-200);">88 - 94 cm</td><td style="padding: 7px 10px; border: 1px solid var(--slate-200);">160 - 170 cm</td></tr>
              <tr><td style="padding: 7px 10px; border: 1px solid var(--slate-200); font-weight:700;">M</td><td style="padding: 7px 10px; border: 1px solid var(--slate-200);">95 - 101 cm</td><td style="padding: 7px 10px; border: 1px solid var(--slate-200);">168 - 176 cm</td></tr>
              <tr><td style="padding: 7px 10px; border: 1px solid var(--slate-200); font-weight:700;">L</td><td style="padding: 7px 10px; border: 1px solid var(--slate-200);">102 - 108 cm</td><td style="padding: 7px 10px; border: 1px solid var(--slate-200);">175 - 182 cm</td></tr>
              <tr><td style="padding: 7px 10px; border: 1px solid var(--slate-200); font-weight:700;">XL</td><td style="padding: 7px 10px; border: 1px solid var(--slate-200);">109 - 115 cm</td><td style="padding: 7px 10px; border: 1px solid var(--slate-200);">180 - 188 cm</td></tr>
              <tr><td style="padding: 7px 10px; border: 1px solid var(--slate-200); font-weight:700;">XXL</td><td style="padding: 7px 10px; border: 1px solid var(--slate-200);">116 - 123 cm</td><td style="padding: 7px 10px; border: 1px solid var(--slate-200);">184 - 195 cm</td></tr>
            </tbody>
          </table>
        </div>
        <button type="button" class="whatsapp-direct-btn" onclick="store.openWhatsApp('Bonjour DjibSHOP, j\\'ai besoin d\\'aide pour choisir ma taille.');">
          Demander conseil sur WhatsApp
        </button>
      `;
    } else if (type === "delivery") {
      this.infoModalBody.innerHTML = `
        <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--slate-900); margin-bottom: 0.5rem;">Zones de Livraison à Djibouti</h3>
        <p style="font-size: 0.84rem; color: var(--slate-600); margin-bottom: 1rem;">Nous assurons la livraison rapide dans tous les quartiers de Djibouti-Ville et Balbala :</p>
        <ul style="font-size: 0.84rem; color: var(--slate-700); line-height: 1.8; margin-bottom: 1.25rem; padding-left: 1.2rem;">
          <li><strong>Centre-Ville, Plateau, Héron, Haramous, Gabode</strong> : Livraison rapide le jour même.</li>
          <li><strong>Quartiers 1 à 7, Ambouli, Stade, Einguela</strong> : Livraison dans la journée.</li>
          <li><strong>Balbala, PK12, Hayabley, Hodan, Cheik Moussa</strong> : Livraison quotidienne.</li>
          <li><strong>Paiement à la réception</strong> : Vous vérifiez votre article avant de régler (espèces, Waafi, D-Money ou CacPay).</li>
        </ul>
        <button type="button" class="whatsapp-direct-btn" onclick="store.openWhatsApp('Bonjour DjibSHOP, je souhaite connaître les modalités de livraison pour mon quartier.');">
          Contacter le service livraison
        </button>
      `;
    } else {
      const orders = store.getOrders().slice(0, 5);
      let ordersTrackingHtml = "";
      if (orders.length > 0) {
        ordersTrackingHtml = `<div style="margin-bottom: 1.25rem; display: flex; flex-direction: column; gap: 0.65rem;">` +
          orders.map(o => {
            const itemsLabel = (o.items || []).map(i => `${i.quantity}x ${i.title}${i.size ? ` (${i.size})` : ""}`).join(", ");
            return `
              <div style="border: 1px solid var(--slate-200); border-radius: 6px; padding: 0.75rem; background: var(--slate-50);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                  <strong style="font-size: 0.8rem; color: var(--slate-900);">${o.id}</strong>
                  <span style="font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: 4px; background: #111827; color: #FFFFFF;">${o.status}</span>
                </div>
                <div style="font-size: 0.78rem; color: var(--slate-600);">${itemsLabel}</div>
              </div>
            `;
          }).join("") + `</div>`;
      }
      this.infoModalBody.innerHTML = `
        <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--slate-900); margin-bottom: 0.5rem;">Suivi de Commande</h3>
        <p style="font-size: 0.84rem; color: var(--slate-600); margin-bottom: 1rem;">Suivez l'avancement de votre commande (Collecte, Expédition, En cours de livraison, Livré) ou contactez notre équipe au <strong>+253 77 07 87 93</strong> :</p>
        ${ordersTrackingHtml}
        <button type="button" class="whatsapp-direct-btn" onclick="store.openWhatsApp('Bonjour DjibSHOP, je souhaite suivre l\\'état de ma commande.');">
          Suivre ma commande sur WhatsApp
        </button>
      `;
    }

    this.infoModalBackdrop.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  closeInfoModal() {
    if (this.infoModalBackdrop) {
      this.infoModalBackdrop.classList.remove("active");
    }
    if (!this.productModalBackdrop?.classList.contains("active")) {
      document.body.style.overflow = "";
    }
  }

  // --- PANIER CLIENT (CART DRAWER) ---
  openCartDrawer() {
    if (!this.cartDrawerBackdrop) return;
    this.renderCartItems();
    this.cartDrawerBackdrop.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  closeCartDrawer() {
    if (this.cartDrawerBackdrop) {
      this.cartDrawerBackdrop.classList.remove("active");
    }
    document.body.style.overflow = "";
  }

  updateCartBadge() {
    const count = store.getCartCount();
    document.querySelectorAll(".cart-count-display").forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? "inline-flex" : "none";
    });
  }

  renderCartItems() {
    if (!this.cartDrawerItemsList) return;

    const cart = store.getCart();
    const total = store.getCartTotal();

    if (this.cartDrawerSubtotal) {
      this.cartDrawerSubtotal.textContent = store.formatPrice(total);
    }
    if (this.cartDrawerCountBadge) {
      this.cartDrawerCountBadge.textContent = `${store.getCartCount()} articles`;
    }

    if (cart.length === 0) {
      this.cartDrawerItemsList.innerHTML = `
        <div style="text-align: center; padding: 3.5rem 1rem;">
          <div style="width: 64px; height: 64px; background: var(--slate-100); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: var(--slate-400);">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          </div>
          <h4 style="font-weight: 800; color: var(--slate-800); margin-bottom: 0.35rem;">Votre panier est vide</h4>
          <p style="font-size: 0.85rem; color: var(--slate-500); margin-bottom: 1.5rem;">Découvrez notre collection et ajoutez vos articles favoris.</p>
          <button type="button" class="action-btn action-btn-secondary" onclick="window.clientApp.closeCartDrawer();" style="margin: 0 auto;">Parcourir les articles</button>
        </div>
      `;
      return;
    }

    this.cartDrawerItemsList.innerHTML = "";

    cart.forEach((item, index) => {
      const itemEl = document.createElement("div");
      itemEl.className = "cart-item";

      itemEl.innerHTML = `
        <div class="cart-item-img-wrap" style="background: #FFFFFF;">
          <img src="${item.image}" alt="${item.title}" style="object-fit: contain; padding: 4px;">
        </div>
        <div class="cart-item-info">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-meta">
            ${item.size ? `<span class="cart-item-size-badge">Taille ${item.size}</span>` : ""}
            <span class="cart-item-unit-price">${store.formatPrice(item.price)}</span>
          </div>
          <div class="cart-item-bottom">
            <div class="cart-qty-ctrl">
              <button type="button" class="cart-qty-btn btn-qty-minus">&minus;</button>
              <span class="cart-qty-val">${item.quantity}</span>
              <button type="button" class="cart-qty-btn btn-qty-plus">&plus;</button>
            </div>
            <span class="cart-item-line-total">${store.formatPrice(item.price * item.quantity)}</span>
          </div>
        </div>
        <button type="button" class="cart-item-remove-btn" title="Supprimer">&times;</button>
      `;

      itemEl.querySelector(".btn-qty-minus").addEventListener("click", () => {
        if (item.quantity > 1) {
          store.updateCartQuantity(index, item.quantity - 1);
        } else {
          store.removeFromCart(index);
        }
      });

      itemEl.querySelector(".btn-qty-plus").addEventListener("click", () => {
        store.updateCartQuantity(index, item.quantity + 1);
      });

      itemEl.querySelector(".cart-item-remove-btn").addEventListener("click", () => {
        store.removeFromCart(index);
      });

      this.cartDrawerItemsList.appendChild(itemEl);
    });
  }

  checkoutCartViaWhatsApp() {
    const cart = store.getCart();
    if (cart.length === 0) {
      window.showToast("Votre panier est vide", "warning");
      return;
    }

    const name = this.cartCustomerName ? this.cartCustomerName.value.trim() : "";
    const district = this.cartCustomerDistrict ? this.cartCustomerDistrict.value.trim() : "";
    const phone = this.cartCustomerPhone ? this.cartCustomerPhone.value.trim() : "";

    const customerInfo = { name, district, phone };
    const total = store.getCartTotal();

    store.createOrder(customerInfo, cart, total);

    const message = store.buildCartOrderMessage(customerInfo, cart, total);
    const pref = store.getPreferredWhatsAppApp();
    store.openWhatsApp(message, pref);

    store.clearCart();
    this.closeCartDrawer();
    window.showToast("Commande transmise vers WhatsApp avec succès !", "success");
  }
}

// Système de notifications Toast
window.showToast = function(message, type = "info") {
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.className = "toast-center";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = `toast-message toast-${type}`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-fade-out");
    setTimeout(() => toast.remove(), 300);
  }, 3200);
};

document.addEventListener("DOMContentLoaded", () => {
  window.clientApp = new ClientApp();
});
