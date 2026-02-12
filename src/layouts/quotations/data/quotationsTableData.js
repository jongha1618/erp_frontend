import { useState, useEffect } from "react";
import axios from "axios";

export const getStatusColor = (status) => {
  switch (status) {
    case "draft":
      return "secondary";
    case "sent":
      return "info";
    case "accepted":
      return "success";
    case "rejected":
      return "error";
    case "expired":
      return "warning";
    case "converted":
      return "primary";
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

export function useQuotationsTableData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    axios
      .get("http://localhost:5000/quotations")
      .then((response) => {
        const fetchDetails = response.data.map((quotation) => {
          return axios
            .get(`http://localhost:5000/quotations/${quotation.quotation_id}`)
            .then((detailRes) => ({
              ...quotation,
              details: detailRes.data.details || [],
            }))
            .catch(() => ({
              ...quotation,
              details: [],
            }));
        });

        Promise.all(fetchDetails).then((quotationsWithDetails) => {
          setData(quotationsWithDetails);
          setLoading(false);
        });
      })
      .catch((error) => {
        console.error("Error fetching quotations data:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, refetch: fetchData };
}
