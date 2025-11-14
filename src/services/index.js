/**
 * services/index.js
 * ملف مركزي لتصدير جميع الخدمات
 */

// Database
export { dbManager, STORES } from '../database/IndexedDBManager';
export { default as IndexedDBManager } from '../database/IndexedDBManager';
export { default as MigrationService, migrationService } from '../database/MigrationService';

// Accounting
export { autoJournalEntry, DEFAULT_ACCOUNTS } from './accounting/AutoJournalEntry';
export { default as AutoJournalEntry } from './accounting/AutoJournalEntry';
export { 
  getAccountingServiceInstance,
  default as AccountingService 
} from './accounting/AccountingService';

// Sales
export { 
  getSalesServiceInstance,
  default as SalesService 
} from './sales/SalesService';

// Purchases
export { 
  getPurchaseServiceInstance,
  default as PurchaseService 
} from './purchases/PurchaseService';

// Inventory
export { 
  getInventoryServiceInstance,
  default as InventoryService 
} from './inventory/InventoryService';

// Treasury
export { 
  getTreasuryServiceInstance,
  default as TreasuryService 
} from './treasury/TreasuryService';

// Production
export { 
  getProductionServiceInstance,
  default as ProductionService 
} from './production/ProductionService';

// HR
export { 
  getHRServiceInstance,
  default as HRService 
} from './hr/HRService';

// Fixed Assets
export { 
  getFixedAssetsServiceInstance,
  default as FixedAssetsService 
} from './fixedAssets/FixedAssetsService';

// Reports
export { 
  getReportsServiceInstance,
  default as ReportsService 
} from './reports/ReportsService';

/**
 * دالة للحصول على جميع الخدمات دفعة واحدة
 */
export const getAllServices = () => ({
  sales: getSalesServiceInstance(),
  purchases: getPurchaseServiceInstance(),
  inventory: getInventoryServiceInstance(),
  treasury: getTreasuryServiceInstance(),
  production: getProductionServiceInstance(),
  hr: getHRServiceInstance(),
  accounting: getAccountingServiceInstance(),
  fixedAssets: getFixedAssetsServiceInstance(),
  reports: getReportsServiceInstance(),
});

/**
 * أمثلة الاستخدام:
 * 
 * // استيراد خدمة واحدة
 * import { getSalesServiceInstance } from './services';
 * const salesService = getSalesServiceInstance();
 * 
 * // استيراد جميع الخدمات
 * import { getAllServices } from './services';
 * const services = getAllServices();
 * 
 * // استيراد Classes مباشرة
 * import { SalesService } from './services';
 * const salesService = new SalesService();
 */
