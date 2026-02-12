import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import WorkOrderForm from "./workorderform";

function NewWorkOrder() {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <WorkOrderForm />
      <Footer />
    </DashboardLayout>
  );
}

export default NewWorkOrder;
