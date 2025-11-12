import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import {
  auth,
  getUserLoginHistory,
  getSuspiciousLoginAlerts,
} from "../../firebaseConfig";
import { format } from "date-fns";

const LoginHistory = () => {
  const [user, setUser] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);
  const [suspiciousAlerts, setSuspiciousAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("history");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadUserData(currentUser.uid);
      } else {
        // Redirect to login if not authenticated
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadUserData = async (userId) => {
    setIsLoading(true);
    setError("");

    try {
      console.log("Attempting to load login history for user:", userId);
      // Load login history
      const history = await getUserLoginHistory(userId);
      console.log("Received login history:", history);
      setLoginHistory(history);

      // Load suspicious login alerts
      console.log("Attempting to load suspicious alerts");
      const alerts = await getSuspiciousLoginAlerts(userId);
      console.log("Received suspicious alerts:", alerts);
      setSuspiciousAlerts(alerts);
    } catch (error) {
      console.error("Error loading user data:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack,
      });
      setError(`Failed to load login history. Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date) => {
    try {
      return format(new Date(date), "MMM dd, yyyy 'at' h:mm a");
    } catch (e) {
      return "Invalid date";
    }
  };

  const renderLoginStatus = (status) => {
    if (status === "success") {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
          Success
        </span>
      );
    } else {
      return (
        <span className="inline-flex px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">
          Failed
        </span>
      );
    }
  };

  const renderLoginHistory = () => {
    if (loginHistory.length === 0) {
      return <p className="text-gray-500 mt-4">No login history available.</p>;
    }

    return (
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date & Time
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Method
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Location
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Device
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loginHistory.map((login, index) => (
              <tr
                key={login.id || index}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(login.timestamp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                  {login.loginMethod}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {renderLoginStatus(login.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {login.location.city !== "Unknown"
                    ? `${login.location.city}, ${login.location.country}`
                    : "Unknown"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {login.device.platform}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderSuspiciousAlerts = () => {
    if (suspiciousAlerts.length === 0) {
      return <p className="text-gray-500 mt-4">No suspicious login alerts.</p>;
    }

    return (
      <div className="mt-4 space-y-4">
        {suspiciousAlerts.map((alert) => (
          <div
            key={alert.id}
            className="p-4 border border-yellow-200 rounded-md bg-yellow-50"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Suspicious Login Detected
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Date: {formatDate(alert.timestamp)}</p>
                  <p className="font-medium mt-1">Reasons:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    {alert.reasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                  <div className="mt-2 p-2 bg-yellow-100 rounded-md">
                    <p className="font-medium">
                      Location: {alert.loginData?.location?.city},{" "}
                      {alert.loginData?.location?.country}
                    </p>
                    <p className="font-medium">
                      Device: {alert.loginData?.device?.platform}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 block mx-auto"
            role="status"
          >
            {/* Removed visually-hidden span, animation indicates loading */}
          </div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Account Security
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Review your login history and security alerts
          </p>
        </div>

        {error && (
          <div className="p-4 mb-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("history")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "history"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Login History
            </button>
            <button
              onClick={() => setActiveTab("alerts")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "alerts"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Suspicious Alerts{" "}
              {suspiciousAlerts.length > 0 && (
                <span className="ml-2 bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {suspiciousAlerts.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        <div className="px-6 py-4">
          {activeTab === "history"
            ? renderLoginHistory()
            : renderSuspiciousAlerts()}
        </div>
      </div>
    </div>
  );
};

export default LoginHistory;
