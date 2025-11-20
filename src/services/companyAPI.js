// ======================================
// Company API Service - خدمة API للشركات
// متصل بلوحة التحكم الإدارية
// ======================================

const COMPANY_API_BASE_URL = process.env.REACT_APP_COMPANY_API_URL || 'http://localhost:5000/api/v1/companies';

// دالة مساعدة للطلبات
const request = async (endpoint, options = {}) => {
  const companyToken = localStorage.getItem('company_token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(companyToken && { 'Authorization': `Bearer ${companyToken}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${COMPANY_API_BASE_URL}${endpoint}`, config);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || 'حدث خطأ في الطلب',
        data: data
      };
    }

    return data;
  } catch (error) {
    console.error('خطأ في طلب API:', error);
    
    // معالجة أخطاء الشبكة
    if (error.message === 'Failed to fetch') {
      throw {
        status: 0,
        message: 'فشل الاتصال بالخادم. تحقق من الاتصال بالإنترنت.',
        isNetworkError: true
      };
    }
    
    throw error;
  }
};

// ==================== خدمات الشركات ====================

export const companyAPI = {
  /**
   * التحقق من معرف الشركة
   * @param {string} identifier - معرف الشركة
   * @returns {Promise} - بيانات الشركة الأساسية
   */
  verifyIdentifier: async (identifier) => {
    return await request('/verify', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    });
  },

  /**
   * تسجيل دخول الشركة
   * @param {string} identifier - معرف الشركة
   * @param {string} password - كلمة مرور الشركة
   * @returns {Promise} - بيانات الشركة كاملة + Token
   */
  login: async (identifier, password) => {
    return await request('/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
  },

  /**
   * جلب تفاصيل الشركة
   * @returns {Promise} - تفاصيل الشركة الحالية
   */
  getCompanyDetails: async () => {
    return await request('/details', {
      method: 'GET',
    });
  },

  /**
   * جلب معلومات الاشتراك
   * @returns {Promise} - معلومات الاشتراك والخطة
   */
  getSubscription: async () => {
    return await request('/subscription', {
      method: 'GET',
    });
  },

  /**
   * جلب إعدادات الشركة (لوجو، ألوان، ثيم)
   * @returns {Promise} - إعدادات الشركة
   */
  getCompanyConfig: async () => {
    return await request('/config', {
      method: 'GET',
    });
  },

  /**
   * تحديث إعدادات الشركة
   * @param {Object} settings - الإعدادات الجديدة
   * @returns {Promise}
   */
  updateCompanyConfig: async (settings) => {
    return await request('/config', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  /**
   * تجديد Token
   * @param {string} refreshToken - Refresh Token
   * @returns {Promise} - Token جديد
   */
  refreshToken: async (refreshToken) => {
    return await request('/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  /**
   * تسجيل خروج الشركة
   * @returns {Promise}
   */
  logout: async () => {
    return await request('/logout', {
      method: 'POST',
    });
  },

  /**
   * التحقق من صلاحية Token
   * @returns {Promise<boolean>}
   */
  validateToken: async () => {
    try {
      await request('/validate', {
        method: 'GET',
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * جلب حدود الاشتراك الحالية
   * @returns {Promise} - الاستخدام الحالي والحدود المتاحة
   */
  getUsageLimits: async () => {
    return await request('/usage', {
      method: 'GET',
    });
  },

  /**
   * فحص صحة الاشتراك
   * @returns {Promise} - حالة الاشتراك
   */
  checkSubscriptionStatus: async () => {
    return await request('/subscription/status', {
      method: 'GET',
    });
  },
};

export default companyAPI;
