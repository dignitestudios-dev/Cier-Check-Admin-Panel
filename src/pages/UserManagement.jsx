import { useEffect, useMemo, useState } from "react";
import Select from "../components/ui/Select";
import {
  Eye,
  Shield,
  User,
  Users,
  UserCheck,
  UserX,
  Loader2,
} from "lucide-react";
import useDebounce from "../hooks/global/useDebounce";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import { formatDate, formatDateTime, formatNumber } from "../utils/helpers";
import { PAGINATION_CONFIG } from "../config/constants";
import useUserActions from "../hooks/users/useUserActions";
import FilterBar from "../components/ui/FilterBar";
import StatsCard from "../components/common/StatsCard";
import { useNavigate } from "react-router-dom";

const UserManagement = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.defaultPageSize);
  const [search, setSearch] = useState("");
  const searchDebounce = useDebounce(search);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [togglingUser, setTogglingUser] = useState(null);
  const [newUserStatus, setNewUserStatus] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  const defaultFilters = {
    role: "",
    isActive: "",
    search: "",
  };
  const [filters, setFilters] = useState(defaultFilters);
  const [apiFilters, setApiFilters] = useState(defaultFilters);

  const formattedFilters = [
    {
      key: "role",
      label: "User Type",
      type: "select",
      value: filters.role,
      onChange: (value) => setFilters({ ...filters, role: value }),
      options: [
        { value: "patient", label: "Patient" },
        { value: "doctor", label: "Doctor" },
      ],
    },
    {
      key: "isActive",
      label: "Status",
      type: "select",
      value: filters.isActive,
      onChange: (value) => setFilters({ ...filters, isActive: value }),
      options: [
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
  ];

  const {
    users,
    stats,
    totalPages,
    totalData,
    loading,
    loadingActions,
    updateUserStatus,
    getUsers,
  } = useUserActions(
    apiFilters.role,
    apiFilters.isActive,
    apiFilters.search,
    currentPage,
    pageSize
  );

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
      label: "User ID",
      render: (_, user) => (
        <span className="font-mono text-sm font-medium">
          {user?._id}
        </span>
      ),
    },
    {
      key: "fullName",
      label: "Name",
      render: (_, user) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-100/30 rounded-full flex items-center justify-center overflow-hidden relative">
            {user?.profilePicURL && !imageErrors[user?._id] ? (
              <img
                src={user?.profilePicURL}
                alt={user?.fullName || "User"}
                className="object-cover w-full h-full"
                onError={() => setImageErrors((prev) => ({ ...prev, [user?._id]: true }))}
              />
            ) : (
              <span className="text-primary-600 font-medium text-sm">
                {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
              </span>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {user?.fullName || "--"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user?.username || "--"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (_, user) => (
        <a
          href={`mailto:${user?.email}`}
          className="text-primary-600 dark:text-primary-400 hover:underline"
        >
          {user?.email || "--"}
        </a>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (_, user) => (
        <Badge variant={user?.role === "doctor" ? "info" : "default"}>
          {user?.role?.charAt(0)?.toUpperCase() + user?.role?.slice(1) || "--"}
        </Badge>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (_, user) => (
        <Badge variant={user?.isActive ? "success" : "danger"}>
          {user?.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (_, user) => (
        <div className="text-sm">
          <p>{formatDate(user?.createdAt)}</p>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, user) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/users/${user?._id}`)}
            icon={<Eye className="w-4 h-4" />}
            title="View Details"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleStatus(user)}
            icon={
              <Shield
                className={`w-4 h-4 ${
                  user?.isActive ? "text-green-600" : "text-red-600"
                }`}
              />
            }
            title={user?.isActive ? "Deactivate User" : "Activate User"}
          />
        </div>
      ),
    },
  ];

  const handleToggleStatus = (user) => {
    setTogglingUser(user);
    setNewUserStatus(!user.isActive);
    setShowStatusModal(true);
  };

  const handleStatusChange = async () => {
    if (togglingUser && newUserStatus !== null) {
      const success = await updateUserStatus(togglingUser._id, newUserStatus);
      if (success) {
        setShowStatusModal(false);
        setTogglingUser(null);
        setNewUserStatus(null);
        getUsers();
      }
    }
  };

  const handlePageChange = (page) => {
    if (page) setCurrentPage(page);
  };

  const handlePageSizeChange = (pageSize) => {
    if (pageSize) {
      setCurrentPage(1);
      setPageSize(pageSize);
    }
  };

  const userStats = useMemo(
    () => [
      {
        title: "Total Users",
        value: formatNumber(stats?.totalUsers || 0),
        icon: Users,
        color: "text-primary-600",
        bgColor: "bg-primary-600/20",
      },
    ],
    [stats]
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {userStats?.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon ? <stat.icon /> : null}
            colored
            index={index}
          />
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <FilterBar
          filters={formattedFilters}
          onClear={() => {
            setFilters(defaultFilters);
            setSearch("");
          }}
        />
      </Card>

      {/* Users Table */}
      <DataTable
        title="User Management"
        data={users}
        searchable
        searchTerm={search}
        onSearch={(value) => {
          setSearch(value);
        }}
        columns={columns}
        loading={loading}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        totalPages={totalPages}
        totalData={totalData}
      />

      {/* Toggle Status Modal */}
      {togglingUser && (
        <Modal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          title="Change User Status"
        >
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to{" "}
              {newUserStatus ? "activate" : "deactivate"} this user?
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                User Details:
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {togglingUser?.fullName}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {togglingUser?.email}
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowStatusModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant={newUserStatus ? "success" : "danger"}
                onClick={handleStatusChange}
                className="h-10 flex items-center gap-2"
              >
                {loadingActions ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin w-4 h-4" />
                    <span>Updating...</span>
                  </div>
                ) : newUserStatus ? (
                  "Activate"
                ) : (
                  "Deactivate"
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UserManagement;
