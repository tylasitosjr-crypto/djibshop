/**
 * DjibSHOP - Contrôleur de la Boutique Client (Storefront)
 * Style E-Commerce Haute Précision Alibaba & Shein
 * - Cartes compactes 2 colonnes sur mobile
 * - Vente flash avec compte à rebours interactif
 * - Prix dynamique selon la taille sélectionnée
 * - 3 Finitions Studio Fond (Blanc 100%, Doux Gris, Doux Bleu)
 * - Galerie 1 à 4 photos
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

    // Tiroir Panier (Cart Drawer)
    this.cartDrawerBackdrop = document.getElementById("cart-drawer-backdrop");
    this.cartDrawerCloseBtn = document.getElementById("cart-drawer-close");
    this.cartDrawerItemsList = document.getElementById("cart-drawer-items-list");
    this.cartDrawerSubtotal = document.getElementById("cart-drawer-subtotal");
    this.cartDrawerCountBadge = document.getElementById("cart-drawer-total-count");
    this.headerCartBtn = document.getElementById("header-cart-toggle-btn");
    this.floatingCartBtn = document.getElementById("floating-mobile-cart-btn");
    this.cartCheckoutWaBtn = document.getElementById("cart-btn-checkout-wa");
    this.cartCustomerName = document.getElementById("cart-customer-name");
    this.cartCustomerDistrict = document.getElementById("cart-customer-district");
    this.cartCustomerPhone = document.getElementById("cart-customer-phone");
  }

  bindEvents() {
    // Recherche en direct
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
        btn.addEventListener("click", (e) => {
          this.categoryNav.querySelectorAll(".category-nav-item").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          this.selectedCategory = btn.dataset.category;
          this.renderProducts();
        });
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

    // Synchronisation Cloud Supabase
    window.addEventListener("catalog-synced", () => {
      this.renderProducts();
    });

    // Touche Échap
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeProductModal();
        this.closeCartDrawer();
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

  // --- RENDU DU CATALOGUE PRODUITS ---
  renderProducts() {
    if (!this.productsGrid) return;

    let products = store.getProducts();

    // Filtre Catégorie
    if (this.selectedCategory !== "all") {
      products = products.filter(p => p.category === this.selectedCategory);
    }

    // Filtre Recherche
    if (this.currentSearchQuery) {
      products = products.filter(p => 
        p.title.toLowerCase().includes(this.currentSearchQuery) ||
        p.ref.toLowerCase().includes(this.currentSearchQuery) ||
        p.category.toLowerCase().includes(this.currentSearchQuery) ||
        (p.description && p.description.toLowerCase().includes(this.currentSearchQuery))
      );
    }

    // Filtre En stock
    if (this.onlyInStock) {
      products = products.filter(p => p.totalStock > 0);
    }

    // Tri
    if (this.currentSortBy === "price-asc") {
      products.sort((a, b) => a.price - b.price);
    } else if (this.currentSortBy === "price-desc") {
      products.sort((a, b) => b.price - a.price);
    } else if (this.currentSortBy === "name") {
      products.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      products.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    }

    // Compteur
    if (this.catalogCountElem) {
      this.catalogCountElem.textContent = `${products.length} article${products.length > 1 ? "s" : ""}`;
    }

    if (products.length === 0) {
      if (this.flashShowcaseSection) this.flashShowcaseSection.style.display = "none";
      if (this.regularCatalogTitleBar) this.regularCatalogTitleBar.style.display = "none";

      this.productsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; background: var(--white); border-radius: var(--radius-lg); border: 1px solid var(--slate-200);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--slate-400)" stroke-width="1.5" style="margin: 0 auto 1rem;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--slate-800); margin-bottom: 0.5rem;">Aucun article ne correspond à votre sélection</h3>
          <p style="font-size: 0.875rem; color: var(--slate-500); max-width: 420px; margin: 0 auto 1.5rem;">Essayez d'autres mots-clés ou réinitialisez les filtres.</p>
          <button class="action-btn action-btn-secondary" id="btn-reset-filters" style="margin: 0 auto;">Afficher tout le catalogue</button>
        </div>
      `;

      document.getElementById("btn-reset-filters")?.addEventListener("click", () => {
        this.selectedCategory = "all";
        this.currentSearchQuery = "";
        this.onlyInStock = false;
        if (this.searchInput) this.searchInput.value = "";
        if (this.inStockToggle) this.inStockToggle.checked = false;
        if (this.categoryNav) {
          this.categoryNav.querySelectorAll(".category-nav-item").forEach(b => {
            b.classList.toggle("active", b.dataset.category === "all");
          });
        }
        this.renderProducts();
      });
      return;
    }

    // Séparation des produits Vente Flash en haut et Produits Réguliers en bas (Shein Style)
    const flashProducts = products.filter(p => p.flashSale);
    const regularProducts = products.filter(p => !p.flashSale);

    // 1. Vitrine Ventes Flash du Jour en haut
    if (this.flashShowcaseSection && this.flashProductsContainer) {
      if (flashProducts.length > 0) {
        this.flashShowcaseSection.style.display = "block";
        this.flashProductsContainer.innerHTML = "";
        flashProducts.forEach(prod => {
          this.flashProductsContainer.appendChild(this.createProductCard(prod));
        });

        // Configurer le compte à rebours principal sur la fin la plus proche
        if (this.showcaseFlashTimer) {
          const nextEnding = flashProducts.find(p => p.flashSaleEnds)?.flashSaleEnds || new Date(Date.now() + 18 * 3600 * 1000).toISOString();
          this.showcaseFlashTimer.dataset.end = nextEnding;
        }

        if (this.regularCatalogTitleBar) {
          this.regularCatalogTitleBar.style.display = "flex";
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

  // --- CRÉATION DE LA CARTE PRODUIT (SHEIN / ALIBABA ULTRA-COMPACTE 2 COLONNES) ---
  createProductCard(product) {
    const card = document.createElement("article");
    card.className = "product-card";
    card.dataset.id = product.id;

    const mainImage = (product.images && product.images[0]) || "";
    const isOutOfStock = product.totalStock <= 0;

    // Arrière-plan Studio
    const bgMap = {
      "studio-white": "#FFFFFF",
      "studio-gray": "#F1F5F9",
      "studio-blue": "#EFF6FF"
    };
    const cardBgColor = bgMap[product.bgStyle] || "#FFFFFF";

    // Badges & Vente Flash
    let badgeHtml = "";
    if (product.flashSale) {
      badgeHtml = `
        <span class="card-badge badge-flash-sale">
          ⚡ FLASH
        </span>
      `;
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

    // Mini pilules de tailles Shein
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
      sizesHtml = `<span class="size-mini-tag" style="background: transparent; color: var(--slate-400); font-size: 0.6875rem;">Unique</span>`;
    }

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

    // Urgence de stock Flash Sale (Shein Style)
    let flashUrgencyHtml = "";
    if (product.flashSale) {
      flashUrgencyHtml = `
        <div class="flash-stock-urgency">
          <div class="flash-stock-bar-wrap">
            <div class="flash-stock-bar-fill" style="width: 78%;"></div>
          </div>
          <div class="flash-stock-text">
            <span>⚡ Vente Flash</span> • <span>Stock limité</span>
          </div>
        </div>
      `;
    }

    const isWishlisted = store.isInWishlist(product.id);

    // Structure de la carte compacte
    card.innerHTML = `
      <div class="card-media-wrapper" style="background-color: ${cardBgColor};">
        ${badgeHtml}
        <button type="button" class="card-wish-btn ${isWishlisted ? "active" : ""}" title="Favoris" aria-label="Favoris">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="${isWishlisted ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        </button>
        <img src="${mainImage}" class="product-card-img" alt="${product.title}" loading="lazy">
        ${flashCountdownHtml}
      </div>

      <div class="card-content">
        <div class="card-meta-line">
          <span class="card-category-tag">${product.category}</span>
          <span class="card-sku">${product.ref}</span>
        </div>

        <h3 class="card-title" title="${product.title}">${product.title}</h3>

        <div class="card-sizes-pill-list">
          ${sizesHtml}
        </div>
        ${flashUrgencyHtml}

        <div class="card-price-row">
          <div class="price-wrap">
            <span class="current-price">${hasVariablePrices ? "Dès " : ""}${store.formatPrice(displayPrice)}</span>
            ${product.originalPrice ? `<span class="original-price">${store.formatPrice(product.originalPrice)}</span>` : ""}
          </div>
        </div>

        <div class="card-actions-row">
          <button type="button" class="btn-card-order-wa btn-quick-wa" ${isOutOfStock ? "disabled" : ""}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.06-1.08l-.29-.17-3.12.82.83-3.04-.19-.3a8.163 8.163 0 0 1-1.25-4.46c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.19.53-1.08 1.02-1.5 1.07-.39.05-.9.08-2.66-.65-2.25-.93-3.7-3.23-3.81-3.38-.11-.15-.92-1.22-.92-2.33 0-1.11.58-1.65.79-1.88.21-.23.46-.28.61-.28.15 0 .31 0 .44.01.14.01.33-.05.51.39.19.46.65 1.58.71 1.7.06.11.1.25.02.4-.08.15-.12.25-.24.39-.12.14-.25.31-.36.42-.12.12-.25.25-.11.49.14.24.62 1.02 1.33 1.65.91.81 1.68 1.06 1.92 1.18.24.12.38.1.52-.06.14-.17.6-.7.76-.94.16-.24.32-.2.53-.12.21.08 1.34.63 1.57.75.23.12.38.17.44.27.06.09.06.55-.13 1.08z"/></svg>
            <span>Commander</span>
          </button>
          <button type="button" class="btn-card-add-cart btn-quick-cart" title="Ajouter au panier" ${isOutOfStock ? "disabled" : ""}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </button>
        </div>
      </div>
    `;

    // Clic pour ouvrir la modal détaillée
    card.addEventListener("click", (e) => {
      if (e.target.closest(".card-wish-btn") || e.target.closest(".btn-quick-wa") || e.target.closest(".btn-quick-cart")) {
        return;
      }
      this.openProductModal(product);
    });

    // Clic rapide WhatsApp direct (1 clic instantané pour articles sans tailles)
    const quickWaBtn = card.querySelector(".btn-quick-wa");
    quickWaBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const hasSizes = product.sizes && typeof product.sizes === "object" && Object.keys(product.sizes).length > 0;
      if (!hasSizes) {
        // Redirection directe instantanée sans étape intermédiaire
        const message = store.buildDirectOrderMessage(product, null, 1, product.price);
        store.openWhatsApp(message);
      } else {
        this.openProductModal(product);
      }
    });

    // Clic rapide Panier
    const quickCartBtn = card.querySelector(".btn-quick-cart");
    quickCartBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.openProductModal(product);
    });

    // Favoris
    const wishBtn = card.querySelector(".card-wish-btn");
    wishBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const added = store.toggleWishlist(product.id);
      wishBtn.classList.toggle("active", added);
      wishBtn.querySelector("svg").setAttribute("fill", added ? "currentColor" : "none");
      window.showToast(added ? "Ajouté à vos favoris" : "Retiré de vos favoris", "info");
    });

    return card;
  }

  // --- MODAL DÉTAIL PRODUIT AVEC TAILLE DYNAMIQUE ET PRIX PROGRESSIF ---
  openProductModal(product) {
    this.activeProductModal = product;
    this.selectedModalSize = null;
    this.selectedModalPrice = product.price;
    this.modalQuantity = 1;

    // Métadonnées
    this.modalTitle.textContent = product.title;
    this.modalRef.textContent = `Réf : ${product.ref}`;
    this.modalCategoryBadge.textContent = product.category;
    this.modalCurrentPrice.textContent = store.formatPrice(product.price);

    if (product.originalPrice) {
      this.modalOldPrice.textContent = store.formatPrice(product.originalPrice);
      this.modalOldPrice.style.display = "inline";
      const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
      this.modalDiscountTag.textContent = `-${discount}%`;
      this.modalDiscountTag.style.display = "inline-block";
    } else {
      this.modalOldPrice.style.display = "none";
      this.modalDiscountTag.style.display = "none";
    }

    // Bannière Vente Flash dans la modal
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

    this.modalDescription.textContent = product.description || "Aucune description détaillée disponible pour cet article.";
    this.modalQtyInput.value = 1;

    // Arrière-plan Studio dans la modal
    const bgMap = {
      "studio-white": "#FFFFFF",
      "studio-gray": "#F1F5F9",
      "studio-blue": "#EFF6FF"
    };
    const modalBg = bgMap[product.bgStyle] || "#FFFFFF";
    if (this.modalGalleryMainWrap) {
      this.modalGalleryMainWrap.style.backgroundColor = modalBg;
    }

    // Galerie 1 à 4 photos
    const images = (product.images && product.images.length > 0) 
      ? product.images 
      : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"];

    this.modalGalleryMain.src = images[0];
    this.modalGalleryMain.alt = product.title;

    this.modalThumbnails.innerHTML = "";
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

    // Rendu des Tailles avec Prix Dynamique
    this.renderModalSizeSelector(product);

    // Mettre à jour l'URL WhatsApp du bouton modal
    this.updateModalWhatsAppHref();

    // Afficher la modal
    this.productModalBackdrop.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  renderModalSizeSelector(product) {
    this.modalVariantContainer.innerHTML = "";
    this.modalSizeStockFeedback.textContent = "";

    const hasSizes = product.sizes && typeof product.sizes === "object" && Object.keys(product.sizes).length > 0;

    if (hasSizes) {
      const isShoes = product.category === "chaussures";
      const variantTitle = isShoes ? "Pointure disponible (37 à 45)" : "Taille de vêtement";

      let html = `
        <div class="variant-header">
          <span class="variant-title">${variantTitle} :</span>
          <span class="size-stock-feedback" id="feedback-stock-text" style="color: var(--blue-700);">Sélectionnez une option</span>
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
            <span class="size-badge-sub">${inStock ? `${stockCount} disp.` : "Épuisé"}</span>
          </button>
        `;
      });

      html += `</div>`;
      this.modalVariantContainer.innerHTML = html;

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

          feedback.textContent = `Option ${this.selectedModalSize} : ${count} en stock • ${store.formatPrice(price)}`;
          feedback.style.color = count <= 3 ? "var(--warning-amber)" : "var(--success-emerald)";

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
            ${stock > 0 ? `${stock} unité(s) en stock` : 'Rupture temporaire'}
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
      window.showToast(`Stock maximal atteint (${maxStock} unités)`, "warning");
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
    this.modalDirectWaBtn.href = store.getWhatsAppUrl(message);
  }

  orderCurrentModalViaWhatsApp() {
    if (!this.activeProductModal) return;

    const hasSizes = this.activeProductModal.sizes && Object.keys(this.activeProductModal.sizes).length > 0;
    if (hasSizes && !this.selectedModalSize) {
      // Sélectionne automatiquement la première taille disponible au lieu de bloquer l'achat
      const firstAvailable = Object.keys(this.activeProductModal.sizes).find(k => {
        const v = this.activeProductModal.sizes[k];
        const stock = typeof v === "object" ? v.stock : v;
        return stock > 0;
      }) || Object.keys(this.activeProductModal.sizes)[0];

      this.selectedModalSize = firstAvailable;
      const sizeVal = this.activeProductModal.sizes[firstAvailable];
      this.selectedModalPrice = typeof sizeVal === "object" && sizeVal.price ? sizeVal.price : this.activeProductModal.price;
    }

    const message = store.buildDirectOrderMessage(
      this.activeProductModal, 
      this.selectedModalSize, 
      this.modalQuantity,
      this.selectedModalPrice
    );
    store.openWhatsApp(message);
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
    store.openWhatsApp(message);

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
