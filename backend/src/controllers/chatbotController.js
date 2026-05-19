import asyncHandler from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/response.js";
import ApiError from "../utils/ApiError.js";
import { ChatbotModel } from "../models/chatbotModel.js";

const FOOD_KEYWORDS = [
  "food",
  "restaurant",
  "menu",
  "dish",
  "meal",
  "order",
  "delivery",
  "recommend",
  "recommendation",
  "hungry",
  "eat",
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "momo",
  "burger",
  "pizza",
  "biryani",
  "sushi",
  "noodle",
  "rice",
  "curry",
  "thakali",
  "chicken",
  "veg",
  "vegetarian",
  "spicy",
  "cheap",
  "price",
  "rating",
  "review",
  "near",
  "weather",
  "annaya",
  "available",
  "open",
  "coupon",
  "discount",
  "repeat",
  "previous",
  "again",
  "affordable",
  "suitable",
  "drink",
  "coffee",
];

const WEATHER_CODES = {
  0: "clear",
  1: "mostly clear",
  2: "partly cloudy",
  3: "cloudy",
  45: "foggy",
  48: "foggy",
  51: "light drizzle",
  53: "drizzle",
  55: "heavy drizzle",
  61: "light rain",
  63: "rain",
  65: "heavy rain",
  71: "light snow",
  73: "snow",
  75: "heavy snow",
  80: "rain showers",
  81: "rain showers",
  82: "heavy rain showers",
  95: "thunderstorm",
  96: "thunderstorm with hail",
  99: "thunderstorm with hail",
};

function isFoodRelated(message) {
  const text = String(message || "").toLowerCase();
  return FOOD_KEYWORDS.some((keyword) => text.includes(keyword));
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeLocation(body = {}) {
  const latitude = toNumber(body.latitude ?? body.lat);
  const longitude = toNumber(body.longitude ?? body.lng);

  if (latitude === null || longitude === null) return null;

  return {
    latitude,
    longitude,
    accuracy: toNumber(body.locationAccuracy ?? body.accuracy),
    source: body.locationSource || "browser_gps",
  };
}

async function fetchWeatherSummary(location) {
  const lat = toNumber(location?.latitude ?? location?.lat);
  const lng = toNumber(location?.longitude ?? location?.lng);
  if (lat === null || lng === null) {
    return {
      available: false,
      summary: "Weather unavailable because no customer location was provided.",
    };
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation,weather_code`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Weather unavailable");

    const data = await response.json();
    const current = data.current || {};
    const condition =
      WEATHER_CODES[current.weather_code] || "current local weather";
    const temperature = current.temperature_2m;
    const precipitation = current.precipitation ?? 0;

    return {
      available: true,
      condition,
      temperature,
      precipitation,
      summary: `${condition}, ${temperature ?? "N/A"}°C, precipitation ${precipitation} mm`,
    };
  } catch {
    return { available: false, summary: "Weather unavailable at the moment." };
  }
}

function money(value) {
  const amount = Number(value || 0);
  return `Rs. ${amount.toFixed(0)}`;
}

function formatDistance(value) {
  const distance = Number(value);
  return Number.isFinite(distance)
    ? `${distance.toFixed(distance < 10 ? 1 : 0)} km`
    : null;
}

function summarizeItem(item) {
  const pieces = [
    `${item.name} from ${item.restaurant_name}`,
    money(item.price),
  ];
  const distance = formatDistance(item.distance_km);
  if (distance) pieces.push(distance);
  if (Number(item.review_average || 0) > 0)
    pieces.push(`${Number(item.review_average).toFixed(1)}/5`);
  return pieces.join(" · ");
}

function choosePrimaryItems(context) {
  const items = [...(context.menuItems || [])];
  const intent = context.intent || {};

  if (intent.wantsAffordable) {
    return items
      .sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
      .slice(0, 4);
  }

  if (intent.wantsNearby) {
    return items
      .sort(
        (a, b) =>
          Number(a.distance_km ?? 999) - Number(b.distance_km ?? 999) ||
          Number(b.restaurant_rating || 0) - Number(a.restaurant_rating || 0),
      )
      .slice(0, 4);
  }

  if (intent.asksRating || intent.wantsPremium) {
    return items
      .sort(
        (a, b) =>
          Number(b.review_average || b.restaurant_rating || 0) -
          Number(a.review_average || a.restaurant_rating || 0),
      )
      .slice(0, 4);
  }

  if (intent.wantsRepeatOrder && context.orderPatterns?.length) {
    const patternNames = context.orderPatterns.map((pattern) =>
      String(pattern.item_name || "").toLowerCase(),
    );
    const patternCategories = context.orderPatterns.map((pattern) =>
      String(pattern.category || "").toLowerCase(),
    );
    const matching = items.filter(
      (item) =>
        patternNames.some(
          (name) =>
            name &&
            String(item.name).toLowerCase().includes(name.split(" ")[0]),
        ) ||
        patternCategories.includes(String(item.category || "").toLowerCase()),
    );
    if (matching.length) return matching.slice(0, 4);
  }

  return items.slice(0, 4);
}

function buildDynamicFallback(message, context, weather) {
  if (!isFoodRelated(message)) {
    return "I can help only with foods, restaurants, menu items, prices, ratings, delivery, and recommendations available in Annaya.";
  }

  const items = choosePrimaryItems(context);
  const restaurants = [...(context.restaurants || [])].slice(0, 4);
  const intent = context.intent || {};

  if (!items.length && !restaurants.length) {
    return "I could not find any matching available food or restaurant in Annaya at the moment. Please try another food name, cuisine, or restaurant.";
  }

  if (intent.asksAvailability && context.searchTerms?.length && !items.length) {
    return `I could not find an available item matching “${context.searchTerms.join(" ")}” right now. You may check another item or browse the Restaurants page for current menus.`;
  }

  if (intent.wantsRepeatOrder && context.recentOrders?.length) {
    const lastOrder = context.recentOrders[0];
    const firstItem = items[0];
    if (firstItem) {
      return `You may order ${firstItem.name} from ${firstItem.restaurant_name}. It is currently listed at ${money(firstItem.price)}. You can open the restaurant menu to add it to your basket.`;
    }
    return `Your recent order was from ${lastOrder.restaurant_name}. You can open that restaurant again from Order History or Restaurants to reorder available items.`;
  }

  if (intent.wantsNearby && items.length) {
    const list = items.map(summarizeItem).join("\n");
    return `These nearby options are available:\n${list}\nYou can open the preferred restaurant to add the item to your basket.`;
  }

  if (intent.wantsAffordable && items.length) {
    const list = items.map(summarizeItem).join("\n");
    return `These affordable options are available:\n${list}\nPlease check the restaurant menu before placing the order.`;
  }

  if (intent.asksRating && items.length) {
    const list = items.map(summarizeItem).join("\n");
    return `These well-rated options are available:\n${list}\nYou can choose the option that suits your preferred restaurant and price.`;
  }

  if (intent.wantsWeather && weather?.available && items.length) {
    const list = items.slice(0, 3).map(summarizeItem).join("\n");
    return `These options should be suitable today:\n${list}\nYou can open the restaurant menu to continue with your order.`;
  }

  if (items.length) {
    const list = items.map(summarizeItem).join("\n");
    return `These options are available in Annaya:\n${list}\nYou can open the restaurant page to view details and place your order.`;
  }

  const restaurantList = restaurants
    .map((restaurant) => {
      const distance = formatDistance(restaurant.distance_km);
      return `${restaurant.name}${restaurant.cuisine ? ` (${restaurant.cuisine})` : ""}${distance ? ` · ${distance}` : ""}`;
    })
    .join("\n");

  return `These restaurants are available in Annaya:\n${restaurantList}\nPlease open a restaurant to view its current menu.`;
}

function compactContext(context, weather, requestBody = {}) {
  return {
    customer: {
      name: context.customer?.name,
      preferences: context.customer?.preferences,
    },
    request: {
      intent: context.intent,
      search_terms: context.searchTerms,
      budget_limit: context.budgetLimit,
      timezone: requestBody.timezone,
      conversation_history: Array.isArray(requestBody.conversationHistory)
        ? requestBody.conversationHistory.slice(-6)
        : [],
    },
    location: context.effectiveLocation,
    weather,
    available_restaurants: context.restaurants,
    relevant_menu_items: context.menuItems,
    customer_order_patterns: context.orderPatterns,
    recent_orders: context.recentOrders,
    active_coupons: context.activeCoupons,
    ratings_and_reviews: context.reviewSummary,
    response_rules: {
      answer_only_from_this_context: true,
      do_not_reveal_recommendation_basis: true,
      do_not_say_based_on_location_orders_ratings_weather: true,
      do_not_invent_items_prices_restaurants_coupons_or_ratings: true,
      customer_data_is_internal: true,
    },
  };
}

function cleanReply(text) {
  return String(text || "")
    .replace(
      /\b[Bb]ased on (your|the) (location|order history|orders|ratings|reviews|weather|data|preferences)[^,.]*[,\.]?\s*/g,
      "",
    )
    .replace(
      /\bI used (your|the) (location|order history|orders|ratings|reviews|weather|data|preferences)[^,.]*[,\.]?\s*/g,
      "",
    )
    .replace(
      /\bAccording to (your|the) (location|order history|orders|ratings|reviews|weather|data|preferences)[^,.]*[,\.]?\s*/g,
      "",
    )
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function callOpenAI({ message, context, weather, requestBody }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const systemPrompt = [
    "You are Annaya Food Assistant inside a food ordering and delivery system.",
    "Answer only about restaurants, foods, menu items, prices, ratings, reviews, delivery, order history, coupons, and recommendations available in the supplied system context.",
    "Never answer unrelated general knowledge, coding, politics, medical, financial, or non-food questions. For unrelated questions, politely say you can only help with foods and restaurants available in Annaya.",
    "Use only the provided context. Never invent restaurants, menu items, prices, ratings, discounts, or availability.",
    "You may use customer location, orders, ratings, reviews, and weather internally, but do not tell the customer that these were the basis of the recommendation.",
    "Do not write phrases such as “based on your order history”, “based on your location”, “based on ratings”, or “because of the weather”.",
    "Reply formally, politely, and practically. Keep the answer concise and easy for a customer to act on.",
  ].join(" ");

  const payload = {
    model,
    input: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Live Annaya database context JSON:\n${JSON.stringify(compactContext(context, weather, requestBody))}\n\nCustomer question: ${message}`,
      },
    ],
    temperature: 0.45,
    max_output_tokens: 420,
    store: false,
  };

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) return null;

  const data = await response.json();
  if (typeof data.output_text === "string" && data.output_text.trim())
    return cleanReply(data.output_text);

  const text = data.output
    ?.flatMap((item) => item.content || [])
    .map((content) => content.text || "")
    .join(" ")
    .trim();

  return text ? cleanReply(text) : null;
}

export const sendChatbotMessage = asyncHandler(async (req, res) => {
  const message = String(req.body?.message || "").trim();
  if (!message) throw new ApiError(400, "Message is required");
  if (message.length > 500) throw new ApiError(400, "Message is too long");

  const location = normalizeLocation(req.body);
  await ChatbotModel.saveMessage(req.user.id, 'user', message);
  const context = await ChatbotModel.buildAdaptiveContextForUser(req.user.id, {
    message,
    location,
  });
  const weather = await fetchWeatherSummary(context.effectiveLocation);

  if (!isFoodRelated(message)) {
    const restrictedReply = buildDynamicFallback(message, context, weather);
    await ChatbotModel.saveMessage(req.user.id, 'assistant', restrictedReply);
    sendResponse(res, 200, "Chatbot response generated", {
      reply: restrictedReply,
      mode: "restricted",
      contextSummary: {
        matchedMenuItems: 0,
        matchedRestaurants: 0,
        usedLiveContext: false,
      },
    });
    return;
  }

  let reply = null;
  try {
    reply = await callOpenAI({
      message,
      context,
      weather,
      requestBody: req.body || {},
    });
  } catch {
    reply = null;
  }

  const finalReply = cleanReply(
    reply || buildDynamicFallback(message, context, weather),
  );

  await ChatbotModel.saveMessage(req.user.id, 'assistant', finalReply);

  sendResponse(res, 200, "Chatbot response generated", {
    reply: finalReply,
    mode: reply ? "openai" : "dynamic_fallback",
    contextSummary: {
      matchedMenuItems: context.menuItems.length,
      matchedRestaurants: context.restaurants.length,
      searchTerms: context.searchTerms,
      usedLiveContext: true,
    },
  });
});


export const getChatbotHistory = asyncHandler(async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit || 30), 1), 100);
  const rows = await ChatbotModel.listMessagesForUser(req.user.id, limit);
  sendResponse(res, 200, 'Chatbot history fetched', rows.reverse().map((row) => ({
    id: row.id,
    role: row.role,
    message: row.message,
    created_at: row.created_at,
  })));
});
