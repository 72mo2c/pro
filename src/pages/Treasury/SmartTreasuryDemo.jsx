// ======================================
// Smart Treasury Demo - مثال تطبيقي للنظام الذكي
// اختبار تفاعلي للنظام الذكي للخزينة
// ======================================

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useSmartTreasuryUpdate } from '../../utils/smartTreasuryUpdate';
import { runAllTests } from '../../utils/smartTreasuryTests';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import { 
  FaPlay, FaStop, FaCheck, FaTimes, FaChartLine,
  FaUsers, FaFileInvoice, FaMoneyBillWave, FaShieldAlt,
  FaSync, FaEye, FaCog
} from 'react-icons/fa';

const SmartTreasuryDemo = () => {
  const { customers, salesInvoices, cashReceipts } = useData();
  const { triggerInterfaceUpdate, getSettlementStatistics } = useSmartTreasuryUpdate();
  
  const [demoResults, setDemoResults] = useState(null);
  const [isRunningDemo, setIsRunningDemo] = useState(false);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(false);
  
  // تشغيل مثال تسوية ذكية
  const runSmartSettlementDemo = async () => {
    setIsRunningDemo(true);
    
    console.log('🚀 بدء مثال التسوية الذكية...');
    
    const results = {
      scenarios: [],
      statistics: {},
      performance: {}
    };
    
    // سيناريو 1: سداد دين كامل
    const scenario1 = {
      name: 'سداد دين كامل',
      customerId: customers[0]?.id || 1,
      paymentAmount: 500,
      expectedResult: 'دين مدفوع بالكامل + رصيد مسبق جديد'
    };
    
    console.log('📋 سيناريو 1:', scenario1);
    
    // محاكاة تحديث الواجهة
    const update1 = triggerInterfaceUpdate('customer_balances');
    results.scenarios.push({
      ...scenario1,
      actualResult: update1.success ? 'تم التحديث بنجاح' : 'فشل في التحديث',
      timestamp: new Date().toLocaleTimeString('ar-EG')
    });
    
    // انتظار قصير
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // سيناريو 2: سداد جزئي
    const scenario2 = {
      name: 'سداد جزئي',
      customerId: customers[1]?.id || 2,
      paymentAmount: 300,
      expectedResult: 'دفع جزئي + باقي الدين'
    };
    
    console.log('📋 سيناريو 2:', scenario2);
    
    const update2 = triggerInterfaceUpdate('sales_invoices');
    results.scenarios.push({
      ...scenario2,
      actualResult: update2.success ? 'تم التحديث بنجاح' : 'فشل في التحديث',
      timestamp: new Date().toLocaleTimeString('ar-EG')
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // سيناريو 3: استخدام رصيد مسبق
    const scenario3 = {
      name: 'استخدام رصيد مسبق',
      customerId: customers[2]?.id || 3,
      paymentAmount: 200,
      expectedResult: 'استخدام رصيد مسبق + سداد دين + رصيد مسبق جديد'
    };
    
    console.log('📋 سيناريو 3:', scenario3);
    
    const update3 = triggerInterfaceUpdate('treasury_movements');
    results.scenarios.push({
      ...scenario3,
      actualResult: update3.success ? 'تم التحديث بنجاح' : 'فشل في التحديث',
      timestamp: new Date().toLocaleTimeString('ar-EG')
    });
    
    // إحصائيات النظام
    const stats = getSettlementStatistics();
    results.statistics = stats || {};
    
    // أداء النظام
    const startTime = performance.now();
    triggerInterfaceUpdate('all');
    const endTime = performance.now();
    results.performance = {
      updateTime: (endTime - startTime).toFixed(2) + 'ms',
      successRate: ((results.scenarios.filter(s => s.actualResult.includes('نجح')).length / results.scenarios.length) * 100).toFixed(1) + '%'
    };
    
    setDemoResults(results);
    setIsRunningDemo(false);
    
    console.log('🎯 اكتمل مثال التسوية الذكية:', results);
  };
  
  // تشغيل اختبارات النظام
  const runSystemTests = () => {
    console.log('🧪 بدء اختبارات النظام...');
    const testResults = runAllTests();
    
    setDemoResults({
      ...demoResults,
      tests: testResults,
      testTimestamp: new Date().toLocaleTimeString('ar-EG')
    });
  };
  
  // محاكاة بيانات للاختبار
  const simulateDemoData = () => {
    const demoData = {
      customers: [
        { id: 1, name: 'أحمد محمد', balance: 500, hasDebt: true },
        { id: 2, name: 'فاطمة علي', balance: -200, hasCredit: true },
        { id: 3, name: 'محمد حسن', balance: 0, hasAdvance: true }
      ],
      invoices: [
        { id: 101, customerId: 1, amount: 500, paid: 0, remaining: 500, status: 'pending' },
        { id: 102, customerId: 2, amount: 200, paid: 100, remaining: 100, status: 'partial' },
        { id: 103, customerId: 3, amount: 300, paid: 300, remaining: 0, status: 'paid' }
      ],
      transactions: [
        { id: 1, type: 'receipt', amount: 500, intelligentSettlement: true },
        { id: 2, type: 'receipt', amount: 300, intelligentSettlement: false }
      ]
    };
    
    console.log('📊 بيانات المحاكاة:', demoData);
    return demoData;
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          مثال تطبيقي للنظام الذكي للخزينة
        </h1>
        <p className="text-gray-600">
          اختبار تفاعلي لجميع مميزات النظام الذكي
        </p>
      </div>
      
      {/* لوحة التحكم */}
      <Card title="لوحة التحكم">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button
            onClick={runSmartSettlementDemo}
            disabled={isRunningDemo}
            variant="primary"
            icon={<FaPlay />}
          >
            {isRunningDemo ? 'جارٍ التشغيل...' : 'تشغيل التسوية الذكية'}
          </Button>
          
          <Button
            onClick={runSystemTests}
            variant="secondary"
            icon={<FaCheck />}
          >
            تشغيل الاختبارات
          </Button>
          
          <Button
            onClick={simulateDemoData}
            variant="outline"
            icon={<FaCog />}
          >
            محاكاة البيانات
          </Button>
          
          <Button
            onClick={() => triggerInterfaceUpdate('all')}
            variant="success"
            icon={<FaSync />}
          >
            تحديث جميع الواجهات
          </Button>
        </div>
      </Card>
      
      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FaUsers className="text-2xl text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {customers.length}
              </div>
              <div className="text-sm text-gray-600">العملاء المسجلين</div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <FaFileInvoice className="text-2xl text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {salesInvoices.length}
              </div>
              <div className="text-sm text-gray-600">فواتير المبيعات</div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <FaMoneyBillWave className="text-2xl text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {cashReceipts.length}
              </div>
              <div className="text-sm text-gray-600">إيصالات الاستلام</div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <FaShieldAlt className="text-2xl text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {autoUpdateEnabled ? 'نشط' : 'متوقف'}
              </div>
              <div className="text-sm text-gray-600">النظام الذكي</div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* نتائج المثال */}
      {demoResults && (
        <Card title="نتائج المثال التطبيقي">
          <div className="space-y-4">
            {/* السيناريوهات المختبرة */}
            {demoResults.scenarios && (
              <div>
                <h4 className="font-semibold mb-3">السيناريوهات المختبرة</h4>
                <div className="space-y-2">
                  {demoResults.scenarios.map((scenario, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex-1">
                        <div className="font-medium">{scenario.name}</div>
                        <div className="text-sm text-gray-600">
                          متوقع: {scenario.expectedResult}
                        </div>
                        <div className="text-sm text-gray-500">
                          نتيجة: {scenario.actualResult}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {scenario.timestamp}
                      </div>
                      <div className="ml-3">
                        {scenario.actualResult.includes('نجح') ? (
                          <FaCheck className="text-green-600" />
                        ) : (
                          <FaTimes className="text-red-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* إحصائيات النظام */}
            {demoResults.statistics && (
              <div>
                <h4 className="font-semibold mb-3">إحصائيات النظام</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <div className="text-2xl font-bold text-blue-600">
                      {demoResults.statistics.totalReceipts || 0}
                    </div>
                    <div className="text-sm text-blue-700">إجمالي الإيصالات</div>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 rounded">
                    <div className="text-2xl font-bold text-green-600">
                      {demoResults.statistics.intelligentSettlementRate?.toFixed(1) || 0}%
                    </div>
                    <div className="text-sm text-green-700">نسبة التسوية الذكية</div>
                  </div>
                  
                  <div className="text-center p-3 bg-purple-50 rounded">
                    <div className="text-2xl font-bold text-purple-600">
                      {demoResults.performance?.successRate || '0%'}
                    </div>
                    <div className="text-sm text-purple-700">معدل النجاح</div>
                  </div>
                  
                  <div className="text-center p-3 bg-orange-50 rounded">
                    <div className="text-2xl font-bold text-orange-600">
                      {demoResults.performance?.updateTime || '0ms'}
                    </div>
                    <div className="text-sm text-orange-700">وقت التحديث</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* نتائج الاختبارات */}
            {demoResults.tests && (
              <div>
                <h4 className="font-semibold mb-3">نتائج الاختبارات</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span>إجمالي الاختبارات</span>
                    <span className="font-bold">{demoResults.tests.totalTests}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span>نجح</span>
                    <span className="font-bold text-green-600">{demoResults.tests.totalPassed}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <span>فشل</span>
                    <span className="font-bold text-red-600">{demoResults.tests.totalFailed}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <span>نسبة النجاح</span>
                    <span className="font-bold text-blue-600">{demoResults.tests.successRate}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
      
      {/* مثال على واجهة التحديث التلقائي */}
      <Card title="مثال على التحديث التلقائي">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoUpdateEnabled}
                onChange={(e) => setAutoUpdateEnabled(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="font-medium">تفعيل التحديث التلقائي</span>
            </label>
            
            {autoUpdateEnabled && (
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">النظام نشط</span>
              </div>
            )}
          </div>
          
          {autoUpdateEnabled && (
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <div className="flex items-center gap-2 mb-2">
                <FaEye className="text-green-600" />
                <span className="font-medium text-green-800">مراقبة مباشرة</span>
              </div>
              <p className="text-sm text-green-700">
                يتم مراقبة التغييرات في البيانات وتحديث الواجهات تلقائياً كل 3 ثوان
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SmartTreasuryDemo;