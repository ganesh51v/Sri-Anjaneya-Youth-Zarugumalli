/**
 * Comprehensive Telugu Translation & Transliteration Engine
 * Converts English user names, roles, statuses, places, and phrases
 * into authentic Telugu script (తెలుగు లిపి).
 */

// ─── 1. PHRASES (Matches multi-word phrases first) ───────────────────────────
export const TELUGU_PHRASES = [
  ['near hanuman statue, zarugumalli, prakasam dist, andhra pradesh - 523274', 'శ్రీ ఆంజనేయ స్వామి విగ్రహం దగ్గర, జరుగమల్లి, ప్రకాశం జిల్లా, ఆంధ్రప్రదేశ్ - 523274'],
  ['near hanuman statue,zarugumalli, prakasam dist, andhra pradesh - 523274', 'శ్రీ ఆంజనేయ స్వామి విగ్రహం దగ్గర, జరుగమల్లి, ప్రకాశం జిల్లా, ఆంధ్రప్రదేశ్ - 523274'],
  ['near hanuman statue, zarugumalli', 'హనుమాన్ విగ్రహం దగ్గర, జరుగమల్లి'],
  ['near hanuman statue', 'హనుమాన్ విగ్రహం దగ్గర'],
  ['near ramalayam temple', 'రామాలయం గుడి దగ్గర'],
  ['ramalayam street, zarugumalli', 'రామాలయం వీధి, జరుగమల్లి'],
  ['ramalayam street', 'రామాలయం వీధి'],
  ['bypass road, zarugumalli', 'బైపాస్ రోడ్డు, జరుగమల్లి'],
  ['bypass road', 'బైపాస్ రోడ్డు'],
  ['temple street', 'గుడి వీధి'],
  ['main road', 'ప్రధాన రహదారి'],
  ['school road', 'పాఠశాల రోడ్డు'],
  ['bus stand', 'బస్టాండ్'],
  ['prakasam dist, andhra pradesh', 'ప్రకాశం జిల్లా, ఆంధ్రప్రదేశ్'],
  ['prakasam district', 'ప్రకాశం జిల్లా'],
  ['prakasam dist', 'ప్రకాశం జిల్లా'],
  ['andhra pradesh', 'ఆంధ్రప్రదేశ్'],
  ['bazar street', 'బజార్ వీధి'],
  ['near ramalayam', 'రామాలయం దగ్గర'],

  // Roles & Designations
  ['president / founder', 'అధ్యక్షుడు / వ్యవస్థాపకుడు'],
  ['president & founder', 'అధ్యక్షుడు మరియు వ్యవస్థాపకుడు'],
  ['vice president', 'ఉపాధ్యక్షుడు'],
  ['joint secretary', 'సహాయ కార్యదర్శి'],
  ['general secretary', 'ప్రధాన కార్యదర్శి'],
  ['youth coordinator', 'యువజన సమన్వయకర్త'],
  ['youth leader', 'యువజన నాయకుడు'],
  ['seva representative', 'సేవా ప్రతినిధి'],
  ['active volunteer', 'క్రియాశీల వాలంటీర్'],
  ['office bearer', 'కార్యవర్గ సభ్యుడు'],
  ['committee member', 'కమిటీ సభ్యులు'],

  // Purposes
  ['general fund / general seva', 'సాధారణ నిధి / సాధారణ సేవ'],
  ['general fund', 'సాధారణ నిధి'],
  ['general seva', 'సాధారణ సేవ'],
  ['annadanam seva', 'అన్నదాన సేవ'],
  ['community education kits', 'కమ్యూనిటీ విద్యా కిట్లు'],
  ['hanuman jayanthi annadanam', 'హనుమాన్ జయంతి అన్నదానం'],
  ['temple devastanam renovation', 'దేవాలయ పునరుద్ధరణ'],
  ['temple renovation', 'దేవాలయ పునరుద్ధరణ'],
  ['village children education support', 'గ్రామ పిల్లల విద్యా సహాయం'],
  ['education support', 'విద్యా సహాయం'],
  ['blood donation camp', 'రక్తదాన శిబిరం'],

  // Payment methods
  ['bhim upi / qr', 'BHIM UPI / QR కోడ్'],
  ['upi qr', 'UPI QR కోడ్'],
  ['phonepe / upi qr', 'PhonePe / UPI QR కోడ్'],
  ['google pay', 'Google Pay'],
  ['credit / debit card', 'క్రెడిట్ / డెబిట్ కార్డ్'],
  ['net banking', 'నెట్ బ్యాంకింగ్'],
  ['bank transfer', 'డైరెక్ట్ బ్యాంక్ బదిలీ'],

  // UI status & fallbacks
  ['not a committee member', 'కమిటీ సభ్యులు కాదు'],
  ['approved committee member', 'ఆమోదించబడిన కమిటీ సభ్యులు'],
  ['no phone', 'ఫోన్ లేదు'],
  ['no area', 'ప్రాంతం లేదు'],
  ['not added', 'జోడించలేదు'],
  ['pending committee membership requests', 'పెండింగ్ కమిటీ సభ్యత్వ అభ్యర్థనలు'],
  ['members card list', 'సభ్యుల కార్డు జాబితా'],
  ['portal accounts', 'పోర్టల్ ఖాతాలు'],
  ['verified donations', 'ధృవీకరించబడిన విరాళాలు'],
  ['association gallery', 'సంఘం గ్యాలరీ'],
  ['scheduled events', 'రాబోయే కార్యక్రమాలు'],
  ['gallery albums', 'గ్యాలరీ ఆల్బమ్‌లు'],
  ['administrative control panel', 'అడ్మినిస్ట్రేటివ్ కంట్రోల్ ప్యానెల్'],
  ['review statistics and manage registered portal users', 'గణాంకాలను సమీక్షించండి మరియు పోర్టల్ సభ్యులను నిర్వహించండి'],
];

// ─── 2. CURATED TELUGU WORDS & NAMES DICTIONARY ─────────────────────────────
export const TELUGU_DICTIONARY = {
  // First names & Surnames
  'ganesh': 'గణేష్',
  'nalamalapu': 'నలమలపు',
  'ravi': 'రవి',
  'kumar': 'కుమార్',
  'kalyan': 'కళ్యాణ్',
  'siva': 'శివ',
  'shiva': 'శివ',
  'prasad': 'ప్రసాద్',
  'anil': 'అనిల్',
  'sunil': 'సునీల్',
  'suresh': 'సురేష్',
  'ramesh': 'రమేష్',
  'venkatesh': 'వెంకటేష్',
  'venkat': 'వెంకట్',
  'venkata': 'వెంకట',
  'venkateswarlu': 'వెంకటేశ్వర్లు',
  'naresh': 'నరేష్',
  'mahesh': 'మహేష్',
  'rajesh': 'రాజేష్',
  'pavan': 'పవన్',
  'pawan': 'పవన్',
  'sai': 'సాయి',
  'ram': 'రామ్',
  'rama': 'రామ',
  'krishna': 'కృష్ణ',
  'reddy': 'రెడ్డి',
  'chowdary': 'చౌదరి',
  'choudary': 'చౌదరి',
  'naidu': 'నాయుడు',
  'rao': 'రావు',
  'varma': 'వర్మ',
  'sharma': 'శర్మ',
  'sastry': 'శాస్త్రి',
  'raju': 'రాజు',
  'babu': 'బాబు',
  'mohan': 'మోహన్',
  'srinivas': 'శ్రీనివాస్',
  'srinivasa': 'శ్రీనివాస',
  'sekhar': 'శేఖర్',
  'shekhar': 'శేఖర్',
  'chandu': 'చందు',
  'chandra': 'చంద్ర',
  'chakravarthy': 'చక్రవర్తి',
  'chakravarthi': 'చక్రవర్తి',
  'ramalayam': 'రామాలయం',
  'subba': 'సుబ్బా',
  'subbarao': 'సుబ్బారావు',
  'lakshmi': 'లక్ష్మి',
  'laxmi': 'లక్ష్మి',
  'harish': 'హరీష్',
  'girish': 'గిరీష్',
  'satish': 'సతీష్',
  'satyanarayana': 'సత్యనారాయణ',
  'narayana': 'నారాయణ',
  'manoj': 'మనోజ్',
  'tarun': 'తరుణ్',
  'tharun': 'తరుణ్',
  'naveen': 'నవీన్',
  'praveen': 'ప్రవీణ్',
  'pradeep': 'ప్రదీప్',
  'sandip': 'సందీప్',
  'sandeep': 'సందీప్',
  'ajay': 'అజయ్',
  'vijay': 'విజయ్',
  'vamsi': 'వంశీ',
  'vamshi': 'వంశీ',
  'gopi': 'గోపి',
  'madhav': 'మాధవ్',
  'murali': 'మురళి',
  'balaji': 'బాలాజీ',
  'balakrishna': 'బాలకృష్ణ',
  'jagadeesh': 'జగదీష్',
  'anji': 'ఆంజి',
  'anjaneya': 'ఆంజనేయ',
  'anjaneyulu': 'ఆంజనేయులు',
  'hanuma': 'హనుమ',
  'hanuman': 'హనుమాన్',
  'maruthi': 'మారుతి',
  'swamy': 'స్వామి',
  'swami': 'స్వామి',
  'bhaktha': 'భక్తుడు',
  'nagaraju': 'నాగరాజు',
  'nageswara': 'నాగేశ్వర',
  'brahmam': 'బ్రహ్మం',
  'karthik': 'కార్తీక్',
  'karthikeya': 'కార్తికేయ',
  'lokesh': 'లోకేష్',
  'akhil': 'అఖిల్',
  'nikhil': 'నిఖిల్',
  'rohit': 'రోహిత్',
  'virat': 'విరాట్',
  'surya': 'సూర్య',
  'chaitanya': 'చైతన్య',
  'teja': 'తేజ',
  'prudhvi': 'పృథ్వీ',
  'bharath': 'భరత్',
  'bhargav': 'భార్గవ్',
  'charan': 'చరణ్',
  'dinesh': 'దినేష్',
  'deepak': 'దీపక్',
  'hemanth': 'హేమంత్',
  'phanindra': 'ఫణీంద్ర',
  'vishnu': 'విష్ణు',
  'santhosh': 'సంతోష్',
  'santosh': 'సంతోష్',
  'vignesh': 'విఘ్నేష్',
  'vinay': 'వినయ్',
  'vivek': 'వివేక్',
  'chiranjeevi': 'చిరంజీవి',
  'ramu': 'రాము',
  'somu': 'సోము',
  'giri': 'గిరి',
  'hari': 'హరి',
  'sri': 'శ్రీ',
  'shree': 'శ్రీ',
  'gurram': 'గుర్రం',
  'darsi': 'దర్శి',
  'addanki': 'అద్దంకి',
  'ongole': 'ఒంగోలు',
  'kandukur': 'కందుకూరు',
  'singarayakonda': 'సింగరాయకొండ',
  'tangutur': 'టంగుటూరు',
  'zarugumalli': 'జరుగమల్లి',

  // Roles & Personas
  'admin': 'అడ్మిన్',
  'administrator': 'అడ్మినిస్ట్రేటర్',
  'member': 'సభ్యుడు',
  'members': 'సభ్యులు',
  'volunteer': 'వాలంటీర్',
  'coordinator': 'సమన్వయకర్త',
  'founder': 'వ్యవస్థాపకుడు',
  'president': 'అధ్యక్షుడు',
  'secretary': 'కార్యదర్శి',
  'treasurer': 'కోశాధికారి',
  'donor': 'దాత',
  'donors': 'దాతలు',
  'user': 'వినియోగదారుడు',
  'users': 'వినియోగదారులు',
  'developer': 'రూపకర్త',

  // Statuses
  'approved': 'ఆమోదించబడింది',
  'pending': 'పెండింగ్‌లో ఉంది',
  'rejected': 'తిరస్కరించబడింది',
  'success': 'విజయవంతమైంది',
  'failed': 'విఫలమైంది',
  'completed': 'పూర్తయింది',
  'upcoming': 'రాబోయేవి',
  'active': 'క్రియాశీలకంగా',
  'inactive': 'నిష్క్రియం',
  'verified': 'ధృవీకరించబడింది',
  'none': 'ఏదీ లేదు',

  // Common UI Actions & Words
  'approve': 'ఆమోదించు',
  'decline': 'తిరస్కరించు',
  'delete': 'తొలగించు',
  'edit': 'సవరించు',
  'save': 'సేవ్ చేయి',
  'saving': 'సేవ్ అవుతోంది...',
  'cancel': 'రద్దు చేయి',
  'view': 'చూడండి',
  'details': 'వివరాలు',
  'actions': 'చర్యలు',
  'status': 'స్థితి',
  'role': 'హోదా',
  'name': 'పేరు',
  'email': 'ఈమెయిల్',
  'phone': 'ఫోన్',
  'amount': 'మొత్తం',
  'date': 'తేదీ',
  'time': 'సమయం',
  'location': 'స్థలం',
  'description': 'వివరణ',
  'receipt': 'రసీదు',
  'notes': 'గమనికలు',
  'total': 'మొత్తం',
  'income': 'ఆదాయం',
  'expenditure': 'ఖర్చులు',
  'balance': 'నికర నిల్వ',
  'search': 'వెతకండి',
  'filter': 'ఫిల్టర్',
  'all': 'అన్నీ',
  'download': 'డౌన్‌లోడ్',
  'export': 'ఎగుమతి చేయి',
  'cash': 'నగదు',
  'upi': 'UPI',
  'cheque': 'చెక్',
  'card': 'కార్డ్',
  'other': 'ఇతరములు',
};

// ─── 3. PHONETIC ENGLISH-TO-TELUGU TRANSLITERATOR ────────────────────────────
// Transliterates any arbitrary English name into natural Telugu script.
export function phoneticEnglishToTelugu(word) {
  if (!word) return '';
  const clean = word.toLowerCase().trim();
  if (TELUGU_DICTIONARY[clean]) return TELUGU_DICTIONARY[clean];

  // Consonants ordered from longest sequence to single character
  const CONSONANTS = [
    ['ksh', 'క్ష'], ['dny', 'జ్ఞ'], ['jny', 'జ్ఞ'], ['gn', 'జ్ఞ'],
    ['kh', 'ఖ'], ['gh', 'ఘ'], ['ch', 'చ'], ['chh', 'ఛ'], ['jh', 'ఝ'],
    ['th', 'త'], ['dh', 'ధ'], ['ph', 'ఫ'], ['bh', 'భ'], ['sh', 'శ'],
    ['k', 'క'], ['g', 'గ'], ['j', 'జ'], ['t', 'ట'], ['d', 'డ'],
    ['n', 'న'], ['p', 'ప'], ['f', 'ఫ'], ['b', 'బ'], ['m', 'మ'],
    ['y', 'య'], ['r', 'ర'], ['l', 'ల'], ['v', 'వ'], ['w', 'వ'],
    ['s', 'స'], ['h', 'హ'], ['c', 'క'], ['q', 'క్వ'], ['x', 'క్స్'], ['z', 'జ్']
  ];

  // Vowel signs (Matras) following a consonant
  const VOWELS = [
    ['aai', 'ాయి'], ['aau', 'ావు'],
    ['aa', 'ా'], ['ee', 'ీ'], ['ii', 'ీ'], ['oo', 'ూ'], ['uu', 'ూ'],
    ['ai', 'ై'], ['au', 'ౌ'], ['ou', 'ౌ'], ['ea', 'ే'], ['oa', 'ో'],
    ['ay', 'ే'], ['ey', 'ే'],
    ['a', ''], ['e', 'ె'], ['i', 'ి'], ['o', 'ొ'], ['u', 'ు']
  ];

  // Independent vowels at the beginning of a word
  const INDEPENDENT_VOWELS = [
    ['aa', 'ఆ'], ['ee', 'ఈ'], ['ii', 'ఈ'], ['oo', 'ఊ'], ['uu', 'ఊ'],
    ['ai', 'ఐ'], ['au', 'ఔ'], ['ou', 'ఔ'],
    ['a', 'అ'], ['e', 'ఎ'], ['i', 'ఇ'], ['o', 'ఒ'], ['u', 'ఉ']
  ];

  let result = '';
  let i = 0;
  let isStartOfWord = true;

  while (i < clean.length) {
    const char = clean[i];

    // Preserve non-alphabetic separators
    if (char === ' ' || char === '.' || char === '-' || char === ',' || char === '/' || char === '&') {
      result += char;
      i++;
      isStartOfWord = true;
      continue;
    }

    // Single uppercase initials like "N." or "G."
    if (clean.length === 1) {
      const INITIALS_MAP = {
        'a': 'ఎ', 'b': 'బి', 'c': 'సి', 'd': 'డి', 'e': 'ఇ', 'f': 'ఎఫ్',
        'g': 'జి', 'h': 'హెచ్', 'i': 'ఐ', 'j': 'జె', 'k': 'కె', 'l': 'ఎల్',
        'm': 'ఎం', 'n': 'ఎన్', 'o': 'ఓ', 'p': 'పి', 'q': 'క్యూ', 'r': 'ఆర్',
        's': 'ఎస్', 't': 'టి', 'u': 'యు', 'v': 'వి', 'w': 'డబ్ల్యూ', 'x': 'ఎక్స్',
        'y': 'వై', 'z': 'జెడ్'
      };
      return INITIALS_MAP[clean] || clean;
    }

    // Independent vowel at start of word
    if (isStartOfWord) {
      let matchedVowel = false;
      for (const [vStr, vTel] of INDEPENDENT_VOWELS) {
        if (clean.startsWith(vStr, i)) {
          result += vTel;
          i += vStr.length;
          isStartOfWord = false;
          matchedVowel = true;
          break;
        }
      }
      if (matchedVowel) continue;
    }

    // Match consonant
    let matchedConsonant = false;
    for (const [cStr, cTel] of CONSONANTS) {
      if (clean.startsWith(cStr, i)) {
        i += cStr.length;
        matchedConsonant = true;
        isStartOfWord = false;

        // Check following vowel matra
        let matchedFollowingVowel = false;
        for (const [vStr, vMatra] of VOWELS) {
          if (clean.startsWith(vStr, i)) {
            result += cTel + vMatra;
            i += vStr.length;
            matchedFollowingVowel = true;
            break;
          }
        }

        if (!matchedFollowingVowel) {
          // If at end of word or followed by consonant/punctuation, attach virama (halant)
          if (i >= clean.length || clean[i] === ' ' || clean[i] === '.' || clean[i] === ',' || clean[i] === '-') {
            result += cTel + '్';
          } else {
            // Cluster (conjunct consonant)
            result += cTel + '్';
          }
        }
        break;
      }
    }

    if (!matchedConsonant) {
      result += clean[i];
      i++;
      isStartOfWord = false;
    }
  }

  return result;
}

// ─── 4. TRANSLATION EXPORT HELPERS ──────────────────────────────────────────

/**
 * Translates/transliterates a person's full name into Telugu script when language === 'te'.
 * Example: 'GANESH NALAMALAPU' -> 'గణేష్ నలమలపు'
 *          'Ravi Kumar' -> 'రవి కుమార్'
 */
export function translateName(name, language = 'te') {
  if (!name || language !== 'te') return name;
  if (typeof name !== 'string') return name;

  const trimmed = name.trim();
  if (!trimmed) return name;

  // If already in Telugu or contains Telugu characters (Unicode range 0C00–0C7F)
  if (/[\u0C00-\u0C7F]/.test(trimmed)) return trimmed;

  const lower = trimmed.toLowerCase();

  // 1. Direct dictionary match for whole string
  if (TELUGU_DICTIONARY[lower]) return TELUGU_DICTIONARY[lower];

  // 2. Tokenize by space, period, hyphen, comma
  const tokens = trimmed.split(/(\s+|,|\.|\/|-)/);
  const translatedTokens = tokens.map((token) => {
    if (!token.trim() || /[,\.\/\-\s]/.test(token)) return token;
    const tLower = token.toLowerCase();
    if (TELUGU_DICTIONARY[tLower]) return TELUGU_DICTIONARY[tLower];
    return phoneticEnglishToTelugu(token);
  });

  return translatedTokens.join('');
}

/**
 * Translates a user role / designation into Telugu when language === 'te'.
 * Example: 'President / Founder' -> 'అధ్యక్షుడు / వ్యవస్థాపకుడు'
 *          'admin' -> 'అడ్మిన్'
 *          'Member' -> 'సభ్యుడు'
 */
export function translateRole(role, language = 'te') {
  if (!role || language !== 'te') return role;
  if (typeof role !== 'string') return role;

  const lower = role.toLowerCase().trim();
  if (TELUGU_DICTIONARY[lower]) return TELUGU_DICTIONARY[lower];

  for (const [enPhrase, tePhrase] of TELUGU_PHRASES) {
    if (lower === enPhrase) return tePhrase;
  }

  return translateName(role, language);
}

/**
 * Translates address, village, or street into Telugu when language === 'te'.
 * Example: 'Ramalayam Street, Zarugumalli' -> 'రామాలయం వీధి, జరుగమల్లి'
 */
export function translateAddress(address, language = 'te') {
  if (!address || language !== 'te') return address;
  if (typeof address !== 'string') return address;

  let text = address.trim();
  if (!text) return address;

  const lower = text.toLowerCase();
  for (const [enPhrase, tePhrase] of TELUGU_PHRASES) {
    if (lower === enPhrase) return tePhrase;
  }

  // 1. Replace multi-word sub-phrases
  let replaced = lower;
  for (const [enPhrase, tePhrase] of TELUGU_PHRASES) {
    if (replaced.includes(enPhrase)) {
      replaced = replaced.split(enPhrase).join(tePhrase);
    }
  }

  // 2. Replace any standalone dictionary words (e.g. zarugumalli, kandukur, ongole)
  for (const [word, teWord] of Object.entries(TELUGU_DICTIONARY)) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(replaced)) {
      replaced = replaced.replace(regex, teWord);
    }
  }

  return replaced;
}

/**
 * Translates status (Approved, Pending, Rejected, Success, etc.) into Telugu.
 */
export function translateStatus(status, language = 'te') {
  if (!status || language !== 'te') return status;
  if (typeof status !== 'string') return status;

  const lower = status.toLowerCase().trim();
  return TELUGU_DICTIONARY[lower] || status;
}

/**
 * Translates donation purpose into Telugu.
 */
export function translatePurpose(purpose, language = 'te') {
  if (!purpose || language !== 'te') return purpose;
  if (typeof purpose !== 'string') return purpose;

  const lower = purpose.toLowerCase().trim();
  for (const [enPhrase, tePhrase] of TELUGU_PHRASES) {
    if (lower === enPhrase) return tePhrase;
  }
  return TELUGU_DICTIONARY[lower] || purpose;
}

/**
 * General text translator. Checks phrases first, dictionary second,
 * then translates token-by-token.
 */
export function translateText(text, language = 'te') {
  if (!text || language !== 'te') return text;
  if (typeof text !== 'string') return text;

  const trimmed = text.trim();
  if (!trimmed) return text;

  // If already Telugu
  if (/[\u0C00-\u0C7F]/.test(trimmed)) return trimmed;

  const lower = trimmed.toLowerCase();

  // 1. Direct phrase match
  for (const [enPhrase, tePhrase] of TELUGU_PHRASES) {
    if (lower === enPhrase) return tePhrase;
  }

  // 2. Direct dictionary match
  if (TELUGU_DICTIONARY[lower]) return TELUGU_DICTIONARY[lower];

  // 3. Tokenize
  return translateName(trimmed, language);
}
