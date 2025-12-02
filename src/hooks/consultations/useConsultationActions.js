import { useEffect, useState } from "react";
import { handleError } from "../../utils/helpers";
import { api } from "../../lib/services";

const useConsultationActions = (
  when,
  status,
  search,
  page,
  limit,
  startDate,
  endDate
) => {
  const [loading, setLoading] = useState(false);
  const [consultations, setConsultations] = useState([]);
  const [stats, setStats] = useState({
    totalConsultationsBooked: 0,
    totalRevenueGenerated: 0,
    mostConsultationsBooked: null,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [statsLoading, setStatsLoading] = useState(false);

  const getConsultations = async () => {
    setLoading(true);
    try {
      const response = await api.listAllConsultations(
        when,
        status,
        search,
        page,
        limit,
        startDate,
        endDate
      );

      const data = response.data || [];
      const pagination = response.pagination || {};

      setConsultations(data);
      setTotalPages(
        Math.ceil(pagination.total / limit) || 1
      );
      setTotalData(pagination.total || data.length);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const getStats = async () => {
    setStatsLoading(true);
    try {
      const response = await api.getConsultationStats();
      const statsData = response.data || {};
      setStats({
        totalConsultationsBooked: statsData.totalConsultationsBooked || 0,
        totalRevenueGenerated: statsData.totalRevenueGenerated || 0,
        mostConsultationsBooked: statsData.mostConsultationsBooked || null,
      });
    } catch (error) {
      handleError(error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    getConsultations();
  }, [when, status, search, page, limit, startDate, endDate]);

  return {
    loading,
    statsLoading,
    consultations,
    stats,
    totalPages,
    totalData,
    getConsultations,
    getStats,
  };
};

export default useConsultationActions;
