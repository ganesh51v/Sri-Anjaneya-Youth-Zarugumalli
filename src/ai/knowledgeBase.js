/**
 * Sri Anjaneya Youth Zarugumalli — Comprehensive Knowledge Base & RAG Engine
 * Exact, authoritative information matching the live website data.
 */

export const STATIC_KNOWLEDGE = [
  {
    id: "about_org",
    category: "organization",
    keywords: ["who are you", "what is sri anjaneya youth", "about", "organization", "association", "zarugumalli", "prakasam", "history", "vision"],
    content: `**Sri Anjaneya Youth Association** is a dedicated non-profit youth organization based in Zarugumalli Village, Zarugumalli Mandal, Prakasam District, Andhra Pradesh - 523271.
The association brings together village youth to lead Hanuman temple seva, organize grand cultural celebrations, provide free Annadanam (food distribution), conduct health & blood donation camps, support green environment drives, and foster youth welfare.`
  },
  {
    id: "leadership_members",
    category: "members",
    keywords: ["who are the members", "members", "president", "secretary", "treasurer", "leader", "ganesh", "kalyan", "ravi", "siva", "anil", "committee"],
    content: `**Sri Anjaneya Youth Leadership & Active Members**:
- **Nalamalapu Ganesh**: President / Founder (Phone: +91 94949 94949, Main Street, Zarugumalli)
- **Kalyan Kumar**: Secretary (Phone: +91 83838 83838, Ramalayam Street, Zarugumalli)
- **Ravi Teja**: Treasurer (Phone: +91 76767 76767, Ganesh Temple Street, Zarugumalli)
- **Siva Prasad**: Youth Coordinator (Phone: +91 91919 91919, Bypass Road, Zarugumalli)
- **Anil Kumar**: Seva Representative (Phone: +91 95959 95959, Bazar Center, Zarugumalli)

View our full member directory at [/members](/members).`
  },
  {
    id: "upcoming_events",
    category: "events",
    keywords: ["upcoming events", "events coming", "next event", "hanuman jayanthi", "tree plantation", "when is the event", "event date", "event time", "location", "venue"],
    content: `**Upcoming Events (2026)**:

1. **Sri Hanuman Jayanthi Celebrations & Annadanam**
   - **Date**: June 25, 2026
   - **Time**: 08:00 AM onwards
   - **Location**: Sri Anjaneya Swamy Temple, Zarugumalli
   - **Details**: Grand Abhishekam, devotional bhajans, cultural procession, and massive free Annadanam (food distribution) for all villagers and devotees.

2. **Village Tree Plantation Drive (Green Zarugumalli)**
   - **Date**: June 20, 2026
   - **Time**: 07:00 AM
   - **Location**: ZP High School Ground & Lake Side Road, Zarugumalli
   - **Details**: Aiming to plant 200+ saplings to expand green cover across the village.

View all upcoming and past events at [/events](/events).`
  },
  {
    id: "completed_events",
    category: "events",
    keywords: ["past events", "completed events", "previous events", "rama navami", "medical camp", "blood donation drive"],
    content: `**Completed Recent Events**:

1. **Sri Rama Navami Shobha Yatra & Panakam Distribution** (April 18, 2026 @ 04:00 PM, Ramalayam Center) — Spiritual Shobha Yatra and cool Panakam / Vadapappu distribution to all villagers.
2. **Free Medical Camp & Blood Donation Drive** (March 12, 2026 @ 09:00 AM, Panchayat Office Hall) — In collaboration with RIMS Hospital. Served 150+ villagers and collected 62 units of blood.

View photo highlights in our [/gallery](/gallery).`
  },
  {
    id: "latest_announcements",
    category: "announcements",
    keywords: ["announcements", "latest news", "updates", "notice", "messages", "volunteer", "meeting"],
    content: `**Latest Announcements**:

1. **Sri Hanuman Jayanthi Volunteer Signups Open**: Youth members are requested to gather at temple premises on Friday at 6:00 PM to organize duties for Annadanam.
2. **General Body Meeting - Seva Activities Agenda**: Monthly youth meet on Sunday at 10:00 AM at Panchayat library hall. Attendance mandatory for registered members.
3. **Heartfelt Thanks to Blood Donors**: 62 units of blood collected in our recent drive.

Read all notices at [/announcements](/announcements).`
  },
  {
    id: "website_navigation",
    category: "navigation",
    keywords: ["where can i register", "where can i donate", "how to sign up", "how to donate", "see events", "see members", "see gallery", "see announcements", "see expenditure", "my profile", "page", "route", "navigate"],
    content: `**Website Pages & Routes**:
- **Home / Dashboard**: [/](/) — Organization overview, live stats, upcoming events & announcements.
- **Events**: [/events](/events) — Complete schedule of upcoming & past temple and cultural events.
- **Members**: [/members](/members) — Directory of executive leaders & youth volunteers.
- **Gallery**: [/gallery](/gallery) — High-resolution photos of celebrations, Jayanthi, and Annadanam.
- **Announcements**: [/announcements](/announcements) — Real-time community updates & meeting notices.
- **Donate**: [/donate](/donate) — Contribute securely online (UPI / Cards / Net Banking) to temple seva.
- **Expenditure**: [/expenditure](/expenditure) — 100% transparent financial records & audited seva expenses.
- **My Profile**: [/profile](/profile) — Update profile photo, phone number, village, and apply for Committee Membership.
- **Sign In / Register**: [/signin](/signin) & [/signup](/signup) — Account access for association members.`
  },
  {
    id: "contact_info",
    category: "contact",
    keywords: ["contact", "phone", "email", "address", "location", "reach", "call", "map", "pin code", "zarugumalli"],
    content: `**Contact Information**:
- **Address**: Main Road, Zarugumalli Village, Zarugumalli Mandal, Prakasam District, Andhra Pradesh - 523271, India.
- **Phone**: +91 94949 94949
- **Email**: info@srianjaneyayouth.org / srianjaneyayouth9@gmail.com
- **Website**: https://sri-anjaneya-youth-zarugumalli.web.app
- To support our seva directly, please visit [/donate](/donate).`
  },
  {
    id: "donations_expenditure",
    category: "donations",
    keywords: ["donation", "donate", "payment", "upi", "razorpay", "money", "fund", "receipt", "expenditure", "transparent", "finances"],
    content: `**Donations & Financial Transparency**:
- Anyone can donate securely online via UPI, Credit/Debit cards, or Net Banking on our [/donate](/donate) page.
- Automated instant email receipts with donor verification are sent immediately upon successful payment.
- 100% of donations are audited and published in our public [/expenditure](/expenditure) section (covering tenting, flowers, lighting, and Annadanam food costs).`
  },
  {
    id: "membership_rules",
    category: "membership",
    keywords: ["member", "join", "committee", "volunteer", "register", "become a member", "rules", "how to join"],
    content: `**Membership & Committee Registration**:
- Any youth or village resident can register a member account at [/signup](/signup).
- Once signed in, members can update their profile and submit an Executive Committee Membership request from [/profile](/profile).
- Committee requests are reviewed and approved by association administrators.`
  }
];

/**
 * Enhanced RAG Search Engine over the Knowledge Base
 */
export function searchKnowledgeBase(query, maxResults = 4) {
  const normalized = (query || "").toLowerCase().trim();
  const words = normalized.split(/\s+/).filter(w => w.length > 2);

  const scored = STATIC_KNOWLEDGE.map(item => {
    let score = 0;
    
    // Keyword matching
    item.keywords.forEach(kw => {
      const lowerKw = kw.toLowerCase();
      if (normalized === lowerKw) {
        score += 8; // Exact match
      } else if (normalized.includes(lowerKw)) {
        score += lowerKw.includes(' ') ? 5 : 3;
      }
    });

    // Content body word matching
    words.forEach(w => {
      if (item.content.toLowerCase().includes(w)) score += 1;
    });

    return { item, score };
  });

  // Always return top matching docs. If no high keyword match, return default overview docs
  const matching = scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(s => s.item);

  if (matching.length === 0) {
    // Default fallback docs (Overview, Navigation, Events, Contact)
    return [STATIC_KNOWLEDGE[0], STATIC_KNOWLEDGE[2], STATIC_KNOWLEDGE[5]];
  }

  return matching.slice(0, maxResults);
}
