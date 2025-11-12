import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  Timestamp,
} from "@firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { Navigate } from "react-router-dom";
import emailjs from "@emailjs/browser";

const firebaseConfig = {
  apiKey: "AIzaSyCU6f5v5G5EICRdvoPyTz91Ty3nluoXtcE",
  authDomain: "wireframe-to-ui-builder.firebaseapp.com",
  databaseURL: "https://wireframe-to-ui-builder-default-rtdb.firebaseio.com",
  projectId: "wireframe-to-ui-builder",
  storageBucket: "wireframe-to-ui-builder.firebasestorage.app",
  messagingSenderId: "996295631802",
  appId: "1:996295631802:web:724d7632ac71005669b383",
  measurementId: "G-YV4HPEQ45H",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Function to record login history
export const recordLoginActivity = async (
  userId,
  email,
  loginMethod,
  status,
  ipAddress = null
) => {
  try {
    console.log("Recording login activity:", {
      userId,
      email,
      loginMethod,
      status,
    });
    // Get location data based on IP
    let locationData = { country: "Unknown", city: "Unknown" };

    // If IP is provided, fetch geolocation data
    if (ipAddress) {
      try {
        const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
        const data = await response.json();
        if (data && !data.error) {
          locationData = {
            country: data.country_name || "Unknown",
            city: data.city || "Unknown",
            region: data.region || "Unknown",
            ip: ipAddress,
          };
        }
      } catch (error) {
        console.error("Error fetching location data:", error);
      }
    }

    // Create login history record
    const loginData = {
      userId,
      email,
      timestamp: new Date(),
      loginMethod, // 'email', 'google', etc.
      status, // 'success', 'failed'
      device: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
      },
      location: locationData,
    };

    console.log("Attempting to save login data:", loginData);
    // Add to login_history collection
    const docRef = await addDoc(collection(db, "login_history"), loginData);
    console.log("Successfully saved login history with ID:", docRef.id);

    // If successful login, check for suspicious activity
    if (status === "success") {
      // Add the newly created document ID to the loginData object before checking
      const loginDataWithId = { ...loginData, id: docRef.id };

      console.log(
        "Checking for suspicious activity with login data:",
        loginDataWithId
      );
      const suspiciousCheck = await checkForSuspiciousLogin(
        userId,
        loginDataWithId
      );
      console.log("Suspicious check result:", suspiciousCheck);
      // Include suspicion status in the return value for potential UI feedback
      return { success: true, ...suspiciousCheck };
    }

    return { success: true }; // Return success if login wasn't checked for suspicion
  } catch (error) {
    console.error("Error recording login activity:", error);
    return { success: false, error };
  }
};

// Function to check for suspicious login activity
export const checkForSuspiciousLogin = async (userId, currentLogin) => {
  try {
    // Get the last 5 successful logins for this user
    const loginHistoryRef = collection(db, "login_history");
    const q = query(
      loginHistoryRef,
      where("userId", "==", userId),
      where("status", "==", "success"),
      orderBy("timestamp", "desc"),
      limit(5)
    );

    const querySnapshot = await getDocs(q);
    const previousLogins = [];

    querySnapshot.forEach((doc) => {
      if (doc.exists()) {
        previousLogins.push(doc.data());
      }
    });

    console.log("[Suspicious Check] Current Login:", currentLogin);
    console.log(
      "[Suspicious Check] Fetched Previous Logins (inc. current):",
      previousLogins
    );

    // Skip if this is the first login or only one previous recorded
    if (previousLogins.length <= 1) {
      console.log(
        "[Suspicious Check] Skipping check: Not enough login history (initial fetch)."
      );
      return { isSuspicious: false };
    }

    // Filter out the actual current login based on exact timestamp match
    // Need to convert Firestore Timestamps in previousLogins to milliseconds
    const currentLoginMillis = currentLogin.timestamp.getTime();
    const trulyPreviousLogins = previousLogins.filter((login) => {
      // Ensure timestamp exists and has toMillis method (it's a Firestore Timestamp)
      if (login.timestamp && typeof login.timestamp.toMillis === "function") {
        return login.timestamp.toMillis() !== currentLoginMillis;
      }
      console.warn(
        "[Suspicious Check] Invalid or missing timestamp in fetched login record:",
        login
      );
      return false; // Exclude if timestamp is invalid
    });

    // If after filtering, there are no previous logins left, it means this is effectively the first login seen by the check
    if (trulyPreviousLogins.length === 0) {
      console.log(
        "[Suspicious Check] Skipping check: No truly previous logins found after filtering."
      );
      return { isSuspicious: false };
    }

    console.log(
      "[Suspicious Check] Truly Previous Login Data (for comparison):",
      trulyPreviousLogins
    );

    let isSuspicious = false;
    let suspiciousReason = [];

    // Different country than usual - Use trulyPreviousLogins
    if (
      trulyPreviousLogins.length > 0 &&
      currentLogin.location?.country !== "Unknown"
    ) {
      const uniqueCountries = new Set(
        trulyPreviousLogins
          .map((login) => login.location?.country)
          .filter(Boolean) // Filter out null/undefined/Unknown
      );
      console.log(
        "[Suspicious Check] Unique Previous Countries:",
        uniqueCountries
      );
      console.log(
        "[Suspicious Check] Current Country:",
        currentLogin.location.country
      );

      const isNewCountry = !uniqueCountries.has(currentLogin.location.country);
      console.log("[Suspicious Check] Is New Country?:", isNewCountry);

      if (uniqueCountries.size > 0 && isNewCountry) {
        isSuspicious = true;
        suspiciousReason.push(
          `Login from new country: ${currentLogin.location.country}`
        );
        console.log("[Suspicious Check] *** Flagged: New Country ***");
      }
    } else {
      console.log(
        "[Suspicious Check] Skipping country check: No previous data or current country is Unknown."
      );
    }

    // Rapid login from different locations (within 1 hour) - Use trulyPreviousLogins
    if (
      trulyPreviousLogins.length > 0 &&
      currentLogin.location?.city !== "Unknown"
    ) {
      const oneHourAgo = new Date(
        currentLogin.timestamp.getTime() - 60 * 60 * 1000
      );
      // Compare current login against the truly previous ones
      const recentLogins = trulyPreviousLogins.filter((login) => {
        // Ensure previous login timestamp is valid
        const prevTimestamp =
          login.timestamp && typeof login.timestamp.toMillis === "function"
            ? new Date(login.timestamp.toMillis()) // Convert Firestore timestamp to Date obj
            : null;

        if (!prevTimestamp) return false; // Skip if previous timestamp is invalid

        return (
          prevTimestamp >= oneHourAgo &&
          (login.location.city !== currentLogin.location.city ||
            login.location.country !== currentLogin.location.country) &&
          login.location.city !== "Unknown"
        );
      });

      if (recentLogins.length > 0) {
        isSuspicious = true;
        suspiciousReason.push("Rapid login from different location");
        console.log(
          "[Suspicious Check] *** Flagged: Rapid Location Change ***"
        );
      }
    } else {
      console.log(
        "[Suspicious Check] Skipping rapid location check: No previous data or current city is Unknown."
      );
    }

    // Different device/browser than usual - Use trulyPreviousLogins
    if (trulyPreviousLogins.length > 0) {
      const uniqueUserAgents = new Set(
        trulyPreviousLogins
          .map((login) => login.device?.userAgent)
          .filter(Boolean)
      );
      console.log(
        "[Suspicious Check] Unique Previous User Agents:",
        uniqueUserAgents
      );
      console.log(
        "[Suspicious Check] Current User Agent:",
        currentLogin.device.userAgent
      );

      const isNewDevice = !uniqueUserAgents.has(currentLogin.device.userAgent);
      console.log("[Suspicious Check] Is New Device/Browser?:", isNewDevice);

      if (uniqueUserAgents.size > 0 && isNewDevice) {
        isSuspicious = true;
        suspiciousReason.push("Login from new device or browser");
        console.log("[Suspicious Check] *** Flagged: New Device/Browser ***");
      }
    } else {
      console.log(
        "[Suspicious Check] Skipping device check: No previous data."
      );
    }

    // If suspicious activity detected, record it
    if (isSuspicious) {
      await addDoc(collection(db, "suspicious_logins"), {
        userId,
        loginId: currentLogin.id,
        timestamp: new Date(),
        reasons: suspiciousReason,
        loginData: currentLogin,
      });

      // TODO: Implement notification system (email, push, etc.)
      console.warn("Suspicious login detected:", suspiciousReason);
    }

    return { isSuspicious, suspiciousReason };
  } catch (error) {
    console.error("Error checking for suspicious login:", error);
    return { isSuspicious: false, error };
  }
};

// Get user's login history
export const getUserLoginHistory = async (userId) => {
  try {
    const loginHistoryRef = collection(db, "login_history");
    const q = query(
      loginHistoryRef,
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(20)
    );

    const querySnapshot = await getDocs(q);
    const loginHistory = [];

    querySnapshot.forEach((doc) => {
      loginHistory.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      });
    });

    return loginHistory;
  } catch (error) {
    console.error("Error fetching login history:", error);
    throw error;
  }
};

// Get user's suspicious login alerts
export const getSuspiciousLoginAlerts = async (userId) => {
  try {
    const suspiciousLoginsRef = collection(db, "suspicious_logins");
    const q = query(
      suspiciousLoginsRef,
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(10)
    );

    const querySnapshot = await getDocs(q);
    const suspiciousLogins = [];

    querySnapshot.forEach((doc) => {
      suspiciousLogins.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(),
      });
    });

    return suspiciousLogins;
  } catch (error) {
    console.error("Error fetching suspicious login alerts:", error);
    throw error;
  }
};

// Function to handle Google Sign In
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Store user info in localStorage
    localStorage.setItem("name", user.displayName || "");
    localStorage.setItem("email", user.email || "");
    localStorage.setItem("profilePic", user.photoURL || "");

    // Get user's IP address
    let ipAddress = null;
    try {
      const ipResponse = await fetch("https://api.ipify.org?format=json");
      if (ipResponse.ok) {
        const ipData = await ipResponse.json();
        ipAddress = ipData.ip;
        console.log("Fetched IP for Google Sign-In:", ipAddress); // Log fetched IP
      } else {
        console.warn(
          "Could not fetch IP address for Google Sign-In. Status:",
          ipResponse.status
        );
      }
    } catch (ipError) {
      console.error("Error fetching IP address for Google Sign-In:", ipError);
    }

    // Record successful login, now including the IP address
    const loginResult = await recordLoginActivity(
      user.uid,
      user.email,
      "google",
      "success",
      ipAddress
    );

    // Redirect to home page
    window.location.pathname = "/";

    // Return success and potentially the suspicion status
    return { success: true, user, ...loginResult };
  } catch (error) {
    console.error("Google Sign In Error:", error);

    // Record failed login if we can get email from the error
    if (error.email) {
      await recordLoginActivity(null, error.email, "google", "failed");
    }

    throw error;
  }
};

// Function to send verification email
export const sendVerificationEmail = async (user) => {
  try {
    await sendEmailVerification(user);
    return { success: true };
  } catch (error) {
    console.error("Email Verification Error:", error);
    throw error;
  }
};

// Function to send password reset email
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error("Password Reset Error:", error);
    throw error;
  }
};

// In firebaseConfig.js
export const getUserMfaSetting = async (userId) => {
  try {
    if (!userId) return { success: false, error: "User ID is required." };
    
    // For documented behavior, still get/create the document
    const userSettingsRef = doc(db, "user_settings", userId);
    const docSnap = await getDoc(userSettingsRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Always return mfaEnabled as true regardless of stored value
      return { 
        success: true,
        mfaEnabled: true,
        mfaMethod: data.mfaMethod || 'email'
      };
    } else {
      // Create document with default settings
      await setDoc(userSettingsRef, {
        mfaEnabled: true,
        mfaMethod: 'email'
      });
      
      return { 
        success: true,
        mfaEnabled: true,
        mfaMethod: 'email'
      };
    }
  } catch (error) {
    console.error("Error getting user MFA setting:", error);
    // Even on error, indicate MFA is enabled
    return {
      success: false,
      mfaEnabled: true,
      error: "Could not access user settings",
      details: error.message,
    };
  }
};

// Function to send MFA code via EmailJS
export const sendMfaCodeEmail = async (toEmail, code) => {
  const templateParams = {
    email: toEmail,
    passcode: code,
  };
  console.log("Sending MFA code email:", templateParams);
  try {
    const result = await emailjs.send(
      "service_8vk529e", // provided EmailJS service ID
      "template_mvm9tia", // provided EmailJS template ID
      templateParams,
      "8Q7yRe__WB0IiColG" // provided EmailJS public API key
    );
    return { success: true, result };
  } catch (error) {
    console.error("EmailJS send error:", error);
    return { success: false, error };
  }
};

// Function to store MFA challenge
export const storeMfaChallenge = async (
  userId,
  code,
  expiresInMinutes = 10,
  userEmail = null
) => {
  if (!userId || !code) return false;
  try {
    const expiresAt = Timestamp.fromDate(
      new Date(Date.now() + expiresInMinutes * 60 * 1000)
    );
    const mfaChallengeRef = doc(db, "mfa_challenges", userId); // Using userId as doc ID for simplicity, could be a unique challenge ID
    await setDoc(mfaChallengeRef, {
      userId,
      code,
      expiresAt,
      used: false,
      createdAt: Timestamp.now(),
    });
    // Send the code via email if userEmail is provided
    if (userEmail) {
      await sendMfaCodeEmail(userEmail, code);
    }
    return true;
  } catch (error) {
    console.error("Error storing MFA challenge:", error);
    return false;
  }
};

// Function to verify MFA code
export const verifyMfaCode = async (userId, code) => {
  if (!userId || !code) {
    return {
      success: false,
      error: "User ID and verification code are required.",
    };
  }

  try {
    console.log(`Verifying MFA code for user ${userId}`);
    // Get the stored challenge from Firestore
    const challengeRef = doc(db, "mfa_challenges", userId);
    const challengeSnap = await getDoc(challengeRef);

    if (!challengeSnap.exists()) {
      console.error("No MFA challenge found for user");
      return {
        success: false,
        error: "No verification code found. Please request a new one.",
      };
    }

    const challengeData = challengeSnap.data();
    const storedCode = challengeData.code;
    const expiresAt = challengeData.expiresAt.toDate();

    // Check if the code has expired
    if (new Date() > expiresAt) {
      console.error("MFA code expired");
      await deleteDoc(challengeRef); // Clean up expired challenge
      return {
        success: false,
        error: "Verification code has expired. Please request a new one.",
      };
    }

    // Check if the code matches
    if (code !== storedCode) {
      console.error("Invalid MFA code");
      return {
        success: false,
        error: "Invalid verification code. Please try again.",
      };
    }

    // Code is valid - delete the challenge to prevent reuse
    await deleteDoc(challengeRef);

    console.log("MFA verification successful");
    return { success: true };
  } catch (error) {
    console.error("Error verifying MFA code:", error);
    return {
      success: false,
      error: "Failed to verify code. Please try again.",
      details: error.message,
    };
  }
};

// Function to update MFA settings for a user
export const updateUserMfaSetting = async (userId, mfaEnabled, preferredMethod = 'email') => {
  if (!userId) return { success: false, error: "User ID is required." };
  try {
    console.log(`Attempting to update MFA setting for user ${userId} to ${mfaEnabled}`);
    const userSettingsRef = doc(db, "user_settings", userId);

    // Prepare update data - simplified to only use email
    const updateData = { 
      mfaEnabled: mfaEnabled,
      mfaMethod: 'email',  // Always use email
    };

    // First check if document exists
    const docSnap = await getDoc(userSettingsRef);

    if (docSnap.exists()) {
      // Update existing document
      await setDoc(userSettingsRef, updateData, { merge: true });
    } else {
      // Create new document
      await setDoc(userSettingsRef, updateData);
    }

    console.log(`Successfully updated MFA setting to ${mfaEnabled}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating user MFA setting:", error);
    return {
      success: false,
      error: "Failed to update MFA setting.",
      details: error.message,
      code: error.code,
    };
  }
};
