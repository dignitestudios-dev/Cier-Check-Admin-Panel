import { useEffect, useState } from "react";
import { handleError } from "../../utils/helpers";
import { api } from "../../lib/services";

const useOrderActions = (status, paymentStatus, search, page, limit) => {
  const [loading, setLoading] = useState(false);
  const [loadingActions, setLoadingActions] = useState(false);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,

  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const getOrders = async () => {
    setLoading(true);
    try {
      const response = await api.getOrders(status, paymentStatus, page, limit);

      // The admin API returns { success, message, data: { result: [...], pagination: {...} } }
      const data = response.data || {};
      const result = data.result || [];

      setOrders(result);

      // Compute simple stats from result (fallback if API doesn't provide separate stats)
      const totalOrders = data.pagination?.total ?? result.length;
      

      setStats({
        totalOrders,

      });

      setTotalPages(data.pagination?.totalPages ?? 1);
      setTotalData(data.pagination?.total ?? result.length);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrders();
  }, [status, paymentStatus, search, page, limit]);

  const getOrdersByContact = async (contactEmail) => {
    setLoadingActions(true);
    try {
      return await api.getOrdersByContact(contactEmail);
    } catch (error) {
      handleError(error);
    } finally {
      setLoadingActions(false);
    }
  };

  const getOrderById = async (id) => {
    setLoadingActions(true);
    try {
      return await api.getOrderById(id);
    } catch (error) {
      handleError(error);
    } finally {
      setLoadingActions(false);
    }
  };

  const updateOrder = async (id, orderData) => {
    setLoadingActions(true);
    try {
      const response = await api.updateOrder(id, orderData);
      setLoadingActions(false);
      return response.success;
    } catch (error) {
      handleError(error);
      setLoadingActions(false);
      return false;
    }
  };

  return {
    loading,
    loadingActions,
    orders,
    stats,
    totalPages,
    totalData,
    getOrders,
    getOrdersByContact,
    getOrderById,
    updateOrder,
  };
};

export default useOrderActions;
