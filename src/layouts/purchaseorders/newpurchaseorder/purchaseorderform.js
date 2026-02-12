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
import PrintIcon from "@mui/icons-material/Print";
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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const STATUS_OPTIONS = ["Pending", "Approved", "Received", "Cancelled"];

function PurchaseOrderForm() {
  const { po_id } = useParams();
  const navigate = useNavigate();

  const [header, setHeader] = useState({
    supplier_id: "",
    po_number: "",
    order_date: new Date().toISOString().split("T")[0],
    expected_delivery: "",
    total_amount: 0,
    status: "Pending",
    notes: "",
    created_by: 1,
  });

  const [details, setDetails] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Receive dialog state
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [receiveQuantity, setReceiveQuantity] = useState(0);
  const [receiveBatchNumber, setReceiveBatchNumber] = useState("");
  const [receiveExpiryDate, setReceiveExpiryDate] = useState("");
  const [receiveLocation, setReceiveLocation] = useState("");

  // Company info for PDF
  const [companyInfo, setCompanyInfo] = useState(null);

  // Fetch suppliers, items, and company info
  useEffect(() => {
    axios
      .get("http://localhost:5000/suppliers")
      .then((response) => setSuppliers(response.data))
      .catch((error) => console.error("Error fetching suppliers:", error));

    axios
      .get("http://localhost:5000/company")
      .then((response) => setCompanyInfo(response.data))
      .catch((error) => console.error("Error fetching company:", error));

    axios
      .get("http://localhost:5000/items?table=ep_items")
      .then((response) => setItems(response.data))
      .catch((error) => console.error("Error fetching items:", error));
  }, []);

  // Store the actual PO ID from database (may differ from URL param)
  const [purchaseOrderId, setPurchaseOrderId] = useState(null);

  // Fetch existing PO if editing
  useEffect(() => {
    if (po_id && po_id !== "undefined") {
      axios
        .get(`http://localhost:5000/purchase-orders/${po_id}`)
        .then((response) => {
          const poData = response.data;
          const headerData = poData.header || poData;
          // Store the actual PO ID from database
          setPurchaseOrderId(headerData.purchaseorder_id || po_id);
          setHeader({
            supplier_id: headerData.supplier_id || "",
            po_number: headerData.po_number || "",
            order_date: headerData.order_date ? headerData.order_date.split("T")[0] : "",
            expected_delivery: headerData.expected_delivery
              ? headerData.expected_delivery.split("T")[0]
              : "",
            total_amount: headerData.total_amount || 0,
            status: headerData.status || "Pending",
            notes: headerData.notes || "",
            created_by: headerData.created_by || 1,
          });
          setDetails(poData.details || []);
        })
        .catch((error) => console.error("Error fetching PO:", error));
    }
  }, [po_id]);

  // Calculate total amount when details change
  useEffect(() => {
    const total = details.reduce((sum, detail) => sum + (parseFloat(detail.total_price) || 0), 0);
    setHeader((prev) => ({ ...prev, total_amount: total }));
  }, [details]);

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleSupplierChange = (event, newValue) => {
    setHeader((prev) => ({ ...prev, supplier_id: newValue?.supplier_id || "" }));
  };

  const handleAddDetail = () => {
    setDetails([
      ...details,
      {
        item_id: "",
        quantity: 1,
        unit_price: 0,
        total_price: 0,
        notes: "",
      },
    ]);
  };

  const handleDetailChange = (index, field, value) => {
    const newDetails = [...details];
    newDetails[index][field] = value;

    // Auto-calculate total_price
    if (field === "quantity" || field === "unit_price") {
      const qty = parseFloat(newDetails[index].quantity) || 0;
      const price = parseFloat(newDetails[index].unit_price) || 0;
      newDetails[index].total_price = qty * price;
    }

    setDetails(newDetails);
  };

  const handleItemSelect = (index, newValue) => {
    const newDetails = [...details];
    newDetails[index].item_id = newValue?.item_id || "";
    newDetails[index].item_name = newValue?.name || "";
    // Optionally set default price from item
    if (newValue?.unit_cost) {
      newDetails[index].unit_price = newValue.unit_cost;
      const qty = parseFloat(newDetails[index].quantity) || 0;
      newDetails[index].total_price = qty * newValue.unit_cost;
    }
    setDetails(newDetails);
  };

  const handleRemoveDetail = (index) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  const handleOpenReceiveDialog = (detail, index) => {
    setSelectedDetail({ ...detail, index });
    const remainingQty = (detail.quantity || 0) - (detail.received_quantity || 0);
    setReceiveQuantity(remainingQty > 0 ? remainingQty : 0);
    setReceiveDialogOpen(true);
  };

  const handleCloseReceiveDialog = () => {
    setReceiveDialogOpen(false);
    setSelectedDetail(null);
    setReceiveQuantity(0);
    setReceiveBatchNumber("");
    setReceiveExpiryDate("");
    setReceiveLocation("");
  };

  const handleReceiveItem = async () => {
    if (!selectedDetail || receiveQuantity <= 0) return;

    try {
      const receiveData = {
        received_quantity: receiveQuantity,
        received_date: new Date().toISOString().split("T")[0],
        received_by: 1, // Replace with actual user ID
        batch_number: receiveBatchNumber || null,
        expiry_date: receiveExpiryDate || null,
        location: receiveLocation || null,
        notes: `Received ${receiveQuantity} units${
          receiveBatchNumber ? `, Batch: ${receiveBatchNumber}` : ""
        }`,
      };

      await axios.post(
        `http://localhost:5000/purchase-orders/details/${selectedDetail.pod_id}/receive`,
        receiveData
      );

      // Refresh PO data
      if (po_id) {
        const response = await axios.get(`http://localhost:5000/purchase-orders/${po_id}`);
        setDetails(response.data.details || []);
      }

      setSuccessMessage(true);
      handleCloseReceiveDialog();
    } catch (error) {
      console.error("Error receiving item:", error);
      alert("Failed to receive item");
    }
  };

  // Generate PDF for Purchase Order
  const handlePrintPDF = () => {
    const doc = new jsPDF();
    const selectedSupplierData = suppliers.find((s) => s.supplier_id === header.supplier_id);

    // Company Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(companyInfo?.company_name || "Company Name", 14, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    let yPos = 28;
    if (companyInfo?.address_line1) {
      doc.text(companyInfo.address_line1, 14, yPos);
      yPos += 5;
    }
    if (companyInfo?.address_line2) {
      doc.text(companyInfo.address_line2, 14, yPos);
      yPos += 5;
    }
    const cityStateZip = [companyInfo?.city, companyInfo?.state, companyInfo?.postal_code]
      .filter(Boolean)
      .join(", ");
    if (cityStateZip) {
      doc.text(cityStateZip, 14, yPos);
      yPos += 5;
    }
    if (companyInfo?.phone) {
      doc.text(`Phone: ${companyInfo.phone}`, 14, yPos);
      yPos += 5;
    }
    if (companyInfo?.email) {
      doc.text(`Email: ${companyInfo.email}`, 14, yPos);
    }

    // PO Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("PURCHASE ORDER", 140, 20);

    // PO Info Box
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`PO Number: ${header.po_number || "N/A"}`, 140, 30);
    doc.text(`Date: ${header.order_date || "N/A"}`, 140, 36);
    doc.text(`Expected Delivery: ${header.expected_delivery || "N/A"}`, 140, 42);
    doc.text(`Status: ${header.status || "Pending"}`, 140, 48);

    // Supplier Info
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("SUPPLIER:", 14, 60);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(selectedSupplierData?.company_name || "N/A", 14, 67);
    if (selectedSupplierData?.address) {
      doc.text(selectedSupplierData.address, 14, 73);
    }
    if (selectedSupplierData?.contact_name) {
      doc.text(`Contact: ${selectedSupplierData.contact_name}`, 14, 79);
    }
    if (selectedSupplierData?.contact_phone) {
      doc.text(`Phone: ${selectedSupplierData.contact_phone}`, 14, 85);
    }
    if (selectedSupplierData?.contact_email) {
      doc.text(`Email: ${selectedSupplierData.contact_email}`, 14, 91);
    }

    // Items Table
    const tableColumn = ["#", "Item", "Quantity", "Unit Price", "Total"];
    const tableRows = details.map((detail, index) => [
      index + 1,
      detail.item_name || items.find((i) => i.item_id === detail.item_id)?.name || "N/A",
      detail.quantity || 0,
      `$${parseFloat(detail.unit_price || 0).toFixed(2)}`,
      `$${parseFloat(detail.total_price || 0).toFixed(2)}`,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 100,
      theme: "grid",
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 10,
      },
      columnStyles: {
        0: { cellWidth: 15, halign: "center" },
        1: { cellWidth: 80 },
        2: { cellWidth: 25, halign: "center" },
        3: { cellWidth: 30, halign: "right" },
        4: { cellWidth: 30, halign: "right" },
      },
    });

    // Total Amount
    const finalY = doc.lastAutoTable?.finalY || 100;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Amount: $${parseFloat(header.total_amount || 0).toFixed(2)}`, 140, finalY + 15);

    // Notes
    if (header.notes) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Notes:", 14, finalY + 25);
      doc.setFont("helvetica", "normal");
      doc.text(header.notes, 14, finalY + 32, { maxWidth: 180 });
    }

    // Footer
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text(`Generated on ${new Date().toLocaleString()}`, 14, doc.internal.pageSize.height - 10);

    // Save PDF
    doc.save(`PO_${header.po_number || "draft"}.pdf`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let newErrors = {};
    if (!header.supplier_id) newErrors.supplier_id = "Supplier is required";
    if (!header.po_number) newErrors.po_number = "PO Number is required";
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
        total_price: d.total_price,
        notes: d.notes,
      })),
    };

    try {
      // Use purchaseOrderId from database response, fallback to po_id from URL
      const updateId = purchaseOrderId || po_id;

      if (updateId && updateId !== "undefined") {
        // Update header
        await axios.put(`http://localhost:5000/purchase-orders/${updateId}`, header);

        // Update details
        for (const detail of details) {
          if (detail.pod_id) {
            // Update existing detail
            await axios.put(`http://localhost:5000/purchase-orders/details/${detail.pod_id}`, {
              item_id: detail.item_id,
              quantity: detail.quantity,
              unit_price: detail.unit_price,
              notes: detail.notes,
            });
          } else {
            // Add new detail
            await axios.post(`http://localhost:5000/purchase-orders/${updateId}/details`, {
              item_id: detail.item_id,
              quantity: detail.quantity,
              unit_price: detail.unit_price,
              notes: detail.notes,
            });
          }
        }
      } else {
        await axios.post("http://localhost:5000/purchase-orders", payload);
      }

      setSuccessMessage(true);
      setTimeout(() => {
        navigate("/purchaseorders");
      }, 2000);
    } catch (error) {
      console.error("Error saving PO:", error);
      alert("Failed to save Purchase Order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedSupplier = suppliers.find((s) => s.supplier_id === header.supplier_id) || null;

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
          {po_id ? "Edit Purchase Order" : "New Purchase Order"}
        </MDTypography>
      </MDBox>
      <MDBox p={3} component="form" onSubmit={handleSubmit}>
        {/* Header Section */}
        <MDTypography variant="h5" fontWeight="bold" color="info" mt={2} mb={1}>
          PO Header Information
        </MDTypography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={suppliers}
              getOptionLabel={(option) => option.company_name || ""}
              value={selectedSupplier}
              onChange={handleSupplierChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Supplier *"
                  error={Boolean(errors.supplier_id)}
                  helperText={errors.supplier_id}
                />
              )}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDInput
              type="text"
              label="PO Number"
              name="po_number"
              value={header.po_number || ""}
              onChange={handleHeaderChange}
              fullWidth
              required
              error={Boolean(errors.po_number)}
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
              label="Expected Delivery"
              name="expected_delivery"
              value={header.expected_delivery || ""}
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
              value={header.status || "Pending"}
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
          PO Details (Items)
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
                  Received
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Unit Price
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Total
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
                      color={detail.received_quantity > 0 ? "success" : "text"}
                    >
                      {detail.received_quantity || 0} / {detail.quantity || 0}
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
                    ${parseFloat(detail.total_price || 0).toFixed(2)}
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
                      {po_id && detail.pod_id && (
                        <IconButton
                          color="success"
                          onClick={() => handleOpenReceiveDialog(detail, index)}
                          disabled={(detail.received_quantity || 0) >= (detail.quantity || 0)}
                          title="Receive Item"
                        >
                          <CheckCircleIcon />
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

        {/* Total Amount and Print Button */}
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDTypography variant="h6">
            Total Amount: ${parseFloat(header.total_amount || 0).toFixed(2)}
          </MDTypography>
          {po_id && (
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={handlePrintPDF}
              sx={{
                color: "#ffffff",
                backgroundColor: "#1976d2",
                "&:hover": { backgroundColor: "#1565c0" },
              }}
            >
              Print PO
            </Button>
          )}
        </MDBox>

        {/* Save Button */}
        <Stack direction="row" spacing={2} mt={3}>
          <Button
            type="submit"
            variant="contained"
            sx={{ color: "#ffffff", backgroundColor: "green" }}
            disabled={isLoading}
          >
            {po_id ? "Update" : "Save"}
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/purchaseorders")}
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
            Purchase Order saved successfully!
          </Alert>
        </Snackbar>

        {/* Receive Item Dialog */}
        <Dialog open={receiveDialogOpen} onClose={handleCloseReceiveDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Receive Item</DialogTitle>
          <DialogContent>
            <MDBox pt={2}>
              <MDTypography variant="body2" mb={2}>
                Item: <strong>{selectedDetail?.item_name || "N/A"}</strong>
              </MDTypography>
              <MDTypography variant="body2" mb={2}>
                Ordered Quantity: <strong>{selectedDetail?.quantity || 0}</strong>
              </MDTypography>
              <MDTypography variant="body2" mb={2}>
                Already Received: <strong>{selectedDetail?.received_quantity || 0}</strong>
              </MDTypography>
              <MDTypography variant="body2" mb={2}>
                Remaining:{" "}
                <strong>
                  {(selectedDetail?.quantity || 0) - (selectedDetail?.received_quantity || 0)}
                </strong>
              </MDTypography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    type="number"
                    label="Quantity to Receive *"
                    value={receiveQuantity}
                    onChange={(e) => setReceiveQuantity(parseInt(e.target.value) || 0)}
                    fullWidth
                    inputProps={{
                      min: 1,
                      max:
                        (selectedDetail?.quantity || 0) - (selectedDetail?.received_quantity || 0),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    type="text"
                    label="Batch Number"
                    value={receiveBatchNumber}
                    onChange={(e) => setReceiveBatchNumber(e.target.value)}
                    fullWidth
                    placeholder="e.g., BATCH-2026-001"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    type="date"
                    label="Expiry Date"
                    value={receiveExpiryDate}
                    onChange={(e) => setReceiveExpiryDate(e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    type="text"
                    label="Location"
                    value={receiveLocation}
                    onChange={(e) => setReceiveLocation(e.target.value)}
                    fullWidth
                    placeholder="e.g., Warehouse A - Shelf B3"
                  />
                </Grid>
              </Grid>
            </MDBox>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseReceiveDialog} color="secondary">
              Cancel
            </Button>
            <Button
              onClick={handleReceiveItem}
              variant="contained"
              color="success"
              disabled={receiveQuantity <= 0}
            >
              Receive
            </Button>
          </DialogActions>
        </Dialog>
      </MDBox>
    </Card>
  );
}

export default PurchaseOrderForm;
