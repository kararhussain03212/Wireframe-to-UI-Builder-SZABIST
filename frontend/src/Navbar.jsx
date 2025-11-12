import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      localStorage.removeItem("name");
      localStorage.removeItem("email");
      localStorage.removeItem("profilePic");
      localStorage.removeItem("mfaPending");
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <nav className="bg-gray-900">
      {/* Main navbar container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="text-white text-lg font-bold">
              Wireframe Builder
            </Link>
          </div>

          {/* User Profile - Desktop */}
          <div className="hidden md:flex md:items-center">
            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              <Link
                to="/"
                className="text-white hover:text-white px-3 py-2 rounded-md  font-medium"
              >
                Home
              </Link>
              <Link
                to="/test"
                className="text-white hover:text-white px-3 py-2 rounded-md  font-medium"
              >
                Templates
              </Link>
               <Link
                to="/dashboard"
                className="text-white hover:text-white px-3 py-2 rounded-md  font-medium"
              >
                Dashboard
              </Link>
            </div>
            {user ? (
              <div className="relative ml-3">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center  rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                >
                  <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-white">
                    {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                  </div>
                </button>

                {/* Profile dropdown */}
                {profileMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900">
                        {user.displayName || "User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
{/* 
                    <Link
                      to="/account-settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-gray-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c1.561.379 1.561 2.6 0 2.978a1.532 1.532 0 01-.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287-.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c.836 1.372-.734 2.942-2.106 2.106a1.532 1.532 0 01-.947-2.287c-.379-1.561-2.6-1.561-2.978 0a1.532 1.532 0 01-2.287.947c-1.372.836-2.942-.734-2.106-2.106a1.532 1.532 0 01.947-2.287zM10 13a3 3 0 100-6 3 3 0 000 6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Account Settings
                      </div>
                    </Link> */}

                    <Link
                      to="/login-history"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-gray-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Login History
                      </div>
                    </Link>

                    <div className="px-4 py-2 border-t">
                      <button
                        onClick={handleSignOut}
                        disabled={isLoading}
                        className="w-full px-4 py-2 text-white bg-gray-700 rounded hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50"
                      >
                        {isLoading ? "Signing out..." : "Sign Out"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="text-white hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md  font-medium"
                >
                  Log in
                </Link>
                <Link
                  to="/registration"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-md font-medium"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              {!mobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                /* Icon when menu is open */
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/test"
              className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Templates
            </Link>
          </div>

          {/* Mobile user profile section */}
          {user ? (
            <div className="pt-4 pb-3 border-t border-gray-700">
              <div className="px-2 space-y-1">
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-white">
                      {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium leading-none text-white">
                      {user.displayName || "User"}
                    </div>
                    <div className="text-sm font-medium leading-none text-gray-400">
                      {user.email}
                    </div>
                  </div>
                </div>

                <Link
                  to="/account-settings"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Account Settings
                </Link>

                <Link
                  to="/login-history"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login History
                </Link>

                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  disabled={isLoading}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  {isLoading ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-gray-700">
              <div className="flex flex-col space-y-2 px-3">
                <Link
                  to="/login"
                  className="text-center px-4 py-2 rounded text-gray-300 hover:bg-gray-700 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/registration"
                  className="text-center px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
