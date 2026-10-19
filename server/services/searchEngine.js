// Intelligent Multi-field E-Commerce Search Engine with Relevance Scoring & Synonyms

const SYNONYMS = {
  // Mobile / Tech
  phone: ['smartphone', 'smartphones', 'mobile', 'mobiles', 'cellphone', 'samsung galaxy', 'galaxy', 'handset'],
  phones: ['smartphone', 'smartphones', 'mobile', 'mobiles', 'cellphone', 'samsung galaxy', 'galaxy'],
  mobile: ['smartphone', 'smartphones', 'phone', 'phones', 'cellphone', 'samsung galaxy', 'galaxy'],
  mobiles: ['smartphone', 'smartphones', 'phone', 'phones', 'cellphone'],
  smartphone: ['phone', 'phones', 'mobile', 'mobiles', 'samsung galaxy', 'galaxy'],
  smartphones: ['phone', 'phones', 'mobile', 'mobiles', 'samsung galaxy', 'galaxy'],
  galaxy: ['samsung', 'samsung galaxy', 'smartphone', 'phone'],
  samsung: ['galaxy', 'samsung galaxy', 'smartphone'],

  // Laptops / Computers
  laptop: ['macbook', 'laptops', 'notebook', 'computer', 'macbook air', 'macbook pro', 'pc'],
  laptops: ['macbook', 'laptop', 'notebook', 'computer', 'macbook air', 'macbook pro'],
  macbook: ['apple', 'laptop', 'laptops', 'macbook air', 'macbook pro', 'mac'],
  apple: ['macbook', 'iphone', 'apple watch', 'airpods'],

  // Clothing & Fashion
  tshirt: ['t-shirt', 't-shirts', 'tee', 'tshirts', 'crewneck', 'round neck', 'top'],
  tshirts: ['t-shirt', 't-shirts', 'tee', 'crewneck'],
  't-shirt': ['tshirt', 't-shirts', 'tee', 'crewneck'],
  't-shirts': ['tshirt', 't-shirts', 'tee'],
  shirt: ['shirts', 't-shirt', 'casual shirt', 'linen shirt', 'formal shirt', 'apparel'],
  shirts: ['shirt', 't-shirt', 'linen shirt', 'casual shirt'],
  jeans: ['jean', 'denim', 'levi', 'pants', 'trousers'],
  saree: ['sarees', 'kanjivaram', 'banarasi', 'silk saree', 'ethnic', 'drape'],
  sarees: ['saree', 'kanjivaram', 'banarasi', 'silk saree', 'ethnic'],
  kurti: ['kurtis', 'anarkali', 'traditional wear', 'ethnic', 'tunic'],
  kurtis: ['kurti', 'anarkali', 'ethnic'],
  lehenga: ['lehengas', 'choli', 'bridal', 'ethnic'],
  lehengas: ['lehenga', 'choli', 'bridal'],
  dress: ['dresses', 'maxi dress', 'gown', 'apparel', 'fashion'],
  dresses: ['dress', 'maxi dress', 'gown'],

  // Footwear
  shoe: ['shoes', 'sneakers', 'footwear', 'formal shoes', 'running shoes', 'boots', 'sandals'],
  shoes: ['shoe', 'sneakers', 'footwear', 'formal shoes', 'running shoes', 'boots', 'sandals'],
  sneaker: ['sneakers', 'shoes', 'running shoes', 'jordan', 'ultraboost', 'footwear'],
  sneakers: ['sneaker', 'shoes', 'running shoes', 'jordan', 'ultraboost', 'footwear'],
  footwear: ['shoes', 'sneakers', 'sandals', 'heels', 'boots'],
  sandals: ['heels', 'shoes', 'footwear', 'bata'],
  heels: ['sandals', 'shoes', 'footwear', 'bata'],

  // Audio & Smart Devices
  headphone: ['headphones', 'earphones', 'earbuds', 'headset', 'anc', 'wh-1000xm5', 'audio'],
  headphones: ['headphone', 'earphones', 'earbuds', 'headset', 'anc', 'wh-1000xm5', 'audio'],
  earphone: ['headphones', 'earphones', 'earbuds', 'audio'],
  earphones: ['headphones', 'earphones', 'earbuds', 'audio'],
  earbuds: ['headphones', 'earphones', 'earbuds', 'tws', 'airpods'],
  airpods: ['earbuds', 'headphones', 'apple'],
  speaker: ['speakers', 'bluetooth speaker', 'soundbar', 'jbl', 'audio'],
  speakers: ['speaker', 'bluetooth speaker', 'soundbar', 'jbl', 'audio'],

  // Watches
  watch: ['watches', 'smartwatch', 'smartwatches', 'analog watch', 'wrist watch'],
  watches: ['watch', 'smartwatch', 'smartwatches', 'analog watch'],
  smartwatch: ['watch', 'watches', 'apple watch', 'smartwatches'],
  smartwatches: ['watch', 'watches', 'apple watch', 'smartwatches'],

  // Home & Appliances
  tv: ['television', 'televisions', 'oled', 'smart tv', '4k tv'],
  television: ['tv', 'televisions', 'oled', 'smart tv', '4k'],
  televisions: ['tv', 'television', 'oled', 'smart tv'],
  bed: ['bedsheet', 'bedsheets', 'mattress', 'furniture', 'platform bed', 'cot'],
  bedsheet: ['bedsheets', 'bed', 'linen', 'cotton bedsheet'],
  bedsheets: ['bedsheet', 'bed', 'linen'],
  chair: ['gaming chair', 'office chair', 'furniture', 'ergonomic chair'],
  cookware: ['cookware set', 'tri-ply', 'wonderchef', 'pots', 'pans'],
  grinder: ['mixer', 'mixer grinder', 'prestige', 'kitchen appliance'],
  mixer: ['mixer grinder', 'grinder', 'prestige'],
  lamp: ['desk lamp', 'light', 'philips', 'led'],

  // Grocery & Food
  rice: ['basmati', 'daawat', 'grain', 'grocery', 'food'],
  basmati: ['rice', 'daawat', 'grocery'],
  dal: ['toor dal', 'pulses', 'tata sampann', 'grocery', 'lentils'],
  coffee: ['ground coffee', 'blue tokai', 'beverage', 'brew'],
  almonds: ['almond', 'badam', 'dry fruits', 'happilo', 'nuts', 'snacks'],

  // Beauty & Grooming
  lipstick: ['makeup', 'beauty', 'ruby woo', 'm.a.c', 'cosmetics', 'lip color'],
  serum: ['niacinamide', 'skincare', 'derma', 'beauty'],
  cream: ['radiance cream', 'soundarya', 'forest essentials', 'skincare', 'moisturizer'],
  trimmer: ['shaver', 'grooming', 'philips oneblade', 'clipper'],

  // Bags & Accessories
  bag: ['backpack', 'bags', 'luggage', 'suitcase', 'handbag', 'tote', 'duffel'],
  bags: ['backpack', 'bag', 'luggage', 'suitcase', 'handbag', 'tote'],
  backpack: ['bag', 'bags', 'school bag', 'laptop bag', 'transit'],
  suitcase: ['luggage', 'suitcase set', 'american tourister', 'trolley', 'bags'],

  // Camera & Automotive
  camera: ['cameras', 'mirrorless', 'dash cam', 'dash camera', 'sony alpha', 'photography'],
  cameras: ['camera', 'mirrorless', 'dash cam'],
};

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

function wholeWordMatch(text, word) {
  if (!text || !word) return false;
  const regex = new RegExp(`(^|[^a-zA-Z0-9])${escapeRegex(word)}([^a-zA-Z0-9]|$)`, 'i');
  return regex.test(text);
}

/**
 * Score a single product against a search query
 * Returns integer score >= 0
 */
function scoreProduct(product, rawQuery) {
  if (!rawQuery || !rawQuery.trim()) return 0;
  const query = rawQuery.trim().toLowerCase();

  let score = 0;
  const name = (product.name || '').toLowerCase();
  const brand = (product.brand || '').toLowerCase();
  const subcategory = (product.subcategory || '').toLowerCase();
  const categorySlug = (product.categorySlug || '').toLowerCase();
  const description = (product.description || '').toLowerCase();
  const tags = (product.tags || []).map((t) => (t || '').toLowerCase());

  // 1. EXACT PHRASE MATCHES
  if (name === query) score += 1200;
  else if (name.startsWith(query)) score += 600;
  else if (wholeWordMatch(name, query)) score += 400;

  if (brand === query) score += 500;
  else if (wholeWordMatch(brand, query)) score += 300;

  if (subcategory === query) score += 450;
  else if (wholeWordMatch(subcategory, query)) score += 300;

  if (categorySlug === query || categorySlug === query.replace(/\s+/g, '-')) score += 200;

  // 2. PARSE TOKENS
  let rawTokens = query.split(/[\s,]+/).filter((t) => t.length > 1 || t === 't');

  // Handle common compound cases
  if (query.includes('t shirt') || query.includes('tshirt') || query.includes('t-shirt')) {
    rawTokens = rawTokens.filter((t) => t !== 't' && t !== 'shirt');
    rawTokens.push('t-shirt');
  }

  let matchedTokensCount = 0;

  rawTokens.forEach((tok) => {
    let tokenMatched = false;
    const syns = [tok, ...(SYNONYMS[tok] || [])];

    // Check primary field matches
    for (const s of syns) {
      // Direct whole-word match in Name
      if (wholeWordMatch(name, s)) {
        score += 150;
        tokenMatched = true;
        break;
      }
      // Direct whole-word match in Brand
      if (wholeWordMatch(brand, s)) {
        score += 130;
        tokenMatched = true;
        break;
      }
      // Direct whole-word match in Subcategory (e.g. searching "phone" matches "smartphones")
      if (wholeWordMatch(subcategory, s) || (s.length >= 4 && subcategory.includes(s))) {
        score += 140;
        tokenMatched = true;
        break;
      }
      // Tags
      if (tags.some((t) => wholeWordMatch(t, s))) {
        score += 80;
        tokenMatched = true;
        break;
      }
      // Category slug match
      if (categorySlug.includes(s) && s.length >= 4) {
        score += 60;
        tokenMatched = true;
        break;
      }
      // Substring in Name (only if token is 4+ chars)
      if (s.length >= 4 && name.includes(s)) {
        score += 40;
        tokenMatched = true;
        break;
      }
      // Whole-word match in Description
      if (s.length >= 3 && wholeWordMatch(description, s)) {
        score += 25;
        tokenMatched = true;
        break;
      }
    }

    if (tokenMatched) matchedTokensCount++;
  });

  // Multi-word search: All tokens must match or penalize heavily
  if (rawTokens.length > 1) {
    if (matchedTokensCount === rawTokens.length) {
      score += 400; // Perfect multi-token match!
    } else if (matchedTokensCount === 0) {
      return 0; // Reject if 0 tokens matched
    } else {
      score = score * (matchedTokensCount / rawTokens.length);
    }
  }

  // INTENT-BASED ACCURACY ADJUSTMENTS:
  // 1. Phone intent: actual smartphone must rank way higher than headphones
  if (query === 'phone' || query === 'phones' || query === 'mobile' || query === 'mobiles') {
    if (subcategory === 'smartphones') score += 400;
    if (subcategory === 'headphones') score -= 300;
  }

  // 2. Laptop intent: actual laptop must rank way higher than laptop bags
  if (query === 'laptop' || query === 'laptops') {
    if (subcategory === 'laptops') score += 500;
    if (subcategory.includes('bag') || name.includes('backpack')) score -= 300;
  }

  // 3. Shoe intent: footwear must rank higher than general apparel
  if (query === 'shoe' || query === 'shoes' || query === 'sneaker' || query === 'sneakers') {
    if (categorySlug === 'footwear') score += 300;
  }

  // 4. Watch intent: watches must rank higher than other jewelry
  if (query === 'watch' || query === 'watches' || query === 'smartwatch') {
    if (subcategory.includes('watch')) score += 300;
  }

  return Math.max(0, Math.round(score));
}

/**
 * Filter and rank products by search relevance
 */
function searchAndRankProducts(products, searchQuery) {
  if (!searchQuery || !searchQuery.trim()) {
    return products;
  }

  const scored = products
    .map((p) => ({ product: p, score: scoreProduct(p, searchQuery) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.product);

  return scored;
}

module.exports = {
  scoreProduct,
  searchAndRankProducts,
  SYNONYMS,
};
