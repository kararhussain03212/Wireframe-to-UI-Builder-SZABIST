import React, { useState, useEffect } from "react";
import { getUserMfaSetting, updateUserMfaSetting } from "../../firebaseConfig";

const MfaMethodSelector = ({ userId, onMethodSelected }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchMfaSettings = async () => {
      if (!userId) return;

      try {
        const settings = await getUserMfaSetting(userId);
        if (settings.success) {
          // No action needed, we'll use email-only MFA
          setSuccess(settings.mfaEnabled || false);
        }
      } catch (err) {
        setError("Failed to load MFA settings.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMfaSettings();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Update user preferences in Firebase to use email MFA
      const result = await updateUserMfaSetting(userId, true, "email");

      if (result.success) {
        setSuccess(true);
        // Notify parent component of the selected method
        onMethodSelected({ method: "email" });
      } else {
        setError(result.error || "Failed to update MFA settings.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (success) {
    return (
      <div className="bg-green-100 p-4 rounded-md">
        <p className="text-green-700 font-medium">
          Email verification is configured!
        </p>
        <p className="text-sm text-green-600 mt-2">
          You will receive a verification code by email when signing in.
        </p>
        <button
          onClick={() => onMethodSelected({ method: "email" })}
          className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md">
      <h3 className="text-lg font-semibold mb-4">Email Verification Setup</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <p className="text-gray-700">
              When you sign in, we'll send a verification code to your email:
            </p>
            <p className="font-medium mt-2 text-blue-600">
              {userId ? userId : "your verified email address"}
            </p>
          </div>

          <div className="mt-4">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Enable Email Verification
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MfaMethodSelector;
