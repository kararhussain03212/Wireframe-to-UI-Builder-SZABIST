import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  auth,
  signInWithGoogle,
  recordLoginActivity,
  getUserMfaSetting,
  storeMfaChallenge,
} from "../../firebaseConfig";
import emailjs from "@emailjs/browser";
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Only redirect to home if:
      // 1. User is logged in AND
      // 2. NOT on verify-mfa AND
      // 3. MFA is NOT pending
      const mfaPending = localStorage.getItem("mfaPending") === "true";

      if (user && window.location.pathname !== "/verify-mfa" && !mfaPending) {
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // In Login.jsx
  // Update your handleEmailLogin function in Login.jsx
  // Modify your handleEmailLogin function in Login.jsx

  const handleEmailLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Authenticate with email/password
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Record login activity
      await recordLoginActivity(user.uid, email, "email", "initial_auth");

      // Set flag indicating MFA verification is pending, but DON'T generate code yet
      localStorage.setItem("mfaPending", "true");

      // Navigate to MFA verification page - let VerifyMfaPage generate and send code
      console.log("Redirecting to verification page");
      navigate("/verify-mfa", {
        state: { userId: user.uid, email: email },
      });
    } catch (error) {
      // Your existing error handling...
    } finally {
      setIsLoading(false);
    }
  };
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    setAlertMessage("");

    try {
      const result = await signInWithGoogle();
      // The signInWithGoogle function now handles login history recording
      if (result.isSuspicious) {
        setAlertMessage(
          `Suspicious login detected! Reason: ${result.suspiciousReason.join(
            ", "
          )}`
        );
      }
    } catch (error) {
      console.error("Google login error:", error);
      setError("Failed to login with Google. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col font-medium text-left justify-center min-h-screen text-gray-800/90 px-4 sm:px-0">
      <div className="w-full sm:w-[500px] p-6 m-auto mt-12 sm:mt-36 bg-white rounded-md shadow-md lg:max-w-xl">
        <h1 className="text-3xl cursor-pointer underline mb-6">Login</h1>

        {alertMessage && (
          <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                  clipRule="evenodd"
                />
              </svg>
              {alertMessage}
            </div>
          </div>
        )}

        <form onSubmit={handleEmailLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="text-[16px] block mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className="block w-full px-4 py-2 font-normal text-gray-900 bg-white border rounded-md focus:border-gray-400 focus:ring-gray-300 focus:outline-none focus:ring focus:ring-opacity-40"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="text-[16px] block mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              className="block w-full px-4 py-2 text-gray-800 bg-white border rounded-md focus:border-gray-400 focus:ring-gray-300 focus:outline-none focus:ring focus:ring-opacity-40"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="mb-4 text-right">
            <Link
              to="/forgot-password"
              className="text-[16px] text-gray-600 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="mt-6">
            <button
              type="submit"
              className="w-full px-4 py-2 tracking-wide cursor-pointer text-[16px] text-white transition-colors duration-200 transform bg-gray-700 rounded-md hover:bg-gray-800 focus:outline-none focus:bg-gray-900 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>

        <div className="w-full flex items-center justify-between py-5">
          <hr className="w-full bg-gray-400" />
          <p className="text-base font-medium leading-4 px-2.5">OR</p>
          <hr className="w-full bg-gray-400" />
        </div>

        <div className="mb-6">
          <button
            onClick={handleGoogleLogin}
            aria-label="Continue with Google"
            className="focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-700 py-2.5 px-4 border rounded-lg border-gray-700 flex items-center w-full justify-center bg-gray-700 disabled:opacity-50"
            disabled={isLoading}
            type="button"
          >
            <p className="text-base font-medium ml-4 text-white">
              {isLoading ? "Logging in..." : "Login with Google"}
            </p>
          </button>
        </div>

        <div className="text-center">
          <p className="text-[14px]">
            Don't have an account?{" "}
            <Link
              to="/registration"
              className="text-[16px] text-gray-600 hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
