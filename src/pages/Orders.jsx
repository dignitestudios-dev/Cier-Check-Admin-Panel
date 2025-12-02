import { useEffect, useMemo, useState } from "react";
import Select from "../components/ui/Select";
import {
  Eye,
  Edit,
  Truck,
  User,
  MapPin,
  Loader2,
  Package,
  Clock,
  ShieldX,
  PackageSearch,
  PackageCheck,
  DollarSign,
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
import useOrderActions from "../hooks/orders/useOrderActions";
import FilterBar from "../components/ui/FilterBar";
import { useApp } from "../contexts/AppContext";
import StatsCard from "../components/common/StatsCard";

const Orders = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.defaultPageSize);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [newOrderStatus, setNewOrderStatus] = useState("");
  const [imageErrors, setImageErrors] = useState({});

  const defaultFilters = {
    status: "",
    paymentStatus: "",
  };
  const [filters, setFilters] = useState(defaultFilters);
  const [apiFilters, setApiFilters] = useState(defaultFilters);

  const formattedFilters = [
    {
      key: "status",
      label: "Order Status",
      type: "select",
      value: filters.status,
      onChange: (value) => setFilters({ ...filters, status: value }),
      options: [
        { value: "", label: "All" },
        { value: "idle", label: "Idle" },
        { value: "pending", label: "Pending" },
        { value: "processing", label: "Processing" },
        { value: "shipped", label: "Shipped" },
        { value: "delivered", label: "Delivered" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
      ],
    },
    {
      key: "paymentStatus",
      label: "Payment Status",
      type: "select",
      value: filters.paymentStatus,
      onChange: (value) => setFilters({ ...filters, paymentStatus: value }),
      options: [
        { value: "", label: "All" },
        { value: "succeeded", label: "Succeeded" },
        { value: "requires_payment", label: "Requires Payment" },
        { value: "refunded", label: "Refunded" },
      ],
    },
  ];

  const {
    orders,
    stats,
    totalPages,
    totalData,
    loading,
    loadingActions,
    updateOrder,
    getOrders,
  } = useOrderActions(
    apiFilters.status,
    apiFilters.paymentStatus,
    "",
    currentPage,
    pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
    setApiFilters(filters);
  }, [filters]);

  const columns = [
    {
      key: "_id",
      label: "Order ID",
      render: (_, order) => (
        <span className="font-mono text-sm font-medium">{order?._id}</span>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (_, order) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-100/30 rounded-full flex items-center justify-center overflow-hidden relative">
            {order?.user?.profilePicURL && !imageErrors[order?._id] ? (
              <img
                src={order?.user?.profilePicURL}
                alt={order?.user?.fullName || "User"}
                className="object-cover w-full h-full"
                onError={() => setImageErrors((prev) => ({ ...prev, [order?._id]: true }))}
              />
            ) : (
              <span className="text-primary-600 font-medium text-sm">
                {order?.user?.fullName?.charAt(0)?.toUpperCase() || "U"}
              </span>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {order?.user?.fullName || "--"}
            </p>
            <p className="font-medium text-gray-500 dark:text-gray-300">
              <a href={`mailto:${order?.user?.email}`}>{order?.user?.email}</a>
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "items",
      label: "Items",
      render: (_, order) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {order?.items?.length || 0} item
            {(order?.items?.length || 0) !== 1 ? "s" : ""}
          </p>
          <p className="text-sm text-gray-500 truncate max-w-xs">
            {(order?.items || [])
              .map(
                (item) => `${item?.product?.name || "N/A"} (${item.quantity})`
              )
              .join(", ")}
          </p>
        </div>
      ),
    },
    {
      key: "totalAmount",
      label: "Total",
      render: (_, order) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          {formatCurrency(order?.totalAmount / 100)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_, order) => {
        const st = order?.status || "N/A";
        return (
          <Badge
            variant={
              st === "pending"
                ? "warning"
                : st === "completed"
                ? "success"
                : st === "delivered"
                ? "success"
                : st === "shipped"
                ? "info"
                : st === "processing"
                ? "warning"
                : st === "confirmed"
                ? "info"
                : st === "cancelled"
                ? "danger"
                : "default"
            }
          >
            {st.replace ? st.replace("_", " ") : st}
          </Badge>
        );
      },
    },
    {
      key: "payment",
      label: "Payment",
      render: (_, order) => {
        const p = order?.payment?.status || "N/A";
        return (
          <Badge
            variant={
              p === "succeeded"
                ? "success"
                : p === "refunded"
                ? "danger"
                : "warning"
            }
          >
            {p.replace ? p.replace("_", " ") : p}
          </Badge>
        );
      },
    },
    {
      key: "createdAt",
      label: "Order Date",
      render: (_, order) => (
        <div>
          <p className="text-sm">
            {new Date(order?.createdAt).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(order?.createdAt).toLocaleTimeString()}
          </p>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, order) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(order)}
            icon={<Eye className="w-4 h-4" />}
            title="View Details"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleUpdateStatus(order)}
            icon={<Edit className="w-4 h-4" />}
            title="Update Status"
          />
        </div>
      ),
    },
  ];

  const handleView = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = (order) => {
    setEditingOrder(order);
    setNewOrderStatus(order.status); // Set current status as default
  };

  const handleStatusChange = async () => {
    if (editingOrder && newOrderStatus) {
      const success = await updateOrder(editingOrder._id, {
        status: newOrderStatus,
      });
      if (success) {
        setEditingOrder(null);
        getOrders(); // Refresh the orders list
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

  const handleOrdersExport = (data) => {
    return data.map((order) => {
      const items = order.items || [];
      const productStrings = items.map(
        (it) => `${it.product?.name || "Unknown"} x${it.quantity || 0}`
      );
      const totalItems = items.reduce((s, it) => s + (it.quantity || 0), 0);
      return {
        "Order ID": order._id || "",
        Customer: order.user?.email || "",
        Products: productStrings.join(" | ") || "No products",
        "Total Items": totalItems,
        Total: formatCurrency(order.totalAmount / 100) || "N/A",
        "Order Status": order.status.replace("_", " "),
        "Payment Status": order.payment?.status.replace("_", " ") || "",
        Created: formatDate(order.createdAt),
      };
    });
  };

  const orderStats = useMemo(
    () => [
      {
        title: "Total Orders",
        value: formatNumber(stats?.totalOrders || 0),
        icon: Package,
        color: "text-primary-600",
        bgColor: "bg-primary-600/20",
      },
    ],
    [stats]
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {orderStats?.map((stat, index) => (
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
          onClear={() => setFilters(defaultFilters)}
        />
      </Card>

      {/* Orders Table */}
      <DataTable
        title="Orders Management"
        data={orders}
        columns={columns}
        onExport={handleOrdersExport}
        loading={loading}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        totalPages={totalPages}
        totalData={totalData}
        exportable
      />

      {/* Order Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`Order Details`}
        size="xl"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Order {selectedOrder?._id}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Placed on {formatDateTime(selectedOrder?.createdAt)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant={
                    selectedOrder?.status === "pending"
                      ? "warning"
                      : selectedOrder?.status === "completed"
                      ? "success"
                      : selectedOrder?.status === "delivered"
                      ? "success"
                      : selectedOrder?.status === "shipped"
                      ? "info"
                      : selectedOrder?.status === "processing"
                      ? "warning"
                      : selectedOrder?.status === "confirmed"
                      ? "info"
                      : selectedOrder?.status === "cancelled"
                      ? "danger"
                      : "default"
                  }
                >
                  {selectedOrder?.status}
                </Badge>
              </div>
            </div>

            {/* Customer & Address Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Customer Information
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Name
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedOrder?.user?.fullName || "---"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      <a href={`mailto:${selectedOrder?.user?.email}`}>
                        {selectedOrder?.user?.email || "---"}
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Shipping Address
                </h4>
                {selectedOrder?.address && selectedOrder.address.length > 0 ? (
                  <div className="space-y-1 text-gray-900 dark:text-white">
                    <p>
                      <span className="text-sm font-medium text-gray-500">
                        Address:
                      </span>{" "}
                      {selectedOrder.address[0]?.line1}
                    </p>
                    <p>
                      <span className="text-sm font-medium text-gray-500">
                        Address 2:
                      </span>{" "}
                      {selectedOrder.address[0]?.line2 || "--"}
                    </p>
                    <p>
                      <span className="text-sm font-medium text-gray-500">
                        City:
                      </span>{" "}
                      {selectedOrder.address[0]?.city || "--"}
                    </p>
                    <p>
                      <span className="text-sm font-medium text-gray-500">
                        State/Zip:
                      </span>{" "}
                      {selectedOrder.address[0]?.state || "--"} /{" "}
                      {selectedOrder.address[0]?.zip || "--"}
                    </p>
                    <p>
                      <span className="text-sm font-medium text-gray-500">
                        Country:
                      </span>{" "}
                      {selectedOrder.address[0]?.country || "--"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 text-gray-900 dark:text-white">
                    No address provided
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Order Items
              </h4>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {(selectedOrder?.items || []).map((item, idx) => (
                      <tr key={item.product?._id || idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {item.product?.name}
                          <p className="text-gray-400">
                            ID: {item.product?._id}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatCurrency(item.product?.price || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(
                            (item.product?.price || 0) * (item.quantity || 0)
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Order Summary
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Subtotal:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(
                      (selectedOrder?.items || []).reduce(
                        (s, it) =>
                          s + (it?.product?.price || 0) * (it?.quantity || 0),
                        0
                      )
                    )}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Total:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency((selectedOrder?.totalAmount || 0) / 100)}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Payment: {selectedOrder?.payment?.provider || "--"} —{" "}
                    <strong>{selectedOrder?.payment?.status || "--"}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Order Status Modal */}
      {editingOrder && (
        <Modal
          isOpen={!!editingOrder}
          onClose={() => setEditingOrder(null)}
          title="Update Order Status"
        >
          <div className="space-y-4">
            <p className="text-gray-500 dark:text-gray-400">
              Select a new status for the order:
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              Order ID:{" "}
              <span className="font-medium text-gray-800 dark:text-gray-100">
                {editingOrder?._id}
              </span>
            </p>

            <Select
              value={newOrderStatus}
              onChange={(value) => setNewOrderStatus(value)}
              options={[
                { value: "idle", label: "Idle" },
                { value: "pending", label: "Pending" },
                { value: "processing", label: "Processing" },
                { value: "shipped", label: "Shipped" },
                { value: "delivered", label: "Delivered" },
                { value: "completed", label: "Completed" },
                { value: "cancelled", label: "Cancelled" },
              ]}
              disabled={loadingActions}
              error={!newOrderStatus && "Order status is required"}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingOrder(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleStatusChange}
                className="h-10 flex items-center gap-2"
              >
                {loadingActions ? (
                  <div className="flex items-center justify-center py-12 gap-2">
                    <Loader2 className={`animate-spin text-white`} />{" "}
                    <span className="text-white">Updating...</span>
                  </div>
                ) : (
                  "Update"
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Orders;
