import { useState, useEffect } from "react";
import axios from "axios";

export const getStatusColor = (status) => {
  switch (status) {
    case "draft":
      return "secondary";
    case "in_progress":
      return "warning";
    case "completed":
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

export function useKitItemsTableData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    axios
      .get("http://localhost:5000/kit-items")
      .then((response) => {
        const fetchDetails = response.data.map((kit) => {
          return axios
            .get(`http://localhost:5000/kit-items/${kit.kit_item_id}`)
            .then((detailRes) => ({
              ...kit,
              components: detailRes.data.components || [],
            }))
            .catch(() => ({
              ...kit,
              components: [],
            }));
        });

        Promise.all(fetchDetails).then((kitsWithComponents) => {
          setData(kitsWithComponents);
          setLoading(false);
        });
      })
      .catch((error) => {
        console.error("Error fetching kit items data:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, refetch: fetchData };
}
