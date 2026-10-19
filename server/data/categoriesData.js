const categoriesData = [
  {
    name: "Electronics",
    slug: "electronics",
    description: "Smartphones, laptops, audio, smart wearables, and smart home appliances",
    icon: "Laptop",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&auto=format&fit=crop&q=80",
    isFeatured: true,
    order: 1,
    subcategories: [
      { name: "Smartphones", slug: "smartphones" },
      { name: "Laptops", slug: "laptops" },
      { name: "Computers", slug: "computers" },
      { name: "Headphones", slug: "headphones" },
      { name: "Cameras", slug: "cameras" },
      { name: "Televisions", slug: "televisions" },
      { name: "Speakers", slug: "speakers" },
      { name: "Smartwatches", slug: "smartwatches" },
      { name: "Accessories", slug: "accessories" }
    ]
  },
  {
    name: "Women's Fashion",
    slug: "womens-fashion",
    description: "Exquisite sarees, elegant kurtis, designer ethnic wear, lehengas, and contemporary apparel",
    icon: "Sparkles",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1600&auto=format&fit=crop&q=80",
    isFeatured: true,
    order: 2,
    subcategories: [
      { name: "Sarees", slug: "sarees" },
      { name: "Kurtis", slug: "kurtis" },
      { name: "Dresses", slug: "dresses" },
      { name: "Tops", slug: "tops" },
      { name: "Ethnic Wear", slug: "ethnic-wear" },
      { name: "Lehengas", slug: "lehengas" },
      { name: "Salwar Suits", slug: "salwar-suits" },
      { name: "Handbags", slug: "handbags" },
      { name: "Jewellery", slug: "jewellery" }
    ]
  },
  {
    name: "Men's Fashion",
    slug: "mens-fashion",
    description: "Premium shirts, casual t-shirts, denim jeans, kurtas, jackets, and accessories",
    icon: "Shirt",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1600&auto=format&fit=crop&q=80",
    isFeatured: true,
    order: 3,
    subcategories: [
      { name: "T-shirts", slug: "t-shirts" },
      { name: "Shirts", slug: "shirts" },
      { name: "Jeans", slug: "jeans" },
      { name: "Trousers", slug: "trousers" },
      { name: "Jackets", slug: "jackets" },
      { name: "Traditional Wear", slug: "traditional-wear" },
      { name: "Sneakers", slug: "sneakers" },
      { name: "Watches", slug: "watches" },
      { name: "Wallets", slug: "wallets" }
    ]
  },
  {
    name: "Kids and Baby",
    slug: "kids-and-baby",
    description: "Comfortable kids wear, baby essentials, educational toys, school bags, and gear",
    icon: "Baby",
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=1600&auto=format&fit=crop&q=80",
    isFeatured: true,
    order: 4,
    subcategories: [
      { name: "Kids' Clothing", slug: "kids-clothing" },
      { name: "Baby Products", slug: "baby-products" },
      { name: "Toys", slug: "toys" },
      { name: "School Bags", slug: "school-bags" },
      { name: "Baby Care", slug: "baby-care" },
      { name: "Children's Footwear", slug: "childrens-footwear" }
    ]
  },
  {
    name: "Home and Kitchen",
    slug: "home-and-kitchen",
    description: "Premium cookware, appliances, bedsheets, artistic lamps, organizers, and decor",
    icon: "Home",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&auto=format&fit=crop&q=80",
    isFeatured: true,
    order: 5,
    subcategories: [
      { name: "Cookware", slug: "cookware" },
      { name: "Kitchen Appliances", slug: "kitchen-appliances" },
      { name: "Bedsheets", slug: "bedsheets" },
      { name: "Pillows", slug: "pillows" },
      { name: "Curtains", slug: "curtains" },
      { name: "Lamps", slug: "lamps" },
      { name: "Organizers", slug: "organizers" },
      { name: "Home Decor", slug: "home-decor" }
    ]
  },
  {
    name: "Beauty and Personal Care",
    slug: "beauty-and-personal-care",
    description: "Dermatologist-tested skincare, makeup, luxury perfumes, haircare, and grooming",
    icon: "Heart",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1600&auto=format&fit=crop&q=80",
    isFeatured: true,
    order: 6,
    subcategories: [
      { name: "Makeup", slug: "makeup" },
      { name: "Skincare", slug: "skincare" },
      { name: "Haircare", slug: "haircare" },
      { name: "Perfumes", slug: "perfumes" },
      { name: "Grooming Kits", slug: "grooming-kits" },
      { name: "Personal Care", slug: "personal-care" }
    ]
  },
  {
    name: "Footwear",
    slug: "footwear",
    description: "Athletic running shoes, luxury sneakers, handcrafted formal shoes, sandals, and slippers",
    icon: "Footprints",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1600&auto=format&fit=crop&q=80",
    isFeatured: true,
    order: 7,
    subcategories: [
      { name: "Sneakers", slug: "sneakers" },
      { name: "Sports Shoes", slug: "sports-shoes" },
      { name: "Formal Shoes", slug: "formal-shoes" },
      { name: "Sandals", slug: "sandals" },
      { name: "Heels", slug: "heels" },
      { name: "Slippers", slug: "slippers" }
    ]
  },
  {
    name: "Grocery and Daily Essentials",
    slug: "grocery-and-daily-essentials",
    description: "Farm-fresh groceries, organic staples, healthy snacks, gourmet beverages, and cleaning essentials",
    icon: "ShoppingBag",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1600&auto=format&fit=crop&q=80",
    isFeatured: true,
    order: 8,
    subcategories: [
      { name: "Snacks", slug: "snacks" },
      { name: "Packaged Foods", slug: "packaged-foods" },
      { name: "Beverages", slug: "beverages" },
      { name: "Cleaning Products", slug: "cleaning-products" },
      { name: "Household Essentials", slug: "household-essentials" }
    ]
  },
  {
    name: "Sports and Fitness",
    slug: "sports-and-fitness",
    description: "Home gym equipment, yoga mats, activewear, dumbbells, and outdoor gear",
    icon: "Activity",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&auto=format&fit=crop&q=80",
    isFeatured: false,
    order: 9,
    subcategories: [
      { name: "Gym Equipment", slug: "gym-equipment" },
      { name: "Sportswear", slug: "sportswear" },
      { name: "Yoga Mats", slug: "yoga-mats" },
      { name: "Fitness Accessories", slug: "fitness-accessories" }
    ]
  },
  {
    name: "Books and Stationery",
    slug: "books-and-stationery",
    description: "Bestselling novels, educational resources, premium journals, and artistic stationery",
    icon: "BookOpen",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1507842229451-79b1be886a27?w=1600&auto=format&fit=crop&q=80",
    isFeatured: false,
    order: 10,
    subcategories: [
      { name: "Books", slug: "books" },
      { name: "Novels", slug: "novels" },
      { name: "Educational Books", slug: "educational-books" },
      { name: "Notebooks", slug: "notebooks" },
      { name: "Office and Art Supplies", slug: "office-and-art-supplies" }
    ]
  },
  {
    name: "Furniture",
    slug: "furniture",
    description: "Modern sofas, ergonomic office chairs, solid wood dining tables, and beds",
    icon: "Armchair",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1600&auto=format&fit=crop&q=80",
    isFeatured: false,
    order: 11,
    subcategories: [
      { name: "Sofas", slug: "sofas" },
      { name: "Chairs", slug: "chairs" },
      { name: "Tables", slug: "tables" },
      { name: "Beds", slug: "beds" },
      { name: "Storage and Office Furniture", slug: "storage-and-office-furniture" }
    ]
  },
  {
    name: "Bags and Luggage",
    slug: "bags-and-luggage",
    description: "Durable travel suitcases, stylish laptop backpacks, duffels, and designer totes",
    icon: "Luggage",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=1600&auto=format&fit=crop&q=80",
    isFeatured: false,
    order: 12,
    subcategories: [
      { name: "Backpacks", slug: "backpacks" },
      { name: "Handbags", slug: "handbags" },
      { name: "Laptop Bags", slug: "laptop-bags" },
      { name: "Travel Bags", slug: "travel-bags" },
      { name: "Suitcases", slug: "suitcases" }
    ]
  },
  {
    name: "Watches and Jewellery",
    slug: "watches-and-jewellery",
    description: "Classic analog chronographs, smartwatch bands, gold-plated necklaces, and fine bracelets",
    icon: "Watch",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&auto=format&fit=crop&q=80",
    isFeatured: false,
    order: 13,
    subcategories: [
      { name: "Analog Watches", slug: "analog-watches" },
      { name: "Smartwatches", slug: "smartwatches" },
      { name: "Necklaces", slug: "necklaces" },
      { name: "Earrings", slug: "earrings" },
      { name: "Bracelets", slug: "bracelets" }
    ]
  },
  {
    name: "Automotive Accessories",
    slug: "automotive-accessories",
    description: "High-performance car dashcams, bike riding gear, polish kits, and mobile mounts",
    icon: "Car",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=1600&auto=format&fit=crop&q=80",
    isFeatured: false,
    order: 14,
    subcategories: [
      { name: "Car Accessories", slug: "car-accessories" },
      { name: "Bike Accessories", slug: "bike-accessories" },
      { name: "Cleaning Kits", slug: "cleaning-kits" }
    ]
  },
  {
    name: "Pet Supplies",
    slug: "pet-supplies",
    description: "Nutritious pet food, chew toys, comfortable beds, grooming tools, and collars",
    icon: "PawPrint",
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=1600&auto=format&fit=crop&q=80",
    isFeatured: false,
    order: 15,
    subcategories: [
      { name: "Pet Food", slug: "pet-food" },
      { name: "Toys", slug: "toys" },
      { name: "Grooming and Accessories", slug: "grooming-and-accessories" }
    ]
  }
];

module.exports = categoriesData;
