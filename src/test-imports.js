/**
 * test-imports.js
 * ملف اختبار للتحقق من صحة جميع الاستيرادات
 */

// اختبار IndexedDB
import { dbManager, STORES } from './database/IndexedDBManager';
import IndexedDBManager from './database/IndexedDBManager';

// اختبار MigrationService
import MigrationService from './database/MigrationService';
import { migrationService } from './database/MigrationService';

// اختبار AutoJournalEntry
import { autoJournalEntry, DEFAULT_ACCOUNTS } from './services/accounting/AutoJournalEntry';
import AutoJournalEntry from './services/accounting/AutoJournalEntry';

// اختبار Services
import { getSalesServiceInstance } from './services/sales/SalesService';
import { getPurchaseServiceInstance } from './services/purchases/PurchaseService';
import { getInventoryServiceInstance } from './services/inventory/InventoryService';
import { getTreasuryServiceInstance } from './services/treasury/TreasuryService';
import { getProductionServiceInstance } from './services/production/ProductionService';
import { getHRServiceInstance } from './services/hr/HRService';
import { getAccountingServiceInstance } from './services/accounting/AccountingService';
import { getFixedAssetsServiceInstance } from './services/fixedAssets/FixedAssetsService';
import { getReportsServiceInstance } from './services/reports/ReportsService';

// اختبار التصديرات من index.js
import {
  // Database
  dbManager as dbMgr,
  STORES as Stores,
  IndexedDBManager as IDBManager,
  MigrationService as MigService,
  migrationService as migService,
  
  // Accounting
  autoJournalEntry as autoJournal,
  DEFAULT_ACCOUNTS,
  AutoJournalEntry as AutoJournal,
  
  // Services
  SalesService,
  PurchaseService,
  InventoryService,
  TreasuryService,
  ProductionService,
  HRService,
  AccountingService,
  FixedAssetsService,
  ReportsService,
  
  getAllServices
} from './services';

console.log('✅ جميع الاستيرادات تعمل بشكل صحيح!');
console.log({
  dbManager: !!dbManager,
  STORES: !!STORES,
  autoJournalEntry: !!autoJournalEntry,
  DEFAULT_ACCOUNTS: !!DEFAULT_ACCOUNTS,
  services: {
    sales: !!getSalesServiceInstance(),
    purchases: !!getPurchaseServiceInstance(),
    inventory: !!getInventoryServiceInstance(),
    treasury: !!getTreasuryServiceInstance(),
    production: !!getProductionServiceInstance(),
    hr: !!getHRServiceInstance(),
    accounting: !!getAccountingServiceInstance(),
    fixedAssets: !!getFixedAssetsServiceInstance(),
    reports: !!getReportsServiceInstance(),
  }
});

export default {
  dbManager,
  autoJournalEntry,
  services: getAllServices()
};
