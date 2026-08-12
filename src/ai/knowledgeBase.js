/**
 * Sri Anjaneya Youth Zarugumalli — Knowledge Base & RAG Engine
 * Approved static & dynamic content for the AI Chatbot.
 */

export const STATIC_KNOWLEDGE = [
  {
    id: "about_org",
    category: "organization",
    keywords: ["who are you", "what is sri anjaneya youth", "about", "organization", "association", "zarugumalli", "prakasam"],
    content: "Sri Anjaneya Youth Association is a non-profit youth organization based in Zarugumalli village, Prakasam District, Andhra Pradesh. The association is dedicated to Hanuman temple seva, cultural event organization, village welfare, educational support, and community development."
  },
  {
    id: "objectives_activities",
    category: "organization",
    keywords: ["objective", "goal", "activities", "work", "what do you do", "mission", "purpose", "seva"],
    content: "Our main activities include:\n- Annual Hanuman Jayanthi grand celebrations and procession\n- Free Annadanam (food distribution) to devotees and villagers\n- Cultural and devotional music/dance festivals\n- Youth blood donation camps and health awareness\n- Village infrastructure support and temple maintenance\n- Student encouragement and community welfare programs."
  },
  {
    id: "website_navigation",
    category: "navigation",
    keywords: ["where can i register", "where can i donate", "how to sign up", "how to donate", "see events", "see members", "see gallery", "page", "route", "navigate"],
    content: "Website Navigation Guide:\n- **Home / Dashboard**: [/](/) — Overview of stats, upcoming events, and recent updates.\n- **Events**: [/events](/events) — View upcoming and past temple & cultural events.\n- **Members**: [/members](/members) — Directory of active association youth members.\n- **Gallery**: [/gallery](/gallery) — Photos of past celebrations, Hanuman Jayanthi, and Annadanam.\n- **Announcements**: [/announcements](/announcements) — Official notices and real-time community updates.\n- **Donate**: [/donate](/donate) — Contribute securely via UPI / Razorpay to support temple seva.\n- **Expenditure**: [/expenditure](/expenditure) — Transparent financial records and seva expenditure reports.\n- **My Profile**: [/profile](/profile) — Manage your member account, photo, and committee request.\n- **Sign In / Register**: [/signin](/signin) & [/signup](/signup) — Access member features."
  },
  {
    id: "contact_info",
    category: "contact",
    keywords: ["contact", "phone", "email", "address", "location", "reach", "call", "map"],
    content: "Contact Sri Anjaneya Youth Association:\n- **Address**: Main Road, Zarugumalli Village, Zarugumalli Mandal, Prakasam District, Andhra Pradesh - 523271, India.\n- **Phone**: +91 94949 94949\n- **Email**: info@srianjaneyayouth.org / srianjaneyayouth9@gmail.com\n- **Website**: https://sri-anjaneya-youth-zarugumalli.web.app\n- You can also visit our [/donate](/donate) page to support our seva directly."
  },
  {
    id: "donations_faq",
    category: "faq",
    keywords: ["donation", "donate", "payment", "upi", "razorpay", "money", "fund", "receipt", "transparent"],
    content: "Donations & Seva Fund:\n- You can contribute online using UPI, Credit/Debit cards, or Net Banking on our secure [/donate](/donate) page.\n- Instant email receipts are automatically generated and sent to your registered email address.\n- All donations are logged transparently and audited in our public [/expenditure](/expenditure) section."
  },
  {
    id: "membership_faq",
    category: "faq",
    keywords: ["member", "join", "committee", "volunteer", "register", "become a member"],
    content: "Membership & Committee:\n- Any youth or devotee can register as a member by creating an account at [/signup](/signup).\n- Registered members can request executive committee membership from their [/profile](/profile) page.\n- Committee approvals are reviewed by association administrators."
  }
];

/**
 * Perform relevance-scored keyword search over the knowledge base
 */
export function searchKnowledgeBase(query, maxResults = 3) {
  const normalized = (query || "").toLowerCase().trim();
  const words = normalized.split(/\s+/).filter(w => w.length > 2);

  const scored = STATIC_KNOWLEDGE.map(item => {
    let score = 0;
    // Check keywords match: exact match gets 5, substring gets 3
    item.keywords.forEach(kw => {
      const lowerKw = kw.toLowerCase();
      if (normalized === lowerKw || normalized.includes(lowerKw)) {
        score += lowerKw.includes(' ') ? 5 : 3;
      }
    });
    // Check content word matches
    words.forEach(w => {
      if (item.content.toLowerCase().includes(w)) score += 1;
    });
    return { item, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(s => s.item);
}
