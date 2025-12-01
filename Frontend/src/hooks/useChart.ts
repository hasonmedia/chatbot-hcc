import { useState, useEffect } from "react";
import { chartService } from "@/services/chartService";
import type { ChartData, MessageStatisticsParams } from "@/types/chart";

export const useChart = (params?: MessageStatisticsParams) => {
    const [data, setData] = useState<ChartData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchChartData = async (customParams?: MessageStatisticsParams) => {
        try {
            setLoading(true);
            setError(null);

            let response;
            if (customParams || params) {
                response = await chartService.getMessageStatisticsByTime(
                    customParams || params!
                );
            } else {
                response = await chartService.getMessageStatistics();
            }

            if (response.status === "success") {
                setData(response.data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            console.error("Error fetching chart data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChartData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        data,
        loading,
        error,
        refetch: fetchChartData,
    };
};
