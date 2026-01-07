import React, { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";

const ImageUploader = ({
  multiple = false,
  onChange,
  value = [],
  label = "Upload Image(s)",
  allowUpload = true,
}) => {
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    // Initialize previews based on the value prop. Accept either an array
    // of files/URLs or nested arrays; always flatten.
    const flat = Array.isArray(value) ? value.flat(Infinity) : [];
    const initialPreviews = flat
      .map((file) => {
        if (typeof file === "string") {
          return { url: file, isExisting: true };
        } else if (file instanceof File) {
          return { url: URL.createObjectURL(file), isExisting: false };
        }
        return null;
      })
      .filter(Boolean); // Filter out any null values

    setPreviews(initialPreviews);
  }, [value]);

  const handleFileChange = (event) => {
    if (!allowUpload) return;
    const files = Array.from(event.target.files);
    const validFiles = files.filter((file) => file.type.startsWith("image/"));

    if (validFiles.length === 0) return;

    const currentCount = previews.length;
    const maxAllowed = multiple ? 10 : 1;
    const remaining = maxAllowed - currentCount;

    if (remaining <= 0) return;

    const filesToAdd = validFiles.slice(0, remaining);

    const newPreviews = filesToAdd.map((file) => ({
      url: URL.createObjectURL(file),
      isExisting: false,
    }));
    setPreviews(multiple ? [...previews, ...newPreviews] : newPreviews);

    if (onChange) {
      // Ensure we always emit a flat array. The incoming `value` prop may
      // itself be nested; flatten it first.
      const current = Array.isArray(value) ? value.flat(Infinity) : [];
      const next = multiple ? [...current, ...filesToAdd] : filesToAdd;
      onChange(next);
    }
  };

  const handleRemove = (index) => {
    const imageToRemove = previews[index];

    // Prevent deletion of existing images
    if (imageToRemove.isExisting) return;

    const updatedPreviews = previews.filter((_, i) => i !== index);
    setPreviews(updatedPreviews);

    if (onChange) {
      const current = Array.isArray(value) ? value.flat(Infinity) : [];
      const updatedFiles = current.filter((_, i) => i !== index);
      onChange(updatedFiles);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="flex items-center gap-4 flex-wrap">
        {previews.map((preview, index) => (
          <div
            key={index}
            className="relative w-24 h-24 border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden"
          >
            <img
              src={preview.url}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {!preview.isExisting && (
              <button
                type="button"
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                onClick={() => handleRemove(index)}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}

        {allowUpload && previews.length < 10 && (
          <label className="w-24 h-24 border border-dashed border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center cursor-pointer">
            {multiple ? (
              <Plus className="w-6 h-6 text-gray-400" />
            ) : !multiple && previews.length === 1 ? (
              <p className="text-sm text-gray-200">Change</p>
            ) : (
              <Plus className="w-6 h-6 text-gray-400" />
            )}
            <input
              type="file"
              accept="image/jpg, image/jpeg, image/png"
              multiple={multiple}
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
