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

// @mui material components
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDProgress from "components/MDProgress";
import MDBadge from "components/MDBadge";

// Images
import LogoAsana from "assets/images/small-logos/logo-asana.svg";
import logoGithub from "assets/images/small-logos/github.svg";
import logoAtlassian from "assets/images/small-logos/logo-atlassian.svg";
import logoSlack from "assets/images/small-logos/logo-slack.svg";
import logoSpotify from "assets/images/small-logos/logo-spotify.svg";
import logoInvesion from "assets/images/small-logos/logo-invision.svg";
import laptop from "assets/images/surface_laptop.jpg";

// Packages
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function data() {
  const [data, setData] = useState([]);
  useEffect(() => {
    // Fetch data from the backend
    const tableName = "ep_item_details";

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
  const Project = ({ image, name }) => (
    <MDBox display="flex" alignItems="center" lineHeight={1}>
      <MDAvatar src={image} name={name} size="sm" variant="rounded" />
      <MDTypography display="block" variant="button" fontWeight="medium" ml={1} lineHeight={1}>
        {name}
      </MDTypography>
    </MDBox>
  );

  const Progress = ({ color, value }) => (
    <MDBox display="flex" alignItems="center">
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {value}%
      </MDTypography>
      <MDBox ml={0.5} width="9rem">
        <MDProgress variant="gradient" color={color} value={value} />
      </MDBox>
    </MDBox>
  );

  return {
    columns: [
      { Header: "item code", accessor: "project", width: "30%", align: "left" },
      { Header: "ship to", accessor: "ship_to", align: "left" },
      { Header: "instrument", accessor: "instrument", align: "center" },
      { Header: "ship qty", accessor: "ship_qty", align: "center" },
      { Header: "ship date", accessor: "ship_date", align: "center" },
    ],
    rows: data.map((item) => ({
      key: item.item_id,
      project: <Project image={laptop} name={item.item_code} />,
      ship_to: (
        <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
          {item.sold_to}
        </MDTypography>
      ),
      ship_qty: (
        <MDBox ml={-1}>
          <MDBadge badgeContent={-item.quantity} color={"primary"} variant="gradient" size="lg" />
        </MDBox>
      ),
      instrument: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {item.instrument_name}
        </MDTypography>
      ),
      ship_date: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {new Intl.DateTimeFormat("en-US", {
            month: "numeric",
            day: "numeric",
            year: "numeric",
          }).format(new Date(item.updated_date))}
        </MDTypography>
      ),
    })),
  };
}
