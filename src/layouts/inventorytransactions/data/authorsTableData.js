/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */
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

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDBadge from "components/MDBadge";

// Images
import team2 from "assets/images/team-2.jpg";
import team3 from "assets/images/team-3.jpg";
import team4 from "assets/images/team-4.jpg";
import laptop from "assets/images/surface_laptop.jpg";

// Packages
import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";

export default function data() {
  const [data, setData] = useState([]);
  const [detailedData, setDetailedData] = useState([]);

  useEffect(() => {
    const tableName = "ep_inventory_transactions";

    axios
      .get(`http://localhost:5000/inventorytransactions?table=${tableName}`)
      .then((response) => {
        setData(response.data);
        console.log("Data fetched successfully:", response.data);

        // Fetch additional details for each inventory trans
        const fetchDetails = response.data.map((inventory) => {
          return axios
            .get(
              `http://localhost:5000/inventorytransactiondetails?table=ep_inventory_transaction_details&inventory_transaction_id=${inventory.inventory_transaction_id}`
            )
            .then((res) => ({
              ...inventory,
              inventoryDetails: res.data, // Store extra details inside each item object
            }))
            .catch((error) => {
              console.error(
                `Error fetching details for inventory ${inventory.inventory_transaction_id}:`,
                error
              );
              return { ...inventory, inventoryDetails: [] }; // Fallback if request fails
            });
        });

        // Resolve all promises and update state
        Promise.all(fetchDetails).then((detailedInventory) => {
          setDetailedData(detailedInventory);
        });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const Author = ({ image, name, email }) => (
    <MDBox display="flex" alignItems="center" lineHeight={1}>
      {/* <MDAvatar src={image} name={name} size="sm" /> */}
      <MDBox ml={2} lineHeight={1}>
        <MDTypography display="block" variant="button" fontWeight="medium">
          {name}
        </MDTypography>
        <MDTypography variant="caption">{email}</MDTypography>
      </MDBox>
    </MDBox>
  );

  const Job = ({ title, description }) => (
    <MDBox lineHeight={1} textAlign="left">
      <MDTypography display="block" variant="caption" color="text" fontWeight="medium">
        {title}
      </MDTypography>
      <MDTypography variant="caption">{description}</MDTypography>
    </MDBox>
  );

  return {
    columns: [
      { Header: "Transaction ID", accessor: "author", align: "left" },
      {
        Header: (
          <>
            Item Code <br /> Item Name
          </>
        ),
        accessor: "item_info",
        align: "left",
      },
      {
        Header: (
          <>
            Supplier Name <br /> Purchase Order #
          </>
        ),
        accessor: "supplier_name",
        align: "left",
      },
      {
        Header: (
          <>
            Transaction Type <br /> Transaction Date
          </>
        ),
        accessor: "transaction_type",
        align: "left",
      },
      {
        Header: (
          <>
            In stock date <br />
          </>
        ),
        accessor: "instock_date",
        align: "center",
      },
      { Header: "In Stock By", accessor: "in_stock_by", align: "center" },
      { Header: "Total Received", accessor: "total_received", align: "center" },
    ],
    rows: detailedData.map((inventory) => ({
      author: <Author image="" name={inventory.trans_id || inventory.transaction_id} email="" />,
      item_info: (
        <Job title={inventory.item_code || "-"} description={inventory.item_name || "-"} />
      ),
      supplier_name: (
        <Job title={inventory.supplier_name || "-"} description={inventory.po_number || "-"} />
      ),
      transaction_type: (
        <Job
          title={inventory.transaction_type}
          description={moment(inventory.transaction_date).format("MM/DD/YYYY")}
        />
      ),
      in_stock_by: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {inventory.created_by_name || "-"}
        </MDTypography>
      ),
      instock_date: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {inventory.created_at ? moment(inventory.created_at).format("MM/DD/YYYY HH:mm") : "-"}
        </MDTypography>
      ),
      total_received: (
        <MDBox ml={-1}>
          <MDBadge
            badgeContent={
              inventory.quantity !== null ? String(Math.floor(inventory.quantity)) : "0"
            }
            color="success"
            variant="gradient"
            size="lg"
          />
        </MDBox>
      ),
    })),
  };
}
