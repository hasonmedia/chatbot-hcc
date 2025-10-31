import React, { useState, useEffect, useRef } from "react";
import CountdownTimer from "../CountdownTimer"
export const RightPanel = ({ selectedConversation }) => {

    console.log("RightPanel", selectedConversation)
    console.log("-------------------------")
    useEffect(() => {
        console.log("📡 RightPanel - selectedConversation changed:", selectedConversation);
        if (selectedConversation?.customer_data) {
            console.log("✅ Customer data found:", selectedConversation.customer_data);
        } else {
            console.log("❌ No customer data");
        }
    }, [selectedConversation.customer_data]);

    const displayName = selectedConversation.sender_name != null
        ? selectedConversation.sender_name
        : selectedConversation.sender_type === "bot"
            ? "Bot"
            : "Nhân viên";

    // Xử lý customer_data - có thể là object hoặc string JSON
    let customerData = {};
    try {
        if (selectedConversation?.customer_data) {
            // Kiểm tra xem customer_data đã là object hay còn là string
            if (typeof selectedConversation.customer_data === 'string') {
                customerData = JSON.parse(selectedConversation.customer_data);
            } else {
                // Nếu đã là object thì dùng trực tiếp
                customerData = selectedConversation.customer_data;
            }
        }
    } catch (e) {
        console.error("❌ Lỗi xử lý customer_data:", e);
        customerData = {};
    }
    return (
        <div className="w-full lg:w-80 bg-white border-l border-gray-200 overflow-y-auto h-full max-w-sm lg:max-w-none">
            <div className="p-4 space-y-4">
                {/* Header */}
                <div className="border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white"></span>
                        </div>
                        <h3 className="font-semibold text-gray-900">Thông tin chi tiết</h3>
                    </div>
                </div>

                {/* Nguồn tin nhắn */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span>🔗</span>
                        <h4 className="font-medium text-gray-800">Nguồn tin nhắn</h4>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs lg:text-sm font-medium text-gray-600 mb-1">URL nguồn liên hệ:</p>
                                <p className="text-xs text-gray-500 bg-white px-2 lg:px-3 py-1 lg:py-2 rounded-lg border break-all font-mono">
                                    {selectedConversation?.url_channel}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-gray-600">Nền tảng:</p>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                                    {selectedConversation.channel || "N/A"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Thông tin nhân viên */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span>👤</span>
                        <h4 className="font-medium text-gray-800">Thông tin nhân viên</h4>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">
                                    Tiếp nhận hiện tại:
                                </p>
                                <p className="font-medium text-gray-900 bg-white px-3 py-2 rounded border text-sm">
                                    {selectedConversation?.current_receiver || "Bot"}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">
                                    Tiếp nhận trước đó:
                                </p>
                                <p className="text-sm text-gray-500 bg-white px-3 py-2 rounded border italic">
                                    {selectedConversation?.previous_receiver || "Không có"}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-gray-600">Trạng thái:</p>
                                    <span
                                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${selectedConversation.status === "true"
                                            ? "bg-green-100 text-green-700 border border-green-200"
                                            : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                                            }`}
                                    >
                                        <div
                                            className={`w-2 h-2 rounded-full ${selectedConversation.status === "true"
                                                ? "bg-green-500"
                                                : "bg-yellow-500"
                                                }`}
                                        ></div>
                                        {selectedConversation.status === "true" ? "Tự động" : "Thủ công"}
                                    </span>
                                    {selectedConversation.status === "false" && selectedConversation.time && (
                                        <div className="text-center">
                                            <div className="text-lg font-mono font-bold text-yellow-900">
                                                <CountdownTimer endTime={selectedConversation.time} />
                                            </div>
                                        </div>
                                    )}
                                </div>


                            </div>

                        </div>
                    </div>
                </div>

                {/* Thông tin khách hàng */}
                <div>
                    <div className="space-y-3 lg:space-y-4">
                        <div className="flex items-center gap-2 mb-2 lg:mb-3">
                            <span className="text-base lg:text-lg">📋</span>
                            <h4 className="font-semibold text-gray-800 text-sm lg:text-base">Thông tin khách hàng</h4>
                        </div>

                        <div className="space-y-3 lg:space-y-4">
                            {customerData && Object.keys(customerData).length > 0 ? (
                                Object.entries(customerData).map(([key, value]) => (
                                    <div key={key}>
                                        <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                                            {key}:
                                        </label>
                                        <div
                                            className={`px-3 lg:px-4 py-2 lg:py-3 rounded-xl font-semibold border shadow-sm text-xs lg:text-sm
                                                         "bg-gray-100 text-gray-800 border-gray-300"
                                                }`}
                                        >
                                            {value ? value : "Chưa cung cấp"}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="px-3 lg:px-4 py-2 lg:py-3 rounded-xl font-semibold border border-gray-300 text-gray-500 text-xs lg:text-sm shadow-sm">
                                    Chưa có thông tin
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}