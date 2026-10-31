/**
 * DjibSHOP - Données initiales du catalogue avec Visuels Studio Fond Blanc Pur (Shein / Alibaba Style)
 * Devise: FDJ (Franc Djiboutien)
 * Contact WhatsApp: +253 77078793
 */

const INITIAL_PRODUCTS = [
  {
    id: "prod-v01",
    ref: "DJ-VET-001",
    title: "Chemise Blanche Lin Supérieur Coupe Ajustée",
    category: "vetements",
    price: 4500,
    originalPrice: 6000,
    badge: "Flash Sale",
    flashSale: true,
    flashSaleEnds: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(), // 18h restantes
    bgStyle: "studio-white",
    description: "Chemise blanche immaculée en pur lin peigné. Tissu respirant haut de gamme spécialement sélectionné pour la chaleur de Djibouti. Coupe moderne et col thermo-collé résistant.",
    images: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80"
    ],
    sizes: {
      "S": { stock: 5, price: 4500 },
      "M": { stock: 8, price: 4500 },
      "L": { stock: 14, price: 4500 },
      "XL": { stock: 9, price: 4700 },
      "XXL": { stock: 6, price: 5000 },
      "XXXL": { stock: 3, price: 5300 }
    },
    totalStock: 45,
    createdAt: "2026-01-15"
  },
  {
    id: "prod-v02",
    ref: "DJ-VET-002",
    title: "T-Shirt Coton Bio Minimaliste Écru",
    category: "vetements",
    price: 2800,
    originalPrice: 3500,
    badge: "Bestseller",
    flashSale: false,
    bgStyle: "studio-white",
    description: "T-shirt essentiel 100% coton biologique lourd (240 GSM). Texture ultra-douce, coutures renforcées et tombé impeccable adapté à toutes les corpulences.",
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80"
    ],
    sizes: {
      "M": { stock: 12, price: 2800 },
      "L": { stock: 15, price: 2800 },
      "XL": { stock: 10, price: 3000 },
      "XXL": { stock: 8, price: 3200 }
    },
    totalStock: 45,
    createdAt: "2026-01-20"
  },
  {
    id: "prod-c01",
    ref: "DJ-CHA-101",
    title: "Sneakers Studio Sport Rouge & Blanc",
    category: "chaussures",
    price: 13500,
    originalPrice: 17000,
    badge: "Flash Sale",
    flashSale: true,
    flashSaleEnds: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(), // 12h restantes
    bgStyle: "studio-white",
    description: "Sneakers athlétiques silhouette Shein/Alibaba tendance avec amorti à mémoire de forme. Semelle crantée antidérapante idéale pour la marche urbaine à Djibouti.",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80"
    ],
    sizes: {
      "40": { stock: 4, price: 13500 },
      "41": { stock: 8, price: 13500 },
      "42": { stock: 10, price: 13500 },
      "43": { stock: 6, price: 14000 },
      "44": { stock: 3, price: 14500 }
    },
    totalStock: 31,
    createdAt: "2026-02-05"
  },
  {
    id: "prod-c02",
    ref: "DJ-CHA-102",
    title: "Baskets Basses Blanc Minimaliste Semelle Épaisse",
    category: "chaussures",
    price: 11900,
    originalPrice: 15000,
    badge: "Tendance",
    flashSale: false,
    bgStyle: "studio-white",
    description: "Baskets urbaines en cuir végan blanc immaculé. Doublure respirante et assise plantaire ergonomique. Se marie aussi bien avec un pantalon casual qu'un jean décontracté.",
    images: [
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&auto=format&fit=crop&q=80"
    ],
    sizes: {
      "39": { stock: 5, price: 11900 },
      "40": { stock: 7, price: 11900 },
      "41": { stock: 12, price: 11900 },
      "42": { stock: 9, price: 11900 },
      "43": { stock: 4, price: 12500 }
    },
    totalStock: 37,
    createdAt: "2026-02-08"
  },
  {
    id: "prod-a01",
    ref: "DJ-ACC-201",
    title: "Montre Chronographe Quartz Lunette Acier",
    category: "accessoires",
    price: 8500,
    originalPrice: 12000,
    badge: "Promo",
    flashSale: true,
    flashSaleEnds: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(), // 8h restantes
    bgStyle: "studio-gray",
    description: "Montre masculine sportive et élégante avec cadran noir profond, sous-compteurs fonctionnels et bracelet à maillons en acier inoxydable brossé.",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80"
    ],
    sizes: null,
    totalStock: 25,
    createdAt: "2026-01-25"
  },
  {
    id: "prod-o01",
    ref: "DJ-AUT-301",
    title: "Boîtier Écouteurs Pro Sans Fil Blanc Pur",
    category: "autres",
    price: 9900,
    originalPrice: 13500,
    badge: "Flash Sale",
    flashSale: true,
    flashSaleEnds: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    bgStyle: "studio-blue",
    description: "Écouteurs intra-auriculaires Bluetooth dernière génération dans leur boîtier de charge magnétique blanc brillant. Réduction de bruit active et micros antibruit.",
    images: [
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80"
    ],
    sizes: null,
    totalStock: 18,
    createdAt: "2026-02-11"
  }
];

const CLOTHING_SIZES = ["S", "M", "L", "XL", "XXL", "XXXL", "XXXXL"];
const SHOE_SIZES = ["37", "38", "39", "40", "41", "42", "43", "44", "45"];

// Catégories épurées
const CATEGORIES = [
  { id: "all", label: "Tout le catalogue", shortLabel: "Tous" },
  { id: "vetements", label: "Vêtements", shortLabel: "Vêtements" },
  { id: "chaussures", label: "Chaussures", shortLabel: "Chaussures" },
  { id: "accessoires", label: "Accessoires", shortLabel: "Accessoires" },
  { id: "autres", label: "Autres", shortLabel: "Autres" }
];
