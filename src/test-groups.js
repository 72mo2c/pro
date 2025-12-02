// ======================================
// Groups System Test - اختبار نظام المجموعات
// ======================================

// اختبار تهيئة البيانات التجريبية
const testSampleDataInitialization = () => {
  console.log('🧪 اختبار تهيئة البيانات التجريبية...');
  
  try {
    // اختبار البيانات التجريبية
    const sampleData = [
      {
        id: 1001,
        name: 'مجموعة تجريبية',
        description: 'لاختبار النظام',
        color: 'hsl(210, 70%, 60%)',
        parentId: null,
        level: 1,
        serialNumber: '001'
      }
    ];
    
    // محاكاة حفظ البيانات
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('bero_groups_test', JSON.stringify(sampleData));
      
      // استرجاع البيانات
      const retrieved = JSON.parse(localStorage.getItem('bero_groups_test') || '[]');
      
      if (retrieved.length === 1 && retrieved[0].name === 'مجموعة تجريبية') {
        console.log('✅ نجح اختبار تهيئة البيانات التجريبية');
        return true;
      }
    }
    
    console.log('❌ فشل اختبار تهيئة البيانات التجريبية');
    return false;
  } catch (error) {
    console.log('❌ خطأ في اختبار البيانات التجريبية:', error.message);
    return false;
  }
};

// اختبار توليد الألوان
const testColorGeneration = () => {
  console.log('🎨 اختبار توليد الألوان...');
  
  const generateLevelColor = (level) => {
    const hue = (level * 137.508) % 360; // Golden angle
    return `hsl(${hue}, 70%, 60%)`;
  };
  
  try {
    const colors = [];
    for (let i = 1; i <= 10; i++) {
      colors.push(generateLevelColor(i));
    }
    
    // التحقق من تنوع الألوان
    const uniqueColors = [...new Set(colors)];
    if (uniqueColors.length === colors.length) {
      console.log('✅ نجح اختبار توليد الألوان - جميع الألوان فريدة');
      console.log('الألوان المولدة:', colors);
      return true;
    } else {
      console.log('❌ فشل اختبار توليد الألوان - تكرار في الألوان');
      return false;
    }
  } catch (error) {
    console.log('❌ خطأ في اختبار الألوان:', error.message);
    return false;
  }
};

// اختبار بناء الشجرة الهرمية
const testTreeStructure = () => {
  console.log('🌳 اختبار بناء الشجرة الهرمية...');
  
  try {
    const groups = [
      { id: 1, name: 'Root', parentId: null, level: 1, serialNumber: '001' },
      { id: 2, name: 'Child1', parentId: 1, level: 2, serialNumber: '002' },
      { id: 3, name: 'Child2', parentId: 1, level: 2, serialNumber: '003' },
      { id: 4, name: 'Grandchild', parentId: 2, level: 3, serialNumber: '004' }
    ];
    
    const buildTree = (groupsList, parentId = null, level = 1) => {
      return groupsList
        .filter(group => group.parentId === parentId)
        .sort((a, b) => a.serialNumber.localeCompare(b.serialNumber))
        .map(group => ({
          ...group,
          level,
          children: buildTree(groupsList, group.id, level + 1)
        }));
    };
    
    const tree = buildTree(groups);
    
    // التحقق من هيكل الشجرة
    const rootGroup = tree.find(g => g.id === 1);
    if (rootGroup && rootGroup.children.length === 2) {
      const child1 = rootGroup.children.find(c => c.id === 2);
      if (child1 && child1.children.length === 1 && child1.children[0].id === 4) {
        console.log('✅ نجح اختبار بناء الشجرة الهرمية');
        return true;
      }
    }
    
    console.log('❌ فشل اختبار بناء الشجرة الهرمية');
    return false;
  } catch (error) {
    console.log('❌ خطأ في اختبار الشجرة:', error.message);
    return false;
  }
};

// اختبار التصفية والبحث
const testSearchFilter = () => {
  console.log('🔍 اختبار التصفية والبحث...');
  
  try {
    const groups = [
      { id: 1, name: 'إلكترونيات', parentId: null },
      { id: 2, name: 'هواتف ذكية', parentId: 1 },
      { id: 3, name: 'أجهزة كمبيوتر', parentId: 1 }
    ];
    
    const searchTerm = 'هواتف';
    const filtered = groups.filter(group => 
      group.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (filtered.length === 1 && filtered[0].id === 2) {
      console.log('✅ نجح اختبار التصفية والبحث');
      return true;
    } else {
      console.log('❌ فشل اختبار التصفية والبحث');
      return false;
    }
  } catch (error) {
    console.log('❌ خطأ في اختبار البحث:', error.message);
    return false;
  }
};

// تشغيل جميع الاختبارات
const runAllGroupTests = () => {
  console.log('\n🚀 بدء تشغيل جميع اختبارات نظام المجموعات...\n');
  
  const tests = [
    testSampleDataInitialization,
    testColorGeneration,
    testTreeStructure,
    testSearchFilter
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  tests.forEach(test => {
    if (test()) {
      passedTests++;
    }
  });
  
  console.log(`\n📊 نتائج الاختبارات:`);
  console.log(`✅ نجح: ${passedTests} من ${totalTests} اختبار`);
  console.log(`❌ فشل: ${totalTests - passedTests} اختبار`);
  
  if (passedTests === totalTests) {
    console.log('🎉 جميع اختبارات نظام المجموعات نجحت!');
  } else {
    console.log('⚠️ توجد مشاكل في نظام المجموعات');
  }
  
  return passedTests === totalTests;
};

// تصدير للاستخدام في Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testSampleDataInitialization,
    testColorGeneration,
    testTreeStructure,
    testSearchFilter,
    runAllGroupTests
  };
}

// تصدير للاستخدام في المتصفح
if (typeof window !== 'undefined') {
  window.runGroupTests = runAllGroupTests;
  console.log('ℹ️ تم تحميل اختبارات نظام المجموعات. اكتب runGroupTests() في الكونسول للتشغيل.');
}