import { useEffect, useState, useRef } from "react";
import { handleError } from "../../utils/helpers";
import { api } from "../../lib/services";

const useGetDashboardTrends = (
  userRegMonth = "",
  userRegYear = "",
  consultationMonth = "",
  consultationYear = "",
  productMonth = "",
  productYear = ""
) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalOrderRevenue: 0,
    totalConsultations: 0,
    totalConsultationRevenue: 0,
    totalReports: 0,
  });

  const [userRegistrationTrends, setUserRegistrationTrends] = useState({
    granularity: "daily",
    chartData: [],
    stats: { totalRegistrations: 0, registrationsThisPeriod: 0, percentChangeFromPreviousPeriod: 0 },
  });

  const [consultationTrends, setConsultationTrends] = useState({
    granularity: "daily",
    chartData: [],
    stats: { totalConsultations: 0, totalRevenue: 0, avgDurationMinutes: 0 },
  });

  const [productPurchaseTrends, setProductPurchaseTrends] = useState({
    granularity: "monthly",
    chartData: [],
    stats: { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 },
    topProducts: [],
  });

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingConsultation, setLoadingConsultation] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const initialLoadRef = useRef(false);

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const response = await api.getDashboardStats();
      const data = response.data || {};
      setStats(data);
    } catch (error) {
      handleError(error);
    }
  };

  // Fetch user registration trends
  const fetchUserRegistrationTrends = async (month = "", year = "") => {
    try {
      const response = await api.getUserRegistrationTrends(month, year);
      const data = response.data || {};
      const rawChart = data.chartData || [];
      const chartData = rawChart.map((row) => ({
        ...row,
        registrations: row.registrations != null ? Number(row.registrations) : 0,
      }));

      setUserRegistrationTrends({
        month: data.month || month,
        year: data.year || year,
        chartData,
        stats: data.stats || {},
      });
    } catch (error) {
      handleError(error);
    }
  };

  // Fetch consultation trends
  const fetchConsultationTrends = async (month = "", year = "") => {
    try {
      const response = await api.getConsultationTrends(month, year);
      const data = response.data || {};
      const rawChart = data.chartData || [];
      const chartData = rawChart.map((row) => ({
        ...row,
        revenue: row.revenue != null ? Number(row.revenue) : 0,
        count: row.count != null ? Number(row.count) : row.count,
      }));

      setConsultationTrends({
        month: data.month || month,
        year: data.year || year,
        chartData,
        stats: data.stats || {},
      });
    } catch (error) {
      handleError(error);
    }
  };

  // Fetch product purchase trends
  const fetchProductPurchaseTrends = async (month = "", year = "") => {
    try {
      const response = await api.getProductPurchaseTrends(month, year);
      const data = response.data || {};
      const rawChart = data.chartData || [];
      const chartData = rawChart.map((row) => ({
        ...row,
        revenue: row.revenue != null ? Number(row.revenue) : 0,
        orders: row.orders != null ? Number(row.orders) : row.orders,
      }));

      const topProductsRaw = data.topProducts || [];
      const topProducts = topProductsRaw.map((p) => ({
        ...p,
        revenue: p.revenue != null ? Number(p.revenue) : 0,
        orders: p.orders != null ? Number(p.orders) : p.orders,
      }));

      setProductPurchaseTrends({
        month: data.month || month,
        year: data.year || year,
        chartData,
        stats: data.stats || {},
        topProducts,
      });
    } catch (error) {
      handleError(error);
    }
  };

  // Initial load: fetch everything once on mount
  useEffect(() => {
    const fetchAll = async () => {
      setLoadingInitial(true);
      try {
        await Promise.all([
          fetchDashboardStats(),
          fetchUserRegistrationTrends(userRegMonth, userRegYear),
          fetchConsultationTrends(consultationMonth, consultationYear),
          fetchProductPurchaseTrends(productMonth, productYear),
        ]);
      } catch (err) {
        // handled in individual fetch
      } finally {
        setLoadingInitial(false);
        initialLoadRef.current = true;
      }
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subsequent updates: only fetch the specific chart(s) that changed and show per-chart loading
  useEffect(() => {
    if (!initialLoadRef.current) return;
    let mounted = true;
    const update = async () => {
      setLoadingUser(true);
      try {
        await fetchUserRegistrationTrends(userRegMonth, userRegYear);
      } catch (err) {}
      if (mounted) setLoadingUser(false);
    };
    update();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRegMonth, userRegYear]);

  useEffect(() => {
    if (!initialLoadRef.current) return;
    let mounted = true;
    const update = async () => {
      setLoadingConsultation(true);
      try {
        await fetchConsultationTrends(consultationMonth, consultationYear);
      } catch (err) {}
      if (mounted) setLoadingConsultation(false);
    };
    update();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultationMonth, consultationYear]);

  useEffect(() => {
    if (!initialLoadRef.current) return;
    let mounted = true;
    const update = async () => {
      setLoadingProduct(true);
      try {
        await fetchProductPurchaseTrends(productMonth, productYear);
      } catch (err) {}
      if (mounted) setLoadingProduct(false);
    };
    update();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productMonth, productYear]);

  return {
    loadingInitial,
    loadingUser,
    loadingConsultation,
    loadingProduct,
    stats,
    userRegistrationTrends,
    consultationTrends,
    productPurchaseTrends,
    fetchUserRegistrationTrends,
    fetchConsultationTrends,
    fetchProductPurchaseTrends,
  };
};

export default useGetDashboardTrends;
