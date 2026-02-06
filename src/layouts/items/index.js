/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import IconButton from "@mui/material/IconButton";
import AlarmIcon from "@mui/icons-material/Alarm";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import AddIcon from "@mui/icons-material/Add";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";

// Data
import authorsTableData from "layouts/items/data/itemsTableData";
// import projectsTableData from "layouts/items/data/projectsTableData";

function Items() {
  const { columns, rows } = authorsTableData();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const navigate = useNavigate(); // Initialize navigate function
  // const { columns: pColumns, rows: pRows } = projectsTableData();

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <br />
      <Stack spacing={1} direction="row">
        {/* <Button variant="text">Text</Button>
        <Button variant="contained">Contained</Button>
        <Button variant="outlined">Outlined</Button>
        <Button variant="outlined" href="#outlined-buttons" color="success">
          Link
        </Button>
        <Button variant="contained" sx={{ color: "white", backgroundColor: "green" }}>
          Secondary
        </Button>
        <Button variant="outlined" sx={{ color: "white", backgroundColor: "green" }}>
          Error
        </Button>
        <Button variant="contained" endIcon={<SendIcon />}>
          Send
        </Button> */}
        {/* <IconButton color="secondary" aria-label="add an alarm" href="/items/newitem">
          <GroupAddIcon />
        </IconButton> */}
        <Button
          variant="contained"
          href="/items/newitem"
          startIcon={<AddIcon />}
          // sx={{ color: "white", backgroundColor: "green" }}
          sx={{
            color: "#ffffff",
            backgroundColor: "green",
            "&:hover": { backgroundColor: "darkgreen" },
          }}
        >
          Add Item
        </Button>
        <Box sx={{ flexGrow: 1 }} /> {/* Spacer to push AutoComplete to the right */}
        <Autocomplete
          disablePortal
          options={rows.map((row) => ({
            label: row.item_code.props.children,
            id: row.item_id || "",
            key: row.key,
          }))}
          value={selectedCustomer}
          onChange={(event, newValue) => {
            if (newValue && newValue.key) {
              navigate(`/items/newitem/${newValue.key}`);
            }
          }}
          sx={{ width: 250 }}
          renderInput={(params) => <TextField {...params} label="Item List" />}
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
                  Items
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

export default Items;
