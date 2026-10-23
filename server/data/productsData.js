const productsData = [
  // ================= 1. ELECTRONICS =================
  {
    name: "Apple MacBook Air M3 (13.6-inch, 16GB, 512GB SSD) - Space Grey",
    slug: "apple-macbook-air-m3-space-grey",
    categorySlug: "electronics",
    subcategory: "Laptops",
    brand: "Apple",
    description: "Supercharged by the next-generation M3 chip, the redesigned MacBook Air combines incredible performance and up to 18 hours of battery life into its strikingly thin aluminum enclosure.",
    shortDescription: "Apple M3 chip, 13.6\" Liquid Retina Display, 16GB RAM, 512GB SSD.",
    price: 134900,
    discountPrice: 122900,
    stock: 28,
    rating: 4.8,
    numReviews: 142,
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Color", options: ["Space Grey", "Silver", "Midnight", "Starlight"] },
      { name: "Storage", options: ["256GB SSD", "512GB SSD", "1TB SSD"] }
    ],
    specifications: [
      { key: "Processor", value: "Apple M3 8-core CPU" },
      { key: "Display", value: "13.6-inch Liquid Retina with True Tone" },
      { key: "RAM", value: "16GB Unified Memory" },
      { key: "Battery", value: "Up to 18 hours battery life" }
    ],
    isFeatured: true,
    isBestSeller: true,
    isTrending: true,
    isActive: true
  },
  {
    name: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    slug: "sony-wh-1000xm5-wireless-headphones",
    categorySlug: "electronics",
    subcategory: "Headphones",
    brand: "Sony",
    description: "Industry-leading noise cancellation optimized to you with two processors and 8 microphones. Magnificent Sound, engineered to perfection with the new Integrated Processor V1.",
    shortDescription: "Industry-leading ANC, 30hr battery, Speak-to-Chat, multipoint connection.",
    price: 34990,
    discountPrice: 28990,
    stock: 45,
    rating: 4.7,
    numReviews: 320,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Color", options: ["Black", "Silver", "Midnight Blue"] }
    ],
    specifications: [
      { key: "Noise Cancellation", value: "Dual Processor V1 + QN1" },
      { key: "Battery Life", value: "Up to 30 hours" },
      { key: "Charging", value: "3 min quick charge for 3 hrs playback" }
    ],
    isFeatured: true,
    isBestSeller: true,
    isTrending: false,
    isActive: true
  },
  {
    name: "Samsung Galaxy S24 Ultra 5G (Titanium Gray, 256GB)",
    slug: "samsung-galaxy-s24-ultra-5g",
    categorySlug: "electronics",
    subcategory: "Smartphones",
    brand: "Samsung",
    description: "Welcome to the era of mobile AI. With Galaxy S24 Ultra in your hands, you can unleash whole new levels of creativity, productivity and possibility.",
    shortDescription: "Galaxy AI, 200MP Quad Camera, S-Pen included, Snapdragon 8 Gen 3.",
    price: 134999,
    discountPrice: 119999,
    stock: 35,
    rating: 4.8,
    numReviews: 215,
    images: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Color", options: ["Titanium Gray", "Titanium Black", "Titanium Violet"] },
      { name: "Storage", options: ["256GB", "512GB", "1TB"] }
    ],
    specifications: [
      { key: "Display", value: "6.8\" Dynamic AMOLED 2X, 120Hz" },
      { key: "Camera", value: "200MP + 50MP + 12MP + 10MP" },
      { key: "Battery", value: "5000 mAh Fast Charging" }
    ],
    isFeatured: true,
    isBestSeller: true,
    isTrending: true,
    isActive: true
  },
  {
    name: "Apple Watch Series 10 GPS 46mm Smartwatch",
    slug: "apple-watch-series-10-gps-46mm",
    categorySlug: "electronics",
    subcategory: "Smartwatches",
    brand: "Apple",
    description: "Thinnest Apple Watch ever with the biggest display yet. Provides deep insights into your health, fitness tracking, ECG, and sleep apnea notifications.",
    shortDescription: "Wide-angle OLED, Depth and water temperature gauge, Fast charging.",
    price: 49900,
    discountPrice: 44900,
    stock: 50,
    rating: 4.9,
    numReviews: 98,
    images: [
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Band Color", options: ["Jet Black", "Rose Gold", "Silver"] }
    ],
    specifications: [
      { key: "Display", value: "Always-On Retina OLED" },
      { key: "Water Resistance", value: "50m water resistant" }
    ],
    isFeatured: false,
    isBestSeller: true,
    isTrending: true,
    isActive: true
  },
  {
    name: "Sony Alpha 7 IV Full-Frame Mirrorless Camera (Body Only)",
    slug: "sony-alpha-7-iv-mirrorless-camera",
    categorySlug: "electronics",
    subcategory: "Cameras",
    brand: "Sony",
    description: "An ideal all-arounder that goes beyond basic, the Sony a7 IV does double duty with strong stills and video performance with 33MP Exmor R sensor.",
    shortDescription: "33MP Full-Frame sensor, 4K 60p 10-bit recording, Real-time Eye AF.",
    price: 242990,
    discountPrice: 209990,
    stock: 12,
    rating: 4.9,
    numReviews: 64,
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [],
    specifications: [
      { key: "Sensor", value: "33MP Full-Frame Exmor R CMOS" },
      { key: "Video", value: "4K 60p 10-bit 4:2:2" }
    ],
    isFeatured: false,
    isBestSeller: false,
    isTrending: false,
    isActive: true
  },
  {
    name: "LG 55-inch 4K Smart OLED evo C3 Series TV",
    slug: "lg-55-inch-4k-smart-oled-tv",
    categorySlug: "electronics",
    subcategory: "Televisions",
    brand: "LG",
    description: "Self-lit OLED pixels create pure blacks and infinite contrast with Brightness Booster. Powered by α9 AI Processor Gen6 with Dolby Vision IQ and Dolby Atmos.",
    shortDescription: "OLED evo 4K, 120Hz refresh, Dolby Vision IQ, AI Sound Pro.",
    price: 154990,
    discountPrice: 114990,
    stock: 15,
    rating: 4.8,
    numReviews: 87,
    images: [
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Screen Size", options: ["48 inch", "55 inch", "65 inch"] }
    ],
    specifications: [
      { key: "Resolution", value: "4K Ultra HD (3840x2160)" },
      { key: "Refresh Rate", value: "120Hz Native" }
    ],
    isFeatured: false,
    isBestSeller: true,
    isTrending: false,
    isActive: true
  },
  {
    name: "JBL Charge 5 Portable Bluetooth Speaker with Powerbank",
    slug: "jbl-charge-5-bluetooth-speaker",
    categorySlug: "electronics",
    subcategory: "Speakers",
    brand: "JBL",
    description: "Take the party with you no matter what the weather. The JBL Charge 5 speaker delivers bold JBL Original Pro Sound with long excursion driver, separate tweeter and dual pumping bass radiators.",
    shortDescription: "IP67 waterproof and dustproof, 20 hours playtime, built-in powerbank.",
    price: 17999,
    discountPrice: 13999,
    stock: 60,
    rating: 4.7,
    numReviews: 412,
    images: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Color", options: ["Black", "Blue", "Squad Camo", "Red"] }
    ],
    specifications: [
      { key: "Playtime", value: "Up to 20 hours" },
      { key: "Waterproof Rating", value: "IP67" }
    ],
    isFeatured: false,
    isBestSeller: false,
    isTrending: true,
    isActive: true
  },
  {
    name: "Anker 737 Power Bank 24,000mAh 140W Fast Charger",
    slug: "anker-737-power-bank-140w",
    categorySlug: "electronics",
    subcategory: "Accessories",
    brand: "Anker",
    description: "Equipped with the latest Power Delivery 3.1 and bi-directional technology to quickly recharge the portable charger or get a 140W ultra-powerful charge.",
    shortDescription: "24,000mAh capacity, 140W two-way fast charging, smart digital display.",
    price: 14999,
    discountPrice: 11499,
    stock: 40,
    rating: 4.8,
    numReviews: 189,
    images: [
      "https://images.unsplash.com/photo-1609592424300-349079a4ecf5?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [],
    specifications: [
      { key: "Capacity", value: "24,000mAh" },
      { key: "Output", value: "140W Max" }
    ],
    isFeatured: false,
    isBestSeller: false,
    isTrending: false,
    isActive: true
  },

  // ================= 2. WOMEN'S FASHION =================
  {
    name: "Pure Kanjivaram Silk Saree with Rich Zari Pallu (Crimson Red)",
    slug: "pure-kanjivaram-silk-saree-crimson-red",
    categorySlug: "womens-fashion",
    subcategory: "Sarees",
    brand: "KalaKriti Heritage",
    description: "Handcrafted pure mulberry silk Kanjivaram saree adorned with traditional peacock motifs woven in genuine gold zari, accompanied by unstitched matching blouse piece.",
    shortDescription: "Authentic Kanchipuram silk, pure gold zari border, includes blouse piece.",
    price: 18999,
    discountPrice: 12499,
    stock: 22,
    rating: 4.9,
    numReviews: 184,
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Color", options: ["Crimson Red", "Royal Peacock Blue", "Emerald Green", "Mustard Gold"] }
    ],
    specifications: [
      { key: "Fabric", value: "Pure Mulberry Silk" },
      { key: "Length", value: "6.3 meters with Blouse Piece" },
      { key: "Weave", value: "Handloom Jacquard Zari" },
      { key: "Occasion", value: "Wedding, Festive, Traditional" }
    ],
    isFeatured: true,
    isBestSeller: true,
    isTrending: true,
    isActive: true
  },
  {
    name: "Embroidered Chanderi Silk Anarkali Kurti with Dupatta Set",
    slug: "chanderi-silk-anarkali-kurti-dupatta-set",
    categorySlug: "womens-fashion",
    subcategory: "Kurtis",
    brand: "Libas Premium",
    description: "Graceful Chanderi silk Anarkali kurta featuring intricate sequin zari embroidery along neckline and sleeves, paired with tailored pants and organza floral dupatta.",
    shortDescription: "Chanderi silk, full flair Anarkali with pants and embroidered organza dupatta.",
    price: 4999,
    discountPrice: 2899,
    stock: 65,
    rating: 4.7,
    numReviews: 290,
    images: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Size", options: ["S", "M", "L", "XL", "XXL"] },
      { name: "Color", options: ["Powder Blue", "Dusty Peach", "Mint Green"] }
    ],
    specifications: [
      { key: "Fabric", value: "Chanderi Silk with Cotton Lining" },
      { key: "Pattern", value: "Anarkali Kurti with Zari Embroidered Neck" }
    ],
    isFeatured: true,
    isBestSeller: true,
    isTrending: true,
    isActive: true
  },
  {
    name: "Designer Floral Semi-Stitched Georgette Bridal Lehenga Choli",
    slug: "designer-floral-georgette-lehenga-choli",
    categorySlug: "womens-fashion",
    subcategory: "Lehengas",
    brand: "Riwayat Studio",
    description: "Spectacular bridal semi-stitched lehenga in heavy georgette adorned with threadwork, mirror embroidery, and dual-tone net dupatta with scallop borders.",
    shortDescription: "Heavy georgette with micro-velvet touch, 4-meter flare, designer latkan.",
    price: 24999,
    discountPrice: 14999,
    stock: 14,
    rating: 4.8,
    numReviews: 76,
    images: [
      "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Color", options: ["Wine Red", "Rani Pink", "Navy Blue"] }
    ],
    specifications: [
      { key: "Fabric", value: "Fox Georgette with Shantoon Inner" },
      { key: "Stitch Type", value: "Semi-Stitched (Up to 44 Bust)" }
    ],
    isFeatured: true,
    isBestSeller: false,
    isTrending: true,
    isActive: true
  },
  {
    name: "Floral Tiered Bohemian Maxi Summer Dress",
    slug: "floral-tiered-bohemian-maxi-summer-dress",
    categorySlug: "womens-fashion",
    subcategory: "Dresses",
    brand: "Zara Bloom",
    description: "Breezy tiered maxi dress woven from airy rayon viscose, highlighted by flutter cap sleeves, elasticated smocked waist, and tiered ruffled hem.",
    shortDescription: "Flattering A-line maxi dress, breathable rayon fabric, bohemian floral print.",
    price: 2999,
    discountPrice: 1799,
    stock: 80,
    rating: 4.6,
    numReviews: 145,
    images: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Size", options: ["XS", "S", "M", "L", "XL"] },
      { name: "Color", options: ["Ivory Floral", "Sage Floral", "Navy Floral"] }
    ],
    specifications: [
      { key: "Material", value: "100% Breathable Rayon" },
      { key: "Neckline", value: "V-Neck with Tie Strings" }
    ],
    isFeatured: false,
    isBestSeller: true,
    isTrending: false,
    isActive: true
  },
  {
    name: "Banarasi Cotton Silk Handwoven Festive Saree (Mustard Gold)",
    slug: "banarasi-cotton-silk-festive-saree-mustard",
    categorySlug: "womens-fashion",
    subcategory: "Sarees",
    brand: "KalaKriti Heritage",
    description: "Drape yourself in Varanasi elegance with this lightweight Banarasi cotton-silk saree featuring floral jaal design and antique gold zari borders.",
    shortDescription: "Authentic Banarasi weave, lightweight festive wear, rich antique pallu.",
    price: 5499,
    discountPrice: 3299,
    stock: 35,
    rating: 4.7,
    numReviews: 92,
    images: [
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Color", options: ["Mustard Gold", "Teal Green", "Burgundy"] }
    ],
    specifications: [
      { key: "Fabric", value: "Banarasi Cotton Silk Blend" },
      { key: "Wash Care", value: "Dry Clean Recommended" }
    ],
    isFeatured: false,
    isBestSeller: true,
    isTrending: false,
    isActive: true
  },
  {
    name: "Kundan & Pearl Studded Choker Jewellery Set with Earrings & Maang Tikka",
    slug: "kundan-pearl-choker-jewellery-set",
    categorySlug: "womens-fashion",
    subcategory: "Jewellery",
    brand: "Zaveri Pearls",
    description: "Exquisite 22k gold plated bridal choker necklace studded with green and white Kundan stones, cluster pearls, matching dangle earrings, and maang tikka.",
    shortDescription: "Handcrafted brass alloy, Kundan stone work, adjustable dori closure.",
    price: 3999,
    discountPrice: 1899,
    stock: 55,
    rating: 4.8,
    numReviews: 310,
    images: [
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Stone Accent", options: ["Emerald Green", "Ruby Red", "Mint Green", "Pearl White"] }
    ],
    specifications: [
      { key: "Base Material", value: "High Grade Brass with Gold Micro-plating" },
      { key: "Package Contents", value: "1 Choker, 1 Pair Earrings, 1 Maang Tikka" }
    ],
    isFeatured: false,
    isBestSeller: false,
    isTrending: true,
    isActive: true
  },
  {
    name: "Miraggio Textured Vegan Leather Shoulder Tote Handbag",
    slug: "miraggio-vegan-leather-shoulder-tote-handbag",
    categorySlug: "womens-fashion",
    subcategory: "Handbags",
    brand: "Miraggio",
    description: "Structured luxury tote designed for urban fashion and everyday work, featuring dual compartments, zip organizer, and gold-tone metallic hardware.",
    shortDescription: "Premium scratch-resistant vegan leather, holds 13-inch laptop.",
    price: 4999,
    discountPrice: 2699,
    stock: 45,
    rating: 4.7,
    numReviews: 120,
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Color", options: ["Tan Brown", "Noir Black", "Burgundy", "Ivory Cream"] }
    ],
    specifications: [
      { key: "Material", value: "Premium Vegan Leather" },
      { key: "Closure", value: "Heavy-duty YKK Zipper" }
    ],
    isFeatured: false,
    isBestSeller: true,
    isTrending: false,
    isActive: true
  },
  {
    name: "Straight Cut Embroidered Rayon Kurti (Olive Green)",
    slug: "straight-cut-embroidered-rayon-kurti-olive",
    categorySlug: "womens-fashion",
    subcategory: "Kurtis",
    brand: "Libas Premium",
    description: "Casual everyday office-wear kurti in soft rayon fabric featuring delicate thread embroidery on yoke and side slit hemline.",
    shortDescription: "Super soft breathable rayon, calf-length, 3/4 sleeves.",
    price: 1699,
    discountPrice: 799,
    stock: 90,
    rating: 4.5,
    numReviews: 240,
    images: [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Size", options: ["S", "M", "L", "XL", "XXL"] }
    ],
    specifications: [
      { key: "Fabric", value: "100% Viscose Rayon" },
      { key: "Sleeve Length", value: "Three-Quarter Sleeves" }
    ],
    isFeatured: false,
    isBestSeller: false,
    isTrending: false,
    isActive: true
  },

  // ================= 3. MEN'S FASHION =================
  {
    name: "Raymond Men's Pure Linen Slim-Fit Casual Shirt (Sky Blue)",
    slug: "raymond-mens-pure-linen-casual-shirt-blue",
    categorySlug: "mens-fashion",
    subcategory: "Shirts",
    brand: "Raymond",
    description: "Crafted from fine European flax linen, this shirt offers unparalleled breathability and sophisticated casual elegance with a spread collar and curved hem.",
    shortDescription: "100% European flax linen, garment-washed softness, slim fit.",
    price: 3499,
    discountPrice: 2199,
    stock: 75,
    rating: 4.8,
    numReviews: 285,
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Size", options: ["38 (S)", "40 (M)", "42 (L)", "44 (XL)"] },
      { name: "Color", options: ["Sky Blue", "White", "Pale Pink", "Olive Green"] }
    ],
    specifications: [
      { key: "Material", value: "100% Pure Flax Linen" },
      { key: "Fit", value: "Slim Fit" },
      { key: "Collar", value: "Semi-Cutaway Collar" }
    ],
    isFeatured: true,
    isBestSeller: true,
    isTrending: true,
    isActive: true
  },
  {
    name: "Levi's 511 Slim Fit Stretch Denim Jeans (Dark Indigo)",
    slug: "levis-511-slim-fit-stretch-denim-jeans",
    categorySlug: "mens-fashion",
    subcategory: "Jeans",
    brand: "Levi's",
    description: "A modern slim with room to move. The 511 Slim Fit Stretch Jeans are a classic since right now. These jeans sit below the waist with a slim leg from hip to ankle.",
    shortDescription: "Premium stretch denim, classic 5-pocket styling, zip fly with button closure.",
    price: 4599,
    discountPrice: 2999,
    stock: 90,
    rating: 4.7,
    numReviews: 530,
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Waist Size", options: ["30", "32", "34", "36", "38"] },
      { name: "Length", options: ["32", "34"] }
    ],
    specifications: [
      { key: "Material", value: "98% Cotton, 2% Elastane" },
      { key: "Rise", value: "Mid Rise" },
      { key: "Wash", value: "Dark Indigo Wash" }
    ],
    isFeatured: true,
    isBestSeller: true,
    isTrending: false,
    isActive: true
  },
  {
    name: "Manyavar Men's Jacquard Silk Kurta Churidar Set (Maroon & Cream)",
    slug: "manyavar-mens-jacquard-silk-kurta-churidar-maroon",
    categorySlug: "mens-fashion",
    subcategory: "Traditional Wear",
    brand: "Manyavar",
    description: "Make an unforgettable impression at festivities with this rich self-design woven jacquard silk kurta with mandarin collar, paired with comfortable cream churidar.",
    shortDescription: "Royal jacquard art silk, includes kurta and churidar pyjama.",
    price: 6999,
    discountPrice: 4499,
    stock: 35,
    rating: 4.8,
    numReviews: 120,
    images: [
      "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Size", options: ["S (36)", "M (38)", "L (40)", "XL (42)", "XXL (44)"] }
    ],
    specifications: [
      { key: "Fabric", value: "Art Silk Jacquard" },
      { key: "Neck", value: "Mandarin Collar with Placket Buttons" }
    ],
    isFeatured: true,
    isBestSeller: false,
    isTrending: true,
    isActive: true
  },
  {
    name: "Supima Cotton Heavyweight Crewneck T-Shirt (Pack of 2)",
    slug: "supima-cotton-heavyweight-crewneck-tshirt-pack-2",
    categorySlug: "mens-fashion",
    subcategory: "T-shirts",
    brand: "March Tee",
    description: "Crafted from 100% American Supima long-staple cotton (220 GSM), designed with anti-pilling fabric, pre-shrunk finish, and ribbed collar that never sags.",
    shortDescription: "220 GSM heavyweight 100% Supima cotton, zero sag collar.",
    price: 2499,
    discountPrice: 1599,
    stock: 110,
    rating: 4.9,
    numReviews: 410,
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Size", options: ["S", "M", "L", "XL", "XXL"] },
      { name: "Color Combo", options: ["Black + White", "Navy + Charcoal", "Olive + Beige"] }
    ],
    specifications: [
      { key: "Weight", value: "220 GSM Heavyweight" },
      { key: "Yarn", value: "100% Long-Staple Supima Cotton" }
    ],
    isFeatured: false,
    isBestSeller: true,
    isTrending: true,
    isActive: true
  },
  {
    name: "Tommy Hilfiger Genuine Leather Bifold Wallet with RFID Protection",
    slug: "tommy-hilfiger-genuine-leather-bifold-wallet",
    categorySlug: "mens-fashion",
    subcategory: "Wallets",
    brand: "Tommy Hilfiger",
    description: "Sleek handcrafted full-grain leather wallet featuring 6 card slots, 2 slip pockets, dual cash compartment, and embedded RFID blocking shield for card safety.",
    shortDescription: "100% genuine Napa leather with embossed logo and RFID protection.",
    price: 2999,
    discountPrice: 1799,
    stock: 65,
    rating: 4.8,
    numReviews: 230,
    images: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Color", options: ["Classic Black", "Cognac Brown", "Navy Blue"] }
    ],
    specifications: [
      { key: "Material", value: "Genuine Full Grain Leather" },
      { key: "Dimensions", value: "11 cm x 9 cm x 1.5 cm" }
    ],
    isFeatured: false,
    isBestSeller: true,
    isTrending: false,
    isActive: true
  },
  {
    name: "Fossil Townsman Automatic Skeleton Dial Leather Watch",
    slug: "fossil-townsman-automatic-skeleton-dial-watch",
    categorySlug: "mens-fashion",
    subcategory: "Watches",
    brand: "Fossil",
    description: "Taking its cue from 1960s architectural design, this Townsman watch reveals the intricate inner workings of its self-winding automatic mechanical rotor.",
    shortDescription: "Self-winding mechanical automatic, genuine leather strap, 44mm case.",
    price: 18995,
    discountPrice: 13995,
    stock: 25,
    rating: 4.8,
    numReviews: 178,
    images: [
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Strap Color", options: ["Dark Brown", "Black"] }
    ],
    specifications: [
      { key: "Movement", value: "Mechanical Automatic (No Battery Needed)" },
      { key: "Water Resistance", value: "5 ATM (50m)" }
    ],
    isFeatured: false,
    isBestSeller: false,
    isTrending: true,
    isActive: true
  },
  {
    name: "Puma Mens Nitro Pure Running Sneakers",
    slug: "puma-mens-nitro-pure-running-sneakers",
    categorySlug: "mens-fashion",
    subcategory: "Sneakers",
    brand: "Puma",
    description: "Engineered for speed and supreme comfort, featuring advanced NITRO nitrogen-infused foam for maximum responsiveness and high-traction PUMAGRIP rubber.",
    shortDescription: "Nitro foam midsole, breathable mono-mesh upper, reflective safety strips.",
    price: 7999,
    discountPrice: 4499,
    stock: 55,
    rating: 4.7,
    numReviews: 195,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Shoe Size (UK)", options: ["7", "8", "9", "10", "11"] }
    ],
    specifications: [
      { key: "Cushioning", value: "NITRO Foam Midsole" },
      { key: "Outsole", value: "All-surface PUMAGRIP" }
    ],
    isFeatured: false,
    isBestSeller: true,
    isTrending: false,
    isActive: true
  },
  {
    name: "Wildcraft Men's Waterproof Windcheater Hooded Biker Jacket",
    slug: "wildcraft-mens-waterproof-windcheater-jacket",
    categorySlug: "mens-fashion",
    subcategory: "Jackets",
    brand: "Wildcraft",
    description: "Stay shielded during monsoon and highway riding with this seam-sealed nylon ripstop jacket equipped with adjustable hood, reflective accents and breathable inner mesh.",
    shortDescription: "Waterproof up to 5000mm, packable into pouch, seam-sealed.",
    price: 3499,
    discountPrice: 2299,
    stock: 40,
    rating: 4.6,
    numReviews: 140,
    images: [
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Size", options: ["M", "L", "XL", "XXL"] },
      { name: "Color", options: ["Charcoal Grey", "Navy Blue", "Olive"] }
    ],
    specifications: [
      { key: "Fabric", value: "Nylon Ripstop with PU Coating" },
      { key: "Closure", value: "Reverse Coil Waterproof Zipper" }
    ],
    isFeatured: false,
    isBestSeller: false,
    isTrending: false,
    isActive: true
  },

  // ================= 4. KIDS AND BABY =================
  {
    name: "LEGO Classic Large Creative Brick Box (790 Pieces)",
    slug: "lego-classic-large-creative-brick-box-790-pieces",
    categorySlug: "kids-and-baby",
    subcategory: "Toys",
    brand: "LEGO",
    description: "Inspire open-ended building play with 790 pieces in 33 different colors, including windows, doors, wheels, tires, and green baseplate.",
    shortDescription: "790 colorful LEGO bricks, includes ideas book and storage box.",
    price: 5499,
    discountPrice: 4299,
    stock: 50,
    rating: 4.9,
    numReviews: 610,
    images: [
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [],
    specifications: [
      { key: "Piece Count", value: "790 Pieces" },
      { key: "Age Range", value: "4 Years and Above" }
    ],
    isFeatured: true,
    isBestSeller: true,
    isTrending: true,
    isActive: true
  },
  {
    name: "LuvLap Sunshine Baby Stroller / Pram with Reversible Handle",
    slug: "luvlap-sunshine-baby-stroller-pram",
    categorySlug: "kids-and-baby",
    subcategory: "Baby Products",
    brand: "LuvLap",
    description: "Certified safety European standard stroller with 3-position reclining seat, reversible handlebar so mom can see the baby, 5-point safety harness and swivel wheels.",
    shortDescription: "Reversible handle, 3-position seat recline, 5-point safety harness.",
    price: 6999,
    discountPrice: 4899,
    stock: 30,
    rating: 4.7,
    numReviews: 380,
    images: [
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Color", options: ["Navy Blue", "Slate Grey", "Wine Red"] }
    ],
    specifications: [
      { key: "Weight Capacity", value: "Up to 15 kg" },
      { key: "Age Limit", value: "0 to 3 Years" }
    ],
    isFeatured: true,
    isBestSeller: true,
    isTrending: false,
    isActive: true
  },
  {
    name: "Hopscotch Unisex Organic Cotton Romper Sleepsuits (Pack of 3)",
    slug: "hopscotch-organic-cotton-baby-romper-pack-3",
    categorySlug: "kids-and-baby",
    subcategory: "Kids' Clothing",
    brand: "Hopscotch",
    description: "Ultra-gentle GOTS certified 100% organic cotton baby onesies with nickel-free snaps along the inseam for effortless diaper changes and tagless comfort.",
    shortDescription: "100% certified organic cotton, anti-allergenic, two-way zipper snaps.",
    price: 1999,
    discountPrice: 1199,
    stock: 85,
    rating: 4.8,
    numReviews: 210,
    images: [
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Age", options: ["0-3 Months", "3-6 Months", "6-9 Months", "9-12 Months"] }
    ],
    specifications: [
      { key: "Fabric", value: "GOTS Certified 100% Organic Cotton" }
    ],
    isFeatured: false,
    isBestSeller: true,
    isTrending: false,
    isActive: true
  },
  {
    name: "Skybags Ergonomic Water-Resistant School Backpack (32L)",
    slug: "skybags-ergonomic-water-resistant-school-backpack",
    categorySlug: "kids-and-baby",
    subcategory: "School Bags",
    brand: "Skybags",
    description: "Spacious 3-compartment school bag featuring spine-support padded back panel, bottle holders, integrated pencil organizer, and water-repellent polyester fabric.",
    shortDescription: "32 Liters capacity, spine-support airflow mesh, reflective tape.",
    price: 2499,
    discountPrice: 1399,
    stock: 70,
    rating: 4.6,
    numReviews: 190,
    images: [
      "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Design", options: ["Cosmic Galaxy", "Super Dynamo Blue", "Pastel Floral"] }
    ],
    specifications: [
      { key: "Capacity", value: "32 Liters" },
      { key: "Compartments", value: "3 Main + 1 Front Quick Access" }
    ],
    isFeatured: false,
    isBestSeller: false,
    isTrending: true,
    isActive: true
  },

  // ================= 5. HOME AND KITCHEN =================
  {
    name: "Prestige Iris Plus 750 Watt Mixer Grinder with 4 Stainless Steel Jars",
    slug: "prestige-iris-plus-750w-mixer-grinder",
    categorySlug: "home-and-kitchen",
    subcategory: "Kitchen Appliances",
    brand: "Prestige",
    description: "Heavy-duty 750W copper motor with overload protection, 3 stainless steel multi-utility grinding jars plus a transparent juicer jar with blade extractor.",
    shortDescription: "750 Watt high-torque motor, 4 heavy-duty jars, 2-year warranty.",
    price: 6295,
    discountPrice: 3499,
    stock: 60,
    rating: 4.7,
    numReviews: 890,
    images: [
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [],
    specifications: [
      { key: "Wattage", value: "750 Watts" },
      { key: "Jars Included", value: "Wet (1.5L), Dry (1L), Chutney (300ml), Juicer (1.5L)" }
    ],
    isFeatured: true,
    isBestSeller: true,
    isTrending: true,
    isActive: true
  },
  {
    name: "Wonderchef Tri-Ply Stainless Steel 3-Piece Cookware Set with Lids",
    slug: "wonderchef-tri-ply-stainless-steel-3-piece-cookware-set",
    categorySlug: "home-and-kitchen",
    subcategory: "Cookware",
    brand: "Wonderchef",
    description: "Professional chef grade tri-ply construction (304 steel inner + aluminum core + 430 magnetic steel outer) for uniform heat distribution without food burning.",
    shortDescription: "Kadhai with lid (2.5L), Fry Pan (24cm), Saucepan (1.5L), induction compatible.",
    price: 7500,
    discountPrice: 4299,
    stock: 45,
    rating: 4.8,
    numReviews: 240,
    images: [
      "https://images.unsplash.com/photo-1584990347449-74d1a38f381f?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [],
    specifications: [
      { key: "Material", value: "Tri-Ply 304 Food Grade Stainless Steel" },
      { key: "Induction Friendly", value: "Yes, compatible with all cooktops" }
    ],
    isFeatured: true,
    isBestSeller: true,
    isTrending: false,
    isActive: true
  },
  {
    name: "Bombay Dyeing 100% Pure Egyptian Cotton King Size Bedsheet with 2 Pillow Covers",
    slug: "bombay-dyeing-egyptian-cotton-king-size-bedsheet",
    categorySlug: "home-and-kitchen",
    subcategory: "Bedsheets",
    brand: "Bombay Dyeing",
    description: "Indulge in 400 Thread Count luxury sateen weave cotton bedsheet that offers cloud-like softness, breathable thermal comfort, and color-lock guarantee.",
    shortDescription: "400 TC Pure Egyptian Cotton, 108 x 108 inches, 2 pillow covers.",
    price: 3999,
    discountPrice: 2199,
    stock: 80,
    rating: 4.8,
    numReviews: 310,
    images: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Pattern", options: ["Floral Bloom", "Geometric Moroccan", "Solid Slate Grey", "Classic White"] }
    ],
    specifications: [
      { key: "Thread Count", value: "400 TC Sateen Weave" },
      { key: "Dimensions", value: "274 cm x 274 cm (King Size)" }
    ],
    isFeatured: false,
    isBestSeller: true,
    isTrending: false,
    isActive: true
  },
  {
    name: "Philips Smart Wi-Fi LED Desk Lamp with Tunable White and Dimming",
    slug: "philips-smart-wifi-led-desk-lamp",
    categorySlug: "home-and-kitchen",
    subcategory: "Lamps",
    brand: "Philips",
    description: "Eye-care anti-glare architectural desk lamp controllable via CASA App, Alexa, or touch panel. Seamlessly adjust from warm relaxing 2700K to daylight 6500K.",
    shortDescription: "Tunable white CCT, eye-protect honeycomb lens, USB charging port.",
    price: 3499,
    discountPrice: 2299,
    stock: 55,
    rating: 4.7,
    numReviews: 165,
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Color", options: ["Matte White", "Space Grey"] }
    ],
    specifications: [
      { key: "Lumens", value: "800 Lumens" },
      { key: "Voice Assistant", value: "Works with Alexa & Google Assistant" }
    ],
    isFeatured: false,
    isBestSeller: false,
    isTrending: true,
    isActive: true
  },

  // ================= 6. BEAUTY AND PERSONAL CARE =================
  {
    name: "The Derma Co 10% Niacinamide Serum with Zinc for Acne Marks (30ml)",
    slug: "the-derma-co-10-percent-niacinamide-serum-30ml",
    categorySlug: "beauty-and-personal-care",
    subcategory: "Skincare",
    brand: "The Derma Co",
    description: "Formulated with 10% pure Niacinamide and 1% Zinc PCA, this dermatologically tested face serum reduces acne marks, controls excess oil, and refines skin texture.",
    shortDescription: "Fades dark spots, controls sebum, dermatologist formulated.",
    price: 599,
    discountPrice: 499,
    stock: 150,
    rating: 4.6,
    numReviews: 1240,
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [],
    specifications: [
      { key: "Skin Type", value: "Acne-prone, Oily, Combination" },
      { key: "Volume", value: "30 ml" }
    ],
    isFeatured: true,
    isBestSeller: true,
    isTrending: true,
    isActive: true
  },
  {
    name: "Philips OneBlade Pro Hybrid Trimmer & Shaver for Men",
    slug: "philips-oneblade-pro-hybrid-trimmer-shaver",
    categorySlug: "beauty-and-personal-care",
    subcategory: "Grooming Kits",
    brand: "Philips",
    description: "Trim, edge, and shave any length of hair. Revolutionary dual-sided cutter moves 12,000 times per minute with protective glide coating for zero nicks and cuts.",
    shortDescription: "14-length precision comb, wet & dry use, 90 mins Li-ion battery.",
    price: 4995,
    discountPrice: 3499,
    stock: 65,
    rating: 4.8,
    numReviews: 780,
    images: [
      "https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [],
    specifications: [
      { key: "Battery Life", value: "90 Minutes" },
      { key: "Blade Life", value: "Up to 4 Months per Blade" }
    ],
    isFeatured: true,
    isBestSeller: true,
    isTrending: false,
    isActive: true
  },
  {
    name: "Forest Essentials Luxury Ayurvedic Soundarya Radiance Cream with 24K Gold",
    slug: "forest-essentials-soundarya-radiance-cream-gold",
    categorySlug: "beauty-and-personal-care",
    subcategory: "Skincare",
    brand: "Forest Essentials",
    description: "An iconic Ayurvedic formulation enriched with 24 Karat Gold Bhasma, cold-pressed oils, and saffron to nourish deep skin tissues and restore youthful firmness.",
    shortDescription: "Infused with 24K gold bhasma, saffron, SPF 25, anti-aging formula.",
    price: 5975,
    discountPrice: 5299,
    stock: 25,
    rating: 4.9,
    numReviews: 180,
    images: [
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [],
    specifications: [
      { key: "Ayurvedic Herbs", value: "Saffron, Turmeric, Ashwagandha, Pure 24K Gold" },
      { key: "Net Weight", value: "50g" }
    ],
    isFeatured: false,
    isBestSeller: false,
    isTrending: true,
    isActive: true
  },
  {
    name: "M.A.C Retro Matte Lipstick - Ruby Woo (3g)",
    slug: "mac-retro-matte-lipstick-ruby-woo",
    categorySlug: "beauty-and-personal-care",
    subcategory: "Makeup",
    brand: "M.A.C",
    description: "The world's most famous vivid blue-red lipstick with completely matte finish, high-pigment payoff, and all-day 12-hour wear without smudging.",
    shortDescription: "Iconic ultra-matte vivid blue-red lipstick, 12-hour wear.",
    price: 2300,
    discountPrice: 1950,
    stock: 90,
    rating: 4.9,
    numReviews: 950,
    images: [
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [],
    specifications: [
      { key: "Shade", value: "Ruby Woo (Vivid Blue-Red)" },
      { key: "Finish", value: "Retro Matte" }
    ],
    isFeatured: false,
    isBestSeller: true,
    isTrending: false,
    isActive: true
  },

  // ================= 7. FOOTWEAR =================
  {
    name: "Nike Air Jordan 1 Retro High OG - Chicago Edition",
    slug: "nike-air-jordan-1-retro-high-og-chicago",
    categorySlug: "footwear",
    subcategory: "Sneakers",
    brand: "Nike",
    description: "The icon that started sneaker culture. Crafted with premium genuine leather upper, encapsulated Air-Sole cushioning in heel, and classic rubber cupsole.",
    shortDescription: "Iconic silhouette, premium full-grain leather, Air-Sole cushioning.",
    price: 16995,
    discountPrice: 13995,
    stock: 20,
    rating: 4.9,
    numReviews: 440,
    images: [
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Size (UK)", options: ["7", "8", "9", "10", "11"] }
    ],
    specifications: [
      { key: "Upper", value: "100% Genuine Leather" },
      { key: "Sole", value: "Rubber Cupsole with Deep Flex Grooves" }
    ],
    isFeatured: true,
    isBestSeller: true,
    isTrending: true,
    isActive: true
  },
  {
    name: "Red Chief Genuine Leather Handcrafted Formal Oxford Shoes",
    slug: "red-chief-genuine-leather-formal-oxford-shoes",
    categorySlug: "footwear",
    subcategory: "Formal Shoes",
    brand: "Red Chief",
    description: "Meticulously hand-burnished crust calfskin leather oxfords with Goodyear welted construction, cushioned memory-foam insole, and anti-skid leather-rubber sole.",
    shortDescription: "Hand-burnished calfskin leather, Goodyear welted, orthotic insole.",
    price: 5999,
    discountPrice: 3799,
    stock: 45,
    rating: 4.7,
    numReviews: 190,
    images: [
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Size (UK)", options: ["7", "8", "9", "10"] },
      { name: "Color", options: ["Tan Burnished", "Classic Black"] }
    ],
    specifications: [
      { key: "Upper", value: "Full Grain Crust Leather" },
      { key: "Insole", value: "Anti-Fatigue Memory Foam" }
    ],
    isFeatured: false,
    isBestSeller: true,
    isTrending: false,
    isActive: true
  },
  {
    name: "Bata Women's Block Heel Ankle Strap Sandals (Nude Beige)",
    slug: "bata-womens-block-heel-ankle-strap-sandals",
    categorySlug: "footwear",
    subcategory: "Heels",
    brand: "Bata",
    description: "Elegant 2.5-inch block heel sandals featuring cushioned footbed, secure gold-buckle ankle strap, and non-slip TPR outsole for whole-day comfort.",
    shortDescription: "2.5-inch block heel, extra cushioned footbed, all-day comfort.",
    price: 2499,
    discountPrice: 1499,
    stock: 65,
    rating: 4.6,
    numReviews: 210,
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Size (UK)", options: ["4", "5", "6", "7", "8"] },
      { name: "Color", options: ["Nude Beige", "Midnight Black", "Rose Gold"] }
    ],
    specifications: [
      { key: "Heel Height", value: "2.5 Inches" },
      { key: "Insole Cushioning", value: "Dual Density Soft Foam" }
    ],
    isFeatured: false,
    isBestSeller: false,
    isTrending: true,
    isActive: true
  },
  {
    name: "Adidas Ultraboost Light Running & Training Shoes",
    slug: "adidas-ultraboost-light-running-shoes",
    categorySlug: "footwear",
    subcategory: "Sneakers",
    brand: "Adidas",
    description: "Experience epic energy return with the lightest Ultraboost ever made. Featuring revolutionary Light BOOST foam, Primeknit+ forged upper, and Continental rubber outsole.",
    shortDescription: "Ultra-lightweight Boost foam, Primeknit upper, Continental rubber grip.",
    price: 18999,
    discountPrice: 14499,
    stock: 35,
    rating: 4.8,
    numReviews: 320,
    images: [
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Size (UK)", options: ["7", "8", "9", "10", "11"] },
      { name: "Color", options: ["Core Black", "Cloud White"] }
    ],
    specifications: [
      { key: "Cushioning", value: "Light BOOST Energy Foam" },
      { key: "Outsole", value: "Continental Better Rubber" }
    ],
    isFeatured: true,
    isBestSeller: true,
    isTrending: true,
    isActive: true
  },

  // ================= 8. GROCERY AND DAILY ESSENTIALS =================
  {
    name: "Tata Sampann 100% Unpolished Toor Dal (Pigeon Pea, 1kg)",
    slug: "tata-sampann-unpolished-toor-dal-1kg",
    categorySlug: "grocery-and-daily-essentials",
    subcategory: "Packaged Foods",
    brand: "Tata Sampann",
    description: "Nutritious unpolished toor dal that undergoes no artificial polishing with water, oil, or leather, retaining natural protein and wholesome dietary fiber.",
    shortDescription: "100% unpolished, high dietary protein, natural grain richness.",
    price: 220,
    discountPrice: 175,
    stock: 200,
    rating: 4.8,
    numReviews: 1850,
    images: [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Pack Size", options: ["1 kg", "2 kg", "5 kg"] }
    ],
    specifications: [
      { key: "Type", value: "Unpolished Organic Pulse" },
      { key: "Country of Origin", value: "India" }
    ],
    isFeatured: true,
    isBestSeller: true,
    isTrending: false,
    isActive: true
  },
  {
    name: "Blue Tokai Coffee Roasters Vienna Roast Ground Coffee (250g)",
    slug: "blue-tokai-vienna-roast-ground-coffee-250g",
    categorySlug: "grocery-and-daily-essentials",
    subcategory: "Beverages",
    brand: "Blue Tokai",
    description: "100% Arabica specialty coffee roasted dark to bring forward intense cocoa and toasted walnut notes, perfect for French press, South Indian filter or espresso.",
    shortDescription: "100% Arabica, dark roast, cocoa and oak notes, freshly ground.",
    price: 490,
    discountPrice: 420,
    stock: 120,
    rating: 4.9,
    numReviews: 630,
    images: [
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Grind Size", options: ["French Press", "South Indian Filter", "Aeropress", "Whole Beans"] }
    ],
    specifications: [
      { key: "Roast Level", value: "Dark Roast" },
      { key: "Estate", value: "Attikan Estate, Biligiriranga Hills" }
    ],
    isFeatured: true,
    isBestSeller: true,
    isTrending: true,
    isActive: true
  },
  {
    name: "Happilo Premium California Roasted & Salted Almonds (500g)",
    slug: "happilo-california-roasted-salted-almonds-500g",
    categorySlug: "grocery-and-daily-essentials",
    subcategory: "Snacks",
    brand: "Happilo",
    description: "Crunchy non-GMO California almonds dry roasted to perfection with a light pinch of Himalayan pink rock salt. High in plant protein and vitamin E.",
    shortDescription: "Dry roasted with Himalayan pink salt, zero trans fats, high protein.",
    price: 699,
    discountPrice: 499,
    stock: 140,
    rating: 4.8,
    numReviews: 920,
    images: [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [],
    specifications: [
      { key: "Dietary Preference", value: "Gluten-Free, Vegan, Non-GMO" },
      { key: "Net Weight", value: "500g Resealable Pouch" }
    ],
    isFeatured: false,
    isBestSeller: true,
    isTrending: false,
    isActive: true
  },
  {
    name: "Daawat Rozana Gold Aged Long Grain Basmati Rice (5kg)",
    slug: "daawat-rozana-gold-aged-basmati-rice-5kg",
    categorySlug: "grocery-and-daily-essentials",
    subcategory: "Packaged Foods",
    brand: "Daawat",
    description: "Fluffy, non-sticky and delightfully aromatic long-grain aged Basmati rice, carefully matured to perfection for everyday royal meals and biryanis.",
    shortDescription: "Naturally aged, aromatic long grains, perfect non-sticky texture.",
    price: 495,
    discountPrice: 385,
    stock: 180,
    rating: 4.7,
    numReviews: 940,
    images: [
      "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Pack Size", options: ["1 kg", "5 kg", "10 kg"] }
    ],
    specifications: [
      { key: "Aging", value: "Naturally Aged 2 Years" },
      { key: "Origin", value: "Himalayan Foothills, India" }
    ],
    isFeatured: true,
    isBestSeller: true,
    isTrending: false,
    isActive: true
  },

  // ================= 9. SPORTS AND FITNESS =================
  {
    name: "Kobo Hexagonal Rubber Coated Dumbbells (Set of 2 - 10kg each)",
    slug: "kobo-hexagonal-rubber-coated-dumbbells-10kg-pair",
    categorySlug: "sports-and-fitness",
    subcategory: "Gym Equipment",
    brand: "Kobo",
    description: "Commercial grade hex dumbbells cast from solid iron with thick vulcanized virgin rubber coat to prevent floor damage, paired with knurled chrome grip handles.",
    shortDescription: "Pair of 10kg rubber hex dumbbells, anti-roll, knurled chrome handle.",
    price: 4999,
    discountPrice: 3499,
    stock: 35,
    rating: 4.8,
    numReviews: 210,
    images: [
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Weight Pair", options: ["5kg x 2", "7.5kg x 2", "10kg x 2", "15kg x 2"] }
    ],
    specifications: [
      { key: "Material", value: "Cast Iron with Virgin Rubber Encasing" },
      { key: "Handle", value: "Ergonomic Knurled Steel" }
    ],
    isFeatured: true,
    isBestSeller: true,
    isTrending: false,
    isActive: true
  },
  {
    name: "Strauss Anti-Skid Eco-Friendly TPE Dual-Color Yoga Mat (6mm with Strap)",
    slug: "strauss-anti-skid-tpe-yoga-mat-6mm",
    categorySlug: "sports-and-fitness",
    subcategory: "Yoga Mats",
    brand: "Strauss",
    description: "High-density odorless TPE yoga mat with wave-textured bottom for zero slippage on tile or wood floors. Generous 6mm thickness protects knees and joints.",
    shortDescription: "6mm high density TPE, waterproof, laser alignment lines, carry strap.",
    price: 2199,
    discountPrice: 1299,
    stock: 80,
    rating: 4.7,
    numReviews: 340,
    images: [
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Color", options: ["Teal / Grey", "Purple / Pink", "Navy / Mint"] }
    ],
    specifications: [
      { key: "Thickness", value: "6 mm Extra Cushioning" },
      { key: "Dimensions", value: "183 cm x 61 cm" }
    ],
    isFeatured: false,
    isBestSeller: true,
    isTrending: true,
    isActive: true
  },

  // ================= 10. BOOKS AND STATIONERY =================
  {
    name: "Atomic Habits by James Clear (Hardcover International Edition)",
    slug: "atomic-habits-james-clear-hardcover",
    categorySlug: "books-and-stationery",
    subcategory: "Books",
    brand: "Penguin Random House",
    description: "The definitive guide to breaking bad behaviors and adopting good ones in four steps, showing you how small, incremental everyday routines compound into massive life transformations.",
    shortDescription: "#1 New York Times Bestseller with over 15 million copies sold.",
    price: 899,
    discountPrice: 599,
    stock: 120,
    rating: 4.9,
    numReviews: 4200,
    images: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Format", options: ["Hardcover", "Paperback"] }
    ],
    specifications: [
      { key: "Author", value: "James Clear" },
      { key: "Pages", value: "320 Pages" },
      { key: "Language", value: "English" }
    ],
    isFeatured: true,
    isBestSeller: true,
    isTrending: true,
    isActive: true
  },
  {
    name: "Parker Sonnet Fountain Pen with 18k Solid Gold Nib (Black Lacquer)",
    slug: "parker-sonnet-fountain-pen-gold-nib",
    categorySlug: "books-and-stationery",
    subcategory: "Office and Art Supplies",
    brand: "Parker",
    description: "Timeless symbol of elegance, the Parker Sonnet fountain pen features a glossy black lacquer barrel, 23k gold finish trims, and an 18k solid gold hand-chiseled nib.",
    shortDescription: "18k solid gold nib, luxury Parker gift box, includes ink converter.",
    price: 18500,
    discountPrice: 14999,
    stock: 18,
    rating: 4.9,
    numReviews: 65,
    images: [
      "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [],
    specifications: [
      { key: "Nib Material", value: "18K Solid Gold" },
      { key: "Nib Size", value: "Medium (M)" }
    ],
    isFeatured: false,
    isBestSeller: false,
    isTrending: false,
    isActive: true
  },

  // ================= 11. FURNITURE =================
  {
    name: "Green Soul Monster Ultimate Ergonomic High-Back Gaming & Office Chair",
    slug: "green-soul-monster-ultimate-ergonomic-chair",
    categorySlug: "furniture",
    subcategory: "Chairs",
    brand: "Green Soul",
    description: "Engineered with breathable spandex and PU leather, internal heavy-gauge steel frame, 4D adjustable armrests, magnetic memory foam neck pillow, and frog mechanism.",
    shortDescription: "4D armrests, heavy metal wheelbase, 180° recline, 3-year warranty.",
    price: 24999,
    discountPrice: 16999,
    stock: 25,
    rating: 4.8,
    numReviews: 540,
    images: [
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Color", options: ["All Black", "Black & Red", "Black & Blue"] }
    ],
    specifications: [
      { key: "Gas Lift", value: "Class 4 Hydraulic" },
      { key: "Max Weight Capacity", value: "150 kg" }
    ],
    isFeatured: true,
    isBestSeller: true,
    isTrending: false,
    isActive: true
  },
  {
    name: "Wakefit Solid Sheesham Wood Queen Size Platform Bed (Teak Finish)",
    slug: "wakefit-solid-sheesham-queen-platform-bed",
    categorySlug: "furniture",
    subcategory: "Beds",
    brand: "Wakefit",
    description: "Constructed from 100% seasoned Sheesham (Indian Rosewood) with rich natural grain pattern. Includes reinforced wooden slats and termite-resistant treatment.",
    shortDescription: "100% Sheesham wood, queen size (78x60 inches), 5-year structural warranty.",
    price: 22999,
    discountPrice: 15499,
    stock: 15,
    rating: 4.8,
    numReviews: 320,
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Finish", options: ["Warm Teak", "Dark Walnut"] }
    ],
    specifications: [
      { key: "Wood", value: "Kiln-Dried Solid Sheesham Wood" },
      { key: "Size", value: "Queen Size (Suitable for 78x60 inch mattress)" }
    ],
    isFeatured: false,
    isBestSeller: true,
    isTrending: true,
    isActive: true
  },

  // ================= 12. BAGS AND LUGGAGE =================
  {
    name: "American Tourister Curio 3-Piece Hard Luggage Suitcase Set (Cabin, Med, Large)",
    slug: "american-tourister-curio-3-piece-hard-suitcase-set",
    categorySlug: "bags-and-luggage",
    subcategory: "Suitcases",
    brand: "American Tourister",
    description: "Distinctive circular design crafted from ultralight polypropylene. Features TSA recessed combination lock, 360-degree double spinner wheels, and expandability.",
    shortDescription: "Polypropylene hard-shell, TSA lock, 3-piece nested set (55cm, 69cm, 80cm).",
    price: 25990,
    discountPrice: 14990,
    stock: 20,
    rating: 4.8,
    numReviews: 290,
    images: [
      "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Color", options: ["Canary Yellow", "Midnight Black", "Denim Blue"] }
    ],
    specifications: [
      { key: "Shell Material", value: "100% Polypropylene" },
      { key: "Wheels", value: "8 Spinner Wheels (Double Wheels)" }
    ],
    isFeatured: true,
    isBestSeller: true,
    isTrending: false,
    isActive: true
  },
  {
    name: "Mokobara The Transit Waterproof Laptop Backpack (21L)",
    slug: "mokobara-the-transit-laptop-backpack-21l",
    categorySlug: "bags-and-luggage",
    subcategory: "Laptop Bags",
    brand: "Mokobara",
    description: "Sleek architectural backpack constructed from water-repellent nylon vegan leather, featuring dedicated 15.6\" padded laptop compartment and luggage sleeve.",
    shortDescription: "Fits 15.6\" laptop, hidden magnetic passport pocket, luggage slip sleeve.",
    price: 6999,
    discountPrice: 4999,
    stock: 45,
    rating: 4.9,
    numReviews: 380,
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Color", options: ["All Black", "Olive Moss", "Warm Camel"] }
    ],
    specifications: [
      { key: "Capacity", value: "21 Liters" },
      { key: "Laptop Sleeve", value: "Up to 16\" MacBook Pro" }
    ],
    isFeatured: false,
    isBestSeller: true,
    isTrending: true,
    isActive: true
  },

  // ================= 13. WATCHES AND JEWELLERY =================
  {
    name: "Tissot PRX Powermatic 80 Automatic Stainless Steel Watch (Blue Dial)",
    slug: "tissot-prx-powermatic-80-blue-dial",
    categorySlug: "watches-and-jewellery",
    subcategory: "Analog Watches",
    brand: "Tissot",
    description: "Swiss craftsmanship at its pinnacle. Retro 1978 integrated bracelet aesthetic, waffle textured sunray blue dial, scratch-resistant sapphire crystal, and 80-hour reserve.",
    shortDescription: "Swiss Made, Powermatic 80 caliber, sapphire crystal, 100m water resistant.",
    price: 68500,
    discountPrice: 59900,
    stock: 10,
    rating: 5.0,
    numReviews: 140,
    images: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Dial Color", options: ["Sunray Blue", "Deep Green", "Ice Blue", "Black Waffle"] }
    ],
    specifications: [
      { key: "Movement", value: "Powermatic 80.111 (80 Hour Reserve)" },
      { key: "Case Diameter", value: "40 mm 316L Stainless Steel" }
    ],
    isFeatured: true,
    isBestSeller: true,
    isTrending: true,
    isActive: true
  },
  {
    name: "GIVA 925 Sterling Silver Zircon Heart Pendant Necklace with Chain",
    slug: "giva-925-sterling-silver-zircon-heart-pendant-necklace",
    categorySlug: "watches-and-jewellery",
    subcategory: "Necklaces",
    brand: "GIVA",
    description: "Hallmarked 925 sterling silver chain holding a sparkling AAA+ grade faceted cubic zirconia heart pendant, rhodium-plated to prevent tarnish.",
    shortDescription: "Pure 925 silver with authenticity certificate, rhodium anti-tarnish coating.",
    price: 2499,
    discountPrice: 1599,
    stock: 95,
    rating: 4.8,
    numReviews: 610,
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Plating", options: ["Rhodium Silver", "18K Rose Gold", "18K Yellow Gold"] }
    ],
    specifications: [
      { key: "Metal", value: "925 Sterling Silver" },
      { key: "Chain Length", value: "16 inch + 2 inch adjustable" }
    ],
    isFeatured: false,
    isBestSeller: true,
    isTrending: false,
    isActive: true
  },

  // ================= 14. AUTOMOTIVE ACCESSORIES =================
  {
    name: "70mai Pro Plus+ A500S Dual Channel 2.7K Car Dash Camera with GPS",
    slug: "70mai-pro-plus-a500s-dual-channel-car-dashcam",
    categorySlug: "automotive-accessories",
    subcategory: "Car Accessories",
    brand: "70mai",
    description: "Crystal clear 1944P front + 1080P rear recording with Sony IMX335 sensor, built-in GPS with ADAS driver assistance, 24-hour parking surveillance, and app sync.",
    shortDescription: "Front 2.7K + Rear 1080P, Sony Starvis sensor, built-in GPS & ADAS.",
    price: 13999,
    discountPrice: 9999,
    stock: 35,
    rating: 4.8,
    numReviews: 240,
    images: [
      "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [],
    specifications: [
      { key: "Front Resolution", value: "2592 x 1944P (2.7K Super HD)" },
      { key: "Sensor", value: "Sony IMX335 Sensor with F1.8 Aperture" }
    ],
    isFeatured: true,
    isBestSeller: true,
    isTrending: true,
    isActive: true
  },

  // ================= 15. PET SUPPLIES =================
  {
    name: "Royal Canin Maxi Adult Dry Dog Food (15kg)",
    slug: "royal-canin-maxi-adult-dry-dog-food-15kg",
    categorySlug: "pet-supplies",
    subcategory: "Pet Food",
    brand: "Royal Canin",
    description: "Specially formulated for large breed adult dogs (26 to 44 kg) from 15 months to 5 years, supporting optimal joint and bone health with EPA-DHA and high digestibility.",
    shortDescription: "Formulated for large breed dogs, enriched with Omega-3 EPA & DHA.",
    price: 9400,
    discountPrice: 8299,
    stock: 40,
    rating: 4.9,
    numReviews: 380,
    images: [
      "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { name: "Pack Weight", options: ["4 kg", "10 kg", "15 kg"] }
    ],
    specifications: [
      { key: "Breed Size", value: "Large (26 - 44 kg)" },
      { key: "Key Nutrients", value: "Protein 26%, Fat 17%, EPA/DHA 0.4%" }
    ],
    isFeatured: true,
    isBestSeller: true,
    isTrending: false,
    isActive: true
  }
];

module.exports = productsData;
