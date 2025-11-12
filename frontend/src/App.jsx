import { useState, useEffect } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router";
import { onAuthStateChanged } from "firebase/auth";
import "./App.css";
import ObjectDetection from "./ObjectDetection";
import Test from "./Test";
import Login from "./User/Login";
import Registration from "./User/Registration";
import ForgotPassword from "./User/ForgotPassword";
import LoginHistory from "./User/LoginHistory";
import AccountSettings from "./User/AccountSettings";
import VerifyMfaPage from "./User/VerifyMfaPage";
import Home from "./Home";
import WireframeTemplate from "./WireframeTemplate";
import GeneratedUI from "./GeneratedUI";
import Navbar from "./Navbar";
import { auth } from "../firebaseConfig"; // Import auth
import UserDashboardPage from "./UserDashboard";
// Wrapper for protected routes
const ProtectedRoute = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    // Optional: Add a loading spinner or similar
    return <div>Loading...</div>;
  }

  const mfaPending = localStorage.getItem("mfaPending") === "true";

  if (!user) {
    // Not logged in, redirect to login page, preserving the intended destination
    return <Navigate to="/login"  replace />;
  }

  if (mfaPending) {
    // Logged in but MFA is pending, redirect to MFA verification page
    // Exception: Allow access to /verify-mfa itself if MFA is pending
    if (location.pathname !== "/verify-mfa") {
      return (
        <Navigate
          to="/verify-mfa"
          state={{ from: location, userId: user.uid, email: user.email }}
          replace
        />
      );
    }
  }

  // User is logged in and MFA is completed (or not required/pending)
  return <Outlet />; // Render the child route component
};

function App() {
  // Removed useState for count as it wasn't used

  return (
    <div className="bg-[#0a0a1a]">
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-mfa" element={<VerifyMfaPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<ObjectDetection />} />
          <Route path="/editor" element={<GeneratedUI />} />
          <Route path="/template" element={<WireframeTemplate />} />
          <Route path="/test" element={<Test />} />
          <Route path="/account-settings" element={<AccountSettings />} />
          <Route path="/login-history" element={<LoginHistory />} />
          <Route path="/dashboard" element={<UserDashboardPage />} />
        </Route>

        {/* Optional: Add a 404 Not Found route here */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </div>
  );
}
export default App;