import { useState, useEffect } from "react";
import axios from "axios";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";
import { IconButton, LinearProgress, Box } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import { useNavigate } from "react-router-dom";

const STATUS_COLORS = {
  draft: "secondary",
  blocked: "warning",
  ready: "info",
  in_progress: "primary",
  completed: "success",
  cancelled: "error",
};

const PRIORITY_COLORS = {
  low: "secondary",
  normal: "info",
  high: "warning",
  urgent: "error",
};

export default function useWorkOrdersTableData(refreshTrigger, viewMode = "list") {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const endpoint =
      viewMode === "tree"
        ? "http://localhost:5000/work-orders/roots"
        : "http://localhost:5000/work-orders";

    axios
      .get(endpoint)
      .then((response) => {
        const data = response.data.map((wo) => {
          const progress =
            wo.quantity_ordered > 0
              ? Math.round((wo.quantity_completed / wo.quantity_ordered) * 100)
              : 0;

          return {
            wo_number: (
              <MDBox display="flex" alignItems="center">
                {wo.child_count > 0 && (
                  <IconButton
                    size="small"
                    color="info"
                    onClick={() => navigate(`/workorders/tree/${wo.wo_id}`)}
                    title="View Tree"
                  >
                    <AccountTreeIcon fontSize="small" />
                  </IconButton>
                )}
                <MDTypography variant="button" fontWeight="medium">
                  {wo.wo_number}
                </MDTypography>
              </MDBox>
            ),
            output_item: (
              <MDBox>
                <MDTypography variant="caption" fontWeight="medium">
                  {wo.output_item_code}
                </MDTypography>
                <MDTypography variant="caption" color="text" display="block">
                  {wo.output_item_name}
                </MDTypography>
              </MDBox>
            ),
            quantity: (
              <MDTypography variant="caption" color="text">
                {wo.quantity_completed || 0} / {wo.quantity_ordered}
              </MDTypography>
            ),
            progress: (
              <Box sx={{ display: "flex", alignItems: "center", width: 100 }}>
                <Box sx={{ width: "100%", mr: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    color={progress >= 100 ? "success" : "info"}
                  />
                </Box>
                <MDTypography variant="caption" color="text">
                  {progress}%
                </MDTypography>
              </Box>
            ),
            status: (
              <MDBadge
                badgeContent={wo.status.replace("_", " ")}
                color={STATUS_COLORS[wo.status] || "secondary"}
                variant="gradient"
                size="sm"
              />
            ),
            priority: (
              <MDBadge
                badgeContent={wo.priority}
                color={PRIORITY_COLORS[wo.priority] || "info"}
                variant="gradient"
                size="sm"
              />
            ),
            bom: (
              <MDTypography variant="caption" color="text">
                {wo.bom_number || "-"}
              </MDTypography>
            ),
            action: (
              <MDBox>
                <IconButton
                  color="info"
                  size="small"
                  onClick={() => navigate(`/workorders/newworkorder/${wo.wo_id}`)}
                >
                  <EditIcon />
                </IconButton>
                {wo.status === "draft" && (
                  <IconButton color="error" size="small" onClick={() => handleDelete(wo.wo_id)}>
                    <DeleteIcon />
                  </IconButton>
                )}
              </MDBox>
            ),
          };
        });
        setRows(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching work orders:", error);
        setLoading(false);
      });
  }, [refreshTrigger, viewMode, navigate]);

  const handleDelete = async (woId) => {
    if (!window.confirm("Are you sure you want to delete this Work Order?")) return;

    try {
      await axios.delete(`http://localhost:5000/work-orders/${woId}`);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting work order:", error);
      alert("Failed to delete work order");
    }
  };

  const columns = [
    { Header: "WO Number", accessor: "wo_number", width: "15%", align: "left" },
    { Header: "Output Item", accessor: "output_item", width: "20%", align: "left" },
    { Header: "Quantity", accessor: "quantity", width: "10%", align: "center" },
    { Header: "Progress", accessor: "progress", width: "15%", align: "center" },
    { Header: "Status", accessor: "status", width: "10%", align: "center" },
    { Header: "Priority", accessor: "priority", width: "10%", align: "center" },
    { Header: "BOM", accessor: "bom", width: "10%", align: "center" },
    { Header: "Action", accessor: "action", width: "10%", align: "center" },
  ];

  return { columns, rows, loading };
}

// Hook for fetching active BOMs
export function useActiveBOMs() {
  const [boms, setBoms] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/bom/active")
      .then((response) => setBoms(response.data))
      .catch((error) => console.error("Error fetching BOMs:", error));
  }, []);

  return boms;
}

// Hook for fetching items
export function useItemsData() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/items?table=ep_items")
      .then((response) => setItems(response.data))
      .catch((error) => console.error("Error fetching items:", error));
  }, []);

  return items;
}
