import React from 'react';
import { X, Plus, Save, Loader2, Edit3 } from 'lucide-react';

const CustomerConfigForm = ({
    requiredFields,
    setRequiredFields,
    optionalFields,
    setOptionalFields,
    onClose,
    onSave,
    loading
}) => {
    // Thêm trường mới
    const addRequiredField = () => {
        const newField = { id: Date.now(), key: '', label: '' };
        setRequiredFields([...requiredFields, newField]);
    };

    const addOptionalField = () => {
        const newField = { id: Date.now(), key: '', label: '' };
        setOptionalFields([...optionalFields, newField]);
    };

    // Cập nhật trường
    const updateRequiredField = (id, field, value) => {
        setRequiredFields(requiredFields.map(f =>
            f.id === id ? { ...f, [field]: value } : f
        ));
    };

    const updateOptionalField = (id, field, value) => {
        setOptionalFields(optionalFields.map(f =>
            f.id === id ? { ...f, [field]: value } : f
        ));
    };

    // Xóa trường
    const removeRequiredField = (id) => {
        setRequiredFields(requiredFields.filter(f => f.id !== id));
    };

    const removeOptionalField = (id) => {
        setOptionalFields(optionalFields.filter(f => f.id !== id));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Edit3 className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Cập nhật cấu hình khách hàng</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-8">
                    {/* Required Fields */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-6 h-6 bg-red-600 rounded-lg flex items-center justify-center">
                                <span className="text-white text-sm font-bold">!</span>
                            </div>
                            <h3 className="text-lg font-semibold text-red-600">Thông tin bắt buộc</h3>
                        </div>
                        <p className="text-gray-600 mb-4 text-sm">Những thông tin này sẽ được ưu tiên thu thập</p>

                        <div className="space-y-3">
                            {requiredFields.map((field) => (
                                <div key={field.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                    <input
                                        type="text"
                                        value={field.label}
                                        onChange={(e) => updateRequiredField(field.id, 'label', e.target.value)}
                                        placeholder="Tên hiển thị (vd: Họ tên)"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={field.key}
                                        onChange={(e) => updateRequiredField(field.id, 'key', e.target.value)}
                                        placeholder="Field key (vd: ho_ten)"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={field.excel_column_name || ''}
                                        onChange={(e) => updateRequiredField(field.id, 'excel_column_name', e.target.value)}
                                        placeholder="Tên cột Excel"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={field.excel_column_letter || ''}
                                        onChange={(e) => updateRequiredField(field.id, 'excel_column_letter', e.target.value)}
                                        placeholder="Cột (A,B,C...)"
                                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm text-center"
                                        maxLength="2"
                                    />
                                    <button
                                        onClick={() => removeRequiredField(field.id)}
                                        className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={addRequiredField}
                            className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Thêm trường bắt buộc
                        </button>
                    </div>

                    {/* Optional Fields */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-6 h-6 bg-yellow-500 rounded-lg flex items-center justify-center">
                                <span className="text-white text-sm font-bold">?</span>
                            </div>
                            <h3 className="text-lg font-semibold text-yellow-600">Thông tin tùy chọn</h3>
                        </div>
                        <p className="text-gray-600 mb-4 text-sm">Những thông tin này sẽ được thu thập một cách nhẹ nhàng</p>

                        <div className="space-y-3">
                            {optionalFields.map((field) => (
                                <div key={field.id} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <input
                                        type="text"
                                        value={field.label}
                                        onChange={(e) => updateOptionalField(field.id, 'label', e.target.value)}
                                        placeholder="Tên hiển thị (vd: Email)"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={field.key}
                                        onChange={(e) => updateOptionalField(field.id, 'key', e.target.value)}
                                        placeholder="Field key (vd: email)"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-mono text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={field.excel_column_name || ''}
                                        onChange={(e) => updateOptionalField(field.id, 'excel_column_name', e.target.value)}
                                        placeholder="Tên cột Excel"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={field.excel_column_letter || ''}
                                        onChange={(e) => updateOptionalField(field.id, 'excel_column_letter', e.target.value)}
                                        placeholder="Cột (A,B,C...)"
                                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-sm text-center"
                                        maxLength="2"
                                    />
                                    <button
                                        onClick={() => removeOptionalField(field.id)}
                                        className="w-8 h-8 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg flex items-center justify-center transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={addOptionalField}
                            className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Thêm trường tùy chọn
                        </button>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Lưu cấu hình
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerConfigForm;
