/**
 * Sri Anjaneya Youth Zarugumalli - Knowledge Base and RAG Engine
 * Verified, official information for Sri Anjaneya Youth Association.
 */

export const STATIC_KNOWLEDGE = [
  {
    id: 'about_org',
    category: 'organization',
    keywords: ['who are you', 'what is sri anjaneya youth', 'about', 'organization', 'association', 'zarugumalli', 'prakasam', 'history', 'vision', 'mission'],
    content: `**Sri Anjaneya Youth Association** is an official youth organization based in Zarugumalli Village, Zarugumalli Mandal, Prakasam District, Andhra Pradesh - 523271.
The association brings together dedicated local youth and devotees to organize Hanuman temple seva, religious festivals, free Annadanam (food distribution), blood donation camps, village welfare initiatives, and youth empowerment.`
  },
  {
    id: 'organization_activities',
    category: 'activities',
    keywords: ['activities', 'what do you do', 'work', 'seva', 'programs', 'annadanam', 'blood donation', 'temple'],
    content: `**Key Activities and Seva Initiatives**:
- **Hanuman Jayanthi and Festival Seva**: Special Abhishekam, devotional bhajan programs, grand procession (Shobha Yatra), and temple decoration.
- **Annadanam**: Free food distribution to villagers, pilgrims, and devotees during festival celebrations.
- **Community and Social Welfare**: Blood donation camps, health awareness drives, educational support for students, and village green environment initiatives.
- **Temple Infrastructure**: Assisting in temple maintenance, lighting, and community hall upkeep.`
  },
  {
    id: 'members_leadership',
    category: 'members',
    keywords: ['who are the members', 'members', 'president', 'secretary', 'committee', 'leadership', 'executives', 'volunteers'],
    content: `**Members and Executive Committee**:
- Sri Anjaneya Youth consists of registered youth members, volunteers, and executive committee leaders from Zarugumalli.
- Registered members can request Executive Committee membership directly through their account.
- To view the complete active member directory and executive team, visit [/members](/members).`
  },
  {
    id: 'events_info',
    category: 'events',
    keywords: ['upcoming events', 'events', 'next event', 'when is the event', 'event date', 'event time', 'location', 'venue', 'hanuman jayanthi', 'programs'],
    content: `**Events and Celebrations**:
- Sri Anjaneya Youth organizes spiritual and community events throughout the year, including Hanuman Jayanthi, Sri Rama Navami, Annadanam programs, and health camps.
- View the live, updated schedule of upcoming and past events on our [/events](/events) page.`
  },
  {
    id: 'announcements_info',
    category: 'announcements',
    keywords: ['announcements', 'latest news', 'updates', 'notice', 'messages', 'volunteer', 'meeting'],
    content: `**Announcements and Official Notices**:
- Official association notices, meeting schedules, volunteer calls, and community updates are posted on our [/announcements](/announcements) page.`
  },
  {
    id: 'website_navigation',
    category: 'navigation',
    keywords: ['where can i register', 'where can i donate', 'how to sign up', 'how to donate', 'see events', 'see members', 'see announcements', 'see expenditure', 'my profile', 'page', 'route', 'navigate'],
    content: `**Website Directory and Page Links**:
- **Home / Dashboard**: [/](/) - Overview, stats, and recent updates.
- **Events**: [/events](/events) - Complete schedule of upcoming and past events.
- **Members**: [/members](/members) - Directory of association members and committee.
- **Announcements**: [/announcements](/announcements) - Community notices and volunteer calls.
- **Donate**: [/donate](/donate) - Support temple seva securely via online payment.
- **Expenditure**: [/expenditure](/expenditure) - Transparent financial records and seva expenses.
- **My Profile**: [/profile](/profile) - Manage member details and committee request.
- **Sign In / Register**: [/signin](/signin) and [/signup](/signup) - Account access.`
  },
  {
    id: 'contact_info',
    category: 'contact',
    keywords: ['contact', 'phone', 'email', 'address', 'location', 'reach', 'call', 'map', 'pin code', 'zarugumalli'],
    content: `**Contact Details**:
- **Address**: Main Road, Zarugumalli Village, Zarugumalli Mandal, Prakasam District, Andhra Pradesh - 523271, India.
- **Email**: srianjaneyayouth9@gmail.com
- **Website**: https://sri-anjaneya-youth-zarugumalli.web.app
- To send contributions, visit our [/donate](/donate) page.`
  },
  {
    id: 'donations_expenditure',
    category: 'donations',
    keywords: ['donation', 'donate', 'payment', 'upi', 'razorpay', 'money', 'fund', 'receipt', 'expenditure', 'transparent', 'finances'],
    content: `**Donations and Financial Transparency**:
- Anyone can contribute online via UPI, Credit/Debit Cards, or Net Banking on our [/donate](/donate) page.
- Instant digital receipts are generated for online contributions.
- Association funds and seva expenditures are publicly audited and published on [/expenditure](/expenditure).`
  },
  {
    id: 'membership_registration',
    category: 'membership',
    keywords: ['member', 'join', 'committee', 'volunteer', 'register', 'become a member', 'how to join'],
    content: `**Joining Sri Anjaneya Youth**:
- Any youth or resident of Zarugumalli can register as a member by creating an account at [/signup](/signup).
- Members can apply for Executive Committee status on their [/profile](/profile) page.`
  }
];

export function searchKnowledgeBase(query, maxResults = 4) {
  const normalized = (query || '').toLowerCase().trim();
  const words = normalized.split(/\s+/).filter((word) => word.length > 2);

  const scored = STATIC_KNOWLEDGE.map((item) => {
    let score = 0;

    item.keywords.forEach((keyword) => {
      const lowerKeyword = keyword.toLowerCase();
      if (normalized === lowerKeyword) score += 8;
      else if (normalized.includes(lowerKeyword)) score += lowerKeyword.includes(' ') ? 5 : 3;
    });

    words.forEach((word) => {
      if (item.content.toLowerCase().includes(word)) score += 1;
    });

    return { item, score };
  });

  const matching = scored
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((result) => result.item);

  if (matching.length === 0) {
    return [STATIC_KNOWLEDGE[0], STATIC_KNOWLEDGE[5], STATIC_KNOWLEDGE[6]];
  }

  return matching.slice(0, maxResults);
}
