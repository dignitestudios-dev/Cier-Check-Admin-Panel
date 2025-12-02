import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Loader2, Eye } from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import DataTable from "../components/common/DataTable";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
} from "../utils/helpers";
import useUserActions from "../hooks/users/useUserActions";
import { PAGINATION_CONFIG } from "../config/constants";

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("reports");
  const [userDetail, setUserDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);

  // hook exposes helpers for paginated fetches
  const {
    getUserDetail,
    getDoctorDetail,
    getReportsByUser,
    getUserOrders,
    getUserConsultations,
    getUserQuestions,
    getDoctorConsultations,
  } = useUserActions("", "", "", 1, 20);

  // Reports pagination state
  const [reportsPage, setReportsPage] = useState(1);
  const [reportsLimit, setReportsLimit] = useState(
    PAGINATION_CONFIG.defaultPageSize
  );
  const [reportsData, setReportsData] = useState([]);
  const [reportsTotalPages, setReportsTotalPages] = useState(1);
  const [reportsTotalData, setReportsTotalData] = useState(0);
  const [reportsLoading, setReportsLoading] = useState(false);

  // Orders pagination state
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersLimit, setOrdersLimit] = useState(
    PAGINATION_CONFIG.defaultPageSize
  );
  const [ordersData, setOrdersData] = useState([]);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);
  const [ordersTotalData, setOrdersTotalData] = useState(0);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Consultations pagination state
  const [consultPage, setConsultPage] = useState(1);
  const [consultLimit, setConsultLimit] = useState(
    PAGINATION_CONFIG.defaultPageSize
  );
  const [consultData, setConsultData] = useState([]);
  const [consultTotalPages, setConsultTotalPages] = useState(1);
  const [consultTotalData, setConsultTotalData] = useState(0);
  const [consultLoading, setConsultLoading] = useState(false);

  // Symptom Questionnaire state
  const [questionsData, setQuestionsData] = useState(null);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const questionnaireLoadedRef = useRef(false);

  useEffect(() => {
    const fetchUserDetail = async () => {
      setLoading(true);
      try {
        let detail;
        // Try to fetch as a user first
        detail = await getUserDetail(userId);

        if (detail) {
          setUserDetail(detail);
        }
      } catch (error) {
        console.error("Error fetching user detail:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserDetail();
    }
  }, [userId]);

  // set default active tab based on role when userDetail is loaded
  useEffect(() => {
    if (userDetail?.user) {
      if (userDetail.user.role === "doctor") setActiveTab("reports");
      else setActiveTab("reports");
      // Reset image error when user changes
      setProfileImageError(false);
    }
  }, [userDetail]);

  // Fetch reports for patient with pagination
  const fetchReports = async (page = 1, limit = reportsLimit) => {
    if (!userId) return;
    setReportsLoading(true);
    try {
      const resp = await getReportsByUser(userId, page, limit);
      if (resp) {
        setReportsData(resp.data || []);
        const total = resp.pagination?.total ?? (resp.data?.length || 0);
        setReportsTotalData(total);
        setReportsTotalPages(Math.max(1, Math.ceil(total / limit)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReportsLoading(false);
    }
  };

  // Fetch orders
  const fetchOrders = async (page = 1, limit = ordersLimit) => {
    if (!userId) return;
    setOrdersLoading(true);
    try {
      const resp = await getUserOrders(userId, page, limit);
      if (resp) {
        setOrdersData(resp.data || []);
        const total = resp.pagination?.total ?? (resp.data?.length || 0);
        setOrdersTotalData(total);
        setOrdersTotalPages(Math.max(1, Math.ceil(total / limit)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch consultations
  const fetchConsultations = async (page = 1, limit = consultLimit) => {
    if (!userId) return;
    setConsultLoading(true);
    try {
      let resp;
      // If user is a doctor, fetch doctor-specific consultations
      if (userDetail?.user?.role === "doctor") {
        resp = await getDoctorConsultations(userId, page, limit);
      } else {
        resp = await getUserConsultations(userId, page, limit);
      }
      if (resp) {
        setConsultData(resp.data || []);
        const total = resp.pagination?.total ?? (resp.data?.length || 0);
        setConsultTotalData(total);
        setConsultTotalPages(Math.max(1, Math.ceil(total / limit)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setConsultLoading(false);
    }
  };

  // Fetch questionnaire - load only once
  const fetchQuestionnaire = async () => {
    if (!userId || questionnaireLoadedRef.current) return;
    setQuestionsLoading(true);
    try {
      const resp = await getUserQuestions(userId);
      if (resp) {
        setQuestionsData(resp);
        questionnaireLoadedRef.current = true;
      }
    } catch (err) {
      console.error("Error fetching questionnaire:", err);
    } finally {
      setQuestionsLoading(false);
    }
  };

  // Trigger fetch when active tab changes or pagination changes
  useEffect(() => {
    if (!userDetail) return;
    if (activeTab === "reports") {
      fetchReports(reportsPage, reportsLimit);
    } else if (activeTab === "orders") {
      fetchOrders(ordersPage, ordersLimit);
    } else if (activeTab === "consultations") {
      fetchConsultations(consultPage, consultLimit);
    } else if (activeTab === "questionnaire") {
      fetchQuestionnaire();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    reportsPage,
    reportsLimit,
    ordersPage,
    ordersLimit,
    consultPage,
    consultLimit,
    userDetail,
  ]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!userDetail) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/users")}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Users
        </Button>
        <Card className="p-6">
          <p className="text-gray-600 dark:text-gray-400">User not found</p>
        </Card>
      </div>
    );
  }

  const { user, orders, consultations, reports } = userDetail;
  const isPatient = user?.role === "patient";

  const reportColumns = [
    {
      key: "_id",
      label: "Report ID",
      render: (_, report) => (
        <span className="font-mono text-sm">{report?._id}</span>
      ),
    },
    {
      key: "reason",
      label: "Reason",
      render: (_, report) => (
        <p className="text-sm">{report?.reason || "--"}</p>
      ),
    },
    {
      key: "targetType",
      label: "Type",
      render: (_, report) => (
        <Badge variant="default">{report?.targetType || "--"}</Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_, report) => {
        const statusVariant =
          report?.status === "open"
            ? "warning"
            : report?.status === "under_review"
            ? "info"
            : report?.status === "action_taken"
            ? "success"
            : "danger";
        return (
          <Badge variant={statusVariant}>
            {report?.status?.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      key: "createdAt",
      label: "Submitted",
      render: (_, report) => (
        <p className="text-sm">{formatDate(report?.createdAt)}</p>
      ),
    },
  ];

  const orderColumns = [
    {
      key: "_id",
      label: "Order ID",
      render: (_, order) => (
        <span className="font-mono text-sm">{order?._id}</span>
      ),
    },
    {
      key: "items",
      label: "Items",
      render: (_, order) => (
        <p className="text-sm">
          {order?.items?.length || 0} item
          {(order?.items?.length || 0) !== 1 ? "s" : ""}
        </p>
      ),
    },
    {
      key: "totalAmount",
      label: "Total",
      render: (_, order) => (
        <span className="font-semibold">
          {formatCurrency(order?.totalAmount / 100)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_, order) => {
        const statusVariant =
          order?.status === "pending"
            ? "warning"
            : order?.status === "processing"
            ? "info"
            : order?.status === "delivered"
            ? "success"
            : order?.status === "cancelled"
            ? "danger"
            : "default";
        return <Badge variant={statusVariant}>{order?.status}</Badge>;
      },
    },
    {
      key: "payment",
      label: "Payment",
      render: (_, order) => {
        const paymentVariant =
          order?.payment?.status === "succeeded"
            ? "success"
            : order?.payment?.status === "refunded"
            ? "danger"
            : "warning";
        return (
          <Badge variant={paymentVariant}>
            {order?.payment?.status || "N/A"}
          </Badge>
        );
      },
    },
    {
      key: "createdAt",
      label: "Date",
      render: (_, order) => (
        <p className="text-sm">{formatDate(order?.createdAt)}</p>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, order) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedOrder(order);
            setShowOrderModal(true);
          }}
          icon={<Eye className="w-4 h-4" />}
          title="View Details"
        />
      ),
    },
  ];

  const consultationColumns = [
    {
      key: "_id",
      label: "Consultation ID",
      render: (_, consult) => (
        <span className="font-mono text-sm">{consult?._id}</span>
      ),
    },
    {
      key: "doctor",
      label: isPatient ? "Doctor" : "Patient",
      render: (_, consult) => {
        const person = isPatient ? consult?.doctor : consult?.patient;
        return (
          <div>
            <p className="font-medium">{person?.fullName || "--"}</p>
            <p className="text-sm text-gray-500">{person?.email || "--"}</p>
          </div>
        );
      },
    },
    {
      key: "purchasedMinutes",
      label: "Minutes",
      render: (_, consult) => <p>{consult?.purchasedMinutes || 0} min</p>,
    },
    {
      key: "status",
      label: "Status",
      render: (_, consult) => {
        const statusVariant =
          consult?.status === "pending"
            ? "warning"
            : consult?.status === "active"
            ? "info"
            : consult?.status === "completed"
            ? "success"
            : "danger";
        return <Badge variant={statusVariant}>{consult?.status}</Badge>;
      },
    },
    {
      key: "paymentStatus",
      label: "Payment",
      render: (_, consult) => {
        const paymentVariant =
          consult?.paymentStatus === "paid"
            ? "success"
            : consult?.paymentStatus === "pending"
            ? "warning"
            : "danger";
        return <Badge variant={paymentVariant}>{consult?.paymentStatus}</Badge>;
      },
    },
    {
      key: "startedAt",
      label: "Started",
      render: (_, consult) => (
        <p className="text-sm">{consult?.startedAt ? formatDateTime(consult?.startedAt) : "--"}</p>
      ),
    },
    {
      key: "endedAt",
      label: "Ended",
      render: (_, consult) => (
        <p className="text-sm">{consult?.endedAt ? formatDateTime(consult?.endedAt) : "--"}</p>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (_, consult) => (
        <p className="text-sm">{formatDate(consult?.createdAt)}</p>
      ),
    },
  ];

  const tabs = isPatient
    ? [
        { id: "reports", label: `Reports` },
        { id: "orders", label: `Orders` },
        {
          id: "consultations",
          label: `Consultations`,
        },
        {
          id: "questionnaire",
          label: `Symptom Questionnaire`,
        },
      ]
    : [
        {
          id: "reports",
          label: `Reports`,
        },
        {
          id: "consultations",
          label: `Consultations`,
        },
      ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate("/users")}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Users
        </Button>
      </div>

      {/* User Header Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary-100/30 rounded-full flex items-center justify-center overflow-hidden relative">
              {user?.profilePicURL && !profileImageError ? (
                <img
                  src={user?.profilePicURL}
                  alt={user?.fullName || "User"}
                  className="object-cover"
                  onError={() => setProfileImageError(true)}
                />
              ) : (
                <span className="text-primary-600 font-semibold text-3xl">
                  {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user?.fullName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant={user?.isActive ? "success" : "danger"}>
                  {user?.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge variant={user?.role === "doctor" ? "info" : "default"}>
                  {user?.role?.charAt(0)?.toUpperCase() + user?.role?.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">Bio</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {user?.currentLocation?.placeName || "--"}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {user?.bio || "--"}
            </p>
          </div>
        </div>

        {/* User Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">Username</p>
            <p className="font-medium text-gray-900 dark:text-white">
              @{user?.username || "--"}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">Gender</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {user?.gender?.charAt(0)?.toUpperCase() +
                user?.gender?.slice(1) || "--"}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Member Since
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatDate(user?.createdAt)}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Profile Completion Status
            </p>
            <Badge
              variant={user?.isProfileCompleted ? "success" : "warning"}
              className="mt-1.5"
            >
              {user?.isProfileCompleted ? "Completed" : "Incomplete"}
            </Badge>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Followers
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {user?.followersCount ? formatNumber(user?.followersCount) : 0}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Following
            </p>
            <p className="font-medium text-gray-900 dark:text-white">
              {user?.followingCount ? formatNumber(user?.followingCount) : 0}
            </p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "reports" && (
        <DataTable
          title="Submitted Reports"
          data={reportsData || []}
          columns={reportColumns}
          loading={reportsLoading}
          pageSize={reportsLimit}
          currentPage={reportsPage}
          onPageChange={(p) => setReportsPage(p)}
          onPageSizeChange={(s) => {
            setReportsLimit(s);
            setReportsPage(1);
          }}
          totalData={reportsTotalData}
          totalPages={reportsTotalPages}
        />
      )}

      {activeTab === "orders" && (
        <DataTable
          title="Orders"
          data={ordersData || []}
          columns={orderColumns}
          loading={ordersLoading}
          pageSize={ordersLimit}
          currentPage={ordersPage}
          onPageChange={(p) => setOrdersPage(p)}
          onPageSizeChange={(s) => {
            setOrdersLimit(s);
            setOrdersPage(1);
          }}
          totalData={ordersTotalData}
          totalPages={ordersTotalPages}
        />
      )}

      {activeTab === "consultations" && (
        <DataTable
          title="Consultations"
          data={consultData || []}
          columns={consultationColumns}
          loading={consultLoading}
          pageSize={consultLimit}
          currentPage={consultPage}
          onPageChange={(p) => setConsultPage(p)}
          onPageSizeChange={(s) => {
            setConsultLimit(s);
            setConsultPage(1);
          }}
          totalData={consultTotalData}
          totalPages={consultTotalPages}
        />
      )}

      {activeTab === "questionnaire" && (
        <Card className="p-6">
          {questionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : questionsData?.questions && questionsData.questions.length > 0 ? (
            <div className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Symptom Questionnaire Report
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Submitted on {formatDate(questionsData?.createdAt)}
                </p>
              </div>

              <div className="grid gap-4">
                {questionsData.questions.map((item, idx) => (
                  <div
                    key={item._id || idx}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-6 h-6 rounded-full bg-primary-100/20 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-semibold">
                            {idx + 1}
                          </span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {item.question}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={item.answer?.toLowerCase() === "yes" ? "success" : "danger"}
                        className="flex-shrink-0"
                      >
                        {item.answer?.charAt(0)?.toUpperCase() + item.answer?.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Report Summary
                </h3>
                <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                  <p>
                    <span className="font-medium">Total Questions:</span> {questionsData.questions.length}
                  </p>
                  <p>
                    <span className="font-medium">Yes Responses:</span>{" "}
                    {questionsData.questions.filter((q) => q.answer?.toLowerCase() === "yes").length}
                  </p>
                  <p>
                    <span className="font-medium">No Responses:</span>{" "}
                    {questionsData.questions.filter((q) => q.answer?.toLowerCase() === "no").length}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                No symptom questionnaire data available for this patient.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          title="Order Details"
          size="lg"
        >
          <div className="space-y-6">
            {/* Order Header */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Order {selectedOrder?._id}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDateTime(selectedOrder?.createdAt)}
                </p>
              </div>
              <Badge
                variant={
                  selectedOrder?.status === "delivered" ? "success" : "warning"
                }
              >
                {selectedOrder?.status}
              </Badge>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Items
              </h4>
              {selectedOrder?.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item?.product?.name}
                    </p>
                    <div className="flex items-center gap-5">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Qty: {item?.quantity}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Price: {formatCurrency(item?.product?.price)}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(
                      (item?.product?.price || 0) * item?.quantity
                    )}
                  </p>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(selectedOrder?.totalAmount / 100)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Payment Status:
                </span>
                <Badge
                  variant={
                    selectedOrder?.payment?.status === "succeeded"
                      ? "success"
                      : "warning"
                  }
                >
                  {selectedOrder?.payment?.status}
                </Badge>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UserDetails;
