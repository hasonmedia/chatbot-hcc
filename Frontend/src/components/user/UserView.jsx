import { useState } from "react";

export const UserView = ({ user, onClose }) => {
    // Format date function
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            return new Date(dateString).toLocaleString();
        } catch {
            return dateString;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full flex justify-center items-start sm:items-center z-50 p-2 sm:p-4">
            <div className="max-w-sm sm:max-w-lg w-full mx-auto mt-4 sm:mt-0 p-4 sm:p-6 bg-white rounded-lg sm:rounded-2xl shadow-xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-4 sm:mb-6 pb-3 border-b border-gray-200">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">User Information</h2>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl sm:text-xl p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            ×
                        </button>
                    )}
                </div>

                {/* User Info Grid */}
                <div className="space-y-4 sm:space-y-3">
                    {/* ID */}
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                        <span className="font-semibold text-gray-700 text-sm sm:text-base">ID:</span>
                        <span className="text-gray-900 text-sm sm:text-base font-mono">#{user.id}</span>
                    </div>

                    {/* Full Name */}
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                        <span className="font-semibold text-gray-700 text-sm sm:text-base">Full Name:</span>
                        <span className="text-gray-900 text-sm sm:text-base font-medium sm:text-right break-words">
                            {user.full_name}
                        </span>
                    </div>

                    {/* Username */}
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                        <span className="font-semibold text-gray-700 text-sm sm:text-base">Username:</span>
                        <span className="text-gray-900 text-sm sm:text-base font-mono break-all">
                            {user.username}
                        </span>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                        <span className="font-semibold text-gray-700 text-sm sm:text-base">Email:</span>
                        <span className="text-gray-900 text-sm sm:text-base break-all">
                            {user.email}
                        </span>
                    </div>

                    {/* Role */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                        <span className="font-semibold text-gray-700 text-sm sm:text-base">Role:</span>
                        <span className="capitalize px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm w-fit">
                            {user.role}
                        </span>
                    </div>

                    {/* Company ID */}
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                        <span className="font-semibold text-gray-700 text-sm sm:text-base">Company ID:</span>
                        <span className="text-gray-900 text-sm sm:text-base font-mono">#{user.company_id}</span>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                        <span className="font-semibold text-gray-700 text-sm sm:text-base">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs sm:text-sm w-fit ${user.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                            }`}>
                            {user.is_active ? "Active" : "Inactive"}
                        </span>
                    </div>

                    {/* Divider for timestamps */}
                    <div className="border-t border-gray-200 pt-3 mt-4"></div>

                    {/* Created */}
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                        <span className="font-semibold text-gray-700 text-sm sm:text-base">Created:</span>
                        <span className="text-gray-600 text-xs sm:text-sm font-mono break-words sm:text-right">
                            {formatDate(user.created_at)}
                        </span>
                    </div>

                    {/* Last Login */}
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                        <span className="font-semibold text-gray-700 text-sm sm:text-base">Last Login:</span>
                        <span className="text-gray-600 text-xs sm:text-sm font-mono break-words sm:text-right">
                            {formatDate(user.last_login)}
                        </span>
                    </div>
                </div>

                {/* Optional: Action buttons footer */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto sm:px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm sm:text-base"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};