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

  const Author = ({ image, name, email }) => (
    <MDBox display="flex" alignItems="center" lineHeight={1}>
      <MDAvatar src={image} name={name} size="sm" />
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
      { Header: "item code (part number)", accessor: "author", width: "45%", align: "left" },
      { Header: "item name", accessor: "item_name", width: "45%", align: "left" },
      { Header: "description", accessor: "function", align: "left" },
      { Header: "document", accessor: "doc_link", align: "left" },
      { Header: "on hand", accessor: "status", align: "center" },
      { Header: "in stock date", accessor: "employed", align: "center" },
      { Header: "in stock by", accessor: "instock_by", align: "center" },
      { Header: "action", accessor: "action", align: "center" },
    ],

    rows: data.map((item) => ({
      author: <Author image={laptop} name={item.item_code} email={item.part_number} />,
      item_name: (
        <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
          {item.name}
        </MDTypography>
      ),
      function: <Job title={item.function} description={item.description} />,
      status: (
        <MDBox ml={-1}>
          <MDBadge
            badgeContent={item.instock_quantity !== null ? String(item.instock_quantity) : "0"}
            color={item.instock_quantity === 0 ? "success" : "danger"}
            variant="gradient"
            size="lg"
          />
        </MDBox>
      ),
      // cost: (
      //   <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
      //     {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.cost)}
      //   </MDTypography>
      // ),
      employed: (
        <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
          {item.in_stock_date}
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
      action: (
        // <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
        //   Edit
        // </MDTypography>
        <MDBox ml={-1}>
          <MDBadge
            component="a"
            href="#"
            badgeContent="Edit"
            color={"primary"}
            variant="gradient"
            size="sm"
          />
        </MDBox>
      ),
    })), // rows
  };
}
