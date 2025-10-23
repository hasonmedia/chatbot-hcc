import React, { useState, useEffect, useMemo } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { format } from "date-fns";
import { getCustomerInfor } from "../../services/userService";

const CustomerTable = () => {
    const [customers, setCustomers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchData = async () => {
            const data = await getCustomerInfor();
            setCustomers(data);
        };
        fetchData();
    }, []);

    const totalPages = Math.ceil(customers.length / itemsPerPage);

    const currentData = useMemo(
        () =>
            customers.slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage
            ),
        [customers, currentPage]
    );

    return (
        <div className="p-3 sm:p-6 bg-gradient-to-br from-white to-gray-50 rounded-lg sm:rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 tracking-tight px-1 sm:px-0">
                Customer Information
            </h2>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full text-sm text-gray-900">
                    <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                        <tr>
                            <th className="px-4 xl:px-6 py-3 text-left font-bold uppercase tracking-wider text-xs xl:text-sm">
                                Chat Session ID
                            </th>
                            <th className="px-4 xl:px-6 py-3 text-left font-bold uppercase tracking-wider text-xs xl:text-sm">
                                Ngày tạo
                            </th>
                            <th className="px-4 xl:px-6 py-3 text-left font-bold uppercase tracking-wider text-xs xl:text-sm">
                                Thông tin khách hàng
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {currentData.map((cust, index) => (
                            <tr
                                key={cust.id}
                                className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                    } hover:bg-blue-50 transition-colors duration-200`}
                            >
                                <td className="px-4 xl:px-6 py-4 font-bold text-blue-700">
                                    {cust.chat_session_id}
                                </td>
                                <td className="px-4 xl:px-6 py-4 font-medium text-gray-900">
                                    {format(new Date(cust.created_at), "yyyy-MM-dd HH:mm:ss")}
                                </td>
                                <td className="px-4 xl:px-6 py-4">
                                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 xl:gap-x-6">
                                        <div>
                                            <span className="font-bold text-gray-800">Name:</span>{" "}
                                            {cust.customer_data?.name || "N/A"}
                                        </div>
                                        <div>
                                            <span className="font-bold text-gray-800">Email:</span>{" "}
                                            {cust.customer_data?.email || "N/A"}
                                        </div>
                                        <div>
                                            <span className="font-bold text-gray-800">Phone:</span>{" "}
                                            {cust.customer_data?.phone || "N/A"}
                                        </div>
                                        <div>
                                            <span className="font-bold text-gray-800">Address:</span>{" "}
                                            {cust.customer_data?.address || "N/A"}
                                        </div>
                                        <div>
                                            <span className="font-bold text-gray-800">Class:</span>{" "}
                                            {cust.customer_data?.class || "N/A"}
                                        </div>
                                        <div>
                                            <span className="font-bold text-gray-800">Registration:</span>{" "}
                                            {cust.customer_data?.registration?.toString() || "N/A"}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Tablet Horizontal Scroll Table */}
            <div className="hidden md:block lg:hidden">
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <div className="min-w-[800px]">
                        <table className="w-full text-sm text-gray-900">
                            <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-xs">
                                        Session ID
                                    </th>
                                    <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-xs">
                                        Ngày tạo
                                    </th>
                                    <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-xs">
                                        Thông tin KH
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {currentData.map((cust, index) => (
                                    <tr
                                        key={cust.id}
                                        className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                            } hover:bg-blue-50 transition-colors duration-200`}
                                    >
                                        <td className="px-4 py-4 font-bold text-blue-700 text-xs">
                                            {cust.chat_session_id}
                                        </td>
                                        <td className="px-4 py-4 font-medium text-gray-900 text-xs">
                                            {format(new Date(cust.created_at), "MM/dd HH:mm")}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="grid grid-cols-2 gap-y-1 gap-x-3 text-xs">
                                                <div><span className="font-bold">Name:</span> {cust.customer_data?.name || "N/A"}</div>
                                                <div><span className="font-bold">Email:</span> {cust.customer_data?.email || "N/A"}</div>
                                                <div><span className="font-bold">Phone:</span> {cust.customer_data?.phone || "N/A"}</div>
                                                <div><span className="font-bold">Class:</span> {cust.customer_data?.class || "N/A"}</div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {currentData.map((cust, index) => (
                    <div key={cust.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                        {/* Card Header */}
                        <div className="mb-3 pb-3 border-b border-gray-200">
                            <div className="flex flex-col gap-2">
                                <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Session ID</span>
                                    <p className="font-bold text-blue-700 text-sm mt-1">{cust.chat_session_id}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày tạo</span>
                                    <p className="font-medium text-gray-900 text-sm mt-1">
                                        {format(new Date(cust.created_at), "dd/MM/yyyy HH:mm")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Thông tin khách hàng
                            </h3>
                            <div className="grid grid-cols-1 gap-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-700">Name:</span>
                                    <span className="text-gray-900 break-words text-right ml-2">
                                        {cust.customer_data?.name || "N/A"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-700">Email:</span>
                                    <span className="text-gray-900 break-all text-right ml-2">
                                        {cust.customer_data?.email || "N/A"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-700">Phone:</span>
                                    <span className="text-gray-900 text-right ml-2">
                                        {cust.customer_data?.phone || "N/A"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-700">Address:</span>
                                    <span className="text-gray-900 break-words text-right ml-2">
                                        {cust.customer_data?.address || "N/A"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-700">Class:</span>
                                    <span className="text-gray-900 text-right ml-2">
                                        {cust.customer_data?.class || "N/A"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-700">Registration:</span>
                                    <span className="text-gray-900 text-right ml-2">
                                        {cust.customer_data?.registration?.toString() || "N/A"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 sm:mt-6 gap-3 sm:gap-0">
                <span className="text-sm text-gray-800 font-medium order-2 sm:order-1">
                    Page <span className="font-bold">{currentPage}</span> of{" "}
                    <span className="font-bold">{totalPages}</span>
                </span>
                <div className="flex items-center space-x-3 order-1 sm:order-2">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    >
                        <FiChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-medium text-gray-600 px-2">
                        {currentPage} / {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    >
                        <FiChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Empty State */}
            {customers.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl text-gray-500">👥</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Chưa có dữ liệu khách hàng</h3>
                    <p className="text-gray-500 text-sm">Dữ liệu sẽ hiển thị khi có khách hàng tương tác</p>
                </div>
            )}
        </div>
    );
};

export default CustomerTable;