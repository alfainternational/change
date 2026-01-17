/**
 * Slugify utility for creating URL-friendly slugs
 * Supports Arabic text transliteration
 */

// Arabic to Latin transliteration map
const arabicToLatin = {
  'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'a',
  'ب': 'b',
  'ت': 't', 'ث': 'th',
  'ج': 'j',
  'ح': 'h', 'خ': 'kh',
  'د': 'd', 'ذ': 'dh',
  'ر': 'r', 'ز': 'z',
  'س': 's', 'ش': 'sh',
  'ص': 's', 'ض': 'd',
  'ط': 't', 'ظ': 'z',
  'ع': 'a', 'غ': 'gh',
  'ف': 'f',
  'ق': 'q',
  'ك': 'k',
  'ل': 'l',
  'م': 'm',
  'ن': 'n',
  'ه': 'h',
  'و': 'w',
  'ي': 'y', 'ى': 'a',
  'ة': 'h',
  'ء': 'a',
  'ئ': 'e', 'ؤ': 'o',
  'ـ': '',
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
};

/**
 * Transliterate Arabic text to Latin
 * @param {string} text - Arabic text
 * @returns {string} - Transliterated text
 */
function transliterateArabic(text) {
  return text.split('').map(char => arabicToLatin[char] || char).join('');
}

/**
 * Create URL-friendly slug from text
 * @param {string} text - Input text
 * @param {Object} options - Options object
 * @returns {string} - Slug
 */
function slugify(text, options = {}) {
  const {
    separator = '-',
    lowercase = true,
    transliterate = true,
    maxLength = 200
  } = options;

  if (!text) return '';

  let slug = text.toString();

  // Transliterate Arabic if enabled
  if (transliterate) {
    slug = transliterateArabic(slug);
  }

  // Convert to lowercase if enabled
  if (lowercase) {
    slug = slug.toLowerCase();
  }

  // Remove accents/diacritics
  slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Replace spaces and special characters with separator
  slug = slug
    .replace(/\s+/g, separator)           // Replace spaces with separator
    .replace(/[^\w\-]+/g, '')             // Remove all non-word chars
    .replace(/\-\-+/g, separator)         // Replace multiple separators with single separator
    .replace(/^-+/, '')                   // Trim separator from start
    .replace(/-+$/, '');                  // Trim separator from end

  // Limit length
  if (maxLength && slug.length > maxLength) {
    slug = slug.substring(0, maxLength).replace(/-[^-]*$/, ''); // Cut at last separator
  }

  return slug;
}

/**
 * Create unique slug by checking database
 * @param {string} text - Input text
 * @param {Function} checkExistence - Function to check if slug exists
 * @param {Object} options - Options object
 * @returns {Promise<string>} - Unique slug
 */
async function createUniqueSlug(text, checkExistence, options = {}) {
  let slug = slugify(text, options);
  let counter = 1;
  let uniqueSlug = slug;

  while (await checkExistence(uniqueSlug)) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}

/**
 * Generate random slug
 * @param {number} length - Length of random part
 * @returns {string} - Random slug
 */
function generateRandomSlug(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

/**
 * Add timestamp to slug
 * @param {string} slug - Base slug
 * @returns {string} - Slug with timestamp
 */
function addTimestamp(slug) {
  const timestamp = Date.now().toString(36);
  return `${slug}-${timestamp}`;
}

/**
 * Validate slug format
 * @param {string} slug - Slug to validate
 * @returns {boolean} - Whether slug is valid
 */
function isValidSlug(slug) {
  // Allow lowercase letters, numbers, and hyphens
  // Must start and end with alphanumeric character
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * Extract slug from URL
 * @param {string} url - URL string
 * @returns {string} - Extracted slug
 */
function extractSlugFromUrl(url) {
  const parts = url.split('/');
  return parts[parts.length - 1].split('?')[0];
}

module.exports = {
  slugify,
  createUniqueSlug,
  generateRandomSlug,
  addTimestamp,
  isValidSlug,
  extractSlugFromUrl,
  transliterateArabic
};
