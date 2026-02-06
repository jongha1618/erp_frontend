import { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";
import { Link } from "react-router-dom";

const Author = ({ name, sup_id }) => (
  <MDBox display="flex" alignItems="left" lineHeight={1}>
    <MDBox ml={2} lineHeight={1}>
      <MDTypography display="block" variant="button" fontWeight="medium">
        {name}
      </MDTypography>
      <MDTypography variant="caption">{sup_id}</MDTypography>
    </MDBox>
  </MDBox>
);

Author.propTypes = {
  name: PropTypes.string,
  sup_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

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
      {shipping_address_city} {shipping_address_state} {shipping_address_zip}
    </MDTypography>
  </MDBox>
);

Address.propTypes = {
  shipping_address: PropTypes.string,
  shipping_address_city: PropTypes.string,
  shipping_address_state: PropTypes.string,
  shipping_address_zip: PropTypes.string,
};

// ✅ Convert into a custom hook
export function useSuppliersTableData() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const tableName = "ep_suppliers";
    axios
      .get(`http://localhost:5000/suppliers?table=${tableName}`)
      .then((response) => {
        setData(response.data);
        console.log("Data fetched successfully:", response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  return {
    columns: [
      { Header: "Supplier ID", accessor: "supplierid", align: "left" },
      { Header: "Company Name", accessor: "company_name", align: "left" },
      { Header: "Contact Name", accessor: "contact_name", align: "left" },
      { Header: "Contact Email", accessor: "contact_email", align: "left" },
      { Header: "Contact Phone", accessor: "contact_phone", align: "left" },
      { Header: "Shipping Address", accessor: "shipping_address", align: "left" },
      { Header: "Action", accessor: "action", align: "center" },
    ],
    rows: data.map((supplier) => ({
      key: supplier.supplier_id,
      supplierid: <Author name="" sup_id={supplier.supplier_id} />,
      company_name: (
        <MDTypography
          component="a"
          // TODO: Show sales history? instead of editing.
          href={`/suppliers/newsupplier/${supplier.supplier_id}`}
          variant="caption"
          color="text"
          fontWeight="medium"
        >
          {supplier.company_name}
        </MDTypography>
      ),
      contact_name: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {supplier.contact_name}
        </MDTypography>
      ),
      contact_email: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {supplier.contact_email}
        </MDTypography>
      ),
      contact_phone: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {supplier.contact_phone}
        </MDTypography>
      ),
      shipping_address: (
        <Address
          shipping_address={supplier.shipping_address}
          shipping_address_city={supplier.shipping_address_city}
          shipping_address_state={supplier.shipping_address_state}
          shipping_address_zip={supplier.shipping_address_zip}
        />
      ),
      action: (
        <MDBox ml={-1}>
          <Link
            to={`/suppliers/newsupplier/${supplier.supplier_id}`}
            style={{ textDecoration: "none" }}
          >
            <MDBadge badgeContent="Edit" color={"primary"} variant="gradient" size="sm" />
          </Link>
        </MDBox>
      ),
    })),
  };
}
