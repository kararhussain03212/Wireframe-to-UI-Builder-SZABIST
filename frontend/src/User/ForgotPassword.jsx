import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebaseConfig";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage({ text: "Please enter your email address", type: "error" });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ text: "Please enter a valid email address", type: "error" });
      return;
    }

    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage({
        text: "Password reset email sent! Check your inbox.",
        type: "success",
      });

      // Clear form
      setEmail("");

      // After 3 seconds, redirect to login
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Error sending password reset email:", error);

      // Handle specific Firebase errors
      switch (error.code) {
        case "auth/user-not-found":
          setMessage({
            text: "No account found with this email address.",
            type: "error",
          });
          break;
        case "auth/invalid-email":
          setMessage({
            text: "Invalid email address format.",
            type: "error",
          });
          break;
        default:
          setMessage({
            text: "Failed to send reset email. Please try again later.",
            type: "error",
          });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col font-medium text-left justify-center min-h-screen text-gray-800/90 px-4 sm:px-0">
      <div className="w-full sm:w-[500px] p-6 m-auto mt-12 sm:mt-36 bg-white rounded-md shadow-md lg:max-w-xl">
        <h1 className="text-3xl cursor-pointer underline mb-6">
          Reset Password
        </h1>

        <form onSubmit={handleResetPassword}>
          <div className="mb-4">
            <label htmlFor="email" className="text-[16px] block mb-2">
              Email Address
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

          {message.text && (
            <div
              className={`mb-4 p-3 rounded ${
                message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="mt-6">
            <button
              type="submit"
              className="w-full px-4 py-2 tracking-wide cursor-pointer text-[16px] text-white transition-colors duration-200 transform bg-gray-700 rounded-md hover:bg-gray-800 focus:outline-none focus:bg-gray-900 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Reset Password"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-gray-600 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
