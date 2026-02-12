import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import BomForm from "./bomform";

function NewBom() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <BomForm />
      <Footer />
    </DashboardLayout>
  );
}

export default NewBom;
