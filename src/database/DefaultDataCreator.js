/**
 * إنشاء البيانات الافتراضية للنظام
 * Default Data Creation for System Initialization
 */

class DefaultDataCreator {
  constructor() {
    this.db = null;
  }

  async init(db) {
    this.db = db;
    await this.createDefaultWarehouses();
    await this.createDefaultCategories();
    await this.createDefaultAccounts();
  }

  // إنشاء المخازن الافتراضية
  async createDefaultWarehouses() {
    try {
      const existingWarehouses = await this.db.getAll('warehouses');
      if (existingWarehouses.length > 0) {
        console.log('📦 تم العثور على مخازن موجودة، تخطي الإنشاء');
        return;
      }

      const defaultWarehouses = [
        {
          id: 'WH-1',
          name: 'المخزن الرئيسي',
          location: 'المقر الرئيسي',
          manager: '',
          capacity: '',
          description: 'المخزن الرئيسي للمؤسسة',
          type: 'main',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'WH-2',
          name: 'مستودع البرادات',
          location: 'المقر الرئيسي',
          manager: '',
          capacity: '',
          description: 'مستودع المنتجات المبردة',
          type: 'cold_storage',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      for (const warehouse of defaultWarehouses) {
        await this.db.add('warehouses', warehouse);
      }

      console.log('✅ تم إنشاء المخازن الافتراضية بنجاح');
    } catch (error) {
      console.error('❌ خطأ في إنشاء المخازن الافتراضية:', error);
    }
  }

  // إنشاء الفئات الافتراضية
  async createDefaultCategories() {
    try {
      const existingCategories = await this.db.getAll('categories');
      if (existingCategories.length > 0) {
        console.log('🏷️ تم العثور على فئات موجودة، تخطي الإنشاء');
        return;
      }

      const defaultCategories = [
        {
          id: 'CAT-1',
          name: 'مواد غذائية',
          description: 'المواد الغذائية والمواد القابلة للأكل',
          color: '#22c55e',
          parent_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'CAT-2',
          name: 'مشروبات',
          description: 'المشروبات والعصائر',
          color: '#3b82f6',
          parent_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'CAT-3',
          name: 'منتجات تنظيف',
          description: 'مواد التنظيف ومنتجات النظافة',
          color: '#f59e0b',
          parent_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'CAT-4',
          name: 'أدوات مطبخ',
          description: 'أدوات ومواد المطبخ',
          color: '#ef4444',
          parent_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      for (const category of defaultCategories) {
        await this.db.add('categories', category);
      }

      console.log('✅ تم إنشاء الفئات الافتراضية بنجاح');
    } catch (error) {
      console.error('❌ خطأ في إنشاء الفئات الافتراضية:', error);
    }
  }

  // إنشاء الحسابات المحاسبية الافتراضية
  async createDefaultAccounts() {
    try {
      const existingAccounts = await this.db.getAll('accounts');
      if (existingAccounts.length > 0) {
        console.log('💰 تم العثور على حسابات موجودة، تخطي الإنشاء');
        return;
      }

      const defaultAccounts = [
        // الأصول
        { id: 'ACC-1', code: '1000', name: 'الأصول المتداولة', type: 'asset', parent_id: null, is_parent: true, created_at: new Date().toISOString() },
        { id: 'ACC-2', code: '1100', name: 'النقدية', type: 'asset', parent_id: 'ACC-1', is_parent: false, created_at: new Date().toISOString() },
        { id: 'ACC-3', code: '1200', name: 'العملاء', type: 'asset', parent_id: 'ACC-1', is_parent: false, created_at: new Date().toISOString() },
        { id: 'ACC-4', code: '1300', name: 'المخزون', type: 'asset', parent_id: 'ACC-1', is_parent: false, created_at: new Date().toISOString() },
        
        // الخصوم
        { id: 'ACC-5', code: '2000', name: 'الخصوم المتداولة', type: 'liability', parent_id: null, is_parent: true, created_at: new Date().toISOString() },
        { id: 'ACC-6', code: '2100', name: 'الموردين', type: 'liability', parent_id: 'ACC-5', is_parent: false, created_at: new Date().toISOString() },
        
        // حقوق الملكية
        { id: 'ACC-7', code: '3000', name: 'رأس المال', type: 'equity', parent_id: null, is_parent: false, created_at: new Date().toISOString() },
        
        // الإيرادات
        { id: 'ACC-8', code: '4000', name: 'إيرادات المبيعات', type: 'revenue', parent_id: null, is_parent: true, created_at: new Date().toISOString() },
        { id: 'ACC-9', code: '4100', name: 'إيرادات المبيعات', type: 'revenue', parent_id: 'ACC-8', is_parent: false, created_at: new Date().toISOString() },
        
        // المصروفات
        { id: 'ACC-10', code: '5000', name: 'المصروفات التشغيلية', type: 'expense', parent_id: null, is_parent: true, created_at: new Date().toISOString() },
        { id: 'ACC-11', code: '5100', name: 'تكلفة البضاعة المباعة', type: 'expense', parent_id: 'ACC-10', is_parent: false, created_at: new Date().toISOString() },
        { id: 'ACC-12', code: '5200', name: 'مصروفات التشغيل', type: 'expense', parent_id: 'ACC-10', is_parent: false, created_at: new Date().toISOString() }
      ];

      for (const account of defaultAccounts) {
        await this.db.add('accounts', account);
      }

      console.log('✅ تم إنشاء الحسابات المحاسبية الافتراضية بنجاح');
    } catch (error) {
      console.error('❌ خطأ في إنشاء الحسابات المحاسبية الافتراضية:', error);
    }
  }
}

export default DefaultDataCreator;