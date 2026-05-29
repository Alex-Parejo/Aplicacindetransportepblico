import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { Routes } from "./pages/Routes";
import { MyTrip } from "./pages/MyTrip";
import { Profile } from "./pages/Profile";
import { RouteDetail } from "./pages/RouteDetail";
import { Stops } from "./pages/Stops";
import { Live } from "./pages/Live";
import { Layout } from "./components/Layout";

// Router configuration for BusSamario v1.0
export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "routes", Component: Routes },
      { path: "my-trip", Component: MyTrip },
      { path: "profile", Component: Profile },
      { path: "route/:routeId", Component: RouteDetail },
      { path: "stops", Component: Stops },
      { path: "live", Component: Live },
    ],
  },
]);