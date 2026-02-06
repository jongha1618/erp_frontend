/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
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
import axios from "axios";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

const transactionTypes = [
  { value: "purchase", label: "Purchase" },
  { value: "sale", label: "Sale" },
  { value: "adjustment", label: "Adjustment" },
];

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
        created_by: null, // TODO: Get current user ID
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

function Inventory() {
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);

  const fetchData = () => {
    setLoading(true);
    axios
      .get("http://localhost:5000/inventories")
      .then((response) => {
        setData(response.data);
        console.log("Inventory data fetched successfully:", response.data);
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

  const columns = [
    { Header: "Item Code", accessor: "item_code", align: "left" },
    { Header: "Item Name", accessor: "item_name", align: "left" },
    { Header: "Batch #", accessor: "batch_number", align: "left" },
    { Header: "Quantity", accessor: "quantity", align: "center" },
    { Header: "Reserved", accessor: "reserved", align: "center" },
    { Header: "Available", accessor: "available", align: "center" },
    { Header: "Location", accessor: "location", align: "left" },
    { Header: "Received", accessor: "received_date", align: "center" },
    { Header: "Expiry Date", accessor: "expiry_date", align: "center" },
    { Header: "Action", accessor: "action", align: "center" },
  ];

  const rows = data.map((item) => {
    const reservedQty = item.reservation_qty || 0;
    const availableQty =
      item.available_qty !== undefined ? item.available_qty : item.quantity - reservedQty;

    return {
      key: item.inventory_id,
      item_code: (
        <MDTypography variant="caption" color="text" fontWeight="bold">
          {item.item_code}
        </MDTypography>
      ),
      item_name: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {item.item_name}
        </MDTypography>
      ),
      batch_number: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {item.batch_number || "-"}
        </MDTypography>
      ),
      quantity: (
        <MDBox ml={-1}>
          <MDBadge
            badgeContent={item.quantity !== null ? String(item.quantity) : "0"}
            color="info"
            variant="gradient"
            size="sm"
          />
        </MDBox>
      ),
      reserved: (
        <MDBox ml={-1}>
          <MDBadge
            badgeContent={String(reservedQty)}
            color={reservedQty > 0 ? "warning" : "secondary"}
            variant="gradient"
            size="sm"
          />
        </MDBox>
      ),
      available: (
        <MDBox ml={-1}>
          <MDBadge
            badgeContent={String(availableQty)}
            color={availableQty > 0 ? "success" : "error"}
            variant="gradient"
            size="sm"
          />
        </MDBox>
      ),
      location: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {item.location || "-"}
        </MDTypography>
      ),
      received_date: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {item.created_at ? new Date(item.created_at).toLocaleDateString("ko-KR") : "-"}
        </MDTypography>
      ),
      expiry_date: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString("ko-KR") : "-"}
        </MDTypography>
      ),
      action: (
        <MDBox>
          <MDBadge
            badgeContent="Edit"
            color="info"
            variant="gradient"
            size="sm"
            onClick={() => handleEditClick(item)}
            sx={{ cursor: "pointer" }}
          />
        </MDBox>
      ),
    };
  });

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
                  Inventory (Grouped by Item Code, FIFO Order)
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                {loading ? (
                  <MDBox p={3} textAlign="center">
                    <MDTypography variant="caption" color="text">
                      Loading...
                    </MDTypography>
                  </MDBox>
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
