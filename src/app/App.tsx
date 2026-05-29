import { RouterProvider } from "react-router";
import { router } from "./routes";
import { TripProvider } from "./context/TripContext";

// BusSamario - Sistema de información de transporte público de Santa Marta
// Version: 2.1 - Dynamic trip state
export default function App() {
  return (
    <TripProvider>
      <RouterProvider router={router} />
    </TripProvider>
  );
}