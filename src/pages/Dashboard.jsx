import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  DollarSign,
  TrendingUp,
  CreditCard,
  UserCheck,
  Calendar,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CHART_COLORS } from "../config/constants";
import { useApp } from "../contexts/AppContext";
import useAppConfigsActions from "../hooks/app-configs/useAppConfigsActions";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import StatsCard from "../components/common/StatsCard";
import DashboardLoader from "../components/loader/DashboardLoader";
import useGetDashboardAnalytics from "../hooks/dashboard-analytics/useGetDashboardAnalytics";
import useGetDashboardTrends from "../hooks/dashboard/useGetDashboardTrends";
import useTopDoctorsAllTime from "../hooks/dashboard/useTopDoctorsAllTime";
import Select from "../components/ui/Select";

const Dashboard = () => {
  const { addNotification, dashboardAnalytics } = useApp();
  const { loading } = useAppConfigsActions();
  const { loading: loadingAnalytics } = useGetDashboardAnalytics();

  // Granularity and date filters
  const [userRegGranularity, setUserRegGranularity] = useState("daily");
  const [consultationGranularity, setConsultationGranularity] =
    useState("daily");
  const [productGranularity, setProductGranularity] = useState("monthly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // month/year selectors per chart (empty = current)
  const [userRegMonth, setUserRegMonth] = useState("");
  const [userRegYear, setUserRegYear] = useState("");
  const [consultationMonth, setConsultationMonth] = useState("");
  const [consultationYear, setConsultationYear] = useState("");
  const [productMonth, setProductMonth] = useState("");
  const [productYear, setProductYear] = useState("");

  const {
    loadingInitial,
    loadingUser,
    loadingConsultation,
    loadingProduct,
    stats,
    userRegistrationTrends,
    consultationTrends,
    productPurchaseTrends,
  } = useGetDashboardTrends(
    userRegMonth,
    userRegYear,
    consultationMonth,
    consultationYear,
    productMonth,
    productYear
  );

  const { loading: loadingTopDoctors, topDoctors } = useTopDoctorsAllTime();

  console.log("dashboardAnalytics: ", dashboardAnalytics);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "danger";
      default:
        return "default";
    }
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new activity
      const activities = [
        "New user registered",
        "Transaction completed",
        "Support ticket created",
        "User blocked",
        "Notification sent",
      ];

      const randomActivity =
        activities[Math.floor(Math.random() * activities.length)];

      addNotification({
        title: "System Update",
        message: randomActivity,
        type: "info",
      });
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [addNotification]);

  const mainStats = useMemo(
    () => [
      {
        title: "Total Revenue",
        value: formatCurrency(
          stats?.totalOrderRevenue + stats?.totalConsultationRevenue
        ),
        icon: TrendingUp,
      },
      {
        title: "Order Revenue",
        value: formatCurrency(stats?.totalOrderRevenue),
        icon: DollarSign,
      },
      {
        title: "Consultation Revenue",
        value: formatCurrency(stats?.totalConsultationRevenue),
        icon: DollarSign,
      },
      {
        title: "Total Users",
        value: formatNumber(stats?.totalUsers),
        icon: Users,
      },
      {
        title: "Total Doctors",
        value: formatNumber(stats?.totalDoctors),
        icon: UserCheck,
      },
      {
        title: "Total Products",
        value: formatNumber(stats?.totalProducts),
        icon: CreditCard,
      },
    ],
    [stats]
  );

  const monthNamesShort = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const currentDate = new Date();
  const currentMonthName = currentDate.toLocaleString("en-US", {
    month: "short",
  });
  const currentYear = currentDate.getFullYear();

  const monthOptions = [
    { value: "", label: currentMonthName },
    ...monthNamesShort.map((m, i) => ({ value: String(i + 1), label: m })),
  ];

  const yearOptions = [
    ...Array.from({ length: 6 }).map((_, i) => ({
      value: String(currentYear - i),
      label: String(currentYear - i),
    })),
  ];

  const isInitialLoading = loading || loadingAnalytics || loadingInitial;

  return (
    <>
      {isInitialLoading ? (
        <DashboardLoader />
      ) : (
        <div className="space-y-6 fade-in">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Welcome back! Here's what's happening with your platform.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Main Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainStats?.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                change={stat.change}
                changeType={stat.trend === "up" ? "positive" : "negative"}
                icon={stat.icon ? <stat.icon /> : null}
                index={index}
              />
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Registration Trends */}
            <Card className="col-span-2">
              <Card.Header className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    User Registration Trends
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Registrations
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-36">
                    <Select
                      options={monthOptions}
                      value={userRegMonth}
                      onChange={(val) => setUserRegMonth(val)}
                      placeholder={currentMonthName}
                      className="w-full"
                    />
                  </div>
                  <div className="w-28">
                    <Select
                      options={yearOptions}
                      value={userRegYear}
                      onChange={(val) => setUserRegYear(val)}
                      placeholder={String(currentYear)}
                      className="w-full"
                    />
                  </div>
                </div>
              </Card.Header>
              <Card.Content className="chart-container">
                {loadingUser ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="w-full h-56 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                  </div>
                ) : (
                  (() => {
                    const userData = userRegistrationTrends?.chartData || [];
                    if (!userData.length) {
                      return (
                        <div className="h-64 flex flex-col items-center justify-center text-center px-4">
                          <iframe src="https://lottie.host/embed/9d2dcc13-0262-46c9-afab-16b23fd0dfe5/jMCoue4hl6.lottie"></iframe>{" "}
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            No registration data for the selected filters.
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Try changing the month/year to see data.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={userData}>
                          <defs>
                            <linearGradient
                              id="registrationGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#3B82F6"
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor="#3B82F6"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#374151"
                            opacity={0.3}
                          />
                          <XAxis
                            dataKey={
                              userRegistrationTrends?.chartData?.[0]?.date
                                ? "date"
                                : userRegistrationTrends?.chartData?.[0]
                                    ?.weekStart
                                ? "weekStart"
                                : "month"
                            }
                            stroke="#6B7280"
                          />
                          <YAxis stroke="#6B7280" domain={[0, "dataMax"]} />
                          <Tooltip
                            formatter={(value) => [
                              formatNumber(value),
                              "Registrations",
                            ]}
                            contentStyle={{
                              backgroundColor: "#1F2937",
                              border: "1px solid #374151",
                              borderRadius: "8px",
                              color: "#F9FAFB",
                            }}
                          />
                          <Bar dataKey="registrations" fill="#3B82F6" />
                        </BarChart>
                      </ResponsiveContainer>
                    );
                  })()
                )}
              </Card.Content>
            </Card>

            {/* Consultation Trends */}
            <Card>
              <Card.Header className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Consultation Trends
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Revenue
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-36">
                    <Select
                      options={monthOptions}
                      value={consultationMonth}
                      onChange={(val) => setConsultationMonth(val)}
                      placeholder={currentMonthName}
                      className="w-full"
                    />
                  </div>
                  <div className="w-28">
                    <Select
                      options={yearOptions}
                      value={consultationYear}
                      onChange={(val) => setConsultationYear(val)}
                      placeholder={String(currentYear)}
                      className="w-full"
                    />
                  </div>
                </div>
              </Card.Header>
              <Card.Content className="chart-container">
                {loadingConsultation ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="w-full h-56 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                  </div>
                ) : (
                  (() => {
                    const consultData = consultationTrends?.chartData || [];
                    if (!consultData.length) {
                      return (
                        <div className="h-64 flex flex-col items-center justify-center text-center px-4">
                          <iframe src="https://lottie.host/embed/9d2dcc13-0262-46c9-afab-16b23fd0dfe5/jMCoue4hl6.lottie"></iframe>{" "}
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            No consultation revenue data for the selected
                            filters.
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Try selecting a different month/year to see data.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={consultData}>
                          <defs>
                            <linearGradient
                              id="revenueGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor={CHART_COLORS.primary}
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor={CHART_COLORS.primary}
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#374151"
                            opacity={0.3}
                          />
                          <XAxis
                            dataKey={
                              consultationTrends?.chartData?.[0]?.date
                                ? "date"
                                : consultationTrends?.chartData?.[0]?.weekStart
                                ? "weekStart"
                                : "month"
                            }
                            stroke="#6B7280"
                          />
                          <YAxis stroke="#6B7280" domain={[0, "dataMax"]} />
                          <Tooltip
                            formatter={(value) => [
                              formatCurrency(value),
                              "Revenue",
                            ]}
                            contentStyle={{
                              backgroundColor: "#1F2937",
                              border: "1px solid #374151",
                              borderRadius: "8px",
                              color: "#F9FAFB",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke={CHART_COLORS.primary}
                            strokeWidth={2}
                            fill="url(#revenueGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    );
                  })()
                )}
              </Card.Content>
            </Card>

            {/* Charts Section - Row 2 */}
            {/* Product Purchase Trends */}
            <Card>
              <Card.Header className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Product Purchase Trends
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Revenue
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-36">
                    <Select
                      options={monthOptions}
                      value={productMonth}
                      onChange={(val) => setProductMonth(val)}
                      placeholder={currentMonthName}
                      className="w-full"
                    />
                  </div>
                  <div className="w-28">
                    <Select
                      options={yearOptions}
                      value={productYear}
                      onChange={(val) => setProductYear(val)}
                      placeholder={String(currentYear)}
                      className="w-full"
                    />
                  </div>
                </div>
              </Card.Header>
              <Card.Content className="chart-container">
                {loadingProduct ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="w-full h-56 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                  </div>
                ) : (
                  (() => {
                    const productData = productPurchaseTrends?.chartData || [];
                    if (!productData.length) {
                      return (
                        <div className="h-64 flex flex-col items-center justify-center text-center px-4">
                          <iframe src="https://lottie.host/embed/9d2dcc13-0262-46c9-afab-16b23fd0dfe5/jMCoue4hl6.lottie"></iframe>{" "}
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            No product purchase revenue for the selected
                            filters.
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Try adjusting the month/year to see data.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={productData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#374151"
                            opacity={0.3}
                          />
                          <XAxis
                            dataKey={
                              productPurchaseTrends?.chartData?.[0]?.date
                                ? "date"
                                : productPurchaseTrends?.chartData?.[0]
                                    ?.weekStart
                                ? "weekStart"
                                : "month"
                            }
                            stroke="#6B7280"
                          />
                          <YAxis stroke="#6B7280" domain={[0, "dataMax"]} />
                          <Tooltip
                            formatter={(value) => [
                              formatCurrency(value),
                              "Revenue",
                            ]}
                            contentStyle={{
                              backgroundColor: "#1F2937",
                              border: "1px solid #374151",
                              borderRadius: "8px",
                              color: "#F9FAFB",
                            }}
                          />
                          <Bar
                            dataKey="revenue"
                            fill={CHART_COLORS.secondary}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    );
                  })()
                )}
              </Card.Content>
            </Card>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Payment Status */}
            <Card>
              <Card.Header>
                <Card.Title>Order Payment Status</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-3">
                  {stats?.orderPaymentStatus && (
                    <>
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Requires Payment
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {stats.orderPaymentStatus.totalRequiresPayment}{" "}
                            orders
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {formatCurrency(
                            stats.orderPaymentStatus.revenueByPaymentStatus
                              ?.requires_payment || 0
                          )}
                        </p>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Succeeded Payment
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {stats.orderPaymentStatus.totalSucceededPayment}{" "}
                            orders
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                          {formatCurrency(
                            stats.orderPaymentStatus.revenueByPaymentStatus
                              ?.succeeded || 0
                          )}
                        </p>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Refunded Orders
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {stats.orderPaymentStatus.totalRefundedOrders}{" "}
                            orders
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                          {formatCurrency(
                            stats.orderPaymentStatus.revenueByPaymentStatus
                              ?.refunded || 0
                          )}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </Card.Content>
            </Card>

            {/* Order Status Breakdown */}
            <Card>
              <Card.Header>
                <Card.Title>Order Status Breakdown</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-3">
                  {stats?.orderStatus && (
                    <>
                      {stats.orderStatus.processing && (
                        <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              Processing
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {stats.orderStatus.processing.count} orders
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                            {formatCurrency(
                              stats.orderStatus.processing.revenue
                            )}
                          </p>
                        </div>
                      )}

                      {stats.orderStatus.pending && (
                        <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              Pending
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {stats.orderStatus.pending.count} orders
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                            {formatCurrency(stats.orderStatus.pending.revenue)}
                          </p>
                        </div>
                      )}

                      {stats.orderStatus.idle && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              Idle
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {stats.orderStatus.idle.count} orders
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                            {formatCurrency(stats.orderStatus.idle.revenue)}
                          </p>
                        </div>
                      )}

                      {stats.orderStatus.cancelled && (
                        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              Cancelled
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {stats.orderStatus.cancelled.count} orders
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                            {formatCurrency(
                              stats.orderStatus.cancelled.revenue
                            )}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Card.Content>
            </Card>

            {/* Top Doctors by Consultations */}
            <Card>
              <Card.Header>
                <Card.Title>
                  Top Doctors by Consultations
                  <span className="text-gray-400 text-xs block font-normal">
                    (Doctors must have a minimum of 5 completed consultations to
                    qualify for Top Doctor status.)
                  </span>
                </Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                  {loadingTopDoctors ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-full h-14 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
                        />
                      ))}
                    </div>
                  ) : topDoctors?.length ? (
                    topDoctors.map((doctor, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <Badge variant="info">#{index + 1}</Badge>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {doctor?.doctorName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {doctor?.consultations || doctor?.count}{" "}
                              consultations
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(doctor?.revenue)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                      No consultation data available
                    </p>
                  )}
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
