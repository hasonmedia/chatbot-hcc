"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Calendar as CalendarIcon, Star } from "lucide-react";
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
import { useChartRating } from "@/hooks/useChartRating";
import { formatDateForAPI } from "@/lib/formatDateTime";
import type { StarChartData } from "@/types/chart";

const chartConfig = {
    count: {
        label: "Đánh giá",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;

const pieChartConfig = {
    "1_star": {
        label: "1 Sao",
        color: "#EF4444", // Red
    },
    "2_star": {
        label: "2 Sao",
        color: "#F97316", // Orange
    },
    "3_star": {
        label: "3 Sao",
        color: "#EAB308", // Yellow
    },
    "4_star": {
        label: "4 Sao",
        color: "#84CC16", // Lime
    },
    "5_star": {
        label: "5 Sao",
        color: "#22C55E", // Green
    },
} satisfies ChartConfig;

export default function ChartRating() {
    // Mặc định: 7 ngày gần nhất
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 6),
        to: new Date(),
    });

    const { ratingData, starData, loading, error, fetchRatingData } = useChartRating();

    // Load data khi component mount
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
            fetchRatingData(params);
        }
    };

    // Prepare pie chart data
    const pieChartData: StarChartData[] = starData
        ? [
            { star: "1 Sao", count: starData["1_star"], fill: "#EF4444" },
            { star: "2 Sao", count: starData["2_star"], fill: "#F97316" },
            { star: "3 Sao", count: starData["3_star"], fill: "#EAB308" },
            { star: "4 Sao", count: starData["4_star"], fill: "#84CC16" },
            { star: "5 Sao", count: starData["5_star"], fill: "#22C55E" },
        ]
        : [];

    const totalStarRatings = pieChartData.reduce((sum, item) => sum + item.count, 0);

    // Format date to display (DD/MM)
    const chartData = ratingData?.dailyStatistics.map((item) => ({
        date: new Date(item.date).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
        }),
        count: item.count,
    })) || [];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg">Đang tải dữ liệu...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg text-red-500">Lỗi: {error}</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filter Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        Bộ lọc thời gian
                    </CardTitle>
                    <CardDescription>
                        Chọn khoảng thời gian để xem thống kê đánh giá
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

            {/* Bar Chart - Ratings by Date */}
            <Card>
                <CardHeader>
                    <CardTitle>Thống kê đánh giá theo ngày</CardTitle>
                    <CardDescription>
                        Tổng số đánh giá: <span className="font-semibold text-foreground">{ratingData?.totalReviews.toLocaleString("vi-VN") || 0}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {ratingData && ratingData.dailyStatistics && ratingData.dailyStatistics.length > 0 ? (
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
                        Biểu đồ thống kê đánh giá theo ngày <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="leading-none text-muted-foreground">
                        Hiển thị số lượng đánh giá theo từng ngày trong khoảng thời gian đã chọn
                    </div>
                </CardFooter>
            </Card>

            {/* Pie Chart - Ratings by Star */}
            <Card>
                <CardHeader>
                    <CardTitle>Thống kê đánh giá theo số sao</CardTitle>
                    <CardDescription>
                        Tổng số đánh giá: <span className="font-semibold text-foreground">{totalStarRatings.toLocaleString("vi-VN")}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {starData && totalStarRatings > 0 ? (
                        <ChartContainer config={pieChartConfig} className="mx-auto aspect-square max-h-[400px]">
                            <PieChart>
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Pie
                                    data={pieChartData as any}
                                    dataKey="count"
                                    nameKey="star"
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
                        Biểu đồ phân bố đánh giá theo số sao <Star className="h-4 w-4" />
                    </div>
                    <div className="leading-none text-muted-foreground">
                        Hiển thị tỷ lệ đánh giá từ 1 đến 5 sao
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
