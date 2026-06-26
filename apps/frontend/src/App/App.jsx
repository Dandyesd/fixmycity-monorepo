import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContexts";
import Navbar from "../components/Navbar";
import LandingPage from "../App/pages/LandingPage";
import Laporan from "../App/pages/Laporan";
import Login from "../App/pages/Login";
import Dashboard from "../App/pages/Dashboard";
import SignUp from "../App/pages/SignUp";
import SocialFeed from "../App/pages/laporan-social";
import ProtectedRoute from "../components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-[#F7FBFA] font-body">
        <Navbar />
       
        <main className="flex-1 p-2 mx-auto w-full">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/laporan" element={<Laporan />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signUp" element={<SignUp />} />
            {/* Protected Routes - require authentication */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/laporan-social" 
              element={
                <ProtectedRoute>
                  <SocialFeed />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;