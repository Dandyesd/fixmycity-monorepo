import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, CalendarDays, Mail, Lock, AlertCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import cityIllustration from "../../assets/city2.jpg";
const illustrationUrl = cityIllustration;

export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Fungsi untuk validasi form
  const validateForm = () => {
    const newErrors = {};
    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    } else if (!/^[a-zA-Z\s]+$/.test(fullName.trim())) {
      newErrors.fullName = "Full name can only contain letters and spaces.";
    }

    if (!dob) {
      newErrors.dob = "Date of birth is required.";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email address is invalid.";
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (!passwordRegex.test(password)) {
      newErrors.password =
        "Password must be at least 8 characters, include uppercase, lowercase, and a number.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required.";
    } else if (password && confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match.";
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
    const userData = {
      user_name: fullName,
      user_birthday: dob,
      user_email: email,
      user_password: password,
      isLoginAfterRegister: true
    };
    console.log("Sign Up data to submit:", userData);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/user/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_name: fullName,
          user_birthday: dob,
          user_email: email,
          user_password: password,
          isLoginAfterRegister: true
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrors({
          form:
            data.message ||
            data.error ||
            "Registration failed. Please try again.",
        });
        setIsSubmitting(false);
        return;
      }

      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (error) {
      setErrors({
        form:
          error.message || "An unexpected error occurred. Please try again.",
      });
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br selection:text-white">
      <div className="flex flex-col md:flex-row w-full max-w-4xl lg:max-w-5xl bg-white shadow-2xl rounded-xl overflow-hidden">
        <div className="hidden md:flex md:w-1/2 overflow-hidden">
          <img
            src={illustrationUrl}
            alt="Sign Up Illustration"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="w-full md:w-1/2 p-8 sm:p-10 lg:p-12">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <h1 className="font-bold text-3xl tracking-wide text-gray-800 mb-6">
                SIGN UP
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
                  htmlFor="fullName"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    id="fullName"
                    className={`shadow-sm appearance-none border ${
                      errors.fullName
                        ? "border-red-500 ring-1 ring-red-500"
                        : "border-gray-300"
                    } rounded-lg w-full py-3 pl-10 pr-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#6a9c89] focus:border-transparent placeholder:text-gray-400 transition-colors`}
                    type="text"
                    placeholder="Enter your Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-red-600 text-xs mt-1.5">
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="block text-zinc-600 font-semibold text-sm mb-1.5"
                  htmlFor="dob"
                >
                  Date of Birth
                </label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    id="dob"
                    className={`shadow-sm appearance-none border ${
                      errors.dob
                        ? "border-red-500 ring-1 ring-red-500"
                        : "border-gray-300"
                    } rounded-lg w-full py-3 pl-10 pr-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#6a9c89] focus:border-transparent placeholder:text-gray-400 transition-colors`}
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>
                {errors.dob && (
                  <p className="text-red-600 text-xs mt-1.5">{errors.dob}</p>
                )}
              </div>

              <div>
                <label
                  className="block text-zinc-600 font-semibold text-sm mb-1.5"
                  htmlFor="email-signup"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    id="email-signup"
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
                  htmlFor="password-signup"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    id="password-signup"
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

              <div>
                <label
                  className="block text-zinc-600 font-semibold text-sm mb-1.5"
                  htmlFor="confirmPassword"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  <input
                    id="confirmPassword"
                    className={`shadow-sm appearance-none border ${
                      errors.confirmPassword
                        ? "border-red-500 ring-1 ring-red-500"
                        : "border-gray-300"
                    } rounded-lg w-full py-3 pl-10 pr-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#6a9c89] focus:border-transparent placeholder:text-gray-400 transition-colors`}
                    type="password"
                    placeholder="Confirm your Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 text-xs mt-1.5">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4">
              <Button
                title={isSubmitting ? "Signing up..." : "Sign Up"}
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className={`w-full font-semibold rounded-lg ${
                  !isSubmitting
                    ? "bg-[#16423c] hover:bg-[#6a9c89] text-white"
                    : ""
                }`}
              >
                {isSubmitting ? "Signing up..." : "Sign Up"}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-[#16423c] hover:text-[#6a9c89] hover:underline"
                >
                  Login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
