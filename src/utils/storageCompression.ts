
// Dedicated file for storage compression utilities
export interface CompressedContact {
  i: string;     // id
  n: string;     // name  
  num: string;   // number
  s?: string;    // story
  t?: string[];  // tags
  d?: string;    // date_added
  sy?: boolean;  // synced
}

// Ultra-compact compression
export const compressContact = (contact: any): CompressedContact => {
  const compressed: CompressedContact = {
    i: contact.id || '',
    n: contact.name || '',
    num: contact.number || ''
  };
  
  // Only add optional fields if they have values
  if (contact.story?.trim()) compressed.s = contact.story.trim();
  if (contact.tags?.length) compressed.t = contact.tags;
  if (contact.date_added) compressed.d = contact.date_added;
  if (contact.synced !== undefined) compressed.sy = contact.synced;
  
  return compressed;
};

export const decompressContact = (compressed: CompressedContact): any => {
  return {
    id: compressed.i,
    name: compressed.n,
    number: compressed.num,
    story: compressed.s || '',
    tags: compressed.t || [],
    date_added: compressed.d || '',
    synced: compressed.sy || false
  };
};

// Calculate storage size more accurately
export const calculateStorageSize = (): { totalKB: number, breakdown: Record<string, number> } => {
  const breakdown: Record<string, number> = {};
  let total = 0;
  
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      const size = localStorage[key].length;
      total += size;
      
      if (key.startsWith('numberguard_')) {
        breakdown[key] = Math.round(size / 1024 * 100) / 100; // KB with 2 decimals
      }
    }
  }
  
  return {
    totalKB: Math.round(total / 1024 * 100) / 100,
    breakdown
  };
};

// Clear all app data
export const clearAllAppData = () => {
  const keysToRemove = [];
  for (let key in localStorage) {
    if (key.startsWith('numberguard_')) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  return keysToRemove.length;
};
