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
    badge: "Promo",
    description: "Chemise blanche immaculée en pur lin peigné. Tissu respirant haut de gamme spécialement sélectionné pour la chaleur de Djibouti. Coupe moderne et col thermo-collé résistant.",
    images: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80"
    ],
    sizes: {
      "S": 5,
      "M": 8,
      "L": 14,
      "XL": 9,
      "XXL": 6,
      "XXXL": 3,
      "XXXXL": 2
    },
    totalStock: 47,
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
    description: "T-shirt essentiel 100% coton biologique lourd (240 GSM). Texture ultra-douce, coutures renforcées et tombé impeccable adapté à toutes les corpulences.",
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80"
    ],
    sizes: {
      "S": 6,
      "M": 12,
      "L": 15,
      "XL": 10,
      "XXL": 8,
      "XXXL": 4,
      "XXXXL": 3
    },
    totalStock: 58,
    createdAt: "2026-01-20"
  },
  {
    id: "prod-v03",
    ref: "DJ-VET-003",
    title: "Polo Bleu Marine Piqué Classic Fit",
    category: "vetements",
    price: 3900,
    originalPrice: null,
    badge: "Nouveau",
    description: "Polo d'inspiration sportive haut de gamme en maille piquée aérée. Col côtelé anti-plissement et boutons en nacre gravés.",
    images: [
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&auto=format&fit=crop&q=80"
    ],
    sizes: {
      "S": 4,
      "M": 7,
      "L": 10,
      "XL": 5,
      "XXL": 4,
      "XXXL": 2,
      "XXXXL": 1
    },
    totalStock: 33,
    createdAt: "2026-02-01"
  },
  {
    id: "prod-c01",
    ref: "DJ-CHA-101",
    title: "Sneakers Studio Sport Rouge & Blanc Elite",
    category: "chaussures",
    price: 13500,
    originalPrice: 16000,
    badge: "Bestseller",
    description: "Baskets ultra-légères avec semelle amortissante à bulles d'air. Finition studio en cuir synthétique microperforé et tissu respirant haute durabilité.",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80"
    ],
    sizes: {
      "38": 2,
      "39": 4,
      "40": 9,
      "41": 12,
      "42": 11,
      "43": 8,
      "44": 5,
      "45": 2
    },
    totalStock: 53,
    createdAt: "2026-01-10"
  },
  {
    id: "prod-c02",
    ref: "DJ-CHA-102",
    title: "Baskets Basses Blanc Pur Minimalistes",
    category: "chaussures",
    price: 11900,
    originalPrice: null,
    badge: "Tendance",
    description: "La sneaker blanche universelle indispensable. Cuir lisse résistant aux rayures, doublure textile anti-transpirante et semelle cousue 360° pour une longévité maximale.",
    images: [
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80"
    ],
    sizes: {
      "38": 3,
      "39": 5,
      "40": 8,
      "41": 10,
      "42": 8,
      "43": 6,
      "44": 3,
      "45": 1
    },
    totalStock: 44,
    createdAt: "2026-01-18"
  },
  {
    id: "prod-a01",
    ref: "DJ-ACC-201",
    title: "Montre Minimaliste Chrono Boîtier Acier Inox",
    category: "accessoires",
    price: 14500,
    originalPrice: 18000,
    badge: "Luxe",
    description: "Montre de précision avec cadran blanc épuré, index argentés et bracelet interchangeable. Verre saphir inrayable étanche 50 mètres. Garantie 1 an.",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80"
    ],
    sizes: null,
    totalStock: 16,
    createdAt: "2026-02-05"
  },
  {
    id: "prod-a02",
    ref: "DJ-ACC-202",
    title: "Sacoche Urbaine Cuir Véritable Noire",
    category: "accessoires",
    price: 8900,
    originalPrice: 11000,
    badge: "Promo",
    description: "Sacoche bandoulière compacte avec compartiment pour tablette, smartphone et passeport. Fermetures éclair renforcées et finitions coutures main.",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80"
    ],
    sizes: null,
    totalStock: 22,
    createdAt: "2026-02-08"
  },
  {
    id: "prod-a03",
    ref: "DJ-ACC-203",
    title: "Lunettes de Soleil Design Solaire Noir Mat",
    category: "accessoires",
    price: 5200,
    originalPrice: null,
    badge: "Essentiel",
    description: "Lunettes modernes avec verres teintés catégorie 3 protection UV400 100%. Monture solide et légère en acétate, parfaites pour le soleil vif de Djibouti.",
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80"
    ],
    sizes: null,
    totalStock: 30,
    createdAt: "2026-01-28"
  },
  {
    id: "prod-o01",
    ref: "DJ-AUT-301",
    title: "Boîtier Écouteurs Pro Sans Fil Blanc Pur",
    category: "autres",
    price: 9900,
    originalPrice: 13500,
    badge: "Promo",
    description: "Écouteurs intra-auriculaires Bluetooth dernière génération dans leur boîtier de charge magnétique blanc brillant. Réduction de bruit active et micros antibruit pour appels clairs.",
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
const SHOE_SIZES = ["38", "39", "40", "41", "42", "43", "44", "45"];

// Catégories épurées sans parenthèses
const CATEGORIES = [
  { id: "all", label: "Tout le catalogue", shortLabel: "Tous" },
  { id: "vetements", label: "Vêtements", shortLabel: "Vêtements" },
  { id: "chaussures", label: "Chaussures", shortLabel: "Chaussures" },
  { id: "accessoires", label: "Accessoires", shortLabel: "Accessoires" },
  { id: "autres", label: "Autres", shortLabel: "Autres" }
];
