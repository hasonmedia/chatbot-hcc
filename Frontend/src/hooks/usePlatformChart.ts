import { useState } from "react";
import { chartService } from "@/services/chartService";
import type { PlatformStatistics, MessageStatisticsParams } from "@/types/chart";

export const usePlatformChart = () => {
  const [data, setData] = useState<PlatformStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlatformData = async (params: MessageStatisticsParams) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await chartService.getPlatformStatistics(params);
      
      if (response.status === "success") {
        setData(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching platform data:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    fetchPlatformData,
  };
};
