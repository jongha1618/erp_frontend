import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import LockResetIcon from "@mui/icons-material/LockReset";
import BlockIcon from "@mui/icons-material/Block";

// MD components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

import { useAuth } from "context/AuthContext";

const API_BASE = "http://localhost:5000";

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "inventory_manager", label: "Inventory Manager" },
  { value: "inventory_clerk", label: "Inventory Clerk" },
  { value: "production_tech", label: "Production Tech" },
  { value: "engineer", label: "Engineer" },
];

const ROLE_COLORS = {
  admin: "error",
  inventory_manager: "primary",
  inventory_clerk: "info",
  production_tech: "warning",
  engineer: "success",
};

const emptyForm = { first_name: "", last_name: "", username: "", email: "", role: "inventory_clerk", password: "" };

function Users() {
  const { authFetch, user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create / Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null = create mode
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Reset password dialog
  const [pwDialogOpen, setPwDialogOpen] = useState(false);
  const [pwUserId, setPwUserId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    authFetch(`${API_BASE}/users`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
        else setError(data.error || "Failed to load users");
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, [authFetch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ── Create / Edit ──────────────────────────────────────────
  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setFormError("");
    setDialogOpen(true);
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setForm({ first_name: u.first_name || "", last_name: u.last_name || "", username: u.username, email: u.email || "", role: u.role, password: "" });
    setFormError("");
    setDialogOpen(true);
  };

  const handleFormSubmit = async () => {
    setFormError("");
    setFormLoading(true);
    try {
      let res;
      if (editingUser) {
        res = await authFetch(`${API_BASE}/users/${editingUser.user_id}`, {
          method: "PUT",
          body: JSON.stringify({ first_name: form.first_name, last_name: form.last_name, username: form.username, email: form.email, role: form.role, active: editingUser.active }),
        });
      } else {
        res = await authFetch(`${API_BASE}/users`, {
          method: "POST",
          body: JSON.stringify(form),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setDialogOpen(false);
      fetchUsers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // ── Deactivate ─────────────────────────────────────────────
  const handleDeactivate = async (userId) => {
    if (!window.confirm("Deactivate this user?")) return;
    const res = await authFetch(`${API_BASE}/users/${userId}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) { alert(data.error); return; }
    fetchUsers();
  };

  // ── Reset password ─────────────────────────────────────────
  const openPwReset = (userId) => {
    setPwUserId(userId);
    setNewPassword("");
    setPwError("");
    setPwDialogOpen(true);
  };

  const handlePwReset = async () => {
    setPwError("");
    setPwLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/users/${pwUserId}/password`, {
        method: "PUT",
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setPwDialogOpen(false);
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwLoading(false);
    }
  };

  // ── Table columns ──────────────────────────────────────────
  const columns = [
    { Header: "Name", accessor: "name", width: "20%" },
    { Header: "Username", accessor: "username", width: "15%" },
    { Header: "Email", accessor: "email", width: "20%" },
    { Header: "Role", accessor: "role", width: "18%" },
    { Header: "Status", accessor: "status", width: "10%" },
    { Header: "Actions", accessor: "actions", width: "17%", sortable: false },
  ];

  const rows = users.map((u) => ({
    name: (
      <MDTypography variant="caption" fontWeight="medium">
        {[u.first_name, u.last_name].filter(Boolean).join(" ") || "-"}
      </MDTypography>
    ),
    username: (
      <MDTypography variant="caption" color="text">
        {u.username}
      </MDTypography>
    ),
    email: (
      <MDTypography variant="caption" color="text">
        {u.email || "-"}
      </MDTypography>
    ),
    role: (
      <Chip
        label={ROLES.find((r) => r.value === u.role)?.label || u.role}
        color={ROLE_COLORS[u.role] || "default"}
        size="small"
        sx={{ fontWeight: "bold", fontSize: "0.7rem" }}
      />
    ),
    status: (
      <Chip
        label={u.active ? "Active" : "Inactive"}
        color={u.active ? "success" : "default"}
        size="small"
        variant="outlined"
        sx={{ fontSize: "0.7rem" }}
      />
    ),
    actions: (
      <Stack direction="row" spacing={0.5}>
        <Tooltip title="Edit">
          <IconButton size="small" color="info" onClick={() => openEdit(u)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Reset Password">
          <IconButton size="small" color="warning" onClick={() => openPwReset(u.user_id)}>
            <LockResetIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {u.user_id !== currentUser?.user_id && u.active === 1 && (
          <Tooltip title="Deactivate">
            <IconButton size="small" color="error" onClick={() => handleDeactivate(u.user_id)}>
              <BlockIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    ),
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <br />
      <Stack direction="row" alignItems="center" mb={1}>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={openCreate}
          sx={{ color: "#fff", backgroundColor: "#1976d2", "&:hover": { backgroundColor: "#1565c0" } }}
        >
          Add User
        </Button>
      </Stack>

      <MDBox pt={4} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2} mt={-3} py={3} px={2}
                variant="gradient" bgColor="info"
                borderRadius="lg" coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  User Management
                </MDTypography>
              </MDBox>
              <MDBox pt={3} pb={2} px={2}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {loading ? (
                  <MDBox display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </MDBox>
                ) : (
                  <DataTable
                    table={{ columns, rows }}
                    isSorted
                    entriesPerPage
                    showTotalEntries
                    noEndBorder
                  />
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Stack spacing={2} mt={1}>
            <Stack direction="row" spacing={2}>
              <TextField label="First Name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} fullWidth size="small" />
              <TextField label="Last Name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} fullWidth size="small" />
            </Stack>
            <TextField label="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} fullWidth size="small" required />
            <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} fullWidth size="small" />
            <TextField label="Role" select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} fullWidth size="small">
              {ROLES.map((r) => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
            </TextField>
            {!editingUser && (
              <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} fullWidth size="small" required helperText="Min 6 characters" />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleFormSubmit} disabled={formLoading} sx={{ color: "#fff" }}>
            {formLoading ? <CircularProgress size={18} color="inherit" /> : editingUser ? "Save" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Reset Password Dialog ── */}
      <Dialog open={pwDialogOpen} onClose={() => setPwDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          {pwError && <Alert severity="error" sx={{ mb: 2 }}>{pwError}</Alert>}
          <TextField
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            size="small"
            helperText="Min 6 characters"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPwDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handlePwReset} disabled={pwLoading} sx={{ color: "#fff" }}>
            {pwLoading ? <CircularProgress size={18} color="inherit" /> : "Reset"}
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default Users;
