/* eslint-disable react/prop-types */
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";

const statusColor = {
  draft: "secondary",
  confirmed: "info",
  shipped: "warning",
  delivered: "success",
  cancelled: "error",
};

function RecentSalesOrders({ orders = [] }) {
  return (
    <Card>
      <MDBox pt={3} px={3}>
        <MDTypography variant="h6" fontWeight="medium">
          Recent Sales Orders
        </MDTypography>
      </MDBox>
      <MDBox pt={1} pb={2}>
        <TableContainer sx={{ boxShadow: "none" }}>
          <Table>
            <TableHead sx={{ display: "table-header-group" }}>
              <TableRow>
                <TableCell>
                  <MDTypography variant="caption" fontWeight="bold" color="secondary">
                    ORDER #
                  </MDTypography>
                </TableCell>
                <TableCell>
                  <MDTypography variant="caption" fontWeight="bold" color="secondary">
                    CUSTOMER
                  </MDTypography>
                </TableCell>
                <TableCell align="center">
                  <MDTypography variant="caption" fontWeight="bold" color="secondary">
                    DATE
                  </MDTypography>
                </TableCell>
                <TableCell align="center">
                  <MDTypography variant="caption" fontWeight="bold" color="secondary">
                    AMOUNT
                  </MDTypography>
                </TableCell>
                <TableCell align="center">
                  <MDTypography variant="caption" fontWeight="bold" color="secondary">
                    ITEMS
                  </MDTypography>
                </TableCell>
                <TableCell align="center">
                  <MDTypography variant="caption" fontWeight="bold" color="secondary">
                    STATUS
                  </MDTypography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <MDTypography variant="caption" color="text">
                      No sales orders yet
                    </MDTypography>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.sale_id}>
                    <TableCell>
                      <MDTypography variant="caption" fontWeight="medium" color="text">
                        {order.sales_number}
                      </MDTypography>
                    </TableCell>
                    <TableCell>
                      <MDTypography variant="caption" fontWeight="medium" color="text">
                        {order.company_name || "-"}
                      </MDTypography>
                    </TableCell>
                    <TableCell align="center">
                      <MDTypography variant="caption" color="text">
                        {order.order_date
                          ? new Date(order.order_date).toLocaleDateString("ko-KR")
                          : "-"}
                      </MDTypography>
                    </TableCell>
                    <TableCell align="center">
                      <MDTypography variant="caption" fontWeight="medium" color="text">
                        ${Number(order.total_amount || 0).toLocaleString()}
                      </MDTypography>
                    </TableCell>
                    <TableCell align="center">
                      <MDTypography variant="caption" color="text">
                        {order.item_count}
                      </MDTypography>
                    </TableCell>
                    <TableCell align="center">
                      <MDBadge
                        badgeContent={order.status}
                        color={statusColor[order.status] || "secondary"}
                        variant="gradient"
                        size="sm"
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </MDBox>
    </Card>
  );
}

export default RecentSalesOrders;
