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
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
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

const STATUS_OPTIONS = ["draft", "confirmed", "shipped", "delivered", "cancelled"];

function SaleForm() {
  const { sale_id } = useParams();
  const navigate = useNavigate();

  const [header, setHeader] = useState({
    customer_id: "",
    sales_number: "",
    order_date: new Date().toISOString().split("T")[0],
    delivery_date: "",
    total_amount: 0,
    status: "draft",
    notes: "",
    shipping_address: "",
    created_by: 1,
  });

  const [details, setDetails] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Ship dialog state
  const [shipDialogOpen, setShipDialogOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [shipQuantity, setShipQuantity] = useState(0);
  const [shipDate, setShipDate] = useState(new Date().toISOString().split("T")[0]);
  const [shipNotes, setShipNotes] = useState("");
  const [availableInventory, setAvailableInventory] = useState([]);
  const [selectedInventory, setSelectedInventory] = useState(null);

  // Fetch customers and items for dropdowns
  useEffect(() => {
    axios
      .get("http://localhost:5000/customers")
      .then((response) => setCustomers(response.data))
      .catch((error) => console.error("Error fetching customers:", error));

    axios
      .get("http://localhost:5000/items?table=ep_items")
      .then((response) => setItems(response.data))
      .catch((error) => console.error("Error fetching items:", error));
  }, []);

  // Store the actual Sale ID from database
  const [saleId, setSaleId] = useState(null);

  // Fetch existing Sale if editing
  useEffect(() => {
    if (sale_id && sale_id !== "undefined") {
      axios
        .get(`http://localhost:5000/sales/${sale_id}`)
        .then((response) => {
          const saleData = response.data;
          const headerData = saleData.header || saleData;
          setSaleId(headerData.sale_id || sale_id);
          setHeader({
            customer_id: headerData.customer_id || "",
            sales_number: headerData.sales_number || "",
            order_date: headerData.order_date ? headerData.order_date.split("T")[0] : "",
            delivery_date: headerData.delivery_date ? headerData.delivery_date.split("T")[0] : "",
            total_amount: headerData.total_amount || 0,
            status: headerData.status || "draft",
            notes: headerData.notes || "",
            shipping_address: headerData.shipping_address || "",
            created_by: headerData.created_by || 1,
          });
          setDetails(saleData.details || []);
        })
        .catch((error) => console.error("Error fetching Sale:", error));
    }
  }, [sale_id]);

  // Calculate total amount when details change
  useEffect(() => {
    const total = details.reduce((sum, detail) => sum + (parseFloat(detail.subtotal) || 0), 0);
    setHeader((prev) => ({ ...prev, total_amount: total }));
  }, [details]);

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleCustomerChange = (event, newValue) => {
    setHeader((prev) => ({
      ...prev,
      customer_id: newValue?.customer_id || "",
      shipping_address: newValue
        ? `${newValue.shipping_address || ""}, ${newValue.shipping_address_city || ""}, ${
            newValue.shipping_address_state || ""
          } ${newValue.shipping_address_zip || ""}`.trim()
        : "",
    }));
  };

  const handleAddDetail = () => {
    setDetails([
      ...details,
      {
        item_id: "",
        quantity: 1,
        unit_price: 0,
        subtotal: 0,
        notes: "",
      },
    ]);
  };

  const handleDetailChange = (index, field, value) => {
    const newDetails = [...details];
    newDetails[index][field] = value;

    // Auto-calculate subtotal
    if (field === "quantity" || field === "unit_price") {
      const qty = parseFloat(newDetails[index].quantity) || 0;
      const price = parseFloat(newDetails[index].unit_price) || 0;
      newDetails[index].subtotal = qty * price;
    }

    setDetails(newDetails);
  };

  const handleItemSelect = (index, newValue) => {
    const newDetails = [...details];
    newDetails[index].item_id = newValue?.item_id || "";
    newDetails[index].item_name = newValue?.name || "";
    // Optionally set default price from item
    if (newValue?.unit_price) {
      newDetails[index].unit_price = newValue.unit_price;
      const qty = parseFloat(newDetails[index].quantity) || 0;
      newDetails[index].subtotal = qty * newValue.unit_price;
    }
    setDetails(newDetails);
  };

  const handleRemoveDetail = (index) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  // Ship dialog handlers
  const handleOpenShipDialog = async (detail, index) => {
    setSelectedDetail({ ...detail, index });
    const remainingQty = (detail.quantity || 0) - (detail.shipped_quantity || 0);
    setShipQuantity(remainingQty > 0 ? remainingQty : 0);
    setShipDate(new Date().toISOString().split("T")[0]);
    setShipNotes("");
    setSelectedInventory(null);

    // Fetch available inventory for this item
    try {
      const response = await axios.get(`http://localhost:5000/sales/inventory/${detail.item_id}`);
      setAvailableInventory(response.data || []);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      setAvailableInventory([]);
    }

    setShipDialogOpen(true);
  };

  const handleCloseShipDialog = () => {
    setShipDialogOpen(false);
    setSelectedDetail(null);
    setShipQuantity(0);
    setShipNotes("");
    setSelectedInventory(null);
    setAvailableInventory([]);
  };

  const handleShipItem = async () => {
    if (!selectedDetail || shipQuantity <= 0 || !selectedInventory) return;

    try {
      const shipData = {
        shipped_quantity: shipQuantity,
        shipped_date: shipDate,
        shipped_by: 1, // Replace with actual user ID
        inventory_id: selectedInventory.inventory_id,
        notes: shipNotes || null,
      };

      await axios.post(
        `http://localhost:5000/sales/details/${selectedDetail.detail_id}/ship`,
        shipData
      );

      // Refresh Sale data
      if (sale_id) {
        const response = await axios.get(`http://localhost:5000/sales/${sale_id}`);
        setDetails(response.data.details || []);
      }

      setSuccessMessage(true);
      handleCloseShipDialog();
    } catch (error) {
      console.error("Error shipping item:", error);
      alert(error.response?.data?.error || "Failed to ship item");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let newErrors = {};
    if (!header.customer_id) newErrors.customer_id = "Customer is required";
    if (!header.sales_number) newErrors.sales_number = "Sales Number is required";
    if (!header.order_date) newErrors.order_date = "Order Date is required";
    if (details.length === 0) newErrors.details = "At least one item is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }
    setErrors({});

    const payload = {
      header,
      details: details.map((d) => ({
        item_id: d.item_id,
        quantity: d.quantity,
        unit_price: d.unit_price,
        subtotal: d.subtotal,
        notes: d.notes,
      })),
    };

    try {
      const updateId = saleId || sale_id;

      if (updateId && updateId !== "undefined") {
        // Update header
        await axios.put(`http://localhost:5000/sales/${updateId}`, header);

        // Update details
        for (const detail of details) {
          if (detail.detail_id) {
            // Update existing detail
            await axios.put(`http://localhost:5000/sales/details/${detail.detail_id}`, {
              item_id: detail.item_id,
              quantity: detail.quantity,
              unit_price: detail.unit_price,
              subtotal: detail.subtotal,
              notes: detail.notes,
            });
          } else {
            // Add new detail
            await axios.post(`http://localhost:5000/sales/${updateId}/details`, {
              item_id: detail.item_id,
              quantity: detail.quantity,
              unit_price: detail.unit_price,
              subtotal: detail.subtotal,
              notes: detail.notes,
            });
          }
        }
      } else {
        await axios.post("http://localhost:5000/sales", payload);
      }

      setSuccessMessage(true);
      setTimeout(() => {
        navigate("/sales");
      }, 2000);
    } catch (error) {
      console.error("Error saving Sale:", error);
      alert("Failed to save Sales Order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCustomer = customers.find((c) => c.customer_id === header.customer_id) || null;

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
          {sale_id ? "Edit Sales Order" : "New Sales Order"}
        </MDTypography>
      </MDBox>
      <MDBox p={3} component="form" onSubmit={handleSubmit}>
        {/* Header Section */}
        <MDTypography variant="h5" fontWeight="bold" color="info" mt={2} mb={1}>
          Sales Order Information
        </MDTypography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={customers}
              getOptionLabel={(option) => option.company_name || ""}
              value={selectedCustomer}
              onChange={handleCustomerChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Customer *"
                  error={Boolean(errors.customer_id)}
                  helperText={errors.customer_id}
                />
              )}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDInput
              type="text"
              label="Sales Number"
              name="sales_number"
              value={header.sales_number || ""}
              onChange={handleHeaderChange}
              fullWidth
              required
              error={Boolean(errors.sales_number)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <MDInput
              type="date"
              label="Order Date"
              name="order_date"
              value={header.order_date || ""}
              onChange={handleHeaderChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              error={Boolean(errors.order_date)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <MDInput
              type="date"
              label="Delivery Date"
              name="delivery_date"
              value={header.delivery_date || ""}
              onChange={handleHeaderChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
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
              sx={{
                "& .MuiInputBase-root": {
                  height: 45,
                },
              }}
            >
              {STATUS_OPTIONS.map((status) => (
                <MenuItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <MDInput
              type="text"
              label="Shipping Address"
              name="shipping_address"
              value={header.shipping_address || ""}
              onChange={handleHeaderChange}
              fullWidth
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

        {/* Details Section */}
        <MDTypography variant="h5" fontWeight="bold" color="info" mt={4} mb={1}>
          Order Items
        </MDTypography>
        {errors.details && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.details}
          </Alert>
        )}
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead sx={{ display: "table-header-group" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Item</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">
                  Quantity
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">
                  Shipped
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Unit Price
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Subtotal
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Notes</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {details.map((detail, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ minWidth: 200 }}>
                    <Autocomplete
                      options={items}
                      getOptionLabel={(option) => option.name || ""}
                      value={items.find((i) => i.item_id === detail.item_id) || null}
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
                      value={detail.quantity}
                      onChange={(e) => handleDetailChange(index, "quantity", e.target.value)}
                      inputProps={{ min: 1 }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ width: 100 }}>
                    <MDTypography
                      variant="body2"
                      color={detail.shipped_quantity > 0 ? "success" : "text"}
                    >
                      {detail.shipped_quantity || 0} / {detail.quantity || 0}
                    </MDTypography>
                  </TableCell>
                  <TableCell align="right" sx={{ width: 120 }}>
                    <TextField
                      type="number"
                      size="small"
                      value={detail.unit_price}
                      onChange={(e) => handleDetailChange(index, "unit_price", e.target.value)}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ width: 100 }}>
                    ${parseFloat(detail.subtotal || 0).toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ width: 150 }}>
                    <TextField
                      size="small"
                      value={detail.notes || ""}
                      onChange={(e) => handleDetailChange(index, "notes", e.target.value)}
                      placeholder="Notes"
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ minWidth: 120 }}>
                    <MDBox display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                      {sale_id && detail.detail_id && (
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenShipDialog(detail, index)}
                          disabled={(detail.shipped_quantity || 0) >= (detail.quantity || 0)}
                          title="Ship Item"
                        >
                          <LocalShippingIcon />
                        </IconButton>
                      )}
                      <IconButton color="error" onClick={() => handleRemoveDetail(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </MDBox>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddDetail}
          sx={{
            mb: 2,
            color: "#ffffff",
            backgroundColor: "blue",
            "&:hover": { backgroundColor: "darkblue" },
          }}
        >
          Add Item
        </Button>

        {/* Total Amount */}
        <MDBox display="flex" justifyContent="flex-end" mb={3}>
          <MDTypography variant="h6">
            Total Amount: ${parseFloat(header.total_amount || 0).toFixed(2)}
          </MDTypography>
        </MDBox>

        {/* Save Button */}
        <Stack direction="row" spacing={2} mt={3}>
          <Button
            type="submit"
            variant="contained"
            sx={{ color: "#ffffff", backgroundColor: "green" }}
            disabled={isLoading}
          >
            {sale_id ? "Update" : "Save"}
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/sales")}
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
            Sales Order saved successfully!
          </Alert>
        </Snackbar>

        {/* Ship Item Dialog */}
        <Dialog open={shipDialogOpen} onClose={handleCloseShipDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Ship Item</DialogTitle>
          <DialogContent>
            <MDBox pt={2}>
              <MDTypography variant="body2" mb={2}>
                Item: <strong>{selectedDetail?.item_name || "N/A"}</strong>
              </MDTypography>
              <MDTypography variant="body2" mb={2}>
                Ordered Quantity: <strong>{selectedDetail?.quantity || 0}</strong>
              </MDTypography>
              <MDTypography variant="body2" mb={2}>
                Already Shipped: <strong>{selectedDetail?.shipped_quantity || 0}</strong>
              </MDTypography>
              <MDTypography variant="body2" mb={2}>
                Remaining:{" "}
                <strong>
                  {(selectedDetail?.quantity || 0) - (selectedDetail?.shipped_quantity || 0)}
                </strong>
              </MDTypography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Autocomplete
                    options={availableInventory}
                    getOptionLabel={(option) =>
                      `Available: ${option.available_qty} | Batch: ${
                        option.batch_number || "N/A"
                      } | Location: ${option.location || "N/A"}`
                    }
                    value={selectedInventory}
                    onChange={(e, newValue) => setSelectedInventory(newValue)}
                    renderInput={(params) => <TextField {...params} label="Select Inventory *" />}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    type="number"
                    label="Quantity to Ship *"
                    value={shipQuantity}
                    onChange={(e) => setShipQuantity(parseInt(e.target.value) || 0)}
                    fullWidth
                    inputProps={{
                      min: 1,
                      max: Math.min(
                        (selectedDetail?.quantity || 0) - (selectedDetail?.shipped_quantity || 0),
                        selectedInventory?.available_qty || 999999
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    type="date"
                    label="Ship Date"
                    value={shipDate}
                    onChange={(e) => setShipDate(e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    type="text"
                    label="Notes"
                    value={shipNotes}
                    onChange={(e) => setShipNotes(e.target.value)}
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Shipping notes..."
                  />
                </Grid>
              </Grid>
              {availableInventory.length === 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  No inventory available for this item
                </Alert>
              )}
            </MDBox>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseShipDialog} color="secondary">
              Cancel
            </Button>
            <Button
              onClick={handleShipItem}
              variant="contained"
              color="primary"
              disabled={shipQuantity <= 0 || !selectedInventory}
            >
              Ship
            </Button>
          </DialogActions>
        </Dialog>
      </MDBox>
    </Card>
  );
}

export default SaleForm;
