import React, { useState, useEffect } from "react";
import { Bell, Eye, Trash2, Plus, Users } from "lucide-react";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import TextArea from "../components/ui/TextArea";
import { useForm } from "react-hook-form";
import { formatDateTime } from "../utils/helpers";
import { PAGINATION_CONFIG } from "../config/constants";
import useNotificationActions from "../hooks/notifications/useNotificationActions";

const Notifications = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.defaultPageSize);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  // Add delete modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const {
    notifications,
    loading,
    loadingActions,
    pagination,
    getNotifications,
    create,
    remove,
  } = useNotificationActions(currentPage, pageSize);

  useEffect(() => {
    getNotifications(currentPage, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (value, notification) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500 truncate max-w-xs">
            {notification.body}
          </p>
        </div>
      ),
    },
    {
      key: "senderUser",
      label: "Sender",
      render: (value) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {value?.fullName || "System"}
          </p>
          <p className="text-sm text-gray-500">{value?.email || "-"}</p>
        </div>
      ),
    },

    {
      key: "createdAt",
      label: "Created",
      render: (value) => (
        <div className="text-sm">
          <p className="text-gray-900 dark:text-white">
            {new Date(value).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(value).toLocaleTimeString()}
          </p>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, notification) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(notification)}
            icon={<Eye className="w-4 h-4" />}
            title="View Details"
            disabled={isLoading}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(notification)}
            icon={
              deletingId === notification._id ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                </svg>
              ) : (
                <Trash2 className="w-4 h-4" />
              )
            }
            title="Delete"
            disabled={isLoading || deletingId === notification._id}
          />
        </div>
      ),
    },
  ];

  const handleCreate = () => {
    if (isLoading) return;
    reset();
    setShowCreateModal(true);
  };

  const handleView = (notification) => {
    setSelectedNotification(notification);
    setShowDetailModal(true);
  };

  const handleDelete = (notification) => {
    setNotificationToDelete(notification);
    setShowDeleteConfirm(true);
  };

  const handleDeleteYes = async () => {
    if (!notificationToDelete || !notificationToDelete._id) return;
    setDeletingId(notificationToDelete._id);
    await remove(notificationToDelete._id);
    setShowDeleteConfirm(false);
    setNotificationToDelete(null);
    setDeletingId(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setNotificationToDelete(null);
    setDeletingId(null);
  };

  // Disable actions while loading
  const isLoading = loading || loadingActions;

  const onSubmit = async (data) => {
    const payload = {
      title: data.title,
      body: data.message,
    };

    const success = await create(payload);
    if (success) {
      setShowCreateModal(false);
    }
  };

  // Calculate stats from API response
  const totalCount = pagination?.total ?? notifications?.length ?? 0;
  const totalPages = pagination?.totalPages ?? Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className={`p-4 ${loading ? "opacity-60" : ""}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Notifications
              </p>
              <p className="text-2xl font-bold text-green-600">
                {loading ? "-" : totalCount}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Bell className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Notifications Table */}
      <DataTable
        title="Notifications"
        data={notifications}
        columns={columns}
        onAdd={handleCreate}
        filterable={true}
        loading={loading}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        totalPages={totalPages}
        totalData={totalCount}
      />

      {/* Create Notification Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => !loadingActions && setShowCreateModal(false)}
        title="Create Notification"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Title"
            maxlength={30}
            {...register("title", { required: "Title is required" })}
            error={errors.title?.message}
            placeholder="Enter notification title"
            disabled={loadingActions}
          />

          <TextArea
            label="Message"
            maxlength={280}
            {...register("message", { required: "Message is required" })}
            rows={4}
            placeholder="Enter notification message"
            error={errors.message?.message}
            disabled={loadingActions}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              disabled={loadingActions}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loadingActions}
              disabled={loadingActions}
            >
              Create
            </Button>
          </div>
        </form>
      </Modal>

      {/* Notification Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Notification Details"
        size="lg"
      >
        {selectedNotification && (
          <div className="space-y-4">
            {/* Notification Header */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {selectedNotification.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {selectedNotification.body}
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    Sender:
                  </p>
                  <p>
                    {selectedNotification.senderUser?.fullName || "System"} (
                    {selectedNotification.senderUser?.email || "N/A"})
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    Created:
                  </p>
                  <p>{formatDateTime(selectedNotification.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={handleDeleteCancel}
        title="Delete Notification"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete
            <span className="font-semibold">
              {" "}
              "{notificationToDelete?.title}"
            </span>
            ?
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={handleDeleteCancel}
              variant="secondary"
              disabled={deletingId !== null}
            >
              No, Cancel
            </Button>
            <Button
              onClick={handleDeleteYes}
              variant="danger"
              loading={deletingId !== null}
              disabled={deletingId !== null}
            >
              {deletingId ? "Deleting..." : "Yes, Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Notifications;
