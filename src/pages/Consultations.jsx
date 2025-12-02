import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Loader2,
  Phone,
  Clock,
  Zap,
  TrendingUp,
  User,
  Calendar,
} from "lucide-react";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
} from "../utils/helpers";
import { PAGINATION_CONFIG } from "../config/constants";
import useConsultationActions from "../hooks/consultations/useConsultationActions";
import FilterBar from "../components/ui/FilterBar";
import StatsCard from "../components/common/StatsCard";
import useDebounce from "../hooks/global/useDebounce";

const Consultations = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.defaultPageSize);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  const defaultFilters = {
    when: "",
    status: "",
    search: "",
    startDate: "",
    endDate: "",
  };
  const [filters, setFilters] = useState(defaultFilters);
  const [apiFilters, setApiFilters] = useState(defaultFilters);
  const [search, setSearch] = useState("");
  const searchDebounce = useDebounce(search);

  const formattedFilters = [
    {
      key: "when",
      label: "Time Period",
      type: "select",
      value: filters.when,
      onChange: (value) => setFilters({ ...filters, when: value }),
      options: [
        { value: "today", label: "Today" },
        { value: "past", label: "Past" },
      ],
    },
    {
      key: "status",
      label: "Consultation Status",
      type: "select",
      value: filters.status,
      onChange: (value) => setFilters({ ...filters, status: value }),
      options: [
        { value: "pending", label: "Pending" },
        { value: "active", label: "Active" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
      ],
    },
  ];

  const {
    consultations,
    stats,
    totalPages,
    totalData,
    loading,
    statsLoading,
    getConsultations,
    getStats,
  } = useConsultationActions(
    apiFilters.when,
    apiFilters.status,
    apiFilters.search,
    currentPage,
    pageSize,
    apiFilters.startDate,
    apiFilters.endDate
  );

  // Fetch stats only once on component mount
  useEffect(() => {
    getStats();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setApiFilters(filters);
  }, [filters]);

  // When debounced search changes, update API filters and reset page
  useEffect(() => {
    setCurrentPage(1);
    setApiFilters((prev) => ({ ...prev, search: searchDebounce }));
  }, [searchDebounce]);

  const columns = [
    {
      key: "_id",
      label: "Consultation ID",
      render: (_, consult) => (
        <span className="font-mono text-sm font-medium truncate">
          {consult?._id?.slice(0, 12)}...
        </span>
      ),
    },
    {
      key: "patient",
      label: "Patient",
      render: (_, consult) => {
        const patient = consult?.patient;
        return (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-100/30 rounded-full flex items-center justify-center overflow-hidden">
              {patient?.profilePicURL && !imageErrors[consult?._id] ? (
                <img
                  src={patient?.profilePicURL}
                  alt={patient?.fullName || "Patient"}
                  className="object-cover w-full h-full"
                  onError={() =>
                    setImageErrors((prev) => ({
                      ...prev,
                      [consult?._id]: true,
                    }))
                  }
                />
              ) : (
                <span className="text-primary-600 font-medium text-sm">
                  {patient?.fullName?.charAt(0)?.toUpperCase() || "P"}
                </span>
              )}
            </div>
            <div>
              <p className="font-medium text-sm text-gray-900 dark:text-white">
                {patient?.fullName || "--"}
              </p>
              <p className="text-xs text-gray-500">{patient?.email || "--"}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "doctor",
      label: "Doctor",
      render: (_, consult) => {
        const doctor = consult?.doctor;
        return (
          <div>
            <p className="font-medium text-sm text-gray-900 dark:text-white">
              {doctor?.fullName || "--"}
            </p>
            <p className="text-xs text-gray-500">{doctor?.email || "--"}</p>
          </div>
        );
      },
    },
    {
      key: "purchasedMinutes",
      label: "Minutes",
      render: (_, consult) => (
        <p className="font-medium text-gray-900 dark:text-white">
          {consult?.purchasedMinutes || 0} min
        </p>
      ),
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
        return (
          <Badge variant={paymentVariant}>
            {consult?.paymentStatus || "N/A"}
          </Badge>
        );
      },
    },
    {
      key: "createdAt",
      label: "Booked",
      render: (_, consult) => (
        <p className="text-sm text-gray-900 dark:text-white">
          {formatDate(consult?.createdAt)}
        </p>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, consult) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedConsultation(consult);
            setShowDetailModal(true);
          }}
          icon={<Eye className="w-4 h-4" />}
          title="View Details"
        />
      ),
    },
  ];

  const handlePageChange = (page) => {
    if (page) setCurrentPage(page);
  };

  const handlePageSizeChange = (pageSize) => {
    if (pageSize) {
      setCurrentPage(1);
      setPageSize(pageSize);
    }
  };

  const consultationStats = useMemo(
    () => [
      {
        title: "Total Booked",
        value: formatNumber(stats?.totalConsultationsBooked || 0),
        icon: Phone,
        color: "text-blue-600",
        bgColor: "bg-blue-600/20",
      },
      {
        title: "Revenue",
        value: formatCurrency(stats?.totalRevenueGenerated || 0),
        icon: TrendingUp,
        color: "text-green-600",
        bgColor: "bg-green-600/20",
      },
      {
        title: "Top Doctor",
        value: stats?.mostConsultationsBooked?.doctorName || "N/A",
        subtitle: `ID: ${stats?.mostConsultationsBooked?.doctorId || ""} • ${
          stats?.mostConsultationsBooked?.count || 0
        } consultations • ${formatCurrency(
          stats?.mostConsultationsBooked?.revenue || 0
        )}`,
        icon: User,
        color: "text-purple-600",
        bgColor: "bg-purple-600/20",
      },
    ],
    [stats]
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {consultationStats?.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            description={stat.subtitle}
            icon={stat.icon ? <stat.icon /> : null}
            colored
            index={index}
          />
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          <FilterBar
            filters={formattedFilters}
            onClear={() => {
              setFilters(defaultFilters);
              setSearch("");
            }}
          />
        </div>
      </Card>

      {/* Consultations Table */}
      <DataTable
        title="Consultations"
        data={consultations}
        columns={columns}
        loading={loading}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        totalPages={totalPages}
        totalData={totalData}
        searchable
        searchTerm={search}
        onSearch={(value) => {
          setSearch(value);
        }}
      />

      {/* Consultation Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Consultation Details"
        size="lg"
      >
        {selectedConsultation && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Consultation {selectedConsultation?._id}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Booked on {formatDateTime(selectedConsultation?.createdAt)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant={
                    selectedConsultation?.status === "pending"
                      ? "warning"
                      : selectedConsultation?.status === "active"
                      ? "info"
                      : selectedConsultation?.status === "completed"
                      ? "success"
                      : "danger"
                  }
                >
                  {selectedConsultation?.status}
                </Badge>
              </div>
            </div>

            {/* Patient & Doctor Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Patient Information
                </h4>
                <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-sm">
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      Name:
                    </span>{" "}
                    <span className="text-gray-900 dark:text-white">
                      {selectedConsultation?.patient?.fullName || "--"}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      Email:
                    </span>{" "}
                    <span className="text-gray-900 dark:text-white">
                      {selectedConsultation?.patient?.email || "--"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Doctor Information
                </h4>
                <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-sm">
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      Name:
                    </span>{" "}
                    <span className="text-gray-900 dark:text-white">
                      {selectedConsultation?.doctor?.fullName || "--"}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      Email:
                    </span>{" "}
                    <span className="text-gray-900 dark:text-white">
                      {selectedConsultation?.doctor?.email || "--"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Consultation Details */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Consultation Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Minutes
                  </p>
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {selectedConsultation?.purchasedMinutes || 0} min
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Amount
                  </p>
                  <p className="text-gray-900 dark:text-white font-semibold">
                    {formatCurrency(selectedConsultation?.amount || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Payment Status
                  </p>
                  <Badge
                    variant={
                      selectedConsultation?.paymentStatus === "paid"
                        ? "success"
                        : selectedConsultation?.paymentStatus === "pending"
                        ? "warning"
                        : "danger"
                    }
                    className="inline-block"
                  >
                    {selectedConsultation?.paymentStatus || "N/A"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Consultation Status
                  </p>
                  <Badge
                    variant={
                      selectedConsultation?.status === "pending"
                        ? "warning"
                        : selectedConsultation?.status === "active"
                        ? "info"
                        : selectedConsultation?.status === "completed"
                        ? "success"
                        : "danger"
                    }
                    className="inline-block"
                  >
                    {selectedConsultation?.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Started
                  </p>
                  <p className="text-gray-900 dark:text-white text-sm">
                    {selectedConsultation?.startedAt
                      ? formatDateTime(selectedConsultation?.startedAt)
                      : "--"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Ended
                  </p>
                  <p className="text-gray-900 dark:text-white text-sm">
                    {selectedConsultation?.endedAt
                      ? formatDateTime(selectedConsultation?.endedAt)
                      : "--"}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            {selectedConsultation?.paymentIntentId && (
              <div className="space-y-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                <p className="text-xs font-medium text-blue-900 dark:text-blue-100">
                  Payment Intent ID
                </p>
                <p className="text-sm font-mono text-blue-800 dark:text-blue-200 break-all">
                  {selectedConsultation?.paymentIntentId}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Consultations;
