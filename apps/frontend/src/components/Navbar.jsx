import React from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContexts';
import Logo from "../assets/logo.svg"; 
import Button from "../components/Button"; 

const Navbar = () => {
  const { user, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/'); // Redirect to home page after logout
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="flex justify-between items-center px-8 py-4 font-header bg-white border-3 border-gray-200">
      <Link to="/"> 
        <img src={Logo} alt="FixMyCity Logo" className="h-8 w-auto" /> 
      </Link>
      
      <div className="flex items-center gap-4"> 
        {isLoggedIn ? (
          <> 
            {/* Show user name if available */}
            {user && (
              <span className="text-sm text-gray-600">
                Hello, {user.user_name}!
              </span>
            )}
            <Link 
              to="/dashboard" 
              className="text-gray-700 hover:text-[#6a9c89] text-sm transition duration-200 ease-in-out"
            >
              Dashboard
            </Link>
            <Link 
              to="/laporan-social" 
              className="text-gray-700 hover:text-[#6a9c89] text-sm transition duration-200 ease-in-out"
            >
              Laporan
            </Link>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 text-sm transition duration-300 ease-in-out"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link 
              to="/login"
              className="px-4 py-2 text-[#16423c] border border-[#16423c] rounded-full hover:bg-[#16423c] hover:text-white text-sm transition duration-300 ease-in-out"
            >
              Login
            </Link>
            <Link 
              to="/signUp"
              className="px-4 py-2 bg-[#16423c] text-white rounded-full hover:bg-[#6a9c89] text-sm transition duration-300 ease-in-out"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;