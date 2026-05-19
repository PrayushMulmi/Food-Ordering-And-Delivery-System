import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  Loader2,
  LocateFixed,
  RefreshCcw,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { Button, Input } from "../shared/ui";
import { api } from "../lib/api";
import { toast } from "sonner";
import { getUser } from "../lib/auth";

const CHAT_STORAGE_KEY = "annaya_food_chatbot_session_v2";
const MAX_MESSAGE_LENGTH = 500;
const CONTEXT_HISTORY_LIMIT = 8;

const quickPrompts = [
  "Recommend something suitable for me",
  "Show nearby restaurants",
  "Suggest affordable food",
  "What can I order again?",
];

const createMessage = (role, text, extra = {}) => ({
  id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  role,
  text: String(text || "").trim(),
  createdAt: new Date().toISOString(),
  ...extra,
});

const initialMessages = [
  createMessage(
    "assistant",
    "Namaste. I can help you choose foods and restaurants available in Annaya. Ask for recommendations, nearby restaurants, affordable meals, or suitable items for today.",
  ),
];

function normaliseCoordinate(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function cleanAssistantReply(value) {
  const text = String(value || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text)
    return "I could not prepare a recommendation right now. Please try again.";

  // Frontend safety polish only. The backend prompt should also enforce this rule.
  return (
    text
      .replace(
        /\b(based on|considering|because of|since)\s+(your\s+)?(order history|previous orders|location|current location|weather|ratings?|reviews?|preferences)[^.!?]*[.!?]\s*/gi,
        "",
      )
      .replace(
        /\bI used\s+(your\s+)?(order history|location|weather|ratings?|reviews?|preferences)[^.!?]*[.!?]\s*/gi,
        "",
      )
      .trim() ||
    "I found a suitable option from the available restaurants. Please check the menu before placing your order."
  );
}

function getChatStorageKey() {
  const user = getUser();
  return user?.id ? `${CHAT_STORAGE_KEY}:${user.id}` : CHAT_STORAGE_KEY;
}

function getStoredMessages() {
  try {
    const parsed = JSON.parse(
      sessionStorage.getItem(getChatStorageKey()) || "null",
    );
    if (!Array.isArray(parsed) || parsed.length === 0) return initialMessages;
    return parsed
      .filter(
        (message) =>
          ["assistant", "user"].includes(message?.role) && message?.text,
      )
      .slice(-20);
  } catch {
    return initialMessages;
  }
}

function saveStoredMessages(messages) {
  try {
    sessionStorage.setItem(
      getChatStorageKey(),
      JSON.stringify(messages.slice(-20)),
    );
  } catch {
    // Session storage is optional. Chat still works without it.
  }
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const paragraphs = String(message.text || "")
    .split(/\n{2,}|(?<=\.)\s+(?=[A-Z])/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[84%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "bg-[#22C55E] text-white"
            : "border border-gray-100 bg-white text-gray-800"
        }`}
      >
        {paragraphs.length > 0 ? (
          paragraphs.map((paragraph, index) => (
            <p
              key={`${message.id}-${index}`}
              className={index > 0 ? "mt-2" : ""}
            >
              {paragraph}
            </p>
          ))
        ) : (
          <p>{message.text}</p>
        )}
      </div>
    </div>
  );
}

export function FoodChatbot({ enabled }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => getStoredMessages());
  const [activeUserId, setActiveUserId] = useState(() => getUser()?.id || null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");
  const [hasTriedSilentLocation, setHasTriedSilentLocation] = useState(false);

  const scrollRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const currentUserId = getUser()?.id || null;
    if (currentUserId !== activeUserId) {
      setActiveUserId(currentUserId);
      setMessages(getStoredMessages());
    }
  }, [activeUserId, enabled]);

  useEffect(() => {
    if (enabled) saveStoredMessages(messages);
  }, [enabled, messages, activeUserId]);

  useEffect(() => {
    if (open)
      scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, open]);

  const canSend = useMemo(
    () => input.trim().length > 0 && !loading,
    [input, loading],
  );

  const captureLocation = useCallback(async ({ silent = false } = {}) => {
    if (!navigator.geolocation) {
      if (!silent) toast.error("Location is not supported in this browser.");
      setLocationStatus("unsupported");
      return null;
    }

    setLocationStatus("loading");

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextLocation = {
            latitude: normaliseCoordinate(position.coords.latitude),
            longitude: normaliseCoordinate(position.coords.longitude),
            accuracy: normaliseCoordinate(position.coords.accuracy),
            source: "browser_gps",
            capturedAt: new Date().toISOString(),
          };

          if (mountedRef.current) {
            setLocation(nextLocation);
            setLocationStatus("ready");
          }

          if (!silent)
            toast.success("Location added for better recommendations.");
          resolve(nextLocation);
        },
        () => {
          if (mountedRef.current) setLocationStatus("denied");
          if (!silent)
            toast.error(
              "Could not access your location. Saved address data can still be used.",
            );
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
      );
    });
  }, []);

  useEffect(() => {
    if (!open || hasTriedSilentLocation || location) return;
    setHasTriedSilentLocation(true);

    if (!navigator.permissions?.query) return;

    navigator.permissions
      .query({ name: "geolocation" })
      .then((permission) => {
        if (permission.state === "granted") captureLocation({ silent: true });
      })
      .catch(() => {
        // Permission API is not available in all browsers.
      });
  }, [captureLocation, hasTriedSilentLocation, location, open]);

  const buildPayload = useCallback(
    (text, latestLocation) => ({
      message: text,
      latitude: latestLocation?.latitude ?? location?.latitude ?? undefined,
      longitude: latestLocation?.longitude ?? location?.longitude ?? undefined,
      locationAccuracy:
        latestLocation?.accuracy ?? location?.accuracy ?? undefined,
      locationSource:
        latestLocation?.source ?? location?.source ?? "saved_or_unavailable",
      clientTime: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      conversationHistory: messages
        .filter(
          (message) =>
            ["user", "assistant"].includes(message.role) && message.text,
        )
        .slice(-CONTEXT_HISTORY_LIMIT)
        .map((message) => ({ role: message.role, content: message.text })),
      responsePreferences: {
        tone: "formal, polite, concise, customer-friendly",
        answerScope: "foods and restaurants available in this system only",
        useDynamicDatabaseContext: true,
        useCustomerLocationWhenAvailable: true,
        useCustomerOrderHistoryWhenAvailable: true,
        useRestaurantRatingsAndReviewsWhenAvailable: true,
        useWeatherWhenAvailable: true,
        revealRecommendationBasis: false,
        doNotMentionInternalDataSources: true,
        doNotInventRestaurantsItemsPricesOrRatings: true,
      },
    }),
    [location, messages],
  );

  const sendMessage = useCallback(
    async (eventOrText) => {
      if (eventOrText?.preventDefault) eventOrText.preventDefault();

      const text =
        typeof eventOrText === "string" ? eventOrText.trim() : input.trim();
      if (!text || loading) return;

      const userMessage = createMessage("user", text);
      setMessages((previous) => [...previous, userMessage]);
      setInput("");
      setLoading(true);

      try {
        let latestLocation = location;

        // If permission was already granted, refresh GPS silently before recommendation.
        if (!latestLocation && navigator.permissions?.query) {
          try {
            const permission = await navigator.permissions.query({
              name: "geolocation",
            });
            if (permission.state === "granted") {
              latestLocation = await captureLocation({ silent: true });
            }
          } catch {
            latestLocation = location;
          }
        }

        const response = await api.post(
          "/api/chatbot/message",
          buildPayload(text, latestLocation),
        );
        const rawReply = response?.data?.reply || response?.reply || "";
        const reply = cleanAssistantReply(rawReply);

        if (!mountedRef.current) return;
        setMessages((previous) => [
          ...previous,
          createMessage("assistant", reply, {
            mode: response?.data?.mode || "system",
          }),
        ]);
      } catch (error) {
        if (!mountedRef.current) return;
        setMessages((previous) => [
          ...previous,
          createMessage(
            "assistant",
            error?.message ||
              "The food assistant is unavailable at the moment. Please try again shortly.",
          ),
        ]);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [buildPayload, captureLocation, input, loading, location],
  );

  const clearChat = () => {
    const resetMessages = [
      createMessage(
        "assistant",
        "Chat restarted. Please ask about foods, restaurants, menus, prices, ratings, delivery, or recommendations available in Annaya.",
      ),
    ];
    setMessages(resetMessages);
    saveStoredMessages(resetMessages);
  };

  if (!enabled) return null;

  return (
    <div className="fixed bottom-5 left-5 z-50 print:hidden">
      {open && (
        <div className="mb-3 flex h-[540px] w-[390px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-[#22C55E] px-5 py-4 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                <Bot className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold">
                  Annaya Food Assistant
                </h3>
                <p className="truncate text-xs text-white/85">
                  Foods and restaurants only
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                className="rounded-full p-2 transition-colors hover:bg-white/15"
                onClick={clearChat}
                aria-label="Restart chat"
                title="Restart chat"
              >
                <RefreshCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="rounded-full p-2 transition-colors hover:bg-white/15"
                onClick={() => setOpen(false)}
                aria-label="Close chatbot"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex max-w-[84%] items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Preparing a suitable reply...
                </div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>

          <div className="border-t border-gray-200 bg-white p-3">
            <div className="mb-3 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-[#22C55E] hover:bg-[#22C55E]/10 hover:text-[#16A34A] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={loading}
                  onClick={() => sendMessage(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="mb-2 flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => captureLocation({ silent: false })}
                disabled={locationStatus === "loading"}
                className="shrink-0"
              >
                {locationStatus === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LocateFixed className="h-4 w-4" />
                )}
                {location ? "Location ready" : "Use location"}
              </Button>

              <p className="line-clamp-2 text-right text-xs text-gray-500">
                Replies are limited to Annaya foods, restaurants, and ordering
                help.
              </p>
            </div>

            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                value={input}
                onChange={(event) =>
                  setInput(event.target.value.slice(0, MAX_MESSAGE_LENGTH))
                }
                placeholder="Ask what to order..."
                maxLength={MAX_MESSAGE_LENGTH}
                disabled={loading}
                autoComplete="off"
                aria-label="Ask Annaya Food Assistant"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!canSend}
                aria-label="Send message"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full bg-[#22C55E] px-5 py-3 text-sm font-semibold text-white shadow-xl transition-colors hover:bg-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/40"
        aria-expanded={open}
        aria-label="Open Annaya Food Assistant"
      >
        {open ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
        {open ? "Close AI" : "Ask AI"}
      </button>
    </div>
  );
}
