
export interface ExtractedContact {
  name?: string;
  number?: string;
  tags?: string[];
  story: string;
}

export const extractContactFromStory = async (story: string): Promise<ExtractedContact> => {
  // Simple pattern matching for phone numbers
  const phoneRegex = /(?:\+?88)?[01]?[3-9]\d{8,10}|\d{11}/g;
  const phoneMatches = story.match(phoneRegex);
  
  // Extract potential names (capitalized words, common Bengali names)
  const nameRegex = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g;
  const nameMatches = story.match(nameRegex);
  
  // Extract tags based on common keywords
  const tagKeywords = {
    'CNG': ['সিএনজি', 'cng', 'গাড়ি', 'ড্রাইভার'],
    'রিকশা': ['রিকশা', 'rickshaw'],
    'বন্ধু': ['বন্ধু', 'friend', 'বান্ধবী'],
    'পরিবার': ['মা', 'বাবা', 'ভাই', 'বোন', 'family'],
    'কাজ': ['কাজ', 'work', 'office', 'অফিস'],
    'দোকান': ['দোকান', 'shop', 'ব্যবসা'],
    'ডাক্তার': ['ডাক্তার', 'doctor'],
    'শিক্ষক': ['শিক্ষক', 'teacher', 'স্যার', 'ম্যাডাম']
  };
  
  const tags: string[] = [];
  const lowerStory = story.toLowerCase();
  
  Object.entries(tagKeywords).forEach(([tag, keywords]) => {
    if (keywords.some(keyword => lowerStory.includes(keyword.toLowerCase()))) {
      tags.push(tag);
    }
  });
  
  return {
    name: nameMatches?.[0] || '',
    number: phoneMatches?.[0] || '',
    tags: tags.length > 0 ? tags : [],
    story: story
  };
};
