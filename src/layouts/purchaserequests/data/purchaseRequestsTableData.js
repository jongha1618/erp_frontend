import { useEffect, useState } from "react";
import axios from "axios";

export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "warning";
    case "approved":
      return "info";
    case "converted_to_po":
      return "success";
    case "cancelled":
      return "error";
    default:
      return "secondary";
  }
};

export const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case "urgent":
      return "error";
    case "normal":
      return "info";
    default:
      return "secondary";
  }
};

export const getSourceTypeLabel = (sourceType) => {
  switch (sourceType) {
    case "kit_reserve":
      return "Kit Reserve";
    case "manual":
      return "Manual";
    case "sales_order":
      return "Sales Order";
    default:
      return sourceType || "-";
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR");
};

export function usePurchaseRequestsTableData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    axios
      .get("http://localhost:5000/purchase-requests")
      .then((response) => {
        setData(response.data);
        setLoading(false);
        console.log("Purchase Requests fetched:", response.data);
      })
      .catch((error) => {
        console.error("Error fetching purchase requests:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    refetch: fetchData,
  };
}

export function useSuppliersData() {
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/suppliers")
      .then((response) => {
        setSuppliers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching suppliers:", error);
      });
  }, []);

  return suppliers;
}

export function useItemsData() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/items")
      .then((response) => {
        setItems(response.data);
      })
      .catch((error) => {
        console.error("Error fetching items:", error);
      });
  }, []);

  return items;
}
