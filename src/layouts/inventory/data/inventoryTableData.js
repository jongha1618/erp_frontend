/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";

import React, { useEffect, useState } from "react";
import axios from "axios";

export default function data() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/inventories")
      .then((response) => {
        setData(response.data);
        console.log("Inventory data fetched successfully:", response.data);
      })
      .catch((error) => {
        console.error("Error fetching inventory data:", error);
      });
  }, []);

  return {
    columns: [
      { Header: "ID", accessor: "inventory_id", align: "center" },
      { Header: "Item Code", accessor: "item_code", align: "left" },
      { Header: "Item Name", accessor: "item_name", align: "left" },
      { Header: "Batch #", accessor: "batch_number", align: "left" },
      { Header: "Quantity", accessor: "quantity", align: "center" },
      { Header: "Location", accessor: "location", align: "left" },
      { Header: "Expiry Date", accessor: "expiry_date", align: "center" },
      { Header: "Last Updated", accessor: "updated_at", align: "center" },
    ],

    rows: data.map((item) => ({
      key: item.inventory_id,
      inventory_id: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {item.inventory_id}
        </MDTypography>
      ),
      item_code: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {item.item_code}
        </MDTypography>
      ),
      item_name: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {item.item_name}
        </MDTypography>
      ),
      batch_number: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {item.batch_number || "-"}
        </MDTypography>
      ),
      quantity: (
        <MDBox ml={-1}>
          <MDBadge
            badgeContent={item.quantity !== null ? String(item.quantity) : "0"}
            color={item.quantity > 0 ? "success" : "error"}
            variant="gradient"
            size="lg"
          />
        </MDBox>
      ),
      location: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {item.location || "-"}
        </MDTypography>
      ),
      expiry_date: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : "-"}
        </MDTypography>
      ),
      updated_at: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : "-"}
        </MDTypography>
      ),
    })),
  };
}
