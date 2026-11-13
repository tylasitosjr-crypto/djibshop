/**
 * DjibSHOP - Configuration des catégories, tailles et constantes du catalogue
 * Devise: FDJ (Franc Djiboutien)
 * Contact WhatsApp: +253 77078793
 */

// Catalogue officiel DjibSHOP restauré (Articles enregistrés depuis l'espace Admin)
const INITIAL_PRODUCTS = [
  {
    "id": "prod-1794410884540",
    "ref": "DJ-VET-295",
    "title": "Arsenal",
    "category": "vetements",
    "price": 1800,
    "originalPrice": 2200,
    "badge": "Nouveau",
    "flashSale": false,
    "flashSaleEnds": null,
    "bgStyle": "studio-white",
    "description": "",
    "images": [
      "img/products/prod-1794410884540-arsenal-1.jpg"
    ],
    "sizes": {
      "L": {
        "price": 1800,
        "stock": 1
      },
      "M": {
        "price": 1800,
        "stock": 1
      },
      "XL": {
        "price": 1800,
        "stock": 1
      },
      "XXL": {
        "price": 1950,
        "stock": 1
      }
    },
    "totalStock": 4,
    "createdAt": "2026-11-11T00:00:00+00:00"
  },
  {
    "id": "prod-1794410496178",
    "ref": "DJ-VET-688",
    "title": "FC Barcelone",
    "category": "vetements",
    "price": 1800,
    "originalPrice": 2200,
    "badge": "Nouveau",
    "flashSale": false,
    "flashSaleEnds": null,
    "bgStyle": "studio-white",
    "description": "",
    "images": [
      "img/products/prod-1794410496178-fc-barcelone-1.jpg"
    ],
    "sizes": {
      "L": {
        "price": 1800,
        "stock": 1
      },
      "M": {
        "price": 1800,
        "stock": 1
      },
      "XL": {
        "price": 1800,
        "stock": 1
      },
      "XXL": {
        "price": 1950,
        "stock": 1
      }
    },
    "totalStock": 4,
    "createdAt": "2026-11-11T00:00:00+00:00"
  },
  {
    "id": "prod-1793859237049",
    "ref": "DJ-VET-361",
    "title": "REAL MADRID",
    "category": "vetements",
    "price": 1800,
    "originalPrice": 2200,
    "badge": "Nouveau",
    "flashSale": false,
    "flashSaleEnds": null,
    "bgStyle": "studio-white",
    "description": "",
    "images": [
      "img/products/prod-1793859237049-real-madrid-1.jpg"
    ],
    "sizes": {
      "L": {
        "price": 1800,
        "stock": 1
      },
      "M": {
        "price": 1800,
        "stock": 1
      },
      "XL": {
        "price": 1800,
        "stock": 1
      },
      "XXL": {
        "price": 1950,
        "stock": 1
      }
    },
    "totalStock": 4,
    "createdAt": "2026-11-05T00:00:00+00:00"
  },
  {
    "id": "prod-1794410996566",
    "ref": "DJ-VET-431",
    "title": "Man City",
    "category": "vetements",
    "price": 1800,
    "originalPrice": null,
    "badge": "Nouveau",
    "flashSale": false,
    "flashSaleEnds": null,
    "bgStyle": "studio-white",
    "description": "",
    "images": [
      "img/products/prod-1794410996566-man-city-1.jpg"
    ],
    "sizes": {
      "XL": {
        "price": 1800,
        "stock": 1
      }
    },
    "totalStock": 1,
    "createdAt": "2026-11-11T00:00:00+00:00"
  },
  {
    "id": "prod-1794411372332",
    "ref": "DJ-VET-768",
    "title": "FC Barcelone",
    "category": "vetements",
    "price": 1800,
    "originalPrice": null,
    "badge": "Nouveau",
    "flashSale": false,
    "flashSaleEnds": null,
    "bgStyle": "studio-white",
    "description": "",
    "images": [
      "img/products/prod-1794411372332-fc-barcelone-1.jpg"
    ],
    "sizes": {
      "XL": {
        "price": 1800,
        "stock": 1
      }
    },
    "totalStock": 1,
    "createdAt": "2026-11-11T00:00:00+00:00"
  },
  {
    "id": "prod-1794412403718",
    "ref": "DJ-VET-858",
    "title": "Man United",
    "category": "vetements",
    "price": 1800,
    "originalPrice": null,
    "badge": "Nouveau",
    "flashSale": false,
    "flashSaleEnds": null,
    "bgStyle": "studio-white",
    "description": "",
    "images": [
      "img/products/prod-1794412403718-man-united-1.jpg"
    ],
    "sizes": {
      "L": {
        "price": 1800,
        "stock": 1
      },
      "M": {
        "price": 1800,
        "stock": 1
      },
      "XL": {
        "price": 1800,
        "stock": 1
      },
      "XXL": {
        "price": 1950,
        "stock": 1
      }
    },
    "totalStock": 4,
    "createdAt": "2026-11-11T00:00:00+00:00"
  },
  {
    "id": "prod-1794413403786",
    "ref": "DJ-VET-393",
    "title": "Bayern",
    "category": "vetements",
    "price": 1800,
    "originalPrice": null,
    "badge": "Nouveau",
    "flashSale": false,
    "flashSaleEnds": null,
    "bgStyle": "studio-white",
    "description": "",
    "images": [
      "img/products/prod-1794413403786-bayern-1.jpg"
    ],
    "sizes": {
      "L": {
        "price": 1800,
        "stock": 1
      },
      "XL": {
        "price": 1800,
        "stock": 1
      }
    },
    "totalStock": 2,
    "createdAt": "2026-11-11T00:00:00+00:00"
  },
  {
    "id": "prod-1794413671372",
    "ref": "DJ-VET-194",
    "title": "PSG",
    "category": "vetements",
    "price": 1800,
    "originalPrice": null,
    "badge": "Nouveau",
    "flashSale": false,
    "flashSaleEnds": null,
    "bgStyle": "studio-white",
    "description": "",
    "images": [
      "img/products/prod-1794413671372-psg-1.jpg"
    ],
    "sizes": {
      "XL": {
        "price": 1800,
        "stock": 1
      },
      "XXL": {
        "price": 1800,
        "stock": 1
      }
    },
    "totalStock": 2,
    "createdAt": "2026-11-11T00:00:00+00:00"
  },
  {
    "id": "prod-1794409932506",
    "ref": "DJ-VET-615",
    "title": "REAL MADRID VERT",
    "category": "vetements",
    "price": 1800,
    "originalPrice": 2200,
    "badge": "Nouveau",
    "flashSale": false,
    "flashSaleEnds": null,
    "bgStyle": "studio-white",
    "description": "",
    "images": [
      "img/products/prod-1794409932506-real-madrid-vert-1.jpg"
    ],
    "sizes": {
      "L": {
        "price": 1800,
        "stock": 1
      },
      "M": {
        "price": 1800,
        "stock": 1
      },
      "XL": {
        "price": 1800,
        "stock": 1
      },
      "XXL": {
        "price": 1950,
        "stock": 1
      }
    },
    "totalStock": 4,
    "createdAt": "2026-11-11T00:00:00+00:00"
  }
];

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
