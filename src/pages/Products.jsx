import { useMemo, useState } from "react";
import Select from "../components/ui/Select";
import { Edit, Trash2, Eye, Loader2, Truck, MapPin } from "lucide-react";
import DataTable from "../components/common/DataTable";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import TextArea from "../components/ui/TextArea";
import { useForm, Controller } from "react-hook-form";
import { formatCurrency, formatDate } from "../utils/helpers";
import useGetAllProducts from "../hooks/products/useGetAllProducts";
import { PAGINATION_CONFIG } from "../config/constants";
import useDebounce from "../hooks/global/useDebounce";
import useGetAllCategories from "../hooks/categories/useGetAllCategories";
import TagInput from "../components/ui/TagInput";
import useProductActions from "../hooks/products/useProductActions";
import useCreateProduct from "../hooks/products/useCreateProduct";
import ImageUploader from "../components/ui/ImageUploader";
import ImagesGallery from "../components/ui/ImagesGallery";
import toast from "react-hot-toast";

const Products = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGINATION_CONFIG.defaultPageSize);
  const [search, setSearch] = useState("");
  const searchDebounce = useDebounce(search);

  // Product hooks
  const { loading, products, totalPages, totalData, getAllProducts } =
    useGetAllProducts(searchDebounce, currentPage, pageSize);
  const { loading: loadingCreateProduct, createProduct } = useCreateProduct();
  const {
    loading: loadingProductActions,
    updateProduct,
    deleteProduct,
  } = useProductActions();

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [showViewProductModal, setShowViewProductModal] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);

  const defaultValues = {
    name: "",
    description: "",
    price: null,
    images: [],
    category: "",
  };

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({ defaultValues });

  const columns = [
    {
      key: "_id",
      label: "ID",
    },
    {
      key: "name",
      label: "Product Name",
    },
    {
      key: "category",
      label: "Category",
      render: (value) => <p className="truncate w-56">{value ? value : "- - -"}</p>,
    },
    {
      key: "price",
      label: "Price",

      render: (value) => formatCurrency(value),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (value) => formatDate(value),
    },
    {
      key: "actions",
      label: "Actions",

      render: (_, product) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(product)}
            icon={<Eye className="w-4 h-4" />}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(product)}
            icon={<Edit className="w-4 h-4" />}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(product._id)}
            disabled={loadingProductActions}
            icon={<Trash2 className="w-4 h-4" />}
          />
        </div>
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

  const handleSearch = (search) => {
    setCurrentPage(1);
    setSearch(search);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    reset(defaultValues);
    setShowModal(true);
  };

  const handleEdit = (product) => {
    // Prepare minimal fields for editing. Images are not editable.
    const formattedProduct = {
      name: product.name,
      description: product.description,
      price: product.price,
      _id: product._id,
    };

    setEditingProduct(product);
    reset({
      name: formattedProduct.name,
      description: formattedProduct.description,
      price: formattedProduct.price,
      images: [],
      category: product.category || "",
    });
    setShowModal(true);
  };

  const handleView = (product) => {
    setViewingProduct(product);
    setShowViewProductModal(true);
  };

  const handleDelete = async (productId) => {
    console.log(productId);
    const success = await deleteProduct(productId);
    if (success) {
      getAllProducts();
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    reset(defaultValues);
  };

  const handleProductExport = (data) => {
    // Transform data to match your table display
    return data.map((product) => ({
      ID: product._id || "",
      "Product Name": product.name || "",
      Price: formatCurrency(product.price),
      Created: formatDate(product.createdAt),
    }));
  };

  const onSubmit = async (data) => {
    // Convert receivingOptions to array
    const receivingOptions =
      data.receivingOptions === "delivery"
        ? ["delivery"]
        : data.receivingOptions === "pickup"
        ? ["pickup"]
        : data.receivingOptions === "both"
        ? ["delivery", "pickup"]
        : [];

    try {
      if (editingProduct) {
        // Build plain JSON payload (no FormData) and do NOT update images
        const productId = editingProduct._id;
        const payload = {
          name: data.name,
          description: data.description,
          price: parseFloat(data.price),
          category: data.category || "",
        };

        const success = await updateProduct(productId, payload); // JSON
        if (success) {
          reset(defaultValues);
          setShowModal(false);
          getAllProducts();
        }
      } else {
        // For create, need FormData for images
        const formData = new FormData();

        // Append scalar fields
        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("price", data.price);
        formData.append("category", data.category || "");

        // Append files (images)
        // Flatten files in case the uploader returned nested arrays
        const rawImages = data.images || [];
        const flattenFiles = rawImages
          .flat(Infinity)
          .filter((f) => f instanceof File);

        if (flattenFiles.length > 0) {
          flattenFiles.forEach((file) => {
            formData.append("images", file);
          });
        } else {
          toast.error("Please upload at least one image");
          return;
        }

        const success = await createProduct(formData);
        if (success) {
          reset(defaultValues);
          setShowModal(false);
          getAllProducts();
        }
      }
    } catch (error) {
      console.error("Error creating/updating product:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <DataTable
          title="Products Management"
          loading={loading}
          data={products}
          columns={columns}
          onExport={handleProductExport}
          onAdd={handleAdd}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          totalPages={totalPages}
          totalData={totalData}
          searchTerm={search}
          onSearch={(value) => handleSearch(value)}
          searchable
          exportable
        />

        {/* Create/Edit Product Modal */}
        <Modal
          isOpen={showModal}
          onClose={handleModalClose}
          title={editingProduct ? "Edit Product" : "Add New Product"}
          size="lg"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-full">
                <Input
                  label="Product Name"
                  {...register("name", {
                    required: "Product name is required",
                  })}
                  maxLength={30}
                  disabled={loadingCreateProduct}
                  error={errors.name?.message}
                />
              </div>

              <Input
                label="Category"
                {...register("category")}
                maxLength={30}
                disabled={loadingCreateProduct}
                error={errors.category?.message}
              />

              <Input
                label="Price"
                type="number"
                step="0.01"
                {...register("price", {
                  required: "Price is required",
                  min: { value: 0.01, message: "Price must be greater than 0" },
                })}
                disabled={loadingCreateProduct}
                error={errors.price?.message}
              />
            </div>

            <TextArea
              label="Description"
              {...register("description", {
                required: "Product description is required",
              })}
              rows={4}
              maxLength={310}
              placeholder="Enter product description"
              error={errors.description?.message}
              disabled={loadingCreateProduct}
            />

            {/* Image Uploader - only allowed on create */}
            <Controller
              name="images"
              control={control}
              defaultValue={[]}
              render={({ field: { onChange, value }, fieldState }) => (
                <ImageUploader
                  onChange={(files) => onChange(files)}
                  value={value}
                  label={
                    <span>
                      Product Images{" "}
                      <span className="text-gray-400">
                        (max 10 uploads allowed)
                      </span>
                    </span>
                  }
                  multiple
                  error={fieldState.error?.message}
                  disabled={loadingCreateProduct}
                  allowUpload={editingProduct ? false : true}
                />
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={loadingCreateProduct}
                onClick={handleModalClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-10 flex items-center gap-2"
                disabled={loadingCreateProduct || loadingProductActions}
              >
                {loadingCreateProduct ? (
                  <div className="flex items-center justify-center py-12 gap-2">
                    <Loader2 className={`animate-spin text-white`} />{" "}
                    <span className="text-white">Creating...</span>
                  </div>
                ) : loadingProductActions ? (
                  <div className="flex items-center justify-center py-12 gap-2">
                    <Loader2 className={`animate-spin text-white`} />{" "}
                    <span className="text-white">Updating...</span>
                  </div>
                ) : editingProduct ? (
                  "Update Product"
                ) : (
                  "Create Product"
                )}
              </Button>
            </div>
          </form>
        </Modal>

        {/* View Product Modal */}
        <Modal
          isOpen={showViewProductModal}
          onClose={() => setShowViewProductModal(false)}
          title={
            viewingProduct?.name ? viewingProduct?.name : "Product Details"
          }
          size="xl"
        >
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Images */}
            <div>
              <ImagesGallery images={viewingProduct?.images} />
            </div>

            {/* Right Column - Product Details */}
            <div className="space-y-6">
              {/* Header */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex items-start justify-between mb-2 gap-10">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {viewingProduct?.name}
                    </h1>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                      {formatCurrency(viewingProduct?.price)}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {viewingProduct?.description}
                  </p>
                </div>

                {/* Product Details Grid */}
                {viewingProduct?.category && (
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Category
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {viewingProduct?.category}
                      </p>
                    </div>
                  </div>
                )}

                {/* Colors */}
                {viewingProduct?.colors && viewingProduct.colors.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Available Colors
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {viewingProduct.colors.map((color, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary-100/20 text-primary-600 rounded-full text-sm font-medium"
                        >
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes */}
                {viewingProduct?.sizes && viewingProduct.sizes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Available Sizes
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {viewingProduct.sizes.map((size, index) => (
                        <Badge key={index} variant="default">
                          {size}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Receiving Options */}
                {viewingProduct?.receivingOptions &&
                  viewingProduct.receivingOptions.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Receiving Options
                      </h3>
                      <div className="flex gap-3">
                        {viewingProduct.receivingOptions.map(
                          (option, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg"
                            >
                              {option === "delivery" ? (
                                <Truck className="w-4 h-4 text-primary-500" />
                              ) : (
                                <MapPin className="w-4 h-4 text-secondary-500" />
                              )}
                              <span className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
                                {option}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Metadata */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  <p>
                    <strong>Created:</strong>{" "}
                    {formatDate(viewingProduct?.createdAt)}
                  </p>
                  <p>
                    <strong>Last Updated:</strong>{" "}
                    {formatDate(viewingProduct?.updatedAt)}
                  </p>
                  <p>
                    <strong>Product ID:</strong> {viewingProduct?._id}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Products;
