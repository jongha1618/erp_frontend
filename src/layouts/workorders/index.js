import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import AddIcon from "@mui/icons-material/Add";
import ListIcon from "@mui/icons-material/List";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import BuildIcon from "@mui/icons-material/Build";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

import useWorkOrdersTableData, { useActiveBOMs } from "./data/workOrdersTableData";
import WorkOrderTreeView from "./components/WorkOrderTreeView";
import axios from "axios";

function WorkOrders() {
  const navigate = useNavigate();
  const { root_wo_id } = useParams();
  const [viewMode, setViewMode] = useState(root_wo_id ? "tree" : "list");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedRootWoId, setSelectedRootWoId] = useState(root_wo_id || null);
  const { columns, rows, loading } = useWorkOrdersTableData(refreshTrigger, viewMode);
  const boms = useActiveBOMs();

  // Create from BOM dialog
  const [bomDialogOpen, setBomDialogOpen] = useState(false);
  const [selectedBOM, setSelectedBOM] = useState(null);
  const [bomQuantity, setBomQuantity] = useState(1);
  const [bomPriority, setBomPriority] = useState("normal");
  const [createLoading, setCreateLoading] = useState(false);

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
      if (newMode === "list") {
        setSelectedRootWoId(null);
      }
    }
  };

  const handleCreateFromBOM = async () => {
    if (!selectedBOM || bomQuantity <= 0) {
      alert("Please select a BOM and enter a valid quantity");
      return;
    }

    setCreateLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/work-orders/from-bom", {
        bom_id: selectedBOM.bom_id,
        quantity: bomQuantity,
        priority: bomPriority,
      });

      alert(`Work Order ${response.data.wo_number} created successfully!`);
      setBomDialogOpen(false);
      setSelectedBOM(null);
      setBomQuantity(1);
      setRefreshTrigger((prev) => prev + 1);

      // Navigate to the new WO
      navigate(`/workorders/newworkorder/${response.data.wo_id}`);
    } catch (error) {
      console.error("Error creating WO from BOM:", error);
      alert(error.response?.data?.error || "Failed to create work order");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleTreeRowClick = (woId) => {
    setSelectedRootWoId(woId);
    setViewMode("tree");
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color="white">
                  Work Orders
                </MDTypography>
                <MDBox display="flex" gap={2}>
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={handleViewModeChange}
                    size="small"
                    sx={{
                      backgroundColor: "white",
                      "& .MuiToggleButton-root": {
                        color: "info.main",
                        "&.Mui-selected": {
                          backgroundColor: "info.main",
                          color: "white",
                          "&:hover": {
                            backgroundColor: "info.dark",
                          },
                        },
                      },
                    }}
                  >
                    <ToggleButton value="list">
                      <ListIcon sx={{ mr: 0.5 }} /> List
                    </ToggleButton>
                    <ToggleButton value="tree">
                      <AccountTreeIcon sx={{ mr: 0.5 }} /> Tree
                    </ToggleButton>
                  </ToggleButtonGroup>

                  <Button
                    variant="contained"
                    startIcon={<BuildIcon />}
                    onClick={() => setBomDialogOpen(true)}
                    sx={{
                      backgroundColor: "success.main",
                      color: "#ffffff",
                      "&:hover": { backgroundColor: "success.dark" },
                    }}
                  >
                    Create from BOM
                  </Button>

                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate("/workorders/newworkorder")}
                    sx={{
                      backgroundColor: "#1976d2",
                      color: "#ffffff",
                      "&:hover": { backgroundColor: "#1565c0" },
                    }}
                  >
                    Add Manual WO
                  </Button>
                </MDBox>
              </MDBox>

              <MDBox pt={3}>
                {viewMode === "list" ? (
                  loading ? (
                    <MDBox p={3} textAlign="center">
                      <MDTypography variant="caption">Loading...</MDTypography>
                    </MDBox>
                  ) : (
                    <DataTable
                      table={{ columns, rows }}
                      isSorted={false}
                      entriesPerPage={false}
                      showTotalEntries={false}
                      noEndBorder
                    />
                  )
                ) : (
                  <MDBox>
                    {selectedRootWoId ? (
                      <>
                        <MDBox px={2} py={1} display="flex" alignItems="center">
                          <Button
                            size="small"
                            onClick={() => {
                              setSelectedRootWoId(null);
                              setViewMode("list");
                            }}
                          >
                            ← Back to List
                          </Button>
                        </MDBox>
                        <WorkOrderTreeView rootWoId={selectedRootWoId} onRefresh={refreshTrigger} />
                      </>
                    ) : (
                      <MDBox p={3}>
                        <MDTypography variant="body2" color="text" mb={2}>
                          Select a root work order to view its tree structure:
                        </MDTypography>
                        {loading ? (
                          <MDTypography variant="caption">Loading...</MDTypography>
                        ) : rows.length === 0 ? (
                          <MDTypography variant="caption" color="secondary">
                            No work orders found
                          </MDTypography>
                        ) : (
                          <DataTable
                            table={{ columns, rows }}
                            isSorted={false}
                            entriesPerPage={false}
                            showTotalEntries={false}
                            noEndBorder
                          />
                        )}
                      </MDBox>
                    )}
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Create from BOM Dialog */}
      <Dialog open={bomDialogOpen} onClose={() => setBomDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Work Order from BOM</DialogTitle>
        <DialogContent>
          <MDBox pt={2}>
            <Autocomplete
              options={boms}
              getOptionLabel={(option) =>
                option ? `${option.bom_number} - ${option.name} (${option.output_item_code})` : ""
              }
              value={selectedBOM}
              onChange={(e, newValue) => setSelectedBOM(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select BOM"
                  fullWidth
                  helperText={
                    selectedBOM
                      ? `Output: ${selectedBOM.output_item_name}`
                      : "Choose a BOM to create work order"
                  }
                />
              )}
              sx={{ mb: 2 }}
            />

            <TextField
              type="number"
              label="Quantity to Build"
              value={bomQuantity}
              onChange={(e) => setBomQuantity(parseInt(e.target.value) || 1)}
              fullWidth
              inputProps={{ min: 1 }}
              sx={{ mb: 2 }}
            />

            <TextField
              select
              label="Priority"
              value={bomPriority}
              onChange={(e) => setBomPriority(e.target.value)}
              fullWidth
              SelectProps={{ native: true }}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </TextField>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBomDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateFromBOM}
            variant="contained"
            color="success"
            disabled={!selectedBOM || createLoading}
          >
            {createLoading ? "Creating..." : "Create Work Order"}
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default WorkOrders;
