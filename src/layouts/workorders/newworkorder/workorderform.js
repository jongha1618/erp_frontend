import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InventoryIcon from "@mui/icons-material/Inventory";
import CancelIcon from "@mui/icons-material/Cancel";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import axios from "axios";

const STATUS_COLORS = {
  draft: "default",
  blocked: "warning",
  ready: "info",
  in_progress: "primary",
  completed: "success",
  cancelled: "error",
};

function WorkOrderForm() {
  const { wo_id } = useParams();
  const navigate = useNavigate();

  const [header, setHeader] = useState({
    wo_number: "",
    bom_id: null,
    output_item_id: null,
    quantity_ordered: 1,
    quantity_completed: 0,
    status: "draft",
    priority: "normal",
    planned_start_date: "",
    planned_end_date: "",
    notes: "",
    created_by: 1,
  });

  const [components, setComponents] = useState([]);
  const [children, setChildren] = useState([]);
  const [items, setItems] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(false);
  const [alertMessage, setAlertMessage] = useState({ open: false, message: "", severity: "info" });
  const [isLoading, setIsLoading] = useState(false);
  const [woId, setWoId] = useState(null);

  // Dialogs
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [completeQuantity, setCompleteQuantity] = useState(1);
  const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false);
  const [selectedComponentIndex, setSelectedComponentIndex] = useState(null);
  const [availableInventory, setAvailableInventory] = useState([]);

  // Fetch items
  useEffect(() => {
    axios
      .get("http://localhost:5000/items?table=ep_items")
      .then((response) => setItems(response.data))
      .catch((error) => console.error("Error fetching items:", error));
  }, []);

  // Fetch existing WO if editing
  useEffect(() => {
    if (wo_id && wo_id !== "undefined") {
      axios
        .get(`http://localhost:5000/work-orders/${wo_id}`)
        .then((response) => {
          const woData = response.data;
          const headerData = woData.header || woData;
          setWoId(headerData.wo_id || wo_id);
          setHeader({
            wo_number: headerData.wo_number || "",
            bom_id: headerData.bom_id || null,
            bom_number: headerData.bom_number || "",
            output_item_id: headerData.output_item_id || null,
            output_item_code: headerData.output_item_code || "",
            output_item_name: headerData.output_item_name || "",
            quantity_ordered: headerData.quantity_ordered || 1,
            quantity_completed: headerData.quantity_completed || 0,
            status: headerData.status || "draft",
            priority: headerData.priority || "normal",
            planned_start_date: headerData.planned_start_date
              ? headerData.planned_start_date.split("T")[0]
              : "",
            planned_end_date: headerData.planned_end_date
              ? headerData.planned_end_date.split("T")[0]
              : "",
            notes: headerData.notes || "",
            parent_wo_id: headerData.parent_wo_id || null,
            parent_wo_number: headerData.parent_wo_number || "",
            root_wo_id: headerData.root_wo_id || null,
            depth: headerData.depth || 0,
          });
          setComponents(woData.components || []);
          setChildren(woData.children || []);
        })
        .catch((error) => console.error("Error fetching Work Order:", error));
    }
  }, [wo_id]);

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddComponent = () => {
    setComponents([
      ...components,
      {
        item_id: "",
        quantity_required: 1,
        inventory_id: null,
        is_subassembly: false,
        notes: "",
      },
    ]);
  };

  const handleComponentChange = (index, field, value) => {
    const newComponents = [...components];
    newComponents[index][field] = value;
    setComponents(newComponents);
  };

  const handleItemSelect = (index, newValue) => {
    const newComponents = [...components];
    newComponents[index].item_id = newValue?.item_id || "";
    newComponents[index].item_name = newValue?.name || "";
    newComponents[index].item_code = newValue?.item_code || "";
    newComponents[index].inventory_id = null;
    setComponents(newComponents);
  };

  const handleRemoveComponent = async (index) => {
    const component = components[index];
    if (component.woc_id) {
      try {
        await axios.delete(`http://localhost:5000/work-orders/components/${component.woc_id}`);
      } catch (error) {
        console.error("Error deleting component:", error);
        alert("Failed to delete component");
        return;
      }
    }
    setComponents(components.filter((_, i) => i !== index));
  };

  // Inventory selection
  const handleOpenInventoryDialog = async (index) => {
    const component = components[index];
    if (!component.item_id) {
      alert("Please select an item first");
      return;
    }

    setSelectedComponentIndex(index);
    try {
      const response = await axios.get(
        `http://localhost:5000/work-orders/inventory/${component.item_id}`
      );
      setAvailableInventory(response.data || []);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      setAvailableInventory([]);
    }
    setInventoryDialogOpen(true);
  };

  const handleSelectInventory = (inventory) => {
    if (selectedComponentIndex !== null) {
      const newComponents = [...components];
      newComponents[selectedComponentIndex].inventory_id = inventory.inventory_id;
      newComponents[selectedComponentIndex].batch_number = inventory.batch_number;
      newComponents[selectedComponentIndex].location = inventory.location;
      newComponents[selectedComponentIndex].available_qty = inventory.available_qty;
      setComponents(newComponents);
    }
    setInventoryDialogOpen(false);
    setSelectedComponentIndex(null);
  };

  // Lifecycle actions
  const handleAllocate = async () => {
    if (!woId) return;

    try {
      const response = await axios.post(`http://localhost:5000/work-orders/${woId}/allocate`);
      setAlertMessage({
        open: true,
        message: response.data.warnings?.length
          ? `Allocated with warnings: ${response.data.warnings.length} shortage(s)`
          : "Components allocated successfully!",
        severity: response.data.warnings?.length ? "warning" : "success",
      });

      // Refresh data
      const woResponse = await axios.get(`http://localhost:5000/work-orders/${woId}`);
      setHeader((prev) => ({ ...prev, status: woResponse.data.header.status }));
      setComponents(woResponse.data.components || []);
    } catch (error) {
      console.error("Allocate error:", error);
      setAlertMessage({
        open: true,
        message: error.response?.data?.error || "Failed to allocate components",
        severity: "error",
      });
    }
  };

  const handleStart = async () => {
    if (!woId) return;

    try {
      const response = await axios.post(`http://localhost:5000/work-orders/${woId}/start`);
      if (!response.data.success) {
        setAlertMessage({
          open: true,
          message: response.data.message || "Cannot start work order",
          severity: "warning",
        });
        return;
      }

      setAlertMessage({
        open: true,
        message: "Work order started!",
        severity: "success",
      });
      setHeader((prev) => ({ ...prev, status: "in_progress" }));
    } catch (error) {
      console.error("Start error:", error);
      setAlertMessage({
        open: true,
        message: error.response?.data?.error || "Failed to start work order",
        severity: "error",
      });
    }
  };

  const handleOpenCompleteDialog = () => {
    const remaining = (header.quantity_ordered || 0) - (header.quantity_completed || 0);
    setCompleteQuantity(remaining > 0 ? remaining : 1);
    setCompleteDialogOpen(true);
  };

  const handleComplete = async () => {
    if (!woId || completeQuantity <= 0) return;

    try {
      const response = await axios.post(`http://localhost:5000/work-orders/${woId}/complete`, {
        completed_quantity: completeQuantity,
      });

      setAlertMessage({
        open: true,
        message: response.data.warnings?.length
          ? `Completed with warnings: ${response.data.warnings.length} shortage(s)`
          : "Work order completed!",
        severity: response.data.warnings?.length ? "warning" : "success",
      });

      setCompleteDialogOpen(false);

      // Refresh data
      const woResponse = await axios.get(`http://localhost:5000/work-orders/${woId}`);
      setHeader((prev) => ({
        ...prev,
        status: woResponse.data.header.status,
        quantity_completed: woResponse.data.header.quantity_completed,
      }));
      setComponents(woResponse.data.components || []);
    } catch (error) {
      console.error("Complete error:", error);
      setAlertMessage({
        open: true,
        message: error.response?.data?.error || "Failed to complete work order",
        severity: "error",
      });
    }
  };

  const handleCancel = async () => {
    if (!woId) return;
    if (!window.confirm("Are you sure you want to cancel this work order?")) return;

    try {
      await axios.post(`http://localhost:5000/work-orders/${woId}/cancel`);
      setAlertMessage({
        open: true,
        message: "Work order cancelled",
        severity: "info",
      });
      setHeader((prev) => ({ ...prev, status: "cancelled" }));
    } catch (error) {
      console.error("Cancel error:", error);
      setAlertMessage({
        open: true,
        message: error.response?.data?.error || "Failed to cancel work order",
        severity: "error",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let newErrors = {};
    if (!header.output_item_id) newErrors.output_item_id = "Output Item is required";
    if (!header.quantity_ordered) newErrors.quantity_ordered = "Quantity is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }
    setErrors({});

    try {
      const updateId = woId || wo_id;

      if (updateId && updateId !== "undefined") {
        await axios.put(`http://localhost:5000/work-orders/${updateId}`, header);

        for (const component of components) {
          if (component.woc_id) {
            await axios.put(`http://localhost:5000/work-orders/components/${component.woc_id}`, {
              item_id: component.item_id,
              inventory_id: component.inventory_id,
              quantity_required: component.quantity_required,
              notes: component.notes,
            });
          } else if (component.item_id) {
            await axios.post(`http://localhost:5000/work-orders/${updateId}/components`, {
              item_id: component.item_id,
              inventory_id: component.inventory_id,
              quantity_required: component.quantity_required,
              notes: component.notes,
            });
          }
        }
      } else {
        const payload = {
          header,
          components: components.map((c) => ({
            item_id: c.item_id,
            inventory_id: c.inventory_id,
            quantity_required: c.quantity_required,
            notes: c.notes,
          })),
        };
        await axios.post("http://localhost:5000/work-orders", payload);
      }

      setSuccessMessage(true);
      setTimeout(() => {
        navigate("/workorders");
      }, 2000);
    } catch (error) {
      console.error("Error saving Work Order:", error);
      alert(error.response?.data?.error || "Failed to save Work Order");
    } finally {
      setIsLoading(false);
    }
  };

  const progress =
    header.quantity_ordered > 0
      ? Math.round((header.quantity_completed / header.quantity_ordered) * 100)
      : 0;

  const canEdit = ["draft"].includes(header.status);
  const canAllocate = ["draft", "blocked"].includes(header.status);
  const canStart = header.status === "ready";
  const canComplete = header.status === "in_progress";
  const canCancel = ["draft", "blocked", "ready"].includes(header.status);

  return (
    <Card>
      <br />
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
          {wo_id ? `Work Order: ${header.wo_number}` : "New Work Order"}
        </MDTypography>
        {wo_id && (
          <Chip label={header.status.replace("_", " ")} color={STATUS_COLORS[header.status]} />
        )}
      </MDBox>

      <MDBox p={3} component="form" onSubmit={handleSubmit}>
        {/* Progress Bar */}
        {wo_id && (
          <MDBox mb={3}>
            <MDBox display="flex" justifyContent="space-between" mb={1}>
              <MDTypography variant="body2">Build Progress</MDTypography>
              <MDTypography variant="body2">
                {header.quantity_completed || 0} / {header.quantity_ordered} ({progress}%)
              </MDTypography>
            </MDBox>
            <LinearProgress
              variant="determinate"
              value={progress}
              color={progress >= 100 ? "success" : "info"}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </MDBox>
        )}

        {/* Header Section */}
        <MDTypography variant="h5" fontWeight="bold" color="info" mt={2} mb={1}>
          Work Order Information
        </MDTypography>
        <Grid container spacing={2}>
          {wo_id && (
            <Grid item xs={12} sm={3}>
              <MDInput
                type="text"
                label="WO Number"
                value={header.wo_number || ""}
                fullWidth
                disabled
              />
            </Grid>
          )}
          <Grid item xs={12} sm={wo_id ? 3 : 4}>
            <Autocomplete
              options={items}
              getOptionLabel={(option) =>
                option ? `${option.item_code || ""} - ${option.name || ""}` : ""
              }
              value={items.find((i) => i.item_id === header.output_item_id) || null}
              onChange={(e, newValue) => {
                setHeader((prev) => ({
                  ...prev,
                  output_item_id: newValue?.item_id || null,
                  output_item_code: newValue?.item_code || "",
                  output_item_name: newValue?.name || "",
                }));
              }}
              disabled={!canEdit}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Output Item *"
                  size="medium"
                  InputLabelProps={{ shrink: true }}
                  error={Boolean(errors.output_item_id)}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <MDInput
              type="number"
              label="Qty to Build"
              name="quantity_ordered"
              value={header.quantity_ordered || 1}
              onChange={handleHeaderChange}
              fullWidth
              inputProps={{ min: 1 }}
              disabled={!canEdit}
              error={Boolean(errors.quantity_ordered)}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              select
              label="Priority"
              name="priority"
              value={header.priority || "normal"}
              onChange={handleHeaderChange}
              fullWidth
              size="medium"
              InputLabelProps={{ shrink: true }}
              sx={{ "& .MuiInputBase-root": { height: 45 } }}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={2}>
            <MDInput
              type="date"
              label="Planned Start"
              name="planned_start_date"
              value={header.planned_start_date || ""}
              onChange={handleHeaderChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <MDInput
              type="date"
              label="Planned End"
              name="planned_end_date"
              value={header.planned_end_date || ""}
              onChange={handleHeaderChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          {header.bom_number && (
            <Grid item xs={12} sm={3}>
              <MDInput
                type="text"
                label="Source BOM"
                value={header.bom_number}
                fullWidth
                disabled
              />
            </Grid>
          )}
          {header.parent_wo_number && (
            <Grid item xs={12} sm={3}>
              <MDInput
                type="text"
                label="Parent WO"
                value={header.parent_wo_number}
                fullWidth
                disabled
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <MDInput
              type="text"
              label="Notes"
              name="notes"
              value={header.notes || ""}
              onChange={handleHeaderChange}
              fullWidth
              multiline
              rows={2}
            />
          </Grid>
        </Grid>

        {/* Child Work Orders */}
        {children.length > 0 && (
          <>
            <MDTypography variant="h5" fontWeight="bold" color="warning" mt={4} mb={1}>
              Child Work Orders (Sub-assemblies)
            </MDTypography>
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>WO Number</TableCell>
                    <TableCell>Output Item</TableCell>
                    <TableCell align="center">Quantity</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {children.map((child) => (
                    <TableRow key={child.wo_id}>
                      <TableCell>{child.wo_number}</TableCell>
                      <TableCell>
                        {child.output_item_code} - {child.output_item_name}
                      </TableCell>
                      <TableCell align="center">
                        {child.quantity_completed || 0} / {child.quantity_ordered}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={child.status.replace("_", " ")}
                          color={STATUS_COLORS[child.status]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          onClick={() => navigate(`/workorders/newworkorder/${child.wo_id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {/* Components Section */}
        <MDTypography variant="h5" fontWeight="bold" color="info" mt={4} mb={1}>
          Components (Materials)
        </MDTypography>
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead sx={{ display: "table-header-group" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Item</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">
                  Required
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Inventory</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">
                  Allocated
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">
                  Consumed
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Notes</TableCell>
                {canEdit && (
                  <TableCell sx={{ fontWeight: "bold" }} align="center">
                    Action
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {components
                .filter((c) => !c.is_subassembly)
                .map((component, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ minWidth: 200 }}>
                      {canEdit ? (
                        <Autocomplete
                          options={items}
                          getOptionLabel={(option) =>
                            option ? `${option.item_code || ""} - ${option.name || ""}` : ""
                          }
                          value={items.find((i) => i.item_id === component.item_id) || null}
                          onChange={(e, newValue) => handleItemSelect(index, newValue)}
                          renderInput={(params) => (
                            <TextField {...params} size="small" placeholder="Select Item" />
                          )}
                          size="small"
                        />
                      ) : (
                        <MDTypography variant="caption">
                          {component.item_code} - {component.item_name}
                        </MDTypography>
                      )}
                    </TableCell>
                    <TableCell align="center" sx={{ width: 100 }}>
                      {canEdit ? (
                        <TextField
                          type="number"
                          size="small"
                          value={component.quantity_required || 1}
                          onChange={(e) =>
                            handleComponentChange(
                              index,
                              "quantity_required",
                              parseFloat(e.target.value) || 1
                            )
                          }
                          inputProps={{ min: 0.0001, step: 0.0001 }}
                          sx={{ width: 80 }}
                        />
                      ) : (
                        <MDTypography variant="caption">{component.quantity_required}</MDTypography>
                      )}
                    </TableCell>
                    <TableCell sx={{ minWidth: 150 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenInventoryDialog(index)}
                        disabled={!canAllocate}
                      >
                        {component.inventory_id
                          ? `${component.batch_number || "Selected"} (${
                              component.available_qty || 0
                            })`
                          : "Select"}
                      </Button>
                    </TableCell>
                    <TableCell align="center" sx={{ width: 80 }}>
                      {component.quantity_allocated || 0}
                    </TableCell>
                    <TableCell align="center" sx={{ width: 80 }}>
                      {component.quantity_consumed || 0}
                    </TableCell>
                    <TableCell sx={{ width: 120 }}>
                      {canEdit ? (
                        <TextField
                          size="small"
                          value={component.notes || ""}
                          onChange={(e) => handleComponentChange(index, "notes", e.target.value)}
                          placeholder="Notes"
                        />
                      ) : (
                        <MDTypography variant="caption">{component.notes}</MDTypography>
                      )}
                    </TableCell>
                    {canEdit && (
                      <TableCell align="center">
                        <IconButton color="error" onClick={() => handleRemoveComponent(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        {canEdit && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddComponent}
            sx={{
              mb: 2,
              color: "#ffffff",
              backgroundColor: "blue",
              "&:hover": { backgroundColor: "darkblue" },
            }}
          >
            Add Component
          </Button>
        )}

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} mt={3} flexWrap="wrap">
          {canEdit && (
            <Button
              type="submit"
              variant="contained"
              sx={{ color: "#ffffff", backgroundColor: "green" }}
              disabled={isLoading}
            >
              {wo_id ? "Update" : "Save"}
            </Button>
          )}

          {wo_id && canAllocate && (
            <Button
              variant="contained"
              startIcon={<InventoryIcon />}
              onClick={handleAllocate}
              sx={{
                color: "#ffffff",
                backgroundColor: "orange",
                "&:hover": { backgroundColor: "darkorange" },
              }}
            >
              Allocate Materials
            </Button>
          )}

          {wo_id && canStart && (
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={handleStart}
              sx={{
                color: "#ffffff",
                backgroundColor: "blue",
                "&:hover": { backgroundColor: "darkblue" },
              }}
            >
              Start Work
            </Button>
          )}

          {wo_id && canComplete && (
            <Button
              variant="contained"
              startIcon={<CheckCircleIcon />}
              onClick={handleOpenCompleteDialog}
              sx={{
                color: "#ffffff",
                backgroundColor: "purple",
                "&:hover": { backgroundColor: "darkviolet" },
              }}
            >
              Complete Build
            </Button>
          )}

          {wo_id && canCancel && (
            <Button
              variant="contained"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              sx={{
                color: "#ffffff",
                backgroundColor: "grey.600",
                "&:hover": { backgroundColor: "grey.800" },
              }}
            >
              Cancel WO
            </Button>
          )}

          <Button
            variant="contained"
            onClick={() => navigate("/workorders")}
            sx={{
              color: "#ffffff",
              backgroundColor: "red",
              "&:hover": { backgroundColor: "darkred" },
            }}
          >
            Back to List
          </Button>
        </Stack>

        {/* Success Alert */}
        <Snackbar
          open={successMessage}
          autoHideDuration={4000}
          onClose={() => setSuccessMessage(false)}
        >
          <Alert onClose={() => setSuccessMessage(false)} severity="success">
            Work Order saved successfully!
          </Alert>
        </Snackbar>

        {/* Alert Messages */}
        <Snackbar
          open={alertMessage.open}
          autoHideDuration={6000}
          onClose={() => setAlertMessage({ ...alertMessage, open: false })}
        >
          <Alert
            onClose={() => setAlertMessage({ ...alertMessage, open: false })}
            severity={alertMessage.severity}
          >
            {alertMessage.message}
          </Alert>
        </Snackbar>

        {/* Inventory Selection Dialog */}
        <Dialog
          open={inventoryDialogOpen}
          onClose={() => setInventoryDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Select Inventory</DialogTitle>
          <DialogContent>
            {availableInventory.length === 0 ? (
              <Alert severity="warning">No available inventory for this item</Alert>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Batch</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell align="center">Available</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {availableInventory.map((inv) => (
                    <TableRow key={inv.inventory_id}>
                      <TableCell>{inv.batch_number || "N/A"}</TableCell>
                      <TableCell>{inv.location || "N/A"}</TableCell>
                      <TableCell align="center">{inv.available_qty}</TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleSelectInventory(inv)}
                        >
                          Select
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setInventoryDialogOpen(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>

        {/* Complete Build Dialog */}
        <Dialog
          open={completeDialogOpen}
          onClose={() => setCompleteDialogOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Complete Build</DialogTitle>
          <DialogContent>
            <MDBox pt={2}>
              <MDTypography variant="body2" mb={2}>
                Quantity to Build: <strong>{header.quantity_ordered || 0}</strong>
              </MDTypography>
              <MDTypography variant="body2" mb={2}>
                Already Completed: <strong>{header.quantity_completed || 0}</strong>
              </MDTypography>
              <TextField
                type="number"
                label="Complete Quantity"
                value={completeQuantity}
                onChange={(e) => setCompleteQuantity(parseInt(e.target.value) || 0)}
                fullWidth
                inputProps={{
                  min: 1,
                  max: (header.quantity_ordered || 0) - (header.quantity_completed || 0),
                }}
              />
            </MDBox>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCompleteDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleComplete}
              variant="contained"
              color="success"
              disabled={completeQuantity <= 0}
            >
              Complete
            </Button>
          </DialogActions>
        </Dialog>
      </MDBox>
    </Card>
  );
}

export default WorkOrderForm;
