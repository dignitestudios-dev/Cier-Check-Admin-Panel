import { useEffect, useState } from "react";
import { handleError } from "../../utils/helpers";
import { api } from "../../lib/services";
import { PAGINATION_CONFIG } from "../../config/constants";

const useNotificationActions = (page = 1, limit = PAGINATION_CONFIG.defaultPageSize) => {
  const [loading, setLoading] = useState(false);
  const [loadingActions, setLoadingActions] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit, total: 0, totalPages: 1 });

  const getNotifications = async (p = page, l = limit) => {
    setLoading(true);
    try {
      const response = await api.getAllAdminNotifications(p, l);
      // response.data should contain { notifications, pagination }
      const data = response.data || {};
      const items = data.notifications || [];
      const pag = data.pagination || {};

      setNotifications(Array.isArray(items) ? items : []);
      setPagination({
        page: pag.page ?? p,
        limit: pag.limit ?? l,
        total: pag.total ?? 0,
        totalPages: pag.totalPages ?? 1,
      });
    } catch (error) {
      handleError(error);
      setNotifications([]);
      setPagination({ page: p, limit: l, total: 0, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getNotifications(page, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const create = async (payload) => {
    setLoadingActions(true);
    try {
      const response = await api.createNotification(payload);
      if (response.success) {
        await getNotifications(page, limit);
      }
      return response.success;
    } catch (error) {
      handleError(error);
      return false;
    } finally {
      setLoadingActions(false);
    }
  };

  const remove = async (id) => {
    setLoadingActions(true);
    try {
      const response = await api.deleteNotification(id);
      if (response.success) {
        await getNotifications(page, limit);
      }
      return response.success;
    } catch (error) {
      handleError(error);
      return false;
    } finally {
      setLoadingActions(false);
    }
  };

  return {
    loading,
    loadingActions,
    notifications,
    pagination,
    getNotifications,
    create,
    remove,
  };
};

export default useNotificationActions;
