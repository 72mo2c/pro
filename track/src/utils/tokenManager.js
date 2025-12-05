// ======================================
// Token Manager - إدارة Company Tokens
// ======================================

const TOKEN_KEY = 'company_token';
const REFRESH_TOKEN_KEY = 'company_refresh_token';
const TOKEN_EXPIRY_KEY = 'company_token_expiry';

/**
 * حفظ Token
 */
export const saveToken = (accessToken, refreshToken, expiresIn) => {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  
  // حساب وقت انتهاء الصلاحية
  const expiryTime = Date.now() + (expiresIn * 1000);
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
};

/**
 * جلب Access Token
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * جلب Refresh Token
 */
export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * حذف جميع Tokens
 */
export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
};

/**
 * التحقق من صلاحية Token
 */
export const isTokenValid = () => {
  const token = getToken();
  const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
  
  if (!token || !expiryTime) {
    return false;
  }
  
  // التحقق من انتهاء الصلاحية (مع هامش 5 دقائق)
  const now = Date.now();
  const expiry = parseInt(expiryTime);
  const bufferTime = 5 * 60 * 1000; // 5 دقائق
  
  return now < (expiry - bufferTime);
};

/**
 * الحصول على الوقت المتبقي (بالثواني)
 */
export const getTimeRemaining = () => {
  const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
  
  if (!expiryTime) {
    return 0;
  }
  
  const now = Date.now();
  const expiry = parseInt(expiryTime);
  const remaining = Math.max(0, expiry - now);
  
  return Math.floor(remaining / 1000);
};

/**
 * هل يحتاج Token للتجديد؟
 */
export const needsRefresh = () => {
  const token = getToken();
  const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
  
  if (!token || !expiryTime) {
    return false;
  }
  
  const now = Date.now();
  const expiry = parseInt(expiryTime);
  
  // تجديد إذا تبقى أقل من 10 دقائق
  const refreshThreshold = 10 * 60 * 1000;
  
  return (expiry - now) < refreshThreshold;
};

/**
 * فك تشفير JWT (بدون مكتبات)
 */
export const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('فشل فك تشفير Token:', error);
    return null;
  }
};

/**
 * الحصول على معلومات الشركة من Token
 */
export const getCompanyFromToken = () => {
  const token = getToken();
  
  if (!token) {
    return null;
  }
  
  const decoded = decodeToken(token);
  
  return decoded ? {
    companyId: decoded.companyId,
    identifier: decoded.identifier,
    name: decoded.name,
  } : null;
};

export default {
  saveToken,
  getToken,
  getRefreshToken,
  clearTokens,
  isTokenValid,
  getTimeRemaining,
  needsRefresh,
  decodeToken,
  getCompanyFromToken,
};
