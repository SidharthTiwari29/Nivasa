export type NotificationTone = "CALM" | "PLAYFUL" | "URGENT";
export type SupportedLanguage = "en-IN" | "hi-IN" | "kn-IN";

export interface NotificationEvent {
  key: "PRICE_DROP" | "BUDGET_SAVING" | "BUILD_BLOCKER" | "QUOTE_RECEIVED" | "INSTALLATION_UPDATE";
  tone: NotificationTone;
  variables: Record<string, string | number>;
}

const templates: Record<SupportedLanguage, Record<NotificationEvent["key"], string>> = {
  "en-IN": {
    PRICE_DROP: "Good news: {{item}} dropped by ₹{{saving}}.",
    BUDGET_SAVING: "Your plan just saved ₹{{saving}}. Your wallet approves.",
    BUILD_BLOCKER: "Tiny reality check: {{message}} needs fixing before we build it.",
    QUOTE_RECEIVED: "A fresh quote landed for {{item}}.",
    INSTALLATION_UPDATE: "Home progress: {{message}}.",
  },
  "hi-IN": {
    PRICE_DROP: "अच्छी खबर: {{item}} की कीमत ₹{{saving}} कम हुई।",
    BUDGET_SAVING: "आपके प्लान ने ₹{{saving}} बचाए। वॉलेट खुश है।",
    BUILD_BLOCKER: "छोटा सा reality check: {{message}} ठीक करना होगा।",
    QUOTE_RECEIVED: "{{item}} के लिए नया quote आ गया है।",
    INSTALLATION_UPDATE: "घर की प्रगति: {{message}}।",
  },
  "kn-IN": {
    PRICE_DROP: "ಒಳ್ಳೆಯ ಸುದ್ದಿ: {{item}} ಬೆಲೆ ₹{{saving}} ಕಡಿಮೆಯಾಗಿದೆ.",
    BUDGET_SAVING: "ನಿಮ್ಮ ಯೋಜನೆ ₹{{saving}} ಉಳಿಸಿದೆ. Wallet ಖುಷಿಯಾಗಿದೆ.",
    BUILD_BLOCKER: "ಚಿಕ್ಕ reality check: {{message}} ಸರಿಪಡಿಸಬೇಕು.",
    QUOTE_RECEIVED: "{{item}}ಗಾಗಿ ಹೊಸ quote ಬಂದಿದೆ.",
    INSTALLATION_UPDATE: "ಮನೆಯ ಪ್ರಗತಿ: {{message}}.",
  },
};

export function renderNotification(language: SupportedLanguage, event: NotificationEvent): string {
  let message = templates[language][event.key];
  for (const [key, value] of Object.entries(event.variables)) message = message.replaceAll(`{{${key}}}`, String(value));
  return message;
}
