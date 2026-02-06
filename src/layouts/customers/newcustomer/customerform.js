import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import axios from "axios";

function CustomerForm() {
  const { customerid: paramCustomerID } = useParams();

  // State for form inputs
  const [customer, setCustomer] = useState({
    company_name: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    billing_contact_name: "",
    billing_address: "",
    billing_phone: "",
    billing_address_city: "",
    billing_address_state: "",
    billing_address_zip: "",
    shipping_contact_name: "",
    shipping_address: "",
    shipping_phone: "",
    shipping_address_city: "",
    shipping_address_state: "",
    shipping_address_zip: "",
    active: true,
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(false); // For success alert
  const navigate = useNavigate(); // Initialize navigate
  const { customer_id } = useParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (customer_id) {
      axios
        .get(`http://localhost:5000/customers/${customer_id}`)
        .then((response) => {
          const sanitizedData = {
            ...customer, // Ensures all keys exist
            ...response.data, // Overwrite with response data
          };
          // Replace undefined/null values with empty strings
          Object.keys(sanitizedData).forEach((key) => {
            if (sanitizedData[key] == null) sanitizedData[key] = "";
          });

          setCustomer(sanitizedData);
        })
        .catch((error) => console.error("Error fetching customer:", error));
    }
  }, [customer_id]);

  // Handle input change
  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    // Check if any field is empty
    let newErrors = {};
    if (!customer.company_name) newErrors.company_name = "Company Name is required";
    if (!customer.contact_name) newErrors.contact_name = "Contact Name is required";
    if (!customer.contact_email) newErrors.contact_email = "Contact Email is required";
    if (!customer.contact_phone) newErrors.contact_phone = "Contact Phone is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      if (customer_id) {
        // Update existing customer
        await axios.put(`http://localhost:5000/customers/${customer_id}`, customer);
      } else {
        // Create new customer
        await axios.post("http://localhost:5000/customers", customer);
      }

      setSuccessMessage(true);
      setTimeout(() => {
        navigate("/customers"); // Redirect after saving
      }, 2000);
    } catch (error) {
      console.error("Error saving customer:", error);
    }
  };

  return (
    <Card>
      <br />
      <MDBox
        mx={2}
        mt={-3}
        py={3}
        px={2}
        variant="gradient"
        bgColor="info"
        borderRadius="lg"
        coloredShadow="info"
      >
        <MDTypography variant="h6" color="white">
          Customer Information
        </MDTypography>
      </MDBox>
      <MDBox p={3} component="form" onSubmit={handleSubmit}>
        <MDTypography variant="h5" fontWeight="bold" color="info" mt={2} mb={1}>
          General Information *
        </MDTypography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <MDInput
              type="text"
              label="Company Name"
              name="company_name"
              value={customer.company_name || ""}
              onChange={handleChange}
              fullWidth
              required
              error={Boolean(errors.company_name)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDInput
              type="text"
              label="Contact Name"
              name="contact_name"
              value={customer.contact_name || ""}
              onChange={handleChange}
              fullWidth
              required
              error={Boolean(errors.contact_name)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDInput
              type="email"
              label="Contact Email"
              name="contact_email"
              value={customer.contact_email || ""}
              onChange={handleChange}
              fullWidth
              required
              error={Boolean(errors.contact_email)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDInput
              type="text"
              label="Contact Phone"
              name="contact_phone"
              value={customer.contact_phone || ""}
              onChange={handleChange}
              fullWidth
              required
              error={Boolean(errors.contact_phone)}
            />
          </Grid>
        </Grid>
        {/* Billing Information */}
        <MDTypography variant="h5" fontWeight="bold" color="info" mt={4} mb={1}>
          Billing Information
        </MDTypography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <MDInput
              type="text"
              label="Billing Contact Name"
              name="billing_contact_name"
              value={customer.billing_contact_name || ""}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDInput
              type="text"
              label="Billing Phone"
              name="billing_phone"
              value={customer.billing_phone || ""}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <MDInput
              type="text"
              label="Billing Address"
              name="billing_address"
              value={customer.billing_address || ""}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDInput
              type="text"
              label="Billing City"
              name="billing_address_city"
              value={customer.billing_address_city || ""}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDInput
              type="text"
              label="Billing State"
              name="billing_address_state"
              value={customer.billing_address_state || ""}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDInput
              type="text"
              label="Billing Zip"
              name="billing_address_zip"
              value={customer.billing_address_zip || ""}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
        </Grid>
        {/* Shipping Information */}
        <MDTypography variant="h5" fontWeight="bold" color="info" mt={4} mb={1}>
          Shipping Information
        </MDTypography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <MDInput
              type="text"
              label="Shipping Contact Name"
              name="shipping_contact_name"
              value={customer.shipping_contact_name || ""}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDInput
              type="text"
              label="Shipping Phone"
              name="shipping_phone"
              value={customer.shipping_phone || ""}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <MDInput
              type="text"
              label="Shipping Address"
              name="shipping_address"
              value={customer.shipping_address || ""}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDInput
              type="text"
              label="Shipping City"
              name="shipping_address_city"
              value={customer.shipping_address_city || ""}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDInput
              type="text"
              label="Shipping State"
              name="shipping_address_state"
              value={customer.shipping_address_state || ""}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDInput
              type="text"
              label="Shipping Zip"
              name="shipping_address_zip"
              value={customer.shipping_address_zip || ""}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
        </Grid>
        {/* Save Button */}
        <Stack direction="row" spacing={2} mt={3}>
          <Button
            type="submit"
            variant="contained"
            sx={{ color: "#ffffff", backgroundColor: "green" }}
            disabled={isLoading}
          >
            {customer_id == undefined ? "Save" : "Update"}
          </Button>
        </Stack>
        {/* Success Alert */}
        <Snackbar
          open={successMessage}
          autoHideDuration={4000}
          onClose={() => setSuccessMessage(false)}
        >
          <Alert onClose={() => setSuccessMessage(false)} severity="success">
            Customer information saved successfully!
          </Alert>
        </Snackbar>
      </MDBox>
    </Card>
  );
}

export default CustomerForm;
