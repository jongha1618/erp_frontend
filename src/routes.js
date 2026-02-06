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

/** 
  All of the routes for the Material Dashboard 2 React are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that has other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/

// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import Items from "layouts/items";
import InventoryTransaction from "layouts/inventorytransactions";
import Inventory from "layouts/inventory";
import NewItem from "layouts/items/newitem";
import Customers from "layouts/customers";
import NewCustomer from "layouts/customers/newcustomer";
import Suppliers from "layouts/suppliers";
import NewSupplier from "layouts/suppliers/newsupplier";
import Tables from "layouts/tables";
import Sales from "layouts/sales";
import NewSale from "layouts/sales/newsale";
import PurchaseOrders from "layouts/purchaseorders";
import NewPurchaseOrder from "layouts/purchaseorders/newpurchaseorder";
import KitItems from "layouts/kititems";
import NewKitItem from "layouts/kititems/newkititem";
import RTL from "layouts/rtl";
import Notifications from "layouts/notifications";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
// import AssemblyItemIcon from "src/assets/images/icons/flags/assemblyitem.png";
import AssemblyItemIcon from "./assets/images/icons/flags/assemitem.png";
import ItempartIcon from "./assets/images/icons/itempart.png";
import SupplierIcon from "./assets/images/icons/flags/supplier.png";
import InventoryTransIcon from "./assets/images/icons/flags/inventorytrans.png";
import { Avatar } from "@mui/material";

// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "title",
    key: "devider",
  },
  // {
  //   type: "collapse",
  //   name: "Job List",
  //   key: "jobs",
  //   icon: <Icon fontSize="small">work</Icon>,
  //   route: "/items",
  //   component: <Items />,
  // },
  {
    type: "collapse",
    name: "Item (Part)",
    key: "items",
    // icon: <Icon fontSize="small">buildicon</Icon>,
    // icon: <Icon fontSize="small">handyman</Icon>,
    icon: <Avatar src={ItempartIcon} sx={{ width: 24, height: 24 }} />,
    route: "/items",
    component: <Items />,
  },
  {
    type: "route",
    name: "New Item", // This name is NOT used in the sidebar
    key: "new-items",
    route: "/items/newitem",
    component: <NewItem />,
  },
  {
    type: "route",
    name: "Edit Item",
    key: "edit-item",
    route: "/items/newitem/:item_id",
    component: <NewItem />,
  },
  {
    type: "collapse",
    name: "Supplier",
    key: "suppliers",
    icon: <Avatar src={SupplierIcon} sx={{ width: 24, height: 24 }} />,
    route: "/suppliers",
    component: <Suppliers />,
  },
  {
    type: "route",
    name: "New Supplier", // This name is NOT used in the sidebar
    key: "new-suppliers",
    route: "/suppliers/newsupplier",
    component: <NewSupplier />,
  },
  {
    type: "collapse",
    name: "Purchase Order",
    key: "purchaseorders",
    icon: <Icon fontSize="small">shopping_cart</Icon>,
    route: "/purchaseorders",
    component: <PurchaseOrders />,
  },
  {
    type: "route",
    name: "Edit Supplier",
    key: "edit-supplier",
    route: "/suppliers/newsupplier/:supplier_id",
    component: <NewSupplier />,
  },
  {
    type: "collapse",
    name: "Inventory",
    key: "inventory",
    icon: <Icon fontSize="small">inventory</Icon>,
    route: "/inventory",
    component: <Inventory />,
  },
  {
    type: "collapse",
    name: "Inventory Transaction",
    key: "inventory/transactions",
    icon: <Icon fontSize="small">swap_horiz</Icon>,
    route: "/inventory/transactions",
    component: <InventoryTransaction />,
  },
  {
    type: "collapse",
    name: "Kit Items",
    key: "kititems",
    icon: <Avatar src={AssemblyItemIcon} sx={{ width: 24, height: 24 }} />,
    route: "/kititems",
    component: <KitItems />,
  },
  {
    type: "route",
    name: "New Kit Item",
    key: "new-kititem",
    route: "/kititems/newkititem",
    component: <NewKitItem />,
  },
  {
    type: "route",
    name: "Edit Kit Item",
    key: "edit-kititem",
    route: "/kititems/newkititem/:kit_item_id",
    component: <NewKitItem />,
  },
  {
    type: "collapse",
    name: "Customer",
    key: "customers",
    icon: <Icon fontSize="small">people</Icon>,
    route: "/customers",
    component: <Customers />,
    // collapse: [
    //   {
    //     name: "New Customer",
    //     key: "new-customer",
    //     route: "/customers/newcustomer",
    //     component: <NewCustomer />,
    //   },
    // ],
  },
  {
    type: "route",
    name: "New Customer", // This name is NOT used in the sidebar
    key: "new-customers",
    route: "/customers/newcustomer",
    component: <NewCustomer />,
  },
  {
    type: "route",
    name: "Edit Customer",
    key: "edit-customer",
    route: "/customers/newcustomer/:customer_id",
    component: <NewCustomer />,
  },
  {
    type: "collapse",
    name: "Sales Order",
    key: "sales",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/sales",
    component: <Sales />,
  },
  {
    type: "route",
    name: "New Sales Order",
    key: "new-sale",
    route: "/sales/newsale",
    component: <NewSale />,
  },
  {
    type: "route",
    name: "Edit Sales Order",
    key: "edit-sale",
    route: "/sales/newsale/:sale_id",
    component: <NewSale />,
  },
  {
    type: "route",
    name: "New Purchase Order",
    key: "new-purchaseorder",
    route: "/purchaseorders/newpurchaseorder",
    component: <NewPurchaseOrder />,
  },
  {
    type: "route",
    name: "Edit Purchase Order",
    key: "edit-purchaseorder",
    route: "/purchaseorders/newpurchaseorder/:po_id",
    component: <NewPurchaseOrder />,
  },
  // {
  //   type: "collapse",
  //   name: "RTL",
  //   key: "rtl",
  //   icon: <Icon fontSize="small">format_textdirection_r_to_l</Icon>,
  //   route: "/rtl",
  //   component: <RTL />,
  // },
  {
    type: "collapse",
    name: "Quotation & Invoice",
    key: "notifications",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/notifications",
    component: <Notifications />,
  },
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
  },
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  {
    type: "collapse",
    name: "Sign Out",
    key: "sign-out",
    icon: <Icon fontSize="small">logout</Icon>,
    route: "/authentication/sign-out",
    component: <SignUp />,
  },
];

export default routes;
