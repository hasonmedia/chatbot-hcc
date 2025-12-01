import { useState } from "react";
import { chartService } from "@/services/chartService";
import type { RatingData, StarStatistics, MessageStatisticsParams } from "@/types/chart";

export const useChartRating = () => {
  const [ratingData, setRatingData] = useState<RatingData | null>(null);
  const [starData, setStarData] = useState<StarStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRatingData = async (params: MessageStatisticsParams) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch cả 2 API cùng lúc
      const [ratingResponse, starResponse] = await Promise.all([
        chartService.getRatingStatistics(params),
        chartService.getStarStatistics(params)
      ]);
      
      if (ratingResponse.status === "success") {
        setRatingData(ratingResponse.data);
      }
      
      if (starResponse.status === "success") {
        setStarData(starResponse.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching rating data:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    ratingData,
    starData,
    loading,
    error,
    fetchRatingData,
  };
};
