import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";
import { ArrowUp, ArrowDown } from "lucide-react";
import { count_message_by_channel } from "../../services/messengerService";
import { useEffect, useState } from "react";

export default function Chart() {
  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await count_message_by_channel();

        // Gán dữ liệu trả về
        setBarData(data.barData || []);
        setLineData(data.lineData || []);
        setPieData(data.pieData || []);
        setTableData(data.tableData || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p className="text-center mt-8">Đang tải dữ liệu...</p>;
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Thống kê tin nhắn đa kênh</h1>
        <div className="flex flex-wrap gap-2">
          <select className="border rounded-lg px-3 py-2">
            <option>Tuần</option>
            <option>Tháng</option>
            <option>Quý</option>
          </select>
          <button className="border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-100">Facebook</button>
          <button className="border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-100">Zalo</button>
          <button className="border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-100">Web</button>
        </div>
      </div>


      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow-md rounded-2xl p-4">
          <h2 className="font-semibold mb-2">Tin nhắn theo kênh</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="channel" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="messages" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white shadow-md rounded-2xl p-4">
          <h2 className="font-semibold mb-2">Xu hướng tin nhắn</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={lineData}>
              <XAxis dataKey="channel" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="facebook" stroke="#3b82f6" />
              <Line type="monotone" dataKey="zalo" stroke="#10b981" />
              <Line type="monotone" dataKey="web" stroke="#f59e0b" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-2xl p-4 mb-6">
        <h2 className="font-semibold mb-2">Tỉ lệ tin nhắn theo kênh</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-white shadow-md rounded-2xl p-4">
        <h2 className="font-semibold mb-2">Chi tiết khách hàng</h2>
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Kênh</th>
              <th className="p-2">Khách hàng</th>
              <th className="p-2">Tin nhắn</th>
              <th className="p-2">% thay đổi</th>
              <th className="p-2">Xu hướng</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row) => (
              <tr key={row.channel} className="border-b">
                <td className="p-2">{row.channel}</td>
                <td className="p-2">{row.customers}</td>
                <td className="p-2">{row.messages}</td>
                <td className={`p-2 ${row.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {row.change}%
                </td>
                <td className="p-2">
                  {row.change >= 0 ? <ArrowUp className="text-green-600" /> : <ArrowDown className="text-red-600" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
