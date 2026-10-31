/**
 * DjibSHOP - Gestionnaire d'état & Persistance LocalStorage
 */

const STORAGE_KEYS = {
  PRODUCTS: "djibshop_catalog_v2",
  CART: "djibshop_cart_v2",
  ORDERS: "djibshop_orders_v2",
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
  shippingInfo: "Livraison rapide à Djibouti & Balbala",
  // Accepte abouali2004\ et abouali2004
  adminPassword: "abouali2004\\"
};

class Store {
  constructor() {
    this.init();
  }

  init() {
    // 1. Initialiser le catalogue
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      this.saveProducts(INITIAL_PRODUCTS);
    }

    // 2. Initialiser les paramètres
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }

    // 3. Initialiser le panier
    if (!localStorage.getItem(STORAGE_KEYS.CART)) {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
    }

    // 4. Initialiser la liste de souhaits
    if (!localStorage.getItem(STORAGE_KEYS.WISHLIST)) {
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify([]));
    }

    // 5. Initialiser les commandes
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      const sampleOrders = [
        {
          id: "CMD-2026-0089",
          date: "2026-02-12 11:20",
          customerName: "Ahmed Mohamed",
          customerPhone: "+253 77 12 34 56",
          district: "Héron, Villa 45",
          items: [
            { title: "Chemise Blanche Lin Supérieur", size: "XL", quantity: 1, price: 4500 }
          ],
          total: 4500,
          status: "Livré"
        },
        {
          id: "CMD-2026-0090",
          date: "2026-02-13 16:45",
          customerName: "Fatouma Ali",
          customerPhone: "+253 77 65 43 21",
          district: "Balbala, Cheik Moussa",
          items: [
            { title: "Sneakers Studio Sport Rouge & Blanc", size: "41", quantity: 1, price: 13500 },
            { title: "Sacoche Urbaine Cuir Véritable", size: null, quantity: 1, price: 8900 }
          ],
          total: 22400,
          status: "En cours"
        }
      ];
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(sampleOrders));
    }
  }

  // --- CATALOGUE ---
  getProducts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return data ? JSON.parse(data) : INITIAL_PRODUCTS;
    } catch (e) {
      console.error("Erreur lecture catalogue", e);
      return INITIAL_PRODUCTS;
    }
  }

  getProductById(id) {
    const products = this.getProducts();
    return products.find(p => p.id === id);
  }

  saveProducts(products) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }

  addProduct(productData) {
    const products = this.getProducts();
    const id = "prod-" + Date.now();
    const prefix = productData.category === "vetements" ? "VET" :
                   productData.category === "chaussures" ? "CHA" :
                   productData.category === "accessoires" ? "ACC" : "AUT";
    const ref = `DJ-${prefix}-${Math.floor(100 + Math.random() * 900)}`;

    let totalStock = 0;
    if (productData.sizes && typeof productData.sizes === "object") {
      totalStock = Object.values(productData.sizes).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
    } else {
      totalStock = parseInt(productData.totalStock) || 0;
    }

    const newProduct = {
      ...productData,
      id,
      ref,
      totalStock,
      createdAt: new Date().toISOString().split("T")[0]
    };

    products.unshift(newProduct);
    this.saveProducts(products);
    return newProduct;
  }

  updateProduct(id, updatedFields) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;

    let totalStock = 0;
    if (updatedFields.sizes && typeof updatedFields.sizes === "object") {
      totalStock = Object.values(updatedFields.sizes).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
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
    return products[index];
  }

  deleteProduct(id) {
    const products = this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    this.saveProducts(filtered);
    return filtered;
  }

  resetCatalogToDefault() {
    this.saveProducts(INITIAL_PRODUCTS);
    return INITIAL_PRODUCTS;
  }

  // --- PANIER CLIENT ---
  getCart() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CART);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveCart(cart) {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent("cart-updated", { detail: { cart } }));
  }

  addToCart(product, size = null, quantity = 1) {
    const cart = this.getCart();
    const existingIndex = cart.findIndex(item => item.id === product.id && item.size === size);

    let maxAvailable = 999;
    if (size && product.sizes && product.sizes[size] !== undefined) {
      maxAvailable = parseInt(product.sizes[size]) || 0;
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
        price: product.price,
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

  // --- COMMANDES ET HISTORIQUE ---
  getOrders() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  recordWhatsAppOrder(orderData) {
    const orders = this.getOrders();
    const newOrder = {
      id: `CMD-2026-${String(orders.length + 101).padStart(4, "0")}`,
      date: new Date().toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }),
      items: orderData.items,
      total: orderData.total,
      district: orderData.district || "Non précisé",
      customerName: orderData.customerName || "Client WhatsApp",
      customerPhone: orderData.customerPhone || "Non renseigné",
      status: "Envoyé sur WhatsApp"
    };
    orders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    return newOrder;
  }

  updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders();
    const target = orders.find(o => o.id === orderId);
    if (target) {
      target.status = newStatus;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    }
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
    let wishlist = this.getWishlist();
    const idx = wishlist.indexOf(productId);
    let added = false;
    if (idx > -1) {
      wishlist.splice(idx, 1);
      added = false;
    } else {
      wishlist.push(productId);
      added = true;
    }
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
    window.dispatchEvent(new CustomEvent("wishlist-updated", { detail: { wishlist } }));
    return added;
  }

  isInWishlist(productId) {
    return this.getWishlist().includes(productId);
  }

  // --- AUTHENTIFICATION ADMIN ROBUSTE ---
  isAdminAuthenticated() {
    return sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === "authenticated";
  }

  loginAdmin(inputPassword) {
    if (!inputPassword) return false;
    const cleanInput = inputPassword.trim();

    // Accepte avec backslash exact 'abouali2004\' ou sans backslash 'abouali2004'
    const validPasswords = [
      "abouali2004\\",
      "abouali2004",
      "abouali2004/",
      "abouali2004\\\\"
    ];

    if (validPasswords.includes(cleanInput) || cleanInput.startsWith("abouali2004")) {
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, "authenticated");
      return true;
    }
    return false;
  }

  logoutAdmin() {
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
  }

  // --- PARAMÈTRES BOUTIQUE ---
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  updateSettings(newSettings) {
    const current = this.getSettings();
    const merged = { ...current, ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
    return merged;
  }

  // --- FORMATAGE ---
  formatPrice(amount) {
    if (amount === undefined || amount === null || isNaN(amount)) return "0 FDJ";
    return new Intl.NumberFormat("fr-FR").format(Math.round(amount)) + " FDJ";
  }

  buildSingleProductWhatsAppUrl(product, size, quantity, note = "") {
    const settings = this.getSettings();
    const phone = settings.whatsappCleanNumber;
    const sizeInfo = size ? `\n• Taille choisie : *${size}*` : "";
    const totalPrice = this.formatPrice(product.price * quantity);
    
    const message = 
`Bonjour DjibSHOP ! Je souhaite commander cet article :

• Produit : *${product.title}*
• Référence : \`${product.ref}\`${sizeInfo}
• Quantité : *${quantity}*
• Prix unitaire : ${this.formatPrice(product.price)}
• Montant total : *${totalPrice}*
${note ? `\n• Note / Adresse : ${note}` : ""}

Merci de me confirmer la disponibilité et le délai de livraison à Djibouti.`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  buildCartWhatsAppUrl(cartItems, customerDetails = {}) {
    const settings = this.getSettings();
    const phone = settings.whatsappCleanNumber;
    const total = this.getCartTotal();

    let itemsList = "";
    cartItems.forEach((item, index) => {
      const sizeStr = item.size ? ` (Taille: ${item.size})` : "";
      itemsList += `${index + 1}. *${item.title}*${sizeStr}\n   Quantité : ${item.quantity} | Total : ${this.formatPrice(item.price * item.quantity)}\n`;
    });

    const clientInfo = 
`• Client : ${customerDetails.name || "Client"}
• Téléphone : ${customerDetails.phone || "Non renseigné"}
• Quartier / Adresse de livraison : ${customerDetails.district || "Djibouti-Ville"}`;

    const message = 
`Bonjour DjibSHOP ! Je valide mon panier de commande :

--- ARTICLES COMMANDÉS ---
${itemsList}
---
• TOTAL DE LA COMMANDE : *${this.formatPrice(total)}*

--- INFORMATIONS DE LIVRAISON ---
${clientInfo}
${customerDetails.notes ? `• Remarques : ${customerDetails.notes}\n` : ""}
Merci de me contacter pour la validation de ma commande.`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }
}

// Instance globale du magasin
const store = new Store();
