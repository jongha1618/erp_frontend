import { useState, useEffect } from "react";
import axios from "axios";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";
import { IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";

export default function useBomTableData(refreshTrigger) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:5000/bom")
      .then((response) => {
        const data = response.data.map((bom) => ({
          bom_number: (
            <MDTypography variant="button" fontWeight="medium">
              {bom.bom_number}
            </MDTypography>
          ),
          name: (
            <MDTypography variant="caption" color="text">
              {bom.name}
            </MDTypography>
          ),
          output_item: (
            <MDBox>
              <MDTypography variant="caption" fontWeight="medium">
                {bom.output_item_code}
              </MDTypography>
              <MDTypography variant="caption" color="text" display="block">
                {bom.output_item_name}
              </MDTypography>
            </MDBox>
          ),
          version: (
            <MDTypography variant="caption" color="text">
              {bom.version}
            </MDTypography>
          ),
          components: (
            <MDTypography variant="caption" color="text">
              {bom.component_count || 0}
            </MDTypography>
          ),
          status: (
            <MDBadge
              badgeContent={bom.is_active ? "Active" : "Inactive"}
              color={bom.is_active ? "success" : "secondary"}
              variant="gradient"
              size="sm"
            />
          ),
          action: (
            <MDBox>
              <IconButton
                color="info"
                size="small"
                onClick={() => navigate(`/bom/newbom/${bom.bom_id}`)}
              >
                <EditIcon />
              </IconButton>
              <IconButton color="error" size="small" onClick={() => handleDelete(bom.bom_id)}>
                <DeleteIcon />
              </IconButton>
            </MDBox>
          ),
        }));
        setRows(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching BOMs:", error);
        setLoading(false);
      });
  }, [refreshTrigger, navigate]);

  const handleDelete = async (bomId) => {
    if (!window.confirm("Are you sure you want to delete this BOM?")) return;

    try {
      await axios.delete(`http://localhost:5000/bom/${bomId}`);
      setRows((prev) => prev.filter((_, i) => i !== bomId));
      window.location.reload();
    } catch (error) {
      console.error("Error deleting BOM:", error);
      alert("Failed to delete BOM");
    }
  };

  const columns = [
    { Header: "BOM Number", accessor: "bom_number", width: "15%", align: "left" },
    { Header: "Name", accessor: "name", width: "20%", align: "left" },
    { Header: "Output Item", accessor: "output_item", width: "25%", align: "left" },
    { Header: "Version", accessor: "version", width: "10%", align: "center" },
    { Header: "Components", accessor: "components", width: "10%", align: "center" },
    { Header: "Status", accessor: "status", width: "10%", align: "center" },
    { Header: "Action", accessor: "action", width: "10%", align: "center" },
  ];

  return { columns, rows, loading };
}
