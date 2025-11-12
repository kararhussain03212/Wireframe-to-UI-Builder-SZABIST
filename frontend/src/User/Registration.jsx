import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore"; // Add this import
import {
  auth,
  signInWithGoogle,
  db, // Add this
  updateUserMfaSetting, // Add this
  storeMfaChallenge, // Add this
  sendMfaCodeEmail, // Add this
} from "../../firebaseConfig";

const Registration = () => {
  // Your existing state variables remain unchanged
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [verificationNotice, setVerificationNotice] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    setError("");

    if (!email || !password || !confirmPassword) {
      setError("All fields are required");
      return false;
    }

    // Enhanced email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Block more than one @
    if ((email.match(/@/g) || []).length !== 1) {
      setError("Email must contain exactly one '@' symbol");
      return false;
    }

    // Block spaces
    if (email.includes(" ")) {
      setError("Email cannot contain spaces");
      return false;
    }

    // Block forbidden characters
    if (/[^a-zA-Z0-9._%+-@]/.test(email)) {
      setError("Email contains invalid characters");
      return false;
    }

    // Prevent all-numeric local part (before @)
    const localPart = email.split("@")[0];
    if (/^\d+$/.test(localPart)) {
      setError("Email cannot contain only numbers before '@'");
      return false;
    }

    // Block dots at start/end of local part
    if (localPart.startsWith(".") || localPart.endsWith(".")) {
      setError("Email local part cannot start or end with a dot");
      return false;
    }

    // Block multiple consecutive dots in local part
    if (/\.\./.test(localPart)) {
      setError("Email local part cannot have consecutive dots");
      return false;
    }

    // Domain checks
    const domainPart = email.split("@")[1];
    // Block dots at start/end of domain
    if (domainPart.startsWith(".") || domainPart.endsWith(".")) {
      setError("Email domain cannot start or end with a dot");
      return false;
    }
    // Block multiple consecutive dots in domain
    if (/\.\./.test(domainPart)) {
      setError("Email domain cannot have consecutive dots");
      return false;
    }
    // Block extra text after a valid domain (e.g. user@gmail.com.anything)
    const validDomains = [
      "gmail.com",
      "yahoo.com",
      "hotmail.com",
      "outlook.com",
      "icloud.com",
      "aol.com",
      "protonmail.com",
      "zoho.com",
      "mail.com",
      "gmx.com",
      // Add more as needed
    ];
    const domainParts = domainPart.split(".");
    if (domainParts.length > 2) {
      setError(
        "Email domain is invalid or contains extra text after the main domain"
      );
      return false;
    }
    // Block .com after gmail.com or any other domain
    for (const d of validDomains) {
      if (domainPart.startsWith(d + ".")) {
        setError(
          "Email domain is invalid or contains extra text after the main domain"
        );
        return false;
      }
    }

    // Prevent known disposable email domains
    const disposableDomains = [
      "tempmail.com",
      "mailinator.com",
      "10minutemail.com",
    ];
    if (disposableDomains.includes(domainPart.toLowerCase())) {
      setError("Please use a valid email provider");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    return true;
  };
  // Update your handleRegister function:

  const handleRegister = async (e) => {
    e.preventDefault();

    // Call your existing validation
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("Creating user account...");
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("User created:", user.uid);

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        createdAt: serverTimestamp(),
      });

      // Enable MFA by default for this user
      console.log("Setting up MFA for user...");
      await updateUserMfaSetting(user.uid, true, "email");

      /*
    // Generate and send MFA verification code
    const mfaCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated MFA code:", mfaCode);

    // Store challenge in Firebase
    const stored = await storeMfaChallenge(user.uid, mfaCode, 10, email);
    console.log("MFA challenge stored:", stored);

    if (stored) {
      // Send verification code via email
      console.log("Sending MFA code email...");
      await sendMfaCodeEmail(email, mfaCode);
    */

      // Just set the MFA pending flag
      console.log("Setting MFA pending flag...");
      localStorage.setItem("mfaPending", "true");

      // Show success message
      setSuccessMessage("Account created! Redirecting to verification page...");

      // Navigate to MFA verification page - let it handle sending code
      console.log("Redirecting to verify-mfa page...");
      setTimeout(() => {
        navigate("/verify-mfa", {
          state: { userId: user.uid, email: email },
        });
      }, 1500);
    } catch (error) {
      // Your existing error handling remains unchanged
      console.error("Registration error:", error);

      switch (error.code) {
        case "auth/email-already-in-use":
          setError(
            "This email is already registered. Please use a different email or try logging in."
          );
          break;
        case "auth/invalid-email":
          setError("Invalid email address format.");
          break;
        case "auth/weak-password":
          setError("Password is too weak. Please use a stronger password.");
          break;
        default:
          setError("Failed to create account. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");

    try {
      await signInWithGoogle();
      // Redirect will be handled by the signInWithGoogle function
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError("Failed to sign in with Google. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col justify-center text-left min-h-screen font-medium text-gray-800/90 px-4 sm:px-0">
      <div className="w-full sm:w-[500px] p-6 m-auto mt-12 sm:mt-36 bg-white rounded-md shadow-md lg:max-w-xl">
        <h1 className="text-3xl cursor-pointer underline mb-4">Sign Up</h1>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        {verificationNotice && (
          <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded border border-yellow-200">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>{verificationNotice}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label htmlFor="email" className="text-[16px] block mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="font-normal block w-full px-4 py-2 text-gray-900 bg-white border rounded-md focus:border-gray-400 focus:ring-gray-300 focus:outline-none focus:ring focus:ring-opacity-40"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="text-[16px] block mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="block w-full px-4 py-2 text-gray-800 font-normal bg-white border rounded-md focus:border-gray-400 focus:ring-gray-300 focus:outline-none focus:ring focus:ring-opacity-40"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="confirmPassword" className="text-[16px] block mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="block w-full px-4 py-2 text-gray-800 bg-white border rounded-md focus:border-gray-400 focus:ring-gray-300 focus:outline-none focus:ring focus:ring-opacity-40"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
            />
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
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
          </div>
        </form>

        <div className="w-full flex items-center justify-between py-5">
          <hr className="w-full bg-gray-400" />
          <p className="text-base font-medium leading-4 px-2.5">OR</p>
          <hr className="w-full bg-gray-400" />
        </div>

        <div className="mb-4">
          <button
            onClick={handleGoogleSignIn}
            aria-label="Continue with Google"
            type="button"
            className="focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-700 py-2.5 px-4 border rounded-lg border-gray-700 flex items-center w-full justify-center bg-gray-700 disabled:opacity-50"
            disabled={isLoading}
          >
            <p className="text-base font-medium ml-4 text-white">
              {isLoading ? "Processing..." : "Continue with Google"}
            </p>
          </button>
        </div>

        <div className="text-center">
          <p className="text-[14px]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[16px] text-gray-600 hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registration;
