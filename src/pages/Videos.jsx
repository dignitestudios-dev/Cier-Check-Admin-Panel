import React, { useState, useMemo, useEffect, memo } from "react";
import {
  Film,
  Plus,
  Edit,
  Trash2,
  Search,
  AlertCircle,
  CheckCircle,
  Loader,
} from "lucide-react";
import { PAGINATION_CONFIG } from "../config/constants";
import useVideoActions from "../hooks/videos/useVideoActions";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import TextArea from "../components/ui/TextArea";
import { convertYoutubeUrl } from "../utils/youtubeHelper";

// Memoized Video Card Component to prevent unnecessary re-renders
const VideoCard = memo(({ video, onEdit, onDelete, isDeleting }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
    {/* Video Thumbnail */}
    <div
      className="relative w-full bg-black overflow-hidden"
      style={{ paddingBottom: "56.25%" }}
    >
      <iframe
        src={video.embedLink}
        title={video.title}
        className="absolute top-0 left-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>

    {/* Card Content */}
    <div className="p-4 flex-1 flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
        {video.title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 flex-1">
        {video.description}
      </p>

      {/* Video ID */}
      <div className="mt-3">
        <p className="text-xs text-gray-500 dark:text-gray-400">YouTube ID:</p>
        <p className="font-mono w-fit text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full mt-1 text-gray-700 dark:text-gray-300">
          {video.youtubeVideoId}
        </p>
      </div>

      {/* Created Date */}
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        <p>Created: {new Date(video.createdAt).toLocaleDateString()}</p>
      </div>
    </div>

    {/* Card Footer - Actions */}
    <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex gap-2">
      <Button
        onClick={() => onEdit(video)}
        icon={<Edit className="w-4 h-4" />}
        label="Edit"
        variant="secondary"
        size="sm"
        className="flex-1"
      />
      <Button
        onClick={() => onDelete(video)}
        icon={
          isDeleting ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )
        }
        label="Delete"
        variant="ghost"
        size="sm"
        className="flex-1 text-red-600 hover:text-red-700 dark:hover:text-red-500"
        disabled={isDeleting}
      />
    </div>
  </div>
));

VideoCard.displayName = "VideoCard";

const Videos = () => {
  // Removed useApp.addNotification usage to avoid blocking modal lifecycle
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.defaultPageSize);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    embedLink: "",
  });
  const [youtubeUrlInput, setYoutubeUrlInput] = useState("");
  const [urlConversionResult, setUrlConversionResult] = useState(null);
  const [previewError, setPreviewError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [charCounts, setCharCounts] = useState({
    title: 0,
    description: 0,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [deletingVideoId, setDeletingVideoId] = useState(null);

  const {
    videos,
    loading,
    loadingActions,
    stats,
    totalPages,
    totalData,
    createVideo,
    updateVideo,
    deleteVideo,
  } = useVideoActions(debouncedSearch, currentPage, pageSize);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const validateYoutubeEmbedLink = (embedLink) => {
    if (!embedLink || typeof embedLink !== "string") {
      return {
        isValid: false,
        error: "Embed link must be a non-empty string",
      };
    }

    const trimmedLink = embedLink.trim();

    // Regex to match YouTube embed URLs
    const patterns = [
      /^https:\/\/www\.youtube\.com\/embed\/([a-zA-Z0-9_-]{11})$/,
      /^https:\/\/www\.youtube-nocookie\.com\/embed\/([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
      const match = trimmedLink.match(pattern);
      if (match && match[1]) {
        return { isValid: true, error: null };
      }
    }

    return {
      isValid: false,
      error:
        "Invalid YouTube embed link. Use: https://www.youtube.com/embed/VIDEO_ID (VIDEO_ID must be 11 characters)",
    };
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title || formData.title.trim().length === 0) {
      errors.title = "Title is required";
    } else if (formData.title.length > 200) {
      errors.title = "Title must be less than 200 characters";
    }

    if (!formData.description || formData.description.trim().length === 0) {
      errors.description = "Description is required";
    } else if (formData.description.length > 2000) {
      errors.description = "Description must be less than 2000 characters";
    }

    if (!formData.embedLink || formData.embedLink.trim().length === 0) {
      errors.embedLink = "YouTube embed link is required";
    } else {
      const validation = validateYoutubeEmbedLink(formData.embedLink);
      if (!validation.isValid) {
        errors.embedLink = validation.error;
      }
    }

    return errors;
  };

  const handleOpenModal = (video = null) => {
    if (video) {
      setEditingVideo(video);
      setFormData({
        title: video.title || "",
        description: video.description || "",
        embedLink: video.embedLink || "",
      });
      setCharCounts({
        title: video.title?.length || 0,
        description: video.description?.length || 0,
      });
      // Set URL input to the embed link for editing
      setYoutubeUrlInput(video.embedLink || "");
      setUrlConversionResult({
        videoId: video.youtubeVideoId || "",
        embedLink: video.embedLink || "",
        isValid: true,
        error: null,
      });
    } else {
      setEditingVideo(null);
      setFormData({
        title: "",
        description: "",
        embedLink: "",
      });
      setCharCounts({
        title: 0,
        description: 0,
      });
      setYoutubeUrlInput("");
      setUrlConversionResult(null);
    }
    setPreviewError(null);
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVideo(null);
    setFormData({
      title: "",
      description: "",
      embedLink: "",
    });
    setYoutubeUrlInput("");
    setUrlConversionResult(null);
    setPreviewError(null);
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "title" || name === "description") {
      setCharCounts((prev) => ({
        ...prev,
        [name]: value.length,
      }));
    }

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSaveVideo = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const success = editingVideo
      ? await updateVideo(editingVideo._id, formData)
      : await createVideo(formData);
    console.log("Success: ", success)
    if (success) {
      // Close modal immediately on success
      handleCloseModal();
    } else {
      // Failure: keep modal open and show console error (remove useApp notifications)
      console.error(editingVideo ? "Failed to update video" : "Failed to upload video");
    }
  };

  const handleDeleteConfirm = (video) => {
    setVideoToDelete(video);
    setShowDeleteConfirm(true);
  };

  const handleDeleteYes = async () => {
    if (!videoToDelete) return;

    setDeletingVideoId(videoToDelete._id);
    const success = await deleteVideo(videoToDelete._id);

    if (success) {
      // Close delete modal and clear deleting state immediately
      setShowDeleteConfirm(false);
      setVideoToDelete(null);
      setDeletingVideoId(null);
    } else {
      // Failure: clear deleting state and log error
      setDeletingVideoId(null);
      console.error("Failed to delete video");
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setVideoToDelete(null);
    setDeletingVideoId(null);
  };

  // Handle YouTube URL conversion
  const handleUrlInputChange = (e) => {
    const url = e.target.value;
    setYoutubeUrlInput(url);
    setPreviewError(null);

    if (!url.trim()) {
      setUrlConversionResult(null);
      return;
    }

    const result = convertYoutubeUrl(url);
    if (result.isValid) {
      setUrlConversionResult(result);
      // Auto-fill the embed link
      setFormData((prev) => ({
        ...prev,
        embedLink: result.embedLink,
      }));
      // Clear any previous embed link error
      if (formErrors.embedLink) {
        setFormErrors((prev) => ({
          ...prev,
          embedLink: "",
        }));
      }
    } else {
      setUrlConversionResult(result);
      setPreviewError(result.error);
    }
  };

  // Check if preview should show error (iframe onerror)
  const handlePreviewError = () => {
    setPreviewError(
      "Video preview could not load. This may be a broken link or the video is unavailable."
    );
  };

  const handlePreviewLoad = () => {
    setPreviewError(null);
  };

  // Form completeness check: title, description and a valid embed link are required
  const embedValidation = useMemo(
    () => validateYoutubeEmbedLink(formData.embedLink),
    [formData.embedLink]
  );

  const isFormComplete = useMemo(() => {
    return (
      formData.title?.trim().length > 0 &&
      formData.description?.trim().length > 0 &&
      embedValidation?.isValid
    );
  }, [formData.title, formData.description, embedValidation]);

  const videoStats = useMemo(
    () => [
      {
        title: "Total Videos",
        value: formatNumber(stats?.totalVideos || 0),
        icon: Film,
        color: "text-blue-600",
        bgColor: "bg-blue-600/20",
      },
    ],
    [stats]
  );

  return (
    <div className="space-y-6 fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Videos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage informative and educational videos
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          icon={<Plus className="w-4 h-4" />}
          label="Upload Video"
          variant="primary"
        >
          Upload Video
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {videoStats?.map((stat, index) => (
          <Card key={index}>
            <Card.Content className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>

      {/* Search Bar */}
      <Card>
        <Card.Content>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card.Content>
      </Card>

      {/* Videos Gallery */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Informative Videos
        </h2>

        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Showing {(currentPage - 1) * pageSize + 1} to{" "}
          {Math.min(currentPage * pageSize, totalData)} of {totalData} videos
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
                style={{ paddingBottom: "56.25%" }}
              />
            ))}
          </div>
        ) : videos.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <VideoCard
                  key={video._id}
                  video={video}
                  onEdit={handleOpenModal}
                  onDelete={handleDeleteConfirm}
                  isDeleting={deletingVideoId === video._id}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-end">
              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  variant="secondary"
                  disabled={currentPage === 1}
                  size="sm"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2 px-3 text-sm text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  variant="secondary"
                  disabled={currentPage === totalPages}
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Film className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery
                ? "No videos found matching your search"
                : "No videos yet. Click 'Upload Video' to get started"}
            </p>
          </div>
        )}
      </div>

      {/* Video Upload/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingVideo ? "Edit Video" : "Upload New Video"}
        size="lg"
      >
        <div className="space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter video title"
              maxLength={200}
              className={formErrors.title ? "border-red-500" : ""}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formErrors.title && (
                  <span className="text-red-500">{formErrors.title}</span>
                )}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {charCounts.title}/200
              </p>
            </div>
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <TextArea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter video description"
              maxLength={2000}
              rows={5}
              className={formErrors.description ? "border-red-500" : ""}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formErrors.description && (
                  <span className="text-red-500">{formErrors.description}</span>
                )}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {charCounts.description}/2000
              </p>
            </div>
          </div>

          {/* YouTube URL Input with Auto-Conversion */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              YouTube URL
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Paste any YouTube link: watch URL, short link (youtu.be), or embed
              URL
            </p>
            <Input
              type="text"
              value={youtubeUrlInput}
              onChange={handleUrlInputChange}
              placeholder="Paste any YouTube URL here..."
              className={
                previewError
                  ? "border-red-500"
                  : urlConversionResult?.isValid
                  ? "border-green-500"
                  : ""
              }
            />
            {previewError && (
              <div className="flex items-start gap-2 mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-red-700 dark:text-red-300">
                  {previewError}
                </div>
              </div>
            )}
            {urlConversionResult?.isValid && (
              <div className="flex items-start gap-2 mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-green-700 dark:text-green-300">
                  <p className="font-medium">✓ URL converted successfully</p>
                  <p className="mt-1 font-mono text-green-600 dark:text-green-300">
                    {urlConversionResult.embedLink}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Video Preview */}
          {urlConversionResult?.isValid && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preview
              </label>
              <div
                className="relative w-full bg-black rounded-lg overflow-hidden"
                style={{ paddingBottom: "56.25%" }}
              >
                <iframe
                  src={urlConversionResult.embedLink}
                  title="YouTube video preview"
                  className="absolute top-0 left-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onError={handlePreviewError}
                  onLoad={handlePreviewLoad}
                />
              </div>
              {previewError && (
                <div className="flex items-start gap-2 mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                  <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-yellow-700 dark:text-yellow-300">
                    {previewError}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Display Converted Embed Link */}
          {urlConversionResult?.isValid && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Converted Embed Link
              </label>
              <Input
                type="text"
                value={formData.embedLink}
                readOnly
                className="bg-gray-50 dark:bg-gray-800 cursor-default"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This will be saved automatically
              </p>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={handleCloseModal}
              variant="secondary"
              disabled={loadingActions}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveVideo}
              variant="primary"
              loading={loadingActions}
              disabled={loadingActions || !isFormComplete}
            >
              {loadingActions
                ? "Saving..."
                : editingVideo
                ? "Update Video"
                : "Upload Video"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={handleDeleteCancel}
        title="Delete Video"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete{" "}
            <span className="font-semibold">"{videoToDelete?.title}"</span>?
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This action cannot be undone.
          </p>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={handleDeleteCancel}
              variant="secondary"
              disabled={deletingVideoId !== null}
            >
              No, Cancel
            </Button>
            <Button
              onClick={handleDeleteYes}
              variant="danger"
              loading={deletingVideoId !== null}
              disabled={deletingVideoId !== null}
            >
              {deletingVideoId ? "Deleting..." : "Yes, Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Videos;
