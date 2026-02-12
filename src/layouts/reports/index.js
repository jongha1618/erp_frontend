import React, { useEffect, useState } from "react";
import axios from "axios";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Icon from "@mui/material/Icon";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// ============================================
// Helpers
// ============================================
const formatCurrency = (val) => {
  if (val === null || val === undefined) return "-";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);
};

const formatNumber = (val) => {
  if (val === null || val === undefined) return "-";
  return Number(val).toLocaleString();
};

const formatDate = (val) => {
  if (!val) return "-";
  return new Date(val).toLocaleDateString("ko-KR");
};

const formatPercent = (val) => {
  if (val === null || val === undefined) return "-";
  return `${Number(val).toFixed(1)}%`;
};

// ============================================
// Report Config per Tab
// ============================================
const REPORT_CONFIGS = {
  sales: {
    endpoint: "/reports/sales",
    label: "Sales Report",
    icon: "receipt_long",
    filters: ["start_date", "end_date", "status"],
    statusOptions: ["", "draft", "confirmed", "shipped", "delivered", "cancelled"],
    columns: [
      { key: "sales_number", label: "Sales #" },
      { key: "order_date", label: "Order Date", format: formatDate },
      { key: "company_name", label: "Customer" },
      { key: "status", label: "Status", badge: true },
      { key: "total_amount", label: "Total Amount", format: formatCurrency, align: "right" },
      { key: "item_count", label: "Items", align: "right" },
    ],
    summaryCards: (s) => [
      {
        icon: "receipt_long",
        color: "info",
        title: "Total Orders",
        value: formatNumber(s.total_orders),
        sub: "orders",
      },
      {
        icon: "attach_money",
        color: "success",
        title: "Total Revenue",
        value: formatCurrency(s.total_revenue),
        sub: "revenue",
      },
      {
        icon: "trending_up",
        color: "warning",
        title: "Avg Order Value",
        value: formatCurrency(s.average_order_value),
        sub: "per order",
      },
      {
        icon: "inventory_2",
        color: "dark",
        title: "Items Sold",
        value: formatNumber(s.total_items_sold),
        sub: "units",
      },
    ],
    chartTitle: "Revenue by Customer",
    chartLabel: "Revenue ($)",
    chartKey: "total_revenue",
  },
  purchases: {
    endpoint: "/reports/purchases",
    label: "Purchase Report",
    icon: "shopping_cart",
    filters: ["start_date", "end_date", "status"],
    statusOptions: ["", "Pending", "Approved", "Shipped", "Received", "Cancelled"],
    columns: [
      { key: "po_number", label: "PO #" },
      { key: "order_date", label: "Order Date", format: formatDate },
      { key: "expected_delivery", label: "Expected Delivery", format: formatDate },
      { key: "company_name", label: "Supplier" },
      { key: "status", label: "Status", badge: true },
      { key: "total_amount", label: "Total Amount", format: formatCurrency, align: "right" },
      { key: "item_count", label: "Items", align: "right" },
    ],
    summaryCards: (s) => [
      {
        icon: "shopping_cart",
        color: "info",
        title: "Total Orders",
        value: formatNumber(s.total_orders),
        sub: "purchase orders",
      },
      {
        icon: "payments",
        color: "warning",
        title: "Total Spend",
        value: formatCurrency(s.total_spend),
        sub: "spent",
      },
      {
        icon: "trending_up",
        color: "success",
        title: "Avg Order Value",
        value: formatCurrency(s.average_order_value),
        sub: "per order",
      },
      {
        icon: "inventory_2",
        color: "dark",
        title: "Items Ordered",
        value: formatNumber(s.total_items_ordered),
        sub: "units",
      },
    ],
    chartTitle: "Spend by Supplier",
    chartLabel: "Spend ($)",
    chartKey: "total_spend",
  },
  inventory: {
    endpoint: "/reports/inventory",
    label: "Inventory Report",
    icon: "warehouse",
    filters: [],
    statusOptions: [],
    columns: [
      { key: "item_code", label: "Item Code" },
      { key: "name", label: "Item Name" },
      { key: "total_quantity", label: "On Hand", format: formatNumber, align: "right" },
      { key: "total_reserved", label: "Reserved", format: formatNumber, align: "right" },
      { key: "available_quantity", label: "Available", format: formatNumber, align: "right" },
      { key: "cost_price", label: "Cost Price", format: formatCurrency, align: "right" },
      { key: "inventory_value_cost", label: "Stock Value", format: formatCurrency, align: "right" },
      { key: "locations", label: "Locations" },
    ],
    summaryCards: (s) => [
      {
        icon: "category",
        color: "info",
        title: "Total Items",
        value: formatNumber(s.total_items),
        sub: "unique items",
      },
      {
        icon: "warehouse",
        color: "dark",
        title: "Qty On Hand",
        value: formatNumber(s.total_quantity_on_hand),
        sub: "total units",
      },
      {
        icon: "lock",
        color: "warning",
        title: "Reserved",
        value: formatNumber(s.total_reserved),
        sub: "units reserved",
      },
      {
        icon: "attach_money",
        color: "success",
        title: "Inventory Value (Cost)",
        value: formatCurrency(s.total_inventory_value_cost),
        sub: "at cost",
      },
    ],
    chartTitle: "Stock by Location",
    chartLabel: "Quantity",
    chartKey: "total_quantity",
  },
  production: {
    endpoint: "/reports/production",
    label: "Production Report",
    icon: "engineering",
    filters: ["start_date", "end_date", "status"],
    statusOptions: ["", "draft", "blocked", "ready", "in_progress", "completed", "cancelled"],
    columns: [
      { key: "wo_number", label: "WO #" },
      { key: "output_item_name", label: "Output Item" },
      { key: "quantity_ordered", label: "Qty Ordered", format: formatNumber, align: "right" },
      { key: "quantity_completed", label: "Qty Completed", format: formatNumber, align: "right" },
      { key: "status", label: "Status", badge: true },
      { key: "priority", label: "Priority", badge: true },
      { key: "planned_start_date", label: "Planned Start", format: formatDate },
      { key: "actual_end_date", label: "Actual End", format: formatDate },
    ],
    summaryCards: (s) => [
      {
        icon: "engineering",
        color: "info",
        title: "Total Work Orders",
        value: formatNumber(s.total_work_orders),
        sub: "work orders",
      },
      {
        icon: "inventory_2",
        color: "dark",
        title: "Qty Ordered",
        value: formatNumber(s.total_quantity_ordered),
        sub: "units",
      },
      {
        icon: "check_circle",
        color: "success",
        title: "Qty Completed",
        value: formatNumber(s.total_quantity_completed),
        sub: "units",
      },
      {
        icon: "speed",
        color: "warning",
        title: "Completion Rate",
        value: formatPercent(s.completion_rate),
        sub: "overall",
      },
    ],
    chartTitle: "Production by Output Item",
    chartLabel: "Qty Ordered",
    chartKey: "total_ordered",
  },
};

const STATUS_COLORS = {
  draft: "secondary",
  confirmed: "info",
  shipped: "warning",
  delivered: "success",
  cancelled: "error",
  Pending: "warning",
  Approved: "info",
  Shipped: "primary",
  Received: "success",
  Cancelled: "error",
  blocked: "error",
  ready: "info",
  in_progress: "warning",
  completed: "success",
  low: "secondary",
  normal: "info",
  high: "warning",
  urgent: "error",
};

const emptyChart = { labels: [], datasets: { label: "", data: [] } };

// ============================================
// Reports Component
// ============================================
function Reports() {
  const [activeTab, setActiveTab] = useState(0);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    status: "",
  });

  const tabKeys = ["sales", "purchases", "inventory", "production"];
  const currentKey = tabKeys[activeTab];
  const config = REPORT_CONFIGS[currentKey];

  // Fetch report data
  const fetchReport = () => {
    setLoading(true);
    const params = {};
    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.end_date) params.end_date = filters.end_date;
    if (filters.status) params.status = filters.status;

    axios
      .get(`http://localhost:5000${config.endpoint}`, { params })
      .then((response) => {
        setReportData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching report:", error);
        setReportData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab]);

  const handleTabChange = (e, newValue) => {
    setActiveTab(newValue);
    setReportData(null);
    setFilters({ start_date: "", end_date: "", status: "" });
  };

  const handleFilterChange = (field) => (e) => {
    setFilters((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleApplyFilters = () => {
    fetchReport();
  };

  const handleResetFilters = () => {
    setFilters({ start_date: "", end_date: "", status: "" });
    setTimeout(() => fetchReport(), 0);
  };

  // Export handlers
  const handleExportCSV = () => {
    const params = new URLSearchParams();
    if (filters.start_date) params.append("start_date", filters.start_date);
    if (filters.end_date) params.append("end_date", filters.end_date);
    if (filters.status) params.append("status", filters.status);
    const url = `http://localhost:5000${config.endpoint}/export/csv?${params.toString()}`;
    window.open(url, "_blank");
  };

  const handleExportPDF = () => {
    const params = new URLSearchParams();
    if (filters.start_date) params.append("start_date", filters.start_date);
    if (filters.end_date) params.append("end_date", filters.end_date);
    if (filters.status) params.append("status", filters.status);
    const url = `http://localhost:5000${config.endpoint}/export/pdf?${params.toString()}`;
    window.open(url, "_blank");
  };

  // Build chart data from grouped
  const buildChartData = () => {
    if (!reportData?.grouped || reportData.grouped.length === 0) return emptyChart;
    const top10 = reportData.grouped.slice(0, 10);
    return {
      labels: top10.map((g) => g.group_key || "N/A"),
      datasets: {
        label: config.chartLabel,
        data: top10.map((g) => Number(g[config.chartKey] || 0)),
      },
    };
  };

  const summary = reportData?.summary || {};
  const details = reportData?.details || [];
  const summaryCards = config.summaryCards(summary);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {/* Tabs */}
        <Card>
          <MDBox px={2} pt={2}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              textColor="primary"
              indicatorColor="primary"
            >
              {tabKeys.map((key, idx) => (
                <Tab
                  key={key}
                  label={REPORT_CONFIGS[key].label}
                  icon={<Icon>{REPORT_CONFIGS[key].icon}</Icon>}
                  iconPosition="start"
                  sx={{
                    backgroundColor: activeTab === idx ? "#1A73E8" : "#e8eaf6",
                    color: activeTab === idx ? "#fff !important" : "#344767 !important",
                    borderRadius: "8px",
                    mx: 0.5,
                    minHeight: "42px",
                    fontWeight: "bold",
                    "& .MuiIcon-root": {
                      color: activeTab === idx ? "#fff" : "#344767",
                    },
                    "&:hover": {
                      backgroundColor: activeTab === idx ? "#1565C0" : "#c5cae9",
                    },
                  }}
                />
              ))}
            </Tabs>
          </MDBox>

          {/* Filters */}
          {config.filters.length > 0 && (
            <MDBox px={3} pt={2} pb={1}>
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                {config.filters.includes("start_date") && (
                  <TextField
                    label="Start Date"
                    type="date"
                    size="small"
                    value={filters.start_date}
                    onChange={handleFilterChange("start_date")}
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: 170 }}
                  />
                )}
                {config.filters.includes("end_date") && (
                  <TextField
                    label="End Date"
                    type="date"
                    size="small"
                    value={filters.end_date}
                    onChange={handleFilterChange("end_date")}
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: 170 }}
                  />
                )}
                {config.filters.includes("status") && config.statusOptions.length > 0 && (
                  <TextField
                    label="Status"
                    select
                    size="small"
                    value={filters.status}
                    onChange={handleFilterChange("status")}
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: 170 }}
                  >
                    <MenuItem value="">All</MenuItem>
                    {config.statusOptions
                      .filter((s) => s !== "")
                      .map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                  </TextField>
                )}
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleApplyFilters}
                  sx={{
                    color: "#fff",
                    backgroundColor: "#1A73E8",
                    "&:hover": { backgroundColor: "#1565C0" },
                  }}
                >
                  Apply
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleResetFilters}
                  sx={{
                    color: "#344767",
                    borderColor: "#344767",
                    "&:hover": { borderColor: "#1A73E8", color: "#1A73E8" },
                  }}
                >
                  Reset
                </Button>
              </Stack>
            </MDBox>
          )}

          {/* Export Buttons */}
          <MDBox px={3} pt={1} pb={2}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Icon>download</Icon>}
                onClick={handleExportCSV}
                sx={{
                  textTransform: "none",
                  color: "#1A73E8",
                  borderColor: "#1A73E8",
                  "&:hover": { borderColor: "#1565C0", color: "#1565C0" },
                }}
              >
                Export CSV
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Icon>picture_as_pdf</Icon>}
                onClick={handleExportPDF}
                sx={{
                  textTransform: "none",
                  color: "#F44335",
                  borderColor: "#F44335",
                  "&:hover": { borderColor: "#D32F2F", color: "#D32F2F" },
                }}
              >
                Export PDF
              </Button>
            </Stack>
          </MDBox>
        </Card>

        {/* Loading */}
        {loading ? (
          <MDBox p={3} textAlign="center">
            <MDTypography variant="caption" color="text">
              Loading report...
            </MDTypography>
          </MDBox>
        ) : (
          <>
            {/* Summary Cards */}
            <MDBox mt={3}>
              <Grid container spacing={3}>
                {summaryCards.map((card, idx) => (
                  <Grid item xs={12} md={6} lg={3} key={idx}>
                    <MDBox mb={1.5}>
                      <ComplexStatisticsCard
                        color={card.color}
                        icon={card.icon}
                        title={card.title}
                        count={card.value}
                        percentage={{ color: "info", amount: "", label: card.sub }}
                      />
                    </MDBox>
                  </Grid>
                ))}
              </Grid>
            </MDBox>

            {/* Chart + Status Breakdown */}
            <MDBox mt={3}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <MDBox mb={3}>
                    <ReportsBarChart
                      color="info"
                      title={config.chartTitle}
                      description={`Top 10 grouped by ${config.chartLabel}`}
                      date="current data"
                      chart={buildChartData()}
                    />
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ height: "100%" }}>
                    <MDBox p={3}>
                      <MDTypography variant="h6" fontWeight="medium" mb={2}>
                        Status Breakdown
                      </MDTypography>
                      {summary.orders_by_status ? (
                        Object.entries(summary.orders_by_status).map(([status, count]) => (
                          <MDBox
                            key={status}
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={1}
                          >
                            <MDBadge
                              badgeContent={status}
                              color={STATUS_COLORS[status] || "secondary"}
                              variant="gradient"
                              size="sm"
                            />
                            <MDTypography variant="button" fontWeight="medium">
                              {count}
                            </MDTypography>
                          </MDBox>
                        ))
                      ) : (
                        <MDTypography variant="caption" color="text">
                          No status data
                        </MDTypography>
                      )}
                      {summary.orders_by_priority && (
                        <>
                          <Divider sx={{ my: 1 }} />
                          <MDTypography variant="h6" fontWeight="medium" mb={2}>
                            Priority Breakdown
                          </MDTypography>
                          {Object.entries(summary.orders_by_priority).map(([priority, count]) => (
                            <MDBox
                              key={priority}
                              display="flex"
                              justifyContent="space-between"
                              alignItems="center"
                              mb={1}
                            >
                              <MDBadge
                                badgeContent={priority}
                                color={STATUS_COLORS[priority] || "secondary"}
                                variant="gradient"
                                size="sm"
                              />
                              <MDTypography variant="button" fontWeight="medium">
                                {count}
                              </MDTypography>
                            </MDBox>
                          ))}
                        </>
                      )}
                    </MDBox>
                  </Card>
                </Grid>
              </Grid>
            </MDBox>

            {/* Detail Table */}
            <MDBox mt={3}>
              <Card>
                <MDBox p={3}>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <MDTypography variant="h6" fontWeight="medium">
                      Detail Data ({details.length} records)
                    </MDTypography>
                  </MDBox>
                  <TableContainer sx={{ maxHeight: 500 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          {config.columns.map((col) => (
                            <TableCell
                              key={col.key}
                              align={col.align || "left"}
                              sx={{
                                fontWeight: "bold",
                                fontSize: "0.75rem",
                                textTransform: "uppercase",
                                color: "text.secondary",
                              }}
                            >
                              {col.label}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {details.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={config.columns.length} align="center">
                              <MDTypography variant="caption" color="text">
                                No data found
                              </MDTypography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          details.map((row, idx) => (
                            <TableRow key={idx} hover>
                              {config.columns.map((col) => (
                                <TableCell key={col.key} align={col.align || "left"}>
                                  {col.badge ? (
                                    <MDBadge
                                      badgeContent={row[col.key] || "-"}
                                      color={STATUS_COLORS[row[col.key]] || "secondary"}
                                      variant="gradient"
                                      size="xs"
                                    />
                                  ) : (
                                    <MDTypography variant="caption" fontWeight="regular">
                                      {col.format ? col.format(row[col.key]) : row[col.key] || "-"}
                                    </MDTypography>
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </MDBox>
              </Card>
            </MDBox>
          </>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Reports;
