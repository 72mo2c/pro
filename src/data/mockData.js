// ======================================
// Mock Data - البيانات التجريبية للعرض
// ======================================

// بيانات الشركات
export const companies = [
  {
    id: 1,
    name: "شركة بيو التجارية",
    arabicName: "شركة بيو التجارية",
    taxNumber: "1234567890123",
    commercialRegister: "CR123456789",
    address: "الرياض، المملكة العربية السعودية",
    phone: "+966123456789",
    email: "info@berocom.sa",
    logo: "/images/company-logo.png",
    currency: "SAR",
    language: "ar",
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 2,
    name: "شركة الرياض للتوريدات",
    arabicName: "شركة الرياض للتوريدات",
    taxNumber: "9876543210987",
    commercialRegister: "CR987654321",
    address: "جدة، المملكة العربية السعودية",
    phone: "+966987654321",
    email: "contact@riyadh-supply.sa",
    logo: "/images/company-logo2.png",
    currency: "SAR",
    language: "ar",
    createdAt: "2024-02-01T00:00:00.000Z"
  }
];

// بيانات المستخدمين
export const users = [
  {
    id: 1,
    username: "admin",
    password: "admin123",
    fullName: "مدير النظام",
    email: "admin@berocom.sa",
    role: "admin",
    companyId: 1,
    isActive: true,
    lastLogin: "2024-11-10T02:00:00.000Z",
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 2,
    username: "manager",
    password: "manager123",
    fullName: "مدير المبيعات",
    email: "manager@berocom.sa",
    role: "manager",
    companyId: 1,
    isActive: true,
    lastLogin: "2024-11-09T15:30:00.000Z",
    createdAt: "2024-01-15T00:00:00.000Z"
  },
  {
    id: 3,
    username: "accountant",
    password: "account123",
    fullName: "محاسب",
    email: "account@berocom.sa",
    role: "accountant",
    companyId: 1,
    isActive: true,
    lastLogin: "2024-11-10T01:45:00.000Z",
    createdAt: "2024-02-01T00:00:00.000Z"
  }
];

// بيانات المخازن
export const warehouses = [
  {
    id: 1,
    name: "المخزن الرئيسي",
    code: "WH001",
    location: "الرياض - المنطقة الصناعية",
    manager: "أحمد محمد العلي",
    phone: "+966123456789",
    area: 5000,
    capacity: 10000,
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 2,
    name: "مخزن جدة",
    code: "WH002",
    location: "جدة - الميناء الجاف",
    manager: "محمد عبدالله السعد",
    phone: "+966987654321",
    area: 3000,
    capacity: 6000,
    isActive: true,
    createdAt: "2024-02-15T00:00:00.000Z"
  },
  {
    id: 3,
    name: "مخزن الدمام",
    code: "WH003",
    location: "الدمام - الميناء الشرقي",
    manager: "عبدالرحمن سالم القحطاني",
    phone: "+966555123456",
    area: 4000,
    capacity: 8000,
    isActive: true,
    createdAt: "2024-03-01T00:00:00.000Z"
  }
];

// بيانات الفئات
export const categories = [
  {
    id: 1,
    name: "المواد الغذائية",
    code: "FOOD",
    description: "المواد الغذائية والمشروبات",
    parentId: null,
    level: 1,
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 2,
    name: "الحلويات والشوكولاتة",
    code: "SWEET",
    description: "الحلويات والشوكولاتة والعيون",
    parentId: 1,
    level: 2,
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 3,
    name: "المشروبات الباردة",
    code: "COLD_DRINKS",
    description: "المشروبات الباردة والعصائر",
    parentId: 1,
    level: 2,
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 4,
    name: "المواد الاستهلاكية",
    code: "CONSUMABLES",
    description: "المواد الاستهلاكية والتنظيف",
    parentId: null,
    level: 1,
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 5,
    name: "أدوات التنظيف",
    code: "CLEANING",
    description: "أدوات ومواد التنظيف",
    parentId: 4,
    level: 2,
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z"
  }
];

// بيانات المنتجات
export const products = [
  {
    id: 1,
    name: "شوكولاتة كيندر بوينت",
    code: "KIND-001",
    categoryId: 2,
    barcode: "1234567890123",
    description: "شوكولاتة كيندر بوينت 100 جرام",
    mainUnit: "كرتونة",
    subUnit: "قطعة",
    unitsInMain: 24,
    mainQuantity: 15,
    subQuantity: 144,
    minStockLevel: 10,
    maxStockLevel: 100,
    mainPrice: 45.50,
    subPrice: 1.90,
    costPrice: 38.00,
    salePrice: 45.50,
    warehouseId: 1,
    supplierId: 1,
    expiryDate: "2025-06-30",
    manufacturingDate: "2024-06-15",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 2,
    name: "كوكاكولا علب 330 مل",
    code: "COCA-330",
    categoryId: 3,
    barcode: "5449000000996",
    description: "كوكاكولا علب 330 مل",
    mainUnit: "كرتونة",
    subUnit: "علبة",
    unitsInMain: 24,
    mainQuantity: 25,
    subQuantity: 120,
    minStockLevel: 15,
    maxStockLevel: 200,
    mainPrice: 22.80,
    subPrice: 0.95,
    costPrice: 18.50,
    salePrice: 22.80,
    warehouseId: 1,
    supplierId: 2,
    expiryDate: "2025-12-31",
    manufacturingDate: "2024-05-20",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 3,
    name: "بسكويت أوريو",
    code: "OREO-001",
    categoryId: 2,
    barcode: "7891234567890",
    description: "بسكويت أوريو آيس كريم 130 جرام",
    mainUnit: "كرتونة",
    subUnit: "قطعة",
    unitsInMain: 12,
    mainQuantity: 18,
    subQuantity: 96,
    minStockLevel: 8,
    maxStockLevel: 80,
    mainPrice: 18.50,
    subPrice: 1.54,
    costPrice: 14.80,
    salePrice: 18.50,
    warehouseId: 1,
    supplierId: 1,
    expiryDate: "2025-08-15",
    manufacturingDate: "2024-08-01",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 4,
    name: "صابون برسيل",
    code: "PERSIL-001",
    categoryId: 5,
    barcode: "5990000000012",
    description: "مسحوق برسيل للغسيل 3 كيلو",
    mainUnit: "كرتونة",
    subUnit: "علبة",
    unitsInMain: 6,
    mainQuantity: 12,
    subQuantity: 18,
    minStockLevel: 5,
    maxStockLevel: 40,
    mainPrice: 28.50,
    subPrice: 4.75,
    costPrice: 22.80,
    salePrice: 28.50,
    warehouseId: 2,
    supplierId: 3,
    expiryDate: "2025-12-31",
    manufacturingDate: "2024-04-10",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 5,
    name: "عصير بيبسي علب 330 مل",
    code: "PEPSI-330",
    categoryId: 3,
    barcode: "5449000001008",
    description: "عصير بيبسي كولا علب 330 مل",
    mainUnit: "كرتونة",
    subUnit: "علبة",
    unitsInMain: 24,
    mainQuantity: 20,
    subQuantity: 144,
    minStockLevel: 12,
    maxStockLevel: 150,
    mainPrice: 21.60,
    subPrice: 0.90,
    costPrice: 17.25,
    salePrice: 21.60,
    warehouseId: 1,
    supplierId: 2,
    expiryDate: "2025-11-30",
    manufacturingDate: "2024-05-25",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z"
  }
];

// بيانات الموردين
export const suppliers = [
  {
    id: 1,
    name: "شركة حلويات النصر",
    code: "SUP-001",
    contactPerson: "خالد محمد العلي",
    phone: "+966123456789",
    mobile: "+966501234567",
    email: "contact@nhr-sweets.com",
    address: "الرياض - حي المروج",
    city: "الرياض",
    postalCode: "11564",
    taxNumber: "1234567890123",
    commercialRegister: "CR123456",
    creditLimit: 50000,
    creditPeriod: 30,
    paymentTerms: "دفع آجل 30 يوم",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 2,
    name: "شركة المشروبات المتقدمة",
    code: "SUP-002",
    contactPerson: "عبدالله أحمد الزهراني",
    phone: "+966987654321",
    mobile: "+966502345678",
    email: "info@advanced-beverages.com",
    address: "جدة - حي الشاطئ",
    city: "جدة",
    postalCode: "21481",
    taxNumber: "9876543210987",
    commercialRegister: "CR987654",
    creditLimit: 75000,
    creditPeriod: 45,
    paymentTerms: "دفع آجل 45 يوم",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 3,
    name: "شركة المنظفات الطبية",
    code: "SUP-003",
    contactPerson: "محمد سالم العتيبي",
    phone: "+966555123456",
    mobile: "+966503456789",
    email: "sales@medical-cleaning.com",
    address: "الدمام - المنطقة الصناعية الثانية",
    city: "الدمام",
    postalCode: "31441",
    taxNumber: "5556667778899",
    commercialRegister: "CR555666",
    creditLimit: 30000,
    creditPeriod: 15,
    paymentTerms: "دفع نقدي خصم 2%",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z"
  }
];

// بيانات العملاء
export const customers = [
  {
    id: 1,
    name: "بقالة الأخضر التجارية",
    code: "CUS-001",
    contactPerson: "علي حسن الشمري",
    phone: "+966112345678",
    mobile: "+966504567890",
    email: "info@khader-market.com",
    address: "الرياض - حي العليا",
    city: "الرياض",
    postalCode: "11564",
    taxNumber: "1112223334445",
    commercialRegister: "CR111222",
    creditLimit: 25000,
    creditPeriod: 15,
    paymentTerms: "دفع آجل 15 يوم",
    customerType: "retail",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 2,
    name: "مطعم الكشك الشرقي",
    code: "CUS-002",
    contactPerson: "سعد راشد المطيري",
    phone: "+966112345679",
    mobile: "+966505678901",
    email: "contact@oriental-restaurant.com",
    address: "جدة - حي الروضة",
    city: "جدة",
    postalCode: "21481",
    taxNumber: "2223334445566",
    commercialRegister: "CR222333",
    creditLimit: 35000,
    creditPeriod: 20,
    paymentTerms: "دفع آجل 20 يوم",
    customerType: "restaurant",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 3,
    name: "متجر الأطماع العائلي",
    code: "CUS-003",
    contactPerson: "فهد طارق الشهري",
    phone: "+966115678901",
    mobile: "+966506789012",
    email: "info@alotmai-family.com",
    address: "الدمام - حي الشاطئ الشرقي",
    city: "الدمام",
    postalCode: "31441",
    taxNumber: "3334445556677",
    commercialRegister: "CR333444",
    creditLimit: 18000,
    creditPeriod: 10,
    paymentTerms: "دفع آجل 10 أيام",
    customerType: "retail",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 4,
    name: "سوبر ماركت المدينة",
    code: "CUS-004",
    contactPerson: "راشد أحمد القحطاني",
    phone: "+966116789012",
    mobile: "+966507890123",
    email: "sales@madinah-supermarket.com",
    address: "الرياض - حي المروج",
    city: "الرياض",
    postalCode: "11564",
    taxNumber: "4445556667788",
    commercialRegister: "CR444555",
    creditLimit: 60000,
    creditPeriod: 30,
    paymentTerms: "دفع آجل 30 يوم",
    customerType: "wholesale",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z"
  }
];

// بيانات فواتير المشتريات
export const purchaseInvoices = [
  {
    id: 1,
    invoiceNumber: "PI-2024-001",
    date: "2024-11-01T00:00:00.000Z",
    supplierId: 1,
    total: 6825.00,
    tax: 956.50,
    discount: 0,
    paymentType: "deferred",
    status: "received",
    notes: "دفعة جزئية - دفع نصف قيمة الفاتورة نقدي",
    createdBy: 1,
    createdAt: "2024-11-01T10:00:00.000Z",
    items: [
      {
        productId: 1,
        productName: "شوكولاتة كيندر بوينت",
        quantity: 15,
        subQuantity: 144,
        price: 45.50,
        subPrice: 1.90,
        total: 6825.00,
        received: true
      }
    ]
  },
  {
    id: 2,
    invoiceNumber: "PI-2024-002",
    date: "2024-11-02T00:00:00.000Z",
    supplierId: 2,
    total: 3420.00,
    tax: 478.80,
    discount: 0,
    paymentType: "cash",
    status: "received",
    notes: "دفع نقدي كامل - خصم 2%",
    createdBy: 1,
    createdAt: "2024-11-02T11:30:00.000Z",
    items: [
      {
        productId: 2,
        productName: "كوكاكولا علب 330 مل",
        quantity: 25,
        subQuantity: 120,
        price: 22.80,
        subPrice: 0.95,
        total: 3420.00,
        received: true
      }
    ]
  },
  {
    id: 3,
    invoiceNumber: "PI-2024-003",
    date: "2024-11-03T00:00:00.000Z",
    supplierId: 3,
    total: 2052.00,
    tax: 287.28,
    discount: 102.60,
    paymentType: "partial",
    status: "received",
    notes: "دفع جزئي - تم خصم 5% عند السداد",
    createdBy: 1,
    createdAt: "2024-11-03T14:15:00.000Z",
    items: [
      {
        productId: 4,
        productName: "صابون برسيل",
        quantity: 12,
        subQuantity: 18,
        price: 28.50,
        subPrice: 4.75,
        total: 2052.00,
        received: true
      }
    ]
  }
];

// بيانات فواتير المبيعات
export const salesInvoices = [
  {
    id: 1,
    invoiceNumber: "SI-2024-001",
    date: "2024-11-05T00:00:00.000Z",
    customerId: 1,
    total: 2275.00,
    tax: 318.50,
    discount: 0,
    paymentType: "deferred",
    paymentStatus: "pending",
    status: "delivered",
    notes: "عميل منتظم - خصم 3% على الطلبات الكبيرة",
    createdBy: 2,
    createdAt: "2024-11-05T09:30:00.000Z",
    items: [
      {
        productId: 1,
        productName: "شوكولاتة كيندر بوينت",
        quantity: 8,
        subQuantity: 0,
        price: 45.50,
        total: 364.00,
        delivered: true
      },
      {
        productId: 2,
        productName: "كوكاكولا علب 330 مل",
        quantity: 12,
        subQuantity: 144,
        price: 22.80,
        subPrice: 0.95,
        total: 1911.00,
        delivered: true
      }
    ]
  },
  {
    id: 2,
    invoiceNumber: "SI-2024-002",
    date: "2024-11-06T00:00:00.000Z",
    customerId: 4,
    total: 1534.50,
    tax: 214.83,
    discount: 153.45,
    paymentType: "cash",
    paymentStatus: "paid",
    status: "delivered",
    notes: "عميل تاجر - خصم 10% للدفع النقدي",
    createdBy: 2,
    createdAt: "2024-11-06T11:00:00.000Z",
    items: [
      {
        productId: 1,
        productName: "شوكولاتة كيندر بوينت",
        quantity: 5,
        subQuantity: 48,
        price: 45.50,
        subPrice: 1.90,
        total: 1244.30,
        delivered: true
      },
      {
        productId: 3,
        productName: "بسكويت أوريو",
        quantity: 3,
        subQuantity: 12,
        price: 18.50,
        subPrice: 1.54,
        total: 290.20,
        delivered: true
      }
    ]
  },
  {
    id: 3,
    invoiceNumber: "SI-2024-003",
    date: "2024-11-07T00:00:00.000Z",
    customerId: 2,
    total: 685.20,
    tax: 95.93,
    discount: 0,
    paymentType: "deferred",
    paymentStatus: "pending",
    status: "in_transit",
    notes: "جاري التوصيل - متوقع الوصول غداً",
    createdBy: 2,
    createdAt: "2024-11-07T15:45:00.000Z",
    items: [
      {
        productId: 5,
        productName: "عصير بيبسي علب 330 مل",
        quantity: 6,
        subQuantity: 72,
        price: 21.60,
        subPrice: 0.90,
        total: 685.20,
        delivered: false
      }
    ]
  }
];

// بيانات التحويلات بين المخازن
export const transfers = [
  {
    id: 1,
    transferNumber: "TR-2024-001",
    date: "2024-11-04T00:00:00.000Z",
    fromWarehouseId: 1,
    toWarehouseId: 2,
    status: "completed",
    notes: "تحويل المخزون المتوفر إلى جدة",
    createdBy: 1,
    createdAt: "2024-11-04T10:00:00.000Z",
    items: [
      {
        productId: 4,
        productName: "صابون برسيل",
        mainQuantity: 5,
        subQuantity: 18,
        mainUnit: "كرتونة",
        subUnit: "علبة"
      }
    ]
  }
];

// بيانات الخزينة
export const treasury = {
  balance: 125000.00,
  lastUpdated: "2024-11-10T02:30:00.000Z",
  cashReceipts: [
    {
      id: 1,
      receiptNumber: "CR-2024-001",
      date: "2024-11-02T00:00:00.000Z",
      amount: 3420.00,
      fromType: "supplier",
      fromId: 2,
      fromName: "شركة المشروبات المتقدمة",
      description: "سداد جزئي لفاتورة PI-2024-002",
      reference: "فواتير مبيعات #2",
      type: "purchase_return",
      createdBy: 1,
      createdAt: "2024-11-02T11:30:00.000Z"
    },
    {
      id: 2,
      receiptNumber: "CR-2024-002",
      date: "2024-11-06T00:00:00.000Z",
      amount: 1534.50,
      fromType: "customer",
      fromId: 4,
      fromName: "سوبر ماركت المدينة",
      description: "دفع نقدي لفاتورة SI-2024-002",
      reference: "فاتورة مبيعات #2",
      type: "sales_payment",
      createdBy: 2,
      createdAt: "2024-11-06T11:00:00.000Z"
    }
  ],
  cashDisbursements: [
    {
      id: 1,
      disbursementNumber: "CD-2024-001",
      date: "2024-11-01T00:00:00.000Z",
      amount: 3421.25,
      toType: "supplier",
      toId: 1,
      toName: "شركة حلويات النصر",
      description: "دفع جزئي لفاتورة PI-2024-001",
      reference: "فاتورة مشتريات #1",
      type: "purchase_payment",
      createdBy: 1,
      createdAt: "2024-11-01T10:00:00.000Z"
    },
    {
      id: 2,
      disbursementNumber: "CD-2024-002",
      date: "2024-11-03T00:00:00.000Z",
      amount: 1949.40,
      toType: "supplier",
      toId: 3,
      toName: "شركة المنظفات الطبية",
      description: "دفع جزئي لفاتورة PI-2024-003 مع خصم",
      reference: "فاتورة مشتريات #3",
      type: "purchase_payment",
      createdBy: 1,
      createdAt: "2024-11-03T14:15:00.000Z"
    }
  ]
};

// بيانات دليل الحسابات
export const accounts = [
  {
    id: 1,
    code: "1000",
    name: "الأصول المتداولة",
    type: "asset",
    level: 1,
    parentId: null,
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 2,
    code: "1100",
    name: "النقدية في الصندوق",
    type: "asset",
    level: 2,
    parentId: 1,
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 3,
    code: "1200",
    name: "العملاء",
    type: "asset",
    level: 2,
    parentId: 1,
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 4,
    code: "1300",
    name: "المخزون",
    type: "asset",
    level: 2,
    parentId: 1,
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 5,
    code: "2000",
    name: "الخصوم المتداولة",
    type: "liability",
    level: 1,
    parentId: null,
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 6,
    code: "2100",
    name: "الموردون",
    type: "liability",
    level: 2,
    parentId: 5,
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 7,
    code: "3000",
    name: "رأس المال والأرباح",
    type: "equity",
    level: 1,
    parentId: null,
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 8,
    code: "3100",
    name: "رأس المال",
    type: "equity",
    level: 2,
    parentId: 7,
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 9,
    code: "4000",
    name: "إيرادات المبيعات",
    type: "revenue",
    level: 1,
    parentId: null,
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 10,
    code: "5000",
    name: "تكلفة المبيعات",
    type: "expense",
    level: 1,
    parentId: null,
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 11,
    code: "6000",
    name: "المصروفات التشغيلية",
    type: "expense",
    level: 1,
    parentId: null,
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 12,
    code: "6100",
    name: "مصروفات الرواتب",
    type: "expense",
    level: 2,
    parentId: 11,
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z"
  }
];

// بيانات القيود اليومية
export const journalEntries = [
  {
    id: 1,
    entryNumber: "JE-2024-001",
    date: "2024-11-01T00:00:00.000Z",
    description: "فاتورة مشتريات PI-2024-001",
    reference: "فاتورة مشتريات رقم 1",
    status: "posted",
    totalDebit: 6825.00,
    totalCredit: 6825.00,
    createdBy: 1,
    createdAt: "2024-11-01T10:00:00.000Z",
    entries: [
      {
        accountId: 4,
        accountName: "المخزون",
        debit: 6825.00,
        credit: 0,
        description: "شراء مخزون من شركة حلويات النصر"
      },
      {
        accountId: 6,
        accountName: "الموردون",
        debit: 0,
        credit: 6825.00,
        description: "مبلغ مستحق لشركة حلويات النصر"
      }
    ]
  },
  {
    id: 2,
    entryNumber: "JE-2024-002",
    date: "2024-11-05T00:00:00.000Z",
    description: "فاتورة مبيعات SI-2024-001",
    reference: "فاتورة مبيعات رقم 1",
    status: "posted",
    totalDebit: 2593.50,
    totalCredit: 2593.50,
    createdBy: 2,
    createdAt: "2024-11-05T09:30:00.000Z",
    entries: [
      {
        accountId: 3,
        accountName: "العملاء",
        debit: 2593.50,
        credit: 0,
        description: "مبلغ مستحق من بقالة الأخضر التجارية"
      },
      {
        accountId: 9,
        accountName: "إيرادات المبيعات",
        debit: 0,
        credit: 2275.00,
        description: "إيراد مبيعات فاتورة SI-2024-001"
      },
      {
        accountId: 1,
        accountName: "ضريبة القيمة المضافة",
        debit: 0,
        credit: 318.50,
        description: "ضريبة قيمة مضافة مستحقة"
      }
    ]
  }
];

// بيانات الموظفين
export const employees = [
  {
    id: 1,
    employeeCode: "EMP-001",
    fullName: "محمد أحمد العلي",
    position: "مدير المبيعات",
    department: "المبيعات",
    basicSalary: 12000,
    phone: "+966501234567",
    email: "mohammed.ali@berocom.sa",
    hireDate: "2024-01-15",
    status: "active",
    address: "الرياض - حي العليا",
    nationalId: "1234567890",
    createdAt: "2024-01-15T00:00:00.000Z"
  },
  {
    id: 2,
    employeeCode: "EMP-002",
    fullName: "فاطمة سعد الزهراني",
    position: "محاسبة",
    department: "المحاسبة",
    basicSalary: 8500,
    phone: "+966502345678",
    email: "fatima.zahrani@berocom.sa",
    hireDate: "2024-02-01",
    status: "active",
    address: "الرياض - حي المروج",
    nationalId: "2345678901",
    createdAt: "2024-02-01T00:00:00.000Z"
  },
  {
    id: 3,
    employeeCode: "EMP-003",
    fullName: "عبدالله راشد المطيري",
    position: "أمين مخزن",
    department: "المخازن",
    basicSalary: 6500,
    phone: "+966503456789",
    email: "abdullah.mutairi@berocom.sa",
    hireDate: "2024-02-15",
    status: "active",
    address: "الرياض - حي الروضة",
    nationalId: "3456789012",
    createdAt: "2024-02-15T00:00:00.000Z"
  }
];

// بيانات الدورات
export const departments = [
  {
    id: 1,
    name: "الإدارة العامة",
    manager: "مدير النظام",
    description: "الإدارة والعمليات العامة",
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 2,
    name: "المبيعات",
    manager: "محمد أحمد العلي",
    description: "قسم المبيعات والتسويق",
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 3,
    name: "المحاسبة",
    manager: "فاطمة سعد الزهراني",
    description: "قسم المحاسبة والمالية",
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 4,
    name: "المخازن",
    manager: "عبدالله راشد المطيري",
    description: "قسم إدارة المخازن والتخزين",
    createdAt: "2024-01-01T00:00:00.000Z"
  }
];

// بيانات التقارير والإحصائيات
export const dashboardStats = {
  totalSales: 4494.70,
  totalPurchases: 12307.25,
  totalCustomers: 4,
  totalSuppliers: 3,
  totalProducts: 5,
  lowStockProducts: 1,
  pendingInvoices: 2,
  recentTransactions: 5,
  monthlyGrowth: 8.5,
  topSellingProducts: [
    { productId: 2, productName: "كوكاكولا علب 330 مل", sales: 1911.00, quantity: 12 },
    { productId: 1, productName: "شوكولاتة كيندر بوينت", sales: 1244.30, quantity: 8 },
    { productId: 5, productName: "عصير بيبسي علب 330 مل", sales: 685.20, quantity: 6 }
  ],
  topCustomers: [
    { customerId: 1, customerName: "بقالة الأخضر التجارية", totalPurchases: 2275.00, invoices: 1 },
    { customerId: 4, customerName: "سوبر ماركت المدينة", totalPurchases: 1534.50, invoices: 1 },
    { customerId: 2, customerName: "مطعم الكشك الشرقي", totalPurchases: 685.20, invoices: 1 }
  ]
};

// تصدير جميع البيانات
export default {
  companies,
  users,
  warehouses,
  categories,
  products,
  suppliers,
  customers,
  purchaseInvoices,
  salesInvoices,
  transfers,
  treasury,
  accounts,
  journalEntries,
  employees,
  departments,
  dashboardStats
};