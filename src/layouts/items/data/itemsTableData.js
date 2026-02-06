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

export default function data() {
  const [data, setData] = useState([]);
  useEffect(() => {
    // Fetch data from the backend
    const tableName = "ep_items";
    axios
      .get(`http://localhost:5000/items?table=${tableName}`)
      .then((response) => {
        setData(response.data);
        console.log("Data fetched successfully:", response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const Author = ({ name, cus_id }) => (
    <MDBox display="flex" alignItems="left" lineHeight={1}>
      <MDBox ml={2} lineHeight={1}>
        <MDTypography display="block" variant="button" fontWeight="medium">
          {name}
        </MDTypography>
        <MDTypography variant="caption">{cus_id}</MDTypography>
      </MDBox>
    </MDBox>
  );

  const Address = ({
    shipping_address,
    shipping_address_city,
    shipping_address_state,
    shipping_address_zip,
  }) => (
    <MDBox lineHeight={1} textAlign="left">
      <MDTypography display="block" variant="caption" color="text" fontWeight="medium">
        {shipping_address}
      </MDTypography>
      <MDTypography variant="caption">
        {shipping_address_city + " " + shipping_address_state + " " + shipping_address_zip}
      </MDTypography>
    </MDBox>
  );

  return {
    columns: [
      { Header: "item ID", accessor: "itemid", align: "left" },
      { Header: "item code", accessor: "item_code", align: "left" },
      { Header: "item name", accessor: "item_name", align: "left" },
      { Header: "part number", accessor: "part_number", align: "left" },
      { Header: "description", accessor: "description", align: "left" },
      { Header: "On Hand", accessor: "on_hand", align: "center" },
      { Header: "serial number", accessor: "serial_number", align: "left" },
      // { Header: "Document", accessor: "doc_link", align: "left" },
      // { Header: "in stock by", accessor: "instock_by", align: "center" },
      { Header: "action", accessor: "action", align: "center" },
    ],

    rows: data.map((item) => ({
      key: item.item_id,
      itemid: <Author name="" cus_id={item.item_id} />,
      item_code: (
        <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
          {item.item_code}
        </MDTypography>
      ),
      item_name: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {item.name}
        </MDTypography>
      ),
      part_number: (
        <MDTypography
          component="a"
          href={item.document_link}
          target="_blank"
          variant="caption"
          color="text"
          fontWeight="medium"
        >
          {item.part_number}
        </MDTypography>
      ),
      description: (
        <MDTypography rel="noopener noreferrer" variant="caption" color="text" fontWeight="medium">
          {item.description}
        </MDTypography>
      ),
      on_hand: (
        <MDBox ml={-1}>
          <MDBadge
            badgeContent={item.on_hand_quantity !== null ? String(item.on_hand_quantity) : "0"}
            color={item.on_hand_quantity === 0 ? "success" : "info"}
            variant="gradient"
            size="lg"
          />
        </MDBox>
      ),
      serial_number: (
        <MDTypography rel="noopener noreferrer" variant="caption" color="text" fontWeight="medium">
          {item.serial_number}
        </MDTypography>
      ),
      doc_link: (
        <MDTypography
          component="a"
          href={item.document_link}
          target="_blank"
          rel="noopener noreferrer"
          variant="caption"
          color="text"
          fontWeight="medium"
        >
          {item.document_link ? "LINK" : null}
        </MDTypography>
      ),
      instock_by: (
        <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
          {item.first_name + " " + item.last_name}
        </MDTypography>
      ),
      shipping_address: (
        <Address
          shipping_address={item.shipping_address}
          shipping_address_city={item.shipping_address_city}
          shipping_address_state={item.shipping_address_state}
          shipping_address_zip={item.shipping_address_zip}
        />
      ),
      action: (
        <MDBox ml={-1}>
          <MDBadge
            component="a"
            // href="/items/newitem"
            href={`/items/newitem/${item.item_id}`} // Pass ID in the URL
            badgeContent="Edit"
            color={"primary"}
            variant="gradient"
            size="sm"
          />
        </MDBox>
      ),
    })),
  };
}
