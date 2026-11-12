/**
 * DjibSHOP - Gestionnaire d'état & Persistance (Cloud-First Supabase + Cache Intelligent)
 */

const STORAGE_KEYS = {
  PRODUCTS: "djibshop_catalog_v3",
  LEGACY_PRODUCTS: ["djibshop_catalog_v2", "djibshop_catalog_v1", "djibshop_products"],
  CART: "djibshop_cart_v3",
  LEGACY_CARTS: ["djibshop_cart_v2"],
  ORDERS: "djibshop_orders_v3",
  LEGACY_ORDERS: ["djibshop_orders_v2", "djibshop_orders_v1", "djibshop_orders"],
  ADMIN_AUTH: "djibshop_admin_session_v2",
  WISHLIST: "djibshop_wishlist_v2",
  SETTINGS: "djibshop_settings_v2"
};

const DEFAULT_SETTINGS = {
  storeName: "DjibSHOP",
  whatsappNumber: "+253 77078793",
  whatsappCleanNumber: "25377078793",
  currency: "FDJ",
  city: "Djibouti-Ville",
  shippingInfo: "Livraison express à Djibouti & Balbala",
  adminPassword: "abouali2004\\"
};

const SHEIN_ORDER_STATUSES = [
  { key: "confirmee", label: "Commande confirmée", step: 1, color: "#0B4FBA", bg: "#EFF6FF" },
  { key: "collecte", label: "En cours de collecte", step: 2, color: "#D97706", bg: "#FEF3C7" },
  { key: "expedie", label: "Expédié", step: 3, color: "#7C3AED", bg: "#F3E8FF" },
  { key: "livraison", label: "En cours de livraison", step: 4, color: "#0284C7", bg: "#E0F2FE" },
  { key: "livre", label: "Livré", step: 5, color: "#059669", bg: "#D1FAE5" },
  { key: "annule", label: "Annulé", step: 0, color: "#DC2626", bg: "#FEE2E2" }
];

class Store {
  constructor() {
    this.memoryProducts = null;
    this.isLoadingCatalog = true;
    this.hasSyncedCloud = false;
    this.syncInProgress = null;
    this.init();
  }

  isLegacyDemoItem(item) {
    if (!item) return false;
    const legacyIds = typeof LEGACY_DEMO_IDS !== "undefined" ? LEGACY_DEMO_IDS : ["prod-v01", "prod-v02", "prod-c01", "prod-c02", "prod-a01", "prod-o01"];
    const legacyRefs = typeof LEGACY_DEMO_REFS !== "undefined" ? LEGACY_DEMO_REFS : ["DJ-VET-001", "DJ-VET-002", "DJ-CHA-101", "DJ-CHA-102", "DJ-ACC-201", "DJ-AUT-301"];
    return legacyIds.includes(item.id) || legacyRefs.includes(item.ref);
  }

  cleanProductsList(products) {
    if (!Array.isArray(products)) return [];
    return products.filter(p => p && p.id && p.id !== "__system_orders_v1__" && p.category !== "__system__" && !this.isLegacyDemoItem(p));
  }

  async init() {
    // 1. Purger systématiquement les anciens caches contenant les vieux articles démo
    try {
      STORAGE_KEYS.LEGACY_PRODUCTS.forEach(key => localStorage.removeItem(key));
    } catch (e) {}

    // 2. Charger le cache v3 propre s'il existe
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (cached) {
        const parsed = JSON.parse(cached);
        const cleaned = this.cleanProductsList(parsed);
        this.memoryProducts = cleaned;
        if (cleaned.length > 0) {
          this.isLoadingCatalog = false;
        }
      }
    } catch (e) {
      this.memoryProducts = [];
    }

    // 3. Initialiser les paramètres
    try {
      if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      }
    } catch (e) {}

    // 4. Migrer/nettoyer le panier pour retirer tout ancien article démo
    try {
      let currentCart = [];
      const savedCart = localStorage.getItem(STORAGE_KEYS.CART) || localStorage.getItem("djibshop_cart_v2");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          currentCart = parsedCart.filter(item => item && !this.isLegacyDemoItem(item));
        }
      }
      STORAGE_KEYS.LEGACY_CARTS.forEach(k => localStorage.removeItem(k));
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(currentCart));
    } catch (e) {}

    // 5. Initialiser la liste de souhaits (sans les anciens IDs démo)
    try {
      const savedWish = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      if (savedWish) {
        const parsedWish = JSON.parse(savedWish);
        const legacyIds = typeof LEGACY_DEMO_IDS !== "undefined" ? LEGACY_DEMO_IDS : [];
        const cleanWish = Array.isArray(parsedWish) ? parsedWish.filter(id => !legacyIds.includes(id)) : [];
        localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(cleanWish));
      } else {
        localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify([]));
      }
    } catch (e) {}

    // 6. Purger toutes les anciennes commandes WhatsApp (ex: CMD-2026-0089) et initialiser à vide
    try {
      STORAGE_KEYS.LEGACY_ORDERS.forEach(k => localStorage.removeItem(k));
      if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
      } else {
        // S'assurer qu'aucune ancienne commande démo (CMD-2026-0089) ne subsiste
        const existingOrders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || "[]");
        const cleanOrders = Array.isArray(existingOrders)
          ? existingOrders.filter(o => o && o.id !== "CMD-2026-0089")
          : [];
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(cleanOrders));
      }
    } catch (e) {}

    // 7. Synchronisation immédiate avec Supabase Cloud
    await this.syncFromSupabase();

    // 8. Re-synchroniser automatiquement quand l'utilisateur revient sur l'onglet ou retrouve la connexion
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        this.syncFromSupabase();
      }
    });

    window.addEventListener("online", () => {
      this.syncFromSupabase();
    });

    // Rafraîchissement périodique discret toutes les 45 secondes
    setInterval(() => {
      if (document.visibilityState === "visible") {
        this.syncFromSupabase();
      }
    }, 45000);
  }

  async syncFromSupabase() {
    if (!window.supabaseService || !window.supabaseService.isConfigured) {
      this.isLoadingCatalog = false;
      window.dispatchEvent(new CustomEvent("catalog-synced", { detail: { products: this.getProducts() } }));
      return;
    }

    if (this.syncInProgress) {
      return this.syncInProgress;
    }

    this.syncInProgress = (async () => {
      try {
        const remoteProducts = await window.supabaseService.fetchProducts();
        if (Array.isArray(remoteProducts)) {
          const cleanRemote = this.cleanProductsList(remoteProducts);
          this.hasSyncedCloud = true;
          this.isLoadingCatalog = false;
          this.saveProducts(cleanRemote);
          this.reconcileCartWithCatalog(cleanRemote);

          // Synchroniser également les commandes depuis Supabase si disponibles
          if (Array.isArray(window.supabaseService.lastFetchedOrders)) {
            const remoteOrders = window.supabaseService.lastFetchedOrders.filter(o => o && o.id !== "CMD-2026-0089");
            try {
              localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(remoteOrders));
            } catch (e) {}
            window.dispatchEvent(new CustomEvent("orders-synced", { detail: { orders: remoteOrders } }));
          }

          window.dispatchEvent(new CustomEvent("catalog-synced", { detail: { products: cleanRemote } }));
        } else {
          this.isLoadingCatalog = false;
          window.dispatchEvent(new CustomEvent("catalog-synced", { detail: { products: this.getProducts() } }));
        }
      } catch (e) {
        console.warn("Échec de synchronisation Supabase", e);
        this.isLoadingCatalog = false;
        window.dispatchEvent(new CustomEvent("catalog-synced", { detail: { products: this.getProducts() } }));
      } finally {
        this.syncInProgress = null;
      }
    })();

    return this.syncInProgress;
  }

  reconcileCartWithCatalog(liveProducts) {
    if (!Array.isArray(liveProducts) || liveProducts.length === 0) return;
    try {
      const cart = this.getCart();
      if (cart.length === 0) return;
      const liveIds = new Set(liveProducts.map(p => p.id));
      const validCart = cart.filter(item => liveIds.has(item.id) && !this.isLegacyDemoItem(item));
      if (validCart.length !== cart.length) {
        this.saveCart(validCart);
      }
    } catch (e) {}
  }

  // --- CATALOGUE ---
  getProducts() {
    if (Array.isArray(this.memoryProducts)) {
      return this.memoryProducts;
    }
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const parsed = data ? JSON.parse(data) : [];
      this.memoryProducts = this.cleanProductsList(parsed);
      return this.memoryProducts;
    } catch (e) {
      console.error("Erreur lecture catalogue", e);
      return [];
    }
  }

  getProductById(id) {
    const products = this.getProducts();
    return products.find(p => p.id === id);
  }

  saveProducts(products) {
    const cleaned = this.cleanProductsList(products);
    // Toujours conserver en mémoire vive (RAM) même si le quota localStorage du navigateur est atteint
    this.memoryProducts = cleaned;
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(cleaned));
    } catch (e) {
      console.warn("Quota localStorage atteint, conservation en mémoire vive et nettoyage des anciens caches.");
      try {
        STORAGE_KEYS.LEGACY_PRODUCTS.forEach(k => localStorage.removeItem(k));
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(cleaned));
      } catch (innerErr) {
        // En cas de très grosses images base64 dépassant 5 Mo, le catalogue reste 100% fonctionnel via this.memoryProducts
      }
    }
  }

  async addProduct(productData) {
    if (!this.hasSyncedCloud && window.supabaseService && window.supabaseService.isConfigured) {
      await this.syncFromSupabase();
    }

    const products = [...this.getProducts()];
    const id = "prod-" + Date.now();
    const prefix = productData.category === "vetements" ? "VET" :
                   productData.category === "chaussures" ? "CHA" :
                   productData.category === "accessoires" ? "ACC" : "AUT";
    const ref = `DJ-${prefix}-${Math.floor(100 + Math.random() * 900)}`;

    let totalStock = 0;
    if (productData.sizes && typeof productData.sizes === "object") {
      totalStock = Object.values(productData.sizes).reduce((sum, item) => {
        const qty = typeof item === "object" ? (parseInt(item.stock) || 0) : (parseInt(item) || 0);
        return sum + qty;
      }, 0);
    } else {
      totalStock = parseInt(productData.totalStock) || 0;
    }

    const newProduct = {
      ...productData,
      id,
      ref,
      totalStock,
      createdAt: new Date().toISOString()
    };

    products.unshift(newProduct);
    this.saveProducts(products);

    if (window.supabaseService && window.supabaseService.isConfigured) {
      await window.supabaseService.saveProduct(newProduct);
    }

    window.dispatchEvent(new CustomEvent("catalog-synced", { detail: { products } }));
    return newProduct;
  }

  async updateProduct(id, updatedFields) {
    if (!this.hasSyncedCloud && window.supabaseService && window.supabaseService.isConfigured) {
      await this.syncFromSupabase();
    }

    const products = [...this.getProducts()];
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;

    let totalStock = 0;
    if (updatedFields.sizes && typeof updatedFields.sizes === "object") {
      totalStock = Object.values(updatedFields.sizes).reduce((sum, item) => {
        const qty = typeof item === "object" ? (parseInt(item.stock) || 0) : (parseInt(item) || 0);
        return sum + qty;
      }, 0);
    } else if (updatedFields.totalStock !== undefined) {
      totalStock = parseInt(updatedFields.totalStock) || 0;
    } else {
      totalStock = products[index].totalStock;
    }

    products[index] = {
      ...products[index],
      ...updatedFields,
      totalStock,
      updatedAt: new Date().toISOString()
    };

    this.saveProducts(products);

    if (window.supabaseService && window.supabaseService.isConfigured) {
      await window.supabaseService.saveProduct(products[index]);
    }

    window.dispatchEvent(new CustomEvent("catalog-synced", { detail: { products } }));
    return products[index];
  }

  async deleteProduct(id) {
    const products = this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    this.saveProducts(filtered);

    if (window.supabaseService && window.supabaseService.isConfigured) {
      await window.supabaseService.deleteProduct(id);
    }

    window.dispatchEvent(new CustomEvent("catalog-synced", { detail: { products: filtered } }));
    return filtered;
  }

  async resetCatalogToDefault() {
    await this.syncFromSupabase();
    return this.getProducts();
  }

  // --- PANIER CLIENT ---
  getCart() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CART);
      const parsed = data ? JSON.parse(data) : [];
      return Array.isArray(parsed) ? parsed.filter(item => item && !this.isLegacyDemoItem(item)) : [];
    } catch {
      return [];
    }
  }

  saveCart(cart) {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {}
    window.dispatchEvent(new CustomEvent("cart-updated", { detail: { cart } }));
  }

  addToCart(product, size = null, quantity = 1, itemPrice = null) {
    const cart = this.getCart();
    const existingIndex = cart.findIndex(item => item.id === product.id && item.size === size);

    let maxAvailable = 999;
    let finalPrice = itemPrice || product.price;

    if (size && product.sizes && product.sizes[size] !== undefined) {
      const sizeVal = product.sizes[size];
      if (typeof sizeVal === "object") {
        maxAvailable = parseInt(sizeVal.stock) || 0;
        finalPrice = parseInt(sizeVal.price) || product.price;
      } else {
        maxAvailable = parseInt(sizeVal) || 0;
      }
    } else {
      maxAvailable = parseInt(product.totalStock) || 0;
    }

    if (maxAvailable <= 0) {
      return { success: false, reason: "Rupture de stock pour cette taille/option." };
    }

    if (existingIndex > -1) {
      const newQty = cart[existingIndex].quantity + quantity;
      if (newQty > maxAvailable) {
        return { 
          success: false, 
          reason: `Stock insuffisant : Seulement ${maxAvailable} unité(s) disponible(s).` 
        };
      }
      cart[existingIndex].quantity = newQty;
      cart[existingIndex].price = finalPrice;
    } else {
      if (quantity > maxAvailable) {
        return { 
          success: false, 
          reason: `Stock insuffisant : Seulement ${maxAvailable} unité(s) disponible(s).` 
        };
      }
      cart.push({
        id: product.id,
        ref: product.ref,
        title: product.title,
        price: finalPrice,
        image: (product.images && product.images[0]) || "",
        category: product.category,
        size: size,
        quantity: quantity,
        maxStock: maxAvailable
      });
    }

    this.saveCart(cart);
    return { success: true };
  }

  removeFromCart(index) {
    const cart = this.getCart();
    if (index >= 0 && index < cart.length) {
      cart.splice(index, 1);
      this.saveCart(cart);
    }
  }

  updateCartQuantity(index, quantity) {
    const cart = this.getCart();
    if (cart[index]) {
      const max = cart[index].maxStock || 999;
      const q = Math.max(1, Math.min(quantity, max));
      cart[index].quantity = q;
      this.saveCart(cart);
    }
  }

  clearCart() {
    this.saveCart([]);
  }

  getCartTotal() {
    const cart = this.getCart();
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getCartCount() {
    const cart = this.getCart();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  // --- LISTE DE SOUHAITS ---
  getWishlist() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  toggleWishlist(productId) {
    const wishlist = this.getWishlist();
    const index = wishlist.indexOf(productId);
    let added = false;
    if (index > -1) {
      wishlist.splice(index, 1);
      added = false;
    } else {
      wishlist.push(productId);
      added = true;
    }
    try {
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
    } catch (e) {}
    window.dispatchEvent(new CustomEvent("wishlist-updated", { detail: { wishlist } }));
    return added;
  }

  isInWishlist(productId) {
    const wishlist = this.getWishlist();
    return wishlist.includes(productId);
  }

  // --- COMMANDES & STATUTS TYPE SHEIN ---
  getOrderStatuses() {
    return SHEIN_ORDER_STATUSES;
  }

  normalizeOrderStatus(rawStatus) {
    if (!rawStatus) return "En cours de collecte";
    const s = String(rawStatus).trim().toLowerCase();
    if (s.includes("confirm")) return "Commande confirmée";
    if (s.includes("collect") || s.includes("attente") || s.includes("prépar")) return "En cours de collecte";
    if (s.includes("expéd")) return "Expédié";
    if (s.includes("livraison") || s.includes("route")) return "En cours de livraison";
    if (s.includes("livr")) return "Livré";
    if (s.includes("annul")) return "Annulé";
    return "En cours de collecte";
  }

  getOrders() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      const parsed = data ? JSON.parse(data) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter(o => o && o.id !== "CMD-2026-0089")
        .map(o => ({
          ...o,
          status: this.normalizeOrderStatus(o.status)
        }));
    } catch {
      return [];
    }
  }

  async syncOrdersToCloud(orders) {
    if (window.supabaseService && window.supabaseService.isConfigured && typeof window.supabaseService.saveOrdersToCloud === "function") {
      await window.supabaseService.saveOrdersToCloud(orders);
    }
    window.dispatchEvent(new CustomEvent("orders-synced", { detail: { orders } }));
  }

  async clearOrders() {
    try {
      STORAGE_KEYS.LEGACY_ORDERS.forEach(k => localStorage.removeItem(k));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
    } catch (e) {}
    await this.syncOrdersToCloud([]);
    return [];
  }

  async deleteOrder(orderId) {
    const orders = this.getOrders().filter(o => o.id !== orderId);
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {}
    await this.syncOrdersToCloud(orders);
    return orders;
  }

  async updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return null;

    const cleanStatus = this.normalizeOrderStatus(newStatus);
    orders[idx] = {
      ...orders[idx],
      status: cleanStatus,
      updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16)
    };

    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {}

    await this.syncOrdersToCloud(orders);
    return orders[idx];
  }

  createOrder(customerInfo, cartItems, totalAmount, initialStatus = "En cours de collecte") {
    const orders = this.getOrders();
    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 16);
    const newOrder = {
      id: "CMD-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000),
      date: nowStr,
      updatedAt: nowStr,
      customerName: (customerInfo && customerInfo.name) ? customerInfo.name : "Client WhatsApp",
      customerPhone: (customerInfo && customerInfo.phone) ? customerInfo.phone : "WhatsApp Direct",
      district: (customerInfo && customerInfo.district) ? customerInfo.district : "Djibouti",
      items: cartItems.map(item => ({
        id: item.id,
        ref: item.ref || "",
        title: item.title,
        size: item.size || null,
        quantity: item.quantity || 1,
        price: item.price
      })),
      total: totalAmount,
      status: this.normalizeOrderStatus(initialStatus)
    };

    orders.unshift(newOrder);
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {}

    this.decrementStockFromOrder(newOrder);
    this.syncOrdersToCloud(orders);
    return newOrder;
  }

  decrementStockFromOrder(order) {
    const products = [...this.getProducts()];
    const updatedProds = [];

    order.items.forEach(item => {
      const prod = products.find(p => (item.id && p.id === item.id) || p.title === item.title);
      if (prod) {
        if (item.size && prod.sizes && prod.sizes[item.size] !== undefined) {
          if (typeof prod.sizes[item.size] === "object") {
            prod.sizes[item.size].stock = Math.max(0, prod.sizes[item.size].stock - item.quantity);
          } else {
            prod.sizes[item.size] = Math.max(0, prod.sizes[item.size] - item.quantity);
          }
          prod.totalStock = Object.values(prod.sizes).reduce((sum, s) => {
            const qty = typeof s === "object" ? s.stock : s;
            return sum + (parseInt(qty) || 0);
          }, 0);
        } else {
          prod.totalStock = Math.max(0, prod.totalStock - item.quantity);
        }
        updatedProds.push(prod);
      }
    });

    this.saveProducts(products);

    if (window.supabaseService && window.supabaseService.isConfigured && updatedProds.length > 0) {
      updatedProds.forEach(p => window.supabaseService.saveProduct(p));
    }
  }

  // --- AUTHENTIFICATION ADMIN ---
  isAdminAuthenticated() {
    return sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === "true";
  }

  loginAdmin(password) {
    const cleanInput = (password || "").trim();
    if (cleanInput === "abouali2004\\" || cleanInput === "abouali2004") {
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, "true");
      return true;
    }
    return false;
  }

  logoutAdmin() {
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
  }

  // --- PARAMÈTRES & WHATSAPP ---
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  formatPrice(amount) {
    const val = parseInt(amount) || 0;
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FDJ";
  }

  buildDirectOrderMessage(product, size = null, quantity = 1, customPrice = null) {
    const priceToUse = customPrice || product.price;

    let message = `Bonjour DjibSHOP,\n`;
    message += `Je souhaite commander l'article suivant :\n\n`;
    message += `*Article :* ${product.title}\n`;
    message += `*Réf :* ${product.ref}\n`;
    if (size) {
      message += `*Taille / Pointure :* ${size}\n`;
    }
    message += `*Quantité :* ${quantity}\n`;
    message += `*Prix unitaire :* ${this.formatPrice(priceToUse)}\n`;
    message += `*Total :* ${this.formatPrice(priceToUse * quantity)}\n\n`;
    message += `Merci !`;

    return message;
  }

  buildCartOrderMessage(customerInfo, cartItems, totalAmount) {
    let message = `*COMMANDE DJIBSHOP*\n`;
    message += `------------------------------\n\n`;

    if (customerInfo && (customerInfo.name || customerInfo.district || customerInfo.phone)) {
      message += `*Client :* ${customerInfo.name || "Client"}\n`;
      message += `*Adresse / Quartier :* ${customerInfo.district || "Djibouti"}\n`;
      message += `*Téléphone :* ${customerInfo.phone || "Non renseigné"}\n\n`;
    }

    message += `*ARTICLES COMMANDÉS :*\n`;
    cartItems.forEach((item, index) => {
      message += `${index + 1}. *${item.title}* (${item.ref || ""})\n`;
      if (item.size) message += `   - Taille : ${item.size}\n`;
      message += `   - Quantité : ${item.quantity}\n`;
      message += `   - Sous-total : ${this.formatPrice(item.price * item.quantity)}\n`;
    });

    message += `\n------------------------------\n`;
    message += `*TOTAL : ${this.formatPrice(totalAmount)}*\n\n`;
    message += `Merci !`;

    return message;
  }

  getPreferredWhatsAppApp() {
    const pref = localStorage.getItem("djibshop_wa_app");
    return (pref === "business") ? "business" : "normal";
  }

  setPreferredWhatsAppApp(appType) {
    const cleanType = (appType === "business") ? "business" : "normal";
    localStorage.setItem("djibshop_wa_app", cleanType);
    window.dispatchEvent(new CustomEvent("wa-pref-changed", { detail: cleanType }));
  }

  getWhatsAppUrl(message, appType = null) {
    const settings = this.getSettings();
    const phone = settings.whatsappCleanNumber || "25377078793";
    const encoded = encodeURIComponent(message);
    const ua = navigator.userAgent || "";
    const isAndroid = /Android/i.test(ua);
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isMobile = isAndroid || isIOS || /webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua) || window.innerWidth <= 800;

    const chosenApp = appType || this.getPreferredWhatsAppApp();

    if (isAndroid) {
      const pkg = (chosenApp === "business") ? "com.whatsapp.w4b" : "com.whatsapp";
      return `intent://send?phone=${phone}&text=${encoded}#Intent;scheme=whatsapp;package=${pkg};end;`;
    } else if (isIOS) {
      return `whatsapp://send?phone=${phone}&text=${encoded}`;
    } else if (isMobile) {
      return `https://wa.me/${phone}?text=${encoded}`;
    } else {
      return `https://web.whatsapp.com/send?phone=${phone}&text=${encoded}`;
    }
  }

  openWhatsApp(message, appType = null) {
    const targetUrl = this.getWhatsAppUrl(message, appType);
    const ua = navigator.userAgent || "";
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
      || (navigator.maxTouchPoints && navigator.maxTouchPoints > 1)
      || window.innerWidth <= 800;

    if (!isMobile) {
      window.open(targetUrl, "_blank");
      return;
    }

    const link = document.createElement("a");
    link.href = targetUrl;
    link.target = "_self";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (link.parentNode) link.parentNode.removeChild(link);
    }, 150);
  }

  generateDirectWhatsAppLink(product, size = null, quantity = 1, customPrice = null, appType = null) {
    const message = this.buildDirectOrderMessage(product, size, quantity, customPrice);
    return this.getWhatsAppUrl(message, appType);
  }

  generateCartWhatsAppLink(customerInfo, cartItems, totalAmount, appType = null) {
    const message = this.buildCartOrderMessage(customerInfo, cartItems, totalAmount);
    return this.getWhatsAppUrl(message, appType);
  }
}

// Instance globale
const store = new Store();
