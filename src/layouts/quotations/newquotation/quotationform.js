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

const STATUS_OPTIONS = ["draft", "sent", "accepted", "rejected", "expired", "converted"];

function QuotationForm() {
  const { quotation_id } = useParams();
  const navigate = useNavigate();

  const [header, setHeader] = useState({
    customer_id: "",
    quotation_number: "",
    quotation_date: new Date().toISOString().split("T")[0],
    valid_until: "",
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

  // Convert to SO dialog state
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [salesNumber, setSalesNumber] = useState("");

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

  // Store the actual Quotation ID from database
  const [quotationId, setQuotationId] = useState(null);

  // Fetch existing Quotation if editing
  useEffect(() => {
    if (quotation_id && quotation_id !== "undefined") {
      axios
        .get(`http://localhost:5000/quotations/${quotation_id}`)
        .then((response) => {
          const quotationData = response.data;
          const headerData = quotationData.header || quotationData;
          setQuotationId(headerData.quotation_id || quotation_id);
          setHeader({
            customer_id: headerData.customer_id || "",
            quotation_number: headerData.quotation_number || "",
            quotation_date: headerData.quotation_date
              ? headerData.quotation_date.split("T")[0]
              : "",
            valid_until: headerData.valid_until ? headerData.valid_until.split("T")[0] : "",
            total_amount: headerData.total_amount || 0,
            status: headerData.status || "draft",
            notes: headerData.notes || "",
            shipping_address: headerData.shipping_address || "",
            created_by: headerData.created_by || 1,
          });
          setDetails(quotationData.details || []);
        })
        .catch((error) => console.error("Error fetching Quotation:", error));
    }
  }, [quotation_id]);

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
    // Set default price from item's sales_price
    if (newValue?.sales_price) {
      newDetails[index].unit_price = newValue.sales_price;
      const qty = parseFloat(newDetails[index].quantity) || 0;
      newDetails[index].subtotal = qty * newValue.sales_price;
    }
    setDetails(newDetails);
  };

  const handleRemoveDetail = (index) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  // Convert to SO handlers
  const handleOpenConvertDialog = () => {
    setSalesNumber("");
    setConvertDialogOpen(true);
  };

  const handleCloseConvertDialog = () => {
    setConvertDialogOpen(false);
    setSalesNumber("");
  };

  const handleConvertToSO = async () => {
    if (!salesNumber.trim()) {
      alert("Sales Number is required");
      return;
    }

    try {
      const updateId = quotationId || quotation_id;
      const response = await axios.post(
        `http://localhost:5000/quotations/${updateId}/convert-to-so`,
        { sales_number: salesNumber }
      );
      handleCloseConvertDialog();
      alert(response.data.message || "Converted successfully!");

      if (response.data.sale_id) {
        navigate(`/sales/newsale/${response.data.sale_id}`);
      }
    } catch (error) {
      console.error("Convert error:", error);
      alert(error.response?.data?.error || "Failed to convert quotation to Sales Order");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let newErrors = {};
    if (!header.customer_id) newErrors.customer_id = "Customer is required";
    if (!header.quotation_number) newErrors.quotation_number = "Quotation Number is required";
    if (!header.quotation_date) newErrors.quotation_date = "Quotation Date is required";
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
      const updateId = quotationId || quotation_id;

      if (updateId && updateId !== "undefined") {
        // Update header
        await axios.put(`http://localhost:5000/quotations/${updateId}`, header);

        // Update details
        for (const detail of details) {
          if (detail.detail_id) {
            await axios.put(`http://localhost:5000/quotations/details/${detail.detail_id}`, {
              item_id: detail.item_id,
              quantity: detail.quantity,
              unit_price: detail.unit_price,
              subtotal: detail.subtotal,
              notes: detail.notes,
            });
          } else {
            await axios.post(`http://localhost:5000/quotations/${updateId}/details`, {
              item_id: detail.item_id,
              quantity: detail.quantity,
              unit_price: detail.unit_price,
              subtotal: detail.subtotal,
              notes: detail.notes,
            });
          }
        }
      } else {
        await axios.post("http://localhost:5000/quotations", payload);
      }

      setSuccessMessage(true);
      setTimeout(() => {
        navigate("/quotations");
      }, 2000);
    } catch (error) {
      console.error("Error saving Quotation:", error);
      alert("Failed to save Quotation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCustomer = customers.find((c) => c.customer_id === header.customer_id) || null;
  const isConverted = header.status === "converted";

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
          {quotation_id ? "Edit Quotation" : "New Quotation"}
        </MDTypography>
      </MDBox>
      <MDBox p={3} component="form" onSubmit={handleSubmit}>
        {isConverted && (
          <Alert severity="info" sx={{ mb: 2 }}>
            This quotation has been converted to a Sales Order and cannot be edited.
          </Alert>
        )}

        {/* Header Section */}
        <MDTypography variant="h5" fontWeight="bold" color="info" mt={2} mb={1}>
          Quotation Information
        </MDTypography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={customers}
              getOptionLabel={(option) => option.company_name || ""}
              value={selectedCustomer}
              onChange={handleCustomerChange}
              disabled={isConverted}
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
              label="Quotation Number"
              name="quotation_number"
              value={header.quotation_number || ""}
              onChange={handleHeaderChange}
              fullWidth
              required
              disabled={isConverted}
              error={Boolean(errors.quotation_number)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <MDInput
              type="date"
              label="Quotation Date"
              name="quotation_date"
              value={header.quotation_date || ""}
              onChange={handleHeaderChange}
              fullWidth
              required
              disabled={isConverted}
              InputLabelProps={{ shrink: true }}
              error={Boolean(errors.quotation_date)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <MDInput
              type="date"
              label="Valid Until"
              name="valid_until"
              value={header.valid_until || ""}
              onChange={handleHeaderChange}
              fullWidth
              disabled={isConverted}
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
              disabled={isConverted}
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
              disabled={isConverted}
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
              disabled={isConverted}
            />
          </Grid>
        </Grid>

        {/* Details Section */}
        <MDTypography variant="h5" fontWeight="bold" color="info" mt={4} mb={1}>
          Quotation Items
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
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Unit Price
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Subtotal
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Notes</TableCell>
                {!isConverted && (
                  <TableCell sx={{ fontWeight: "bold" }} align="center">
                    Action
                  </TableCell>
                )}
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
                      disabled={isConverted}
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
                      disabled={isConverted}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ width: 120 }}>
                    <TextField
                      type="number"
                      size="small"
                      value={detail.unit_price}
                      onChange={(e) => handleDetailChange(index, "unit_price", e.target.value)}
                      inputProps={{ min: 0, step: 0.01 }}
                      disabled={isConverted}
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
                      disabled={isConverted}
                    />
                  </TableCell>
                  {!isConverted && (
                    <TableCell align="center" sx={{ width: 80 }}>
                      <IconButton color="error" onClick={() => handleRemoveDetail(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {!isConverted && (
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
        )}

        {/* Total Amount */}
        <MDBox display="flex" justifyContent="flex-end" mb={3}>
          <MDTypography variant="h6">
            Total Amount: ${parseFloat(header.total_amount || 0).toFixed(2)}
          </MDTypography>
        </MDBox>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} mt={3}>
          {!isConverted && (
            <Button
              type="submit"
              variant="contained"
              sx={{ color: "#ffffff", backgroundColor: "green" }}
              disabled={isLoading}
            >
              {quotation_id ? "Update" : "Save"}
            </Button>
          )}
          {quotation_id && !isConverted && header.status !== "rejected" && (
            <Button
              variant="contained"
              onClick={handleOpenConvertDialog}
              sx={{
                color: "#ffffff",
                backgroundColor: "#1976d2",
                "&:hover": { backgroundColor: "#1565c0" },
              }}
            >
              Convert to Sales Order
            </Button>
          )}
          <Button
            variant="contained"
            onClick={() => navigate("/quotations")}
            sx={{
              color: "#ffffff",
              backgroundColor: "red",
              "&:hover": { backgroundColor: "darkred" },
            }}
          >
            {isConverted ? "Back" : "Cancel"}
          </Button>
        </Stack>

        {/* Success Alert */}
        <Snackbar
          open={successMessage}
          autoHideDuration={4000}
          onClose={() => setSuccessMessage(false)}
        >
          <Alert onClose={() => setSuccessMessage(false)} severity="success">
            Quotation saved successfully!
          </Alert>
        </Snackbar>

        {/* Convert to SO Dialog */}
        <Dialog open={convertDialogOpen} onClose={handleCloseConvertDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Convert Quotation to Sales Order</DialogTitle>
          <DialogContent>
            <MDBox pt={2}>
              <MDTypography variant="body2" mb={1}>
                Quotation: <strong>{header.quotation_number}</strong>
              </MDTypography>
              <MDTypography variant="body2" mb={1}>
                Customer: <strong>{selectedCustomer?.company_name || "-"}</strong>
              </MDTypography>
              <MDTypography variant="body2" mb={2}>
                Total Amount: <strong>${parseFloat(header.total_amount || 0).toFixed(2)}</strong>
              </MDTypography>
              <MDTypography variant="body2" mb={2} color="text">
                All quotation items will be copied to the new Sales Order.
              </MDTypography>
              <TextField
                label="Sales Order Number *"
                value={salesNumber}
                onChange={(e) => setSalesNumber(e.target.value)}
                fullWidth
                placeholder="Enter Sales Order Number"
              />
            </MDBox>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseConvertDialog} color="secondary">
              Cancel
            </Button>
            <Button
              onClick={handleConvertToSO}
              variant="contained"
              sx={{
                color: "#ffffff",
                backgroundColor: "green",
                "&:hover": { backgroundColor: "darkgreen" },
              }}
              disabled={!salesNumber.trim()}
            >
              Convert
            </Button>
          </DialogActions>
        </Dialog>
      </MDBox>
    </Card>
  );
}

export default QuotationForm;
