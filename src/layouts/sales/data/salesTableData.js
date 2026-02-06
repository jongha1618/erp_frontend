import { useState, useEffect } from "react";
import axios from "axios";

export const getStatusColor = (status) => {
  switch (status) {
    case "draft":
      return "secondary";
    case "confirmed":
      return "info";
    case "shipped":
      return "warning";
    case "delivered":
      return "success";
    case "cancelled":
      return "error";
    default:
      return "secondary";
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("ko-KR");
};

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export function useSalesTableData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    axios
      .get("http://localhost:5000/sales")
      .then((response) => {
        // Fetch details for each Sale
        const fetchDetails = response.data.map((sale) => {
          return axios
            .get(`http://localhost:5000/sales/${sale.sale_id}`)
            .then((detailRes) => ({
              ...sale,
              details: detailRes.data.details || [],
            }))
            .catch(() => ({
              ...sale,
              details: [],
            }));
        });

        Promise.all(fetchDetails).then((salesWithDetails) => {
          setData(salesWithDetails);
          setLoading(false);
        });
      })
      .catch((error) => {
        console.error("Error fetching sales data:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, refetch: fetchData };
}
