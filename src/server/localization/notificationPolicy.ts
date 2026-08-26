export type NotificationTone = "CALM" | "PLAYFUL" | "URGENT";
export type SupportedLanguage =
  | "en-IN" | "hi-IN" | "kn-IN" | "ta-IN" | "te-IN" | "ml-IN"
  | "mr-IN" | "bn-IN" | "gu-IN" | "pa-IN" | "or-IN" | "as-IN" | "ur-IN";

export interface NotificationEvent {
  key: "PRICE_DROP" | "BUDGET_SAVING" | "BUILD_BLOCKER" | "QUOTE_RECEIVED" | "INSTALLATION_UPDATE";
  tone: NotificationTone;
  variables: Record<string, string | number>;
}

const baseTemplates: Record<NotificationEvent["key"], string> = {
  PRICE_DROP: "Good news: {{item}} dropped by ₹{{saving}}.",
  BUDGET_SAVING: "Your plan just saved ₹{{saving}}. Your wallet approves.",
  BUILD_BLOCKER: "Tiny reality check: {{message}} needs fixing before we build it.",
  QUOTE_RECEIVED: "A fresh quote landed for {{item}}.",
  INSTALLATION_UPDATE: "Home progress: {{message}}.",
};

const templates: Partial<Record<SupportedLanguage, Partial<Record<NotificationEvent["key"], string>>>> = {
  "hi-IN": { BUDGET_SAVING: "आपके प्लान ने ₹{{saving}} बचाए। वॉलेट खुश है।", BUILD_BLOCKER: "छोटा सा reality check: {{message}} ठीक करना होगा।" },
  "kn-IN": { BUDGET_SAVING: "ನಿಮ್ಮ ಯೋಜನೆ ₹{{saving}} ಉಳಿಸಿದೆ. Wallet ಖುಷಿಯಾಗಿದೆ.", BUILD_BLOCKER: "ಚಿಕ್ಕ reality check: {{message}} ಸರಿಪಡಿಸಬೇಕು." },
  "ta-IN": { BUDGET_SAVING: "உங்கள் திட்டம் ₹{{saving}} சேமித்தது. Wallet மகிழ்ச்சியாக உள்ளது." },
  "te-IN": { BUDGET_SAVING: "మీ ప్లాన్ ₹{{saving}} ఆదా చేసింది. Wallet సంతోషంగా ఉంది." },
  "ml-IN": { BUDGET_SAVING: "നിങ്ങളുടെ പ്ലാൻ ₹{{saving}} ലാഭിച്ചു. Wallet സന്തോഷത്തിലാണ്." },
  "mr-IN": { BUDGET_SAVING: "तुमच्या प्लॅनने ₹{{saving}} वाचवले. Wallet खुश आहे." },
  "bn-IN": { BUDGET_SAVING: "আপনার প্ল্যান ₹{{saving}} সাশ্রয় করেছে। Wallet খুশি।" },
  "gu-IN": { BUDGET_SAVING: "તમારી યોજનાએ ₹{{saving}} બચાવ્યા. Wallet ખુશ છે." },
  "pa-IN": { BUDGET_SAVING: "ਤੁਹਾਡੇ ਪਲਾਨ ਨੇ ₹{{saving}} ਬਚਾਏ। Wallet ਖੁਸ਼ ਹੈ।" },
  "or-IN": { BUDGET_SAVING: "ଆପଣଙ୍କ ପ୍ଲାନ ₹{{saving}} ସଞ୍ଚୟ କରିଛି। Wallet ଖୁସି ଅଛି।" },
  "as-IN": { BUDGET_SAVING: "আপোনাৰ প্লেনে ₹{{saving}} ৰাহি কৰিলে। Wallet সুখী।" },
  "ur-IN": { BUDGET_SAVING: "آپ کے پلان نے ₹{{saving}} بچائے۔ Wallet خوش ہے۔" },
};

export function renderNotification(language: SupportedLanguage, event: NotificationEvent): string {
  let message = templates[language]?.[event.key] ?? baseTemplates[event.key];
  for (const [key, value] of Object.entries(event.variables)) message = message.replaceAll(`{{${key}}}`, String(value));
  return message;
}
