import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContexts";
import { Button } from "../../components/ui/button";
import cityIllustration from "@/assets/city2.jpg";
const illustrationUrl = cityIllustration;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // validasi form
  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email address is invalid.";
    }
    if (!password) {
      newErrors.password = "Password is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fungsi untuk submit form
  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);
    console.log("Login data to submit:", { email, password });

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for signed cookies
        body: JSON.stringify({ email, password }),
      });

      // Check if response is actually JSON
      const contentType = response.headers.get("Content-Type");
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text();
        console.error("Non-JSON response:", textResponse);
        throw new Error(
          "Server returned an invalid response. Please check if the API server is running."
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Login failed. Please check your credentials."
        );
      }

      // Use the auth context to store user data
      login(data.data, data.token);

      setIsSubmitting(false);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setErrors({ form: error.message });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br p-4 selection:text-white">
      <div className="flex flex-col md:flex-row w-full max-w-4xl lg:max-w-5xl bg-white shadow-2xl rounded-xl overflow-hidden">
        <div className="hidden md:flex md:w-1/2 overflow-hidden">
          <img
            src={illustrationUrl}
            alt="City Image"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="w-full md:w-1/2 p-8 sm:p-10 lg:p-12">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <h1 className="font-bold text-3xl tracking-wide text-gray-800 mb-2">
                LOGIN
              </h1>
            </div>

            {errors.form && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                {errors.form}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  className="block text-zinc-600 font-semibold text-sm mb-1.5"
                  htmlFor="email-login"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    id="email-login"
                    className={`shadow-sm appearance-none border ${
                      errors.email
                        ? "border-red-500 ring-1 ring-red-500"
                        : "border-gray-300"
                    } rounded-lg w-full py-3 pl-10 pr-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#6a9c89] focus:border-transparent placeholder:text-gray-400 transition-colors`}
                    type="email"
                    placeholder="Enter your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-xs mt-1.5">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  className="block text-zinc-600 font-semibold text-sm mb-1.5"
                  htmlFor="password-login"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    id="password-login"
                    className={`shadow-sm appearance-none border ${
                      errors.password
                        ? "border-red-500 ring-1 ring-red-500"
                        : "border-gray-300"
                    } rounded-lg w-full py-3 pl-10 pr-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#6a9c89] focus:border-transparent placeholder:text-gray-400 transition-colors`}
                    type="password"
                    placeholder="Enter your Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {errors.password && (
                  <p className="text-red-600 text-xs mt-1.5">
                    {errors.password}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-[#6a9c89] focus:ring-[#6a9c89] border-gray-300 rounded accent-[#16423c]"
                />
                <label htmlFor="rememberMe" className="ml-2 text-gray-700">
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="font-semibold text-[#16423c] hover:text-[#578a78] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className={`w-full font-semibold rounded-lg ${
                  !isSubmitting
                    ? "bg-[#16423c] hover:bg-[#6a9c89] text-white"
                    : ""
                }`}
              >
                {isSubmitting ? <>Logging in...</> : "Login"}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/signUp"
                  className="font-semibold text-[#16423c] hover:text-[#6a9c89] hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
