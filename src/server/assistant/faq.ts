export type FaqEntry = {
  id: string;
  question: string;
  answer: string;
  category:
    | "getting-started"
    | "design"
    | "budget"
    | "procurement"
    | "payments"
    | "account";
};

// Real content, not filler - each answer traces to actual implemented
// behavior in this codebase, so the assistant (and this list itself) never
// claims a capability that doesn't exist. When a new feature ships, its
// FAQ entry should be added in the same change, not as an afterthought.
export const FAQ_ENTRIES: FaqEntry[] = [
  {
    id: "budget-ranges",
    category: "budget",
    question: "Why does my budget show a range instead of one number?",
    answer:
      "Nivasa shows Low/Target/High figures because a single number would overstate certainty your design doesn't have yet. Target is the most likely cost based on your current selections; Low and High show the realistic range as material choices and supplier pricing are finalized.",
  },
  {
    id: "budget-locking",
    category: "budget",
    question: "What happens when I lock my budget?",
    answer:
      "A locked budget version becomes immutable - it can never be edited, only superseded by a new version if you make further changes. Locking is required before you can start procurement, so the numbers suppliers quote against can't shift under you mid-negotiation.",
  },
  {
    id: "negotiate-quote",
    category: "procurement",
    question: "Can I negotiate a supplier's quote?",
    answer:
      "Yes - on any quote still awaiting your decision, you can propose a lower price. Nivasa evaluates it instantly: if it's within an acceptable range it's accepted immediately, otherwise you'll get the best price Nivasa can offer as a counter.",
  },
  {
    id: "payment-security",
    category: "payments",
    question: "Is it safe to pay through Nivasa?",
    answer:
      "Payments are processed by Razorpay; Nivasa never stores your card or UPI details. A payment only unlocks a feature after Razorpay independently confirms it succeeded - your browser reporting success is never enough on its own.",
  },
  {
    id: "account-deletion",
    category: "account",
    question: "What happens to my data if I delete my account?",
    answer:
      "Your properties, designs, floor plans, and room data are permanently deleted. Financial records (payments, orders) are kept as anonymized records, as required by law, but are no longer linked to your identity.",
  },
  {
    id: "design-quality-flags",
    category: "design",
    question: "Why does Nivasa flag some of my room choices?",
    answer:
      "Nivasa checks things like whether a room's recorded area is unusually small for its type, or whether a door's width might not fit standard furniture - flagged so you can decide, not to block you. These are advisory, not restrictions.",
  },
  {
    id: "getting-started-property",
    category: "getting-started",
    question: "How do I start a new project?",
    answer:
      "Add your property, then define its rooms with their type and area. Once a room exists, you can start a design project and begin exploring layouts.",
  },
];

export function searchFaq(query: string): FaqEntry[] {
  const normalized = query.trim().toLowerCase();
  if (normalized === "") return [];
  return FAQ_ENTRIES.filter(
    (entry) =>
      entry.question.toLowerCase().includes(normalized) ||
      entry.answer.toLowerCase().includes(normalized),
  );
}
