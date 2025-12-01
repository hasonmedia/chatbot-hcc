export interface DailyStatistic {
    date: string;
    count: number;
}

export interface ChartData {
    totalMessages: number;
    dailyStatistics: DailyStatistic[];
}

export interface ChartResponse {
    status: string;
    data: ChartData;
}

export interface MessageStatisticsParams {
    startDate: string;
    endDate: string;
}

export interface PlatformStatistics {
    facebook: number;
    telegram: number;
    zalo: number;
    web: number;
}

export interface PlatformStatisticsResponse {
    status: string;
    data: PlatformStatistics;
}

export interface PlatformChartData {
    platform: string;
    count: number;
    fill: string;
}

// Rating types
export interface RatingData {
    totalReviews: number;
    dailyStatistics: DailyStatistic[];
}

export interface RatingResponse {
    status: string;
    data: RatingData;
}

export interface StarStatistics {
    "1_star": number;
    "2_star": number;
    "3_star": number;
    "4_star": number;
    "5_star": number;
}

export interface StarStatisticsResponse {
    status: string;
    data: StarStatistics;
}

export interface StarChartData {
    star: string;
    count: number;
    fill: string;
}
