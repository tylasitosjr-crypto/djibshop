/**
 * DjibSHOP - Configuration des catégories, tailles et constantes du catalogue
 * Devise: FDJ (Franc Djiboutien)
 * Contact WhatsApp: +253 77078793
 */

// Le catalogue provient désormais exclusivement de la base Cloud Supabase (aucun ancien produit démo injecté par défaut)
const INITIAL_PRODUCTS = [];

// Identifiants et références des anciens articles de démonstration à purger automatiquement des caches navigateurs
const LEGACY_DEMO_IDS = [
  "prod-v01",
  "prod-v02",
  "prod-c01",
  "prod-c02",
  "prod-a01",
  "prod-o01"
];

const LEGACY_DEMO_REFS = [
  "DJ-VET-001",
  "DJ-VET-002",
  "DJ-CHA-101",
  "DJ-CHA-102",
  "DJ-ACC-201",
  "DJ-AUT-301"
];

const CLOTHING_SIZES = ["S", "M", "L", "XL", "XXL", "XXXL", "XXXXL"];
const SHOE_SIZES = ["37", "38", "39", "40", "41", "42", "43", "44", "45"];

// Catégories de la boutique
const CATEGORIES = [
  { id: "all", label: "Tout le catalogue", shortLabel: "Tous" },
  { id: "vetements", label: "Vêtements", shortLabel: "Vêtements" },
  { id: "chaussures", label: "Chaussures", shortLabel: "Chaussures" },
  { id: "accessoires", label: "Accessoires", shortLabel: "Accessoires" },
  { id: "autres", label: "Autres", shortLabel: "Autres" }
];
