import axios from "axios";
import { API_CONFIG, PAGINATION_CONFIG } from "../config/constants";

// Create an Axios instance
const API = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout, // Set a timeout (optional)
  headers: API_CONFIG.headers,
});

// Request Interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken"); // Retrieve token from storage
    console.log("req token: ", token);
    if (token) {
      config.headers.authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("authToken"); // Remove token if unauthorized
      window.location.href = "/auth/login"; // Redirect to login page
    }
    console.log(error);
    console.log("API Error:", error.response?.data || error);
    return Promise.reject(error);
  }
);

// Centralized API Handling functions start
const handleApiError = (error) => {
  if (axios.isAxiosError(error)) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";
    throw new Error(errorMessage);
  }
  throw new Error(error?.message || error || "An Unexpected error occurred");
};

const handleApiResponse = (response) => {
  const responseData = response.data;
  console.log("API response run");

  // Check if success is false and throw an error
  if (!responseData.success) {
    throw new Error(
      responseData.message || "Something went wrong, Please try again!"
    );
  }

  return responseData; // Only return the response data {status, message, data}
};

const apiHandler = async (apiCall) => {
  try {
    const response = await apiCall();
    return handleApiResponse(response);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Centralized API Handling functions end

// Auth APIs

const login = (credentials) =>
  apiHandler(() =>
    API.post("/admin/auth/login", credentials, {
      headers: {
        deviceuniqueid: credentials.deviceuniqueid,
        devicemodel: credentials.devicemodel,
      },
    })
  );

const forgotPassword = (payload) =>
  apiHandler(() => API.post("/admin/auth/forgot-password", payload));

const verifyOTP = (payload) =>
  apiHandler(() =>
    API.post("/admin/auth/verify-otp", payload, {
      headers: {
        deviceuniqueid: payload.deviceuniqueid,
        devicemodel: payload.devicemodel,
      },
    })
  );

const updatePassword = (payload) =>
  apiHandler(() => API.post("/admin/auth/update-password", payload));

const updatePasswordAuth = (payload) =>
  apiHandler(() => API.post("/admin/auth/update-password-auth", payload));

const logout = () => apiHandler(() => API.post("/admin/auth/logout"));

// // Dashboard Analytics API
// const getDashboardAnalytics = () =>
//   apiHandler(() => API.get("/dashboard/analytics"));

// Products API
const createProduct = (productData) =>
  // Use the global axios instance (not the configured `API`) to avoid the
  // instance-level default JSON Content-Type header. This lets the browser
  // set the correct multipart boundary when sending FormData.
  apiHandler(() =>
    API.post(`/product/add`, productData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );

const updateProduct = (id, productData) =>
  apiHandler(() => API.patch(`/product/update/${id}`, productData));

const deleteProduct = (id) =>
  apiHandler(() => API.delete(`/product/delete/${id}`));

const getProductById = (id) => apiHandler(() => API.get(`/product/${id}`));

const getAllProducts = (
  search,
  page = 1,
  limit = PAGINATION_CONFIG.defaultPageSize
) =>
  apiHandler(() =>
    API.get(`/product/admin/get?q=${search}&type=post&page=${page}&limit=${limit}`)
  );

// Orders API (admin)
const getOrders = (status = "", paymentStatus = "", page = 1, limit = 20) =>
  apiHandler(() =>
    API.get(`/order/admin/all-orders`, {
      params: { status, paymentStatus, page, limit },
    })
  );

const updateOrder = (id, orderData) =>
  apiHandler(() => API.patch(`/order/admin/status/${id}`, orderData));
const deleteOrder = (id) =>
  apiHandler(() => API.delete(`/order/admin/delete/${id}`));

// Users API (admin)
const listUsers = (
  role = "",
  isActive = "",
  search = "",
  page = 1,
  limit = 20
) =>
  apiHandler(() =>
    API.get(`/admin/users`, {
      params: { role, isActive, search, page, limit },
    })
  );

const getUserById = (id) => apiHandler(() => API.get(`/admin/users/${id}`));

const updateUserStatus = (id, isActive) =>
  apiHandler(() => API.patch(`/admin/users/${id}/status`, { isActive }));

const listReportsByUser = (id, page = 1, limit = 20) =>
  apiHandler(() =>
    API.get(`/admin/users/${id}/reports`, {
      params: { page, limit },
    })
  );

const getUserOrders = (id, page = 1, limit = 20) =>
  apiHandler(() =>
    API.get(`/admin/users/${id}/orders`, {
      params: { page, limit },
    })
  );

const getUserConsultations = (id, page = 1, limit = 20) =>
  apiHandler(() =>
    API.get(`/admin/users/${id}/consultations`, {
      params: { page, limit },
    })
  );

const listDoctors = (isActive = "", search = "", page = 1, limit = 20) =>
  apiHandler(() =>
    API.get(`/admin/doctors`, {
      params: { isActive, search, page, limit },
    })
  );

const getDoctorById = (id) => apiHandler(() => API.get(`/admin/doctors/${id}`));

const getReportDetails = (id) =>
  apiHandler(() => API.get(`/admin/reports/${id}`));

const getUserQuestions = (id) =>
  apiHandler(() => API.get(`/admin/users/${id}/questions`));

const getDoctorConsultations = (id, page = 1, limit = 20) =>
  apiHandler(() =>
    API.get(`/admin/doctors/${id}/consultations`, {
      params: { page, limit },
    })
  );

const listAllConsultations = (
  when = "",
  status = "",
  search = "",
  page = 1,
  limit = 20,
  startDate = "",
  endDate = ""
) =>
  apiHandler(() =>
    API.get(`/admin/consultations`, {
      params: { when, status, search, startDate, endDate, page, limit },
    })
  );

const getConsultationStats = () =>
  apiHandler(() => API.get(`/admin/consultations/stats`));

// Dashboard Analytics
const getDashboardStats = () =>
  apiHandler(() => API.get(`/admin/dashboard/stats`));

const getUserRegistrationTrends = (month = "", year = "") =>
  apiHandler(() =>
    API.get(`/admin/trends/user-registrations`, {
      params: { month, year },
    })
  );

const getConsultationTrends = (month = "", year = "") =>
  apiHandler(() =>
    API.get(`/admin/trends/consultations`, {
      params: { month, year },
    })
  );

const getProductPurchaseTrends = (month = "", year = "") =>
  apiHandler(() =>
    API.get(`/admin/trends/product-purchases`, {
      params: { month, year },
    })
  );

const getTopDoctorsAllTime = () =>
  apiHandler(() => API.get(`/admin/trends/top-doctors`));

// Video APIs
const uploadVideo = (videoData) =>
  apiHandler(() =>
    API.post(`/videos`, videoData, {
      headers: { "Content-Type": "application/json" },
    })
  );

const getAllVideos = (
  search = "",
  page = 1,
  limit = PAGINATION_CONFIG.defaultPageSize
) =>
  apiHandler(() =>
    API.get(`/videos`, {
      params: { search, page, limit },
    })
  );

const getVideoById = (id) => apiHandler(() => API.get(`/videos/${id}`));

const updateVideo = (id, videoData) =>
  apiHandler(() => API.patch(`/videos/${id}`, videoData));

const deleteVideo = (id) => apiHandler(() => API.delete(`/videos/${id}`));

const getVideoCount = () => apiHandler(() => API.get(`/videos/stats/count`));

// Notifications API
const createNotification = (notificationData) =>
  apiHandler(() => API.post(`/notification/create`, notificationData));

const deleteNotification = (id) =>
  apiHandler(() => API.delete(`/notification/${id}`));

const getAllAdminNotifications = (
  page = 1,
  limit = PAGINATION_CONFIG.defaultPageSize
) =>
  apiHandler(() =>
    API.get(`/notification/admin/all`, {
      params: { page, limit },
    })
  );

const getUserNotifications = (
  page = 1,
  limit = PAGINATION_CONFIG.defaultPageSize
) => apiHandler(() => API.get(`/notifications`, { params: { page, limit } }));

// const updateProduct = (id, productData) =>
//   apiHandler(() => API.put(`/product/${id}`, productData));

// const deleteProduct = (id) => apiHandler(() => API.delete(`/product/${id}`));

// const getProductById = (id) => apiHandler(() => API.get(`/product/${id}`));

// // Categories API
// const createCategory = (categoryData) =>
//   apiHandler(() => API.post(`/category`, categoryData));

// const getAllCategories = (
//   status, // active or inactive
//   page = 1,
//   limit = PAGINATION_CONFIG.defaultPageSize
// ) =>
//   apiHandler(() =>
//     API.get(`/category?status=${status}&page=${page}&limit=${limit}`)
//   );

// const updateCategory = (id, categoryData) =>
//   apiHandler(() => API.put(`/category/${id}`, categoryData));

// const deleteCategory = (id) => apiHandler(() => API.delete(`/category/${id}`));

// const getCategoryById = (id) => apiHandler(() => API.get(`/category/${id}`));

// // Orders API
// const getOrders = (
//   paymentStatus,
//   orderStatus,
//   orderType,
//   startDate,
//   endDate,
//   search,
//   page = 1,
//   limit = API_CONFIG.pagination.defaultPageSize
// ) =>
//   apiHandler(() =>
//     API.get(
//       `/order?paymentStatus=${paymentStatus}&orderStatus=${orderStatus}&orderType=${orderType}&startDate=${startDate}&endDate=${endDate}&search=${search}&page=${page}&limit=${limit}`
//     )
//   );

// const getOrdersByContact = (contactEmail) =>
//   apiHandler(() => API.get(`/order/contact?email=${contactEmail}`));

// const getOrderById = (id) => apiHandler(() => API.get(`/order/${id}`));

// const updateOrder = (id, orderData) =>
//   apiHandler(() => API.put(`/order/${id}`, orderData));

export const api = {
  login,
  forgotPassword,
  verifyOTP,
  updatePassword,
  updatePasswordAuth,
  logout,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  getOrders,
  updateOrder,
  deleteOrder,
  listUsers,
  getUserById,
  updateUserStatus,
  listReportsByUser,
  getUserOrders,
  getUserConsultations,
  listDoctors,
  getDoctorById,
  getReportDetails,
  getUserQuestions,
  getDoctorConsultations,
  listAllConsultations,
  getConsultationStats,
  getDashboardStats,
  getUserRegistrationTrends,
  getConsultationTrends,
  getProductPurchaseTrends,
  getTopDoctorsAllTime,
  uploadVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  getVideoCount,
  createNotification,
  deleteNotification,
  getAllAdminNotifications,
  getUserNotifications,
};
