import { Save, X } from 'lucide-react'
import { useEffect } from 'react';
const ModelTag = ({ editingTag, closeModal, formData, setFormData, handleSubmit, loading }) => {

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {editingTag ? 'Edit Tag' : 'Add New Tag'}
                    </h2>
                    <button
                        onClick={closeModal}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tag Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter tag name"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter tag description (optional)"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Color
                        </label>
                        <input
                            type="color"
                            value={formData.color}
                            onChange={(e) =>
                                setFormData({ ...formData, color: e.target.value })
                            }
                            className="w-16 h-10 p-1 border border-gray-300 rounded-lg cursor-pointer"
                        />
                        <span className="ml-3 text-sm text-gray-600">
                            {formData.color}
                        </span>
                    </div>

                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {loading ? 'Saving...' : editingTag ? 'Update' : 'Create'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ModelTag