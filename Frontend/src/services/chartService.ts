import axiosClient from "@/config/axios";
import type {
    ChartResponse,
    MessageStatisticsParams,
    PlatformStatisticsResponse,
    RatingResponse,
    StarStatisticsResponse
} from "@/types/chart";
import { API_ENDPOINT } from "@/constants/apiEndpoint";

export const chartService = {
    getMessageStatistics: async (): Promise<ChartResponse> => {
        const response = await axiosClient.get<ChartResponse>(
            API_ENDPOINT.CHAT.COUNT_MESSAGES_BY_CHANNEL
        );
        return response.data;
    },

    getMessageStatisticsByTime: async (
        params: MessageStatisticsParams
    ): Promise<ChartResponse> => {
        const response = await axiosClient.get<ChartResponse>(
            API_ENDPOINT.CHAT.GET_MESSAGE_STATISTICS,
            {
                params: {
                    startDate: params.startDate,
                    endDate: params.endDate,
                },
            }
        );
        return response.data;
    },

    getPlatformStatistics: async (
        params: MessageStatisticsParams
    ): Promise<PlatformStatisticsResponse> => {
        const response = await axiosClient.get<PlatformStatisticsResponse>(
            API_ENDPOINT.CHAT.GET_PLATFORM_STATISTICS,
            {
                params: {
                    startDate: params.startDate,
                    endDate: params.endDate,
                },
            }
        );
        return response.data;
    },

    getRatingStatistics: async (
        params: MessageStatisticsParams
    ): Promise<RatingResponse> => {
        const response = await axiosClient.get<RatingResponse>(
            API_ENDPOINT.CHAT.GET_RATING_STATISTICS,
            {
                params: {
                    startDate: params.startDate,
                    endDate: params.endDate,
                },
            }
        );
        return response.data;
    },

    getStarStatistics: async (
        params: MessageStatisticsParams
    ): Promise<StarStatisticsResponse> => {
        const response = await axiosClient.get<StarStatisticsResponse>(
            API_ENDPOINT.CHAT.GET_STAR_STATISTICS,
            {
                params: {
                    startDate: params.startDate,
                    endDate: params.endDate,
                },
            }
        );
        return response.data;
    },
};
