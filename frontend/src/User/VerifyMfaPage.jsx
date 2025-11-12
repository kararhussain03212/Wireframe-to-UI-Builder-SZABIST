import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  verifyMfaCode,
  sendMfaCodeEmail,
  storeMfaChallenge,
} from "../../firebaseConfig";

const VerifyMfaPage = () => {
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [currentMfaCode, setCurrentMfaCode] = useState(""); // Store the current code

  const location = useLocation();
  const navigate = useNavigate();

  // Get user info from location state
  useEffect(() => {
    console.log("Location state:", location.state);
    if (location.state?.userId) {
      setUserId(location.state.userId);
    }

    if (location.state?.email) {
      setUserEmail(location.state.email);
    }
  }, [location]);

  // Start the resend cooldown timer
  const startCountdown = () => {
    setCountdown(30);
    const timer = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);
  };

  // Send email verification code
  const sendVerificationCodeEmail = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Generate a new code
      const mfaCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log("Generated new MFA code:", mfaCode);

      // Store the code in component state for easy verification
      setCurrentMfaCode(mfaCode);

      // Store in Firestore
      const stored = await storeMfaChallenge(userId, mfaCode, 10, userEmail);

      if (stored) {
        console.log("MFA challenge stored successfully");
        startCountdown();
      } else {
        setError("Failed to set up verification. Please try again.");
      }
    } catch (err) {
      console.error("Error sending verification code:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Send code on page load - only on first load
  useEffect(() => {
    if (userEmail && userId && !success && !error) {
      console.log("Auto-sending verification code to:", userEmail);
      sendVerificationCodeEmail();
    }
  }, [userEmail, userId]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!verificationCode) {
      setError("Please enter the verification code.");
      return;
    }

    if (!userId) {
      setError("User information missing. Please go back to login.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess(false); // Reset success state

    console.log("Verifying code:", verificationCode);
    try {
      const result = await verifyMfaCode(userId, verificationCode);
      console.log("Verification result:", result);

      if (result?.success) {
        // IMPORTANT: Only set success if verification succeeded
        setSuccess(true);

        // Clear the MFA pending flag
        localStorage.removeItem("mfaPending");

        // Show success message briefly before redirecting
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        setError(
          result?.error || "Invalid verification code. Please try again."
        );
      }
    } catch (err) {
      console.error("Error during verification:", err);
      setError("An error occurred during verification.");
    } finally {
      setIsLoading(false);
    }
  };

  // The rest of your component remains the same
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Verify Your Identity
        </h2>

        {success && !error ? (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-center">
            Verification successful! Redirecting...
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            <p className="mb-6 text-gray-600">
              Please enter the 6-digit code sent to your email address{" "}
              {userEmail}.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="code"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Verification Code
                </label>
                <input
                  type="text"
                  id="code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  maxLength="6"
                  required
                />
              </div>

              <div className="flex flex-col space-y-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify Code"}
                </button>

                <button
                  type="button"
                  onClick={sendVerificationCodeEmail}
                  disabled={isLoading || countdown > 0}
                  className="px-4 py-2 text-blue-600 rounded-md border border-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {countdown > 0
                    ? `Resend code in ${countdown}s`
                    : `Resend verification code`}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyMfaPage;
