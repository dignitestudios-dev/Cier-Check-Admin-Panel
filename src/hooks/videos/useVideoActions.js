import { useEffect, useState } from "react";
import { handleError } from "../../utils/helpers";
import { api } from "../../lib/services";

const useVideoActions = (search = "", page = 1, limit = 2) => {
  const [loading, setLoading] = useState(false);
  const [loadingActions, setLoadingActions] = useState(false);
  const [videos, setVideos] = useState([]);
  const [stats, setStats] = useState({
    totalVideos: 0,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const getVideos = async () => {
    setLoading(true);
    try {
      const response = await api.getAllVideos(search, page, limit);

      const videos = response.data || [];
      const pagination = response.pagination || {};

      setVideos(Array.isArray(videos) ? videos : []);

      setStats({
        totalVideos: pagination.total ?? 0,
      });

      setTotalPages(pagination.pages ?? 1);
      setTotalData(pagination.total ?? 0);
    } catch (error) {
      handleError(error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getVideos();
  }, [search, page, limit]);

  const getVideoById = async (id) => {
    setLoadingActions(true);
    try {
      const response = await api.getVideoById(id);
      return response.data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoadingActions(false);
    }
  };

  const createVideo = async (videoData) => {
    setLoadingActions(true);
    try {
      const response = await api.uploadVideo(videoData);
      if (response.success) {
        await getVideos();
      }
      return response.success;
    } catch (error) {
      handleError(error);
      return false;
    } finally {
      setLoadingActions(false);
    }
  };

  const updateVideo = async (id, videoData) => {
    setLoadingActions(true);
    try {
      const response = await api.updateVideo(id, videoData);
      if (response.success) {
        await getVideos();
      }
      return response.success;
    } catch (error) {
      handleError(error);
      return false;
    } finally {
      setLoadingActions(false);
    }
  };

  const deleteVideo = async (id) => {
    try {
      const response = await api.deleteVideo(id);
      if (response.success) {
        await getVideos();
      }
      return response.success;
    } catch (error) {
      handleError(error);
      return false;
    }
  };

  const getVideoCount = async () => {
    try {
      const response = await api.getVideoCount();
      return response.data;
    } catch (error) {
      handleError(error);
      return null;
    }
  };

  return {
    loading,
    loadingActions,
    videos,
    stats,
    totalPages,
    totalData,
    getVideos,
    getVideoById,
    createVideo,
    updateVideo,
    deleteVideo,
    getVideoCount,
  };
};

export default useVideoActions;
