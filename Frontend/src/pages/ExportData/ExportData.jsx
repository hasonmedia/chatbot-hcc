import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Save, Loader2, AlertCircle, CheckCircle, BarChart3, Download, ExternalLink, Edit3, TestTube, Database, Users } from 'lucide-react';
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { format } from "date-fns";
import { getFieldConfig, updateFieldConfig, createFieldConfig, deleteFieldConfig, syncFieldConfigsToSheet } from '../../services/fieldConfigService';
import { getAllKnowledgeBases } from '../../services/knowledgeService';
import { getCustomerInfor } from '../../services/userService';
import TableMapping from '../../components/exportData/TableMapping';
import PageLayout from '../../components/common/PageLayout';
const ExportData = () => {
    const [mappings, setMappings] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });
    const [exportResult, setExportResult] = useState(null);
    const [config, setConfig] = useState([]);
    const [sheet, setSheet] = useState('');
    const [refresh, setRefresh] = useState(0);
    const [activeTab, setActiveTab] = useState('googlesheet');
    const [pendingChanges, setPendingChanges] = useState([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Customer table states
    const [customers, setCustomers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Xử lý customerFields từ config mới (chỉ còn 3 fields)
    const customerFields = [];
    if (Array.isArray(config) && config.length > 0) {
        config.forEach(field => {
            customerFields.push({
                key: field.excel_column_letter, // sử dụng column letter làm key
                label: field.excel_column_name, // sử dụng column name làm label
                required: field.is_required,
                excel_column_name: field.excel_column_name,
                excel_column_letter: field.excel_column_letter
            });
        });
    }
    const loadMapping = async () => {
        try {
            setLoading(true);
            const [sheet, fieldConfigResponse] = await Promise.all([
                getAllKnowledgeBases(),
                getFieldConfig()
            ]);

            console.log('Loaded field config:', fieldConfigResponse);
            setConfig(fieldConfigResponse);
            setSheet(sheet?.customer_id || '');
            // Tạo mapping từ field_config (sử dụng excel_column_letter làm key)
            let mappingData = {};
            if (Array.isArray(fieldConfigResponse) && fieldConfigResponse.length > 0) {
                fieldConfigResponse.forEach((field) => {
                    if (field.excel_column_letter) {
                        mappingData[field.excel_column_letter] = field.excel_column_name;
                    }
                });
                showMessage('success', `Đã tải ${fieldConfigResponse.length} cấu hình cột từ Field Config`);
            } else {
                // Nếu không có data, để mappings rỗng (không tạo default columns)
                showMessage('info', 'Chưa có cấu hình cột nào. Hãy thêm cột mới để bắt đầu.');
            }

            setMappings(mappingData);

            // Clear pending changes khi reload
            setPendingChanges([]);
            setHasUnsavedChanges(false);

        } catch (error) {
            console.error('Error loading mapping:', error);
            showMessage('error', 'Lỗi khi tải mapping: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const savePendingChanges = async () => {
        if (pendingChanges.length === 0) {
            showMessage('info', 'Không có thay đổi nào để lưu');
            return;
        }

        try {
            setLoading(true);
            let successCount = 0;
            const results = [];

            // Xử lý từng pending change một cách tuần tự để đảm bảo sync đúng
            for (const change of pendingChanges) {
                try {
                    let response;
                    if (change.type === 'create') {
                        response = await createFieldConfig({
                            is_required: change.data.is_required,
                            excel_column_name: change.data.excel_column_name,
                            excel_column_letter: change.data.excel_column_letter
                        });
                        results.push({ type: 'create', success: true, data: response.field_config });
                        successCount++;
                    } else if (change.type === 'update') {
                        // Đảm bảo gửi đầy đủ thông tin cho update
                        const updateData = {
                            is_required: change.data.is_required,
                            excel_column_name: change.data.excel_column_name,
                            excel_column_letter: change.data.excel_column_letter
                        };
                        response = await updateFieldConfig(change.id, updateData);
                        results.push({ type: 'update', success: true, id: change.id, data: response });
                        successCount++;
                    } else if (change.type === 'delete') {
                        response = await deleteFieldConfig(change.id);
                        results.push({ type: 'delete', success: true, id: change.id });
                        successCount++;
                    }

                    // Log để debug
                    console.log(`${change.type} completed:`, response);

                } catch (error) {
                    console.error(`Error processing ${change.type}:`, error);
                    results.push({ type: change.type, success: false, error: error.message });
                }
            }

            // Reload lại config từ server để đảm bảo data mới nhất
            console.log('Reloading config from server...');
            const updatedConfig = await getFieldConfig();
            setConfig(updatedConfig);

            // Cập nhật mappings từ config mới
            const newMappings = {};
            updatedConfig.forEach((field) => {
                if (field.excel_column_letter) {
                    newMappings[field.excel_column_letter] = field.excel_column_name;
                }
            });
            setMappings(newMappings);

            // Clear pending changes
            setPendingChanges([]);
            setHasUnsavedChanges(false);

            const totalChanges = pendingChanges.length;
            if (successCount === totalChanges) {
                showMessage('success', `Đã lưu thành công ${successCount} thay đổi và tự động sync headers lên Google Sheets`);
            } else {
                showMessage('warning', `Đã lưu ${successCount}/${totalChanges} thay đổi. Một số thay đổi gặp lỗi.`);
            }

            console.log('Save results:', results);

        } catch (error) {
            console.error('Error saving pending changes:', error);
            showMessage('error', 'Lỗi khi lưu thay đổi: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const openInNewTab = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const showMessage = (type, content) => {
        setMessage({ type, content });
        setTimeout(() => {
            setMessage({ type: '', content: '' });
        }, 5000);
    };

    // Hàm xử lý thêm cột mới - chỉ tạo local state
    const handleAddColumn = () => {
        // Tìm column letter tiếp theo
        const allColumns = [...Object.keys(mappings), ...pendingChanges.filter(p => p.type === 'create').map(p => p.data.excel_column_letter)];
        let nextColumn = 'A';

        if (allColumns.length > 0) {
            // Sắp xếp và lấy column cuối cùng
            const sortedColumns = allColumns.sort();
            const lastColumn = sortedColumns[sortedColumns.length - 1];
            if (lastColumn && lastColumn.charCodeAt(0) < 90) { // Chưa đến Z
                nextColumn = String.fromCharCode(lastColumn.charCodeAt(0) + 1);
            } else {
                // Nếu đã hết alphabet hoặc có lỗi, tìm column trống đầu tiên
                for (let i = 65; i <= 90; i++) { // A-Z
                    const testColumn = String.fromCharCode(i);
                    if (!allColumns.includes(testColumn)) {
                        nextColumn = testColumn;
                        break;
                    }
                }
            }
        }

        // Tạo temporary field config
        const newFieldData = {
            id: `temp_${Date.now()}`, // Temporary ID
            is_required: false,
            excel_column_name: `Cột ${nextColumn}`,
            excel_column_letter: nextColumn
        };

        // Thêm vào pending changes
        setPendingChanges(prev => [...prev, {
            type: 'create',
            data: newFieldData
        }]);

        // Cập nhật local mappings
        setMappings(prev => ({ ...prev, [nextColumn]: newFieldData.excel_column_name }));
        setHasUnsavedChanges(true);

        showMessage('success', `Đã thêm cột ${nextColumn} (chưa lưu)`);
    };

    // Hàm xử lý cập nhật trạng thái bắt buộc - chỉ thay đổi local state
    const handleRequiredChange = (column, isRequired) => {
        // Tìm trong config hoặc pending changes
        const fieldConfig = config.find(f => f.excel_column_letter === column);
        const pendingCreate = pendingChanges.find(p => p.type === 'create' && p.data.excel_column_letter === column);

        if (fieldConfig) {
            // Thêm vào pending changes nếu chưa có
            const existingUpdate = pendingChanges.find(p => p.type === 'update' && p.id === fieldConfig.id);
            if (existingUpdate) {
                // Cập nhật existing pending change
                setPendingChanges(prev => prev.map(p =>
                    p.type === 'update' && p.id === fieldConfig.id
                        ? {
                            ...p,
                            data: {
                                ...fieldConfig, // Giữ nguyên tất cả thông tin gốc
                                is_required: isRequired,
                                excel_column_name: p.data.excel_column_name || fieldConfig.excel_column_name // Giữ nguyên tên cột đã thay đổi
                            }
                        }
                        : p
                ));
            } else {
                // Tạo pending change mới với đầy đủ thông tin
                setPendingChanges(prev => [...prev, {
                    type: 'update',
                    id: fieldConfig.id,
                    data: {
                        ...fieldConfig,
                        is_required: isRequired
                    }
                }]);
            }

            // Cập nhật local config display ngay lập tức
            setConfig(prev => prev.map(f =>
                f.id === fieldConfig.id ? { ...f, is_required: isRequired } : f
            ));
        } else if (pendingCreate) {
            // Cập nhật pending create
            setPendingChanges(prev => prev.map(p =>
                p.type === 'create' && p.data.excel_column_letter === column
                    ? { ...p, data: { ...p.data, is_required: isRequired } }
                    : p
            ));
        }

        setHasUnsavedChanges(true);

        console.log('Required status changed:', { column, isRequired, fieldConfig });
    };

    // Hàm xử lý cập nhật mapping - chỉ thay đổi local state
    const handleMappingChange = (column, newColumnName) => {
        // Tìm trong config hoặc pending changes
        const fieldConfig = config.find(f => f.excel_column_letter === column);
        const pendingCreate = pendingChanges.find(p => p.type === 'create' && p.data.excel_column_letter === column);

        if (fieldConfig) {
            // Thêm vào pending changes nếu chưa có
            const existingUpdate = pendingChanges.find(p => p.type === 'update' && p.id === fieldConfig.id);
            if (existingUpdate) {
                // Cập nhật existing pending change
                setPendingChanges(prev => prev.map(p =>
                    p.type === 'update' && p.id === fieldConfig.id
                        ? {
                            ...p,
                            data: {
                                ...fieldConfig, // Giữ nguyên tất cả thông tin gốc
                                excel_column_name: newColumnName,
                                is_required: p.data.is_required // Giữ nguyên trạng thái required đã thay đổi
                            }
                        }
                        : p
                ));
            } else {
                // Tạo pending change mới với đầy đủ thông tin
                setPendingChanges(prev => [...prev, {
                    type: 'update',
                    id: fieldConfig.id,
                    data: {
                        ...fieldConfig,
                        excel_column_name: newColumnName
                    }
                }]);
            }

            // Cập nhật local config display ngay lập tức
            setConfig(prev => prev.map(f =>
                f.id === fieldConfig.id ? { ...f, excel_column_name: newColumnName } : f
            ));
        } else if (pendingCreate) {
            // Cập nhật pending create
            setPendingChanges(prev => prev.map(p =>
                p.type === 'create' && p.data.excel_column_letter === column
                    ? { ...p, data: { ...p.data, excel_column_name: newColumnName } }
                    : p
            ));
        }

        // Cập nhật local mappings
        setMappings(prev => ({ ...prev, [column]: newColumnName }));
        setHasUnsavedChanges(true);

        console.log('Mapping changed:', { column, newColumnName, fieldConfig });
    };

    // Hàm xử lý xóa cột - chỉ thay đổi local state
    const handleRemoveColumn = (column) => {
        // Tìm trong config hoặc pending changes
        const fieldConfig = config.find(f => f.excel_column_letter === column);
        const pendingCreate = pendingChanges.find(p => p.type === 'create' && p.data.excel_column_letter === column);

        if (fieldConfig) {
            // Thêm vào pending deletes
            setPendingChanges(prev => {
                // Xóa các pending updates cho field này
                const filteredChanges = prev.filter(p => !(p.type === 'update' && p.id === fieldConfig.id));
                // Thêm pending delete
                return [...filteredChanges, {
                    type: 'delete',
                    id: fieldConfig.id,
                    data: fieldConfig
                }];
            });

            // Xóa khỏi local config display
            setConfig(prev => prev.filter(f => f.id !== fieldConfig.id));
        } else if (pendingCreate) {
            // Xóa khỏi pending creates
            setPendingChanges(prev => prev.filter(p => !(p.type === 'create' && p.data.excel_column_letter === column)));
        }

        // Xóa khỏi mappings
        const newMappings = { ...mappings };
        delete newMappings[column];
        setMappings(newMappings);
        setHasUnsavedChanges(true);

        showMessage('success', `Đã xóa cột ${column} (chưa lưu)`);
    };

    useEffect(() => {
        loadMapping();
        // Load customer data
        const fetchCustomerData = async () => {
            const data = await getCustomerInfor();
            setCustomers(data);
        };
        fetchCustomerData();
    }, [refresh]);

    // Tab configuration
    const tabs = [
        {
            id: 'googlesheet',
            name: 'Dữ liệu khách hàng trên GG Sheet',
            icon: Database,
            description: 'Ánh xạ và xuất dữ liệu khách hàng lên Google Sheets'
        },
        {
            id: 'system',
            name: 'Dữ liệu khách hàng trong hệ thống',
            icon: Users,
            description: 'Xem và quản lý dữ liệu khách hàng trong hệ thống'
        }
    ];

    // Customer table calculations
    const totalPages = Math.ceil(customers.length / itemsPerPage);
    const currentData = useMemo(
        () =>
            customers.slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage
            ),
        [customers, currentPage]
    );

    const renderGoogleSheetContent = () => {
        return (
            <div className="space-y-6">
                {/* Message Display */}
                {message.content && (
                    <div className={`p-4 rounded-lg flex items-center gap-3 border ${message.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                        {message.type === 'success'
                            ? <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            : <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        }
                        <span className="font-medium">{message.content}</span>
                    </div>
                )}

                {/* Warning hoặc Empty State */}
                {Object.keys(mappings).length > 0 ? (
                    <>
                        {/* Unsaved Changes Warning */}
                        {hasUnsavedChanges && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <AlertCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-orange-900 mb-1">Có thay đổi chưa lưu</h3>
                                        <p className="text-orange-800 text-sm">
                                            Bạn có {pendingChanges.length} thay đổi chưa được lưu vào database.
                                            Hãy nhấn "Lưu cấu hình" để lưu tất cả thay đổi.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Normal Warning */}
                        {!hasUnsavedChanges && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <span className="text-white text-sm">⚠</span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-blue-900 mb-1">Lưu ý quan trọng</h3>
                                        <p className="text-blue-800 text-sm">
                                            Bạn cần ánh xạ thủ công các trường thông tin với cột Google Sheets để đảm bảo dữ liệu được xuất chính xác.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Database className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có cấu hình cột nào</h3>
                        <p className="text-gray-600 mb-4">
                            Hãy thêm cột đầu tiên để bắt đầu cấu hình ánh xạ dữ liệu với Google Sheets.
                        </p>
                        <button
                            onClick={handleAddColumn}
                            disabled={loading}
                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mx-auto"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                            Thêm cột đầu tiên
                        </button>
                    </div>
                )}

                {/* Action Buttons - chỉ hiển thị khi có data */}
                {Object.keys(mappings).length > 0 && (
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={loadMapping}
                            disabled={loading}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            Tải lại cấu hình
                        </button>
                    </div>
                )}

                {/* Export Result */}
                {exportResult && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-green-800 mb-1">Export thành công!</h3>
                                <p className="text-green-700 text-sm">
                                    Đã export <span className="font-semibold">{exportResult.count}</span> bản ghi sang Google Sheets
                                </p>
                                {exportResult.url && (
                                    <button
                                        onClick={() => openInNewTab(exportResult.url)}
                                        className="mt-2 text-green-600 hover:text-green-800 underline text-sm"
                                    >
                                        Xem file đã export
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Google Sheets Link - chỉ hiển thị khi có data */}
                {Object.keys(mappings).length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Link Google Sheets</h3>
                                <p className="text-gray-600 text-sm">Truy cập trực tiếp đến Google Sheets</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                value={sheet}
                                readOnly
                                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 focus:outline-none font-mono text-sm"
                            />
                            <button
                                onClick={() => openInNewTab(`https://docs.google.com/spreadsheets/d/${sheet}/edit?gid=0#gid=0`)}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                title="Mở trong tab mới"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Mở Sheet
                            </button>
                        </div>
                    </div>
                )}

                {/* Mapping Table - chỉ hiển thị khi có data */}
                {Object.keys(mappings).length > 0 && (
                    <>
                        <TableMapping
                            mappings={mappings}
                            setMappings={setMappings}
                            loading={loading}
                            customerFields={customerFields}
                            onAddColumn={handleAddColumn}
                            onMappingChange={handleMappingChange}
                            onRemoveColumn={handleRemoveColumn}
                            onRequiredChange={handleRequiredChange}
                        />                        {/* Save Mapping Buttons */}
                        <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                            <button
                                onClick={savePendingChanges}
                                disabled={loading || !hasUnsavedChanges}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${hasUnsavedChanges
                                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {hasUnsavedChanges
                                    ? `Lưu cấu hình (${pendingChanges.length} thay đổi)`
                                    : 'Lưu cấu hình'
                                }
                            </button>

                            {!hasUnsavedChanges && (
                                <button
                                    onClick={async () => {
                                        try {
                                            setLoading(true);
                                            await syncFieldConfigsToSheet();
                                            showMessage('success', 'Đã đồng bộ headers lên Google Sheets thành công');
                                        } catch (error) {
                                            showMessage('error', 'Lỗi khi đồng bộ lên Google Sheets: ' + error.message);
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                                    Đồng bộ lên Sheet
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'googlesheet':
                return renderGoogleSheetContent();
            case 'system':
                return (
                    <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 tracking-tight">
                            Customer Information
                        </h2>

                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="min-w-full text-sm text-gray-900">
                                <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-bold uppercase tracking-wider">
                                            Chat Session ID
                                        </th>
                                        <th className="px-6 py-3 text-left font-bold uppercase tracking-wider">
                                            Ngày tạo
                                        </th>
                                        <th className="px-6 py-3 text-left font-bold uppercase tracking-wider">
                                            Thông tin khách hàng
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {currentData.map((cust, index) => {
                                        let data = {};
                                        try {
                                            data =
                                                typeof cust.customer_data === "string"
                                                    ? JSON.parse(cust.customer_data)
                                                    : cust.customer_data || {};
                                        } catch (e) {
                                            console.error("Invalid JSON:", e);
                                        }

                                        return (
                                            <tr
                                                key={cust.id}
                                                className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                                    } hover:bg-blue-50 transition-colors duration-200`}
                                            >
                                                <td className="px-6 py-4 font-bold text-blue-700">
                                                    {cust.chat_session_id}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {format(new Date(cust.created_at), "yyyy-MM-dd HH:mm:ss")}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="grid grid-cols-2 gap-y-2 gap-x-6">
                                                        {customerFields.map((field) => (
                                                            <div key={field.id}>
                                                                <span className="font-bold text-gray-800">
                                                                    {field.excel_column_name}:
                                                                </span>{" "}
                                                                {data[field.excel_column_name] || "N/A"}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-6">
                            <span className="text-sm text-gray-800 font-medium">
                                Page <span className="font-bold">{currentPage}</span> of{" "}
                                <span className="font-bold">{totalPages}</span>
                            </span>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                                >
                                    <FiChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                                >
                                    <FiChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <PageLayout
            title="Quản lý Dữ liệu Khách hàng"
            subtitle="Xuất dữ liệu lên Google Sheets và quản lý dữ liệu trong hệ thống"
            icon={BarChart3}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
        >
            {renderTabContent()}
        </PageLayout>
    );
};

export default ExportData;