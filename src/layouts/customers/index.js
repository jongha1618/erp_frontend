import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";

// Import the custom hook
import { useCustomersTableData } from "layouts/customers/data/customersTableData";

function Customers() {
  const { columns, rows } = useCustomersTableData(); // ✅ Use the hook here
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const navigate = useNavigate(); // Initialize navigate function
  // Extract customer names from rows
  const customerOptions = rows.map((row) => row.company_name.props.children);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <br />
      <Stack spacing={1} direction="row">
        <Button
          variant="contained"
          href="/customers/newcustomer"
          startIcon={<GroupAddIcon />}
          sx={{
            color: "#ffffff",
            backgroundColor: "green",
            "&:hover": { backgroundColor: "darkgreen" },
          }}
        >
          Add Customer
        </Button>
        <Box sx={{ flexGrow: 1 }} /> {/* Spacer to push AutoComplete to the right */}
        <Autocomplete
          disablePortal
          options={rows.map((row) => ({
            label: row.company_name.props.children,
            id: row.customer_id || "",
            key: row.key,
          }))}
          value={selectedCustomer}
          onChange={(event, newValue) => {
            if (newValue && newValue.key) {
              navigate(`/customers/newcustomer/${newValue.key}`);
            }
          }}
          sx={{ width: 250 }}
          renderInput={(params) => <TextField {...params} label="Customer List" />}
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
                  Customers
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

export default Customers;
