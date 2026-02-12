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
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import axios from "axios";

function BomForm() {
  const { bom_id } = useParams();
  const navigate = useNavigate();

  const [header, setHeader] = useState({
    bom_number: "",
    name: "",
    description: "",
    output_item_id: null,
    output_quantity: 1,
    version: "1.0",
    is_active: true,
    notes: "",
    created_by: 1,
  });

  const [components, setComponents] = useState([]);
  const [items, setItems] = useState([]);
  const [allBOMs, setAllBOMs] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bomId, setBomId] = useState(null);

  // Fetch items for dropdown
  useEffect(() => {
    axios
      .get("http://localhost:5000/items?table=ep_items")
      .then((response) => setItems(response.data))
      .catch((error) => console.error("Error fetching items:", error));

    // Fetch all BOMs for subassembly selection
    axios
      .get("http://localhost:5000/bom/active")
      .then((response) => setAllBOMs(response.data))
      .catch((error) => console.error("Error fetching BOMs:", error));
  }, []);

  // Fetch existing BOM if editing
  useEffect(() => {
    if (bom_id && bom_id !== "undefined") {
      axios
        .get(`http://localhost:5000/bom/${bom_id}`)
        .then((response) => {
          const bomData = response.data;
          const headerData = bomData.header || bomData;
          setBomId(headerData.bom_id || bom_id);
          setHeader({
            bom_number: headerData.bom_number || "",
            name: headerData.name || "",
            description: headerData.description || "",
            output_item_id: headerData.output_item_id || null,
            output_quantity: headerData.output_quantity || 1,
            version: headerData.version || "1.0",
            is_active: headerData.is_active === 1 || headerData.is_active === true,
            notes: headerData.notes || "",
            created_by: headerData.created_by || 1,
            output_item_code: headerData.output_item_code || "",
            output_item_name: headerData.output_item_name || "",
          });
          setComponents(bomData.components || []);
        })
        .catch((error) => console.error("Error fetching BOM:", error));
    }
  }, [bom_id]);

  const handleHeaderChange = (e) => {
    const { name, value, type, checked } = e.target;
    setHeader((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddComponent = () => {
    setComponents([
      ...components,
      {
        item_id: "",
        quantity_per_unit: 1,
        is_subassembly: false,
        subassembly_bom_id: null,
        sequence_order: components.length,
        notes: "",
      },
    ]);
  };

  const handleComponentChange = (index, field, value) => {
    const newComponents = [...components];
    newComponents[index][field] = value;

    // If toggling subassembly off, clear the subassembly_bom_id
    if (field === "is_subassembly" && !value) {
      newComponents[index].subassembly_bom_id = null;
    }

    setComponents(newComponents);
  };

  const handleItemSelect = (index, newValue) => {
    const newComponents = [...components];
    newComponents[index].item_id = newValue?.item_id || "";
    newComponents[index].item_name = newValue?.name || "";
    newComponents[index].item_code = newValue?.item_code || "";
    setComponents(newComponents);
  };

  const handleSubassemblyBOMSelect = (index, newValue) => {
    const newComponents = [...components];
    newComponents[index].subassembly_bom_id = newValue?.bom_id || null;
    newComponents[index].subassembly_bom_number = newValue?.bom_number || "";
    newComponents[index].subassembly_bom_name = newValue?.name || "";
    setComponents(newComponents);
  };

  const handleRemoveComponent = async (index) => {
    const component = components[index];

    // If component has ID (exists in DB), delete from server
    if (component.bom_component_id) {
      try {
        await axios.delete(`http://localhost:5000/bom/components/${component.bom_component_id}`);
      } catch (error) {
        console.error("Error deleting component:", error);
        alert("Failed to delete component");
        return;
      }
    }

    setComponents(components.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let newErrors = {};
    if (!header.bom_number) newErrors.bom_number = "BOM Number is required";
    if (!header.name) newErrors.name = "Name is required";
    if (!header.output_item_id) newErrors.output_item_id = "Output Item is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }
    setErrors({});

    try {
      const updateId = bomId || bom_id;

      if (updateId && updateId !== "undefined") {
        // Update existing BOM
        await axios.put(`http://localhost:5000/bom/${updateId}`, header);

        // Update/Add components
        for (const component of components) {
          if (component.bom_component_id) {
            await axios.put(`http://localhost:5000/bom/components/${component.bom_component_id}`, {
              item_id: component.item_id,
              quantity_per_unit: component.quantity_per_unit,
              is_subassembly: component.is_subassembly ? 1 : 0,
              subassembly_bom_id: component.subassembly_bom_id,
              sequence_order: component.sequence_order,
              notes: component.notes,
            });
          } else {
            await axios.post(`http://localhost:5000/bom/${updateId}/components`, {
              item_id: component.item_id,
              quantity_per_unit: component.quantity_per_unit,
              is_subassembly: component.is_subassembly ? 1 : 0,
              subassembly_bom_id: component.subassembly_bom_id,
              sequence_order: component.sequence_order,
              notes: component.notes,
            });
          }
        }
      } else {
        // Create new BOM
        const payload = {
          header: {
            ...header,
            is_active: header.is_active ? 1 : 0,
          },
          components: components.map((c) => ({
            item_id: c.item_id,
            quantity_per_unit: c.quantity_per_unit,
            is_subassembly: c.is_subassembly ? 1 : 0,
            subassembly_bom_id: c.subassembly_bom_id,
            sequence_order: c.sequence_order,
            notes: c.notes,
          })),
        };
        await axios.post("http://localhost:5000/bom", payload);
      }

      setSuccessMessage(true);
      setTimeout(() => {
        navigate("/bom");
      }, 2000);
    } catch (error) {
      console.error("Error saving BOM:", error);
      alert(error.response?.data?.error || "Failed to save BOM. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter out current BOM from subassembly selection to prevent circular reference
  const availableBOMs = allBOMs.filter((b) => b.bom_id !== parseInt(bomId || bom_id));

  // Filter out output item from component item selection to prevent self-referencing
  const availableComponentItems = items.filter((i) => i.item_id !== header.output_item_id);

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
          {bom_id ? "Edit BOM" : "New BOM"}
        </MDTypography>
      </MDBox>
      <MDBox p={3} component="form" onSubmit={handleSubmit}>
        {/* Header Section */}
        <MDTypography variant="h5" fontWeight="bold" color="info" mt={2} mb={1}>
          BOM Information
        </MDTypography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <MDInput
              type="text"
              label="BOM Number"
              name="bom_number"
              value={header.bom_number || ""}
              onChange={handleHeaderChange}
              fullWidth
              required
              error={Boolean(errors.bom_number)}
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
          <Grid item xs={12} sm={2}>
            <MDInput
              type="text"
              label="Version"
              name="version"
              value={header.version || "1.0"}
              onChange={handleHeaderChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <MDInput
              type="number"
              label="Output Qty"
              name="output_quantity"
              value={header.output_quantity || 1}
              onChange={handleHeaderChange}
              fullWidth
              inputProps={{ min: 1, step: 0.01 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
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
                  label="Output Item (Produced Item) *"
                  size="medium"
                  InputLabelProps={{ shrink: true }}
                  error={Boolean(errors.output_item_id)}
                  helperText="The item that will be produced by this BOM"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDInput
              type="text"
              label="Description"
              name="description"
              value={header.description || ""}
              onChange={handleHeaderChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={10}>
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
          <Grid item xs={12} sm={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={header.is_active}
                  onChange={handleHeaderChange}
                  name="is_active"
                />
              }
              label="Active"
            />
          </Grid>
        </Grid>

        {/* Components Section */}
        <MDTypography variant="h5" fontWeight="bold" color="info" mt={4} mb={1}>
          Components (Materials Required)
        </MDTypography>
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead sx={{ display: "table-header-group" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Item</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">
                  Qty/Unit
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">
                  Subassembly?
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Sub-BOM</TableCell>
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
                      options={availableComponentItems}
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
                  </TableCell>
                  <TableCell align="center" sx={{ width: 100 }}>
                    <TextField
                      type="number"
                      size="small"
                      value={component.quantity_per_unit || 1}
                      onChange={(e) =>
                        handleComponentChange(
                          index,
                          "quantity_per_unit",
                          parseFloat(e.target.value) || 1
                        )
                      }
                      inputProps={{ min: 0.0001, step: 0.0001 }}
                      sx={{ width: 80 }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ width: 80 }}>
                    <Checkbox
                      checked={component.is_subassembly || false}
                      onChange={(e) =>
                        handleComponentChange(index, "is_subassembly", e.target.checked)
                      }
                    />
                  </TableCell>
                  <TableCell sx={{ minWidth: 180 }}>
                    {component.is_subassembly && (
                      <Autocomplete
                        options={availableBOMs}
                        getOptionLabel={(option) =>
                          option ? `${option.bom_number} - ${option.name}` : ""
                        }
                        value={
                          availableBOMs.find((b) => b.bom_id === component.subassembly_bom_id) ||
                          null
                        }
                        onChange={(e, newValue) => handleSubassemblyBOMSelect(index, newValue)}
                        renderInput={(params) => (
                          <TextField {...params} size="small" placeholder="Select Sub-BOM" />
                        )}
                        size="small"
                      />
                    )}
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
            {bom_id ? "Update" : "Save"}
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/bom")}
            sx={{
              color: "#ffffff",
              backgroundColor: "red",
              "&:hover": { backgroundColor: "darkred" },
            }}
          >
            Cancel
          </Button>
        </Stack>

        {/* Success Alert */}
        <Snackbar
          open={successMessage}
          autoHideDuration={4000}
          onClose={() => setSuccessMessage(false)}
        >
          <Alert onClose={() => setSuccessMessage(false)} severity="success">
            BOM saved successfully!
          </Alert>
        </Snackbar>
      </MDBox>
    </Card>
  );
}

export default BomForm;
