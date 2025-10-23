import { BarChart3 } from "lucide-react"
import { useState } from "react"

const TableMapping = ({
    mappings,
    setMappings,
    loading,
    customerFields,
    onAddColumn,
    onMappingChange,
    onRemoveColumn,
    onRequiredChange
}) => {
    const [editableColumns, setEditableColumns] = useState([]) // các cột mới thêm được phép sửa
    const [requiredStatus, setRequiredStatus] = useState({}) // lưu trạng thái required của từng cột

    // Kiểm tra xem cột có từ database không (dựa vào customerFields)
    const isColumnFromDatabase = (column) => {
        return customerFields.some(f => f.excel_column_letter === column)
    }

    const handleAddColumn = () => {
        let newColumn = null;

        if (onAddColumn) {
            // callback ngoài có thể trả lại tên cột
            newColumn = onAddColumn()
        } else {
            // fallback logic tự động sinh cột
            const columns = Object.keys(mappings)
            const lastColumn = columns[columns.length - 1] || 'A'
            if (lastColumn.charCodeAt(0) < 90) {
                newColumn = String.fromCharCode(lastColumn.charCodeAt(0) + 1)
                if (!mappings[newColumn]) {
                    setMappings(prev => ({ ...prev, [newColumn]: '' }))
                }
            }
        }

        if (newColumn) {
            // thêm vào danh sách editable để cho nhập
            setEditableColumns(prev => [...prev, newColumn])
        }
    }

    const handleMappingChange = (column, fieldName) => {
        if (onMappingChange) {
            onMappingChange(column, fieldName)
        } else {
            setMappings(prev => ({ ...prev, [column]: fieldName }))
        }
    }

    const handleRequiredChange = (column, isRequired) => {
        // Lưu vào state local
        setRequiredStatus(prev => ({ ...prev, [column]: isRequired }))

        // Gọi callback nếu có
        if (onRequiredChange) {
            onRequiredChange(column, isRequired)
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Bảng ánh xạ chi tiết</h3>
                        <p className="text-gray-600 text-sm">Xem và chỉnh sửa ánh xạ</p>
                    </div>
                </div>
                <button
                    onClick={handleAddColumn}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    + Thêm cột
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b text-sm w-40">Cột Sheet</th>
                            <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b text-sm w-72">Trường ánh xạ</th>
                            <th className="py-3 px-4 text-center font-semibold text-gray-700 border-b text-sm w-32">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(mappings).map((column) => {
                            const mappedFieldName = mappings[column]
                            const fieldInfo = customerFields.find(f => f.excel_column_letter === column)
                            const fromDatabase = isColumnFromDatabase(column)
                            // Chỉ cho sửa nếu KHÔNG phải từ database
                            // const isEditable = !fromDatabase
                            const isEditable = !fromDatabase || editableColumns.includes(column)
                            // Lấy giá trị required: ưu tiên từ state, nếu không có thì lấy từ fieldInfo
                            const isRequired = requiredStatus[column] !== undefined
                                ? requiredStatus[column]
                                : fieldInfo?.required || false

                            return (
                                <tr key={column} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4 border-b w-40">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                                                <span className="font-semibold text-blue-600 text-xs">{column}</span>
                                            </div>
                                            <span className="font-medium text-sm">Cột {column}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 border-b w-72">
                                        <input
                                            type="text"
                                            value={mappedFieldName || ''}
                                            onChange={(e) => handleMappingChange(column, e.target.value)}
                                            placeholder="Nhập tên trường..."
                                            disabled={!isEditable}
                                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-normal ${!isEditable ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                                                }`}
                                            style={{
                                                fontFamily: '"Inter", "Segoe UI", "Arial", sans-serif',
                                                letterSpacing: '0.025em',
                                                lineHeight: '1.5'
                                            }}
                                        />
                                    </td>
                                    <td className="py-3 px-4 text-center border-b w-32">
                                        <select
                                            value={isRequired ? 'required' : 'optional'}
                                            onChange={(e) => handleRequiredChange(column, e.target.value === 'required')}
                                            disabled={!isEditable}
                                            className={`px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs w-full ${!isEditable ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                                                }`}
                                        >
                                            <option value="optional">Tùy chọn</option>
                                            <option value="required">Bắt buộc</option>
                                        </select>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default TableMapping