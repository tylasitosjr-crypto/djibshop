/**
 * DjibSHOP - Supabase Cloud Database Client & Persistence
 * Synchronisation temps réel sans cache obsolète (Client SDK + Fallback REST Direct anti-blocage CDN)
 */

const DEFAULT_SUPABASE_CONFIG = {
  url: "https://wnvwobizlhnlggtlnujv.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndudndvYml6bGhubGdndGxudWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0ODUzNjYsImV4cCI6MjEwOTA2MTM2Nn0.ZDVZqD8is5IadOLTU4WNpoHU9Yz-FLIWATdcsGWd0RU"
};

const SUPABASE_CONFIG_KEY = "djibshop_supabase_config_v2";

class SupabaseService {
  constructor() {
    this.client = null;
    this.url = "";
    this.anonKey = "";
    this.isConfigured = false;
    this.init();
  }

  init() {
    let config = null;
    const saved = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (saved) {
      try {
        config = JSON.parse(saved);
      } catch (e) {
        console.error("Erreur config Supabase", e);
      }
    }

    if (!config || !config.url || !config.anonKey) {
      config = DEFAULT_SUPABASE_CONFIG;
    }

    if (config && config.url && config.anonKey) {
      this.configure(config.url, config.anonKey);
    }
  }

  configure(url, anonKey) {
    if (!url || !anonKey) return false;
    this.url = url.trim().replace(/\/+$/, "");
    this.anonKey = anonKey.trim();
    this.isConfigured = true;

    try {
      localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify({ url: this.url, anonKey: this.anonKey }));
    } catch (e) {
      console.warn("Impossible de sauvegarder la config Supabase dans localStorage", e);
    }

    try {
      if (window.supabase && typeof window.supabase.createClient === "function") {
        // Désactiver le cache navigateur sur toutes les requêtes Supabase
        this.client = window.supabase.createClient(this.url, this.anonKey, {
          auth: { persistSession: false },
          global: {
            fetch: (input, init = {}) => fetch(input, { ...init, cache: "no-store" })
          }
        });
      }
    } catch (e) {
      console.warn("Initialisation SDK Supabase ignorée, utilisation du mode REST direct :", e);
    }

    return true;
  }

  getConfig() {
    const saved = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEFAULT_SUPABASE_CONFIG;
  }

  clearConfig() {
    localStorage.removeItem(SUPABASE_CONFIG_KEY);
    this.client = null;
    this.isConfigured = false;
  }

  getRestHeaders(extra = {}) {
    return {
      "apikey": this.anonKey,
      "Authorization": `Bearer ${this.anonKey}`,
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      ...extra
    };
  }

  async testConnection() {
    if (!this.isConfigured) return { success: false, message: "Client non configuré" };
    try {
      const response = await fetch(`${this.url}/rest/v1/products?select=id&limit=1`, {
        method: "GET",
        headers: this.getRestHeaders(),
        cache: "no-store"
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }
      return { success: true, message: "Connexion réussie à Supabase !" };
    } catch (e) {
      return { success: false, message: e.message || "Erreur de connexion" };
    }
  }

  async fetchProducts(retries = 2) {
    if (!this.isConfigured) return null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Appel REST direct avec cache-busting pour garantir que les nouveaux produits s'affichent toujours
        const timestamp = Date.now();
        const endpoint = `${this.url}/rest/v1/products?select=*&order=created_at.desc&_t=${timestamp}`;
        const response = await fetch(endpoint, {
          method: "GET",
          headers: this.getRestHeaders(),
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error(`Supabase HTTP ${response.status}`);
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          return data.map(item => this.mapFromSupabase(item));
        }
      } catch (e) {
        console.warn(`Tentative ${attempt + 1}/${retries + 1} fetchProducts échouée:`, e.message);
        if (attempt < retries) {
          await new Promise(res => setTimeout(res, 600 * (attempt + 1)));
        }
      }
    }
    return null;
  }

  async saveProduct(product) {
    if (!this.isConfigured) return false;
    try {
      const payload = this.mapToSupabase(product);
      const response = await fetch(`${this.url}/rest/v1/products?on_conflict=id`, {
        method: "POST",
        headers: this.getRestHeaders({
          "Prefer": "resolution=merge-duplicates,return=representation"
        }),
        body: JSON.stringify(payload),
        cache: "no-store"
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || `HTTP ${response.status}`);
      }
      return true;
    } catch (e) {
      console.error("Supabase saveProduct error:", e);
      return false;
    }
  }

  async deleteProduct(id) {
    if (!this.isConfigured) return false;
    try {
      const response = await fetch(`${this.url}/rest/v1/products?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: this.getRestHeaders(),
        cache: "no-store"
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return true;
    } catch (e) {
      console.error("Supabase deleteProduct error:", e);
      return false;
    }
  }

  async syncAllToSupabase(products) {
    if (!this.isConfigured) return false;
    try {
      const payloads = products.map(p => this.mapToSupabase(p));
      const response = await fetch(`${this.url}/rest/v1/products?on_conflict=id`, {
        method: "POST",
        headers: this.getRestHeaders({
          "Prefer": "resolution=merge-duplicates"
        }),
        body: JSON.stringify(payloads),
        cache: "no-store"
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return true;
    } catch (e) {
      console.error("Supabase syncAll error:", e);
      return false;
    }
  }

  mapToSupabase(p) {
    return {
      id: p.id,
      ref: p.ref,
      title: p.title,
      category: p.category,
      price: p.price,
      original_price: p.originalPrice || null,
      badge: p.badge || null,
      flash_sale: !!p.flashSale,
      flash_sale_ends: p.flashSaleEnds || null,
      bg_style: p.bgStyle || "studio-white",
      description: p.description || "",
      images: p.images || [],
      sizes: p.sizes || null,
      total_stock: p.totalStock || 0,
      created_at: p.createdAt || new Date().toISOString()
    };
  }

  mapFromSupabase(row) {
    return {
      id: row.id,
      ref: row.ref,
      title: row.title,
      category: row.category,
      price: Number(row.price) || 0,
      originalPrice: row.original_price ? Number(row.original_price) : null,
      badge: row.badge,
      flashSale: !!row.flash_sale,
      flashSaleEnds: row.flash_sale_ends,
      bgStyle: row.bg_style || "studio-white",
      description: row.description || "",
      images: Array.isArray(row.images) ? row.images : [],
      sizes: row.sizes,
      totalStock: Number(row.total_stock) || 0,
      createdAt: row.created_at
    };
  }
}

window.supabaseService = new SupabaseService();
