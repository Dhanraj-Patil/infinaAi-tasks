/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Google services
  useEffect(() => {
    let isMounted = true;
    let gapiScript = null;
    let gisScript = null;

    const initGoogleServices = async () => {
      try {
        // Step 1: Load Google API client if not already loaded
        if (!window.gapi) {
          await new Promise((resolve, reject) => {
            gapiScript = document.createElement("script");
            gapiScript.src = "https://apis.google.com/js/api.js";
            gapiScript.async = true;
            gapiScript.defer = true;
            gapiScript.onload = resolve;
            gapiScript.onerror = reject;
            document.head.appendChild(gapiScript);
          });
        }

        // Step 2: Load Google Identity Services if not already loaded
        if (!window.google || !window.google.accounts) {
          await new Promise((resolve, reject) => {
            gisScript = document.createElement("script");
            gisScript.src = "https://accounts.google.com/gsi/client";
            gisScript.async = true;
            gisScript.defer = true;
            gisScript.onload = resolve;
            gisScript.onerror = reject;
            document.head.appendChild(gisScript);
          });
        }

        // Step 3: Initialize gapi client
        await new Promise((resolve) => {
          window.gapi.load("client", resolve);
        });

        await window.gapi.client.init({
          apiKey: import.meta.env.VITE_API_KEY,
          discoveryDocs: [
            "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
          ],
        });

        if (isMounted) {
          setLoading(false);
          checkExistingSession();
        }
      } catch (err) {
        if (isMounted) {
          setError(`Initialization failed: ${err.message}`);
          setLoading(false);
          console.error("Google services init error:", err);
        }
      }
    };

    const checkExistingSession = async () => {
      try {
        // Check if we have an existing token
        const token = window.gapi.client.getToken();
        if (token) {
          await fetchUserProfile();
        }
      } catch (err) {
        console.error("Session check error:", err);
      }
    };

    // Add this function to convert URL to secure HTTPS
    const toSecureUrl = (url) => {
      if (!url) return url;
      return url.replace(/^http:\/\//i, "https://");
    };

    // Update the fetchUserProfile function
    const fetchUserProfile = async () => {
      try {
        const response = await window.gapi.client.request({
          path: "https://www.googleapis.com/oauth2/v3/userinfo",
        });

        setUserProfile({
          name: response.result.name,
          email: response.result.email,
          imageUrl: toSecureUrl(response.result.picture),
        });

        setIsSignedIn(true);
      } catch (err) {
        setError("Failed to fetch user profile");
        console.error("Profile fetch error:", err);
      }
    };

    initGoogleServices();

    return () => {
      isMounted = false;
      // Clean up scripts if component unmounts during loading
      if (gapiScript && document.head.contains(gapiScript)) {
        document.head.removeChild(gapiScript);
      }
      if (gisScript && document.head.contains(gisScript)) {
        document.head.removeChild(gisScript);
      }
    };
  }, []);

  const signIn = () => {
    if (!window.google || !window.google.accounts) {
      setError("Google Identity Services not loaded");
      return;
    }

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_CLIENT_ID,
      scope:
        "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
      callback: async (tokenResponse) => {
        if (tokenResponse.access_token) {
          // Set token for gapi requests
          window.gapi.client.setToken(tokenResponse);
          await fetchUserProfile();
        } else if (tokenResponse.error) {
          setError(`Authentication failed: ${tokenResponse.error}`);
        }
      },
    });

    tokenClient.requestAccessToken();
  };

  const signOut = () => {
    if (window.google?.accounts?.oauth2) {
      const token = window.gapi.client.getToken();
      if (token) {
        window.google.accounts.oauth2.revoke(token.access_token, () => {
          window.gapi.client.setToken(null);
          setIsSignedIn(false);
          setUserProfile(null);
        });
      }
    }
  };

  // Add this function to convert URL to secure HTTPS
  const toSecureUrl = (url) => {
    if (!url) return url;
    return url.replace(/^http:\/\//i, "https://");
  };

  // Update the fetchUserProfile function
  const fetchUserProfile = async () => {
    try {
      const response = await window.gapi.client.request({
        path: "https://www.googleapis.com/oauth2/v3/userinfo",
      });

      setUserProfile({
        name: response.result.name,
        email: response.result.email,
        imageUrl: toSecureUrl(response.result.picture),
      });

      setIsSignedIn(true);
    } catch (err) {
      setError("Failed to fetch user profile");
      console.error("Profile fetch error:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isSignedIn,
        signIn,
        signOut,
        userProfile,
        error,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
