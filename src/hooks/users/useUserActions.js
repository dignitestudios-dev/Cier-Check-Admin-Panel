import { useEffect, useState } from "react";
import { handleError } from "../../utils/helpers";
import { api } from "../../lib/services";

const useUserActions = (role, isActive, search, page, limit) => {
  const [loading, setLoading] = useState(false);
  const [loadingActions, setLoadingActions] = useState(false);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const getUsers = async () => {
    setLoading(true);
    try {
      const response = await api.listUsers(role, isActive, search, page, limit);

      const data = response.data || [];
      const meta = response.pagination || {};
      const filteredData = data.filter((user) => user.role !== "admin");
      setUsers(filteredData);

      // Compute stats from result
      const totalUsers = meta.total ?? data.length;

      setStats({
        totalUsers,
      });

      setTotalPages(Math.ceil(meta.total / limit));
      setTotalData(meta.total ?? data.length);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, [role, isActive, search, page, limit]);

  const updateUserStatus = async (id, isActive) => {
    setLoadingActions(true);
    try {
      const response = await api.updateUserStatus(id, isActive);
      setLoadingActions(false);
      return response.success;
    } catch (error) {
      handleError(error);
      setLoadingActions(false);
      return false;
    }
  };

  const getUserDetail = async (id) => {
    setLoadingActions(true);
    try {
      // Fetch user and related lists in parallel (orders, consultations, reports)
      const [userResp, ordersResp, consultResp, reportsResp] =
        await Promise.all([
          api.getUserById(id),
          api.getUserOrders(id, 1, 200),
          api.getUserConsultations(id, 1, 200),
          api.listReportsByUser(id, 1, 200),
        ]);

      setLoadingActions(false);

      const user = userResp?.data || null;
      const orders = ordersResp?.data || [];
      const consultations = consultResp?.data || [];
      const reports = reportsResp?.data || [];

      return {
        user,
        orders,
        consultations,
        reports,
        meta: {
          orders: ordersResp?.pagination || {},
          consultations: consultResp?.pagination || {},
          reports: reportsResp?.pagination || {},
        },
      };
    } catch (error) {
      handleError(error);
      setLoadingActions(false);
      return null;
    }
  };

  const getReportsByUser = async (userId, page = 1, limit = 20) => {
    setLoadingActions(true);
    try {
      const response = await api.listReportsByUser(userId, page, limit);
      setLoadingActions(false);
      return response; // return full response { data, meta }
    } catch (error) {
      handleError(error);
      setLoadingActions(false);
      return null;
    }
  };

  const getUserOrders = async (userId, page = 1, limit = 20) => {
    setLoadingActions(true);
    try {
      const response = await api.getUserOrders(userId, page, limit);
      setLoadingActions(false);
      return response; // { data, meta }
    } catch (error) {
      handleError(error);
      setLoadingActions(false);
      return null;
    }
  };

  const getUserConsultations = async (userId, page = 1, limit = 20) => {
    setLoadingActions(true);
    try {
      const response = await api.getUserConsultations(userId, page, limit);
      setLoadingActions(false);
      return response;
    } catch (error) {
      handleError(error);
      setLoadingActions(false);
      return null;
    }
  };

  const getDoctorDetail = async (id) => {
    setLoadingActions(true);
    try {
      const response = await api.getDoctorById(id);
      setLoadingActions(false);
      return response.data;
    } catch (error) {
      handleError(error);
      setLoadingActions(false);
      return null;
    }
  };

  const getUserQuestions = async (userId) => {
    setLoadingActions(true);
    try {
      const response = await api.getUserQuestions(userId);
      setLoadingActions(false);
      return response.data; // Returns the questions object with user and questions array
    } catch (error) {
      handleError(error);
      setLoadingActions(false);
      return null;
    }
  };

  const getDoctorConsultations = async (doctorId, page = 1, limit = 20) => {
    setLoadingActions(true);
    try {
      const response = await api.getDoctorConsultations(doctorId, page, limit);
      setLoadingActions(false);
      return response; // { data, meta }
    } catch (error) {
      handleError(error);
      setLoadingActions(false);
      return null;
    }
  };

  return {
    loading,
    loadingActions,
    users,
    stats,
    totalPages,
    totalData,
    getUsers,
    updateUserStatus,
    getUserDetail,
    getReportsByUser,
    getUserOrders,
    getUserConsultations,
    getDoctorDetail,
    getUserQuestions,
    getDoctorConsultations,
  };
};

export default useUserActions;
