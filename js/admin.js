/**
 * DjibSHOP - Contrôleur de l'Espace Administrateur Privé (Version Améliorée)
 * - Tailles avec prix et stock variables (XXL, XL, XXXL ou 37 à 45)
 * - Vente Flash avec compte à rebours
 * - 1 à 4 photos par produit
 * - 3 Finitions Studio Fond (Blanc 100%, Doux Gris, Doux Bleu) intégrées sans téléchargement
 * - Interface Mobile Haute Définition ultra-optimisée
 * - Connexion Cloud Database Supabase
 */

class AdminApp {
  constructor() {
    this.currentEditingId = null;
    this.activeTab = "catalog";
    this.uploadedImages = [];
    this.selectedBgStyle = "studio-white";
    this.isPasswordVisible = false;

    this.initElements();
    this.bindEvents();
    this.checkSession();
  }

  initElements() {
    // Vues Principales
    this.loginView = document.getElementById("admin-login-view");
    this.portalView = document.getElementById("admin-portal-view");

    // Login & Mot de passe
    this.passInput = document.getElementById("admin-pass-input");
    this.passError = document.getElementById("admin-pass-error");
    this.loginSubmitBtn = document.getElementById("btn-admin-login-submit");
    this.toggleEyeBtn = document.getElementById("btn-toggle-eye");
    this.eyeIconSvg = document.getElementById("eye-icon-svg");
    this.logoutBtn = document.getElementById("btn-admin-logout");

    // Onglets
    this.adminTabs = document.querySelectorAll(".admin-tab-btn");
    this.tabPanels = {
      catalog: document.getElementById("admin-panel-catalog"),
      add: document.getElementById("admin-panel-add"),
      orders: document.getElementById("admin-panel-orders"),
      settings: document.getElementById("admin-panel-settings"),
      supabase: document.getElementById("admin-panel-supabase")
    };

    // Formulaire Produit
    this.productForm = document.getElementById("admin-product-form");
    this.formHeading = document.getElementById("admin-form-heading");
    this.formSubmitBtn = document.getElementById("admin-form-submit-btn");
    this.cancelEditBtn = document.getElementById("admin-cancel-edit-btn");
    this.categorySelect = document.getElementById("prod-category-select");
    this.variantContainer = document.getElementById("dynamic-variant-fields");

    // Vente Flash
    this.flashSaleToggle = document.getElementById("prod-flash-sale-toggle");
    this.flashSaleConfig = document.getElementById("prod-flash-sale-config");
    this.flashSaleHours = document.getElementById("prod-flash-hours");

    // Photos & Arrière-plans Studio
    this.imgUrlInput = document.getElementById("prod-img-url");
    this.addImgUrlBtn = document.getElementById("btn-add-img-url");
    this.fileUploadInput = document.getElementById("prod-img-file");
    this.imagesPreviewList = document.getElementById("admin-images-preview-list");
    this.imageCountNotice = document.getElementById("admin-image-count-notice");

    // Options Fond Studio Rapide
    this.bgOptionCards = document.querySelectorAll(".bg-choice-card");

    // Tableau & Filtres
    this.adminTableBody = document.getElementById("admin-products-table-body");
    this.adminSearchInput = document.getElementById("admin-search-products");
    this.adminCategoryFilter = document.getElementById("admin-category-filter");
    this.adminOrdersTableBody = document.getElementById("admin-orders-table-body");

    // Compteurs Statistiques
    this.statTotalProducts = document.getElementById("stat-total-products");
    this.statStockValue = document.getElementById("stat-stock-value");
    this.statOutOfStock = document.getElementById("stat-out-of-stock");
    this.statTotalOrders = document.getElementById("stat-total-orders");

    // Supabase
    this.supabaseUrlInput = document.getElementById("supabase-url-input");
    this.supabaseKeyInput = document.getElementById("supabase-key-input");
    this.supabaseSaveBtn = document.getElementById("btn-save-supabase");
    this.supabaseTestBtn = document.getElementById("btn-test-supabase");
    this.supabaseSyncAllBtn = document.getElementById("btn-sync-all-supabase");
    this.supabaseStatusAlert = document.getElementById("supabase-status-alert");
  }

  bindEvents() {
    // Mot de passe
    if (this.toggleEyeBtn) {
      this.toggleEyeBtn.addEventListener("click", () => this.togglePasswordVisibility());
    }
    if (this.loginSubmitBtn) {
      this.loginSubmitBtn.addEventListener("click", () => this.handleLogin());
    }
    if (this.passInput) {
      this.passInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") this.handleLogin();
      });
    }

    // Déconnexion
    if (this.logoutBtn) {
      this.logoutBtn.addEventListener("click", () => this.handleLogout());
    }

    // Onglets
    this.adminTabs.forEach(btn => {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Catégorie changeante
    if (this.categorySelect) {
      this.categorySelect.addEventListener("change", () => {
        this.renderDynamicSizeInputs(this.categorySelect.value);
      });
    }

    // Vente flash toggle
    if (this.flashSaleToggle) {
      this.flashSaleToggle.addEventListener("change", (e) => {
        if (this.flashSaleConfig) {
          this.flashSaleConfig.style.display = e.target.checked ? "block" : "none";
        }
      });
    }

    // Choix du fond studio direct (1-clic)
    this.bgOptionCards.forEach(card => {
      card.addEventListener("click", () => {
        this.bgOptionCards.forEach(c => c.classList.remove("active"));
        card.classList.add("active");
        this.selectedBgStyle = card.dataset.bg;
        this.renderImagesPreview();
      });
    });

    // Gestion des images
    if (this.addImgUrlBtn) {
      this.addImgUrlBtn.addEventListener("click", () => this.addImageFromUrl());
    }
    if (this.fileUploadInput) {
      this.fileUploadInput.addEventListener("change", (e) => this.handleFileUpload(e));
    }

    // Formulaire Produit
    if (this.productForm) {
      this.productForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleProductSubmit();
      });
    }

    if (this.cancelEditBtn) {
      this.cancelEditBtn.addEventListener("click", () => this.resetProductForm());
    }

    // Filtres catalogue admin
    if (this.adminSearchInput) {
      this.adminSearchInput.addEventListener("input", () => this.renderAdminProductsTable());
    }
    if (this.adminCategoryFilter) {
      this.adminCategoryFilter.addEventListener("change", () => this.renderAdminProductsTable());
    }

    // Supabase events
    if (this.supabaseSaveBtn) {
      this.supabaseSaveBtn.addEventListener("click", () => this.saveSupabaseConfig());
    }
    if (this.supabaseTestBtn) {
      this.supabaseTestBtn.addEventListener("click", () => this.testSupabaseConnection());
    }
    if (this.supabaseSyncAllBtn) {
      this.supabaseSyncAllBtn.addEventListener("click", () => this.syncAllToSupabase());
    }

    // Réinitialisation & Export
    document.getElementById("btn-reset-default-catalog")?.addEventListener("click", () => {
      if (confirm("Réinitialiser le catalogue avec les données d'origine ? Vos modifications manuelles seront remplacées.")) {
        store.resetCatalogToDefault();
        this.renderAdminProductsTable();
        this.updateStats();
        alert("Catalogue réinitialisé avec succès !");
      }
    });

    document.getElementById("btn-export-catalog")?.addEventListener("click", () => {
      this.exportCatalogJson();
    });
  }

  // --- MOT DE PASSE & CONNEXION ---
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
    if (this.passInput) {
      this.passInput.type = this.isPasswordVisible ? "text" : "password";
    }
    if (this.eyeIconSvg) {
      if (this.isPasswordVisible) {
        this.eyeIconSvg.innerHTML = `
          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
          <line x1="2" y1="2" x2="22" y2="22"/>
        `;
      } else {
        this.eyeIconSvg.innerHTML = `
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
          <circle cx="12" cy="12" r="3"/>
        `;
      }
    }
  }

  checkSession() {
    if (store.isAdminAuthenticated()) {
      this.showPortal();
    } else {
      this.showLogin();
    }
  }

  handleLogin() {
    const rawVal = this.passInput ? this.passInput.value : "";
    if (store.loginAdmin(rawVal)) {
      if (this.passError) this.passError.style.display = "none";
      if (this.passInput) this.passInput.value = "";
      this.showPortal();
    } else {
      if (this.passError) this.passError.style.display = "block";
      if (this.passInput) this.passInput.focus();
    }
  }

  handleLogout() {
    store.logoutAdmin();
    this.showLogin();
  }

  showLogin() {
    if (this.loginView) this.loginView.style.display = "flex";
    if (this.portalView) this.portalView.style.display = "none";
    if (this.passInput) {
      this.passInput.value = "";
      setTimeout(() => this.passInput.focus(), 150);
    }
  }

  showPortal() {
    if (this.loginView) this.loginView.style.display = "none";
    if (this.portalView) this.portalView.style.display = "block";
    this.updateStats();
    this.renderAdminProductsTable();
    this.renderAdminOrdersTable();
    this.renderDynamicSizeInputs(this.categorySelect ? this.categorySelect.value : "vetements");
    this.loadSupabaseForm();
  }

  switchTab(tabName) {
    this.activeTab = tabName;
    this.adminTabs.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tabName);
    });
    Object.keys(this.tabPanels).forEach(key => {
      if (this.tabPanels[key]) {
        this.tabPanels[key].style.display = (key === tabName) ? "block" : "none";
      }
    });

    if (tabName === "catalog") {
      this.renderAdminProductsTable();
      this.updateStats();
    } else if (tabName === "orders") {
      this.renderAdminOrdersTable();
    } else if (tabName === "supabase") {
      this.loadSupabaseForm();
    }
  }

  updateStats() {
    const products = store.getProducts();
    const orders = store.getOrders();

    const totalProducts = products.length;
    const outOfStock = products.filter(p => p.totalStock <= 0).length;
    const totalStockValue = products.reduce((acc, p) => acc + (p.price * (p.totalStock || 0)), 0);

    if (this.statTotalProducts) this.statTotalProducts.textContent = totalProducts;
    if (this.statStockValue) this.statStockValue.textContent = store.formatPrice(totalStockValue);
    if (this.statOutOfStock) this.statOutOfStock.textContent = outOfStock;
    if (this.statTotalOrders) this.statTotalOrders.textContent = orders.length;
  }

  // --- RENDU DYNAMIQUE DES TAILLES & PRIX PROGRESSIFS ---
  renderDynamicSizeInputs(category, existingSizes = null, existingStock = null) {
    if (!this.variantContainer) return;
    this.variantContainer.innerHTML = "";

    const basePrice = parseFloat(document.getElementById("prod-price").value) || 3000;

    if (category === "vetements") {
      let html = `
        <div class="variant-matrix-card">
          <div class="variant-matrix-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>
            Tailles Vêtements & Prix Progressifs
          </div>
          <p class="variant-matrix-desc">
            Cochez les tailles proposées (S, M, L, XL, XXL, XXXL, XXXXL). Vous pouvez ajuster le <strong>stock</strong> et le <strong>prix spécifique</strong> de chaque taille (ex: taille plus grande = prix plus élevé).
          </p>

          <div class="sizes-stock-grid-advanced">
      `;

      CLOTHING_SIZES.forEach((size, idx) => {
        let isChecked = true;
        let stockVal = 5;
        let priceVal = basePrice;

        if (existingSizes && typeof existingSizes === "object") {
          if (existingSizes[size] !== undefined) {
            isChecked = true;
            if (typeof existingSizes[size] === "object") {
              stockVal = existingSizes[size].stock !== undefined ? existingSizes[size].stock : 5;
              priceVal = existingSizes[size].price !== undefined ? existingSizes[size].price : basePrice;
            } else {
              stockVal = existingSizes[size];
            }
          } else {
            isChecked = false;
          }
        }

        html += `
          <div class="size-config-card ${isChecked ? "active" : ""}" id="size-card-${size}">
            <div class="size-config-header">
              <label class="size-check-label">
                <input type="checkbox" class="size-enable-toggle" data-size="${size}" ${isChecked ? "checked" : ""}>
                <span class="size-name-badge">${size}</span>
              </label>
            </div>
            <div class="size-config-inputs" style="${isChecked ? "" : "opacity: 0.4; pointer-events: none;"}">
              <div class="size-input-field">
                <label>Stock :</label>
                <input type="number" min="0" max="999" class="form-input size-stock-input" data-size="${size}" value="${stockVal}">
              </div>
              <div class="size-input-field">
                <label>Prix (FDJ) :</label>
                <input type="number" min="50" step="50" class="form-input size-price-input" data-size="${size}" value="${priceVal}">
              </div>
            </div>
          </div>
        `;
      });

      html += `
          </div>
          <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button type="button" class="action-btn action-btn-secondary" id="btn-auto-increment-price">+200 FDJ par taille supérieure</button>
            <button type="button" class="action-btn action-btn-secondary" id="btn-select-all-clothes">Tout cocher</button>
          </div>
        </div>
      `;
      this.variantContainer.innerHTML = html;

      // Événements d'activation des cartes
      this.variantContainer.querySelectorAll(".size-enable-toggle").forEach(toggle => {
        toggle.addEventListener("change", (e) => {
          const card = document.getElementById(`size-card-${e.target.dataset.size}`);
          if (card) {
            card.classList.toggle("active", e.target.checked);
            const inputsDiv = card.querySelector(".size-config-inputs");
            if (inputsDiv) {
              inputsDiv.style.opacity = e.target.checked ? "1" : "0.4";
              inputsDiv.style.pointerEvents = e.target.checked ? "auto" : "none";
            }
          }
        });
      });

      // Bouton incrémentation automatique de prix (taille plus grande = prix plus grand)
      document.getElementById("btn-auto-increment-price")?.addEventListener("click", () => {
        let currentP = parseFloat(document.getElementById("prod-price").value) || 3000;
        this.variantContainer.querySelectorAll(".size-config-card").forEach(card => {
          const priceInput = card.querySelector(".size-price-input");
          if (priceInput) {
            priceInput.value = currentP;
            currentP += 200;
          }
        });
      });

      document.getElementById("btn-select-all-clothes")?.addEventListener("click", () => {
        this.variantContainer.querySelectorAll(".size-enable-toggle").forEach(t => {
          t.checked = true;
          t.dispatchEvent(new Event("change"));
        });
      });

    } else if (category === "chaussures") {
      let html = `
        <div class="variant-matrix-card">
          <div class="variant-matrix-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 16v-2.38C4 11.5 5.5 10 7.5 10H11v6H4Z"/><path d="M11 16v-6h4.5c2 0 3.5 1.5 3.5 3.62V16H11Z"/><path d="M2 19h20"/></svg>
            Pointures Chaussures (37 à 45) & Prix Personnalisés
          </div>
          <p class="variant-matrix-desc">
            Cochez les pointures disponibles pour ce modèle (37, 38, 39, 40, 41, 42, 43, 44, 45) et paramétrez leur stock et prix unitaire.
          </p>

          <div class="sizes-stock-grid-advanced">
      `;

      SHOE_SIZES.forEach(size => {
        let isChecked = true;
        let stockVal = 4;
        let priceVal = basePrice;

        if (existingSizes && typeof existingSizes === "object") {
          if (existingSizes[size] !== undefined) {
            isChecked = true;
            if (typeof existingSizes[size] === "object") {
              stockVal = existingSizes[size].stock !== undefined ? existingSizes[size].stock : 4;
              priceVal = existingSizes[size].price !== undefined ? existingSizes[size].price : basePrice;
            } else {
              stockVal = existingSizes[size];
            }
          } else {
            isChecked = false;
          }
        }

        html += `
          <div class="size-config-card ${isChecked ? "active" : ""}" id="size-card-${size}">
            <div class="size-config-header">
              <label class="size-check-label">
                <input type="checkbox" class="size-enable-toggle" data-size="${size}" ${isChecked ? "checked" : ""}>
                <span class="size-name-badge">N° ${size}</span>
              </label>
            </div>
            <div class="size-config-inputs" style="${isChecked ? "" : "opacity: 0.4; pointer-events: none;"}">
              <div class="size-input-field">
                <label>Stock :</label>
                <input type="number" min="0" max="999" class="form-input size-stock-input" data-size="${size}" value="${stockVal}">
              </div>
              <div class="size-input-field">
                <label>Prix (FDJ) :</label>
                <input type="number" min="50" step="50" class="form-input size-price-input" data-size="${size}" value="${priceVal}">
              </div>
            </div>
          </div>
        `;
      });

      html += `
          </div>
          <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button type="button" class="action-btn action-btn-secondary" id="btn-select-all-shoes">Cocher du 38 au 44</button>
            <button type="button" class="action-btn action-btn-secondary" id="btn-sync-shoes-price">Appliquer le prix de base à toutes</button>
          </div>
        </div>
      `;
      this.variantContainer.innerHTML = html;

      this.variantContainer.querySelectorAll(".size-enable-toggle").forEach(toggle => {
        toggle.addEventListener("change", (e) => {
          const card = document.getElementById(`size-card-${e.target.dataset.size}`);
          if (card) {
            card.classList.toggle("active", e.target.checked);
            const inputsDiv = card.querySelector(".size-config-inputs");
            if (inputsDiv) {
              inputsDiv.style.opacity = e.target.checked ? "1" : "0.4";
              inputsDiv.style.pointerEvents = e.target.checked ? "auto" : "none";
            }
          }
        });
      });

      document.getElementById("btn-select-all-shoes")?.addEventListener("click", () => {
        const standard = ["38", "39", "40", "41", "42", "43", "44"];
        this.variantContainer.querySelectorAll(".size-enable-toggle").forEach(t => {
          t.checked = standard.includes(t.dataset.size);
          t.dispatchEvent(new Event("change"));
        });
      });

      document.getElementById("btn-sync-shoes-price")?.addEventListener("click", () => {
        const currentP = parseFloat(document.getElementById("prod-price").value) || 12000;
        this.variantContainer.querySelectorAll(".size-price-input").forEach(inp => {
          inp.value = currentP;
        });
      });

    } else {
      const val = existingStock !== null && existingStock !== undefined ? existingStock : 15;
      this.variantContainer.innerHTML = `
        <div class="variant-matrix-card">
          <div class="variant-matrix-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
            Stock Global de l'Article
          </div>
          <p class="variant-matrix-desc">Pour les accessoires et articles sans tailles variables, définissez la quantité globale disponible.</p>
          <div style="max-width: 240px;">
            <label class="form-label">Nombre d'unités en stock :</label>
            <input type="number" min="0" max="9999" id="prod-global-stock" class="form-input" style="font-weight: 700; font-size: 1.1rem;" value="${val}">
          </div>
        </div>
      `;
    }
  }

  // --- PHOTOS : 1 À 4 IMAGES & VISUELLES ULTRA SOIGNÉS ---
  addImageFromUrl() {
    if (this.uploadedImages.length >= 4) {
      alert("Limite de 4 images par article atteinte !");
      return;
    }
    const url = this.imgUrlInput.value.trim();
    if (!url) return;
    this.uploadedImages.push(url);
    this.imgUrlInput.value = "";
    this.renderImagesPreview();
  }

  handleFileUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 4 - this.uploadedImages.length;
    if (remainingSlots <= 0) {
      alert("Vous avez déjà atteint le maximum de 4 photos.");
      return;
    }

    const toProcess = Array.from(files).slice(0, remainingSlots);

    toProcess.forEach(file => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (this.uploadedImages.length < 4) {
          this.uploadedImages.push(e.target.result);
          this.renderImagesPreview();
        }
      };
      reader.readAsDataURL(file);
    });
    event.target.value = "";
  }

  renderImagesPreview() {
    if (!this.imagesPreviewList) return;
    this.imagesPreviewList.innerHTML = "";

    if (this.imageCountNotice) {
      this.imageCountNotice.textContent = `${this.uploadedImages.length}/4 photo(s) ajoutée(s)`;
    }

    if (this.uploadedImages.length === 0) {
      this.imagesPreviewList.innerHTML = `
        <div style="font-size: 0.8rem; color: var(--slate-400); grid-column: 1/-1; padding: 0.5rem 0;">
          Aucune photo sélectionnée (Vous pouvez en ajouter de 1 à 4).
        </div>
      `;
      return;
    }

    const bgMap = {
      "studio-white": "#FFFFFF",
      "studio-gray": "#F1F5F9",
      "studio-blue": "#EFF6FF"
    };
    const currentBg = bgMap[this.selectedBgStyle] || "#FFFFFF";

    this.uploadedImages.forEach((imgSrc, index) => {
      const item = document.createElement("div");
      item.className = "admin-img-preview-card";
      item.style.backgroundColor = currentBg;

      item.innerHTML = `
        <img src="${imgSrc}" alt="Photo ${index + 1}">
        <button type="button" class="del-img-btn" data-index="${index}">&times;</button>
        <span class="img-badge-order">${index === 0 ? "Principale" : `Photo ${index + 1}`}</span>
      `;

      item.querySelector(".del-img-btn").addEventListener("click", () => {
        this.uploadedImages.splice(index, 1);
        this.renderImagesPreview();
      });

      this.imagesPreviewList.appendChild(item);
    });
  }

  // --- SOUMISSION DU FORMULAIRE PRODUIT ---
  async handleProductSubmit() {
    const title = document.getElementById("prod-title").value.trim();
    const category = this.categorySelect.value;
    const price = parseFloat(document.getElementById("prod-price").value) || 0;
    const originalPriceInput = document.getElementById("prod-original-price").value;
    const originalPrice = originalPriceInput ? parseFloat(originalPriceInput) : null;
    const badge = document.getElementById("prod-badge").value;
    const description = document.getElementById("prod-desc").value.trim();

    const isFlashSale = this.flashSaleToggle ? this.flashSaleToggle.checked : false;
    let flashSaleEnds = null;
    if (isFlashSale) {
      const hours = parseInt(this.flashSaleHours?.value) || 24;
      flashSaleEnds = new Date(Date.now() + 1000 * 60 * 60 * hours).toISOString();
    }

    if (!title || price <= 0) {
      alert("Veuillez renseigner un titre valide et un prix supérieur à 0 FDJ.");
      return;
    }

    let sizes = null;
    let totalStock = 0;

    if (category === "vetements" || category === "chaussures") {
      sizes = {};
      const enabledToggles = this.variantContainer.querySelectorAll(".size-enable-toggle:checked");
      if (enabledToggles.length === 0) {
        alert("Veuillez cocher au moins une taille ou pointure disponible pour cet article.");
        return;
      }

      enabledToggles.forEach(toggle => {
        const sizeKey = toggle.dataset.size;
        const card = document.getElementById(`size-card-${sizeKey}`);
        const stockInput = card ? card.querySelector(".size-stock-input") : null;
        const priceInput = card ? card.querySelector(".size-price-input") : null;

        const count = stockInput ? (parseInt(stockInput.value) || 0) : 0;
        const itemPrice = priceInput ? (parseFloat(priceInput.value) || price) : price;

        sizes[sizeKey] = {
          stock: count,
          price: itemPrice
        };
        totalStock += count;
      });
    } else {
      const globalInput = document.getElementById("prod-global-stock");
      totalStock = globalInput ? (parseInt(globalInput.value) || 0) : 10;
    }

    let finalImages = [...this.uploadedImages];
    if (finalImages.length === 0) {
      finalImages = ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"];
    }

    const productPayload = {
      title,
      category,
      price,
      originalPrice,
      badge: isFlashSale ? "Flash Sale" : badge,
      flashSale: isFlashSale,
      flashSaleEnds,
      description,
      images: finalImages,
      sizes,
      totalStock,
      bgStyle: this.selectedBgStyle
    };

    if (this.currentEditingId) {
      await store.updateProduct(this.currentEditingId, productPayload);
      alert(`Produit "${title}" mis à jour avec succès !`);
    } else {
      await store.addProduct(productPayload);
      alert(`Produit "${title}" mis en ligne avec succès sur DjibSHOP !`);
    }

    this.resetProductForm();
    this.switchTab("catalog");
    this.renderAdminProductsTable();
    this.updateStats();
  }

  editProduct(id) {
    const product = store.getProductById(id);
    if (!product) return;

    this.currentEditingId = product.id;
    this.switchTab("add");

    if (this.formHeading) this.formHeading.textContent = `Modifier : ${product.ref}`;
    if (this.formSubmitBtn) this.formSubmitBtn.textContent = "Enregistrer les modifications";
    if (this.cancelEditBtn) this.cancelEditBtn.style.display = "inline-flex";

    document.getElementById("prod-title").value = product.title || "";
    this.categorySelect.value = product.category || "vetements";
    document.getElementById("prod-price").value = product.price || "";
    document.getElementById("prod-original-price").value = product.originalPrice || "";
    document.getElementById("prod-badge").value = product.badge || "Aucun";
    document.getElementById("prod-desc").value = product.description || "";

    if (this.flashSaleToggle) {
      this.flashSaleToggle.checked = !!product.flashSale;
      if (this.flashSaleConfig) {
        this.flashSaleConfig.style.display = product.flashSale ? "block" : "none";
      }
    }

    this.uploadedImages = product.images ? [...product.images] : [];
    this.selectedBgStyle = product.bgStyle || "studio-white";

    this.bgOptionCards.forEach(c => {
      c.classList.toggle("active", c.dataset.bg === this.selectedBgStyle);
    });

    this.renderImagesPreview();
    this.renderDynamicSizeInputs(product.category, product.sizes, product.totalStock);
    window.scrollTo({ top: 100, behavior: "smooth" });
  }

  resetProductForm() {
    this.currentEditingId = null;
    if (this.productForm) this.productForm.reset();
    if (this.formHeading) this.formHeading.textContent = "Ajouter un nouveau produit";
    if (this.formSubmitBtn) this.formSubmitBtn.textContent = "Enregistrer et mettre en ligne";
    if (this.cancelEditBtn) this.cancelEditBtn.style.display = "none";
    if (this.flashSaleConfig) this.flashSaleConfig.style.display = "none";
    this.uploadedImages = [];
    this.selectedBgStyle = "studio-white";
    this.bgOptionCards.forEach(c => c.classList.toggle("active", c.dataset.bg === "studio-white"));
    this.renderImagesPreview();
    this.renderDynamicSizeInputs(this.categorySelect ? this.categorySelect.value : "vetements");
  }

  // --- RENDU CATALOGUE ADMIN ---
  renderAdminProductsTable() {
    if (!this.adminTableBody) return;

    const searchTerm = this.adminSearchInput ? this.adminSearchInput.value.toLowerCase().trim() : "";
    const filterCat = this.adminCategoryFilter ? this.adminCategoryFilter.value : "all";

    let products = store.getProducts();

    if (filterCat !== "all") {
      products = products.filter(p => p.category === filterCat);
    }

    if (searchTerm) {
      products = products.filter(p => 
        p.title.toLowerCase().includes(searchTerm) ||
        p.ref.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm)
      );
    }

    this.adminTableBody.innerHTML = "";

    if (products.length === 0) {
      this.adminTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--slate-400);">
            Aucun article trouvé.
          </td>
        </tr>
      `;
      return;
    }

    const bgMap = {
      "studio-white": "#FFFFFF",
      "studio-gray": "#F1F5F9",
      "studio-blue": "#EFF6FF"
    };

    products.forEach(p => {
      const tr = document.createElement("tr");
      const img = (p.images && p.images[0]) || "";
      const bg = bgMap[p.bgStyle] || "#FFFFFF";

      let sizesSummary = "";
      if (p.sizes && typeof p.sizes === "object") {
        sizesSummary = Object.entries(p.sizes).map(([k, v]) => {
          const count = typeof v === "object" ? v.stock : v;
          const price = typeof v === "object" && v.price ? ` (${store.formatPrice(v.price)})` : "";
          return `<span style="font-size: 0.75rem; background: var(--slate-100); padding: 2px 6px; border-radius: 3px; margin: 2px; display: inline-block;"><strong>${k}</strong>: ${count}${price}</span>`;
        }).join(" ");
      } else {
        sizesSummary = `<span style="font-size: 0.75rem; color: var(--slate-500);">Unique (${p.totalStock || 0} en stock)</span>`;
      }

      tr.innerHTML = `
        <td>
          <div style="width: 50px; height: 50px; border-radius: 6px; border: 1px solid var(--slate-200); background-color: ${bg}; display: flex; align-items: center; justify-content: center; overflow: hidden;">
            <img src="${img}" alt="${p.title}" style="width: 100%; height: 100%; object-fit: contain; padding: 2px;">
          </div>
        </td>
        <td>
          <div style="font-weight: 700; color: var(--slate-900); font-size: 0.9rem;">${p.title}</div>
          <div style="font-size: 0.75rem; color: var(--slate-400); font-family: monospace;">${p.ref}</div>
        </td>
        <td>
          <span class="card-category-tag">${p.category}</span>
        </td>
        <td>
          <div style="font-weight: 800; color: var(--blue-900);">${store.formatPrice(p.price)}</div>
          ${p.flashSale ? `<span style="font-size: 0.7rem; color: #DC2626; font-weight: 800;">⚡ Vente Flash</span>` : ""}
        </td>
        <td>
          <div>${sizesSummary}</div>
          <div style="font-size: 0.75rem; font-weight: 700; color: ${p.totalStock > 0 ? 'var(--success-emerald)' : 'var(--danger-crimson)'}; margin-top: 4px;">
            Total : ${p.totalStock} unité(s)
          </div>
        </td>
        <td>
          <span class="card-badge badge-${(p.badge || 'aucun').toLowerCase()}" style="position: static; display: inline-block;">${p.badge || 'Aucun'}</span>
        </td>
        <td style="text-align: right; white-space: nowrap;">
          <button type="button" class="action-btn action-btn-secondary btn-edit-p" data-id="${p.id}" style="padding: 4px 8px; font-size: 0.8rem; margin-right: 4px;">Modifier</button>
          <button type="button" class="action-btn action-btn-secondary btn-del-p" data-id="${p.id}" style="padding: 4px 8px; font-size: 0.8rem; color: var(--danger-crimson);">Suppr.</button>
        </td>
      `;

      tr.querySelector(".btn-edit-p").addEventListener("click", () => this.editProduct(p.id));
      tr.querySelector(".btn-del-p").addEventListener("click", () => {
        if (confirm(`Supprimer définitivement "${p.title}" ?`)) {
          store.deleteProduct(p.id);
          this.renderAdminProductsTable();
          this.updateStats();
        }
      });

      this.adminTableBody.appendChild(tr);
    });
  }

  // --- RENDU COMMANDES ---
  renderAdminOrdersTable() {
    if (!this.adminOrdersTableBody) return;
    const orders = store.getOrders();
    this.adminOrdersTableBody.innerHTML = "";

    if (orders.length === 0) {
      this.adminOrdersTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--slate-400);">
            Aucune commande enregistrée pour le moment.
          </td>
        </tr>
      `;
      return;
    }

    orders.forEach(ord => {
      const tr = document.createElement("tr");
      const itemsList = ord.items.map(it => `${it.quantity}x ${it.title} ${it.size ? `(${it.size})` : ""}`).join("<br>");

      tr.innerHTML = `
        <td style="font-weight: 700; font-family: monospace;">${ord.id}</td>
        <td style="font-size: 0.825rem; color: var(--slate-600);">${ord.date}</td>
        <td>
          <div style="font-weight: 700;">${ord.customerName}</div>
          <div style="font-size: 0.75rem; color: var(--slate-500);">${ord.district} • ${ord.customerPhone}</div>
        </td>
        <td style="font-size: 0.825rem;">${itemsList}</td>
        <td style="font-weight: 800; color: var(--blue-900);">${store.formatPrice(ord.total)}</td>
        <td>
          <span style="font-size: 0.75rem; padding: 3px 8px; border-radius: 4px; font-weight: 700; background: #DEF7EC; color: #03543F;">
            ${ord.status}
          </span>
        </td>
      `;
      this.adminOrdersTableBody.appendChild(tr);
    });
  }

  // --- SUPABASE CLOUD SYNC ---
  loadSupabaseForm() {
    if (!window.supabaseService) return;
    const cfg = window.supabaseService.getConfig();
    if (cfg) {
      if (this.supabaseUrlInput) this.supabaseUrlInput.value = cfg.url || "";
      if (this.supabaseKeyInput) this.supabaseKeyInput.value = cfg.anonKey || "";
      this.setSupabaseStatus(true, "Supabase est configuré sur cet appareil.");
    } else {
      this.setSupabaseStatus(false, "Supabase n'est pas encore connecté.");
    }
  }

  saveSupabaseConfig() {
    const url = this.supabaseUrlInput?.value.trim();
    const key = this.supabaseKeyInput?.value.trim();

    if (!url || !key) {
      alert("Veuillez renseigner l'URL Supabase et la clé Anon.");
      return;
    }

    const ok = window.supabaseService.configure(url, key);
    if (ok) {
      this.setSupabaseStatus(true, "Configuration Supabase sauvegardée avec succès !");
      store.syncFromSupabase();
    } else {
      this.setSupabaseStatus(false, "Erreur d'initialisation Supabase.");
    }
  }

  async testSupabaseConnection() {
    this.setSupabaseStatus(null, "Test de connexion en cours...");
    const res = await window.supabaseService.testConnection();
    this.setSupabaseStatus(res.success, res.message);
  }

  async syncAllToSupabase() {
    if (!window.supabaseService.isConfigured) {
      alert("Veuillez d'abord configurer et tester votre connexion Supabase.");
      return;
    }
    const products = store.getProducts();
    const ok = await window.supabaseService.syncAllToSupabase(products);
    if (ok) {
      alert(`Synchronisation terminée : ${products.length} article(s) envoyés dans votre base cloud Supabase !`);
    } else {
      alert("Erreur lors de la synchronisation Supabase.");
    }
  }

  setSupabaseStatus(isOk, text) {
    if (!this.supabaseStatusAlert) return;
    this.supabaseStatusAlert.style.display = "block";
    if (isOk === true) {
      this.supabaseStatusAlert.style.background = "#DEF7EC";
      this.supabaseStatusAlert.style.color = "#03543F";
      this.supabaseStatusAlert.style.borderColor = "#31C48D";
    } else if (isOk === false) {
      this.supabaseStatusAlert.style.background = "#FDE8E8";
      this.supabaseStatusAlert.style.color = "#9B1C1C";
      this.supabaseStatusAlert.style.borderColor = "#F98080";
    } else {
      this.supabaseStatusAlert.style.background = "#E1EFFE";
      this.supabaseStatusAlert.style.color = "#1E429F";
      this.supabaseStatusAlert.style.borderColor = "#76A9FA";
    }
    this.supabaseStatusAlert.textContent = text;
  }

  exportCatalogJson() {
    const data = store.getProducts();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `djibshop-catalogue-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.adminApp = new AdminApp();
});
