/* eslint-disable react/prop-types */
import React, { useState, useEffect, useMemo, Fragment } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Collapse from "@mui/material/Collapse";
import Box from "@mui/material/Box";
import axios from "axios";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

const transactionTypes = [
  { value: "purchase", label: "Purchase" },
  { value: "sale", label: "Sale" },
  { value: "adjustment", label: "Adjustment" },
];

// Group flat inventory records by item
function groupInventoryByItem(inventoryRecords) {
  const groupMap = {};
  const groupOrder = [];

  inventoryRecords.forEach((record) => {
    const key = record.item_id;
    if (!groupMap[key]) {
      groupMap[key] = {
        item_id: record.item_id,
        item_code: record.item_code,
        item_name: record.item_name,
        totalQty: 0,
        totalReserved: 0,
        totalAvailable: 0,
        containerCount: 0,
        containers: [],
      };
      groupOrder.push(key);
    }
    const reservedQty = record.reservation_qty || 0;
    const availableQty =
      record.available_qty !== undefined ? record.available_qty : record.quantity - reservedQty;

    groupMap[key].totalQty += record.quantity || 0;
    groupMap[key].totalReserved += reservedQty;
    groupMap[key].totalAvailable += availableQty;
    groupMap[key].containerCount += 1;
    groupMap[key].containers.push(record);
  });

  return groupOrder.map((key) => groupMap[key]);
}

// Edit Inventory Dialog (unchanged)
function EditInventoryDialog({ open, onClose, inventory, users, onSave }) {
  const [formData, setFormData] = useState({
    quantity: 0,
    location: "",
    batch_number: "",
    expiry_date: "",
    transaction_type: "adjustment",
    notes: "",
    assigned_to: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (inventory) {
      setFormData({
        quantity: inventory.quantity || 0,
        location: inventory.location || "",
        batch_number: inventory.batch_number || "",
        expiry_date: inventory.expiry_date
          ? new Date(inventory.expiry_date).toISOString().split("T")[0]
          : "",
        transaction_type: "adjustment",
        notes: "",
        assigned_to: inventory.assigned_to || "",
      });
    }
  }, [inventory]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.transaction_type) {
      alert("Please select a transaction type");
      return;
    }
    if (!formData.notes) {
      alert("Please enter a reason/notes for this adjustment");
      return;
    }

    setLoading(true);
    try {
      await axios.put(`http://localhost:5000/inventories/${inventory.inventory_id}`, {
        ...formData,
        created_by: null,
      });
      onSave();
      onClose();
    } catch (error) {
      console.error("Error updating inventory:", error);
      alert("Failed to update inventory");
    } finally {
      setLoading(false);
    }
  };

  if (!inventory) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <MDBox display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="h6">Edit Inventory</MDTypography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </MDBox>
      </DialogTitle>
      <DialogContent dividers>
        <MDBox mb={2}>
          <MDTypography variant="caption" color="text" fontWeight="bold">
            Item: {inventory.item_code} - {inventory.item_name}
          </MDTypography>
        </MDBox>
        <MDBox mb={2}>
          <MDTypography variant="caption" color="text">
            Current Quantity: {inventory.quantity}
          </MDTypography>
        </MDBox>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="New Quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              margin="dense"
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              select
              label="Transaction Type"
              name="transaction_type"
              value={formData.transaction_type}
              onChange={handleChange}
              margin="dense"
              required
            >
              {transactionTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              margin="dense"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Batch Number"
              name="batch_number"
              value={formData.batch_number}
              onChange={handleChange}
              margin="dense"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Expiry Date"
              name="expiry_date"
              type="date"
              value={formData.expiry_date}
              onChange={handleChange}
              margin="dense"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Assign To"
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
              margin="dense"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {users.map((user) => (
                <MenuItem key={user.user_id} value={user.user_id}>
                  {user.full_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Reason / Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              margin="dense"
              required
              placeholder="Please provide a reason for this adjustment..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Expandable inventory item row
function InventoryItemRow({ group, onEditClick }) {
  const [open, setOpen] = useState(false);

  return (
    <Fragment>
      {/* Summary Row */}
      <TableRow
        onClick={() => setOpen(!open)}
        sx={{
          cursor: "pointer",
          "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
        }}
      >
        <TableCell sx={{ padding: "8px", width: "30px" }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <MDTypography variant="caption" color="text" fontWeight="bold">
            {group.item_code}
          </MDTypography>
        </TableCell>
        <TableCell>
          <MDTypography variant="caption" color="text" fontWeight="medium">
            {group.item_name}
          </MDTypography>
        </TableCell>
        <TableCell align="center">
          <MDBadge
            badgeContent={String(group.totalQty)}
            color="info"
            variant="gradient"
            size="sm"
          />
        </TableCell>
        <TableCell align="center">
          <MDBadge
            badgeContent={String(group.totalReserved)}
            color={group.totalReserved > 0 ? "warning" : "secondary"}
            variant="gradient"
            size="sm"
          />
        </TableCell>
        <TableCell align="center">
          <MDBadge
            badgeContent={String(group.totalAvailable)}
            color={group.totalAvailable > 0 ? "success" : "error"}
            variant="gradient"
            size="sm"
          />
        </TableCell>
        <TableCell align="center">
          <MDBadge
            badgeContent={`${group.containerCount}`}
            color="dark"
            variant="gradient"
            size="sm"
          />
        </TableCell>
      </TableRow>

      {/* Collapse Row - Container Details */}
      <TableRow>
        <TableCell colSpan={7} style={{ paddingBottom: 0, paddingTop: 0 }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, backgroundColor: "#dddee7ff", borderRadius: 2, p: 2 }}>
              <Table size="small">
                <TableHead sx={{ display: "table-header-group" }}>
                  <TableRow sx={{ display: "table-row" }}>
                    <TableCell>
                      <MDTypography variant="caption" fontWeight="bold" color="secondary">
                        BATCH #
                      </MDTypography>
                    </TableCell>
                    <TableCell>
                      <MDTypography variant="caption" fontWeight="bold" color="secondary">
                        LOCATION
                      </MDTypography>
                    </TableCell>
                    <TableCell align="center">
                      <MDTypography variant="caption" fontWeight="bold" color="secondary">
                        RECEIVED
                      </MDTypography>
                    </TableCell>
                    <TableCell align="center">
                      <MDTypography variant="caption" fontWeight="bold" color="secondary">
                        EXPIRY
                      </MDTypography>
                    </TableCell>
                    <TableCell align="center">
                      <MDTypography variant="caption" fontWeight="bold" color="secondary">
                        QTY
                      </MDTypography>
                    </TableCell>
                    <TableCell align="center">
                      <MDTypography variant="caption" fontWeight="bold" color="secondary">
                        RESERVED
                      </MDTypography>
                    </TableCell>
                    <TableCell align="center">
                      <MDTypography variant="caption" fontWeight="bold" color="secondary">
                        AVAILABLE
                      </MDTypography>
                    </TableCell>
                    <TableCell align="center">
                      <MDTypography variant="caption" fontWeight="bold" color="secondary">
                        ACTION
                      </MDTypography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {group.containers.map((container) => {
                    const reservedQty = container.reservation_qty || 0;
                    const availableQty =
                      container.available_qty !== undefined
                        ? container.available_qty
                        : container.quantity - reservedQty;

                    return (
                      <TableRow key={container.inventory_id}>
                        <TableCell>
                          <MDTypography variant="caption" color="text" fontWeight="medium">
                            {container.batch_number || "-"}
                          </MDTypography>
                        </TableCell>
                        <TableCell>
                          <MDTypography variant="caption" color="text" fontWeight="medium">
                            {container.location || "-"}
                          </MDTypography>
                        </TableCell>
                        <TableCell align="center">
                          <MDTypography variant="caption" color="text" fontWeight="medium">
                            {container.created_at
                              ? new Date(container.created_at).toLocaleDateString("ko-KR")
                              : "-"}
                          </MDTypography>
                        </TableCell>
                        <TableCell align="center">
                          <MDTypography variant="caption" color="text" fontWeight="medium">
                            {container.expiry_date
                              ? new Date(container.expiry_date).toLocaleDateString("ko-KR")
                              : "-"}
                          </MDTypography>
                        </TableCell>
                        <TableCell align="center">
                          <MDBadge
                            badgeContent={String(container.quantity ?? 0)}
                            color="info"
                            variant="gradient"
                            size="sm"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <MDBadge
                            badgeContent={String(reservedQty)}
                            color={reservedQty > 0 ? "warning" : "secondary"}
                            variant="gradient"
                            size="sm"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <MDBadge
                            badgeContent={String(availableQty)}
                            color={availableQty > 0 ? "success" : "error"}
                            variant="gradient"
                            size="sm"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <MDBadge
                            badgeContent="Edit"
                            color="info"
                            variant="gradient"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditClick(container);
                            }}
                            sx={{ cursor: "pointer" }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
}

function Inventory() {
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);

  const groupedData = useMemo(() => groupInventoryByItem(data), [data]);

  const fetchData = () => {
    setLoading(true);
    axios
      .get("http://localhost:5000/inventories")
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching inventory data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchUsers = () => {
    axios
      .get("http://localhost:5000/inventories/users")
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  };

  useEffect(() => {
    fetchData();
    fetchUsers();
  }, []);

  const handleEditClick = (inventory) => {
    setSelectedInventory(inventory);
    setEditDialogOpen(true);
  };

  const handleDialogClose = () => {
    setEditDialogOpen(false);
    setSelectedInventory(null);
  };

  const handleSave = () => {
    fetchData();
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
              >
                <MDTypography variant="h6" color="white">
                  Inventory (Grouped by Item)
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                {loading ? (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="caption" color="text">
                      Loading...
                    </MDTypography>
                  </MDBox>
                ) : groupedData.length === 0 ? (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="caption" color="text">
                      No inventory found
                    </MDTypography>
                  </MDBox>
                ) : (
                  <TableContainer sx={{ width: "100%", overflowX: "auto", boxShadow: "none" }}>
                    <Table>
                      <colgroup>
                        <col style={{ width: "30px" }} />
                        <col style={{ width: "15%" }} />
                        <col style={{ width: "25%" }} />
                        <col style={{ width: "13%" }} />
                        <col style={{ width: "13%" }} />
                        <col style={{ width: "13%" }} />
                        <col style={{ width: "11%" }} />
                      </colgroup>
                      <TableHead sx={{ display: "table-header-group" }}>
                        <TableRow sx={{ display: "table-row" }}>
                          <TableCell />
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
                              TOTAL QTY
                            </MDTypography>
                          </TableCell>
                          <TableCell align="center">
                            <MDTypography variant="caption" fontWeight="bold" color="secondary">
                              RESERVED
                            </MDTypography>
                          </TableCell>
                          <TableCell align="center">
                            <MDTypography variant="caption" fontWeight="bold" color="secondary">
                              AVAILABLE
                            </MDTypography>
                          </TableCell>
                          <TableCell align="center">
                            <MDTypography variant="caption" fontWeight="bold" color="secondary">
                              CONTAINERS
                            </MDTypography>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {groupedData.map((group) => (
                          <InventoryItemRow
                            key={group.item_id}
                            group={group}
                            onEditClick={handleEditClick}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      <EditInventoryDialog
        open={editDialogOpen}
        onClose={handleDialogClose}
        inventory={selectedInventory}
        users={users}
        onSave={handleSave}
      />
    </DashboardLayout>
  );
}

export default Inventory;
