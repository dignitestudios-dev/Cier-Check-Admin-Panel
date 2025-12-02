import { useEffect, useState } from "react";
import { handleError } from "../../utils/helpers";
import { api } from "../../lib/services";

const useTopDoctorsAllTime = () => {
  const [loading, setLoading] = useState(true);
  const [topDoctors, setTopDoctors] = useState([]);

  const fetchTopDoctors = async () => {
    setLoading(true);
    try {
      const response = await api.getTopDoctorsAllTime();
      const data = response.data || [];
      // Normalize numeric fields
      const normalized = Array.isArray(data)
        ? data.map((d) => ({
            ...d,
            revenue: d.revenue != null ? Number(d.revenue) : 0,
            consultations: d.consultations != null ? Number(d.consultations) : 0,
          }))
        : [];
      setTopDoctors(normalized);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopDoctors();
  }, []);

  return { loading, topDoctors, refetch: fetchTopDoctors };
};

export default useTopDoctorsAllTime;
