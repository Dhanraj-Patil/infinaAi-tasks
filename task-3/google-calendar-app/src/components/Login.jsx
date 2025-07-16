import React from "react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { signIn, loading, error } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Google Calendar
          </h2>
          <p className="mt-2 text-center text-gray-600">
            View and manage your calendar events in real-time
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="mt-8 space-y-6">
          <button
            onClick={signIn}
            disabled={loading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading Google services...
              </span>
            ) : (
              "Sign in with Google"
            )}
          </button>

          {error && (
            <div className="text-center text-sm text-gray-600">
              <p>Need help? Check Google Cloud Console configuration:</p>
              <a
                href="https://console.cloud.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google Cloud Console
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
