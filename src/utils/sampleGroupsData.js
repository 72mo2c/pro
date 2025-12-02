// ======================================
// Sample Groups Data - بيانات تجريبية للمجموعات
// ======================================

export const createSampleGroupsData = () => {
  return [
    // مجموعات المستوى الأول (رئيسية)
    {
      id: 1001,
      name: 'إلكترونيات',
      description: 'جميع الأجهزة الإلكترونية والإلكترونية الاستهلاكية',
      color: 'hsl(210, 70%, 60%)',
      parentId: null,
      level: 1,
      serialNumber: '001',
      createdAt: '2025-01-01T10:00:00.000Z',
      updatedAt: '2025-01-01T10:00:00.000Z'
    },
    {
      id: 1002,
      name: 'أغذية ومشروبات',
      description: 'المواد الغذائية والمشروبات بأنواعها',
      color: 'hsl(150, 70%, 60%)',
      parentId: null,
      level: 1,
      serialNumber: '002',
      createdAt: '2025-01-01T10:00:00.000Z',
      updatedAt: '2025-01-01T10:00:00.000Z'
    },
    {
      id: 1003,
      name: 'ملابس وأزياء',
      description: 'الألبسة والموضة والإكسسوارات',
      color: 'hsl(30, 70%, 60%)',
      parentId: null,
      level: 1,
      serialNumber: '003',
      createdAt: '2025-01-01T10:00:00.000Z',
      updatedAt: '2025-01-01T10:00:00.000Z'
    },
    {
      id: 1004,
      name: 'منزلي وأثاث',
      description: 'الأدوات المنزلية والأثاث والديكور',
      color: 'hsl(280, 70%, 60%)',
      parentId: null,
      level: 1,
      serialNumber: '004',
      createdAt: '2025-01-01T10:00:00.000Z',
      updatedAt: '2025-01-01T10:00:00.000Z'
    },

    // مجموعات المستوى الثاني (فرعية للإلكترونيات)
    {
      id: 2001,
      name: 'هواتف ذكية',
      description: 'الهواتف الذكية والأجهزة المحمولة',
      color: 'hsl(0, 70%, 60%)',
      parentId: 1001,
      level: 2,
      serialNumber: '005',
      createdAt: '2025-01-02T10:00:00.000Z',
      updatedAt: '2025-01-02T10:00:00.000Z'
    },
    {
      id: 2002,
      name: 'أجهزة كمبيوتر',
      description: 'أجهزة الكمبيوتر وأجهزة الكمبيوتر المحمولة',
      color: 'hsl(180, 70%, 60%)',
      parentId: 1001,
      level: 2,
      serialNumber: '006',
      createdAt: '2025-01-02T10:00:00.000Z',
      updatedAt: '2025-01-02T10:00:00.000Z'
    },
    {
      id: 2003,
      name: 'صوتيات ومرئيات',
      description: 'أجهزة الصوت والفيديو والتلفزيونات',
      color: 'hsl(320, 70%, 60%)',
      parentId: 1001,
      level: 2,
      serialNumber: '007',
      createdAt: '2025-01-02T10:00:00.000Z',
      updatedAt: '2025-01-02T10:00:00.000Z'
    },

    // مجموعات المستوى الثاني (فرعية للأغذية)
    {
      id: 2004,
      name: 'فواكه وخضروات',
      description: 'الفواكه والخضروات الطازجة',
      color: 'hsl(50, 70%, 60%)',
      parentId: 1002,
      level: 2,
      serialNumber: '008',
      createdAt: '2025-01-02T10:00:00.000Z',
      updatedAt: '2025-01-02T10:00:00.000Z'
    },
    {
      id: 2005,
      name: 'لحوم ودواجن',
      description: 'اللحوم الطازجة والدواجن',
      color: 'hsl(200, 70%, 60%)',
      parentId: 1002,
      level: 2,
      serialNumber: '009',
      createdAt: '2025-01-02T10:00:00.000Z',
      updatedAt: '2025-01-02T10:00:00.000Z'
    },
    {
      id: 2006,
      name: 'منتجات ألبان',
      description: 'الحليب والجبن والزبدة والزبادي',
      color: 'hsl(250, 70%, 60%)',
      parentId: 1002,
      level: 2,
      serialNumber: '010',
      createdAt: '2025-01-02T10:00:00.000Z',
      updatedAt: '2025-01-02T10:00:00.000Z'
    },

    // مجموعات المستوى الثالث (فرعية للهواتف)
    {
      id: 3001,
      name: 'أبل',
      description: 'هواتف أبل وآيباد',
      color: 'hsl(15, 70%, 60%)',
      parentId: 2001,
      level: 3,
      serialNumber: '011',
      createdAt: '2025-01-03T10:00:00.000Z',
      updatedAt: '2025-01-03T10:00:00.000Z'
    },
    {
      id: 3002,
      name: 'سامسونج',
      description: 'هواتف سامسونج Galaxy',
      color: 'hsl(195, 70%, 60%)',
      parentId: 2001,
      level: 3,
      serialNumber: '012',
      createdAt: '2025-01-03T10:00:00.000Z',
      updatedAt: '2025-01-03T10:00:00.000Z'
    },
    {
      id: 3003,
      name: 'هواوي',
      description: 'هواتف هواوي وشاومي',
      color: 'hsl(300, 70%, 60%)',
      parentId: 2001,
      level: 3,
      serialNumber: '013',
      createdAt: '2025-01-03T10:00:00.000Z',
      updatedAt: '2025-01-03T10:00:00.000Z'
    },

    // مجموعات المستوى الثالث (فرعية للكمبيوتر)
    {
      id: 3004,
      name: 'أجهزة سطح المكتب',
      description: 'أجهزة الكمبيوتر المكتبية',
      color: 'hsl(45, 70%, 60%)',
      parentId: 2002,
      level: 3,
      serialNumber: '014',
      createdAt: '2025-01-03T10:00:00.000Z',
      updatedAt: '2025-01-03T10:00:00.000Z'
    },
    {
      id: 3005,
      name: 'أجهزة محمولة',
      description: 'أجهزة الكمبيوتر المحمولة واللوحي',
      color: 'hsl(225, 70%, 60%)',
      parentId: 2002,
      level: 3,
      serialNumber: '015',
      createdAt: '2025-01-03T10:00:00.000Z',
      updatedAt: '2025-01-03T10:00:00.000Z'
    },

    // مجموعات المستوى الرابع (فرعية لهواوي)
    {
      id: 4001,
      name: 'هواوي P Series',
      description: 'سلسلة هواتف هواوي P',
      color: 'hsl(80, 70%, 60%)',
      parentId: 3003,
      level: 4,
      serialNumber: '016',
      createdAt: '2025-01-04T10:00:00.000Z',
      updatedAt: '2025-01-04T10:00:00.000Z'
    },
    {
      id: 4002,
      name: 'هواوي Mate Series',
      description: 'سلسلة هواتف هواوي Mate',
      color: 'hsl(120, 70%, 60%)',
      parentId: 3003,
      level: 4,
      serialNumber: '017',
      createdAt: '2025-01-04T10:00:00.000Z',
      updatedAt: '2025-01-04T10:00:00.000Z'
    },
    {
      id: 4003,
      name: 'شاومي',
      description: 'هواتف شاومي Redmi وMi',
      color: 'hsl(160, 70%, 60%)',
      parentId: 3003,
      level: 4,
      serialNumber: '018',
      createdAt: '2025-01-04T10:00:00.000Z',
      updatedAt: '2025-01-04T10:00:00.000Z'
    },

    // مجموعات المستوى الثاني (فرعية للملابس)
    {
      id: 2007,
      name: 'ملابس رجالية',
      description: 'الألبسة الرجالية',
      color: 'hsl(90, 70%, 60%)',
      parentId: 1003,
      level: 2,
      serialNumber: '019',
      createdAt: '2025-01-02T10:00:00.000Z',
      updatedAt: '2025-01-02T10:00:00.000Z'
    },
    {
      id: 2008,
      name: 'ملابس نسائية',
      description: 'الألبسة النسائية',
      color: 'hsl(270, 70%, 60%)',
      parentId: 1003,
      level: 2,
      serialNumber: '020',
      createdAt: '2025-01-02T10:00:00.000Z',
      updatedAt: '2025-01-02T10:00:00.000Z'
    },
    {
      id: 2009,
      name: 'ملابس أطفال',
      description: 'ألبسة الأطفال والرضع',
      color: 'hsl(35, 70%, 60%)',
      parentId: 1003,
      level: 2,
      serialNumber: '021',
      createdAt: '2025-01-02T10:00:00.000Z',
      updatedAt: '2025-01-02T10:00:00.000Z'
    },

    // مجموعات المستوى الثاني (فرعية للأثاث)
    {
      id: 2010,
      name: 'غرف المعيشة',
      description: 'أثاث وغرف المعيشة',
      color: 'hsl(120, 70%, 60%)',
      parentId: 1004,
      level: 2,
      serialNumber: '022',
      createdAt: '2025-01-02T10:00:00.000Z',
      updatedAt: '2025-01-02T10:00:00.000Z'
    },
    {
      id: 2011,
      name: 'غرف النوم',
      description: 'أثاث وغرف النوم',
      color: 'hsl(210, 70%, 60%)',
      parentId: 1004,
      level: 2,
      serialNumber: '023',
      createdAt: '2025-01-02T10:00:00.000Z',
      updatedAt: '2025-01-02T10:00:00.000Z'
    },
    {
      id: 2012,
      name: 'مطبخ',
      description: 'أدوات وأثاث المطبخ',
      color: 'hsl(30, 70%, 60%)',
      parentId: 1004,
      level: 2,
      serialNumber: '024',
      createdAt: '2025-01-02T10:00:00.000Z',
      updatedAt: '2025-01-02T10:00:00.000Z'
    }
  ];
};

// دالة لتحديث الـ localStorage بالبيانات التجريبية
export const initializeSampleGroupsData = () => {
  if (!localStorage.getItem('bero_groups')) {
    const sampleGroups = createSampleGroupsData();
    localStorage.setItem('bero_groups', JSON.stringify(sampleGroups));
    console.log('تم تحميل البيانات التجريبية للمجموعات');
    return sampleGroups;
  }
  return null;
};

// دالة لمسح البيانات التجريبية
export const clearSampleGroupsData = () => {
  localStorage.removeItem('bero_groups');
  console.log('تم مسح البيانات التجريبية للمجموعات');
};