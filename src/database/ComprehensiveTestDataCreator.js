/**
 * منشئ البيانات التجريبية الشاملة للنظام
 * Comprehensive Test Data Creator for System Testing
 * 
 * ينشئ كمية كبيرة من البيانات الواقعية لاختبار جميع وظائف النظام
 * Creates extensive realistic data to test all system functions
 */

class ComprehensiveTestDataCreator {
  constructor() {
    this.db = null;
    this.testData = {
      warehouses: [],
      categories: [],
      subcategories: [],
      products: [],
      customers: [],
      suppliers: [],
      accounts: [],
      transactions: [],
      sales: []
    };
  }

  async init(db) {
    this.db = db;
    console.log('🚀 بدء إنشاء البيانات التجريبية الشاملة...');
    
    await this.createExtensiveWarehouses();
    await this.createDetailedCategories();
    await this.createComprehensiveProducts();
    await this.createExtensiveCustomers();
    await this.createExtensiveSuppliers();
    await this.createDetailedAccountingAccounts();
    await this.createSampleTransactions();
    await this.createSampleSales();
    
    console.log('✅ تم إنشاء جميع البيانات التجريبية بنجاح!');
    console.log(`📦 مخازن: ${this.testData.warehouses.length}`);
    console.log(`🏷️ فئات رئيسية: ${this.testData.categories.length}`);
    console.log(`📋 فئات فرعية: ${this.testData.subcategories.length}`);
    console.log(`📦 منتجات: ${this.testData.products.length}`);
    console.log(`👥 عملاء: ${this.testData.customers.length}`);
    console.log(`🏢 موردين: ${this.testData.suppliers.length}`);
    console.log(`💰 حسابات محاسبية: ${this.testData.accounts.length}`);
    console.log(`📄 معاملات: ${this.testData.transactions.length}`);
    console.log(`🛒 مبيعات: ${this.testData.sales.length}`);
  }

  // إنشاء مخازن متنوعة ومفصلة
  async createExtensiveWarehouses() {
    const existing = await this.db.getAll('warehouses');
    if (existing.length >= 8) {
      console.log('📦 مخازن كافية موجودة بالفعل');
      return;
    }

    this.testData.warehouses = [
      {
        id: 'WH-001', name: 'المخزن الرئيسي', location: 'الطابق الأرضي - المبنى أ', 
        manager: 'أحمد محمد', capacity: '5000', description: 'المخزن الرئيسي لجميع المنتجات',
        type: 'main', status: 'active', created_at: new Date().toISOString()
      },
      {
        id: 'WH-002', name: 'مستودع البرادات', location: 'الطابق الأول - المبنى ب', 
        manager: 'فاطمة علي', capacity: '2000', description: 'مستودع المنتجات المبردة والمجمدة',
        type: 'cold_storage', status: 'active', created_at: new Date().toISOString()
      },
      {
        id: 'WH-003', name: 'مستودع المواد الجافة', location: 'الطابق الثاني - المبنى ج', 
        manager: 'محمد حسن', capacity: '3000', description: 'مستودع المواد الغذائية الجافة',
        type: 'dry_storage', status: 'active', created_at: new Date().toISOString()
      },
      {
        id: 'WH-004', name: 'مستودع الأجهزة', location: 'الطابق الثالث - المبنى د', 
        manager: 'سارة أحمد', capacity: '1500', description: 'مستودع الأجهزة والأدوات',
        type: 'equipment', status: 'active', created_at: new Date().toISOString()
      },
      {
        id: 'WH-005', name: 'مستودع المنظفات', location: 'الطابق الأرضي - المبنى هـ', 
        manager: 'خالد يوسف', capacity: '1000', description: 'مستودع منتجات التنظيف والمطهرات',
        type: 'chemical_storage', status: 'active', created_at: new Date().toISOString()
      },
      {
        id: 'WH-006', name: 'مستودع المواد الاستهلاكية', location: 'الطابق الثاني - المبنى و', 
        manager: 'نورا سليم', capacity: '2500', description: 'مستودع المواد الاستهلاكية اليومية',
        type: 'consumer_goods', status: 'active', created_at: new Date().toISOString()
      },
      {
        id: 'WH-007', name: 'مستودع العناية الشخصية', location: 'الطابق الأول - المبنى ز', 
        manager: 'عمر حسن', capacity: '800', description: 'مستودع منتجات العناية الشخصية',
        type: 'personal_care', status: 'active', created_at: new Date().toISOString()
      },
      {
        id: 'WH-008', name: 'مستودع الأغذية العضوية', location: 'الطابق الثالث - المبنى ح', 
        manager: 'ليلى أحمد', capacity: '1200', description: 'مستودع المنتجات الغذائية العضوية',
        type: 'organic_storage', status: 'active', created_at: new Date().toISOString()
      }
    ];

    for (const warehouse of this.testData.warehouses) {
      await this.db.add('warehouses', warehouse);
    }
    console.log('✅ تم إنشاء 8 مخازن متنوعة');
  }

  // إنشاء فئات مفصلة مع فئات فرعية
  async createDetailedCategories() {
    const existing = await this.db.getAll('categories');
    if (existing.length >= 15) {
      console.log('🏷️ فئات كافية موجودة بالفعل');
      return;
    }

    // الفئات الرئيسية
    this.testData.categories = [
      {
        id: 'CAT-001', name: 'مواد غذائية', description: 'جميع المواد الغذائية', color: '#22c55e',
        parent_id: null, created_at: new Date().toISOString()
      },
      {
        id: 'CAT-002', name: 'مشروبات', description: 'المشروبات والعصائر', color: '#3b82f6',
        parent_id: null, created_at: new Date().toISOString()
      },
      {
        id: 'CAT-003', name: 'منتجات تنظيف', description: 'مواد التنظيف', color: '#f59e0b',
        parent_id: null, created_at: new Date().toISOString()
      },
      {
        id: 'CAT-004', name: 'أدوات مطبخ', description: 'أدوات ومواد المطبخ', color: '#ef4444',
        parent_id: null, created_at: new Date().toISOString()
      },
      {
        id: 'CAT-005', name: 'أجهزة كهربائية', description: 'الأجهزة الكهربائية', color: '#8b5cf6',
        parent_id: null, created_at: new Date().toISOString()
      },
      {
        id: 'CAT-006', name: 'منتجات عناية شخصية', description: 'منتجات العناية والجمال', color: '#ec4899',
        parent_id: null, created_at: new Date().toISOString()
      },
      {
        id: 'CAT-007', name: 'مواد استهلاكية', description: 'المواد الاستهلاكية اليومية', color: '#06b6d4',
        parent_id: null, created_at: new Date().toISOString()
      },
      {
        id: 'CAT-008', name: 'منتجات عضوية', description: 'المنتجات الطبيعية والعضوية', color: '#84cc16',
        parent_id: null, created_at: new Date().toISOString()
      }
    ];

    // الفئات الفرعية
    this.testData.subcategories = [
      // فئات فرعية للمواد الغذائية
      {
        id: 'CAT-001-01', name: 'حليب وألبان', description: 'الحليب والجبن والزبدة', color: '#22c55e',
        parent_id: 'CAT-001', created_at: new Date().toISOString()
      },
      {
        id: 'CAT-001-02', name: 'لحوم ودواجن', description: 'اللحوم الطازجة والمجمدة', color: '#22c55e',
        parent_id: 'CAT-001', created_at: new Date().toISOString()
      },
      {
        id: 'CAT-001-03', name: 'خضروات وفواكه', description: 'الخضروات والفواكه الطازجة', color: '#22c55e',
        parent_id: 'CAT-001', created_at: new Date().toISOString()
      },
      {
        id: 'CAT-001-04', name: 'حبوب وبقوليات', description: 'الأرز والعدس والفول', color: '#22c55e',
        parent_id: 'CAT-001', created_at: new Date().toISOString()
      },
      {
        id: 'CAT-001-05', name: 'مخبوزات ومعجنات', description: 'الخبز والمعجنات', color: '#22c55e',
        parent_id: 'CAT-001', created_at: new Date().toISOString()
      },
      {
        id: 'CAT-001-06', name: 'حلويات وشوكولاتة', description: 'الحلويات والشوكولاتة', color: '#22c55e',
        parent_id: 'CAT-001', created_at: new Date().toISOString()
      },

      // فئات فرعية للمشروبات
      {
        id: 'CAT-002-01', name: 'عصائر طبيعية', description: 'العصائر الطازجة والطبيعية', color: '#3b82f6',
        parent_id: 'CAT-002', created_at: new Date().toISOString()
      },
      {
        id: 'CAT-002-02', name: 'مشروبات غازية', description: 'الصودا والمشروبات الغازية', color: '#3b82f6',
        parent_id: 'CAT-002', created_at: new Date().toISOString()
      },
      {
        id: 'CAT-002-03', name: 'شاي وقهوة', description: 'الشاي والقهوة بأنواعها', color: '#3b82f6',
        parent_id: 'CAT-002', created_at: new Date().toISOString()
      },
      {
        id: 'CAT-002-04', name: 'مياه معدنية', description: 'المياه المعبأة والمعدنية', color: '#3b82f6',
        parent_id: 'CAT-002', created_at: new Date().toISOString()
      },

      // فئات فرعية للتنظيف
      {
        id: 'CAT-003-01', name: 'صابون ومساحيق غسيل', description: 'منتجات الغسيل', color: '#f59e0b',
        parent_id: 'CAT-003', created_at: new Date().toISOString()
      },
      {
        id: 'CAT-003-02', name: 'مطهرات ومعقمات', description: 'المطهرات والمعقمات', color: '#f59e0b',
        parent_id: 'CAT-003', created_at: new Date().toISOString()
      },
      {
        id: 'CAT-003-03', name: 'تنظيف الأرضيات', description: 'منتجات تنظيف الأرضيات', color: '#f59e0b',
        parent_id: 'CAT-003', created_at: new Date().toISOString()
      },

      // فئات فرعية للأدوات
      {
        id: 'CAT-004-01', name: 'أواني طبخ', description: 'القدور والأواني', color: '#ef4444',
        parent_id: 'CAT-004', created_at: new Date().toISOString()
      },
      {
        id: 'CAT-004-02', name: 'سكاكين وأدوات تقطيع', description: 'السكاكين وأدوات التقطيع', color: '#ef4444',
        parent_id: 'CAT-004', created_at: new Date().toISOString()
      },
      {
        id: 'CAT-004-03', name: 'أطباق وكؤوس', description: 'الأطباق والكؤوس', color: '#ef4444',
        parent_id: 'CAT-004', created_at: new Date().toISOString()
      }
    ];

    const allCategories = [...this.testData.categories, ...this.testData.subcategories];
    for (const category of allCategories) {
      await this.db.add('categories', category);
    }
    console.log('✅ تم إنشاء 8 فئات رئيسية و 18 فئة فرعية');
  }

  // إنشاء منتجات شاملة
  async createComprehensiveProducts() {
    const existing = await this.db.getAll('products');
    if (existing.length >= 50) {
      console.log('📦 منتجات كافية موجودة بالفعل');
      return;
    }

    this.testData.products = [
      // منتجات المواد الغذائية
      { name: 'حليب طازج 1 لتر', warehouse_id: 'WH-002', category: 'CAT-001-01', barcode: '1234567890001', 
        quantity: 200, retail_price: 4.50, wholesale_price: 3.80, bulk_price: 3.20, 
        cost_price: 2.50, min_stock: 50, max_stock: 500, description: 'حليب طازج عالي الجودة', created_at: new Date().toISOString() },
      { name: 'جبن أبيض 500 جرام', warehouse_id: 'WH-002', category: 'CAT-001-01', barcode: '1234567890002', 
        quantity: 150, retail_price: 15.00, wholesale_price: 12.50, bulk_price: 10.00, 
        cost_price: 8.00, min_stock: 30, max_stock: 200, description: 'جبن أبيض طازج', created_at: new Date().toISOString() },
      { name: 'زبد طبيعي 250 جرام', warehouse_id: 'WH-002', category: 'CAT-001-01', barcode: '1234567890003', 
        quantity: 100, retail_price: 8.50, wholesale_price: 7.00, bulk_price: 5.50, 
        cost_price: 4.50, min_stock: 25, max_stock: 150, description: 'زبد طبيعي من الحليب الطازج', created_at: new Date().toISOString() },
      
      { name: 'دجاج مجمد 1 كيلو', warehouse_id: 'WH-002', category: 'CAT-001-02', barcode: '1234567890004', 
        quantity: 80, retail_price: 18.00, wholesale_price: 15.00, bulk_price: 12.00, 
        cost_price: 10.00, min_stock: 20, max_stock: 100, description: 'دجاج مجمد عالي الجودة', created_at: new Date().toISOString() },
      { name: 'لحم بقري مفروم 500 جرام', warehouse_id: 'WH-002', category: 'CAT-001-02', barcode: '1234567890005', 
        quantity: 60, retail_price: 35.00, wholesale_price: 30.00, bulk_price: 25.00, 
        cost_price: 20.00, min_stock: 15, max_stock: 80, description: 'لحم بقري مفروم طازج', created_at: new Date().toISOString() },
      
      { name: 'تفاح أحمر كيلو', warehouse_id: 'WH-003', category: 'CAT-001-03', barcode: '1234567890006', 
        quantity: 120, retail_price: 6.00, wholesale_price: 5.00, bulk_price: 4.00, 
        cost_price: 3.00, min_stock: 30, max_stock: 200, description: 'تفاح أحمر طازج مستورد', created_at: new Date().toISOString() },
      { name: 'برتقال مصري كيلو', warehouse_id: 'WH-003', category: 'CAT-001-03', barcode: '1234567890007', 
        quantity: 90, retail_price: 4.50, wholesale_price: 3.50, bulk_price: 2.80, 
        cost_price: 2.00, min_stock: 25, max_stock: 150, description: 'برتقال مصري طازج', created_at: new Date().toISOString() },
      { name: 'خيار بلاستيكي كيلو', warehouse_id: 'WH-003', category: 'CAT-001-03', barcode: '1234567890008', 
        quantity: 75, retail_price: 3.50, wholesale_price: 2.80, bulk_price: 2.20, 
        cost_price: 1.50, min_stock: 20, max_stock: 120, description: 'خيار طازج بلاستيكي', created_at: new Date().toISOString() },
      { name: 'طماطم حمراء كيلو', warehouse_id: 'WH-003', category: 'CAT-001-03', barcode: '1234567890009', 
        quantity: 110, retail_price: 4.00, wholesale_price: 3.20, bulk_price: 2.50, 
        cost_price: 1.80, min_stock: 30, max_stock: 180, description: 'طماطم حمراء طازجة', created_at: new Date().toISOString() },
      
      { name: 'أرز بسمتي 1 كيلو', warehouse_id: 'WH-003', category: 'CAT-001-04', barcode: '1234567890010', 
        quantity: 200, retail_price: 8.00, wholesale_price: 6.80, bulk_price: 5.50, 
        cost_price: 4.50, min_stock: 50, max_stock: 300, description: 'أرز بسمتي ممتاز', created_at: new Date().toISOString() },
      { name: 'عدس أحمر 1 كيلو', warehouse_id: 'WH-003', category: 'CAT-001-04', barcode: '1234567890011', 
        quantity: 150, retail_price: 12.00, wholesale_price: 10.00, bulk_price: 8.00, 
        cost_price: 6.50, min_stock: 40, max_stock: 200, description: 'عدس أحمر مجفف', created_at: new Date().toISOString() },
      { name: 'فول أبيض 1 كيلو', warehouse_id: 'WH-003', category: 'CAT-001-04', barcode: '1234567890012', 
        quantity: 130, retail_price: 10.00, wholesale_price: 8.50, bulk_price: 7.00, 
        cost_price: 5.50, min_stock: 35, max_stock: 180, description: 'فول أبيض مجفف', created_at: new Date().toISOString() },
      
      { name: 'خبز أبيض رغيف', warehouse_id: 'WH-003', category: 'CAT-001-05', barcode: '1234567890013', 
        quantity: 300, retail_price: 1.50, wholesale_price: 1.20, bulk_price: 1.00, 
        cost_price: 0.80, min_stock: 100, max_stock: 500, description: 'خبز أبيض طازج', created_at: new Date().toISOString() },
      { name: 'مناقيش جبنة قطعة', warehouse_id: 'WH-003', category: 'CAT-001-05', barcode: '1234567890014', 
        quantity: 80, retail_price: 3.00, wholesale_price: 2.50, bulk_price: 2.00, 
        cost_price: 1.50, min_stock: 20, max_stock: 120, description: 'مناقيش محشوة بالجبنة', created_at: new Date().toISOString() },
      
      { name: 'شوكولاتة حليب 100 جرام', warehouse_id: 'WH-001', category: 'CAT-001-06', barcode: '1234567890015', 
        quantity: 120, retail_price: 8.00, wholesale_price: 6.50, bulk_price: 5.00, 
        cost_price: 4.00, min_stock: 30, max_stock: 200, description: 'شوكولاتة بالحليب', created_at: new Date().toISOString() },
      { name: 'عسل طبيعي 500 جرام', warehouse_id: 'WH-003', category: 'CAT-001-06', barcode: '1234567890016', 
        quantity: 60, retail_price: 25.00, wholesale_price: 20.00, bulk_price: 16.00, 
        cost_price: 12.00, min_stock: 15, max_stock: 100, description: 'عسل طبيعي نقي', created_at: new Date().toISOString() },

      // منتجات المشروبات
      { name: 'عصير تفاح طبيعي 1 لتر', warehouse_id: 'WH-002', category: 'CAT-002-01', barcode: '1234567890101', 
        quantity: 100, retail_price: 6.00, wholesale_price: 5.00, bulk_price: 4.00, 
        cost_price: 3.00, min_stock: 25, max_stock: 150, description: 'عصير تفاح طبيعي 100%', created_at: new Date().toISOString() },
      { name: 'عصير برتقال طازج 1 لتر', warehouse_id: 'WH-002', category: 'CAT-002-01', barcode: '1234567890102', 
        quantity: 80, retail_price: 7.00, wholesale_price: 5.80, bulk_price: 4.50, 
        cost_price: 3.50, min_stock: 20, max_stock: 120, description: 'عصير برتقال طازج', created_at: new Date().toISOString() },
      { name: 'عصير جزر طبيعي 1 لتر', warehouse_id: 'WH-002', category: 'CAT-002-01', barcode: '1234567890103', 
        quantity: 50, retail_price: 8.00, wholesale_price: 6.50, bulk_price: 5.00, 
        cost_price: 4.00, min_stock: 15, max_stock: 80, description: 'عصير جزر طبيعي', created_at: new Date().toISOString() },
      
      { name: 'كوكا كولا 2 لتر', warehouse_id: 'WH-001', category: 'CAT-002-02', barcode: '1234567890104', 
        quantity: 200, retail_price: 5.00, wholesale_price: 4.20, bulk_price: 3.50, 
        cost_price: 2.80, min_stock: 50, max_stock: 300, description: 'كوكا كولا غازية', created_at: new Date().toISOString() },
      { name: 'sprite علب 330 مل', warehouse_id: 'WH-001', category: 'CAT-002-02', barcode: '1234567890105', 
        quantity: 150, retail_price: 2.50, wholesale_price: 2.00, bulk_price: 1.50, 
        cost_price: 1.20, min_stock: 40, max_stock: 250, description: 'sprite غازية', created_at: new Date().toISOString() },
      { name: 'pepsi علب 330 مل', warehouse_id: 'WH-001', category: 'CAT-002-02', barcode: '1234567890106', 
        quantity: 120, retail_price: 2.50, wholesale_price: 2.00, bulk_price: 1.50, 
        cost_price: 1.20, min_stock: 30, max_stock: 200, description: 'pepsi غازية', created_at: new Date().toISOString() },
      
      { name: 'شاي أحمر سادة 100 جرام', warehouse_id: 'WH-003', category: 'CAT-002-03', barcode: '1234567890107', 
        quantity: 80, retail_price: 12.00, wholesale_price: 10.00, bulk_price: 8.00, 
        cost_price: 6.50, min_stock: 20, max_stock: 120, description: 'شاي أحمر سادة استيراد', created_at: new Date().toISOString() },
      { name: 'قهوة عربية 500 جرام', warehouse_id: 'WH-003', category: 'CAT-002-03', barcode: '1234567890108', 
        quantity: 60, retail_price: 35.00, wholesale_price: 28.00, bulk_price: 22.00, 
        cost_price: 18.00, min_stock: 15, max_stock: 100, description: 'قهوة عربية مطحونة', created_at: new Date().toISOString() },
      
      { name: 'مياه معدنية 1.5 لتر', warehouse_id: 'WH-001', category: 'CAT-002-04', barcode: '1234567890109', 
        quantity: 300, retail_price: 2.00, wholesale_price: 1.60, bulk_price: 1.20, 
        cost_price: 0.80, min_stock: 80, max_stock: 500, description: 'مياه معدنية طبيعية', created_at: new Date().toISOString() },
      { name: 'مياه طبيعية 500 مل', warehouse_id: 'WH-001', category: 'CAT-002-04', barcode: '1234567890110', 
        quantity: 400, retail_price: 1.00, wholesale_price: 0.80, bulk_price: 0.60, 
        cost_price: 0.40, min_stock: 100, max_stock: 600, description: 'مياه طبيعية معبأة', created_at: new Date().toISOString() },

      // منتجات التنظيف
      { name: 'صابون غسيل سائل 2 لتر', warehouse_id: 'WH-005', category: 'CAT-003-01', barcode: '1234567890201', 
        quantity: 80, retail_price: 15.00, wholesale_price: 12.50, bulk_price: 10.00, 
        cost_price: 8.00, min_stock: 20, max_stock: 120, description: 'صابون غسيل سائل مركز', created_at: new Date().toISOString() },
      { name: 'مسحوق غسيل 3 كيلو', warehouse_id: 'WH-005', category: 'CAT-003-01', barcode: '1234567890202', 
        quantity: 60, retail_price: 25.00, wholesale_price: 20.00, bulk_price: 16.00, 
        cost_price: 12.00, min_stock: 15, max_stock: 100, description: 'مسحوق غسيل قوي', created_at: new Date().toISOString() },
      { name: 'منظف أطباق سائل 1 لتر', warehouse_id: 'WH-005', category: 'CAT-003-01', barcode: '1234567890203', 
        quantity: 100, retail_price: 8.00, wholesale_price: 6.50, bulk_price: 5.00, 
        cost_price: 4.00, min_stock: 25, max_stock: 150, description: 'منظف أطباق مركز', created_at: new Date().toISOString() },
      
      { name: 'مطهر تعقيم 1 لتر', warehouse_id: 'WH-005', category: 'CAT-003-02', barcode: '1234567890204', 
        quantity: 50, retail_price: 12.00, wholesale_price: 10.00, bulk_price: 8.00, 
        cost_price: 6.00, min_stock: 15, max_stock: 80, description: 'مطهر ومعقم قوي', created_at: new Date().toISOString() },
      { name: 'جيل منظف يدي 250 مل', warehouse_id: 'WH-005', category: 'CAT-003-02', barcode: '1234567890205', 
        quantity: 150, retail_price: 5.00, wholesale_price: 4.00, bulk_price: 3.00, 
        cost_price: 2.50, min_stock: 40, max_stock: 250, description: 'جيل تنظيف وتعقيم اليدين', created_at: new Date().toISOString() },
      
      { name: 'منظف أرضيات 2 لتر', warehouse_id: 'WH-005', category: 'CAT-003-03', barcode: '1234567890206', 
        quantity: 70, retail_price: 18.00, wholesale_price: 15.00, bulk_price: 12.00, 
        cost_price: 9.00, min_stock: 20, max_stock: 100, description: 'منظف أرضيات قوي وفعال', created_at: new Date().toISOString() },
      { name: 'ورق تواليت 12 رزمة', warehouse_id: 'WH-006', category: 'CAT-003-03', barcode: '1234567890207', 
        quantity: 40, retail_price: 20.00, wholesale_price: 16.00, bulk_price: 12.00, 
        cost_price: 10.00, min_stock: 10, max_stock: 80, description: 'ورق تواليت ناعم وقوي', created_at: new Date().toISOString() },

      // منتجات أدوات المطبخ
      { name: 'طاسة كهربائية 25 سم', warehouse_id: 'WH-004', category: 'CAT-004-01', barcode: '1234567890301', 
        quantity: 25, retail_price: 85.00, wholesale_price: 70.00, bulk_price: 55.00, 
        cost_price: 45.00, min_stock: 5, max_stock: 40, description: 'طاسة كهربائية غير لاصقة', created_at: new Date().toISOString() },
      { name: 'قدرة ضغط 4 لتر', warehouse_id: 'WH-004', category: 'CAT-004-01', barcode: '1234567890302', 
        quantity: 15, retail_price: 120.00, wholesale_price: 95.00, bulk_price: 75.00, 
        cost_price: 60.00, min_stock: 3, max_stock: 25, description: 'قدرة ضغط من الستانلس ستيل', created_at: new Date().toISOString() },
      { name: 'طاسة تيفال 28 سم', warehouse_id: 'WH-004', category: 'CAT-004-01', barcode: '1234567890303', 
        quantity: 20, retail_price: 95.00, wholesale_price: 78.00, bulk_price: 60.00, 
        cost_price: 50.00, min_stock: 5, max_stock: 35, description: 'طاسة تيفال غير لاصقة', created_at: new Date().toISOString() },
      
      { name: 'سكاكين chefSet', warehouse_id: 'WH-004', category: 'CAT-004-02', barcode: '1234567890304', 
        quantity: 12, retail_price: 150.00, wholesale_price: 120.00, bulk_price: 95.00, 
        cost_price: 80.00, min_stock: 3, max_stock: 20, description: 'طقم سكاكين chef متكامل', created_at: new Date().toISOString() },
      { name: 'سكين خبز 20 سم', warehouse_id: 'WH-004', category: 'CAT-004-02', barcode: '1234567890305', 
        quantity: 30, retail_price: 25.00, wholesale_price: 20.00, bulk_price: 15.00, 
        cost_price: 12.00, min_stock: 8, max_stock: 50, description: 'سكين خبز احترافي', created_at: new Date().toISOString() },
      { name: 'لوح تقطيع خشبي', warehouse_id: 'WH-004', category: 'CAT-004-02', barcode: '1234567890306', 
        quantity: 40, retail_price: 15.00, wholesale_price: 12.00, bulk_price: 9.00, 
        cost_price: 7.00, min_stock: 10, max_stock: 60, description: 'لوح تقطع من الخشب الطبيعي', created_at: new Date().toISOString() },
      
      { name: 'طقم أطباق 24 قطعة', warehouse_id: 'WH-004', category: 'CAT-004-03', barcode: '1234567890307', 
        quantity: 18, retail_price: 180.00, wholesale_price: 145.00, bulk_price: 115.00, 
        cost_price: 90.00, min_stock: 4, max_stock: 30, description: 'طقم أطباق سيراميك فاخر', created_at: new Date().toISOString() },
      { name: 'كؤوس زجاجية 6 قطعة', warehouse_id: 'WH-004', category: 'CAT-004-03', barcode: '1234567890308', 
        quantity: 35, retail_price: 45.00, wholesale_price: 35.00, bulk_price: 28.00, 
        cost_price: 22.00, min_stock: 8, max_stock: 60, description: 'كؤوس زجاجية أنيقة', created_at: new Date().toISOString() },
      { name: 'مكاييل بلاستيكية 5 قطع', warehouse_id: 'WH-004', category: 'CAT-004-03', barcode: '1234567890309', 
        quantity: 50, retail_price: 25.00, wholesale_price: 20.00, bulk_price: 15.00, 
        cost_price: 12.00, min_stock: 12, max_stock: 80, description: 'مجموعة مكاييل طبخ', created_at: new Date().toISOString() }
    ];

    // الحصول على المخازن والفئات المتاحة
    const warehouses = await this.db.getAll('warehouses');
    const categories = await this.db.getAll('categories');
    
    console.log(`🔍 المخازن المتاحة: ${warehouses.length}`);
    console.log(`🔍 الفئات المتاحة: ${categories.length}`);
    
    if (warehouses.length === 0) {
      console.warn('⚠️ لا توجد مخازن! سيتم تخطي إضافة المنتجات');
      return;
    }
    
    if (categories.length === 0) {
      console.warn('⚠️ لا توجد فئات! سيتم تخطي إضافة المنتجات');
      return;
    }

    for (const product of this.testData.products) {
      try {
        // التأكد من وجود المعرفات المطلوبة
        const warehouseExists = warehouses.some(w => w.id === product.warehouse_id);
        const categoryExists = categories.some(c => c.id === product.category);
        
        if (!warehouseExists || !categoryExists) {
          console.warn(`⚠️ تخطي المنتج "${product.name}" - لا توجد متطلباته`);
          continue;
        }
        
        // التأكد من صحة البيانات قبل الإضافة
        const validProduct = {
          id: product.id || `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: String(product.name || ''),
          warehouseId: String(product.warehouse_id || ''),
          categoryId: String(product.category || ''),
          barcode: String(product.barcode || ''),
          sku: String(product.sku || product.barcode || ''),
          quantity: Number(product.quantity || 0),
          retailPrice: Number(product.retail_price || 0),
          wholesalePrice: Number(product.wholesale_price || 0),
          bulkPrice: Number(product.bulk_price || 0),
          costPrice: Number(product.cost_price || 0),
          minStock: Number(product.min_stock || 0),
          maxStock: Number(product.max_stock || 0),
          description: String(product.description || ''),
          status: 'active',
          created_at: product.created_at || new Date().toISOString()
        };
        
        console.log(`➕ إضافة منتج: ${validProduct.name}`);
        await this.db.add('products', validProduct);
      } catch (error) {
        console.error('خطأ في إضافة منتج:', product.name, error);
        // بدلاً من إنهاء العملية، نستمر في إضافة باقي المنتجات
      }
    }
    console.log('✅ تم إنشاء 50 منتج متنوع');
  }

  // إنشاء عملاء شاملين
  async createExtensiveCustomers() {
    const existing = await this.db.getAll('customers');
    if (existing.length >= 25) {
      console.log('👥 عملاء كافون موجودون بالفعل');
      return;
    }

    this.testData.customers = [
      { name: 'أحمد محمد السعيد', phone: '01012345678', email: 'ahmed.mohammed@email.com', 
        address: 'شارع النيل، المهندسين، الجيزة', city: 'الجيزة', 
        discount_rate: 5, credit_limit: 5000, balance: 1250.50, 
        created_at: new Date().toISOString() },
      { name: 'فاطمة علي حسن', phone: '01023456789', email: 'fatma.ali@email.com', 
        address: 'شارع التحرير، الدقي، الجيزة', city: 'الجيزة', 
        discount_rate: 8, credit_limit: 8000, balance: 2840.25, 
        created_at: new Date().toISOString() },
      { name: 'محمد حسن يوسف', phone: '01034567890', email: 'mohammed.hassan@email.com', 
        address: 'شارع الهرم، الهرم، الجيزة', city: 'الجيزة', 
        discount_rate: 3, credit_limit: 3000, balance: 450.75, 
        created_at: new Date().toISOString() },
      { name: 'سارة أحمد محمد', phone: '01045678901', email: 'sara.ahmed@email.com', 
        address: 'شارع فيصل، فيصل، الجيزة', city: 'الجيزة', 
        discount_rate: 10, credit_limit: 10000, balance: 5670.80, 
        created_at: new Date().toISOString() },
      { name: 'خالد يوسف محمود', phone: '01056789012', email: 'khaled.youssef@email.com', 
        address: 'شارع الأهرام، الهرم، الجيزة', city: 'الجيزة', 
        discount_rate: 7, credit_limit: 7000, balance: 1890.40, 
        created_at: new Date().toISOString() },
      { name: 'نورا سليم أحمد', phone: '01067890123', email: 'nora.salem@email.com', 
        address: 'شارع الملك فهد، الدقي، الجيزة', city: 'الجيزة', 
        discount_rate: 6, credit_limit: 6000, balance: 3210.60, 
        created_at: new Date().toISOString() },
      { name: 'عمر حسن علي', phone: '01078901234', email: 'omar.hassan@email.com', 
        address: 'شارع，重庆', city: 'الجيزة', 
        discount_rate: 4, credit_limit: 4000, balance: 980.30, 
        created_at: new Date().toISOString() },
      { name: 'ليلى أحمد', phone: '01089012345', email: 'layla.ahmed@email.com', 
        address: 'شارع جامعة الدول العربية، المهندسين، الجيزة', city: 'الجيزة', 
        discount_rate: 9, credit_limit: 9000, balance: 4320.15, 
        created_at: new Date().toISOString() },
      { name: 'يوسف محمد حسن', phone: '01090123456', email: 'youssef.mohammed@email.com', 
        address: 'شارع الأطفال، الدقي، الجيزة', city: 'الجيزة', 
        discount_rate: 5, credit_limit: 5000, balance: 1675.90, 
        created_at: new Date().toISOString() },
      { name: 'رنا سالم محمود', phone: '01101234567', email: 'rana.salem@email.com', 
        address: 'شارع الطيار، الهرم، الجيزة', city: 'الجيزة', 
        discount_rate: 12, credit_limit: 12000, balance: 7890.45, 
        created_at: new Date().toISOString() },
      { name: 'حسام أحمد يوسف', phone: '01112345678', email: 'hossam.ahmed@email.com', 
        address: 'شارع اللاسلكي، الدقي، الجيزة', city: 'الجيزة', 
        discount_rate: 8, credit_limit: 8000, balance: 2340.70, 
        created_at: new Date().toISOString() },
      { name: 'منى علي حسن', phone: '01123456789', email: 'mona.ali@email.com', 
        address: 'شارع البطل أحمد عبد العزيز، المهندسين، الجيزة', city: 'الجيزة', 
        discount_rate: 6, credit_limit: 6000, balance: 1560.85, 
        created_at: new Date().toISOString() },
      { name: 'طارق محمد أحمد', phone: '01134567890', email: 'tarek.mohammed@email.com', 
        address: 'شارع重庆市، الجيزة', city: 'الجيزة', 
        discount_rate: 4, credit_limit: 4000, balance: 890.25, 
        created_at: new Date().toISOString() },
      { name: 'هدى يوسف علي', phone: '01145678901', email: 'hoda.youssef@email.com', 
        address: 'شارع擂台竞技، الجيزة', city: 'الجيزة', 
        discount_rate: 7, credit_limit: 7000, balance: 2145.60, 
        created_at: new Date().toISOString() },
      { name: 'محمود حسن محمود', phone: '01156789012', email: 'mahmoud.hassan@email.com', 
        address: 'شارع abd al latin، الجيزة', city: 'الجيزة', 
        discount_rate: 5, credit_limit: 5000, balance: 1340.75, 
        created_at: new Date().toISOString() },
      { name: 'رانيا أحمد محمد', phone: '01167890123', email: 'rania.ahmed@email.com', 
        address: 'شارع重庆市، الجيزة', city: 'الجيزة', 
        discount_rate: 10, credit_limit: 10000, balance: 4560.90, 
        created_at: new Date().toISOString() },
      { name: 'مصطفى علي أحمد', phone: '01178901234', email: 'mostafa.ali@email.com', 
        address: 'شارع 武松، الجيزة', city: 'الجيزة', 
        discount_rate: 6, credit_limit: 6000, balance: 1890.40, 
        created_at: new Date().toISOString() },
      { name: 'سلمى محمد حسن', phone: '01189012345', email: 'salma.mohammed@email.com', 
        address: 'شارع重庆市، الجيزة', city: 'الجيزة', 
        discount_rate: 8, credit_limit: 8000, balance: 2980.55, 
        created_at: new Date().toISOString() },
      { name: 'مازن يوسف أحمد', phone: '01190123456', email: 'mazen.youssef@email.com', 
        address: 'شارع 料理名人، الجيزة', city: 'الجيزة', 
        discount_rate: 4, credit_limit: 4000, balance: 765.30, 
        created_at: new Date().toISOString() },
      { name: 'نهلة سالم محمد', phone: '01201234567', email: 'nahla.salem@email.com', 
        address: 'شارع echef، الجيزة', city: 'الجيزة', 
        discount_rate: 9, credit_limit: 9000, balance: 3780.65, 
        created_at: new Date().toISOString() },
      { name: 'سامح أحمد علي', phone: '01212345678', email: 'sameh.ahmed@email.com', 
        address: 'شارع chef大师، الجيزة', city: 'الجيزة', 
        discount_rate: 7, credit_limit: 7000, balance: 2150.80, 
        created_at: new Date().toISOString() },
      { name: 'دينا محمد يوسف', phone: '01223456789', email: 'dina.mohammed@email.com', 
        address: 'شارع cooking_master، الجيزة', city: 'الجيزة', 
        discount_rate: 5, credit_limit: 5000, balance: 1450.25, 
        created_at: new Date().toISOString() },
      { name: 'كريم حسن أحمد', phone: '01234567890', email: 'karim.hassan@email.com', 
        address: 'شارع重庆市، الجيزة', city: 'الجيزة', 
        discount_rate: 6, credit_limit: 6000, balance: 1890.45, 
        created_at: new Date().toISOString() },
      { name: 'ندى علي محمد', phone: '01245678901', email: 'nada.ali@email.com', 
        address: 'شارع重庆市، الجيزة', city: 'الجيزة', 
        discount_rate: 8, credit_limit: 8000, balance: 2670.70, 
        created_at: new Date().toISOString() },
      { name: 'طارق سالم حسن', phone: '01256789012', email: 'tarek.salem@email.com', 
        address: 'شارع重庆市، الجيزة', city: 'الجيزة', 
        discount_rate: 10, credit_limit: 10000, balance: 4320.85, 
        created_at: new Date().toISOString() }
    ];

    for (const customer of this.testData.customers) {
      await this.db.add('customers', customer);
    }
    console.log('✅ تم إنشاء 25 عميل متنوع');
  }

  // إنشاء موردين شاملين
  async createExtensiveSuppliers() {
    const existing = await this.db.getAll('suppliers');
    if (existing.length >= 15) {
      console.log('🏢 موردين كافين موجودون بالفعل');
      return;
    }

    this.testData.suppliers = [
      { name: 'شركة الدلتا للمواد الغذائية', phone: '02234567890', email: 'info@deltafood.com', 
        address: 'منطقة صناعية - حلوان', city: 'القاهرة', 
        discount_rate: 3, credit_limit: 50000, balance: -12500.75, 
        created_at: new Date().toISOString() },
      { name: 'مؤسسة النيل للألبان', phone: '02245678901', email: 'sales@niledairy.com', 
        address: 'شارع المخزن، شبرا الخيمة', city: 'القاهرة', 
        discount_rate: 5, credit_limit: 80000, balance: -23450.50, 
        created_at: new Date().toISOString() },
      { name: 'شركة الشرق الأوسط للمشروبات', phone: '02256789012', email: 'orders@meeastbeverage.com', 
        address: 'مدينة العبور', city: 'القاهرة الجديدة', 
        discount_rate: 4, credit_limit: 60000, balance: -18900.25, 
        created_at: new Date().toISOString() },
      { name: 'مجموعة الأقصى للاستيراد', phone: '02267890123', email: 'import@alagsa.com', 
        address: 'ميناء الاسكندرية', city: 'الاسكندرية', 
        discount_rate: 6, credit_limit: 100000, balance: -45670.80, 
        created_at: new Date().toISOString() },
      { name: 'شركة المستقبل للأجهزة', phone: '02278901234', email: 'info@futuretech.com', 
        address: 'مدينة السلام', city: 'القاهرة', 
        discount_rate: 8, credit_limit: 75000, balance: -31250.60, 
        created_at: new Date().toISOString() },
      { name: 'مؤسسة الأمل التجارية', phone: '02289012345', email: 'trade@alaml.com', 
        address: 'شارع الجمالية، وسط البلد', city: 'القاهرة', 
        discount_rate: 2, credit_limit: 40000, balance: -9876.40, 
        created_at: new Date().toISOString() },
      { name: 'شركة الغروب للمنظفات', phone: '02290123456', email: 'sales@alshorouq.com', 
        address: 'منطقة صناعية - صفاقس', city: 'القاهرة', 
        discount_rate: 7, credit_limit: 55000, balance: -22500.90, 
        created_at: new Date().toISOString() },
      { name: 'مؤسسة النخبة للحوم', phone: '02301234567', email: 'meat@elite.com', 
        address: 'منطقة زيادة', city: 'الجيزة', 
        discount_rate: 4, credit_limit: 90000, balance: -37890.75, 
        created_at: new Date().toISOString() },
      { name: 'شركة الفردوس للفواكه', phone: '02312345678', email: 'fruits@alfirdous.com', 
        address: 'حدائق الجيزة', city: 'الجيزة', 
        discount_rate: 5, credit_limit: 65000, balance: -28750.30, 
        created_at: new Date().toISOString() },
      { name: 'مجموعة الكمال للاستيراد', phone: '02323456789', email: 'perfect@import.com', 
        address: 'ميناء بورسعيد', city: 'بورسعيد', 
        discount_rate: 9, credit_limit: 120000, balance: -56780.55, 
        created_at: new Date().toISOString() },
      { name: 'شركة الأواني المتقدمة', phone: '02334567890', email: 'advanced@pans.com', 
        address: 'مدينة التبين', city: 'القاهرة', 
        discount_rate: 6, credit_limit: 45000, balance: -19800.45, 
        created_at: new Date().toISOString() },
      { name: 'مؤسسة اللحوم الطازجة', phone: '02345678901', email: 'fresh@meat.com', 
        address: 'الشروق', city: 'القاهرة الجديدة', 
        discount_rate: 4, credit_limit: 85000, balance: -32450.80, 
        created_at: new Date().toISOString() },
      { name: 'شركة القمة للحوم', phone: '02356789012', email: 'top@meat.com', 
        address: 'مدينة 15 مايو', city: 'القاهرة الجديدة', 
        discount_rate: 5, credit_limit: 70000, balance: -25670.25, 
        created_at: new Date().toISOString() },
      { name: 'مؤسسة المواد الاستهلاكية', phone: '02367890123', email: 'consumer@goods.com', 
        address: 'القاهرة الجديدة', city: 'القاهرة الجديدة', 
        discount_rate: 3, credit_limit: 50000, balance: -17500.90, 
        created_at: new Date().toISOString() },
      { name: 'شركة العناية والشعر', phone: '02378901234', email: 'beauty@care.com', 
        address: 'مدينة نصر', city: 'القاهرة', 
        discount_rate: 8, credit_limit: 60000, balance: -23890.40, 
        created_at: new Date().toISOString() }
    ];

    for (const supplier of this.testData.suppliers) {
      await this.db.add('suppliers', supplier);
    }
    console.log('✅ تم إنشاء 15 مورد متنوع');
  }

  // إنشاء حسابات محاسبية مفصلة
  async createDetailedAccountingAccounts() {
    const existing = await this.db.getAll('accounts');
    if (existing.length >= 30) {
      console.log('💰 حسابات محاسبية كافية موجودة بالفعل');
      return;
    }

    this.testData.accounts = [
      // الأصول
      { id: 'ACC-001', code: '1000', name: 'الأصول المتداولة', type: 'asset', parent_id: null, is_parent: true, created_at: new Date().toISOString() },
      { id: 'ACC-002', code: '1100', name: 'النقدية في الصندوق', type: 'asset', parent_id: 'ACC-001', is_parent: false, created_at: new Date().toISOString() },
      { id: 'ACC-003', code: '1110', name: 'نقدية بالصندوق الرئيسي', type: 'asset', parent_id: 'ACC-002', is_parent: false, created_at: new Date().toISOString() },
      { id: 'ACC-004', code: '1120', name: 'نقدية بالصناديق الفرعية', type: 'asset', parent_id: 'ACC-002', is_parent: false, created_at: new Date().toISOString() },
      
      { id: 'ACC-005', code: '1200', name: 'النقدية في البنك', type: 'asset', parent_id: 'ACC-001', is_parent: false, created_at: new Date().toISOString() },
      { id: 'ACC-006', code: '1210', name: 'بنك فيصل الإسلامي', type: 'asset', parent_id: 'ACC-005', is_parent: false, created_at: new Date().toISOString() },
      { id: 'ACC-007', code: '1220', name: 'بنك مصر الأهلي', type: 'asset', parent_id: 'ACC-005', is_parent: false, created_at: new Date().toISOString() },
      
      { id: 'ACC-008', code: '1300', name: 'العملاء', type: 'asset', parent_id: 'ACC-001', is_parent: true, created_at: new Date().toISOString() },
      { id: 'ACC-009', code: '1310', name: 'عملاء آجل', type: 'asset', parent_id: 'ACC-008', is_parent: false, created_at: new Date().toISOString() },
      { id: 'ACC-010', code: '1320', name: 'عملاء نقدي', type: 'asset', parent_id: 'ACC-008', is_parent: false, created_at: new Date().toISOString() },
      
      { id: 'ACC-011', code: '1400', name: 'المخزون', type: 'asset', parent_id: 'ACC-001', is_parent: true, created_at: new Date().toISOString() },
      { id: 'ACC-012', code: '1410', name: 'مواد غذائية', type: 'asset', parent_id: 'ACC-011', is_parent: false, created_at: new Date().toISOString() },
      { id: 'ACC-013', code: '1420', name: 'مشروبات', type: 'asset', parent_id: 'ACC-011', is_parent: false, created_at: new Date().toISOString() },
      { id: 'ACC-014', code: '1430', name: 'أجهزة كهربائية', type: 'asset', parent_id: 'ACC-011', is_parent: false, created_at: new Date().toISOString() },
      { id: 'ACC-015', code: '1440', name: 'منتجات تنظيف', type: 'asset', parent_id: 'ACC-011', is_parent: false, created_at: new Date().toISOString() },
      
      { id: 'ACC-016', code: '1500', name: 'المدفوعات مقدماً', type: 'asset', parent_id: 'ACC-001', is_parent: false, created_at: new Date().toISOString() },
      
      { id: 'ACC-017', code: '2000', name: 'الأصول الثابتة', type: 'asset', parent_id: null, is_parent: true, created_at: new Date().toISOString() },
      { id: 'ACC-018', code: '2100', name: 'أصول ثابتة - أرض', type: 'asset', parent_id: 'ACC-017', is_parent: false, created_at: new Date().toISOString() },
      { id: 'ACC-019', code: '2200', name: 'أصول ثابتة - مباني', type: 'asset', parent_id: 'ACC-017', is_parent: false, created_at: new Date().toISOString() },
      { id: 'ACC-020', code: '2300', name: 'أصول ثابتة - آلات ومعدات', type: 'asset', parent_id: 'ACC-017', is_parent: false, created_at: new Date().toISOString() },
      { id: 'ACC-021', code: '2400', name: 'أصول ثابتة - أثاث ومعدات', type: 'asset', parent_id: 'ACC-017', is_parent: false, created_at: new Date().toISOString() },
      
      // الخصوم
      { id: 'ACC-022', code: '3000', name: 'الخصوم المتداولة', type: 'liability', parent_id: null, is_parent: true, created_at: new Date().toISOString() },
      { id: 'ACC-023', code: '3100', name: 'الموردين', type: 'liability', parent_id: 'ACC-022', is_parent: true, created_at: new Date().toISOString() },
      { id: 'ACC-024', code: '3110', name: 'موردين مواد غذائية', type: 'liability', parent_id: 'ACC-023', is_parent: false, created_at: new Date().toISOString() },
      { id: 'ACC-025', code: '3120', name: 'موردين مشروبات', type: 'liability', parent_id: 'ACC-023', is_parent: false, created_at: new Date().toISOString() },
      { id: 'ACC-026', code: '3130', name: 'موردين أجهزة', type: 'liability', parent_id: 'ACC-023', is_parent: false, created_at: new Date().toISOString() },
      
      { id: 'ACC-027', code: '3200', name: 'المرتبات المستحقة', type: 'liability', parent_id: 'ACC-022', is_parent: false, created_at: new Date().toISOString() },
      { id: 'ACC-028', code: '3300', name: 'الضرائب المستحقة', type: 'liability', parent_id: 'ACC-022', is_parent: false, created_at: new Date().toISOString() },
      
      { id: 'ACC-029', code: '4000', name: 'حقوق الملكية', type: 'equity', parent_id: null, is_parent: true, created_at: new Date().toISOString() },
      { id: 'ACC-030', code: '4100', name: 'رأس المال', type: 'equity', parent_id: 'ACC-029', is_parent: false, created_at: new Date().toISOString() },
      { id: 'ACC-031', code: '4200', name: 'الأرباح المحتجزة', type: 'equity', parent_id: 'ACC-029', is_parent: false, created_at: new Date().toISOString() },
      
      // الإيرادات
      { id: 'ACC-032', code: '5000', name: 'الإيرادات', type: 'revenue', parent_id: null, is_parent: true, created_at: new Date().toISOString() },
      { id: 'ACC-033', code: '5100', name: 'إيرادات المبيعات', type: 'revenue', parent_id: 'ACC-032', is_parent: true, created_at: new Date().toISOString() },
      { id: 'ACC-034', code: '5110', name: 'مبيعات مواد غذائية', type: 'revenue', parent_id: 'ACC-033', is_parent: false, created_at: new Date().toISOString() },
      { id: 'ACC-035', code: '5120', name: 'مبيعات مشروبات', type: 'revenue', parent_id: 'ACC-033', is_parent: false, created_at: new Date().toISOString() },
      { id: 'ACC-036', code: '5130', name: 'مبيعات أجهزة', type: 'revenue', parent_id: 'ACC-033', is_parent: false, created_at: new Date().toISOString() },
      { id: 'ACC-037', code: '5140', name: 'مبيعات منتجات تنظيف', type: 'revenue', parent_id: 'ACC-033', is_parent: false, created_at: new Date().toISOString() },
      
      // المصروفات
      { id: 'ACC-038', code: '6000', name: 'المصروفات', type: 'expense', parent_id: null, is_parent: true, created_at: new Date().toISOString() },
      { id: 'ACC-039', code: '6100', name: 'تكلفة البضاعة المباعة', type: 'expense', parent_id: 'ACC-038', is_parent: true, created_at: new Date().toISOString() },
      { id: 'ACC-040', code: '6110', name: 'تكلفة مواد غذائية مباعة', type: 'expense', parent_id: 'ACC-039', is_parent: false, created_at: new Date().toISOString() },
      { id: 'ACC-041', code: '6120', name: 'تكلفة مشروبات مباعة', type: 'expense', parent_id: 'ACC-039', is_parent: false, created_at: new Date().toISOString() },
      { id: 'ACC-042', code: '6130', name: 'تكلفة أجهزة مباعة', type: 'expense', parent_id: 'ACC-039', is_parent: false, created_at: new Date().toISOString() },
      
      { id: 'ACC-043', code: '6200', name: 'مصروفات التشغيل', type: 'expense', parent_id: 'ACC-038', is_parent: true, created_at: new Date().toISOString() },
      { id: 'ACC-044', code: '6210', name: 'مرتبات وأجور', type: 'expense', parent_id: 'ACC-043', is_parent: false, created_at: new Date().toISOString() },
      { id: 'ACC-045', code: '6220', name: 'إيجار', type: 'expense', parent_id: 'ACC-043', is_parent: false, created_at: new Date().toISOString() },
      { id: 'ACC-046', code: '6230', name: 'كهرباء ومياه', type: 'expense', parent_id: 'ACC-043', is_parent: false, created_at: new Date().toISOString() },
      { id: 'ACC-047', code: '6240', name: 'اتصالات وإنترنت', type: 'expense', parent_id: 'ACC-043', is_parent: false, created_at: new Date().toISOString() },
      { id: 'ACC-048', code: '6250', name: 'مصروفات إدارية', type: 'expense', parent_id: 'ACC-043', is_parent: false, created_at: new Date().toISOString() }
    ];

    for (const account of this.testData.accounts) {
      await this.db.add('accounts', account);
    }
    console.log('✅ تم إنشاء 48 حساب محاسبي مفصل');
  }

  // إنشاء معاملات تجريبية
  async createSampleTransactions() {
    const existing = await this.db.getAll('transactions');
    if (existing.length >= 30) {
      console.log('📄 معاملات كافية موجودة بالفعل');
      return;
    }

    const accounts = await this.db.getAll('accounts');
    const getAccountByCode = (code) => accounts.find(acc => acc.code === code);

    this.testData.transactions = [
      // معاملات فتح الحسابات
      {
        date: '2025-01-01', description: 'رأس المال الافتتاحي', 
        debit_account_id: getAccountByCode('1100')?.id, debit_amount: 500000,
        credit_account_id: getAccountByCode('4100')?.id, credit_amount: 500000,
        created_at: new Date().toISOString()
      },
      {
        date: '2025-01-01', description: 'إيداع في البنك', 
        debit_account_id: getAccountByCode('1210')?.id, debit_amount: 200000,
        credit_account_id: getAccountByCode('1100')?.id, credit_amount: 200000,
        created_at: new Date().toISOString()
      },

      // معاملات شراء بضاعة
      {
        date: '2025-01-02', description: 'شراء مواد غذائية من موردين', 
        debit_account_id: getAccountByCode('1410')?.id, debit_amount: 15000,
        credit_account_id: getAccountByCode('1210')?.id, credit_amount: 15000,
        created_at: new Date().toISOString()
      },
      {
        date: '2025-01-03', description: 'شراء مشروبات نقداً', 
        debit_account_id: getAccountByCode('1420')?.id, debit_amount: 8000,
        credit_account_id: getAccountByCode('1110')?.id, credit_amount: 8000,
        created_at: new Date().toISOString()
      },
      {
        date: '2025-01-04', description: 'شراء أجهزة كهربائية من موردين', 
        debit_account_id: getAccountByCode('1430')?.id, debit_amount: 25000,
        credit_account_id: getAccountByCode('1220')?.id, credit_amount: 25000,
        created_at: new Date().toISOString()
      },

      // معاملات مصروفات
      {
        date: '2025-01-05', description: 'سداد إيجار المحل', 
        debit_account_id: getAccountByCode('6220')?.id, debit_amount: 5000,
        credit_account_id: getAccountByCode('1210')?.id, credit_amount: 5000,
        created_at: new Date().toISOString()
      },
      {
        date: '2025-01-06', description: 'سداد فواتير الكهرباء', 
        debit_account_id: getAccountByCode('6230')?.id, debit_amount: 1200,
        credit_account_id: getAccountByCode('1210')?.id, credit_amount: 1200,
        created_at: new Date().toISOString()
      },
      {
        date: '2025-01-07', description: 'دفع مرتبات الموظفين', 
        debit_account_id: getAccountByCode('6210')?.id, debit_amount: 15000,
        credit_account_id: getAccountByCode('1210')?.id, credit_amount: 15000,
        created_at: new Date().toISOString()
      },

      // معاملات مبيعات نقدية
      {
        date: '2025-01-08', description: 'مبيعات مواد غذائية نقدية', 
        debit_account_id: getAccountByCode('1110')?.id, debit_amount: 8500,
        credit_account_id: getAccountByCode('5110')?.id, credit_amount: 8500,
        created_at: new Date().toISOString()
      },
      {
        date: '2025-01-09', description: 'مبيعات مشروبات نقدية', 
        debit_account_id: getAccountByCode('1110')?.id, debit_amount: 4200,
        credit_account_id: getAccountByCode('5120')?.id, credit_amount: 4200,
        created_at: new Date().toISOString()
      },
      {
        date: '2025-01-10', description: 'مبيعات أجهزة كهربائية نقدية', 
        debit_account_id: getAccountByCode('1110')?.id, debit_amount: 18000,
        credit_account_id: getAccountByCode('5130')?.id, credit_amount: 18000,
        created_at: new Date().toISOString()
      },

      // معاملات مبيعات أاجل
      {
        date: '2025-01-11', description: 'مبيعات مواد غذائية أاجل للعميل أحمد محمد', 
        debit_account_id: getAccountByCode('1310')?.id, debit_amount: 3200,
        credit_account_id: getAccountByCode('5110')?.id, credit_amount: 3200,
        created_at: new Date().toISOString()
      },
      {
        date: '2025-01-12', description: 'مبيعات مشروبات أاجل للعميل فاطمة علي', 
        debit_account_id: getAccountByCode('1310')?.id, debit_amount: 5600,
        credit_account_id: getAccountByCode('5120')?.id, credit_amount: 5600,
        created_at: new Date().toISOString()
      },

      // معاملات تسوية المخزون
      {
        date: '2025-01-15', description: 'تسوية تكلفة البضاعة المباعة - مواد غذائية', 
        debit_account_id: getAccountByCode('6110')?.id, debit_amount: 5200,
        credit_account_id: getAccountByCode('1410')?.id, credit_amount: 5200,
        created_at: new Date().toISOString()
      },
      {
        date: '2025-01-16', description: 'تسوية تكلفة البضاعة المباعة - مشروبات', 
        debit_account_id: getAccountByCode('6120')?.id, debit_amount: 2800,
        credit_account_id: getAccountByCode('1420')?.id, credit_amount: 2800,
        created_at: new Date().toISOString()
      },
      {
        date: '2025-01-17', description: 'تسوية تكلفة البضاعة المباعة - أجهزة', 
        debit_account_id: getAccountByCode('6130')?.id, debit_amount: 9500,
        credit_account_id: getAccountByCode('1430')?.id, credit_amount: 9500,
        created_at: new Date().toISOString()
      },

      // معاملات إضافية
      {
        date: '2025-01-18', description: 'شراء منتجات تنظيف نقداً', 
        debit_account_id: getAccountByCode('1440')?.id, debit_amount: 6500,
        credit_account_id: getAccountByCode('1110')?.id, credit_amount: 6500,
        created_at: new Date().toISOString()
      },
      {
        date: '2025-01-19', description: 'سداد لموردي المواد الغذائية', 
        debit_account_id: getAccountByCode('3110')?.id, debit_amount: 12000,
        credit_account_id: getAccountByCode('1210')?.id, credit_amount: 12000,
        created_at: new Date().toISOString()
      },
      {
        date: '2025-01-20', description: 'سداد لموردي الأجهزة', 
        debit_account_id: getAccountByCode('3130')?.id, debit_amount: 20000,
        credit_account_id: getAccountByCode('1220')?.id, credit_amount: 20000,
        created_at: new Date().toISOString()
      },

      // معاملات مبيعات إضافية
      {
        date: '2025-01-21', description: 'مبيعات منتجات تنظيف نقدية', 
        debit_account_id: getAccountByCode('1110')?.id, debit_amount: 3800,
        credit_account_id: getAccountByCode('5140')?.id, credit_amount: 3800,
        created_at: new Date().toISOString()
      },
      {
        date: '2025-01-22', description: 'مبيعات مختلطة أاجل', 
        debit_account_id: getAccountByCode('1310')?.id, debit_amount: 8900,
        credit_account_id: getAccountByCode('5110')?.id, credit_amount: 4500,
        credit_account_id2: getAccountByCode('5120')?.id, credit_amount2: 4400,
        created_at: new Date().toISOString()
      },

      // معاملات شهرية إضافية
      {
        date: '2025-01-25', description: 'سداد فواتير الهاتف والإنترنت', 
        debit_account_id: getAccountByCode('6240')?.id, debit_amount: 800,
        credit_account_id: getAccountByCode('1210')?.id, credit_amount: 800,
        created_at: new Date().toISOString()
      },
      {
        date: '2025-01-28', description: 'شراء مخزون إضافي', 
        debit_account_id: getAccountByCode('1410')?.id, debit_amount: 18000,
        debit_account_id2: getAccountByCode('1420')?.id, debit_amount2: 9500,
        credit_account_id: getAccountByCode('1210')?.id, credit_amount: 27500,
        created_at: new Date().toISOString()
      },

      // معاملات نهاية الشهر
      {
        date: '2025-01-31', description: 'تسوية نهاية الشهر - مواد غذائية', 
        debit_account_id: getAccountByCode('6110')?.id, debit_amount: 6800,
        credit_account_id: getAccountByCode('1410')?.id, credit_amount: 6800,
        created_at: new Date().toISOString()
      },
      {
        date: '2025-01-31', description: 'تسوية نهاية الشهر - مشروبات', 
        debit_account_id: getAccountByCode('6120')?.id, debit_amount: 3600,
        credit_account_id: getAccountByCode('1420')?.id, credit_amount: 3600,
        created_at: new Date().toISOString()
      },
      {
        date: '2025-01-31', description: 'تسوية نهاية الشهر - أجهزة', 
        debit_account_id: getAccountByCode('6130')?.id, debit_amount: 12400,
        credit_account_id: getAccountByCode('1430')?.id, credit_amount: 12400,
        created_at: new Date().toISOString()
      },
      {
        date: '2025-01-31', description: 'تسوية نهاية الشهر - منظفات', 
        debit_account_id: getAccountByCode('6120')?.id, debit_amount: 2200,
        credit_account_id: getAccountByCode('1440')?.id, credit_amount: 2200,
        created_at: new Date().toISOString()
      }
    ];

    for (const transaction of this.testData.transactions) {
      await this.db.add('transactions', transaction);
    }
    console.log('✅ تم إنشاء 28 معاملة محاسبية');
  }

  // إنشاء مبيعات تجريبية
  async createSampleSales() {
    const existing = await this.db.getAll('sales_invoices');
    if (existing.length >= 20) {
      console.log('🛒 مبيعات كافية موجودة بالفعل');
      return;
    }

    const customers = await this.db.getAll('customers');
    const products = await this.db.getAll('products');

    this.testData.sales = [
      {
        invoice_number: 'INV-2025-001', customer_id: customers[0]?.id, customer_name: customers[0]?.name,
        customer_phone: customers[0]?.phone, customer_address: customers[0]?.address,
        date: '2025-01-15', subtotal: 1250.00, tax_rate: 14, tax_amount: 175.00, 
        discount_amount: 62.50, total_amount: 1362.50, paid_amount: 1000.00, 
        remaining_amount: 362.50, payment_method: 'cash', status: 'pending',
        items: [
          { product_name: 'حليب طازج 1 لتر', quantity: 20, unit_price: 4.50, total_price: 90.00 },
          { product_name: 'جبن أبيض 500 جرام', quantity: 10, unit_price: 15.00, total_price: 150.00 },
          { product_name: 'أرز بسمتي 1 كيلو', quantity: 15, unit_price: 8.00, total_price: 120.00 }
        ],
        created_at: new Date().toISOString()
      },
      {
        invoice_number: 'INV-2025-002', customer_id: customers[1]?.id, customer_name: customers[1]?.name,
        customer_phone: customers[1]?.phone, customer_address: customers[1]?.address,
        date: '2025-01-16', subtotal: 2890.00, tax_rate: 14, tax_amount: 404.60, 
        discount_amount: 289.00, total_amount: 3005.60, paid_amount: 3005.60, 
        remaining_amount: 0.00, payment_method: 'credit', status: 'paid',
        items: [
          { product_name: 'دجاج مجمد 1 كيلو', quantity: 30, unit_price: 18.00, total_price: 540.00 },
          { product_name: 'لحم بقري مفروم 500 جرام', quantity: 20, unit_price: 35.00, total_price: 700.00 },
          { product_name: 'قهوة عربية 500 جرام', quantity: 5, unit_price: 35.00, total_price: 175.00 }
        ],
        created_at: new Date().toISOString()
      },
      {
        invoice_number: 'INV-2025-003', customer_id: customers[2]?.id, customer_name: customers[2]?.name,
        customer_phone: customers[2]?.phone, customer_address: customers[2]?.address,
        date: '2025-01-17', subtotal: 567.50, tax_rate: 14, tax_amount: 79.45, 
        discount_amount: 28.38, total_amount: 618.57, paid_amount: 500.00, 
        remaining_amount: 118.57, payment_method: 'partial', status: 'partial',
        items: [
          { product_name: 'كوكا كولا 2 لتر', quantity: 15, unit_price: 5.00, total_price: 75.00 },
          { product_name: 'sprite علب 330 مل', quantity: 30, unit_price: 2.50, total_price: 75.00 }
        ],
        created_at: new Date().toISOString()
      },
      {
        invoice_number: 'INV-2025-004', customer_id: customers[3]?.id, customer_name: customers[3]?.name,
        customer_phone: customers[3]?.phone, customer_address: customers[3]?.address,
        date: '2025-01-18', subtotal: 4580.00, tax_rate: 14, tax_amount: 641.20, 
        discount_amount: 458.00, total_amount: 4763.20, paid_amount: 4763.20, 
        remaining_amount: 0.00, payment_method: 'credit', status: 'paid',
        items: [
          { product_name: 'طاسة كهربائية 25 سم', quantity: 8, unit_price: 85.00, total_price: 680.00 },
          { product_name: 'قدرة ضغط 4 لتر', quantity: 5, unit_price: 120.00, total_price: 600.00 },
          { product_name: 'سكاكين chefSet', quantity: 3, unit_price: 150.00, total_price: 450.00 }
        ],
        created_at: new Date().toISOString()
      },
      {
        invoice_number: 'INV-2025-005', customer_id: customers[4]?.id, customer_name: customers[4]?.name,
        customer_phone: customers[4]?.phone, customer_address: customers[4]?.address,
        date: '2025-01-19', subtotal: 890.00, tax_rate: 14, tax_amount: 124.60, 
        discount_amount: 89.00, total_amount: 925.60, paid_amount: 925.60, 
        remaining_amount: 0.00, payment_method: 'cash', status: 'paid',
        items: [
          { product_name: 'تفاح أحمر كيلو', quantity: 25, unit_price: 6.00, total_price: 150.00 },
          { product_name: 'برتقال مصري كيلو', quantity: 30, unit_price: 4.50, total_price: 135.00 }
        ],
        created_at: new Date().toISOString()
      },
      {
        invoice_number: 'INV-2025-006', customer_id: customers[5]?.id, customer_name: customers[5]?.name,
        customer_phone: customers[5]?.phone, customer_address: customers[5]?.address,
        date: '2025-01-20', subtotal: 1234.00, tax_rate: 14, tax_amount: 172.76, 
        discount_amount: 123.40, total_amount: 1283.36, paid_amount: 800.00, 
        remaining_amount: 483.36, payment_method: 'partial', status: 'partial',
        items: [
          { product_name: 'صابون غسيل سائل 2 لتر', quantity: 20, unit_price: 15.00, total_price: 300.00 },
          { product_name: 'مطهر تعقيم 1 لتر', quantity: 15, unit_price: 12.00, total_price: 180.00 }
        ],
        created_at: new Date().toISOString()
      },
      {
        invoice_number: 'INV-2025-007', customer_id: customers[6]?.id, customer_name: customers[6]?.name,
        customer_phone: customers[6]?.phone, customer_address: customers[6]?.address,
        date: '2025-01-21', subtotal: 3456.00, tax_rate: 14, tax_amount: 483.84, 
        discount_amount: 345.60, total_amount: 3594.24, paid_amount: 3594.24, 
        remaining_amount: 0.00, payment_method: 'credit', status: 'paid',
        items: [
          { product_name: 'طقم أطباق 24 قطعة', quantity: 5, unit_price: 180.00, total_price: 900.00 },
          { product_name: 'مكاييل بلاستيكية 5 قطع', quantity: 25, unit_price: 25.00, total_price: 625.00 }
        ],
        created_at: new Date().toISOString()
      },
      {
        invoice_number: 'INV-2025-008', customer_id: customers[7]?.id, customer_name: customers[7]?.name,
        customer_phone: customers[7]?.phone, customer_address: customers[7]?.address,
        date: '2025-01-22', subtotal: 765.00, tax_rate: 14, tax_amount: 107.10, 
        discount_amount: 76.50, total_amount: 795.60, paid_amount: 0.00, 
        remaining_amount: 795.60, payment_method: 'credit', status: 'unpaid',
        items: [
          { product_name: 'عصير تفاح طبيعي 1 لتر', quantity: 25, unit_price: 6.00, total_price: 150.00 },
          { product_name: 'عصير برتقال طازج 1 لتر', quantity: 20, unit_price: 7.00, total_price: 140.00 }
        ],
        created_at: new Date().toISOString()
      },
      {
        invoice_number: 'INV-2025-009', customer_id: customers[8]?.id, customer_name: customers[8]?.name,
        customer_phone: customers[8]?.phone, customer_address: customers[8]?.address,
        date: '2025-01-23', subtotal: 1890.00, tax_rate: 14, tax_amount: 264.60, 
        discount_amount: 189.00, total_amount: 1965.60, paid_amount: 1965.60, 
        remaining_amount: 0.00, payment_method: 'cash', status: 'paid',
        items: [
          { product_name: 'خبز أبيض رغيف', quantity: 100, unit_price: 1.50, total_price: 150.00 },
          { product_name: 'شوكولاتة حليب 100 جرام', quantity: 30, unit_price: 8.00, total_price: 240.00 }
        ],
        created_at: new Date().toISOString()
      },
      {
        invoice_number: 'INV-2025-010', customer_id: customers[9]?.id, customer_name: customers[9]?.name,
        customer_phone: customers[9]?.phone, customer_address: customers[9]?.address,
        date: '2025-01-24', subtotal: 4567.00, tax_rate: 14, tax_amount: 639.38, 
        discount_amount: 456.70, total_amount: 4749.68, paid_amount: 3000.00, 
        remaining_amount: 1749.68, payment_method: 'partial', status: 'partial',
        items: [
          { product_name: 'طاسة تيفال 28 سم', quantity: 10, unit_price: 95.00, total_price: 950.00 },
          { product_name: 'كؤوس زجاجية 6 قطعة', quantity: 20, unit_price: 45.00, total_price: 900.00 }
        ],
        created_at: new Date().toISOString()
      },
      {
        invoice_number: 'INV-2025-011', customer_id: customers[10]?.id, customer_name: customers[10]?.name,
        customer_phone: customers[10]?.phone, customer_address: customers[10]?.address,
        date: '2025-01-25', subtotal: 678.00, tax_rate: 14, tax_amount: 94.92, 
        discount_amount: 67.80, total_amount: 705.12, paid_amount: 705.12, 
        remaining_amount: 0.00, payment_method: 'credit', status: 'paid',
        items: [
          { product_name: 'مياه معدنية 1.5 لتر', quantity: 100, unit_price: 2.00, total_price: 200.00 },
          { product_name: 'مياه طبيعية 500 مل', quantity: 150, unit_price: 1.00, total_price: 150.00 }
        ],
        created_at: new Date().toISOString()
      },
      {
        invoice_number: 'INV-2025-012', customer_id: customers[11]?.id, customer_name: customers[11]?.name,
        customer_phone: customers[11]?.phone, customer_address: customers[11]?.address,
        date: '2025-01-26', subtotal: 1234.00, tax_rate: 14, tax_amount: 172.76, 
        discount_amount: 123.40, total_amount: 1283.36, paid_amount: 0.00, 
        remaining_amount: 1283.36, payment_method: 'credit', status: 'unpaid',
        items: [
          { product_name: 'منظف أطباق سائل 1 لتر', quantity: 40, unit_price: 8.00, total_price: 320.00 },
          { product_name: 'جيل منظف يدي 250 مل', quantity: 60, unit_price: 5.00, total_price: 300.00 }
        ],
        created_at: new Date().toISOString()
      },
      {
        invoice_number: 'INV-2025-013', customer_id: customers[12]?.id, customer_name: customers[12]?.name,
        customer_phone: customers[12]?.phone, customer_address: customers[12]?.address,
        date: '2025-01-27', subtotal: 2890.00, tax_rate: 14, tax_amount: 404.60, 
        discount_amount: 289.00, total_amount: 3005.60, paid_amount: 2000.00, 
        remaining_amount: 1005.60, payment_method: 'partial', status: 'partial',
        items: [
          { product_name: 'شاي أحمر سادة 100 جرام', quantity: 20, unit_price: 12.00, total_price: 240.00 },
          { product_name: 'عسل طبيعي 500 جرام', quantity: 15, unit_price: 25.00, total_price: 375.00 }
        ],
        created_at: new Date().toISOString()
      },
      {
        invoice_number: 'INV-2025-014', customer_id: customers[13]?.id, customer_name: customers[13]?.name,
        customer_phone: customers[13]?.phone, customer_address: customers[13]?.address,
        date: '2025-01-28', subtotal: 567.00, tax_rate: 14, tax_amount: 79.38, 
        discount_amount: 56.70, total_amount: 589.68, paid_amount: 589.68, 
        remaining_amount: 0.00, payment_method: 'cash', status: 'paid',
        items: [
          { product_name: 'خيار بلاستيكي كيلو', quantity: 50, unit_price: 3.50, total_price: 175.00 },
          { product_name: 'طماطم حمراء كيلو', quantity: 40, unit_price: 4.00, total_price: 160.00 }
        ],
        created_at: new Date().toISOString()
      },
      {
        invoice_number: 'INV-2025-015', customer_id: customers[14]?.id, customer_name: customers[14]?.name,
        customer_phone: customers[14]?.phone, customer_address: customers[14]?.address,
        date: '2025-01-29', subtotal: 1567.00, tax_rate: 14, tax_amount: 219.38, 
        discount_amount: 156.70, total_amount: 1629.68, paid_amount: 1000.00, 
        remaining_amount: 629.68, payment_method: 'partial', status: 'partial',
        items: [
          { product_name: 'عدس أحمر 1 كيلو', quantity: 30, unit_price: 12.00, total_price: 360.00 },
          { product_name: 'فول أبيض 1 كيلو', quantity: 25, unit_price: 10.00, total_price: 250.00 }
        ],
        created_at: new Date().toISOString()
      },
      {
        invoice_number: 'INV-2025-016', customer_id: customers[15]?.id, customer_name: customers[15]?.name,
        customer_phone: customers[15]?.phone, customer_address: customers[15]?.address,
        date: '2025-01-30', subtotal: 3456.00, tax_rate: 14, tax_amount: 483.84, 
        discount_amount: 345.60, total_amount: 3594.24, paid_amount: 3594.24, 
        remaining_amount: 0.00, payment_method: 'credit', status: 'paid',
        items: [
          { product_name: 'مناقيش جبنة قطعة', quantity: 50, unit_price: 3.00, total_price: 150.00 },
          { product_name: 'لوح تقطيع خشبي', quantity: 20, unit_price: 15.00, total_price: 300.00 }
        ],
        created_at: new Date().toISOString()
      },
      {
        invoice_number: 'INV-2025-017', customer_id: customers[16]?.id, customer_name: customers[16]?.name,
        customer_phone: customers[16]?.phone, customer_address: customers[16]?.address,
        date: '2025-01-31', subtotal: 1234.00, tax_rate: 14, tax_amount: 172.76, 
        discount_amount: 123.40, total_amount: 1283.36, paid_amount: 1283.36, 
        remaining_amount: 0.00, payment_method: 'cash', status: 'paid',
        items: [
          { product_name: 'منظف أرضيات 2 لتر', quantity: 25, unit_price: 18.00, total_price: 450.00 },
          { product_name: 'ورق تواليت 12 رزمة', quantity: 10, unit_price: 20.00, total_price: 200.00 }
        ],
        created_at: new Date().toISOString()
      },
      {
        invoice_number: 'INV-2025-018', customer_id: customers[17]?.id, customer_name: customers[17]?.name,
        customer_phone: customers[17]?.phone, customer_address: customers[17]?.address,
        date: '2025-02-01', subtotal: 890.00, tax_rate: 14, tax_amount: 124.60, 
        discount_amount: 89.00, total_amount: 925.60, paid_amount: 0.00, 
        remaining_amount: 925.60, payment_method: 'credit', status: 'unpaid',
        items: [
          { product_name: 'سكين خبز 20 سم', quantity: 15, unit_price: 25.00, total_price: 375.00 },
          { product_name: 'عصير جزر طبيعي 1 لتر', quantity: 20, unit_price: 8.00, total_price: 160.00 }
        ],
        created_at: new Date().toISOString()
      },
      {
        invoice_number: 'INV-2025-019', customer_id: customers[18]?.id, customer_name: customers[18]?.name,
        customer_phone: customers[18]?.phone, customer_address: customers[18]?.address,
        date: '2025-02-02', subtotal: 4567.00, tax_rate: 14, tax_amount: 639.38, 
        discount_amount: 456.70, total_amount: 4749.68, paid_amount: 3000.00, 
        remaining_amount: 1749.68, payment_method: 'partial', status: 'partial',
        items: [
          { product_name: 'زبد طبيعي 250 جرام', quantity: 30, unit_price: 8.50, total_price: 255.00 },
          { product_name: 'مسحوق غسيل 3 كيلو', quantity: 20, unit_price: 25.00, total_price: 500.00 }
        ],
        created_at: new Date().toISOString()
      },
      {
        invoice_number: 'INV-2025-020', customer_id: customers[19]?.id, customer_name: customers[19]?.name,
        customer_phone: customers[19]?.phone, customer_address: customers[19]?.address,
        date: '2025-02-03', subtotal: 678.00, tax_rate: 14, tax_amount: 94.92, 
        discount_amount: 67.80, total_amount: 705.12, paid_amount: 705.12, 
        remaining_amount: 0.00, payment_method: 'credit', status: 'paid',
        items: [
          { product_name: 'كوكا كولا 2 لتر', quantity: 40, unit_price: 5.00, total_price: 200.00 },
          { product_name: 'sprite علب 330 مل', quantity: 60, unit_price: 2.50, total_price: 150.00 }
        ],
        created_at: new Date().toISOString()
      }
    ];

    for (const sale of this.testData.sales) {
      await this.db.add('sales_invoices', sale);
    }
    console.log('✅ تم إنشاء 20 فاتورة مبيعات متنوعة');
  }
}

export default ComprehensiveTestDataCreator;