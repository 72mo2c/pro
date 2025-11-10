// ======================================
// Mock Data - بيانات وهمية شاملة للاختبار
// نظام شامل للبيانات الوهمية بجميع الأقسام
// ======================================

// بيانات المستخدمين
export const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // hash for "password"
    name: 'المدير العام',
    email: 'admin@berosystem.com',
    phone: '+966501234567',
    role: 'admin',
    status: 'active',
    permissions: ['all'],
    createdAt: '2024-01-01T10:00:00.000Z',
    lastLogin: '2024-11-10T22:43:00.000Z'
  },
  {
    id: 2,
    username: 'manager',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    name: 'أحمد محمد',
    email: 'ahmed@berosystem.com',
    phone: '+966502345678',
    role: 'manager',
    status: 'active',
    permissions: ['view', 'edit'],
    createdAt: '2024-01-02T11:30:00.000Z',
    lastLogin: '2024-11-10T20:15:00.000Z'
  },
  {
    id: 3,
    username: 'user',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    name: 'فاطمة علي',
    email: 'fatima@berosystem.com',
    phone: '+966503456789',
    role: 'user',
    status: 'active',
    permissions: ['view'],
    createdAt: '2024-01-03T14:20:00.000Z',
    lastLogin: '2024-11-10T18:45:00.000Z'
  }
];

// بيانات المخازن
export const mockWarehouses = [
  {
    id: 1,
    name: 'المخزن الرئيسي',
    code: 'MAIN',
    address: 'الرياض، حي النرجس، شارع الملك فهد',
    phone: '+966112345678',
    manager: 'محمد الأحمد',
    capacity: 1000,
    currentOccupancy: 750,
    status: 'active',
    temperature: 22,
    humidity: 45,
    createdAt: '2024-01-01T08:00:00.000Z'
  },
  {
    id: 2,
    name: 'مستودع المنتجات الجافة',
    code: 'DRY',
    address: 'الرياض، حي الع爱的، مجمع التجارية',
    phone: '+966112345679',
    manager: 'علي السعد',
    capacity: 500,
    currentOccupancy: 350,
    status: 'active',
    temperature: 25,
    humidity: 35,
    createdAt: '2024-01-15T10:00:00.000Z'
  }
];

// بيانات الفئات
export const mockCategories = [
  { id: 1, name: 'المواد الغذائية', description: 'مختلف أنواع الأغذية' },
  { id: 2, name: 'المشروبات', description: 'مختلف أنواع المشروبات' },
  { id: 3, name: 'مواد التنظيف', description: 'منتجات التنظيف والصابون' },
  { id: 4, name: 'مواد الألبان', description: 'منتجات الألبان والبيض' },
  { id: 5, name: 'اللحوم والأسماك', description: 'منتجات اللحوم والأسماك' }
];

// بيانات المنتجات
export const mockProducts = [
  {
    id: 1,
    name: 'أرز بسمتي أبيض',
    code: 'RICE001',
    barcode: '1234567890123',
    categoryId: 1,
    description: 'أرز بسمتي عالي الجودة من باكستان',
    unit: 'كيس',
    mainQuantity: 150,
    subQuantity: 0,
    unitsInMain: 10,
    mainPrice: 45.50,
    subPrice: 4.55,
    cost: 35.00,
    minStock: 50,
    maxStock: 500,
    warehouseId: 1,
    supplier: 'شركة الغذاء الذهبي',
    expiryDate: '2025-12-31',
    weight: 5,
    dimensions: '40x30x20',
    createdAt: '2024-01-01T12:00:00.000Z'
  },
  {
    id: 2,
    name: 'زيت زيتون بكر ممتاز',
    code: 'OIL001',
    barcode: '2345678901234',
    categoryId: 1,
    description: 'زيت زيتون بصفراء西班牙ية',
    unit: 'لتر',
    mainQuantity: 80,
    subQuantity: 0,
    unitsInMain: 6,
    mainPrice: 28.75,
    subPrice: 4.79,
    cost: 22.00,
    minStock: 20,
    maxStock: 200,
    warehouseId: 1,
    supplier: 'مزارع الأرض الخضراء',
    expiryDate: '2025-06-30',
    weight: 1,
    dimensions: '15x8x8',
    createdAt: '2024-01-02T14:30:00.000Z'
  },
  {
    id: 3,
    name: 'حليب كامل الدسم',
    code: 'MILK001',
    barcode: '3456789012345',
    categoryId: 4,
    description: 'حليب طازج كامل الدسم 3.2%',
    unit: 'كarton',
    mainQuantity: 45,
    subQuantity: 0,
    unitsInMain: 12,
    mainPrice: 16.20,
    subPrice: 1.35,
    cost: 12.00,
    minStock: 25,
    maxStock: 150,
    warehouseId: 1,
    supplier: 'مزارع البقرة الذهبية',
    expiryDate: '2024-12-05',
    weight: 0.5,
    dimensions: '20x12x8',
    createdAt: '2024-01-03T16:00:00.000Z'
  }
];

// بيانات الموردين
export const mockSuppliers = [
  {
    id: 1,
    name: 'شركة الغذاء الذهبي',
    code: 'SUP001',
    contactPerson: 'أحمد محمد العلي',
    phone: '+966112345678',
    email: 'info@alfood.com',
    address: 'الرياض، حي المرقب، شارع الصناعة',
    taxNumber: '300123456700003',
    paymentTerms: '30 يوم',
    creditLimit: 50000,
    currentBalance: 12500,
    status: 'active',
    rating: 4.5,
    notes: 'مورد موثوق وجودة عالية',
    createdAt: '2024-01-01T09:00:00.000Z'
  },
  {
    id: 2,
    name: 'مزارع الأرض الخضراء',
    code: 'SUP002',
    contactPerson: 'فاطمة السعد',
    phone: '+966112345679',
    email: 'contact@greenland.com',
    address: 'جدة، حي الروضة، مجمع التجارية',
    taxNumber: '300987654300002',
    paymentTerms: '15 يوم',
    creditLimit: 30000,
    currentBalance: 8750,
    status: 'active',
    rating: 4.0,
    notes: 'منتجات عضوية',
    createdAt: '2024-01-02T11:00:00.000Z'
  }
];

// بيانات العملاء
export const mockCustomers = [
  {
    id: 1,
    name: 'مطعم النخيل الذهبي',
    code: 'CUST001',
    contactPerson: 'محمد الأحمد',
    phone: '+966501234567',
    email: 'info@alnakheel.com',
    address: 'الرياض، حي المروج، شارع الفنار',
    taxNumber: '300456789100003',
    customerType: 'wholesale',
    paymentTerms: '30 يوم',
    creditLimit: 25000,
    currentBalance: 8500,
    status: 'active',
    rating: 4.2,
    notes: 'عميل دائم',
    createdAt: '2024-01-01T10:00:00.000Z'
  },
  {
    id: 2,
    name: 'بقالة المول الأخضر',
    code: 'CUST002',
    contactPerson: 'سارة أحمد',
    phone: '+966502345678',
    email: 'sales@greenmall.com',
    address: 'جدة، حي الحمراء، شارع التحلية',
    taxNumber: '300456789100004',
    customerType: 'retail',
    paymentTerms: '15 يوم',
    creditLimit: 10000,
    currentBalance: 3250,
    status: 'active',
    rating: 3.8,
    notes: 'عميل جديد',
    createdAt: '2024-01-05T14:30:00.000Z'
  }
];

// بيانات فواتير المشتريات
export const mockPurchaseInvoices = [
  {
    id: 1,
    invoiceNumber: 'PUR-2024-001',
    supplierId: 1,
    date: '2024-11-01T10:00:00.000Z',
    items: [
      {
        productId: 1,
        productName: 'أرز بسمتي أبيض',
        quantity: 20,
        subQuantity: 0,
        price: 45.50,
        subPrice: 0,
        total: 910.00
      },
      {
        productId: 2,
        productName: 'زيت زيتون بكر ممتاز',
        quantity: 10,
        subQuantity: 0,
        price: 28.75,
        subPrice: 0,
        total: 287.50
      }
    ],
    subtotal: 1197.50,
    tax: 179.63,
    total: 1377.13,
    paymentType: 'cash',
    paid: 1377.13,
    remaining: 0,
    status: 'paid',
    notes: 'فاتورة مذكورة',
    createdAt: '2024-11-01T10:00:00.000Z'
  },
  {
    id: 2,
    invoiceNumber: 'PUR-2024-002',
    supplierId: 2,
    date: '2024-11-03T14:30:00.000Z',
    items: [
      {
        productId: 3,
        productName: 'حليب كامل الدسم',
        quantity: 15,
        subQuantity: 0,
        price: 16.20,
        subPrice: 0,
        total: 243.00
      }
    ],
    subtotal: 243.00,
    tax: 36.45,
    total: 279.45,
    paymentType: 'deferred',
    paid: 0,
    remaining: 279.45,
    status: 'pending',
    notes: 'دفع آجل',
    createdAt: '2024-11-03T14:30:00.000Z'
  }
];

// بيانات فواتير المبيعات
export const mockSalesInvoices = [
  {
    id: 1,
    invoiceNumber: 'SALES-2024-001',
    customerId: 1,
    date: '2024-11-05T11:00:00.000Z',
    items: [
      {
        productId: 1,
        productName: 'أرز بسمتي أبيض',
        quantity: 5,
        subQuantity: 0,
        price: 50.00,
        subPrice: 0,
        total: 250.00
      },
      {
        productId: 2,
        productName: 'زيت زيتون بكر ممتاز',
        quantity: 3,
        subQuantity: 0,
        price: 32.00,
        subPrice: 0,
        total: 96.00
      }
    ],
    subtotal: 346.00,
    tax: 51.90,
    total: 397.90,
    paymentType: 'cash',
    paid: 397.90,
    remaining: 0,
    status: 'paid',
    notes: 'عميل مميز',
    createdAt: '2024-11-05T11:00:00.000Z'
  }
];

// بيانات الخزينة
export const mockTreasuryBalance = 15750.50;

export const mockCashReceipts = [
  {
    id: 1,
    amount: 397.90,
    fromType: 'customer',
    fromId: 1,
    description: 'مبيعات نقدية - فاتورة رقم 1',
    reference: 'فاتورة مبيعات #1',
    type: 'sales_payment',
    date: '2024-11-05T11:30:00.000Z',
    createdAt: '2024-11-05T11:30:00.000Z'
  },
  {
    id: 2,
    amount: 5000.00,
    fromType: 'other',
    fromId: null,
    description: 'إيداع بنكي - رأس المال',
    reference: 'إيداع بنكي',
    type: 'capital_deposit',
    date: '2024-11-01T09:00:00.000Z',
    createdAt: '2024-11-01T09:00:00.000Z'
  }
];

export const mockCashDisbursements = [
  {
    id: 1,
    amount: 1377.13,
    toType: 'supplier',
    toId: 1,
    description: 'شراء نقدي من المورد - فاتورة رقم 1',
    reference: 'فاتورة مشتريات #1',
    type: 'purchase_payment',
    date: '2024-11-01T12:00:00.000Z',
    createdAt: '2024-11-01T12:00:00.000Z'
  }
];

// بيانات الموارد البشرية
export const mockEmployees = [
  {
    id: 1,
    employeeCode: 'EMP001',
    name: 'أحمد محمد السعد',
    nationalId: '1234567890',
    phone: '+966501234567',
    email: 'ahmed@company.com',
    departmentId: 1,
    positionId: 1,
    basicSalary: 5000,
    hireDate: '2024-01-01T08:00:00.000Z',
    status: 'active',
    createdAt: '2024-01-01T08:00:00.000Z'
  },
  {
    id: 2,
    employeeCode: 'EMP002',
    name: 'فاطمة علي المطيري',
    nationalId: '2345678901',
    phone: '+966502345678',
    email: 'fatima@company.com',
    departmentId: 2,
    positionId: 2,
    basicSalary: 4500,
    hireDate: '2024-01-15T10:00:00.000Z',
    status: 'active',
    createdAt: '2024-01-15T10:00:00.000Z'
  }
];

export const mockDepartments = [
  { id: 1, name: 'المبيعات', description: 'قسم المبيعات والتسويق' },
  { id: 2, name: 'المخازن', description: 'قسم إدارة المخازن' },
  { id: 3, name: 'المحاسبة', description: 'قسم المحاسبة والمالية' }
];

export const mockPositions = [
  { id: 1, name: 'مندوب مبيعات', departmentId: 1 },
  { id: 2, name: 'أمين مخزن', departmentId: 2 },
  { id: 3, name: 'محاسب', departmentId: 3 }
];

export const mockAttendance = [
  {
    id: 1,
    employeeId: 1,
    date: '2024-11-10T08:00:00.000Z',
    timeIn: '08:00',
    timeOut: '17:00',
    breakTime: 60,
    overtimeHours: 0,
    status: 'present',
    createdAt: '2024-11-10T08:00:00.000Z'
  },
  {
    id: 2,
    employeeId: 2,
    date: '2024-11-10T08:30:00.000Z',
    timeIn: '08:30',
    timeOut: '17:30',
    breakTime: 60,
    overtimeHours: 1,
    status: 'present',
    createdAt: '2024-11-10T08:30:00.000Z'
  }
];

// بيانات الأصول الثابتة
export const mockFixedAssets = [
  {
    id: 1,
    name: 'شاحنة نقل بضائع',
    code: 'ASSET001',
    categoryId: 1,
    locationId: 1,
    originalCost: 125000,
    currentValue: 110000,
    accumulatedDepreciation: 15000,
    bookValue: 110000,
    purchaseDate: '2024-01-15T10:00:00.000Z',
    depreciationStartDate: '2024-01-15T10:00:00.000Z',
    usefulLife: 7,
    depreciationMethodId: 1,
    status: 'Active',
    createdAt: '2024-01-15T10:00:00.000Z'
  }
];

export const mockAssetCategories = [
  { id: 1, name: 'المعدات', description: 'معدات النقل والآلات' },
  { id: 2, name: 'الأجهزة', description: 'أجهزة كمبيوتر ومكاتب' },
  { id: 3, name: 'المباني', description: 'مباني وتراكيب' }
];

export const mockAssetLocations = [
  { id: 1, name: 'الفرع الرئيسي', address: 'الرياض، حي المروج' },
  { id: 2, name: 'المستودع الفرعي', address: 'الرياض، حي الصناعية' }
];

// بيانات الإنتاج
export const mockProductionOrders = [
  {
    id: 1,
    orderNumber: 'PO-2024-001',
    productId: 1,
    quantity: 1000,
    plannedStartDate: '2024-11-01T08:00:00.000Z',
    plannedEndDate: '2024-11-15T17:00:00.000Z',
    status: 'In Progress',
    progress: 65,
    createdAt: '2024-11-01T08:00:00.000Z'
  }
];

export const mockWorkCenters = [
  {
    id: 1,
    name: 'خط الإنتاج الرئيسي',
    capacity: 2000,
    currentUtilization: 65,
    status: 'Active',
    createdAt: '2024-01-01T08:00:00.000Z'
  }
];

// بيانات التحويلات بين المخازن
export const mockTransfers = [
  {
    id: 1,
    transferNumber: 'TRANS-2024-001',
    fromWarehouseId: 1,
    toWarehouseId: 2,
    date: '2024-11-08T10:00:00.000Z',
    items: [
      {
        productId: 1,
        productName: 'أرز بسمتي أبيض',
        quantity: 50,
        subQuantity: 0
      }
    ],
    status: 'completed',
    notes: 'تحويل للبائع',
    createdAt: '2024-11-08T10:00:00.000Z'
  }
];

// بيانات المحاسبة
export const mockAccounts = [
  {
    id: 1,
    code: '1101',
    name: 'الخزينة',
    type: 'asset',
    parentAccountId: null,
    isActive: true,
    createdAt: '2024-01-01T08:00:00.000Z'
  },
  {
    id: 2,
    code: '1102',
    name: 'المدينون',
    type: 'asset',
    parentAccountId: null,
    isActive: true,
    createdAt: '2024-01-01T08:00:00.000Z'
  },
  {
    id: 3,
    code: '2101',
    name: 'الدائنون',
    type: 'liability',
    parentAccountId: null,
    isActive: true,
    createdAt: '2024-01-01T08:00:00.000Z'
  },
  {
    id: 4,
    code: '3101',
    name: 'رأس المال',
    type: 'equity',
    parentAccountId: null,
    isActive: true,
    createdAt: '2024-01-01T08:00:00.000Z'
  },
  {
    id: 5,
    code: '4101',
    name: 'إيرادات المبيعات',
    type: 'revenue',
    parentAccountId: null,
    isActive: true,
    createdAt: '2024-01-01T08:00:00.000Z'
  },
  {
    id: 6,
    code: '5101',
    name: 'تكلفة البضاعة المباعة',
    type: 'expense',
    parentAccountId: null,
    isActive: true,
    createdAt: '2024-01-01T08:00:00.000Z'
  }
];

export const mockJournalEntries = [
  {
    id: 1,
    entryNumber: 'JE-2024-001',
    date: '2024-11-05T11:30:00.000Z',
    description: 'فاتورة مبيعات نقدية #1',
    reference: 'SALES-2024-001',
    totalDebit: 397.90,
    totalCredit: 397.90,
    status: 'posted',
    entries: [
      { accountId: 1, description: 'الخزينة', debit: 397.90, credit: 0 },
      { accountId: 5, description: 'إيرادات المبيعات', debit: 0, credit: 397.90 }
    ],
    createdAt: '2024-11-05T11:30:00.000Z'
  }
];

// المرتجعات
export const mockPurchaseReturns = [];
export const mockSalesReturns = [];

// دالة تهيئة جميع البيانات الوهمية
export const initializeMockData = () => {
  try {
    // تهيئة بيانات المستخدمين
    localStorage.setItem('bero_system_users', JSON.stringify(mockUsers));
    
    // تهيئة بيانات المخازن
    localStorage.setItem('bero_warehouses', JSON.stringify(mockWarehouses));
    
    // تهيئة البيانات
    localStorage.setItem('bero_categories', JSON.stringify(mockCategories));
    localStorage.setItem('bero_products', JSON.stringify(mockProducts));
    localStorage.setItem('bero_suppliers', JSON.stringify(mockSuppliers));
    localStorage.setItem('bero_customers', JSON.stringify(mockCustomers));
    
    // تهيئة فواتير المشتريات
    localStorage.setItem('bero_purchase_invoices', JSON.stringify(mockPurchaseInvoices));
    localStorage.setItem('bero_purchase_returns', JSON.stringify(mockPurchaseReturns));
    
    // تهيئة فواتير المبيعات
    localStorage.setItem('bero_sales_invoices', JSON.stringify(mockSalesInvoices));
    localStorage.setItem('bero_sales_returns', JSON.stringify(mockSalesReturns));
    
    // تهيئة بيانات الخزينة
    localStorage.setItem('bero_treasury_balance', JSON.stringify(mockTreasuryBalance));
    localStorage.setItem('bero_cash_receipts', JSON.stringify(mockCashReceipts));
    localStorage.setItem('bero_cash_disbursements', JSON.stringify(mockCashDisbursements));
    
    // تهيئة التحويلات
    localStorage.setItem('bero_transfers', JSON.stringify(mockTransfers));
    
    // تهيئة بيانات الموارد البشرية
    localStorage.setItem('bero_employees', JSON.stringify(mockEmployees));
    localStorage.setItem('bero_departments', JSON.stringify(mockDepartments));
    localStorage.setItem('bero_positions', JSON.stringify(mockPositions));
    localStorage.setItem('bero_attendance', JSON.stringify(mockAttendance));
    localStorage.setItem('bero_leave_types', JSON.stringify([]));
    localStorage.setItem('bero_employee_leaves', JSON.stringify([]));
    localStorage.setItem('bero_employee_leave_balances', JSON.stringify([]));
    localStorage.setItem('bero_salary_components', JSON.stringify([]));
    localStorage.setItem('bero_payroll_periods', JSON.stringify([]));
    localStorage.setItem('bero_payroll_details', JSON.stringify([]));
    localStorage.setItem('bero_performance_metrics', JSON.stringify([]));
    localStorage.setItem('bero_performance_reviews', JSON.stringify([]));
    
    // تهيئة بيانات الإنتاج
    localStorage.setItem('bero_production_orders', JSON.stringify(mockProductionOrders));
    localStorage.setItem('bero_bom_items', JSON.stringify([]));
    localStorage.setItem('bero_production_operations', JSON.stringify([]));
    localStorage.setItem('bero_work_centers', JSON.stringify(mockWorkCenters));
    localStorage.setItem('bero_production_plans', JSON.stringify([]));
    localStorage.setItem('bero_material_consumption', JSON.stringify([]));
    localStorage.setItem('bero_production_waste', JSON.stringify([]));
    localStorage.setItem('bero_quality_controls', JSON.stringify([]));
    localStorage.setItem('bero_production_kpis', JSON.stringify([]));
    
    // تهيئة بيانات الأصول الثابتة
    localStorage.setItem('bero_fixed_assets', JSON.stringify(mockFixedAssets));
    localStorage.setItem('bero_asset_categories', JSON.stringify(mockAssetCategories));
    localStorage.setItem('bero_asset_locations', JSON.stringify(mockAssetLocations));
    localStorage.setItem('bero_depreciation_methods', JSON.stringify([]));
    localStorage.setItem('bero_depreciation_schedules', JSON.stringify([]));
    localStorage.setItem('bero_depreciation_entries', JSON.stringify([]));
    localStorage.setItem('bero_maintenance_schedules', JSON.stringify([]));
    localStorage.setItem('bero_maintenance_records', JSON.stringify([]));
    localStorage.setItem('bero_maintenance_costs', JSON.stringify([]));
    localStorage.setItem('bero_asset_inventory', JSON.stringify([]));
    localStorage.setItem('bero_asset_valuations', JSON.stringify([]));
    localStorage.setItem('bero_asset_disposals', JSON.stringify([]));
    localStorage.setItem('bero_asset_transfers', JSON.stringify([]));
    localStorage.setItem('bero_asset_acquisitions', JSON.stringify([]));
    
    // تهيئة بيانات المحاسبة
    localStorage.setItem('bero_accounts', JSON.stringify(mockAccounts));
    localStorage.setItem('bero_journal_entries', JSON.stringify(mockJournalEntries));
    
    console.log('✅ تم تهيئة جميع البيانات الوهمية بنجاح');
    return true;
    
  } catch (error) {
    console.error('❌ خطأ في تهيئة البيانات الوهمية:', error);
    return false;
  }
};

// دالة مسح جميع البيانات
export const clearAllMockData = () => {
  const keys = [
    'bero_system_users',
    'bero_warehouses', 'bero_categories', 'bero_products', 'bero_suppliers', 'bero_customers',
    'bero_purchase_invoices', 'bero_purchase_returns',
    'bero_sales_invoices', 'bero_sales_returns',
    'bero_treasury_balance', 'bero_cash_receipts', 'bero_cash_disbursements',
    'bero_transfers',
    'bero_employees', 'bero_departments', 'bero_positions', 'bero_attendance',
    'bero_leave_types', 'bero_employee_leaves', 'bero_employee_leave_balances',
    'bero_salary_components', 'bero_payroll_periods', 'bero_payroll_details',
    'bero_performance_metrics', 'bero_performance_reviews',
    'bero_production_orders', 'bero_bom_items', 'bero_production_operations',
    'bero_work_centers', 'bero_production_plans', 'bero_material_consumption',
    'bero_production_waste', 'bero_quality_controls', 'bero_production_kpis',
    'bero_fixed_assets', 'bero_asset_categories', 'bero_asset_locations',
    'bero_depreciation_methods', 'bero_depreciation_schedules', 'bero_depreciation_entries',
    'bero_maintenance_schedules', 'bero_maintenance_records', 'bero_maintenance_costs',
    'bero_asset_inventory', 'bero_asset_valuations', 'bero_asset_disposals',
    'bero_asset_transfers', 'bero_asset_acquisitions',
    'bero_accounts', 'bero_journal_entries'
  ];
  
  keys.forEach(key => localStorage.removeItem(key));
  console.log('🗑️ تم مسح جميع البيانات الوهمية');
};

// دالة الحصول على إحصائيات البيانات الوهمية
export const getMockDataStats = () => {
  return {
    users: JSON.parse(localStorage.getItem('bero_system_users') || '[]').length,
    products: JSON.parse(localStorage.getItem('bero_products') || '[]').length,
    suppliers: JSON.parse(localStorage.getItem('bero_suppliers') || '[]').length,
    customers: JSON.parse(localStorage.getItem('bero_customers') || '[]').length,
    purchaseInvoices: JSON.parse(localStorage.getItem('bero_purchase_invoices') || '[]').length,
    salesInvoices: JSON.parse(localStorage.getItem('bero_sales_invoices') || '[]').length,
    treasuryBalance: parseFloat(localStorage.getItem('bero_treasury_balance') || '0'),
    employees: JSON.parse(localStorage.getItem('bero_employees') || '[]').length,
    fixedAssets: JSON.parse(localStorage.getItem('bero_fixed_assets') || '[]').length,
    productionOrders: JSON.parse(localStorage.getItem('bero_production_orders') || '[]').length,
    accounts: JSON.parse(localStorage.getItem('bero_accounts') || '[]').length
  };
};

export default {
  mockUsers,
  mockWarehouses,
  mockCategories,
  mockProducts,
  mockSuppliers,
  mockCustomers,
  mockPurchaseInvoices,
  mockSalesInvoices,
  mockTreasuryBalance,
  mockCashReceipts,
  mockCashDisbursements,
  mockTransfers,
  mockEmployees,
  mockDepartments,
  mockPositions,
  mockAttendance,
  mockFixedAssets,
  mockAssetCategories,
  mockAssetLocations,
  mockProductionOrders,
  mockWorkCenters,
  mockAccounts,
  mockJournalEntries,
  initializeMockData,
  clearAllMockData,
  getMockDataStats
};