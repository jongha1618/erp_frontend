import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import AddIcon from "@mui/icons-material/Add";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import SupplierIcon from "../../assets/images/icons/flags/supplier.png";
import { Avatar } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";

// Import the custom hook
import { useSuppliersTableData } from "layouts/suppliers/data/suppliersTableData";

function Suppliers() {
  const { columns, rows } = useSuppliersTableData(); // ✅ Use the hook here
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const navigate = useNavigate(); // Initialize navigate function
  // Extract supplier names from rows
  const supplierOptions = rows.map((row) => row.company_name.props.children);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <br />
      <Stack spacing={1} direction="row">
        <Button
          variant="contained"
          href="/suppliers/newsupplier"
          startIcon={
            <Avatar src={SupplierIcon} alt="Supplier Icon" sx={{ width: 24, height: 24 }} />
          }
          sx={{
            color: "#ffffff",
            backgroundColor: "green",
            "&:hover": { backgroundColor: "darkgreen" },
          }}
        >
          Add Supplier
        </Button>
        <Box sx={{ flexGrow: 1 }} /> {/* Spacer to push AutoComplete to the right */}
        <Autocomplete
          disablePortal
          options={rows.map((row) => ({
            label: row.company_name.props.children,
            id: row.supplier_id || "",
            key: row.key,
          }))}
          value={selectedSupplier}
          onChange={(event, newValue) => {
            if (newValue && newValue.key) {
              navigate(`/suppliers/newsupplier/${newValue.key}`);
            }
          }}
          sx={{ width: 250 }}
          renderInput={(params) => <TextField {...params} label="Supplier List" />}
        />
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
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  Suppliers
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Suppliers;
