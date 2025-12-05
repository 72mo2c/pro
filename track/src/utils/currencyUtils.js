// ======================================
// Currency Utilities - دوال العملة
// ======================================

/**
 * قائمة العملات مع رموزها الكاملة والرموز المختصرة
 */
export const CURRENCIES = {
  // عملات عربية
  'EGP': { name: 'جنيه مصري', symbol: 'ج.م', locale: 'ar-EG' },
  'IQD': { name: 'دينار عراقي', symbol: 'د.ع', locale: 'ar-IQ' },
  'SAR': { name: 'ريال سعودي', symbol: 'ر.س', locale: 'ar-SA' },
  'AED': { name: 'درهم إماراتي', symbol: 'د.إ', locale: 'ar-AE' },
  'JOD': { name: 'دينار أردني', symbol: 'د.أ', locale: 'ar-JO' },
  'LBP': { name: 'ليرة لبنانية', symbol: 'ل.ل', locale: 'ar-LB' },
  'KWD': { name: 'دينار كويتي', symbol: 'د.ك', locale: 'ar-KW' },
  'BHD': { name: 'دينار بحريني', symbol: 'د.ب', locale: 'ar-BH' },
  'QAR': { name: 'ريال قطري', symbol: 'ر.ق', locale: 'ar-QA' },
  
  // عملات دولية
  'USD': { name: 'دولار أمريكي', symbol: '$', locale: 'en-US' },
  'EUR': { name: 'يورو', symbol: '€', locale: 'de-DE' },
  'GBP': { name: 'جنيه إسترليني', symbol: '£', locale: 'en-GB' },
  'JPY': { name: 'ين ياباني', symbol: '¥', locale: 'ja-JP' },
  'CNY': { name: 'يوان صيني', symbol: '¥', locale: 'zh-CN' },
  'CHF': { name: 'فرنك سويسري', symbol: 'CHF', locale: 'de-CH' },
  'CAD': { name: 'دولار كندي', symbol: 'C$', locale: 'en-CA' },
  'AUD': { name: 'دولار أسترالي', symbol: 'A$', locale: 'en-AU' },
  'SEK': { name: 'كرونة سويدية', symbol: 'kr', locale: 'sv-SE' },
  'NOK': { name: 'كرونة نرويجية', symbol: 'kr', locale: 'nb-NO' },
  'DKK': { name: 'كرونة دنماركية', symbol: 'kr', locale: 'da-DK' },
  'PLN': { name: 'زلوتي بولندي', symbol: 'zł', locale: 'pl-PL' },
  'CZK': { name: 'كرونة تشيكية', symbol: 'Kč', locale: 'cs-CZ' },
  'HUF': { name: 'فورنت مجري', symbol: 'Ft', locale: 'hu-HU' },
  'RUB': { name: 'روبل روسي', symbol: '₽', locale: 'ru-RU' },
  'INR': { name: 'روبية هندية', symbol: '₹', locale: 'hi-IN' },
  'KRW': { name: 'وون كوري جنوبي', symbol: '₩', locale: 'ko-KR' },
  'TWD': { name: 'دولار تايواني', symbol: 'NT$', locale: 'zh-TW' },
  'SGD': { name: 'دولار سنغافوري', symbol: 'S$', locale: 'en-SG' },
  'HKD': { name: 'دولار هونغ كونغ', symbol: 'HK$', locale: 'zh-HK' },
  'MXN': { name: 'بيزو مكسيكي', symbol: '$', locale: 'es-MX' },
  'BRL': { name: 'ريال برازيلي', symbol: 'R$', locale: 'pt-BR' },
  'ZAR': { name: 'راند جنوب أفريقي', symbol: 'R', locale: 'af-ZA' }
};

/**
 * الحصول على معلومات العملة بناءً على كود العملة
 * @param {string} currencyCode - كود العملة (EGP, USD, etc.)
 * @returns {Object} - معلومات العملة
 */
export const getCurrencyInfo = (currencyCode = 'EGP') => {
  return CURRENCIES[currencyCode] || CURRENCIES['EGP'];
};

/**
 * تنسيق الرقم مع العملة
 * @param {number} amount - المبلغ
 * @param {string} currencyCode - كود العملة
 * @param {boolean} showSymbol - إظهار رمز العملة
 * @param {number} decimals - عدد الخانات العشرية
 * @returns {string} - المبلغ المنسق مع العملة
 */
export const formatCurrency = (amount = 0, currencyCode = 'EGP', showSymbol = true, decimals = 2) => {
  const numericAmount = Number(amount) || 0;
  const currency = getCurrencyInfo(currencyCode);
  
  // تنسيق الرقم
  const formattedNumber = numericAmount.toLocaleString('ar-EG', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  
  if (!showSymbol) {
    return formattedNumber;
  }
  
  // إضافة رمز العملة
  return `${formattedNumber} ${currency.symbol}`;
};

/**
 * تنسيق العملة مع التفاصيل الكاملة
 * @param {number} amount - المبلغ
 * @param {string} currencyCode - كود العملة
 * @param {boolean} showName - إظهار اسم العملة
 * @returns {string} - المبلغ مع تفاصيل العملة
 */
export const formatCurrencyWithDetails = (amount = 0, currencyCode = 'EGP', showName = false) => {
  const formatted = formatCurrency(amount, currencyCode, true);
  
  if (showName) {
    const currency = getCurrencyInfo(currencyCode);
    return `${formatted} (${currency.name})`;
  }
  
  return formatted;
};

/**
 * الحصول على قائمة العملات المتاحة
 * @returns {Array} - قائمة العملات
 */
export const getAvailableCurrencies = () => {
  return Object.entries(CURRENCIES).map(([code, info]) => ({
    value: code,
    label: `${info.name} (${info.symbol})`
  }));
};

/**
 * تنسيق العملة للاستخدام في الإدخال (فقط الرقم)
 * @param {number} amount - المبلغ
 * @param {string} currencyCode - كود العملة
 * @returns {string} - المبلغ منسقاً كرقم
 */
export const formatCurrencyForInput = (amount = 0, currencyCode = 'EGP') => {
  const numericAmount = Number(amount) || 0;
  
  return numericAmount.toLocaleString('ar-EG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};

/**
 * تحويل النص إلى رقم من تنسيق العملة
 * @param {string} currencyString - النص المنسق مع العملة
 * @returns {number} - الرقم المستخرج
 */
export const parseCurrencyFromString = (currencyString) => {
  if (!currencyString) return 0;
  
  // إزالة جميع الرموز والأحرف غير الرقمية ما عدا النقطة
  const cleanString = currencyString.replace(/[^\d.-]/g, '');
  const parsedNumber = parseFloat(cleanString);
  
  return isNaN(parsedNumber) ? 0 : parsedNumber;
};