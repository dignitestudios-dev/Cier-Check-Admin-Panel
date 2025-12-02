import React, { useEffect, useState } from "react";
import { handleError } from "../../utils/helpers";
import { api } from "../../lib/services";

const useGetAllProducts = (search, page, limit) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);

  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const getAllProducts = async () => {
    setLoading(true);

    try {
      const response = await api.getAllProducts(search, page, limit);
      setProducts(response.data?.result);

      setTotalPages(response.data?.pagination.totalPages);
      setTotalData(response.data?.pagination.total);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllProducts();
  }, [page, limit, search]);

  return { loading, products, totalPages, totalData, getAllProducts };
};

export default useGetAllProducts;
