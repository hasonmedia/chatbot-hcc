import React from 'react'
import { Edit, Trash2 } from 'lucide-react'
const TagGrid = ({ filteredTags, loading, handleEdit, handleDelete }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {loading ? (
                <div className="p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading...</p>
                </div>
            ) : filteredTags.length === 0 ? (
                <div className="p-8 text-center">
                    <p className="text-gray-500">No tags found</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-6 font-medium text-gray-900">ID</th>
                                <th className="text-left py-3 px-6 font-medium text-gray-900">Name</th>
                                <th className="text-left py-3 px-6 font-medium text-gray-900">Description</th>
                                <th className="text-left py-3 px-6 font-medium text-gray-900">Color</th>
                                <th className="text-right py-3 px-6 font-medium text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredTags.map((tag) => (
                                <tr key={tag.id} className="hover:bg-gray-50">
                                    <td className="py-4 px-6 text-sm text-gray-900">#{tag.id}</td>
                                    <td className="py-4 px-6">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {tag.name}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-600 max-w-md">
                                        <p className="truncate">{tag.description || '-'}</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {tag.color}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(tag)}
                                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit tag"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(tag.id)}
                                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete tag"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default TagGrid