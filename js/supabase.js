/**
 * DjibSHOP - Supabase Cloud Database Client & Persistence
 * Synchronisation temps réel sur tous les appareils (PC, Mobile, Tablettes)
 */

const DEFAULT_SUPABASE_CONFIG = {
  url: "https://wnvwobizlhnlggtlnujv.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndudndvYml6bGhubGdndGxudWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0ODUzNjYsImV4cCI6MjEwOTA2MTM2Nn0.ZDVZqD8is5IadOLTU4WNpoHU9Yz-FLIWATdcsGWd0RU"
};

const SUPABASE_CONFIG_KEY = "djibshop_supabase_config_v2";

class SupabaseService {
  constructor() {
    this.client = null;
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

    // Utiliser la configuration par défaut officielle
    if (!config || !config.url || !config.anonKey) {
      config = DEFAULT_SUPABASE_CONFIG;
    }

    if (config && config.url && config.anonKey) {
      this.configure(config.url, config.anonKey);
    }
  }

  configure(url, anonKey) {
    if (!url || !anonKey) return false;
    try {
      if (window.supabase) {
        this.client = window.supabase.createClient(url.trim(), anonKey.trim());
        this.isConfigured = true;
        localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() }));
        return true;
      }
    } catch (e) {
      console.error("Impossible d'initialiser Supabase client", e);
    }
    return false;
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

  async testConnection() {
    if (!this.client) return { success: false, message: "Client non initialisé" };
    try {
      const { data, error } = await this.client.from("products").select("id").limit(1);
      if (error) throw error;
      return { success: true, message: "Connexion réussie à Supabase !" };
    } catch (e) {
      return { success: false, message: e.message || "Erreur de connexion" };
    }
  }

  async fetchProducts() {
    if (!this.isConfigured || !this.client) return null;
    try {
      const { data, error } = await this.client
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map(item => this.mapFromSupabase(item));
      }
    } catch (e) {
      console.warn("Supabase fetchProducts warning (fallback sur local):", e.message);
    }
    return null;
  }

  async saveProduct(product) {
    if (!this.isConfigured || !this.client) return false;
    try {
      const payload = this.mapToSupabase(product);
      const { data, error } = await this.client
        .from("products")
        .upsert(payload, { onConflict: "id" })
        .select();
      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Supabase saveProduct error:", e);
      return false;
    }
  }

  async deleteProduct(id) {
    if (!this.isConfigured || !this.client) return false;
    try {
      const { error } = await this.client.from("products").delete().eq("id", id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error("Supabase deleteProduct error:", e);
      return false;
    }
  }

  async syncAllToSupabase(products) {
    if (!this.isConfigured || !this.client) return false;
    try {
      const payloads = products.map(p => this.mapToSupabase(p));
      const { error } = await this.client.from("products").upsert(payloads, { onConflict: "id" });
      if (error) throw error;
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
      price: row.price,
      originalPrice: row.original_price,
      badge: row.badge,
      flashSale: !!row.flash_sale,
      flashSaleEnds: row.flash_sale_ends,
      bgStyle: row.bg_style || "studio-white",
      description: row.description,
      images: row.images || [],
      sizes: row.sizes,
      totalStock: row.total_stock,
      createdAt: row.created_at
    };
  }
}

window.supabaseService = new SupabaseService();
