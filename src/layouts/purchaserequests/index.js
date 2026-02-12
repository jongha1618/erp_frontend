/* eslint-disable react/prop-types */
import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Icon from "@mui/material/Icon";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Autocomplete from "@mui/material/Autocomplete";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import axios from "axios";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { Link } from "react-router-dom";

import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";

import {
  usePurchaseRequestsTableData,
  useSuppliersData,
  useItemsData,
  getStatusColor,
  getPriorityColor,
  getSourceTypeLabel,
  formatDate,
} from "layouts/purchaserequests/data/purchaseRequestsTableData";

function PurchaseRequests() {
  const { data, loading, refetch } = usePurchaseRequestsTableData();
  const suppliers = useSuppliersData();
  const items = useItemsData();
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [convertForm, setConvertForm] = useState({
    supplier_id: "",
    po_number: "",
    order_date: new Date().toISOString().split("T")[0],
    expected_delivery: "",
    notes: "",
  });

  // Add Request dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    item_id: "",
    quantity_needed: 1,
    priority: "normal",
    notes: "",
  });
  const [selectedItemInventory, setSelectedItemInventory] = useState(null);

  // Filter only pending requests
  const pendingRequests = data.filter((req) => req.status === "pending");

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedRequests(pendingRequests.map((req) => req.request_id));
    } else {
      setSelectedRequests([]);
    }
  };

  const handleSelectOne = (requestId) => {
    setSelectedRequests((prev) => {
      if (prev.includes(requestId)) {
        return prev.filter((id) => id !== requestId);
      } else {
        return [...prev, requestId];
      }
    });
  };

  const handleOpenConvertDialog = () => {
    setConvertForm((prev) => ({ ...prev, po_number: "" }));
    setConvertDialogOpen(true);
  };

  const handleConvertToPO = () => {
    if (!convertForm.supplier_id) {
      alert("Please select a supplier");
      return;
    }
    if (!convertForm.po_number.trim()) {
      alert("Please enter a PO Number");
      return;
    }

    axios
      .post("http://localhost:5000/purchase-requests/convert-to-po", {
        request_ids: selectedRequests,
        po_data: convertForm,
      })
      .then((response) => {
        alert(
          `Purchase Order created successfully!\nPO Number: ${response.data.po_number}\nPO ID: ${response.data.purchaseorder_id}`
        );
        setConvertDialogOpen(false);
        setSelectedRequests([]);
        refetch();
      })
      .catch((error) => {
        console.error("Error converting to PO:", error);
        alert("Failed to convert to Purchase Order");
      });
  };

  const handleCancelRequest = (requestId) => {
    if (window.confirm("Are you sure you want to cancel this request?")) {
      axios
        .patch(`http://localhost:5000/purchase-requests/${requestId}/status`, {
          status: "cancelled",
        })
        .then(() => {
          refetch();
        })
        .catch((error) => {
          console.error("Error cancelling request:", error);
          alert("Failed to cancel request");
        });
    }
  };

  const handleDeleteRequest = (requestId) => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      axios
        .delete(`http://localhost:5000/purchase-requests/${requestId}`)
        .then(() => {
          refetch();
        })
        .catch((error) => {
          console.error("Error deleting request:", error);
          alert("Failed to delete request");
        });
    }
  };

  // Add Request handlers
  const handleOpenAddDialog = () => {
    setAddForm({
      item_id: "",
      quantity_needed: 1,
      priority: "normal",
      notes: "",
    });
    setSelectedItemInventory(null);
    setAddDialogOpen(true);
  };

  const fetchItemInventory = async (itemId) => {
    if (!itemId) {
      setSelectedItemInventory(null);
      return;
    }
    try {
      const response = await axios.get(`http://localhost:5000/kit-items/inventory/${itemId}`);
      const inventoryList = response.data || [];
      // Calculate totals from inventory list
      const totalQuantity = inventoryList.reduce((sum, inv) => sum + (inv.quantity || 0), 0);
      const reservedQuantity = inventoryList.reduce((sum, inv) => sum + (inv.reserved_qty || 0), 0);
      const availableQuantity = inventoryList.reduce(
        (sum, inv) => sum + (inv.available_qty || 0),
        0
      );
      setSelectedItemInventory({
        total_quantity: totalQuantity,
        reserved_quantity: reservedQuantity,
        available_quantity: availableQuantity,
      });
    } catch (error) {
      console.error("Error fetching inventory:", error);
      setSelectedItemInventory({ total_quantity: 0, reserved_quantity: 0, available_quantity: 0 });
    }
  };

  const handleAddRequest = () => {
    if (!addForm.item_id) {
      alert("Please select an item");
      return;
    }
    if (addForm.quantity_needed <= 0) {
      alert("Quantity must be greater than 0");
      return;
    }

    axios
      .post("http://localhost:5000/purchase-requests", {
        item_id: addForm.item_id,
        quantity_needed: addForm.quantity_needed,
        source_type: "manual",
        priority: addForm.priority,
        notes: addForm.notes,
      })
      .then(() => {
        alert("Purchase Request added successfully!");
        setAddDialogOpen(false);
        refetch();
      })
      .catch((error) => {
        console.error("Error adding request:", error);
        alert("Failed to add purchase request");
      });
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <br />
      <Stack spacing={1} direction="row" alignItems="center">
        <Button
          variant="contained"
          startIcon={<Icon>add</Icon>}
          onClick={handleOpenAddDialog}
          sx={{
            color: "#ffffff",
            backgroundColor: "#1976d2",
            "&:hover": { backgroundColor: "#1565c0" },
          }}
        >
          Add Request
        </Button>
        <Button
          variant="contained"
          startIcon={<Icon>transform</Icon>}
          disabled={selectedRequests.length === 0}
          onClick={handleOpenConvertDialog}
          sx={{
            color: "#ffffff",
            backgroundColor: "green",
            "&:hover": { backgroundColor: "darkgreen" },
            "&:disabled": { backgroundColor: "#ccc", color: "#666" },
          }}
        >
          Convert to PO ({selectedRequests.length})
        </Button>
        <Button variant="outlined" onClick={refetch} startIcon={<Icon>refresh</Icon>}>
          Refresh
        </Button>
      </Stack>
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
                bgColor="warning"
                borderRadius="lg"
                coloredShadow="warning"
              >
                <MDTypography variant="h6" color="white">
                  Purchase Requests (PO Requests)
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                <TableContainer sx={{ width: "100%", overflowX: "auto", boxShadow: "none" }}>
                  <Table sx={{ tableLayout: "fixed", width: "100%" }}>
                    <colgroup>
                      <col style={{ width: "40px" }} />
                      <col style={{ width: "12%" }} />
                      <col style={{ width: "20%" }} />
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "18%" }} />
                    </colgroup>
                    <TableHead sx={{ display: "table-header-group" }}>
                      <TableRow sx={{ display: "table-row" }}>
                        <TableCell sx={{ padding: "8px" }}>
                          <Checkbox
                            checked={
                              pendingRequests.length > 0 &&
                              selectedRequests.length === pendingRequests.length
                            }
                            indeterminate={
                              selectedRequests.length > 0 &&
                              selectedRequests.length < pendingRequests.length
                            }
                            onChange={handleSelectAll}
                          />
                        </TableCell>
                        <TableCell>
                          <MDTypography variant="caption" fontWeight="bold" color="secondary">
                            ITEM CODE
                          </MDTypography>
                        </TableCell>
                        <TableCell>
                          <MDTypography variant="caption" fontWeight="bold" color="secondary">
                            ITEM NAME
                          </MDTypography>
                        </TableCell>
                        <TableCell align="center">
                          <MDTypography variant="caption" fontWeight="bold" color="secondary">
                            QTY NEEDED
                          </MDTypography>
                        </TableCell>
                        <TableCell align="center">
                          <MDTypography variant="caption" fontWeight="bold" color="secondary">
                            SOURCE
                          </MDTypography>
                        </TableCell>
                        <TableCell align="center">
                          <MDTypography variant="caption" fontWeight="bold" color="secondary">
                            PRIORITY
                          </MDTypography>
                        </TableCell>
                        <TableCell align="center">
                          <MDTypography variant="caption" fontWeight="bold" color="secondary">
                            STATUS
                          </MDTypography>
                        </TableCell>
                        <TableCell align="center">
                          <MDTypography variant="caption" fontWeight="bold" color="secondary">
                            CREATED
                          </MDTypography>
                        </TableCell>
                        <TableCell align="center">
                          <MDTypography variant="caption" fontWeight="bold" color="secondary">
                            ACTION
                          </MDTypography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody sx={{ display: "table-row-group" }}>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={9} align="center">
                            <MDTypography variant="caption" color="text">
                              Loading...
                            </MDTypography>
                          </TableCell>
                        </TableRow>
                      ) : data.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} align="center">
                            <MDTypography variant="caption" color="text">
                              No purchase requests found
                            </MDTypography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        data.map((req) => (
                          <TableRow
                            key={req.request_id}
                            sx={{
                              "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                              opacity: req.status === "cancelled" ? 0.5 : 1,
                            }}
                          >
                            <TableCell sx={{ padding: "8px" }}>
                              <Checkbox
                                checked={selectedRequests.includes(req.request_id)}
                                onChange={() => handleSelectOne(req.request_id)}
                                disabled={req.status !== "pending"}
                              />
                            </TableCell>
                            <TableCell>
                              <MDTypography variant="caption" color="text" fontWeight="medium">
                                {req.item_code || "-"}
                              </MDTypography>
                            </TableCell>
                            <TableCell>
                              <Tooltip title={req.notes || ""} arrow>
                                <MDTypography variant="caption" color="text" fontWeight="medium">
                                  {req.item_name || "-"}
                                </MDTypography>
                              </Tooltip>
                            </TableCell>
                            <TableCell align="center">
                              <MDTypography variant="caption" color="error" fontWeight="bold">
                                {req.quantity_needed}
                              </MDTypography>
                            </TableCell>
                            <TableCell align="center">
                              {req.source_type === "kit_reserve" ? (
                                <Link
                                  to={`/kititems/newkititem/${req.source_id}`}
                                  style={{ textDecoration: "none" }}
                                >
                                  <MDBadge
                                    badgeContent={getSourceTypeLabel(req.source_type)}
                                    color="dark"
                                    variant="gradient"
                                    size="sm"
                                  />
                                </Link>
                              ) : (
                                <MDBadge
                                  badgeContent={getSourceTypeLabel(req.source_type)}
                                  color="secondary"
                                  variant="gradient"
                                  size="sm"
                                />
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <MDBadge
                                badgeContent={req.priority || "normal"}
                                color={getPriorityColor(req.priority)}
                                variant="gradient"
                                size="sm"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <MDBadge
                                badgeContent={req.status || "pending"}
                                color={getStatusColor(req.status)}
                                variant="gradient"
                                size="sm"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <MDTypography variant="caption" color="text">
                                {formatDate(req.created_at)}
                              </MDTypography>
                            </TableCell>
                            <TableCell align="center">
                              <Stack direction="row" spacing={1} justifyContent="center">
                                {req.status === "pending" && (
                                  <Tooltip title="Cancel Request">
                                    <Button
                                      size="small"
                                      color="warning"
                                      onClick={() => handleCancelRequest(req.request_id)}
                                    >
                                      <Icon>block</Icon>
                                    </Button>
                                  </Tooltip>
                                )}
                                {req.status === "converted_to_po" && req.converted_po_id && (
                                  <Tooltip title="View PO">
                                    <Link
                                      to={`/purchaseorders/newpurchaseorder/${req.converted_po_id}`}
                                    >
                                      <Button size="small" color="success">
                                        <Icon>visibility</Icon>
                                      </Button>
                                    </Link>
                                  </Tooltip>
                                )}
                                {(req.status === "cancelled" ||
                                  req.status === "converted_to_po") && (
                                  <Tooltip title="Delete">
                                    <Button
                                      size="small"
                                      color="error"
                                      onClick={() => handleDeleteRequest(req.request_id)}
                                    >
                                      <Icon>delete</Icon>
                                    </Button>
                                  </Tooltip>
                                )}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Convert to PO Dialog */}
      <Dialog
        open={convertDialogOpen}
        onClose={() => setConvertDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Convert to Purchase Order</DialogTitle>
        <DialogContent>
          <MDBox mt={2}>
            <MDTypography variant="body2" color="text" mb={2}>
              Selected {selectedRequests.length} request(s) will be converted to a Purchase Order.
            </MDTypography>
            <Stack spacing={2}>
              <Autocomplete
                options={suppliers}
                getOptionLabel={(option) => option.company_name || ""}
                value={suppliers.find((s) => s.supplier_id === convertForm.supplier_id) || null}
                onChange={(event, newValue) => {
                  setConvertForm((prev) => ({
                    ...prev,
                    supplier_id: newValue ? newValue.supplier_id : "",
                  }));
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Supplier *" variant="outlined" size="small" />
                )}
              />
              <TextField
                label="PO Number *"
                value={convertForm.po_number}
                onChange={(e) => setConvertForm((prev) => ({ ...prev, po_number: e.target.value }))}
                size="small"
                fullWidth
                required
              />
              <TextField
                label="Order Date"
                type="date"
                value={convertForm.order_date}
                onChange={(e) =>
                  setConvertForm((prev) => ({ ...prev, order_date: e.target.value }))
                }
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Expected Delivery"
                type="date"
                value={convertForm.expected_delivery}
                onChange={(e) =>
                  setConvertForm((prev) => ({ ...prev, expected_delivery: e.target.value }))
                }
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Notes"
                value={convertForm.notes}
                onChange={(e) => setConvertForm((prev) => ({ ...prev, notes: e.target.value }))}
                size="small"
                fullWidth
                multiline
                rows={2}
              />
            </Stack>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConvertDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConvertToPO} variant="contained" color="primary">
            Create Purchase Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Request Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Purchase Request</DialogTitle>
        <DialogContent>
          <MDBox mt={2}>
            <Stack spacing={2}>
              <Autocomplete
                options={items}
                getOptionLabel={(option) =>
                  option.item_code ? `${option.item_code} - ${option.name}` : ""
                }
                value={items.find((i) => i.item_id === addForm.item_id) || null}
                onChange={(event, newValue) => {
                  setAddForm((prev) => ({
                    ...prev,
                    item_id: newValue ? newValue.item_id : "",
                  }));
                  fetchItemInventory(newValue?.item_id);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Item *" variant="outlined" size="small" />
                )}
              />
              {selectedItemInventory && (
                <MDBox
                  sx={{
                    backgroundColor: "#dddee7ff",
                    borderRadius: 1,
                    p: 1.5,
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <Stack direction="row" spacing={3}>
                    <MDTypography variant="caption" color="text">
                      Current Qty:{" "}
                      <strong style={{ color: "#1976d2" }}>
                        {selectedItemInventory.total_quantity || 0}
                      </strong>
                    </MDTypography>
                    <MDTypography variant="caption" color="text">
                      Reserved:{" "}
                      <strong style={{ color: "#ed6c02" }}>
                        {selectedItemInventory.reserved_quantity || 0}
                      </strong>
                    </MDTypography>
                    <MDTypography variant="caption" color="text">
                      Available:{" "}
                      <strong style={{ color: "#2e7d32" }}>
                        {selectedItemInventory.available_quantity || 0}
                      </strong>
                    </MDTypography>
                  </Stack>
                </MDBox>
              )}
              <TextField
                label="Quantity Needed *"
                type="number"
                value={addForm.quantity_needed}
                onChange={(e) =>
                  setAddForm((prev) => ({
                    ...prev,
                    quantity_needed: parseFloat(e.target.value) || 0,
                  }))
                }
                size="small"
                fullWidth
                inputProps={{ min: 1, step: 1 }}
              />
              <FormControl size="small" fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={addForm.priority}
                  label="Priority"
                  onChange={(e) => setAddForm((prev) => ({ ...prev, priority: e.target.value }))}
                >
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Notes"
                value={addForm.notes}
                onChange={(e) => setAddForm((prev) => ({ ...prev, notes: e.target.value }))}
                size="small"
                fullWidth
                multiline
                rows={2}
                placeholder="Reason for request..."
              />
            </Stack>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddRequest} variant="contained" color="primary">
            Add Request
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default PurchaseRequests;
