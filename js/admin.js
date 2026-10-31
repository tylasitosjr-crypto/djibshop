/**
 * DjibSHOP - Contrôleur du Portail Administrateur Autonome
 * Mot de passe de gestion : abouali2004\ (ou abouali2004)
 */

class AdminController {
  constructor() {
    this.currentEditingId = null;
    this.activeTab = "catalog"; // 'catalog' | 'add' | 'orders' | 'settings'
    this.uploadedImages = [];
    this.selectedBgStyle = "studio-white";
    this.isPasswordVisible = false;

    this.initElements();
    this.bindEvents();
    this.checkSession();
  }

  initElements() {
    // Vues principales du portail
    this.loginView = document.getElementById("admin-login-view");
    this.portalView = document.getElementById("admin-portal-view");

    // Éléments de connexion
    this.passInput = document.getElementById("admin-pass-input");
    this.loginSubmitBtn = document.getElementById("btn-admin-login-submit");
    this.passError = document.getElementById("admin-pass-error");
    this.toggleEyeBtn = document.getElementById("btn-toggle-eye");
    this.eyeIconSvg = document.getElementById("eye-icon-svg");
    this.logoutBtn = document.getElementById("btn-admin-logout");

    // Onglets Dashboard
    this.adminTabs = document.querySelectorAll(".admin-tab-btn");
    this.tabPanels = {
      catalog: document.getElementById("admin-panel-catalog"),
      add: document.getElementById("admin-panel-add"),
      orders: document.getElementById("admin-panel-orders"),
      settings: document.getElementById("admin-panel-settings")
    };

    // Formulaire d'ajout / modification de produit
    this.productForm = document.getElementById("admin-product-form");
    this.categorySelect = document.getElementById("prod-category-select");
    this.variantContainer = document.getElementById("dynamic-variant-fields");
    this.formHeading = document.getElementById("admin-form-heading");
    this.formSubmitBtn = document.getElementById("admin-form-submit-btn");
    this.cancelEditBtn = document.getElementById("admin-cancel-edit-btn");

    // Images & Finition Studio
    this.imgUrlInput = document.getElementById("prod-img-url");
    this.addImgUrlBtn = document.getElementById("btn-add-img-url");
    this.fileUploadInput = document.getElementById("prod-img-file");
    this.imagesPreviewList = document.getElementById("admin-images-preview-list");
    this.bgStyleSelect = document.getElementById("prod-bg-style");

    // Catalogue
    this.adminTableBody = document.getElementById("admin-products-table-body");
    this.adminSearchInput = document.getElementById("admin-search-products");
    this.adminCategoryFilter = document.getElementById("admin-category-filter");

    // Commandes
    this.adminOrdersTableBody = document.getElementById("admin-orders-table-body");

    // Statistiques
    this.statTotalProducts = document.getElementById("stat-total-products");
    this.statStockValue = document.getElementById("stat-stock-value");
    this.statOutOfStock = document.getElementById("stat-out-of-stock");
    this.statTotalOrders = document.getElementById("stat-total-orders");
  }

  bindEvents() {
    // Bouton Œil (Afficher / Masquer le mot de passe)
    if (this.toggleEyeBtn) {
      this.toggleEyeBtn.addEventListener("click", () => this.togglePasswordVisibility());
    }

    // Connexion
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

    // Navigation des onglets
    this.adminTabs.forEach(btn => {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Choix dynamique de la catégorie
    if (this.categorySelect) {
      this.categorySelect.addEventListener("change", () => {
        this.renderDynamicSizeInputs(this.categorySelect.value);
      });
    }

    // Gestion des images
    if (this.addImgUrlBtn) {
      this.addImgUrlBtn.addEventListener("click", () => this.addImageFromUrl());
    }
    if (this.fileUploadInput) {
      this.fileUploadInput.addEventListener("change", (e) => this.handleFileUpload(e));
    }
    if (this.bgStyleSelect) {
      this.bgStyleSelect.addEventListener("change", (e) => {
        this.selectedBgStyle = e.target.value;
        this.renderImagesPreview();
      });
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

  // --- GESTION DU MOT DE PASSE AVEC ICÔNE ŒIL ---
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
    if (this.passInput) {
      this.passInput.type = this.isPasswordVisible ? "text" : "password";
    }

    if (this.eyeIconSvg) {
      if (this.isPasswordVisible) {
        // Icône œil barré (masquer)
        this.eyeIconSvg.innerHTML = `
          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
          <line x1="2" y1="2" x2="22" y2="22"/>
        `;
      } else {
        // Icône œil normal (afficher)
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
    }
  }

  // --- STATISTIQUES ---
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

  // --- VARIANTES DE TAILLES DYNAMIQUES (VÊTEMENTS VS CHAUSSURES VS ACCESSOIRES) ---
  renderDynamicSizeInputs(category, existingSizes = null, existingStock = null) {
    if (!this.variantContainer) return;
    this.variantContainer.innerHTML = "";

    if (category === "vetements") {
      let html = `
        <div class="variant-matrix-card">
          <div class="variant-matrix-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>
            Grille des Tailles Vêtements (Options S, M, L, XL, XXL, XXXL, XXXXL)
          </div>
          <p class="variant-matrix-desc">Définissez la quantité exacte disponible pour chaque taille.</p>
          <div class="sizes-stock-grid">
      `;

      CLOTHING_SIZES.forEach(size => {
        const val = existingSizes && existingSizes[size] !== undefined ? existingSizes[size] : 5;
        html += `
          <div class="size-stock-input-card">
            <label class="size-stock-label">Taille ${size}</label>
            <input type="number" min="0" max="999" class="size-stock-num-input size-input-item" data-size="${size}" value="${val}">
          </div>
        `;
      });

      html += `
          </div>
          <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button type="button" class="action-btn action-btn-secondary" id="btn-quick-fill-clothes-10">+10 partout</button>
            <button type="button" class="action-btn action-btn-secondary" id="btn-quick-fill-clothes-0">Mettre à 0</button>
          </div>
        </div>
      `;
      this.variantContainer.innerHTML = html;

      document.getElementById("btn-quick-fill-clothes-10")?.addEventListener("click", () => {
        document.querySelectorAll(".size-input-item").forEach(inp => inp.value = 10);
      });
      document.getElementById("btn-quick-fill-clothes-0")?.addEventListener("click", () => {
        document.querySelectorAll(".size-input-item").forEach(inp => inp.value = 0);
      });

    } else if (category === "chaussures") {
      let html = `
        <div class="variant-matrix-card">
          <div class="variant-matrix-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 16v-2.38C4 11.5 5.5 10 7.5 10H11v6H4Z"/><path d="M11 16v-6h4.5c2 0 3.5 1.5 3.5 3.62V16H11Z"/><path d="M2 19h20"/></svg>
            Pointures Chaussures (38, 39, 40, 41, 42, 43, 44, 45)
          </div>
          <p class="variant-matrix-desc">Indiquez le stock restant pour chaque pointure.</p>
          <div class="sizes-stock-grid">
      `;

      SHOE_SIZES.forEach(size => {
        const val = existingSizes && existingSizes[size] !== undefined ? existingSizes[size] : 4;
        html += `
          <div class="size-stock-input-card">
            <label class="size-stock-label">N° ${size}</label>
            <input type="number" min="0" max="999" class="size-stock-num-input size-input-item" data-size="${size}" value="${val}">
          </div>
        `;
      });

      html += `
          </div>
          <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button type="button" class="action-btn action-btn-secondary" id="btn-quick-fill-shoes-5">+5 partout</button>
            <button type="button" class="action-btn action-btn-secondary" id="btn-quick-fill-shoes-0">Mettre à 0</button>
          </div>
        </div>
      `;
      this.variantContainer.innerHTML = html;

      document.getElementById("btn-quick-fill-shoes-5")?.addEventListener("click", () => {
        document.querySelectorAll(".size-input-item").forEach(inp => inp.value = 5);
      });
      document.getElementById("btn-quick-fill-shoes-0")?.addEventListener("click", () => {
        document.querySelectorAll(".size-input-item").forEach(inp => inp.value = 0);
      });

    } else {
      const val = existingStock !== null && existingStock !== undefined ? existingStock : 15;
      this.variantContainer.innerHTML = `
        <div class="variant-matrix-card">
          <div class="variant-matrix-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
            Stock Global de l'Article
          </div>
          <p class="variant-matrix-desc">Pour les accessoires et articles sans tailles variables, définissez la limite de stock disponible.</p>
          <div style="max-width: 240px;">
            <label class="form-label">Nombre d'unités en stock :</label>
            <input type="number" min="0" max="9999" id="prod-global-stock" class="form-input" style="font-weight: 700; font-size: 1.1rem;" value="${val}">
          </div>
        </div>
      `;
    }
  }

  // --- PHOTOS & STUDIO FOND BLANC PUR ---
  addImageFromUrl() {
    const url = this.imgUrlInput.value.trim();
    if (!url) return;
    this.uploadedImages.push(url);
    this.imgUrlInput.value = "";
    this.renderImagesPreview();
  }

  handleFileUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.uploadedImages.push(e.target.result);
        this.renderImagesPreview();
      };
      reader.readAsDataURL(file);
    });
    event.target.value = "";
  }

  renderImagesPreview() {
    if (!this.imagesPreviewList) return;
    this.imagesPreviewList.innerHTML = "";

    if (this.uploadedImages.length === 0) {
      this.imagesPreviewList.innerHTML = `
        <div style="font-size: 0.8rem; color: var(--slate-400); grid-column: 1/-1; padding: 0.5rem 0;">
          Aucune image ajoutée. Téléchargez un fichier ou collez une URL directe.
        </div>
      `;
      return;
    }

    this.uploadedImages.forEach((imgSrc, index) => {
      const item = document.createElement("div");
      item.style.cssText = `
        position: relative;
        width: 80px;
        height: 80px;
        border-radius: var(--radius-md);
        border: 2px solid ${index === 0 ? "var(--blue-600)" : "var(--slate-200)"};
        background: #FFFFFF;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      `;

      item.innerHTML = `
        <img src="${imgSrc}" style="width: 100%; height: 100%; object-fit: contain; padding: 4px;" alt="Aperçu ${index}">
        <button type="button" class="del-img-btn" data-index="${index}" style="
          position: absolute;
          top: 2px;
          right: 2px;
          background: rgba(220, 38, 38, 0.9);
          color: white;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          cursor: pointer;
        ">&times;</button>
        ${index === 0 ? `<span style="position: absolute; bottom: 2px; left: 2px; background: var(--blue-700); color: white; font-size: 9px; padding: 1px 4px; border-radius: 2px; font-weight: 700;">Principale</span>` : ""}
      `;

      item.querySelector(".del-img-btn").addEventListener("click", () => {
        this.uploadedImages.splice(index, 1);
        this.renderImagesPreview();
      });

      this.imagesPreviewList.appendChild(item);
    });
  }

  // --- SOUMISSION PRODUIT ---
  handleProductSubmit() {
    const title = document.getElementById("prod-title").value.trim();
    const category = this.categorySelect.value;
    const price = parseFloat(document.getElementById("prod-price").value) || 0;
    const originalPriceInput = document.getElementById("prod-original-price").value;
    const originalPrice = originalPriceInput ? parseFloat(originalPriceInput) : null;
    const badge = document.getElementById("prod-badge").value;
    const description = document.getElementById("prod-desc").value.trim();

    if (!title || price <= 0) {
      alert("Veuillez renseigner un titre valide et un prix supérieur à 0 FDJ.");
      return;
    }

    let sizes = null;
    let totalStock = 0;

    if (category === "vetements" || category === "chaussures") {
      sizes = {};
      const inputs = this.variantContainer.querySelectorAll(".size-input-item");
      inputs.forEach(inp => {
        const sizeKey = inp.dataset.size;
        const count = parseInt(inp.value) || 0;
        sizes[sizeKey] = count;
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
      badge,
      description,
      images: finalImages,
      sizes,
      totalStock,
      bgStyle: this.selectedBgStyle
    };

    if (this.currentEditingId) {
      store.updateProduct(this.currentEditingId, productPayload);
      alert(`Produit "${title}" mis à jour avec succès !`);
    } else {
      store.addProduct(productPayload);
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

    if (this.formHeading) this.formHeading.textContent = `Modifier le produit : ${product.ref}`;
    if (this.formSubmitBtn) this.formSubmitBtn.textContent = "Enregistrer les modifications";
    if (this.cancelEditBtn) this.cancelEditBtn.style.display = "inline-flex";

    document.getElementById("prod-title").value = product.title || "";
    this.categorySelect.value = product.category || "vetements";
    document.getElementById("prod-price").value = product.price || "";
    document.getElementById("prod-original-price").value = product.originalPrice || "";
    document.getElementById("prod-badge").value = product.badge || "Aucun";
    document.getElementById("prod-desc").value = product.description || "";

    this.uploadedImages = product.images ? [...product.images] : [];
    this.selectedBgStyle = product.bgStyle || "studio-white";
    if (this.bgStyleSelect) this.bgStyleSelect.value = this.selectedBgStyle;
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
    this.uploadedImages = [];
    this.renderImagesPreview();
    this.renderDynamicSizeInputs(this.categorySelect ? this.categorySelect.value : "vetements");
  }

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

    if (products.length === 0) {
      this.adminTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--slate-400);">
            Aucun article trouvé dans le catalogue.
          </td>
        </tr>
      `;
      return;
    }

    this.adminTableBody.innerHTML = "";

    products.forEach(p => {
      const tr = document.createElement("tr");

      let stockBadge = "";
      if (p.totalStock <= 0) {
        stockBadge = `<span class="size-mini-tag out" style="color: var(--danger-crimson); background: var(--danger-light); font-weight: 800;">Rupture</span>`;
      } else if (p.totalStock <= 5) {
        stockBadge = `<span class="size-mini-tag" style="color: var(--warning-amber); background: var(--warning-light); font-weight: 800;">Bas (${p.totalStock})</span>`;
      } else {
        stockBadge = `<span class="size-mini-tag" style="color: var(--success-emerald); background: var(--success-light); font-weight: 800;">En stock (${p.totalStock})</span>`;
      }

      let sizesSummary = "";
      if (p.sizes && Object.keys(p.sizes).length > 0) {
        sizesSummary = Object.entries(p.sizes)
          .map(([sz, count]) => `<span style="font-size: 0.72rem; padding: 1px 4px; margin-right: 2px; border-radius: 3px; background: ${count > 0 ? '#E2E8F0' : '#FEE2E2'}; color: ${count > 0 ? '#334155' : '#991B1B'}">${sz}:${count}</span>`)
          .join("");
      } else {
        sizesSummary = `<span style="color: var(--slate-500); font-size: 0.75rem;">Standard (${p.totalStock})</span>`;
      }

      const imgThumb = (p.images && p.images[0]) || "";

      tr.innerHTML = `
        <td style="width: 60px;">
          <img src="${imgThumb}" class="admin-table-thumb" alt="${p.title}" style="background: #ffffff; object-fit: contain; padding: 2px; border: 1px solid var(--slate-200);">
        </td>
        <td>
          <div style="font-weight: 700; color: var(--slate-900);">${p.title}</div>
          <div style="font-size: 0.75rem; color: var(--slate-400); font-family: var(--font-mono);">${p.ref}</div>
        </td>
        <td>
          <span class="modal-category-badge">${p.category}</span>
        </td>
        <td style="font-weight: 800; color: var(--blue-900); font-family: var(--font-display);">
          ${store.formatPrice(p.price)}
          ${p.originalPrice ? `<div style="font-size: 0.75rem; color: var(--slate-400); text-decoration: line-through;">${store.formatPrice(p.originalPrice)}</div>` : ""}
        </td>
        <td>
          <div style="margin-bottom: 3px;">${stockBadge}</div>
          <div style="display: flex; flex-wrap: wrap; gap: 2px;">${sizesSummary}</div>
        </td>
        <td>
          <span style="font-size: 0.75rem; background: var(--blue-50); color: var(--blue-700); padding: 2px 6px; border-radius: 4px; font-weight: 600;">
            ${p.badge || "Standard"}
          </span>
        </td>
        <td style="text-align: right; white-space: nowrap;">
          <button class="table-action-btn table-action-edit btn-edit-product" data-id="${p.id}" title="Modifier">
            Modifier
          </button>
          <button class="table-action-btn table-action-del btn-del-product" data-id="${p.id}" title="Supprimer" style="margin-left: 4px;">
            Supprimer
          </button>
        </td>
      `;

      tr.querySelector(".btn-edit-product").addEventListener("click", () => this.editProduct(p.id));
      tr.querySelector(".btn-del-product").addEventListener("click", () => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer définitivement "${p.title}" ?`)) {
          store.deleteProduct(p.id);
          this.renderAdminProductsTable();
          this.updateStats();
        }
      });

      this.adminTableBody.appendChild(tr);
    });
  }

  renderAdminOrdersTable() {
    if (!this.adminOrdersTableBody) return;
    const orders = store.getOrders();

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

    this.adminOrdersTableBody.innerHTML = "";

    orders.forEach(order => {
      const tr = document.createElement("tr");
      const itemsDesc = order.items.map(it => {
        const sz = it.size ? ` (Taille ${it.size})` : "";
        return `${it.quantity}x ${it.title}${sz}`;
      }).join(", ");

      tr.innerHTML = `
        <td style="font-family: var(--font-mono); font-weight: 700; color: var(--blue-900);">${order.id}</td>
        <td style="font-size: 0.8rem; color: var(--slate-500);">${order.date}</td>
        <td>
          <div style="font-weight: 700;">${order.customerName}</div>
          <div style="font-size: 0.75rem; color: var(--slate-500);">${order.customerPhone}</div>
          <div style="font-size: 0.72rem; color: var(--blue-700);">${order.district}</div>
        </td>
        <td style="font-size: 0.8rem; max-width: 250px; line-height: 1.3;">${itemsDesc}</td>
        <td style="font-weight: 800; color: var(--blue-900); font-family: var(--font-display);">${store.formatPrice(order.total)}</td>
        <td>
          <select class="catalog-select order-status-select" data-id="${order.id}" style="font-size: 0.75rem; padding: 2px 20px 2px 6px;">
            <option value="Envoyé sur WhatsApp" ${order.status === "Envoyé sur WhatsApp" ? "selected" : ""}>Envoyé sur WhatsApp</option>
            <option value="En cours" ${order.status === "En cours" ? "selected" : ""}>En cours</option>
            <option value="Livré" ${order.status === "Livré" ? "selected" : ""}>Livré</option>
            <option value="Annulé" ${order.status === "Annulé" ? "selected" : ""}>Annulé</option>
          </select>
        </td>
      `;

      tr.querySelector(".order-status-select").addEventListener("change", (e) => {
        store.updateOrderStatus(order.id, e.target.value);
      });

      this.adminOrdersTableBody.appendChild(tr);
    });
  }

  exportCatalogJson() {
    const products = store.getProducts();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `djibshop_catalog_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}

// Initialisation au chargement de admin.html
document.addEventListener("DOMContentLoaded", () => {
  window.adminCtrl = new AdminController();
});
