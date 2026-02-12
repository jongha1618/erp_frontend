/* eslint-disable react/prop-types */
import React, { useState, Fragment } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Icon from "@mui/material/Icon";
import { Box } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { useNavigate, Link } from "react-router-dom";

import {
  useKitItemsTableData,
  getStatusColor,
  formatDate,
} from "layouts/kititems/data/kitItemsTableData";

function KitItemRow({ kit }) {
  const [open, setOpen] = useState(false);

  return (
    <Fragment>
      <TableRow
        sx={{
          display: "table-row",
          cursor: "pointer",
          "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
        }}
        onClick={() => setOpen(!open)}
      >
        <TableCell sx={{ padding: "8px 0px 8px 8px", width: "30px", textAlign: "left" }}>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ padding: "12px 8px" }}>
          <MDTypography
            component={Link}
            to={`/kititems/newkititem/${kit.kit_item_id}`}
            variant="caption"
            color="info"
            fontWeight="medium"
            onClick={(e) => e.stopPropagation()}
          >
            {kit.kit_number}
          </MDTypography>
        </TableCell>
        <TableCell sx={{ paddingLeft: "16px" }}>
          <MDTypography variant="caption" color="text" fontWeight="medium">
            {kit.name || "-"}
          </MDTypography>
        </TableCell>
        <TableCell align="center">
          <MDTypography variant="caption" color="text" fontWeight="medium">
            {kit.component_count || 0}
          </MDTypography>
        </TableCell>
        <TableCell align="center">
          <MDTypography variant="caption" color="text" fontWeight="medium">
            {kit.completed_quantity || 0} / {kit.quantity_to_build || 0}
          </MDTypography>
        </TableCell>
        <TableCell align="center">
          <MDTypography variant="caption" color="text" fontWeight="medium">
            {formatDate(kit.created_at)}
          </MDTypography>
        </TableCell>
        <TableCell align="center">
          <MDBadge
            badgeContent={kit.status || "draft"}
            color={getStatusColor(kit.status)}
            variant="gradient"
            size="sm"
          />
        </TableCell>
        <TableCell align="center">
          <Link
            to={`/kititems/newkititem/${kit.kit_item_id}`}
            style={{ textDecoration: "none" }}
            onClick={(e) => e.stopPropagation()}
          >
            <MDBadge badgeContent="Edit" color="primary" variant="gradient" size="sm" />
          </Link>
        </TableCell>
      </TableRow>
      <TableRow sx={{ display: "table-row" }}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, backgroundColor: "#dddee7ff", borderRadius: 2, p: 2 }}>
              <MDTypography variant="h6" gutterBottom component="div" color="dark">
                Components
              </MDTypography>
              {kit.components && kit.components.length > 0 ? (
                <Table size="small" sx={{ tableLayout: "fixed", width: "100%" }}>
                  <colgroup>
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "25%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "15%" }} />
                  </colgroup>
                  <TableHead sx={{ display: "table-header-group", padding: 0 }}>
                    <TableRow sx={{ display: "table-row", backgroundColor: "#e0e0e0" }}>
                      <TableCell sx={{ paddingLeft: "16px" }}>
                        <MDTypography variant="caption" fontWeight="bold">
                          Item Code
                        </MDTypography>
                      </TableCell>
                      <TableCell sx={{ paddingLeft: "16px" }}>
                        <MDTypography variant="caption" fontWeight="bold">
                          Item Name
                        </MDTypography>
                      </TableCell>
                      <TableCell align="center">
                        <MDTypography variant="caption" fontWeight="bold">
                          Qty/Kit
                        </MDTypography>
                      </TableCell>
                      <TableCell align="center">
                        <MDTypography variant="caption" fontWeight="bold">
                          Reserved
                        </MDTypography>
                      </TableCell>
                      <TableCell align="center">
                        <MDTypography variant="caption" fontWeight="bold">
                          Used
                        </MDTypography>
                      </TableCell>
                      <TableCell sx={{ paddingLeft: "16px" }}>
                        <MDTypography variant="caption" fontWeight="bold">
                          Location
                        </MDTypography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody sx={{ display: "table-row-group" }}>
                    {kit.components.map((comp, index) => (
                      <TableRow key={comp.component_id || index} sx={{ display: "table-row" }}>
                        <TableCell sx={{ paddingLeft: "16px" }}>
                          <MDTypography variant="caption" color="text">
                            {comp.item_code || "-"}
                          </MDTypography>
                        </TableCell>
                        <TableCell sx={{ paddingLeft: "16px" }}>
                          <MDTypography variant="caption" color="text">
                            {comp.item_name || "-"}
                          </MDTypography>
                        </TableCell>
                        <TableCell align="center">
                          <MDTypography variant="caption" color="text">
                            {comp.quantity_per_kit}
                          </MDTypography>
                        </TableCell>
                        <TableCell align="center">
                          <MDBadge
                            badgeContent={comp.reserved_quantity || 0}
                            color={comp.reserved_quantity > 0 ? "warning" : "secondary"}
                            variant="gradient"
                            size="sm"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <MDBadge
                            badgeContent={comp.used_quantity || 0}
                            color={comp.used_quantity > 0 ? "success" : "secondary"}
                            variant="gradient"
                            size="sm"
                          />
                        </TableCell>
                        <TableCell sx={{ paddingLeft: "16px" }}>
                          <MDTypography variant="caption" color="text">
                            {comp.location || "-"}
                          </MDTypography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <MDTypography variant="caption" color="text">
                  No components in this kit item
                </MDTypography>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
}

function KitItems() {
  const { data, loading } = useKitItemsTableData();
  const [selectedKit, setSelectedKit] = useState(null);
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <br />
      <Stack spacing={1} direction="row">
        <Button
          variant="contained"
          href="/kititems/newkititem"
          startIcon={<Icon>build</Icon>}
          sx={{
            color: "#ffffff",
            backgroundColor: "green",
            "&:hover": { backgroundColor: "darkgreen" },
          }}
        >
          Add Kit Item
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Autocomplete
          disablePortal
          options={data.map((kit) => ({
            label: kit.kit_number || "",
            id: kit.kit_item_id,
            key: kit.kit_item_id,
          }))}
          value={selectedKit}
          onChange={(event, newValue) => {
            if (newValue && newValue.key) {
              navigate(`/kititems/newkititem/${newValue.key}`);
            }
          }}
          sx={{ width: 250 }}
          renderInput={(params) => <TextField {...params} label="Search Kit Item" />}
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
                  Kit Items (Assembly)
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                <TableContainer
                  sx={{ width: "100%", overflowX: "auto", boxShadow: "none", paddingLeft: 0 }}
                >
                  <Table sx={{ tableLayout: "fixed", width: "100%", marginLeft: "-8px" }}>
                    <colgroup>
                      <col style={{ width: "30px" }} />
                      <col style={{ width: "15%" }} />
                      <col style={{ width: "20%" }} />
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "12%" }} />
                      <col style={{ width: "12%" }} />
                      <col style={{ width: "11%" }} />
                      <col style={{ width: "10%" }} />
                    </colgroup>
                    <TableHead sx={{ display: "table-header-group", padding: 0 }}>
                      <TableRow sx={{ display: "table-row" }}>
                        <TableCell
                          sx={{ padding: "8px 0px 8px 8px", width: "30px", textAlign: "left" }}
                        />
                        <TableCell sx={{ verticalAlign: "middle", padding: "12px 8px" }}>
                          <MDTypography
                            variant="caption"
                            fontWeight="bold"
                            color="secondary"
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            KIT NUMBER
                          </MDTypography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: "middle", paddingLeft: "16px" }}>
                          <MDTypography
                            variant="caption"
                            fontWeight="bold"
                            color="secondary"
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            NAME
                          </MDTypography>
                        </TableCell>
                        <TableCell align="center" sx={{ verticalAlign: "middle" }}>
                          <MDTypography
                            variant="caption"
                            fontWeight="bold"
                            color="secondary"
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            COMPONENTS
                          </MDTypography>
                        </TableCell>
                        <TableCell align="center" sx={{ verticalAlign: "middle" }}>
                          <MDTypography
                            variant="caption"
                            fontWeight="bold"
                            color="secondary"
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            PROGRESS
                          </MDTypography>
                        </TableCell>
                        <TableCell align="center" sx={{ verticalAlign: "middle" }}>
                          <MDTypography
                            variant="caption"
                            fontWeight="bold"
                            color="secondary"
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            CREATED
                          </MDTypography>
                        </TableCell>
                        <TableCell align="center" sx={{ verticalAlign: "middle" }}>
                          <MDTypography
                            variant="caption"
                            fontWeight="bold"
                            color="secondary"
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            STATUS
                          </MDTypography>
                        </TableCell>
                        <TableCell align="center" sx={{ verticalAlign: "middle" }}>
                          <MDTypography
                            variant="caption"
                            fontWeight="bold"
                            color="secondary"
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            ACTION
                          </MDTypography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody sx={{ display: "table-row-group" }}>
                      {loading ? (
                        <TableRow sx={{ display: "table-row" }}>
                          <TableCell colSpan={8} align="center">
                            <MDTypography variant="caption" color="text">
                              Loading...
                            </MDTypography>
                          </TableCell>
                        </TableRow>
                      ) : data.length === 0 ? (
                        <TableRow sx={{ display: "table-row" }}>
                          <TableCell colSpan={8} align="center">
                            <MDTypography variant="caption" color="text">
                              No kit items found
                            </MDTypography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        data.map((kit) => <KitItemRow key={kit.kit_item_id} kit={kit} />)
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default KitItems;
