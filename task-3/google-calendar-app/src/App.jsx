import React from "react";
import { AuthProvider } from "./context/AuthContext";
import CalendarView from "./components/CalendarView";
import Login from "./components/Login";
import { useAuth } from "./context/AuthContext";

function AppContent() {
  const { isSignedIn } = useAuth();
  return isSignedIn ? <CalendarView /> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
