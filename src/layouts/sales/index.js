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
  useSalesTableData,
  getStatusColor,
  formatDate,
  formatCurrency,
} from "layouts/sales/data/salesTableData";

function SaleRow({ sale }) {
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
            to={`/sales/newsale/${sale.sale_id}`}
            variant="caption"
            color="info"
            fontWeight="medium"
            onClick={(e) => e.stopPropagation()}
          >
            {sale.sales_number}
          </MDTypography>
        </TableCell>
        <TableCell sx={{ paddingLeft: "16px" }}>
          <MDTypography variant="caption" color="text" fontWeight="medium">
            {sale.company_name || "-"}
          </MDTypography>
        </TableCell>
        <TableCell align="center">
          <MDTypography variant="caption" color="text" fontWeight="medium">
            {formatDate(sale.order_date)}
          </MDTypography>
        </TableCell>
        <TableCell align="center">
          <MDTypography variant="caption" color="text" fontWeight="medium">
            {formatDate(sale.delivery_date)}
          </MDTypography>
        </TableCell>
        <TableCell align="right" sx={{ paddingRight: "16px" }}>
          <MDTypography variant="caption" color="text" fontWeight="medium">
            {formatCurrency(sale.total_amount)}
          </MDTypography>
        </TableCell>
        <TableCell align="center">
          <MDBadge
            badgeContent={sale.status || "draft"}
            color={getStatusColor(sale.status)}
            variant="gradient"
            size="sm"
          />
        </TableCell>
        <TableCell align="center">
          <Link
            to={`/sales/newsale/${sale.sale_id}`}
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
            <Box sx={{ margin: 2, backgroundColor: "#f5f5f5", borderRadius: 2, p: 2 }}>
              <MDTypography variant="h6" gutterBottom component="div" color="dark">
                Order Items
              </MDTypography>
              {sale.details && sale.details.length > 0 ? (
                <Table size="small" sx={{ tableLayout: "fixed", width: "100%" }}>
                  <colgroup>
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "30%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "14%" }} />
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
                          Quantity
                        </MDTypography>
                      </TableCell>
                      <TableCell align="right" sx={{ paddingRight: "16px" }}>
                        <MDTypography variant="caption" fontWeight="bold">
                          Unit Price
                        </MDTypography>
                      </TableCell>
                      <TableCell align="right" sx={{ paddingRight: "16px" }}>
                        <MDTypography variant="caption" fontWeight="bold">
                          Subtotal
                        </MDTypography>
                      </TableCell>
                      <TableCell align="center">
                        <MDTypography variant="caption" fontWeight="bold">
                          Shipped
                        </MDTypography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody sx={{ display: "table-row-group" }}>
                    {sale.details.map((detail, index) => (
                      <TableRow key={detail.detail_id || index} sx={{ display: "table-row" }}>
                        <TableCell sx={{ paddingLeft: "16px" }}>
                          <MDTypography variant="caption" color="text">
                            {detail.item_code || "-"}
                          </MDTypography>
                        </TableCell>
                        <TableCell sx={{ paddingLeft: "16px" }}>
                          <MDTypography variant="caption" color="text">
                            {detail.item_name || "-"}
                          </MDTypography>
                        </TableCell>
                        <TableCell align="center">
                          <MDTypography variant="caption" color="text">
                            {detail.quantity}
                          </MDTypography>
                        </TableCell>
                        <TableCell align="right" sx={{ paddingRight: "16px" }}>
                          <MDTypography variant="caption" color="text">
                            {formatCurrency(detail.unit_price)}
                          </MDTypography>
                        </TableCell>
                        <TableCell align="right" sx={{ paddingRight: "16px" }}>
                          <MDTypography variant="caption" color="text">
                            {formatCurrency(detail.subtotal || detail.quantity * detail.unit_price)}
                          </MDTypography>
                        </TableCell>
                        <TableCell align="center">
                          <MDBadge
                            badgeContent={`${detail.shipped_quantity || 0} / ${detail.quantity}`}
                            color={
                              detail.shipped_quantity >= detail.quantity
                                ? "success"
                                : detail.shipped_quantity > 0
                                ? "warning"
                                : "secondary"
                            }
                            variant="gradient"
                            size="sm"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <MDTypography variant="caption" color="text">
                  No items in this sales order
                </MDTypography>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
}

function Sales() {
  const { data, loading } = useSalesTableData();
  const [selectedSale, setSelectedSale] = useState(null);
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <br />
      <Stack spacing={1} direction="row">
        <Button
          variant="contained"
          href="/sales/newsale"
          startIcon={<Icon>point_of_sale</Icon>}
          sx={{
            color: "#ffffff",
            backgroundColor: "green",
            "&:hover": { backgroundColor: "darkgreen" },
          }}
        >
          Add Sales Order
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Autocomplete
          disablePortal
          options={data.map((sale) => ({
            label: sale.sales_number || "",
            id: sale.sale_id,
            key: sale.sale_id,
          }))}
          value={selectedSale}
          onChange={(event, newValue) => {
            if (newValue && newValue.key) {
              navigate(`/sales/newsale/${newValue.key}`);
            }
          }}
          sx={{ width: 250 }}
          renderInput={(params) => <TextField {...params} label="Search Sales Order" />}
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
                  Sales Orders
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                <TableContainer
                  sx={{ width: "100%", overflowX: "auto", boxShadow: "none", paddingLeft: 0 }}
                >
                  <Table sx={{ tableLayout: "fixed", width: "100%", marginLeft: "-8px" }}>
                    <colgroup>
                      <col style={{ width: "30px" }} />
                      <col style={{ width: "18%" }} />
                      <col style={{ width: "13%" }} />
                      <col style={{ width: "12%" }} />
                      <col style={{ width: "14%" }} />
                      <col style={{ width: "13%" }} />
                      <col style={{ width: "10%" }} />
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
                            SALES NUMBER
                          </MDTypography>
                        </TableCell>
                        <TableCell sx={{ verticalAlign: "middle", paddingLeft: "16px" }}>
                          <MDTypography
                            variant="caption"
                            fontWeight="bold"
                            color="secondary"
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            CUSTOMER
                          </MDTypography>
                        </TableCell>
                        <TableCell align="center" sx={{ verticalAlign: "middle" }}>
                          <MDTypography
                            variant="caption"
                            fontWeight="bold"
                            color="secondary"
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            ORDER DATE
                          </MDTypography>
                        </TableCell>
                        <TableCell align="center" sx={{ verticalAlign: "middle" }}>
                          <MDTypography
                            variant="caption"
                            fontWeight="bold"
                            color="secondary"
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            DELIVERY DATE
                          </MDTypography>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ verticalAlign: "middle", paddingRight: "16px" }}
                        >
                          <MDTypography
                            variant="caption"
                            fontWeight="bold"
                            color="secondary"
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            TOTAL AMOUNT
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
                              No sales orders found
                            </MDTypography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        data.map((sale) => <SaleRow key={sale.sale_id} sale={sale} />)
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

export default Sales;
