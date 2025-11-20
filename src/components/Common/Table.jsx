// ======================================
// Table Component - مكون الجدول
// ======================================

import React from 'react';
import Button from './Button';
import { FaEye, FaTrash, FaEdit, FaUndo, FaInbox } from 'react-icons/fa';

const Table = ({ columns, data, onEdit, onDelete, onView, onReturn, onRowDoubleClick, actions = true }) => {
  return (
    <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-4 text-right text-sm font-semibold text-gray-700 border-b border-gray-200 last:border-l-0"
                >
                  <div className="flex items-center justify-end gap-2">
                    {column.icon && <span className="text-gray-500">{column.icon}</span>}
                    <span>{column.header}</span>
                  </div>
                </th>
              ))}
              {actions && (
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 border-b border-gray-200">
                  الإجراءات
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data && data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className="hover:bg-blue-50 transition-colors duration-150 cursor-pointer"
                  onDoubleClick={() => onRowDoubleClick && onRowDoubleClick(row)}
                  title={onRowDoubleClick ? "اضغط مرتين لعرض التفاصيل" : ""}
                >
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center justify-end">
                        {column.render ? column.render(row) : (
                          <span className={`font-medium ${
                            column.className || ''
                          }`}>
                            {row[column.accessor]}
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2 justify-end">
                        {onView && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => onView(row)}
                            className="hover:bg-blue-100 hover:border-blue-300"
                          >
                            <FaEye className="text-xs ml-1" />
                            عرض
                          </Button>
                        )}
                        {onReturn && (
                          <Button 
                            variant="warning" 
                            size="sm" 
                            onClick={() => onReturn(row)}
                          >
                            <FaUndo className="text-xs ml-1" />
                            إرجاع
                          </Button>
                        )}
                        {onEdit && (
                          <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={() => onEdit(row)}
                          >
                            <FaEdit className="text-xs ml-1" />
                            تعديل
                          </Button>
                        )}
                        {onDelete && (
                          <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => onDelete(row)}
                          >
                            <FaTrash className="text-xs ml-1" />
                            حذف
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={columns.length + (actions ? 1 : 0)} 
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center gap-3">
                    <FaInbox className="text-4xl text-gray-300" />
                    <div className="text-lg font-medium">لا توجد بيانات للعرض</div>
                    <div className="text-sm text-gray-400">جرب تغيير فلاتر البحث أو إضافة بيانات جديدة</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
