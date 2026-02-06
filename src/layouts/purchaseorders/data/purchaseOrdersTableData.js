import { useEffect, useState } from "react";
import axios from "axios";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";
import { Link } from "react-router-dom";

export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "warning";
    case "approved":
      return "info";
    case "received":
      return "success";
    case "cancelled":
      return "error";
    default:
      return "secondary";
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR");
};

export const formatCurrency = (amount) => {
  if (!amount) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export function usePurchaseOrdersTableData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    axios
      .get("http://localhost:5000/purchase-orders")
      .then((response) => {
        // Fetch details for each PO
        const fetchDetails = response.data.map((po) => {
          return axios
            .get(`http://localhost:5000/purchase-orders/${po.purchaseorder_id}`)
            .then((detailRes) => ({
              ...po,
              details: detailRes.data.details || [],
            }))
            .catch(() => ({
              ...po,
              details: [],
            }));
        });

        Promise.all(fetchDetails).then((posWithDetails) => {
          setData(posWithDetails);
          setLoading(false);
          console.log("Purchase Orders with details fetched:", posWithDetails);
        });
      })
      .catch((error) => {
        console.error("Error fetching purchase orders:", error);
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
    columns: [
      { Header: "PO Number", accessor: "po_number", align: "left" },
      { Header: "Supplier", accessor: "supplier_name", align: "left" },
      { Header: "Order Date", accessor: "order_date", align: "center" },
      { Header: "Expected Delivery", accessor: "expected_delivery", align: "center" },
      { Header: "Total Amount", accessor: "total_amount", align: "right" },
      { Header: "Status", accessor: "status", align: "center" },
      { Header: "Action", accessor: "action", align: "center" },
    ],
    rows: data.map((po) => ({
      key: po.purchaseorder_id || po.po_id,
      po_number: (
        <MDTypography
          component="a"
          href={`/purchaseorders/newpurchaseorder/${po.purchaseorder_id || po.po_id}`}
          variant="caption"
          color="text"
          fontWeight="medium"
        >
          {po.po_number}
        </MDTypography>
      ),
      supplier_name: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {po.supplier_name || po.supplier_id}
        </MDTypography>
      ),
      order_date: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {formatDate(po.order_date)}
        </MDTypography>
      ),
      expected_delivery: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {formatDate(po.expected_delivery)}
        </MDTypography>
      ),
      total_amount: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {formatCurrency(po.total_amount)}
        </MDTypography>
      ),
      status: (
        <MDBox ml={-1}>
          <MDBadge
            badgeContent={po.status || "pending"}
            color={getStatusColor(po.status)}
            variant="gradient"
            size="sm"
          />
        </MDBox>
      ),
      action: (
        <MDBox ml={-1}>
          <Link
            to={`/purchaseorders/newpurchaseorder/${po.purchaseorder_id || po.po_id}`}
            style={{ textDecoration: "none" }}
          >
            <MDBadge badgeContent="Edit" color="primary" variant="gradient" size="sm" />
          </Link>
        </MDBox>
      ),
    })),
  };
}
