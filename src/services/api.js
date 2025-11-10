// ======================================
// API Service - API وهمية للخادم الأمامي
// Frontend خالص مع localStorage
// 
// هذا الملف يستخدم mockAPI.js للوظائف
// ======================================

// استيراد جميع الوظائف من mockAPI
import {
  authAPI,
  warehouseAPI,
  productAPI,
  supplierAPI,
  customerAPI,
  purchaseAPI,
  salesAPI,
  treasuryAPI,
  reportsAPI,
  userAPI,
  statsAPI
} from './mockAPI';

// تصدير جميع الـ APIs
export {
  authAPI,
  warehouseAPI,
  productAPI,
  supplierAPI,
  customerAPI,
  purchaseAPI,
  salesAPI,
  treasuryAPI,
  reportsAPI,
  userAPI,
  statsAPI
};

// تصدير كمرجع واحد للتوافق مع الكود الموجود
const api = {
  auth: authAPI,
  warehouse: warehouseAPI,
  product: productAPI,
  supplier: supplierAPI,
  customer: customerAPI,
  purchase: purchaseAPI,
  sales: salesAPI,
  treasury: treasuryAPI,
  reports: reportsAPI,
  user: userAPI,
  stats: statsAPI
};

export default api;