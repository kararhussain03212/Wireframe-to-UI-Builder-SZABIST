import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  auth,
  getUserMfaSetting,
  updateUserMfaSetting,
} from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import MfaMethodSelector from "./MfaMethodSelector";
/*
 * IMPORTANT: Firestore Security Rules Setup
 *
 * In order for MFA settings to work properly, you need to set up the following
 * Firestore security rules in your Firebase Console (https://console.firebase.google.com):
 *
 * ```
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     // Allow users to read and write their own MFA settings
 *     match /user_settings/{userId} {
 *       allow read, write: if request.auth != null && request.auth.uid == userId;
 *     }
 *
 *     // Allow users to read and write their own MFA challenges
 *     match /mfa_challenges/{userId} {
 *       allow read, write: if request.auth != null && request.auth.uid == userId;
 *     }
 *
 *     // Existing rules for other collections
 *     // ...
 *   }
 * }
 * ```
 */

const AccountSettings = () => {
  console.log("AccountSettings component rendered"); // Debug log
  const [currentUser, setCurrentUser] = useState(null);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const [showMfaConfig, setShowMfaConfig] = useState(false);
  useEffect(() => {
    console.log("Auth state change listener set up"); // Debug log
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log(
        "Auth state changed:",
        user ? `User: ${user.email}` : "No user"
      ); // Debug log
      if (user) {
        setCurrentUser(user);
      } else {
        // No user is signed in, redirect to login.
        console.log("No user found, redirecting to login"); // Debug log
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchMfaSettings = useCallback(async () => {
    if (currentUser) {
      console.log("Fetching MFA settings for user:", currentUser.uid); // Debug log
      setIsLoading(true);
      setError("");
      try {
        const settings = await getUserMfaSetting(currentUser.uid);
        console.log("MFA settings received:", settings); // Debug log

        if (settings.success) {
          setMfaEnabled(settings.mfaEnabled || false);
        } else {
          // Handle error from getUserMfaSetting
          setError(settings.error || "Could not load MFA settings.");
          console.error("MFA settings error details:", settings.details);
        }
      } catch (err) {
        console.error("Error fetching MFA settings:", err); // Debug error
        setError(`Failed to load settings: ${err.message}`);
      }
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    console.log(
      "fetchMfaSettings effect triggered, currentUser:",
      !!currentUser
    ); // Debug log
    fetchMfaSettings();
  }, [fetchMfaSettings]);

  const handleMfaToggle = async () => {
    if (!currentUser) return;

    setIsUpdating(true);
    setError("");
    setSuccessMessage("");
    const newMfaState = !mfaEnabled;

    console.log(`Attempting to ${newMfaState ? "enable" : "disable"} MFA`); // Debug log
    const result = await updateUserMfaSetting(currentUser.uid, newMfaState);

    if (result.success) {
      console.log(`MFA successfully ${newMfaState ? "enabled" : "disabled"}`); // Debug log
      setMfaEnabled(newMfaState);
      setSuccessMessage(
        `Email MFA has been ${newMfaState ? "enabled" : "disabled"}.`
      );
    } else {
      console.error(
        "Failed to update MFA setting:",
        result.error,
        result.details
      ); // Debug error
      setError(result.error || "Failed to update MFA status.");

      // Show detailed error in console for debugging
      if (result.details) {
        console.error("Error details:", result.details);
      }

      // If there's a permission error, show more helpful message
      if (result.code === "permission-denied") {
        setError(
          "You don't have permission to change MFA settings. Please contact an administrator."
        );
      }
    }
    setIsUpdating(false);
    setTimeout(() => setSuccessMessage(""), 3000); // Clear success message after 3s
  };

  console.log("Rendering AccountSettings component, isLoading:", isLoading); // Debug log

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading account settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">
        Account Settings
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      <div className="mt-6 border-t pt-6">
        <h3 className="text-lg font-medium">Multi-Factor Authentication</h3>

        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={mfaEnabled}
              onChange={() => setMfaEnabled(!mfaEnabled)}
              className="h-4 w-4 text-blue-600"
            />
            <span className="ml-2">Enable Multi-Factor Authentication</span>
          </label>
        </div>

        {mfaEnabled && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowMfaConfig(true)}
              className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
            >
              Configure MFA Method
            </button>

            {showMfaConfig && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Configure MFA</h3>
                    <button
                      onClick={() => setShowMfaConfig(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <MfaMethodSelector
                    userId={currentUser.uid}
                    onMethodSelected={(method) => {
                      setShowMfaConfig(false);
                      // Update local state if needed
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Placeholder for other account settings */}
      {/* 
      <div className="mb-6 p-4 border rounded-md">
        <h2 className="text-lg font-medium mb-2 text-gray-700">Change Password</h2>
        <p className="text-sm text-gray-600 mb-3">Update your account password.</p>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Change Password</button>
      </div>
      */}
    </div>
  );
};

export default AccountSettings;
