import { createBrowserRouter } from "react-router-dom";
import { Root } from "../views/Root";
import { LandingPage } from "../views/LandingPage";
import { LoginPage } from "../views/LoginPage";
import { SignupPage } from "../views/SignupPage";
import { Dashboard } from "../views/Dashboard";
import { RestaurantDetail } from "../views/RestaurantDetail";
import { CategoryBrowse } from "../views/CategoryBrowse";
import { Checkout } from "../views/Checkout";
import { OrderCheckout } from "../views/OrderCheckout";
import { OrderTracking } from "../views/OrderTracking";
import { OrderHistory } from "../views/OrderHistory";
import { UserProfile } from "../views/UserProfile";
import { Reviews } from "../views/Reviews";
import { Restaurants } from "../views/Restaurants";
import { AdminLayout } from "../views/admin/AdminLayout";
import { AdminDashboard } from "../views/admin/AdminDashboard";
import { AdminOrders } from "../views/admin/AdminOrders";
import { AdminSalesReport } from "../views/admin/AdminSalesReport";
import { AdminRatings } from "../views/admin/AdminRatings";
import { AdminMenu } from "../views/admin/AdminMenu";
import { AdminAbout } from "../views/admin/AdminAbout";
import { SuperAdminLayout } from "../views/superadmin/SuperAdminLayout";
import { SuperAdminDashboard } from "../views/superadmin/SuperAdminDashboard";
import { SuperAdminRestaurants } from "../views/superadmin/SuperAdminRestaurants";
import { SuperAdminUsers } from "../views/superadmin/SuperAdminUsers";
import { RequireLogin, RequireRole } from "../components/RouteGuards";
import { RoleLoginPage } from "../views/RoleLoginPage";
import { NotFoundPage, RouteErrorPage } from "../views/RouteErrorPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    errorElement: <RouteErrorPage homePath="/" />,
    children: [
      { index: true, Component: LandingPage },
      { path: "login", Component: LoginPage },
      { path: "signup", Component: SignupPage },
      { path: "dashboard", Component: Dashboard },
      { path: "restaurants", Component: Restaurants },
      { path: "restaurant/:id", Component: RestaurantDetail },
      { path: "category/:category", Component: CategoryBrowse },
      {
        Component: RequireLogin,
        children: [
          { path: "basket", Component: Checkout },
          { path: "checkout", Component: Checkout },
          { path: "order-checkout", Component: OrderCheckout },
          { path: "orders", Component: OrderHistory },
          { path: "order/:id", Component: OrderTracking },
          { path: "reviews", Component: Reviews },
          { path: "profile", Component: UserProfile },
        ],
      },
      { path: "*", element: <NotFoundPage homePath="/" /> },
    ],
  },
  { path: "/admin", element: <RoleLoginPage role="restaurant_admin" /> },
  {
    element: <RequireRole role="restaurant_admin" loginPath="/admin" />,
    children: [
      {
        path: "/admin",
        Component: AdminLayout,
        errorElement: <RouteErrorPage homePath="/admin/dashboard" />,
        children: [
          { path: "dashboard", Component: AdminDashboard },
          { path: "orders", Component: AdminOrders },
          { path: "sales-report", Component: AdminSalesReport },
          { path: "ratings", Component: AdminRatings },
          { path: "menu", Component: AdminMenu },
          { path: "about", Component: AdminAbout },
          { path: "profile", Component: UserProfile },
          { path: "*", element: <NotFoundPage homePath="/admin/dashboard" title="Admin page not found" /> },
        ],
      },
    ],
  },
  { path: "/superadmin", element: <RoleLoginPage role="super_admin" /> },
  {
    element: <RequireRole role="super_admin" loginPath="/superadmin" />,
    children: [
      {
        path: "/superadmin",
        Component: SuperAdminLayout,
        errorElement: <RouteErrorPage homePath="/superadmin/dashboard" />,
        children: [
          { path: "dashboard", Component: SuperAdminDashboard },
          { path: "restaurants", Component: SuperAdminRestaurants },
          { path: "users", Component: SuperAdminUsers },
          { path: "profile", Component: UserProfile },
          { path: "*", element: <NotFoundPage homePath="/superadmin/dashboard" title="Admin page not found" /> },
        ],
      },
    ],
  },
]);
