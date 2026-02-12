import React, { useEffect, useState } from "react";
import axios from "axios";

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Dashboard components
import RecentSalesOrders from "layouts/dashboard/components/RecentSalesOrders";
import RecentActivityTimeline from "layouts/dashboard/components/RecentActivityTimeline";

const emptyChart = { labels: [], datasets: { label: "", data: [] } };

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:5000/dashboard/stats")
      .then((response) => {
        setStats(response.data);
      })
      .catch((error) => {
        console.error("Error fetching dashboard stats:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const cards = stats?.cards || {};
  const charts = stats?.charts || {};

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        {loading ? (
          <MDBox p={3} textAlign="center">
            <MDTypography variant="caption" color="text">
              Loading dashboard...
            </MDTypography>
          </MDBox>
        ) : (
          <>
            {/* Row 1: Primary Statistics Cards */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6} lg={3}>
                <MDBox mb={1.5}>
                  <ComplexStatisticsCard
                    color="dark"
                    icon="inventory_2"
                    title="Total Active Items"
                    count={cards.totalActiveItems || 0}
                    percentage={{
                      color: "info",
                      amount: "",
                      label: "items in catalog",
                    }}
                  />
                </MDBox>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <MDBox mb={1.5}>
                  <ComplexStatisticsCard
                    icon="warehouse"
                    title="Inventory On Hand"
                    count={Number(cards.totalInventoryQty || 0).toLocaleString()}
                    percentage={{
                      color: "info",
                      amount: "",
                      label: "total units",
                    }}
                  />
                </MDBox>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <MDBox mb={1.5}>
                  <ComplexStatisticsCard
                    color="success"
                    icon="shopping_cart"
                    title="Open Sales Orders"
                    count={cards.openSalesOrders || 0}
                    percentage={{
                      color: "success",
                      amount: "",
                      label: "orders in progress",
                    }}
                  />
                </MDBox>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <MDBox mb={1.5}>
                  <ComplexStatisticsCard
                    color="warning"
                    icon="local_shipping"
                    title="Open Purchase Orders"
                    count={cards.openPurchaseOrders || 0}
                    percentage={{
                      color: "warning",
                      amount: "",
                      label: "awaiting receipt",
                    }}
                  />
                </MDBox>
              </Grid>
            </Grid>

            {/* Row 1b: Secondary Statistics Cards */}
            <MDBox mt={1.5}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <MDBox mb={1.5}>
                    <ComplexStatisticsCard
                      color="primary"
                      icon="engineering"
                      title="Active Work Orders"
                      count={cards.activeWorkOrders || 0}
                      percentage={{
                        color: "primary",
                        amount: "",
                        label: "in production",
                      }}
                    />
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={6}>
                  <MDBox mb={1.5}>
                    <ComplexStatisticsCard
                      color="error"
                      icon="pending_actions"
                      title="Pending PO Requests"
                      count={cards.pendingPurchaseRequests || 0}
                      percentage={{
                        color: cards.pendingPurchaseRequests > 0 ? "error" : "success",
                        amount: cards.pendingPurchaseRequests > 0 ? "Action needed" : "",
                        label:
                          cards.pendingPurchaseRequests > 0
                            ? "requests awaiting review"
                            : "no pending requests",
                      }}
                    />
                  </MDBox>
                </Grid>
              </Grid>
            </MDBox>

            {/* Row 2: Charts */}
            <MDBox mt={4.5}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6} lg={4}>
                  <MDBox mb={3}>
                    <ReportsBarChart
                      color="info"
                      title="Monthly Sales"
                      description="Sales revenue last 6 months"
                      date="updated just now"
                      chart={charts.monthlySales || emptyChart}
                    />
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                  <MDBox mb={3}>
                    <ReportsLineChart
                      color="success"
                      title="Purchase Orders"
                      description="PO spending last 6 months"
                      date="updated just now"
                      chart={charts.monthlyPurchaseOrders || emptyChart}
                    />
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                  <MDBox mb={3}>
                    <ReportsLineChart
                      color="dark"
                      title="Inventory Activity"
                      description="Transactions last 6 months"
                      date="updated just now"
                      chart={charts.inventoryTransactions || emptyChart}
                    />
                  </MDBox>
                </Grid>
              </Grid>
            </MDBox>

            {/* Row 3: Bottom Section */}
            <MDBox>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6} lg={8}>
                  <RecentSalesOrders orders={stats?.recentSalesOrders || []} />
                </Grid>
                <Grid item xs={12} md={6} lg={4}>
                  <RecentActivityTimeline activities={stats?.recentActivity || []} />
                </Grid>
              </Grid>
            </MDBox>
          </>
        )}
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
