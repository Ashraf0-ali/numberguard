
// Comprehensive Banglish to Bangla conversion mapping
const banglishToBanglaMap: Record<string, string> = {
  // Numbers
  'ek': 'এক', '1': '১', 'ak': 'এক',
  'dui': 'দুই', '2': '২', 'du': 'দুই',
  'tin': 'তিন', '3': '৩', 'teen': 'তিন',
  'char': 'চার', '4': '৪', 'chaar': 'চার',
  'panch': 'পাঁচ', '5': '৫', 'pach': 'পাঁচ',
  'choy': 'ছয়', '6': '৬', 'choi': 'ছয়',
  'saat': 'সাত', '7': '৭', 'sat': 'সাত',
  'aat': 'আট', '8': '৮', 'at': 'আট',
  'noy': 'নয়', '9': '৯', 'noi': 'নয়',
  'dosh': 'দশ', '10': '১০', 'dos': 'দশ',
  
  // Common places
  'mirpur': 'মিরপুর', 'dhanmondi': 'ধানমন্ডি', 'gulshan': 'গুলশান',
  'uttara': 'উত্তরা', 'bashundhara': 'বসুন্ধরা', 'mohakhali': 'মহাখালী',
  'tejgaon': 'তেজগাঁও', 'panthapath': 'পান্থপথ', 'farmgate': 'ফার্মগেট',
  'newmarket': 'নিউমার্কেট', 'ramna': 'রমনা', 'banani': 'বনানী',
  'badda': 'বাড্ডা', 'rampura': 'রামপুরা', 'motijheel': 'মতিঝিল',
  'paltan': 'পল্টন', 'sadarghat': 'সদরঘাট', 'old dhaka': 'পুরান ঢাকা',
  'shantinagar': 'শান্তিনগর', 'malibagh': 'মালিবাগ', 'khilgaon': 'খিলগাঁও',
  'wari': 'ওয়ারী', 'lalbagh': 'লালবাগ', 'azimpur': 'আজিমপুর',
  
  // Common words
  'dekha': 'দেখা', 'hoiche': 'হয়েছে', 'hoychilo': 'হয়েছিল', 'hoyse': 'হয়েছে',
  'korse': 'করেছে', 'korchilo': 'করেছিল', 'ache': 'আছে', 'chilo': 'ছিল',
  'jaibo': 'যাবো', 'jabe': 'যাবে', 'giyechilo': 'গিয়েছিল', 'gese': 'গেছে',
  'ashe': 'আসে', 'asche': 'আসছে', 'ashchilo': 'আসছিল', 'esechilo': 'এসেছিল',
  'bole': 'বলে', 'bolchilo': 'বলেছিল', 'bolse': 'বলেছে', 'bolche': 'বলছে',
  'khabe': 'খাবে', 'kheyse': 'খেয়েছে', 'khachilo': 'খাচ্ছিল', 'khaiche': 'খাইছে',
  'pore': 'পরে', 'age': 'আগে', 'ekhon': 'এখন', 'tokhon': 'তখন',
  'kothay': 'কোথায়', 'kemon': 'কেমন', 'keno': 'কেন', 'ki': 'কি',
  'tumi': 'তুমি', 'ami': 'আমি', 'se': 'সে', 'tara': 'তারা', 'amra': 'আমরা',
  'office': 'অফিস', 'basha': 'বাসা', 'bari': 'বাড়ি', 'school': 'স্কুল',
  'college': 'কলেজ', 'university': 'বিশ্ববিদ্যালয়', 'market': 'বাজার',
  'hospital': 'হাসপাতাল', 'bank': 'ব্যাংক', 'restaurant': 'রেস্তোরাঁ',
  'friend': 'বন্ধু', 'bondhu': 'বন্ধু', 'family': 'পরিবার', 'poribar': 'পরিবার',
  'office e': 'অফিসে', 'bashay': 'বাসায়', 'barite': 'বাড়িতে', 'schoole': 'স্কুলে',
  'take': 'নিতে', 'nite': 'নিতে', 'dite': 'দিতে', 'korte': 'করতে',
  'khete': 'খেতে', 'jete': 'যেতে', 'ashte': 'আসতে', 'dekhte': 'দেখতে',
  'phone': 'ফোন', 'call': 'কল', 'message': 'মেসেজ', 'text': 'টেক্সট',
  'work': 'কাজ', 'kaj': 'কাজ', 'chakri': 'চাকরি', 'business': 'ব্যবসা',
  'poisha': 'পয়সা', 'taka': 'টাকা', 'money': 'টাকা', 'dam': 'দাম',
  'time': 'সময়', 'shomoy': 'সময়', 'din': 'দিন', 'rat': 'রাত',
  'shokal': 'সকাল', 'bikal': 'বিকাল', 'shondhya': 'সন্ধ্যা', 'dupure': 'দুপুরে',
  'khub': 'খুব', 'bhalo': 'ভাল', 'kharap': 'খারাপ', 'shundor': 'সুন্দর',
  'problem': 'সমস্যা', 'shomoshya': 'সমস্যা', 'help': 'সাহায্য', 'shahajjo': 'সাহায্য',
  'please': 'প্লিজ', 'sorry': 'সরি', 'thanks': 'ধন্যবাদ', 'dhonnobad': 'ধন্যবাদ',
  'mama': 'মামা', 'chacha': 'চাচা', 'khala': 'খালা', 'fupu': 'ফুপু',
  'nana': 'নানা', 'nani': 'নানী', 'dada': 'দাদা', 'dadi': 'দাদী',
  'bhai': 'ভাই', 'apu': 'আপু', 'bon': 'বোন', 'mama bhai': 'মামা ভাই',
  'khala moni': 'খালা মনি', 'chacha mia': 'চাচা মিয়া', 'fupu amma': 'ফুপু আম্মা',
  'amma': 'আম্মা', 'abbu': 'আব্বু', 'ma': 'মা', 'baba': 'বাবা',
  'khala': 'খালা', 'nana bhai': 'নানা ভাই', 'nani ma': 'নানী মা',
  'dada bhai': 'দাদা ভাই', 'dadi ma': 'দাদী মা', 'mama ji': 'মামা জি',
  'chacha ji': 'চাচা জি', 'khala ji': 'খালা জি', 'fupu ji': 'ফুপু জি',
  'vai': 'ভাই', 'apa': 'আপা', 'apni': 'আপনি', 'apnara': 'আপনারা',
  'shobai': 'সবাই', 'keu': 'কেউ', 'kono': 'কোনো', 'kichu': 'কিছু',
  'shobi': 'সবই', 'shob': 'সব', 'onek': 'অনেক', 'ektu': 'একটু',
  'boro': 'বড়', 'choto': 'ছোট', 'lomba': 'লম্বা', 'khato': 'খাটো',
  'motka': 'মোটকা', 'chikon': 'চিকন', 'ghono': 'ঘন', 'patla': 'পাতলা',
  'gach': 'গাছ', 'pani': 'পানি', 'batash': 'বাতাস', 'alo': 'আলো',
  'andhokar': 'অন্ধকার', 'roddur': 'রোদ্দুর', 'brishti': 'বৃষ্টি', 'megh': 'মেঘ',
  'akash': 'আকাশ', 'mati': 'মাটি', 'pata': 'পাতা', 'ful': 'ফুল'
};

// Create reverse mapping (Bangla to Banglish)
const banglaToBanglishMap: Record<string, string> = {};
Object.entries(banglishToBanglaMap).forEach(([banglish, bangla]) => {
  banglaToBanglishMap[bangla] = banglish;
});

export const convertBanglishToBangla = (text: string): string => {
  let convertedText = text;
  
  // Sort keys by length (longest first) to handle longer phrases first
  const sortedKeys = Object.keys(banglishToBanglaMap).sort((a, b) => b.length - a.length);
  
  sortedKeys.forEach(banglish => {
    const bangla = banglishToBanglaMap[banglish];
    // Use word boundaries to avoid partial matches
    const regex = new RegExp(`\\b${banglish}\\b`, 'gi');
    convertedText = convertedText.replace(regex, bangla);
  });
  
  return convertedText;
};

export const convertBanglaToBanglish = (text: string): string => {
  let convertedText = text;
  
  // Sort keys by length (longest first) to handle longer phrases first
  const sortedKeys = Object.keys(banglaToBanglishMap).sort((a, b) => b.length - a.length);
  
  sortedKeys.forEach(bangla => {
    const banglish = banglaToBanglishMap[bangla];
    // Use word boundaries to avoid partial matches
    const regex = new RegExp(`\\b${bangla}\\b`, 'gi');
    convertedText = convertedText.replace(regex, banglish);
  });
  
  return convertedText;
};

// Enhanced search function that searches in both original and converted text
export const searchWithBanglishSupport = (text: string, searchTerm: string): boolean => {
  if (!searchTerm.trim()) return true;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  const lowerText = text.toLowerCase();
  
  // Direct match
  if (lowerText.includes(lowerSearchTerm)) {
    return true;
  }
  
  // Convert search term to Bangla and search
  const searchTermInBangla = convertBanglishToBangla(searchTerm);
  if (text.includes(searchTermInBangla)) {
    return true;
  }
  
  // Convert text to Banglish and search
  const textInBanglish = convertBanglaToBanglish(text).toLowerCase();
  if (textInBanglish.includes(lowerSearchTerm)) {
    return true;
  }
  
  // Convert search term to Banglish and search in original text
  const searchTermInBanglish = convertBanglaToBanglish(searchTerm).toLowerCase();
  if (lowerText.includes(searchTermInBanglish)) {
    return true;
  }
  
  return false;
};
