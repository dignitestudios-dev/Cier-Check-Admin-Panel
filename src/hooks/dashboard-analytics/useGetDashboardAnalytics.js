import React, { useEffect, useState } from "react";
import { useApp } from "../../contexts/AppContext";
import { handleError } from "../../utils/helpers";
import { api } from "../../lib/services";

const useGetDashboardAnalytics = () => {
  const [loading, setLoading] = useState(false);

  const getDashboardAnalytics = async () => {
    setLoading(true);

    try {
      // This hook is kept for backward compatibility but no longer used
      // Dashboard now uses useGetDashboardTrends instead
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // No-op: new Dashboard uses useGetDashboardTrends
  }, []);

  return {
    loading,
    getDashboardAnalytics,
  };
};

export default useGetDashboardAnalytics;
