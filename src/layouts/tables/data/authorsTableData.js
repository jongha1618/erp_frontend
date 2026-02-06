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
    const tableName = "ep_inventories";

    axios
      .get(`http://localhost:5000/ep_inventories?table=${tableName}`)
      .then((response) => {
        setData(response.data);
        console.log("Data fetched successfully:", response.data);

        // Fetch additional details for each item
        const fetchDetails = response.data.map((item) => {
          return axios
            .get(
              `http://localhost:5000/sales_details?table=ep_item_details&item_id=${item.item_id}`
            )
            .then((res) => ({
              ...item,
              salesDetails: res.data, // Store extra details inside each item object
            }))
            .catch((error) => {
              console.error(`Error fetching details for item ${item.item_id}:`, error);
              return { ...item, salesDetails: [] }; // Fallback if request fails
            });
        });

        // Resolve all promises and update state
        Promise.all(fetchDetails).then((detailedItems) => {
          setDetailedData(detailedItems);
        });
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
      // { Header: "Item Code / Part Number", accessor: "author", width: "45%", align: "left" },
      {
        Header: (
          <>
            item code <br /> part number
          </>
        ),
        accessor: "author",
        width: "45%",
        align: "left",
      },
      // { Header: "Item Name / Customer Name", accessor: "item_name", width: "45%", align: "left" },
      {
        Header: (
          <>
            item name <br /> customer name
          </>
        ),
        accessor: "item_name",
        width: "45%",
        align: "left",
      },
      // { Header: "Description / Instrument", accessor: "function", align: "left" },
      {
        Header: (
          <>
            description <br /> instrument
          </>
        ),
        accessor: "function",
        align: "left",
      },
      { Header: "Document", accessor: "doc_link", align: "left" },
      { Header: "On Hand", accessor: "status", align: "center" },
      // { Header: "In Stock Date", accessor: "employed", align: "center" },
      {
        Header: (
          <>
            in stock date <br /> shipped date
          </>
        ),
        accessor: "employed",
        align: "center",
      },
      { Header: "In Stock By", accessor: "instock_by", align: "center" },
      { Header: "Action", accessor: "action", align: "center" },
    ],
    rows: detailedData.flatMap((item) => {
      const mainRow = {
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
              color={item.instock_quantity === 0 ? "success" : "info"}
              variant="gradient"
              size="lg"
            />
          </MDBox>
        ),
        employed: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            {moment(item.in_stock_date).format("MM/DD/YYYY HH:mm:ss")}
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
          <MDBox ml={-1}>
            <MDBadge
              component="a"
              href="#"
              badgeContent="Edit"
              color="primary"
              variant="gradient"
              size="sm"
            />
          </MDBox>
        ),
      };

      // Add extra rows based on `salesDetails`
      const extraRows = item.salesDetails.map((sale) => ({
        // author: <Author image={laptop} name={`Sale ID: ${sale.sale_id}`} email={sale.sale_date} />,
        item_name: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="bold">
            {sale.sold_to}
          </MDTypography>
        ),
        function: (
          <Job
            title={sale.sale_type}
            description={sale.instrument_name ? <strong>{sale.instrument_name}</strong> : "N/A"}
          />
        ),
        status: (
          <MDBadge
            badgeContent={sale.quantity}
            color={sale.quantity > 0 ? "success" : "error"}
            variant="gradient"
            size="lg"
          />
        ),
        employed: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            {moment(sale.transaction_date).format("MM/DD/YYYY HH:mm:ss")}
          </MDTypography>
        ),
        instock_by: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            {sale.seller_name}
          </MDTypography>
        ),
        action: (
          <MDBox ml={-1}>
            <MDBadge
              component="a"
              href="#"
              badgeContent="View"
              color="info"
              variant="gradient"
              size="sm"
            />
          </MDBox>
        ),
      }));

      // // Adding the border row after extra rows
      // const borderRow = {
      //   item_name: (
      //     <MDBox
      //       sx={{
      //         borderBottom: "2px solid rgb(0, 0, 0)",
      //         paddingBottom: "8px",
      //         width: "100%",
      //       }}
      //     />
      //   ),
      //   function: (
      //     <MDBox
      //       sx={{
      //         borderBottom: "2px solid rgb(0, 0, 0)",
      //         paddingBottom: "8px",
      //         width: "100%",
      //       }}
      //     />
      //   ),
      //   status: (
      //     <MDBox
      //       sx={{
      //         borderBottom: "2px solid rgb(0, 0, 0)",
      //         paddingBottom: "8px",
      //         width: "100%",
      //       }}
      //     />
      //   ),
      //   employed: (
      //     <MDBox
      //       sx={{
      //         borderBottom: "2px solid rgb(0, 0, 0)",
      //         paddingBottom: "8px",
      //         width: "100%",
      //       }}
      //     />
      //   ),
      //   instock_by: (
      //     <MDBox
      //       sx={{
      //         borderBottom: "2px solid rgb(0, 0, 0)",
      //         paddingBottom: "8px",
      //         width: "100%",
      //       }}
      //     />
      //   ),
      //   action: (
      //     <MDBox
      //       sx={{
      //         borderBottom: "2px solid rgb(0, 0, 0)",
      //         paddingBottom: "8px",
      //         width: "100%",
      //       }}
      //     />
      //   ),
      // };
      return [mainRow, ...extraRows]; // Add border row after all extra rows
      // return [mainRow, ...extraRows];
    }),
  };
}
