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
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import axios from "axios";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { useNavigate, Link } from "react-router-dom";

import {
  useQuotationsTableData,
  getStatusColor,
  formatDate,
  formatCurrency,
} from "layouts/quotations/data/quotationsTableData";

function QuotationRow({ quotation, onConvert }) {
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
            to={`/quotations/newquotation/${quotation.quotation_id}`}
            variant="caption"
            color="info"
            fontWeight="medium"
            onClick={(e) => e.stopPropagation()}
          >
            {quotation.quotation_number}
          </MDTypography>
        </TableCell>
        <TableCell sx={{ paddingLeft: "16px" }}>
          <MDTypography variant="caption" color="text" fontWeight="medium">
            {quotation.company_name || "-"}
          </MDTypography>
        </TableCell>
        <TableCell align="center">
          <MDTypography variant="caption" color="text" fontWeight="medium">
            {formatDate(quotation.quotation_date)}
          </MDTypography>
        </TableCell>
        <TableCell align="center">
          <MDTypography variant="caption" color="text" fontWeight="medium">
            {formatDate(quotation.valid_until)}
          </MDTypography>
        </TableCell>
        <TableCell align="right" sx={{ paddingRight: "16px" }}>
          <MDTypography variant="caption" color="text" fontWeight="medium">
            {formatCurrency(quotation.total_amount)}
          </MDTypography>
        </TableCell>
        <TableCell align="center">
          <MDBadge
            badgeContent={quotation.status || "draft"}
            color={getStatusColor(quotation.status)}
            variant="gradient"
            size="sm"
          />
        </TableCell>
        <TableCell align="center">
          <MDBox display="flex" alignItems="center" justifyContent="center" gap={0.5}>
            <Link
              to={`/quotations/newquotation/${quotation.quotation_id}`}
              style={{ textDecoration: "none" }}
              onClick={(e) => e.stopPropagation()}
            >
              <MDBadge badgeContent="Edit" color="primary" variant="gradient" size="sm" />
            </Link>
            {quotation.status !== "converted" && quotation.status !== "rejected" && (
              <Box
                onClick={(e) => {
                  e.stopPropagation();
                  onConvert(quotation);
                }}
                sx={{ cursor: "pointer" }}
              >
                <MDBadge badgeContent="→ SO" color="success" variant="gradient" size="sm" />
              </Box>
            )}
          </MDBox>
        </TableCell>
      </TableRow>
      <TableRow sx={{ display: "table-row" }}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                margin: 2,
                backgroundColor: "#f5f5f5",
                borderRadius: 2,
                p: 2,
                border: "1px solid #d2d6da",
              }}
            >
              <MDTypography variant="h6" gutterBottom component="div" color="dark">
                Quotation Items
              </MDTypography>
              {quotation.details && quotation.details.length > 0 ? (
                <Table size="small" sx={{ tableLayout: "fixed", width: "100%" }}>
                  <colgroup>
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "35%" }} />
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "17%" }} />
                    <col style={{ width: "17%" }} />
                  </colgroup>
                  <TableHead sx={{ display: "table-header-group", padding: 0 }}>
                    <TableRow sx={{ display: "table-row", backgroundColor: "#e8eaf6" }}>
                      <TableCell sx={{ paddingLeft: "16px" }}>
                        <MDTypography variant="caption" fontWeight="bold" color="dark">
                          Item Code
                        </MDTypography>
                      </TableCell>
                      <TableCell sx={{ paddingLeft: "16px" }}>
                        <MDTypography variant="caption" fontWeight="bold" color="dark">
                          Item Name
                        </MDTypography>
                      </TableCell>
                      <TableCell align="center">
                        <MDTypography variant="caption" fontWeight="bold" color="dark">
                          Quantity
                        </MDTypography>
                      </TableCell>
                      <TableCell align="right" sx={{ paddingRight: "16px" }}>
                        <MDTypography variant="caption" fontWeight="bold" color="dark">
                          Unit Price
                        </MDTypography>
                      </TableCell>
                      <TableCell align="right" sx={{ paddingRight: "16px" }}>
                        <MDTypography variant="caption" fontWeight="bold" color="dark">
                          Subtotal
                        </MDTypography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody sx={{ display: "table-row-group" }}>
                    {quotation.details.map((detail, index) => (
                      <TableRow
                        key={detail.detail_id || index}
                        sx={{
                          display: "table-row",
                          backgroundColor: "#ffffff",
                          "&:hover": { backgroundColor: "#f0f0f0" },
                        }}
                      >
                        <TableCell sx={{ paddingLeft: "16px" }}>
                          <MDTypography variant="caption" color="dark">
                            {detail.item_code || "-"}
                          </MDTypography>
                        </TableCell>
                        <TableCell sx={{ paddingLeft: "16px" }}>
                          <MDTypography variant="caption" color="dark">
                            {detail.item_name || "-"}
                          </MDTypography>
                        </TableCell>
                        <TableCell align="center">
                          <MDTypography variant="caption" color="dark">
                            {detail.quantity}
                          </MDTypography>
                        </TableCell>
                        <TableCell align="right" sx={{ paddingRight: "16px" }}>
                          <MDTypography variant="caption" color="dark">
                            {formatCurrency(detail.unit_price)}
                          </MDTypography>
                        </TableCell>
                        <TableCell align="right" sx={{ paddingRight: "16px" }}>
                          <MDTypography variant="caption" color="dark">
                            {formatCurrency(detail.subtotal || detail.quantity * detail.unit_price)}
                          </MDTypography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <MDTypography variant="caption" color="text">
                  No items in this quotation
                </MDTypography>
              )}
              {quotation.status === "converted" && quotation.converted_sale_id && (
                <MDBox mt={2}>
                  <MDTypography variant="caption" color="success" fontWeight="medium">
                    Converted to Sales Order:{" "}
                    <MDTypography
                      component={Link}
                      to={`/sales/newsale/${quotation.converted_sale_id}`}
                      variant="caption"
                      color="info"
                      fontWeight="bold"
                    >
                      View Sales Order
                    </MDTypography>
                  </MDTypography>
                </MDBox>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
}

function Quotations() {
  const { data, loading, refetch } = useQuotationsTableData();
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const navigate = useNavigate();

  // Convert to SO dialog state
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [convertQuotation, setConvertQuotation] = useState(null);
  const [salesNumber, setSalesNumber] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleOpenConvertDialog = (quotation) => {
    setConvertQuotation(quotation);
    setSalesNumber("");
    setConvertDialogOpen(true);
  };

  const handleCloseConvertDialog = () => {
    setConvertDialogOpen(false);
    setConvertQuotation(null);
    setSalesNumber("");
  };

  const handleConvertToSO = async () => {
    if (!salesNumber.trim()) {
      alert("Sales Number is required");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/quotations/${convertQuotation.quotation_id}/convert-to-so`,
        { sales_number: salesNumber }
      );
      setSuccessMessage(response.data.message || "Converted successfully!");
      handleCloseConvertDialog();
      refetch();

      // Navigate to the new sales order after a short delay
      setTimeout(() => {
        if (response.data.sale_id) {
          navigate(`/sales/newsale/${response.data.sale_id}`);
        }
      }, 1500);
    } catch (error) {
      console.error("Convert error:", error);
      alert(error.response?.data?.error || "Failed to convert quotation to Sales Order");
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <br />
      <Stack spacing={1} direction="row">
        <Button
          variant="contained"
          href="/quotations/newquotation"
          startIcon={<Icon>description</Icon>}
          sx={{
            color: "#ffffff",
            backgroundColor: "green",
            "&:hover": { backgroundColor: "darkgreen" },
          }}
        >
          Add Quotation
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Autocomplete
          disablePortal
          options={data.map((q) => ({
            label: q.quotation_number || "",
            id: q.quotation_id,
            key: q.quotation_id,
          }))}
          value={selectedQuotation}
          onChange={(event, newValue) => {
            if (newValue && newValue.key) {
              navigate(`/quotations/newquotation/${newValue.key}`);
            }
          }}
          sx={{ width: 250 }}
          renderInput={(params) => <TextField {...params} label="Search Quotation" />}
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
                  Quotations
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                <TableContainer
                  sx={{ width: "100%", overflowX: "auto", boxShadow: "none", paddingLeft: 0 }}
                >
                  <Table sx={{ tableLayout: "fixed", width: "100%", marginLeft: "-8px" }}>
                    <colgroup>
                      <col style={{ width: "30px" }} />
                      <col style={{ width: "16%" }} />
                      <col style={{ width: "14%" }} />
                      <col style={{ width: "12%" }} />
                      <col style={{ width: "12%" }} />
                      <col style={{ width: "13%" }} />
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "13%" }} />
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
                            QUOTATION #
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
                            DATE
                          </MDTypography>
                        </TableCell>
                        <TableCell align="center" sx={{ verticalAlign: "middle" }}>
                          <MDTypography
                            variant="caption"
                            fontWeight="bold"
                            color="secondary"
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            VALID UNTIL
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
                          <TableCell colSpan={9} align="center">
                            <MDTypography variant="caption" color="text">
                              Loading...
                            </MDTypography>
                          </TableCell>
                        </TableRow>
                      ) : data.length === 0 ? (
                        <TableRow sx={{ display: "table-row" }}>
                          <TableCell colSpan={9} align="center">
                            <MDTypography variant="caption" color="text">
                              No quotations found
                            </MDTypography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        data.map((quotation) => (
                          <QuotationRow
                            key={quotation.quotation_id}
                            quotation={quotation}
                            onConvert={handleOpenConvertDialog}
                          />
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

      {/* Convert to Sales Order Dialog */}
      <Dialog open={convertDialogOpen} onClose={handleCloseConvertDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Convert Quotation to Sales Order</DialogTitle>
        <DialogContent>
          <MDBox pt={2}>
            <MDTypography variant="body2" mb={1}>
              Quotation: <strong>{convertQuotation?.quotation_number}</strong>
            </MDTypography>
            <MDTypography variant="body2" mb={1}>
              Customer: <strong>{convertQuotation?.company_name || "-"}</strong>
            </MDTypography>
            <MDTypography variant="body2" mb={2}>
              Total Amount: <strong>{formatCurrency(convertQuotation?.total_amount)}</strong>
            </MDTypography>
            <TextField
              label="Sales Order Number *"
              value={salesNumber}
              onChange={(e) => setSalesNumber(e.target.value)}
              fullWidth
              placeholder="Enter Sales Order Number"
              sx={{ mt: 1 }}
            />
          </MDBox>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConvertDialog} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleConvertToSO}
            variant="contained"
            sx={{
              color: "#ffffff",
              backgroundColor: "green",
              "&:hover": { backgroundColor: "darkgreen" },
            }}
            disabled={!salesNumber.trim()}
          >
            Convert to Sales Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage("")}
      >
        <Alert onClose={() => setSuccessMessage("")} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>

      <Footer />
    </DashboardLayout>
  );
}

export default Quotations;
