import { query } from "../config/db.js";

const MAX_SEARCH_TERMS = 6;

const STOP_WORDS = new Set([
  "about",
  "again",
  "also",
  "available",
  "best",
  "can",
  "could",
  "delivery",
  "dish",
  "does",
  "eat",
  "food",
  "for",
  "from",
  "give",
  "good",
  "have",
  "hungry",
  "like",
  "meal",
  "menu",
  "near",
  "need",
  "order",
  "please",
  "recommend",
  "restaurant",
  "restaurants",
  "show",
  "something",
  "suggest",
  "tell",
  "that",
  "the",
  "there",
  "today",
  "want",
  "what",
  "where",
  "with",
  "would",
  "you",
  "your",
  "annaya",
  "system",
  "me",
  "my",
  "i",
  "am",
  "is",
  "are",
  "to",
  "in",
  "of",
]);

const FOOD_WORDS = new Set([
  "biryani",
  "burger",
  "chicken",
  "chowmein",
  "coffee",
  "curry",
  "dumpling",
  "fish",
  "fried",
  "healthy",
  "indian",
  "italian",
  "japanese",
  "kebab",
  "momo",
  "nepali",
  "noodle",
  "paneer",
  "pasta",
  "pizza",
  "rice",
  "roll",
  "salad",
  "sandwich",
  "seafood",
  "spicy",
  "sushi",
  "thakali",
  "veg",
  "vegetarian",
  "wrap",
  "soup",
  "tea",
  "dessert",
  "snack",
]);

function asNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeCoordinate(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function limitText(value, length = 160) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, length);
}

function normalizeDate(value) {
  if (!value) return null;
  try {
    return new Date(value).toISOString();
  } catch {
    return String(value);
  }
}

function detectIntent(message = "") {
  const text = String(message).toLowerCase();
  return {
    wantsRecommendation:
      /recommend|suggest|what.*eat|where.*order|hungry|best|good|suitable|try/.test(
        text,
      ),
    wantsNearby: /near|nearby|closest|around me|location|distance/.test(text),
    wantsAffordable:
      /cheap|budget|affordable|low price|lowest|less expensive|under\s*\d+|below\s*\d+/.test(
        text,
      ),
    wantsPremium: /premium|expensive|special|treat|best rated|top rated/.test(
      text,
    ),
    wantsVegetarian: /veg|vegetarian|paneer|meatless|no meat/.test(text),
    wantsSpicy: /spicy|hot|chilli|chili/.test(text),
    wantsRepeatOrder:
      /again|repeat|last order|previous|my order|ordered before|order history/.test(
        text,
      ),
    wantsWeather: /weather|rain|raining|cold|hot|warm|cool|cloudy/.test(text),
    asksPrice: /price|cost|rs\.?|rupees|cheap|budget|affordable/.test(text),
    asksRating: /rating|review|rated|popular|famous/.test(text),
    asksAvailability:
      /available|open|closed|can i order|is there|do you have/.test(text),
  };
}

function extractSearchTerms(message = "") {
  const text = String(message)
    .toLowerCase()
    .replace(/rs\.?\s*\d+/g, " ")
    .replace(/[^a-z0-9\s]/g, " ");

  const words = text
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean)
    .filter((word) => word.length > 2)
    .filter((word) => !STOP_WORDS.has(word));

  const preferred = words.filter((word) => FOOD_WORDS.has(word));
  const combined = [...preferred, ...words];
  return [...new Set(combined)].slice(0, MAX_SEARCH_TERMS);
}

function extractBudgetLimit(message = "") {
  const text = String(message).toLowerCase();
  const match = text.match(
    /(?:under|below|less than|within|rs\.?|rupees?)\s*(\d{2,5})/i,
  );
  if (!match) return null;
  const amount = Number(match[1]);
  return Number.isFinite(amount) ? amount : null;
}

function makeLikeParams(terms, repeatCount) {
  return terms.flatMap((term) =>
    Array.from({ length: repeatCount }, () => `%${term}%`),
  );
}

function buildMenuWhereClause(terms, intent, budgetLimit) {
  const clauses = ["m.is_available = 1", "r.status = 'active'", "r.is_open = 1"];
  const params = [];

  if (terms.length) {
    const termClauses = terms
      .map(
        () =>
          `(LOWER(m.name) LIKE ? OR LOWER(m.category) LIKE ? OR LOWER(m.description) LIKE ? OR LOWER(r.name) LIKE ? OR LOWER(r.cuisine) LIKE ?)`,
      )
      .join(" OR ");
    clauses.push(`(${termClauses})`);
    params.push(...makeLikeParams(terms, 5));
  }

  if (
    intent.wantsVegetarian &&
    !terms.includes("veg") &&
    !terms.includes("vegetarian")
  ) {
    clauses.push(
      `(LOWER(m.name) LIKE '%veg%' OR LOWER(m.category) LIKE '%veg%' OR LOWER(m.description) LIKE '%vegetarian%' OR LOWER(m.name) LIKE '%paneer%')`,
    );
  }

  if (intent.wantsSpicy && !terms.includes("spicy")) {
    clauses.push(
      `(LOWER(m.name) LIKE '%spicy%' OR LOWER(m.description) LIKE '%spicy%' OR LOWER(m.description) LIKE '%chilli%' OR LOWER(m.description) LIKE '%chili%')`,
    );
  }

  if (budgetLimit) {
    clauses.push("m.price <= ?");
    params.push(budgetLimit);
  }

  return { where: clauses.join(" AND "), params };
}

function normalizeRestaurant(row) {
  return {
    id: row.id,
    name: row.name,
    cuisine: row.cuisine,
    address: row.address,
    region: row.region,
    price_level: row.price_level,
    rating_average: asNumber(row.rating_average),
    is_open: Boolean(row.is_open),
    latitude: normalizeCoordinate(row.latitude),
    longitude: normalizeCoordinate(row.longitude),
    distance_km:
      row.distance_km == null ? null : asNumber(row.distance_km, null),
  };
}

function normalizeMenuItem(row) {
  return {
    id: row.id,
    restaurant_id: row.restaurant_id,
    restaurant_name: row.restaurant_name,
    restaurant_rating: asNumber(row.restaurant_rating),
    restaurant_region: row.restaurant_region,
    distance_km:
      row.distance_km == null ? null : asNumber(row.distance_km, null),
    name: row.name,
    category: row.category,
    description: limitText(row.description, 130),
    price: asNumber(row.price),
    review_average:
      row.review_average == null ? null : asNumber(row.review_average),
    review_count: asNumber(row.review_count),
  };
}

async function getCustomer(userId) {
  const rows = await query(
    `SELECT id, full_name, food_preferences
     FROM users
     WHERE id = ? AND role = 'customer'
     LIMIT 1`,
    [userId],
  );

  const user = rows[0];
  if (!user) return null;

  return {
    id: user.id,
    name: user.full_name,
    preferences: user.food_preferences,
  };
}

async function getSavedLocations(userId) {
  const rows = await query(
    `SELECT label, latitude, longitude, location_input
     FROM user_saved_locations
     WHERE user_id = ?
     ORDER BY updated_at DESC, id DESC
     LIMIT 5`,
    [userId],
  );

  return rows.map((row) => ({
    label: row.label,
    latitude: normalizeCoordinate(row.latitude),
    longitude: normalizeCoordinate(row.longitude),
    location_input: limitText(row.location_input, 100),
  }));
}

function chooseEffectiveLocation(clientLocation, savedLocations) {
  const clientLat = normalizeCoordinate(
    clientLocation?.latitude ?? clientLocation?.lat,
  );
  const clientLng = normalizeCoordinate(
    clientLocation?.longitude ?? clientLocation?.lng,
  );

  if (clientLat !== null && clientLng !== null) {
    return {
      latitude: clientLat,
      longitude: clientLng,
      source: clientLocation?.source || "browser_gps",
      accuracy: normalizeCoordinate(clientLocation?.accuracy),
    };
  }

  const saved = savedLocations.find(
    (location) => location.latitude !== null && location.longitude !== null,
  );
  if (saved) {
    return {
      latitude: saved.latitude,
      longitude: saved.longitude,
      source: `saved_location:${saved.label}`,
      accuracy: null,
    };
  }

  return null;
}

async function getRestaurants({ effectiveLocation, intent }) {
  if (effectiveLocation) {
    const lat = effectiveLocation.latitude;
    const lng = effectiveLocation.longitude;
    return query(
      `SELECT id, name, cuisine, address, region, price_level, rating_average, is_open, latitude, longitude,
              CASE
                WHEN latitude IS NULL OR longitude IS NULL THEN NULL
                ELSE ROUND((6371 * ACOS(LEAST(1, GREATEST(-1,
                  COS(RADIANS(?)) * COS(RADIANS(latitude)) * COS(RADIANS(longitude) - RADIANS(?)) +
                  SIN(RADIANS(?)) * SIN(RADIANS(latitude))
                )))), 2)
              END AS distance_km
       FROM restaurants
       WHERE status = 'active' AND is_open = 1
       ORDER BY
         CASE WHEN is_open = 1 THEN 0 ELSE 1 END,
         CASE WHEN distance_km IS NULL THEN 999 ELSE distance_km END ASC,
         rating_average DESC,
         name ASC
       LIMIT ?`,
      [lat, lng, lat, intent.wantsNearby ? 12 : 16],
    );
  }

  return query(
    `SELECT id, name, cuisine, address, region, price_level, rating_average, is_open, latitude, longitude, NULL AS distance_km
     FROM restaurants
     WHERE status = 'active' AND is_open = 1
     ORDER BY
       CASE WHEN is_open = 1 THEN 0 ELSE 1 END,
       rating_average DESC,
       name ASC
     LIMIT ?`,
    [intent.wantsNearby ? 12 : 16],
  );
}

async function getMenuItems({ terms, intent, budgetLimit, effectiveLocation }) {
  const { where, params } = buildMenuWhereClause(terms, intent, budgetLimit);
  const sort = intent.wantsAffordable
    ? "m.price ASC, r.rating_average DESC, review_average DESC"
    : intent.asksRating || intent.wantsPremium
      ? "review_average DESC, r.rating_average DESC, review_count DESC, m.price ASC"
      : "match_priority DESC, r.rating_average DESC, review_average DESC, m.price ASC";

  if (effectiveLocation) {
    const lat = effectiveLocation.latitude;
    const lng = effectiveLocation.longitude;
    return query(
      `SELECT m.id, m.restaurant_id, m.name, m.category, m.description, m.price,
              r.name AS restaurant_name, r.rating_average AS restaurant_rating, r.region AS restaurant_region,
              CASE
                WHEN r.latitude IS NULL OR r.longitude IS NULL THEN NULL
                ELSE ROUND((6371 * ACOS(LEAST(1, GREATEST(-1,
                  COS(RADIANS(?)) * COS(RADIANS(r.latitude)) * COS(RADIANS(r.longitude) - RADIANS(?)) +
                  SIN(RADIANS(?)) * SIN(RADIANS(r.latitude))
                )))), 2)
              END AS distance_km,
              ROUND(AVG(rv.rating), 1) AS review_average,
              COUNT(rv.id) AS review_count,
              CASE WHEN ${terms.length ? "1" : "0"} = 1 THEN 1 ELSE 0 END AS match_priority
       FROM menu_items m
       INNER JOIN restaurants r ON r.id = m.restaurant_id
       LEFT JOIN reviews rv ON rv.menu_item_id = m.id
       WHERE ${where}
       GROUP BY m.id
       ORDER BY
         CASE WHEN r.is_open = 1 THEN 0 ELSE 1 END,
         ${intent.wantsNearby ? "CASE WHEN distance_km IS NULL THEN 999 ELSE distance_km END ASC," : ""}
         ${sort}
       LIMIT 24`,
      [lat, lng, lat, ...params],
    );
  }

  return query(
    `SELECT m.id, m.restaurant_id, m.name, m.category, m.description, m.price,
            r.name AS restaurant_name, r.rating_average AS restaurant_rating, r.region AS restaurant_region,
            NULL AS distance_km,
            ROUND(AVG(rv.rating), 1) AS review_average,
            COUNT(rv.id) AS review_count,
            CASE WHEN ${terms.length ? "1" : "0"} = 1 THEN 1 ELSE 0 END AS match_priority
     FROM menu_items m
     INNER JOIN restaurants r ON r.id = m.restaurant_id
     LEFT JOIN reviews rv ON rv.menu_item_id = m.id
     WHERE ${where}
     GROUP BY m.id
     ORDER BY
       CASE WHEN r.is_open = 1 THEN 0 ELSE 1 END,
       ${sort}
     LIMIT 24`,
    params,
  );
}

async function getRecentOrders(userId) {
  const rows = await query(
    `SELECT o.order_code, o.status, o.created_at, o.final_total, rs.name AS restaurant_name,
            GROUP_CONCAT(CONCAT(oi.item_name, ' x', oi.quantity) ORDER BY oi.id SEPARATOR ', ') AS items
     FROM orders o
     INNER JOIN restaurants rs ON rs.id = o.restaurant_id
     LEFT JOIN order_items oi ON oi.order_id = o.id
     WHERE o.user_id = ?
     GROUP BY o.id
     ORDER BY o.id DESC
     LIMIT 8`,
    [userId],
  );

  return rows.map((row) => ({
    order_code: row.order_code,
    status: row.status,
    restaurant_name: row.restaurant_name,
    items: row.items || "",
    final_total: asNumber(row.final_total),
    created_at: normalizeDate(row.created_at),
  }));
}

async function getOrderPatterns(userId) {
  const rows = await query(
    `SELECT m.category, r.cuisine, m.name AS item_name, r.name AS restaurant_name,
            COUNT(*) AS ordered_count,
            ROUND(AVG(oi.unit_price), 2) AS average_price
     FROM orders o
     INNER JOIN order_items oi ON oi.order_id = o.id
     INNER JOIN menu_items m ON m.id = oi.menu_item_id
     INNER JOIN restaurants r ON r.id = o.restaurant_id
     WHERE o.user_id = ?
     GROUP BY m.category, r.cuisine, m.name, r.name
     ORDER BY ordered_count DESC, MAX(o.id) DESC
     LIMIT 12`,
    [userId],
  );

  return rows.map((row) => ({
    category: row.category,
    cuisine: row.cuisine,
    item_name: row.item_name,
    restaurant_name: row.restaurant_name,
    ordered_count: asNumber(row.ordered_count),
    average_price: asNumber(row.average_price),
  }));
}

async function getActiveCoupons() {
  const rows = await query(
    `SELECT c.code, c.discount_type, c.discount_value, c.max_discount_amount, c.min_order_amount, r.name AS restaurant_name
     FROM coupons c
     INNER JOIN restaurants r ON r.id = c.restaurant_id
     WHERE c.status = 'active'
       AND CURDATE() BETWEEN c.start_date AND c.end_date
       AND (c.usage_limit IS NULL OR c.used_count < c.usage_limit)
       AND r.status = 'active'
     ORDER BY c.discount_value DESC
     LIMIT 8`,
  );

  return rows.map((row) => ({
    code: row.code,
    restaurant_name: row.restaurant_name,
    discount_type: row.discount_type,
    discount_value: asNumber(row.discount_value),
    max_discount_amount:
      row.max_discount_amount == null
        ? null
        : asNumber(row.max_discount_amount),
    min_order_amount: asNumber(row.min_order_amount),
  }));
}

async function getReviewSummary(terms) {
  const hasTerms = terms.length > 0;
  const termClause = hasTerms
    ? `AND (${terms.map(() => "(LOWER(m.name) LIKE ? OR LOWER(r.name) LIKE ? OR LOWER(m.category) LIKE ? OR LOWER(r.cuisine) LIKE ?)").join(" OR ")})`
    : "";
  const params = hasTerms ? makeLikeParams(terms, 4) : [];

  const rows = await query(
    `SELECT r.name AS restaurant_name, m.name AS menu_item_name,
            ROUND(AVG(rv.rating), 1) AS avg_rating, COUNT(rv.id) AS review_count
     FROM reviews rv
     INNER JOIN restaurants r ON r.id = rv.restaurant_id
     INNER JOIN menu_items m ON m.id = rv.menu_item_id
     WHERE r.status = 'active' ${termClause}
     GROUP BY r.name, m.name
     ORDER BY avg_rating DESC, review_count DESC
     LIMIT 16`,
    params,
  );

  return rows.map((row) => ({
    restaurant_name: row.restaurant_name,
    menu_item_name: row.menu_item_name,
    avg_rating: asNumber(row.avg_rating),
    review_count: asNumber(row.review_count),
  }));
}

export const ChatbotModel = {
  detectIntent,
  extractSearchTerms,

  async saveMessage(userId, role, message) {
    const text = limitText(message, 1000);
    if (!userId || !text || !['user', 'assistant'].includes(role)) return null;
    try {
      await query(
        `CREATE TABLE IF NOT EXISTS chatbot_messages (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          role ENUM('user','assistant') NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_chatbot_messages_user_created (user_id, created_at),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`
      );
      await query(
        `INSERT INTO chatbot_messages (user_id, role, message) VALUES (?, ?, ?)`,
        [userId, role, text],
      );
    } catch {
      return null;
    }
    return true;
  },

  async listMessagesForUser(userId, limit = 30) {
    try {
      await query(
        `CREATE TABLE IF NOT EXISTS chatbot_messages (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          role ENUM('user','assistant') NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_chatbot_messages_user_created (user_id, created_at),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`
      );
      return query(
        `SELECT id, role, message, created_at
         FROM chatbot_messages
         WHERE user_id = ?
         ORDER BY id DESC
         LIMIT ?`,
        [userId, Number(limit) || 30],
      );
    } catch {
      return [];
    }
  },

  async buildAdaptiveContextForUser(
    userId,
    { message = "", location = null } = {},
  ) {
    const intent = detectIntent(message);
    const searchTerms = extractSearchTerms(message);
    const budgetLimit = extractBudgetLimit(message);

    const [
      customer,
      savedLocations,
      recentOrders,
      orderPatterns,
      activeCoupons,
    ] = await Promise.all([
      getCustomer(userId),
      getSavedLocations(userId),
      getRecentOrders(userId),
      getOrderPatterns(userId),
      getActiveCoupons(),
    ]);

    const effectiveLocation = chooseEffectiveLocation(location, savedLocations);
    const [restaurants, menuItems, reviewSummary] = await Promise.all([
      getRestaurants({ effectiveLocation, intent }),
      getMenuItems({
        terms: searchTerms,
        intent,
        budgetLimit,
        effectiveLocation,
      }),
      getReviewSummary(searchTerms),
    ]);

    return {
      intent,
      searchTerms,
      budgetLimit,
      customer,
      effectiveLocation,
      savedLocations,
      restaurants: restaurants.map(normalizeRestaurant),
      menuItems: menuItems.map(normalizeMenuItem),
      recentOrders,
      orderPatterns,
      activeCoupons,
      reviewSummary,
    };
  },

  // Backward-compatible method name for older imports/tests.
  async buildContextForUser(userId) {
    return this.buildAdaptiveContextForUser(userId, {});
  },
};
