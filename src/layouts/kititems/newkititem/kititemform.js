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
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
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

const STATUS_OPTIONS = ["draft", "in_progress", "completed", "cancelled"];

function KitItemForm() {
  const { kit_item_id } = useParams();
  const navigate = useNavigate();

  const [header, setHeader] = useState({
    kit_number: "",
    name: "",
    description: "",
    quantity_to_build: 1,
    status: "draft",
    notes: "",
    created_by: 1,
    output_item_id: null,
  });

  const [components, setComponents] = useState([]);
  const [items, setItems] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Complete Build Dialog
  const [buildDialogOpen, setBuildDialogOpen] = useState(false);
  const [buildQuantity, setBuildQuantity] = useState(1);

  // Inventory selection for component
  const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false);
  const [selectedComponentIndex, setSelectedComponentIndex] = useState(null);
  const [availableInventory, setAvailableInventory] = useState([]);

  const [kitItemId, setKitItemId] = useState(null);

  // Fetch items for dropdown
  useEffect(() => {
    axios
      .get("http://localhost:5000/items?table=ep_items")
      .then((response) => setItems(response.data))
      .catch((error) => console.error("Error fetching items:", error));
  }, []);

  // Fetch existing Kit Item if editing
  useEffect(() => {
    if (kit_item_id && kit_item_id !== "undefined") {
      axios
        .get(`http://localhost:5000/kit-items/${kit_item_id}`)
        .then((response) => {
          const kitData = response.data;
          const headerData = kitData.header || kitData;
          setKitItemId(headerData.kit_item_id || kit_item_id);
          setHeader({
            kit_number: headerData.kit_number || "",
            name: headerData.name || "",
            description: headerData.description || "",
            quantity_to_build: headerData.quantity_to_build || 1,
            status: headerData.status || "draft",
            notes: headerData.notes || "",
            created_by: headerData.created_by || 1,
            output_item_id: headerData.output_item_id || null,
            output_item_code: headerData.output_item_code || "",
            output_item_name: headerData.output_item_name || "",
            completed_quantity: headerData.completed_quantity || 0,
          });
          setComponents(kitData.components || []);
        })
        .catch((error) => console.error("Error fetching Kit Item:", error));
    }
  }, [kit_item_id]);

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddComponent = () => {
    setComponents([
      ...components,
      {
        item_id: "",
        quantity_per_kit: 1,
        inventory_id: null,
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
    newComponents[index].inventory_id = null; // Reset inventory selection
    setComponents(newComponents);
  };

  const handleRemoveComponent = (index) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  // Inventory selection dialog
  const handleOpenInventoryDialog = async (index) => {
    const component = components[index];
    if (!component.item_id) {
      alert("Please select an item first");
      return;
    }

    setSelectedComponentIndex(index);
    try {
      const response = await axios.get(
        `http://localhost:5000/kit-items/inventory/${component.item_id}`
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

  // Reserve components
  const handleReserveComponents = async () => {
    if (!kitItemId) {
      alert("Please save the kit item first");
      return;
    }

    // Check all components have inventory selected
    const missingInventory = components.some((c) => !c.inventory_id);
    if (missingInventory) {
      alert("Please select inventory for all components");
      return;
    }

    try {
      await axios.post(`http://localhost:5000/kit-items/${kitItemId}/reserve`);
      setSuccessMessage(true);
      // Refresh data
      const response = await axios.get(`http://localhost:5000/kit-items/${kitItemId}`);
      setHeader((prev) => ({ ...prev, status: response.data.header.status }));
      setComponents(response.data.components || []);
    } catch (error) {
      console.error("Reserve error:", error);
      alert(error.response?.data?.error || "Failed to reserve components");
    }
  };

  // Complete build dialog
  const handleOpenBuildDialog = () => {
    const remaining = (header.quantity_to_build || 0) - (header.completed_quantity || 0);
    setBuildQuantity(remaining > 0 ? remaining : 1);
    setBuildDialogOpen(true);
  };

  const handleCompleteBuild = async () => {
    if (!kitItemId || buildQuantity <= 0) return;

    try {
      await axios.post(`http://localhost:5000/kit-items/${kitItemId}/complete`, {
        build_quantity: buildQuantity,
      });
      setSuccessMessage(true);
      setBuildDialogOpen(false);
      // Refresh data
      const response = await axios.get(`http://localhost:5000/kit-items/${kitItemId}`);
      setHeader((prev) => ({
        ...prev,
        status: response.data.header.status,
        completed_quantity: response.data.header.completed_quantity,
      }));
      setComponents(response.data.components || []);
    } catch (error) {
      console.error("Complete build error:", error);
      alert(error.response?.data?.error || "Failed to complete build");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let newErrors = {};
    if (!header.kit_number) newErrors.kit_number = "Kit Number is required";
    if (!header.name) newErrors.name = "Name is required";
    if (components.length === 0) newErrors.components = "At least one component is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }
    setErrors({});

    const payload = {
      header,
      components: components.map((c) => ({
        item_id: c.item_id,
        quantity_per_kit: c.quantity_per_kit,
        inventory_id: c.inventory_id,
        notes: c.notes,
      })),
    };

    try {
      const updateId = kitItemId || kit_item_id;

      if (updateId && updateId !== "undefined") {
        await axios.put(`http://localhost:5000/kit-items/${updateId}`, header);

        for (const component of components) {
          if (component.component_id) {
            await axios.put(
              `http://localhost:5000/kit-items/components/${component.component_id}`,
              {
                item_id: component.item_id,
                quantity_per_kit: component.quantity_per_kit,
                inventory_id: component.inventory_id,
                notes: component.notes,
              }
            );
          } else {
            await axios.post(`http://localhost:5000/kit-items/${updateId}/components`, {
              item_id: component.item_id,
              quantity_per_kit: component.quantity_per_kit,
              inventory_id: component.inventory_id,
              notes: component.notes,
            });
          }
        }
      } else {
        await axios.post("http://localhost:5000/kit-items", payload);
      }

      setSuccessMessage(true);
      setTimeout(() => {
        navigate("/kititems");
      }, 2000);
    } catch (error) {
      console.error("Error saving Kit Item:", error);
      alert("Failed to save Kit Item. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
      >
        <MDTypography variant="h6" color="white">
          {kit_item_id ? "Edit Kit Item" : "New Kit Item"}
        </MDTypography>
      </MDBox>
      <MDBox p={3} component="form" onSubmit={handleSubmit}>
        {/* Header Section */}
        <MDTypography variant="h5" fontWeight="bold" color="info" mt={2} mb={1}>
          Kit Item Information
        </MDTypography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <MDInput
              type="text"
              label="Kit Number"
              name="kit_number"
              value={header.kit_number || ""}
              onChange={handleHeaderChange}
              fullWidth
              required
              error={Boolean(errors.kit_number)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <MDInput
              type="text"
              label="Name"
              name="name"
              value={header.name || ""}
              onChange={handleHeaderChange}
              fullWidth
              required
              error={Boolean(errors.name)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <MDInput
              type="number"
              label="Quantity to Build"
              name="quantity_to_build"
              value={header.quantity_to_build || 1}
              onChange={handleHeaderChange}
              fullWidth
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <MDInput
              type="text"
              label="Description"
              name="description"
              value={header.description || ""}
              onChange={handleHeaderChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Status"
              name="status"
              value={header.status || "draft"}
              onChange={handleHeaderChange}
              fullWidth
              size="medium"
              InputLabelProps={{ shrink: true }}
              sx={{ "& .MuiInputBase-root": { height: 45 } }}
            >
              {STATUS_OPTIONS.map((status) => (
                <MenuItem key={status} value={status}>
                  {status.replace("_", " ").charAt(0).toUpperCase() +
                    status.replace("_", " ").slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
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
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Output Item (Produced Item)"
                  size="medium"
                  InputLabelProps={{ shrink: true }}
                  helperText="Item created when kit is completed"
                />
              )}
            />
          </Grid>
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

        {/* Components Section */}
        <MDTypography variant="h5" fontWeight="bold" color="info" mt={4} mb={1}>
          Components
        </MDTypography>
        {errors.components && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.components}
          </Alert>
        )}
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead sx={{ display: "table-header-group" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Item</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">
                  Qty/Kit
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Inventory</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">
                  Reserved
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">
                  Used
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Notes</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {components.map((component, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ minWidth: 200 }}>
                    <Autocomplete
                      options={items}
                      getOptionLabel={(option) => option.name || ""}
                      value={items.find((i) => i.item_id === component.item_id) || null}
                      onChange={(e, newValue) => handleItemSelect(index, newValue)}
                      renderInput={(params) => (
                        <TextField {...params} size="small" placeholder="Select Item" />
                      )}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ width: 80 }}>
                    <TextField
                      type="number"
                      size="small"
                      value={component.quantity_per_kit}
                      onChange={(e) =>
                        handleComponentChange(index, "quantity_per_kit", e.target.value)
                      }
                      inputProps={{ min: 1 }}
                      sx={{ width: 70 }}
                    />
                  </TableCell>
                  <TableCell sx={{ minWidth: 150 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleOpenInventoryDialog(index)}
                    >
                      {component.inventory_id
                        ? `${component.batch_number || "Selected"} (${component.available_qty || 0})`
                        : "Select"}
                    </Button>
                  </TableCell>
                  <TableCell align="center" sx={{ width: 80 }}>
                    {component.reserved_quantity || 0}
                  </TableCell>
                  <TableCell align="center" sx={{ width: 80 }}>
                    {component.used_quantity || 0}
                  </TableCell>
                  <TableCell sx={{ width: 120 }}>
                    <TextField
                      size="small"
                      value={component.notes || ""}
                      onChange={(e) => handleComponentChange(index, "notes", e.target.value)}
                      placeholder="Notes"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton color="error" onClick={() => handleRemoveComponent(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

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

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} mt={3}>
          <Button
            type="submit"
            variant="contained"
            sx={{ color: "#ffffff", backgroundColor: "green" }}
            disabled={isLoading}
          >
            {kit_item_id ? "Update" : "Save"}
          </Button>
          {kit_item_id && header.status === "draft" && (
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={handleReserveComponents}
              sx={{
                color: "#ffffff",
                backgroundColor: "orange",
                "&:hover": { backgroundColor: "darkorange" },
              }}
            >
              Reserve Components
            </Button>
          )}
          {kit_item_id && header.status === "in_progress" && (
            <Button
              variant="contained"
              startIcon={<CheckCircleIcon />}
              onClick={handleOpenBuildDialog}
              sx={{
                color: "#ffffff",
                backgroundColor: "purple",
                "&:hover": { backgroundColor: "darkviolet" },
              }}
            >
              Complete Build
            </Button>
          )}
          <Button
            variant="contained"
            onClick={() => navigate("/kititems")}
            sx={{
              color: "#ffffff",
              backgroundColor: "red",
              "&:hover": { backgroundColor: "darkred" },
            }}
          >
            Cancel
          </Button>
        </Stack>

        {/* Progress Info */}
        {kit_item_id && (
          <MDBox mt={3}>
            <MDTypography variant="body2">
              Build Progress: {header.completed_quantity || 0} / {header.quantity_to_build || 0}
            </MDTypography>
            {header.output_item_id && (
              <MDTypography variant="body2" mt={1}>
                Output Item: <strong>{header.output_item_code} - {header.output_item_name}</strong>
                {header.status === "completed" && (
                  <span style={{ color: "green", marginLeft: 8 }}>
                    (Inventory created: {header.completed_quantity || 0} units)
                  </span>
                )}
              </MDTypography>
            )}
          </MDBox>
        )}

        {/* Success Alert */}
        <Snackbar
          open={successMessage}
          autoHideDuration={4000}
          onClose={() => setSuccessMessage(false)}
        >
          <Alert onClose={() => setSuccessMessage(false)} severity="success">
            Kit Item saved successfully!
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
          open={buildDialogOpen}
          onClose={() => setBuildDialogOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Complete Build</DialogTitle>
          <DialogContent>
            <MDBox pt={2}>
              <MDTypography variant="body2" mb={2}>
                Quantity to Build: <strong>{header.quantity_to_build || 0}</strong>
              </MDTypography>
              <MDTypography variant="body2" mb={2}>
                Already Completed: <strong>{header.completed_quantity || 0}</strong>
              </MDTypography>
              <TextField
                type="number"
                label="Build Quantity"
                value={buildQuantity}
                onChange={(e) => setBuildQuantity(parseInt(e.target.value) || 0)}
                fullWidth
                inputProps={{
                  min: 1,
                  max: (header.quantity_to_build || 0) - (header.completed_quantity || 0),
                }}
              />
            </MDBox>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBuildDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCompleteBuild}
              variant="contained"
              color="success"
              disabled={buildQuantity <= 0}
            >
              Complete
            </Button>
          </DialogActions>
        </Dialog>
      </MDBox>
    </Card>
  );
}

export default KitItemForm;
