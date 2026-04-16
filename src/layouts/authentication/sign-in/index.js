import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Hide the sidenav on the login page
import { useMaterialUIController, setLayout } from "context";

// @mui material components
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Auth context
import { useAuth } from "context/AuthContext";

// n6tec logo
import logo from "assets/images/logo-ct-dark.png";

function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [, dispatch] = useMaterialUIController();

  // Hide sidenav on the sign-in page
  useEffect(() => {
    setLayout(dispatch, "page");
  }, [dispatch]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MDBox
      sx={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000",
      }}
    >
      {/* Background video */}
      <MDBox
        component="video"
        autoPlay
        muted
        loop
        playsInline
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.45,
          zIndex: 0,
        }}
      >
        <source src="/assets/bg-video-2.mp4" type="video/mp4" />
      </MDBox>

      {/* Dark overlay */}
      <MDBox
        sx={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(10,10,30,0.70) 100%)",
          zIndex: 1,
        }}
      />

      {/* Login card */}
      <MDBox
        sx={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 400,
          px: 2,
        }}
      >
        {/* Logo + title above card */}
        <MDBox display="flex" flexDirection="column" alignItems="center" mb={3}>
          <MDBox
            component="img"
            src={logo}
            alt="n6tec"
            sx={{ width: 72, height: 72, objectFit: "contain", mb: 1.5 }}
          />
          <MDTypography
            variant="h4"
            fontWeight="bold"
            sx={{ color: "#fff", letterSpacing: 1 }}
          >
            n6tec ERP
          </MDTypography>
          <MDTypography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mt: 0.5 }}>
            Inventory Management System
          </MDTypography>
        </MDBox>

        <Card
          sx={{
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          <MDBox px={4} py={4}>
            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: "8px" }}>
                {error}
              </Alert>
            )}

            <MDBox component="form" onSubmit={handleSubmit}>
              <MDBox mb={2}>
                <MDInput
                  type="text"
                  label="Username"
                  fullWidth
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  InputLabelProps={{ style: { color: "rgba(255,255,255,0.7)" } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "#fff",
                      "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.6)" },
                      "&.Mui-focused fieldset": { borderColor: "#4fc3f7" },
                    },
                  }}
                />
              </MDBox>

              <MDBox mb={3}>
                <MDInput
                  type="password"
                  label="Password"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  InputLabelProps={{ style: { color: "rgba(255,255,255,0.7)" } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "#fff",
                      "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.6)" },
                      "&.Mui-focused fieldset": { borderColor: "#4fc3f7" },
                    },
                  }}
                />
              </MDBox>

              <MDButton
                type="submit"
                fullWidth
                disabled={loading}
                sx={{
                  py: 1.4,
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "0.95rem",
                  letterSpacing: 1,
                  "&:hover": {
                    background: "linear-gradient(135deg, #1565c0 0%, #0a3880 100%)",
                  },
                  "&:disabled": {
                    opacity: 0.7,
                    color: "#fff",
                  },
                }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : "Sign In"}
              </MDButton>
            </MDBox>
          </MDBox>
        </Card>

        <MDBox textAlign="center" mt={2.5}>
          <MDTypography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
            © {new Date().getFullYear()} n6tec. All rights reserved.
          </MDTypography>
        </MDBox>
      </MDBox>
    </MDBox>
  );
}

export default SignIn;
