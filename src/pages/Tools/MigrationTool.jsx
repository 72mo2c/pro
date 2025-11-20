// ======================================
// Migration Tool - أداة ترحيل البيانات
// ======================================

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { migrateAllBalances } from '../../utils/migrateBalances';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import PageHeader from '../../components/Common/PageHeader';
import { FaDatabase, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const MigrationTool = () => {
  const {
    customers,
    suppliers,
    salesInvoices,
    salesReturns,
    cashReceipts,
    purchaseInvoices,
    purchaseReturns,
    cashDisbursements,
    setCustomers,
    setSuppliers,
    saveData
  } = useData();
  
  const [migrationStatus, setMigrationStatus] = useState('idle'); // idle, running, success, error
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  
  const handleMigration = () => {
    setMigrationStatus('running');
    setError(null);
    
    try {
      const result = migrateAllBalances({
        customers,
        suppliers,
        salesInvoices,
        salesReturns,
        cashReceipts,
        purchaseInvoices,
        purchaseReturns,
        cashDisbursements
      });
      
      // حفظ البيانات المحدثة
      setCustomers(result.updatedCustomers);
      saveData('bero_customers', result.updatedCustomers);
      
      setSuppliers(result.updatedSuppliers);
      saveData('bero_suppliers', result.updatedSuppliers);
      
      setReport(result.report);
      setMigrationStatus('success');
    } catch (err) {
      setError(err.message);
      setMigrationStatus('error');
    }
  };
  
  return (
    <div className="space-y-4">
      <PageHeader 
        title="أداة ترحيل البيانات"
        subtitle="ترحيل أرصدة العملاء والموردين من المعاملات القديمة"
        icon={<FaDatabase />}
      />
      
      <Card>
        <div className="space-y-6">
          {/* معلومات التحذير */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <FaExclamationTriangle className="text-yellow-600 text-xl mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">تحذير هام</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• هذه العملية ستحسب الأرصدة من جميع المعاملات القديمة</li>
                <li>• سيتم إضافة حقل balance لكل عميل ومورد</li>
                <li>• لا تقم بتشغيل هذه الأداة أكثر من مرة</li>
                <li>• يُنصح بعمل نسخة احتياطية قبل التشغيل</li>
              </ul>
            </div>
          </div>
          
          {/* معلومات البيانات */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{customers.length}</div>
              <div className="text-sm text-gray-600">عملاء</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{suppliers.length}</div>
              <div className="text-sm text-gray-600">موردين</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{salesInvoices.length}</div>
              <div className="text-sm text-gray-600">فواتير مبيعات</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{purchaseInvoices.length}</div>
              <div className="text-sm text-gray-600">فواتير مشتريات</div>
            </div>
          </div>
          
          {/* زر التشغيل */}
          <div className="flex justify-center">
            <Button
              onClick={handleMigration}
              disabled={migrationStatus === 'running'}
              className="px-8 py-3"
            >
              {migrationStatus === 'running' ? '⏳ جاري الترحيل...' : '🚀 بدء الترحيل'}
            </Button>
          </div>
          
          {/* التقرير */}
          {migrationStatus === 'success' && report && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <FaCheckCircle className="text-green-600 text-xl" />
                <h3 className="font-semibold text-green-900">تم الترحيل بنجاح!</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">العملاء المُحدَّثون:</span>
                  <span className="font-semibold">{report.customersUpdated}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">الموردون المُحدَّثون:</span>
                  <span className="font-semibold">{report.suppliersUpdated}</span>
                </div>
                <div className="border-t border-green-200 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">إجمالي أرصدة العملاء:</span>
                    <span className="font-semibold text-blue-600">
                      {report.totalBalance.customers.toFixed(2)} جنيه
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">إجمالي أرصدة الموردين:</span>
                    <span className="font-semibold text-green-600">
                      {report.totalBalance.suppliers.toFixed(2)} جنيه
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* الخطأ */}
          {migrationStatus === 'error' && error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FaExclamationTriangle className="text-red-600 text-xl" />
                <h3 className="font-semibold text-red-900">حدث خطأ!</h3>
              </div>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MigrationTool;
