/**
 * DjibSHOP - Gestionnaire d'état & Persistance (LocalStorage + Supabase Cloud Sync)
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
  shippingInfo: "Livraison express à Djibouti & Balbala",
  adminPassword: "abouali2004\\"
};

class Store {
  constructor() {
    this.init();
  }

  async init() {
    // 1. Initialiser le catalogue local
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

    // 5. Initialiser les commandes d'exemple si vide
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      const sampleOrders = [
        {
          id: "CMD-2026-0089",
          date: "2026-02-12 11:20",
          customerName: "Ahmed Mohamed",
          customerPhone: "+253 77 12 34 56",
          district: "Héron, Villa 45",
          items: [
            { title: "Chemise Blanche Lin Supérieur", size: "XL", quantity: 1, price: 4700 }
          ],
          total: 4700,
          status: "Livré"
        }
      ];
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(sampleOrders));
    }

    // 6. Synchronisation Supabase en arrière-plan si configuré
    if (window.supabaseService && window.supabaseService.isConfigured) {
      this.syncFromSupabase();
    }
  }

  async syncFromSupabase() {
    if (!window.supabaseService || !window.supabaseService.isConfigured) return;
    try {
      const remoteProducts = await window.supabaseService.fetchProducts();
      if (remoteProducts && remoteProducts.length > 0) {
        this.saveProducts(remoteProducts);
        window.dispatchEvent(new CustomEvent("catalog-synced", { detail: { products: remoteProducts } }));
      }
    } catch (e) {
      console.warn("Échec de synchronisation Supabase", e);
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

  async addProduct(productData) {
    const products = this.getProducts();
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
      createdAt: new Date().toISOString().split("T")[0]
    };

    products.unshift(newProduct);
    this.saveProducts(products);

    // Sync cloud Supabase
    if (window.supabaseService && window.supabaseService.isConfigured) {
      window.supabaseService.saveProduct(newProduct);
    }

    return newProduct;
  }

  async updateProduct(id, updatedFields) {
    const products = this.getProducts();
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

    // Sync cloud Supabase
    if (window.supabaseService && window.supabaseService.isConfigured) {
      window.supabaseService.saveProduct(products[index]);
    }

    return products[index];
  }

  async deleteProduct(id) {
    const products = this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    this.saveProducts(filtered);

    // Sync cloud Supabase
    if (window.supabaseService && window.supabaseService.isConfigured) {
      window.supabaseService.deleteProduct(id);
    }

    return filtered;
  }

  resetCatalogToDefault() {
    this.saveProducts(INITIAL_PRODUCTS);
    if (window.supabaseService && window.supabaseService.isConfigured) {
      window.supabaseService.syncAllToSupabase(INITIAL_PRODUCTS);
    }
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
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
    return added;
  }

  isInWishlist(productId) {
    const wishlist = this.getWishlist();
    return wishlist.includes(productId);
  }

  // --- COMMANDES ---
  getOrders() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  createOrder(customerInfo, cartItems, totalAmount) {
    const orders = this.getOrders();
    const newOrder = {
      id: "CMD-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      customerName: customerInfo.name || "Client WhatsApp",
      customerPhone: customerInfo.phone || "+253 77 ...",
      district: customerInfo.district || "Djibouti",
      items: cartItems.map(item => ({
        title: item.title,
        size: item.size,
        quantity: item.quantity,
        price: item.price
      })),
      total: totalAmount,
      status: "En attente"
    };

    orders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    // Déduire des stocks
    this.decrementStockFromOrder(newOrder);

    return newOrder;
  }

  decrementStockFromOrder(order) {
    const products = this.getProducts();
    order.items.forEach(item => {
      const prod = products.find(p => p.title === item.title);
      if (prod) {
        if (item.size && prod.sizes && prod.sizes[item.size] !== undefined) {
          if (typeof prod.sizes[item.size] === "object") {
            prod.sizes[item.size].stock = Math.max(0, prod.sizes[item.size].stock - item.quantity);
          } else {
            prod.sizes[item.size] = Math.max(0, prod.sizes[item.size] - item.quantity);
          }
          // Recalcul total
          prod.totalStock = Object.values(prod.sizes).reduce((sum, s) => {
            const qty = typeof s === "object" ? s.stock : s;
            return sum + (parseInt(qty) || 0);
          }, 0);
        } else {
          prod.totalStock = Math.max(0, prod.totalStock - item.quantity);
        }
      }
    });
    this.saveProducts(products);
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

    let message = `Bonjour DjibSHOP ! 👋\n`;
    message += `Je souhaite commander l'article suivant :\n\n`;
    message += `🛍️ *Produit :* ${product.title}\n`;
    message += `🏷️ *Réf :* ${product.ref}\n`;
    if (size) {
      message += `📏 *Taille / Pointure :* ${size}\n`;
    }
    message += `🔢 *Quantité :* ${quantity}\n`;
    message += `💰 *Prix unitaire :* ${this.formatPrice(priceToUse)}\n`;
    message += `💵 *Total :* ${this.formatPrice(priceToUse * quantity)}\n\n`;
    message += `Pouvez-vous me confirmer la disponibilité et la livraison à Djibouti ? Merci !`;

    return message;
  }

  buildCartOrderMessage(customerInfo, cartItems, totalAmount) {
    let message = `*NOUVELLE COMMANDE DJIBHOP* 🛍️\n`;
    message += `==============================\n\n`;

    if (customerInfo && (customerInfo.name || customerInfo.district || customerInfo.phone)) {
      message += `👤 *Client :* ${customerInfo.name || "Client"}\n`;
      message += `📍 *Adresse / Quartier :* ${customerInfo.district || "Djibouti"}\n`;
      message += `📞 *Téléphone / WhatsApp :* ${customerInfo.phone || "Non renseigné"}\n\n`;
    }

    message += `📋 *DÉTAIL DU PANIER :*\n`;
    cartItems.forEach((item, index) => {
      message += `${index + 1}. *${item.title}*\n`;
      if (item.size) message += `   • Taille : ${item.size}\n`;
      message += `   • Quantité : ${item.quantity}\n`;
      message += `   • Prix : ${this.formatPrice(item.price)} (${this.formatPrice(item.price * item.quantity)})\n`;
    });

    message += `\n==============================\n`;
    message += `💰 *TOTAL DE LA COMMANDE : ${this.formatPrice(totalAmount)}*\n`;
    message += `🚚 *Paiement :* À la livraison à Djibouti\n\n`;
    message += `Merci de traiter ma commande dans les plus brefs délais !`;

    return message;
  }

  // Génère l'URL WhatsApp optimale selon le système d'exploitation du client
  getWhatsAppUrl(message) {
    const settings = this.getSettings();
    const phone = settings.whatsappCleanNumber || "25377078793";
    const encoded = encodeURIComponent(message);
    const ua = navigator.userAgent || "";
    const isAndroid = /Android/i.test(ua);
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isMobile = isAndroid || isIOS || /webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua) || window.innerWidth <= 800;

    if (isAndroid) {
      // Android Intent officiel : lance l'application WhatsApp directement sans passer par api.whatsapp.com
      return `intent://send?phone=${phone}&text=${encoded}#Intent;scheme=whatsapp;S.browser_fallback_url=https%3A%2F%2Fwa.me%2F${phone}%3Ftext%3D${encoded};end`;
    } else if (isIOS) {
      // iPhone / iPad : schéma direct de l'application
      return `whatsapp://send?phone=${phone}&text=${encoded}`;
    } else if (isMobile) {
      return `https://wa.me/${phone}?text=${encoded}`;
    } else {
      // Ordinateur : WhatsApp Web direct dans la conversation
      return `https://web.whatsapp.com/send?phone=${phone}&text=${encoded}`;
    }
  }

  // Ouvre instantanément WhatsApp du vendeur sans passer par les détours ou api.whatsapp
  openWhatsApp(message) {
    const targetUrl = this.getWhatsAppUrl(message);
    const ua = navigator.userAgent || "";
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
      || (navigator.maxTouchPoints && navigator.maxTouchPoints > 1)
      || window.innerWidth <= 800;

    if (!isMobile) {
      window.open(targetUrl, "_blank");
      return;
    }

    // Déclenchement par un lien natif invisible cliqué pour respecter les règles de sécurité Chrome Android et iOS
    const link = document.createElement("a");
    link.href = targetUrl;
    link.target = "_self";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (link.parentNode) link.parentNode.removeChild(link);
    }, 150);

    // Fallback de sécurité : si après 800ms l'application n'est pas passée au premier plan
    const settings = this.getSettings();
    const phone = settings.whatsappCleanNumber || "25377078793";
    const encoded = encodeURIComponent(message);
    setTimeout(() => {
      if (document.visibilityState === "visible") {
        window.location.href = `https://wa.me/${phone}?text=${encoded}`;
      }
    }, 800);
  }

  generateDirectWhatsAppLink(product, size = null, quantity = 1, customPrice = null) {
    const message = this.buildDirectOrderMessage(product, size, quantity, customPrice);
    return this.getWhatsAppUrl(message);
  }

  generateCartWhatsAppLink(customerInfo, cartItems, totalAmount) {
    const message = this.buildCartOrderMessage(customerInfo, cartItems, totalAmount);
    return this.getWhatsAppUrl(message);
  }
}

// Instance globale
const store = new Store();
