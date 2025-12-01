"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Calendar as CalendarIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell, Legend } from "recharts";
import type { DateRange } from "react-day-picker";
import { subDays } from "date-fns";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { useChart } from "@/hooks/useChart";
import { usePlatformChart } from "@/hooks/usePlatformChart";
import { formatDateForAPI } from "@/lib/formatDateTime";
import type { PlatformChartData } from "@/types/chart";

const chartConfig = {
    count: {
        label: "Tin nhắn",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;

const pieChartConfig = {
    facebook: {
        label: "Facebook",
        color: "#3B82F6",  // Xanh biển
    },
    telegram: {
        label: "Telegram",
        color: "#22C55E",  // Xanh cây
    },
    zalo: {
        label: "Zalo",
        color: "#FACC15",  // Vàng
    },
    web: {
        label: "Web",
        color: "#EF4444",  // Đỏ
    },
} satisfies ChartConfig;

export default function ChartPage() {
    // Mặc định: 7 ngày gần nhất
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 6),
        to: new Date(),
    });

    const { data, loading, error, refetch } = useChart();
    const { data: platformData, loading: platformLoading, error: platformError, fetchPlatformData } = usePlatformChart();

    // Load data khi component mount hoặc dateRange thay đổi
    useEffect(() => {
        if (dateRange?.from && dateRange?.to) {
            handleFetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFetchData = () => {
        if (dateRange?.from && dateRange?.to) {
            const params = {
                startDate: formatDateForAPI(dateRange.from),
                endDate: formatDateForAPI(dateRange.to),
            };
            refetch(params);
            fetchPlatformData(params);
        }
    };

    // Prepare pie chart data from API response
    const pieChartData: PlatformChartData[] = platformData
        ? [
            { platform: "Facebook", count: platformData.facebook, fill: "#3B82F6" },  // Xanh biển
            { platform: "Telegram", count: platformData.telegram, fill: "#22C55E" },  // Xanh cây
            { platform: "Zalo", count: platformData.zalo, fill: "#FACC15" },          // Vàng
            { platform: "Web", count: platformData.web, fill: "#EF4444" },            // Đỏ
        ]
        : [];

    const totalPlatformMessages = pieChartData.reduce((sum, item) => sum + item.count, 0);

    if (loading || platformLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Đang tải dữ liệu...</div>
            </div>
        );
    }

    if (error || platformError) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-red-500">Lỗi: {error || platformError}</div>
            </div>
        );
    }

    if (!data || !data.dailyStatistics || data.dailyStatistics.length === 0) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Thống kê tin nhắn theo ngày</CardTitle>
                        <CardDescription>
                            Chọn khoảng thời gian để xem thống kê
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <DateRangePicker
                                dateRange={dateRange}
                                onDateRangeChange={setDateRange}
                            />
                            <Button onClick={handleFetchData} disabled={!dateRange?.from || !dateRange?.to}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                Xem thống kê
                            </Button>
                        </div>
                        <div className="text-center py-8 text-muted-foreground">
                            Không có dữ liệu để hiển thị trong khoảng thời gian đã chọn
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Format date to display (DD/MM)
    const chartData = data.dailyStatistics.map((item) => ({
        date: new Date(item.date).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
        }),
        count: item.count,
    }));

    return (
        <div className="space-y-6">
            {/* Filter Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Bộ lọc thời gian</CardTitle>
                    <CardDescription>
                        Chọn khoảng thời gian để xem thống kê chi tiết
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <DateRangePicker
                            dateRange={dateRange}
                            onDateRangeChange={setDateRange}
                        />
                        <Button onClick={handleFetchData} disabled={!dateRange?.from || !dateRange?.to}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            Xem thống kê
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Bar Chart - Messages by Date */}
            <Card>
                <CardHeader>
                    <CardTitle>Thống kê tin nhắn theo ngày</CardTitle>
                    <CardDescription>
                        Tổng số tin nhắn: <span className="font-semibold text-foreground">{data?.totalMessages.toLocaleString("vi-VN") || 0}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {data && data.dailyStatistics && data.dailyStatistics.length > 0 ? (
                        <ChartContainer config={chartConfig}>
                            <BarChart accessibilityLayer data={chartData}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={8} />

                            </BarChart>
                        </ChartContainer>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            Không có dữ liệu để hiển thị trong khoảng thời gian đã chọn
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="flex gap-2 font-medium leading-none">
                        Biểu đồ thống kê tin nhắn theo ngày <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="leading-none text-muted-foreground">
                        Hiển thị số lượng tin nhắn theo từng ngày trong khoảng thời gian đã chọn
                    </div>
                </CardFooter>
            </Card>

            {/* Pie Chart - Messages by Platform */}
            <Card>
                <CardHeader>
                    <CardTitle>Thống kê tin nhắn theo nền tảng</CardTitle>
                    <CardDescription>
                        Tổng số tin nhắn: <span className="font-semibold text-foreground">{totalPlatformMessages.toLocaleString("vi-VN")}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {platformData && totalPlatformMessages > 0 ? (
                        <ChartContainer config={pieChartConfig} className="mx-auto aspect-square max-h-[400px]">
                            <PieChart>
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Pie
                                    data={pieChartData as any}
                                    dataKey="count"
                                    nameKey="platform"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={120}
                                    label={(entry: any) => {
                                        // Chỉ hiển thị label khi count > 0 để tránh đè lên nhau
                                        if (entry.count === 0) return null;
                                        return `${entry.platform}: ${entry.count} (${(entry.percent * 100).toFixed(1)}%)`;
                                    }}
                                    labelLine={true}
                                >
                                    {pieChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Legend />
                            </PieChart>
                        </ChartContainer>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            Không có dữ liệu để hiển thị trong khoảng thời gian đã chọn
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 text-sm">
                    <div className="flex gap-2 font-medium leading-none">
                        Biểu đồ phân bố tin nhắn theo nền tảng <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="leading-none text-muted-foreground">
                        Hiển thị tỷ lệ tin nhắn từ các nền tảng khác nhau
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
