/**
 * DjibSHOP - Contrôleur de la Boutique Client (Storefront)
 * Style E-Commerce Haute Précision (Inspiré de Shein / Alibaba)
 * Devise: FDJ | WhatsApp Direct: +253 77078793 | Service 24h/7
 */

class ClientApp {
  constructor() {
    this.selectedCategory = "all";
    this.currentSearchQuery = "";
    this.currentSortBy = "newest";
    this.onlyInStock = false;
    this.activeProductModal = null;
    this.selectedModalSize = null;
    this.modalQuantity = 1;

    this.initElements();
    this.bindEvents();
    this.renderProducts();
    this.updateCartBadge();
  }

  initElements() {
    // Éléments du Catalogue
    this.productsGrid = document.getElementById("products-grid-container");
    this.catalogCountElem = document.getElementById("catalog-item-count");
    this.searchInput = document.getElementById("site-search-input");
    this.searchClearBtn = document.getElementById("site-search-clear");
    this.categoryNav = document.getElementById("category-nav-list");
    this.sortSelect = document.getElementById("catalog-sort-select");
    this.inStockToggle = document.getElementById("filter-in-stock-only");

    // Modal Produit
    this.productModalBackdrop = document.getElementById("product-detail-modal");
    this.modalCloseBtn = document.getElementById("btn-close-product-modal");
    this.modalGalleryMain = document.getElementById("modal-gallery-main-img");
    this.modalThumbnails = document.getElementById("modal-gallery-thumbnails");
    this.modalTitle = document.getElementById("modal-product-title");
    this.modalRef = document.getElementById("modal-product-ref");
    this.modalCategoryBadge = document.getElementById("modal-category-badge");
    this.modalCurrentPrice = document.getElementById("modal-current-price");
    this.modalOldPrice = document.getElementById("modal-old-price");
    this.modalDiscountTag = document.getElementById("modal-discount-tag");
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
    this.cartCustomerPhone = document.getElementById("cart-customer-phone");
    this.cartCustomerDistrict = document.getElementById("cart-customer-district");

    // Bouton Admin & Mobile
    this.btnOpenAdmin = document.getElementById("btn-open-admin-gate");
    this.mobileAdminBtn = document.getElementById("mobile-nav-admin-btn");
    this.mobileSearchToggle = document.getElementById("mobile-search-toggle");
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
        this.searchInput.value = "";
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

    // Boutons de la modal
    if (this.modalDirectWaBtn) {
      this.modalDirectWaBtn.addEventListener("click", () => this.orderCurrentModalViaWhatsApp());
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
      this.cartCheckoutWaBtn.addEventListener("click", () => this.checkoutCartViaWhatsApp());
    }

    // Écoute des mises à jour du panier
    window.addEventListener("cart-updated", () => {
      this.updateCartBadge();
      if (this.cartDrawerBackdrop.classList.contains("active")) {
        this.renderCartItems();
      }
    });

    // Touche Échap pour fermer les modales
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeProductModal();
        this.closeCartDrawer();
      }
    });
  }

  // --- RENDU DES PRODUITS ---
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
      // Nouveautés par défaut
      products.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    }

    // Mise à jour du compteur
    if (this.catalogCountElem) {
      this.catalogCountElem.textContent = `${products.length} article${products.length > 1 ? "s" : ""}`;
    }

    if (products.length === 0) {
      this.productsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; background: var(--white); border-radius: var(--radius-lg); border: 1px solid var(--slate-200);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--slate-400)" stroke-width="1.5" style="margin: 0 auto 1rem;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--slate-800); margin-bottom: 0.5rem;">Aucun article ne correspond à votre sélection</h3>
          <p style="font-size: 0.875rem; color: var(--slate-500); max-width: 420px; margin: 0 auto 1.5rem;">Essayez d'autres mots-clés ou réinitialisez les filtres de recherche.</p>
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

    this.productsGrid.innerHTML = "";

    products.forEach(product => {
      const card = this.createProductCard(product);
      this.productsGrid.appendChild(card);
    });
  }

  createProductCard(product) {
    const card = document.createElement("article");
    card.className = "product-card";
    card.dataset.id = product.id;

    const mainImage = (product.images && product.images[0]) || "";
    const isOutOfStock = product.totalStock <= 0;
    const isLowStock = product.totalStock > 0 && product.totalStock <= 5;

    // Badges de statut
    let badgeHtml = "";
    if (product.badge && product.badge !== "Aucun") {
      const badgeClass = `badge-${product.badge.toLowerCase()}`;
      badgeHtml = `<span class="card-badge ${badgeClass}">${product.badge}</span>`;
    }

    // Mini pilules de tailles pour Shein / Alibaba experience
    let sizesHtml = "";
    if (product.sizes && typeof product.sizes === "object") {
      const keys = Object.keys(product.sizes);
      const displayKeys = keys.slice(0, 5); // montrer jusqu'à 5 tailles
      sizesHtml = displayKeys.map(size => {
        const inStock = product.sizes[size] > 0;
        return `<span class="size-mini-tag ${inStock ? "" : "out"}">${size}</span>`;
      }).join("");
      if (keys.length > 5) {
        sizesHtml += `<span class="size-mini-tag">+${keys.length - 5}</span>`;
      }
    } else {
      sizesHtml = `<span class="size-mini-tag" style="background: transparent; color: var(--slate-500); font-size: 0.725rem;">Taille unique</span>`;
    }

    // Indicateur de stock
    let stockIndicatorHtml = "";
    if (isOutOfStock) {
      stockIndicatorHtml = `<span class="card-stock-status stock-out"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>Rupture de stock</span>`;
    } else if (isLowStock) {
      stockIndicatorHtml = `<span class="card-stock-status stock-low"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>Plus que ${product.totalStock} restants</span>`;
    } else {
      stockIndicatorHtml = `<span class="card-stock-status stock-in"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>En stock</span>`;
    }

    const isWishlisted = store.isInWishlist(product.id);

    // STYLE STUDIO SHEIN / ALIBABA : Fond blanc pur avec objet centré et soigné
    card.innerHTML = `
      <div class="card-media-wrapper" style="background: #FFFFFF; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid var(--slate-100); padding: 12px;">
        ${badgeHtml}
        <button type="button" class="card-wish-btn ${isWishlisted ? "active" : ""}" title="Ajouter aux favoris" aria-label="Favoris">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="${isWishlisted ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        </button>
        <img src="${mainImage}" class="product-card-img" style="object-fit: contain; width: 100%; height: 100%; max-height: 230px;" alt="${product.title}" loading="lazy">
        <div class="card-overlay-actions">
          <button type="button" class="card-quick-view-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            Aperçu rapide
          </button>
        </div>
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

        <div class="card-price-row">
          <span class="current-price">${store.formatPrice(product.price)}</span>
          ${product.originalPrice ? `<span class="original-price">${store.formatPrice(product.originalPrice)}</span>` : ""}
        </div>

        ${stockIndicatorHtml}

        <div class="card-actions-row">
          <button type="button" class="btn-card-order-wa btn-quick-wa" ${isOutOfStock ? "disabled" : ""}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.06-1.08l-.29-.17-3.12.82.83-3.04-.19-.3a8.163 8.163 0 0 1-1.25-4.46c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.19.53-1.08 1.02-1.5 1.07-.39.05-.9.08-2.66-.65-2.25-.93-3.7-3.23-3.81-3.38-.11-.15-.92-1.22-.92-2.33 0-1.11.58-1.65.79-1.88.21-.23.46-.28.61-.28.15 0 .31 0 .44.01.14.01.33-.05.51.39.19.46.65 1.58.71 1.7.06.11.1.25.02.4-.08.15-.12.25-.24.39-.12.14-.25.31-.36.42-.12.12-.25.25-.11.49.14.24.62 1.02 1.33 1.65.91.81 1.68 1.06 1.92 1.18.24.12.38.1.52-.06.14-.17.6-.7.76-.94.16-.24.32-.2.53-.12.21.08 1.34.63 1.57.75.23.12.38.17.44.27.06.09.06.55-.13 1.08z"/></svg>
            Commander WhatsApp
          </button>
          <button type="button" class="btn-card-add-cart btn-quick-cart" title="Ajouter au panier" ${isOutOfStock ? "disabled" : ""}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </button>
        </div>
      </div>
    `;

    // Événements de la carte
    card.querySelector(".product-card-img").addEventListener("click", () => this.openProductModal(product));
    card.querySelector(".card-title").addEventListener("click", () => this.openProductModal(product));
    card.querySelector(".card-quick-view-btn").addEventListener("click", () => this.openProductModal(product));

    // Bouton WhatsApp direct
    card.querySelector(".btn-quick-wa").addEventListener("click", (e) => {
      e.stopPropagation();
      this.openProductModal(product); // Ouvre la modal pour confirmer la taille si besoin
    });

    // Bouton Ajout Panier direct
    card.querySelector(".btn-quick-cart").addEventListener("click", (e) => {
      e.stopPropagation();
      if (product.sizes && Object.keys(product.sizes).length > 0) {
        // Nécessite de choisir la taille
        this.openProductModal(product);
        window.showToast("Veuillez choisir votre taille", "info");
      } else {
        const res = store.addToCart(product, null, 1);
        if (res.success) {
          window.showToast(`"${product.title}" ajouté au panier`, "success");
        } else {
          window.showToast(res.reason, "error");
        }
      }
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

  // --- MODAL DÉTAIL PRODUIT SHEIN / ALIBABA STYLE ---
  openProductModal(product) {
    this.activeProductModal = product;
    this.selectedModalSize = null;
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

    this.modalDescription.textContent = product.description || "Aucune description détaillée disponible pour cet article.";
    this.modalQtyInput.value = 1;

    // Galerie Photos Studio Fond Blanc
    const images = (product.images && product.images.length > 0) 
      ? product.images 
      : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"];

    this.modalGalleryMain.src = images[0];
    this.modalGalleryMain.alt = product.title;

    this.modalThumbnails.innerHTML = "";
    images.forEach((imgUrl, idx) => {
      const thumbBtn = document.createElement("button");
      thumbBtn.className = `modal-thumbnail-btn ${idx === 0 ? "active" : ""}`;
      thumbBtn.style.background = "#FFFFFF";
      thumbBtn.innerHTML = `<img src="${imgUrl}" alt="Vignette ${idx + 1}" style="object-fit: contain; padding: 2px;">`;
      thumbBtn.addEventListener("click", () => {
        this.modalGalleryMain.src = imgUrl;
        this.modalThumbnails.querySelectorAll(".modal-thumbnail-btn").forEach(b => b.classList.remove("active"));
        thumbBtn.classList.add("active");
      });
      this.modalThumbnails.appendChild(thumbBtn);
    });

    // Rendu du Sélecteur de Tailles Dynamique
    this.renderModalSizeSelector(product);

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
      const variantTitle = isShoes ? "Pointure disponible (EU)" : "Taille de vêtement";

      let html = `
        <div class="variant-header">
          <span class="variant-title">${variantTitle} :</span>
          <span class="size-stock-feedback" id="feedback-stock-text" style="color: var(--blue-700);">Sélectionnez une option</span>
        </div>
        <div class="size-options-container" id="modal-size-btn-group">
      `;

      // Déterminer la première taille en stock pour présélectionner
      let firstAvailableSize = null;

      Object.entries(product.sizes).forEach(([sizeKey, stockCount]) => {
        const inStock = stockCount > 0;
        if (inStock && !firstAvailableSize) {
          firstAvailableSize = sizeKey;
        }

        html += `
          <button type="button" class="size-choice-btn ${!inStock ? "out-of-stock" : ""}" data-size="${sizeKey}" data-stock="${stockCount}" ${!inStock ? "disabled" : ""}>
            <span>${sizeKey}</span>
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
          feedback.textContent = `Taille ${this.selectedModalSize} : ${count} disponible(s)`;
          feedback.style.color = count <= 3 ? "var(--warning-amber)" : "var(--success-emerald)";
          this.modalQuantity = 1;
          this.modalQtyInput.value = 1;
        });
      });

      // Présélectionner automatiquement la première taille en stock
      if (firstAvailableSize) {
        const initialBtn = btnGroup.querySelector(`[data-size="${firstAvailableSize}"]`);
        if (initialBtn) initialBtn.click();
      }
    } else {
      // Accessoires / Autres sans tailles variables
      const stock = product.totalStock || 0;
      this.selectedModalSize = null;
      this.modalVariantContainer.innerHTML = `
        <div style="background: var(--slate-100); padding: 0.75rem 1rem; border-radius: var(--radius-md); font-size: 0.845rem; display: flex; align-items: center; justify-content: space-between;">
          <span style="font-weight: 700; color: var(--slate-700);">Disponibilité :</span>
          <span style="font-weight: 800; color: ${stock > 0 ? 'var(--success-emerald)' : 'var(--danger-crimson)'};">
            ${stock > 0 ? `${stock} unité(s) en stock` : 'Rupture temporaire'}
          </span>
        </div>
      `;
    }
  }

  adjustModalQty(delta) {
    if (!this.activeProductModal) return;

    let maxStock = 99;
    if (this.selectedModalSize && this.activeProductModal.sizes) {
      maxStock = parseInt(this.activeProductModal.sizes[this.selectedModalSize]) || 0;
    } else {
      maxStock = parseInt(this.activeProductModal.totalStock) || 0;
    }

    if (maxStock <= 0) return;

    const nextVal = this.modalQuantity + delta;
    if (nextVal >= 1 && nextVal <= maxStock) {
      this.modalQuantity = nextVal;
      this.modalQtyInput.value = nextVal;
    } else if (nextVal > maxStock) {
      window.showToast(`Stock maximal atteint (${maxStock} unités)`, "warning");
    }
  }

  closeProductModal() {
    this.productModalBackdrop.classList.remove("active");
    document.body.style.overflow = "";
    this.activeProductModal = null;
  }

  orderCurrentModalViaWhatsApp() {
    if (!this.activeProductModal) return;

    const hasSizes = this.activeProductModal.sizes && Object.keys(this.activeProductModal.sizes).length > 0;
    if (hasSizes && !this.selectedModalSize) {
      window.showToast("Veuillez d'abord sélectionner une taille", "warning");
      return;
    }

    const waUrl = store.buildSingleProductWhatsAppUrl(
      this.activeProductModal, 
      this.selectedModalSize, 
      this.modalQuantity,
      "Commande directe express"
    );

    // Enregistrer la commande pour historique
    store.recordWhatsAppOrder({
      items: [{
        title: this.activeProductModal.title,
        size: this.selectedModalSize,
        quantity: this.modalQuantity,
        price: this.activeProductModal.price
      }],
      total: this.activeProductModal.price * this.modalQuantity,
      customerName: "Client WhatsApp Direct",
      district: "Djibouti-Ville"
    });

    window.open(waUrl, "_blank");
    this.closeProductModal();
    window.showToast("Ouverture de WhatsApp pour finaliser votre commande...", "success");
  }

  addCurrentModalToCart() {
    if (!this.activeProductModal) return;

    const hasSizes = this.activeProductModal.sizes && Object.keys(this.activeProductModal.sizes).length > 0;
    if (hasSizes && !this.selectedModalSize) {
      window.showToast("Veuillez sélectionner votre taille avant d'ajouter au panier", "warning");
      return;
    }

    const res = store.addToCart(this.activeProductModal, this.selectedModalSize, this.modalQuantity);
    if (res.success) {
      window.showToast(`Article ajouté au panier !`, "success");
      this.closeProductModal();
      this.openCartDrawer();
    } else {
      window.showToast(res.reason, "error");
    }
  }

  // --- TIROIR PANIER (CART SLIDE-OVER) ---
  openCartDrawer() {
    this.renderCartItems();
    this.cartDrawerBackdrop.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  closeCartDrawer() {
    this.cartDrawerBackdrop.classList.remove("active");
    document.body.style.overflow = "";
  }

  updateCartBadge() {
    const count = store.getCartCount();
    const badges = document.querySelectorAll(".cart-count-display");
    badges.forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? "inline-flex" : "none";
    });

    if (this.cartDrawerCountBadge) {
      this.cartDrawerCountBadge.textContent = `${count} article${count > 1 ? "s" : ""}`;
    }
  }

  renderCartItems() {
    if (!this.cartDrawerItemsList) return;

    const cart = store.getCart();
    const subtotal = store.getCartTotal();

    if (this.cartDrawerSubtotal) {
      this.cartDrawerSubtotal.textContent = store.formatPrice(subtotal);
    }

    if (cart.length === 0) {
      this.cartDrawerItemsList.innerHTML = `
        <div class="cart-empty-state">
          <svg class="cart-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--slate-800); margin-bottom: 0.35rem;">Votre panier est vide</h4>
          <p style="font-size: 0.8125rem; color: var(--slate-500); margin-bottom: 1.25rem;">Découvrez nos articles de mode et commandez en quelques clics.</p>
          <button class="action-btn action-btn-secondary" id="btn-browse-cart-empty" style="margin: 0 auto;">Parcourir les nouveautés</button>
        </div>
      `;

      document.getElementById("btn-browse-cart-empty")?.addEventListener("click", () => {
        this.closeCartDrawer();
      });

      if (this.cartCheckoutWaBtn) {
        this.cartCheckoutWaBtn.disabled = true;
        this.cartCheckoutWaBtn.style.opacity = "0.5";
      }
      return;
    }

    if (this.cartCheckoutWaBtn) {
      this.cartCheckoutWaBtn.disabled = false;
      this.cartCheckoutWaBtn.style.opacity = "1";
    }

    this.cartDrawerItemsList.innerHTML = "";

    cart.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "cart-item-row";

      const sizeStr = item.size ? `Taille : <strong>${item.size}</strong>` : "Taille unique";

      row.innerHTML = `
        <img src="${item.image}" class="cart-item-thumb" alt="${item.title}" style="background: #FFFFFF; object-fit: contain; padding: 2px;">
        <div class="cart-item-details">
          <span class="cart-item-title">${item.title}</span>
          <span class="cart-item-variant">${sizeStr}</span>
          <span class="cart-item-price">${store.formatPrice(item.price)}</span>
        </div>
        <div class="cart-item-controls">
          <button type="button" class="cart-item-remove-btn btn-cart-remove" data-index="${index}" title="Supprimer">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
          <div class="cart-qty-mini">
            <button type="button" class="btn-cart-minus" data-index="${index}">-</button>
            <span>${item.quantity}</span>
            <button type="button" class="btn-cart-plus" data-index="${index}">+</button>
          </div>
        </div>
      `;

      row.querySelector(".btn-cart-remove").addEventListener("click", () => {
        store.removeFromCart(index);
      });
      row.querySelector(".btn-cart-minus").addEventListener("click", () => {
        store.updateCartQuantity(index, item.quantity - 1);
      });
      row.querySelector(".btn-cart-plus").addEventListener("click", () => {
        store.updateCartQuantity(index, item.quantity + 1);
      });

      this.cartDrawerItemsList.appendChild(row);
    });
  }

  checkoutCartViaWhatsApp() {
    const cart = store.getCart();
    if (cart.length === 0) return;

    const name = this.cartCustomerName ? this.cartCustomerName.value.trim() : "";
    const phone = this.cartCustomerPhone ? this.cartCustomerPhone.value.trim() : "";
    const district = this.cartCustomerDistrict ? this.cartCustomerDistrict.value.trim() : "Djibouti-Ville";

    const customerDetails = {
      name: name || "Client DjibSHOP",
      phone: phone || "Via WhatsApp",
      district: district || "Djibouti-Ville"
    };

    const waUrl = store.buildCartWhatsAppUrl(cart, customerDetails);

    // Enregistrer la commande dans l'historique
    store.recordWhatsAppOrder({
      items: cart.map(i => ({ title: i.title, size: i.size, quantity: i.quantity, price: i.price })),
      total: store.getCartTotal(),
      customerName: customerDetails.name,
      customerPhone: customerDetails.phone,
      district: customerDetails.district
    });

    window.open(waUrl, "_blank");
    this.closeCartDrawer();
    window.showToast("Commande groupée transmise sur WhatsApp !", "success");
  }
}

// Système global de notifications toast
window.showToast = function(message, type = "info") {
  let toastContainer = document.getElementById("toast-notification-hub");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-notification-hub";
    toastContainer.className = "toast-center";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = `toast-item toast-${type}`;
  
  let iconSvg = "";
  if (type === "success") {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
  } else if (type === "error" || type === "warning") {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
  } else {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
  }

  toast.innerHTML = `
    ${iconSvg}
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = "opacity 0.3s, transform 0.3s";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 3200);
};

// Initialisation globale
document.addEventListener("DOMContentLoaded", () => {
  window.clientApp = new ClientApp();
});
