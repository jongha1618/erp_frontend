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

function ItemForm() {
  const { itemid: paramItemID } = useParams();

  // State for form inputs
  const [item, setItem] = useState({
    item_code: "",
    name: "",
    part_number: "",
    description: "",
    serial_number: "",
    // instock_quantity: "",
    cost_price: "",
    sales_price: "",
    document_link: "",
    created_by: "",
    active: true,
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(false); // For success alert
  const navigate = useNavigate(); // Initialize navigate
  const { item_id } = useParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (item_id) {
      axios
        .get(`http://localhost:5000/items/${item_id}`)
        .then((response) => {
          const sanitizedData = {
            ...item, // Ensures all keys exist
            ...response.data, // Overwrite with response data
          };
          // Replace undefined/null values with empty strings
          Object.keys(sanitizedData).forEach((key) => {
            if (sanitizedData[key] == null) sanitizedData[key] = "";
          });

          setItem(sanitizedData);
        })
        .catch((error) => console.error("Error fetching item:", error));
    }
  }, [item_id]);

  // Handle input change
  const handleChange = (e) => {
    setItem({ ...item, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    // Check if any field is empty
    let newErrors = {};
    if (!item.item_code) newErrors.item_code = "Item Code is required";
    if (!item.name) newErrors.name = "Item Name is required";
    if (!item.description) newErrors.description = "Description is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      if (item_id) {
        // Update existing item
        await axios.put(`http://localhost:5000/items/${item_id}`, item);
      } else {
        // Create new item
        await axios.post("http://localhost:5000/items", item);
      }

      setSuccessMessage(true);
      setTimeout(() => {
        navigate("/items"); // Redirect after saving
      }, 2000);
    } catch (error) {
      console.error("Error saving item:", error);
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
          Item Information
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
              label="Item Code"
              name="item_code"
              value={item.item_code || ""}
              onChange={handleChange}
              fullWidth
              required
              error={Boolean(errors.item_code)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDInput
              type="text"
              label="Name"
              name="name"
              value={item.name || ""}
              onChange={handleChange}
              fullWidth
              required
              error={Boolean(errors.name)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDInput
              type="text"
              label="Part Number"
              name="part_number"
              value={item.part_number || ""}
              onChange={handleChange}
              fullWidth
              required
              error={Boolean(errors.part_number)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDInput
              type="text"
              label="Description"
              name="description"
              value={item.description || ""}
              onChange={handleChange}
              fullWidth
              required
              error={Boolean(errors.description)}
            />
          </Grid>
        </Grid>
        {/* Pricing Information */}
        <MDTypography variant="h5" fontWeight="bold" color="info" mt={4} mb={1}>
          Pricing Information
        </MDTypography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <MDInput
              type="number"
              label="Cost Price"
              name="cost_price"
              value={item.cost_price ?? ""}
              onChange={handleChange}
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDInput
              type="number"
              label="Sales Price"
              name="sales_price"
              value={item.sales_price ?? ""}
              onChange={handleChange}
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>
        </Grid>
        {/* Extra Information */}
        <MDTypography variant="h5" fontWeight="bold" color="info" mt={4} mb={1}>
          Extra Information
        </MDTypography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <MDInput
              type="text"
              label="Serial Number"
              name="serial_number"
              value={item.serial_number || ""}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDInput
              type="text"
              label="Document Link"
              name="document_link"
              value={item.document_link || ""}
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
            {item_id == undefined ? "Save" : "Update"}
          </Button>
        </Stack>
        {/* Success Alert */}
        <Snackbar
          open={successMessage}
          autoHideDuration={4000}
          onClose={() => setSuccessMessage(false)}
        >
          <Alert onClose={() => setSuccessMessage(false)} severity="success">
            Item information saved successfully!
          </Alert>
        </Snackbar>
      </MDBox>
    </Card>
  );
}

export default ItemForm;
