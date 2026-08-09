import {
  Route,
  Routes,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";

import HomePage from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";
import EventPage from "./pages/EventPage";
import BookingPage from "./pages/BookingPage";
import IdeasPage from "./pages/IdeasPage";
import ConsultaPage from "./pages/ConsultaPage";

import OwnerLoginPage from "./pages/OwnerLoginPage";
import OwnerPage from "./pages/OwnerPage";
import OwnerEventsPage from "./pages/OwnerEventsPage";
import OwnerEventFormPage from "./pages/OwnerEventFormPage";
import OwnerEventPhotosPage from "./pages/OwnerEventPhotosPage";
import OwnerBookingsPage from "./pages/OwnerBookingsPage";
import OwnerCourtBlockPage from "./pages/OwnerCourtBlockPage";
import OwnerIdeasPage from "./pages/OwnerIdeasPage";
import OwnerPhotosPage from "./pages/OwnerPhotosPage";

function PublicLayout() {
  return (
    <>
      <ScrollToTop />
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/eventi"
          element={<EventsPage />}
        />

        <Route
          path="/eventi/:id"
          element={<EventPage />}
        />

        <Route
          path="/prenota"
          element={<BookingPage />}
        />

        <Route
          path="/idee"
          element={<IdeasPage />}
        />

        <Route
          path="/consulta"
          element={<ConsultaPage />}
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route
        path="/owner/login"
        element={<OwnerLoginPage />}
      />

      <Route
        path="/owner"
        element={<OwnerPage />}
      />

      <Route
        path="/owner/eventi"
        element={<OwnerEventsPage />}
      />

      <Route
        path="/owner/eventi/nuovo"
        element={<OwnerEventFormPage />}
      />

      <Route
        path="/owner/eventi/:id"
        element={<OwnerEventFormPage />}
      />

      <Route
        path="/owner/eventi/:id/foto"
        element={<OwnerEventPhotosPage />}
      />

      <Route
        path="/owner/prenotazioni"
        element={<OwnerBookingsPage />}
      />

      <Route
        path="/owner/prenotazioni/blocca"
        element={<OwnerCourtBlockPage />}
      />

      <Route
        path="/owner/idee"
        element={<OwnerIdeasPage />}
      />

      <Route
        path="/owner/foto"
        element={<OwnerPhotosPage />}
      />

      <Route
        path="/*"
        element={<PublicLayout />}
      />
    </Routes>
  );
}

export default App;