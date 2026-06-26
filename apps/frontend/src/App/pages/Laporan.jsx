//file Laporan_jsx (modified section)
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/Textarea";
import { Label } from "../../components/ui/Label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Alert, AlertDescription } from "../../components/ui/Alert";
import { Loader2, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContexts";

export default function LaporanPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    image: null,
  });

  // Use AuthContext for authentication
  const { user: authUser, isLoggedIn, loading: authLoading } = useAuth();

  // This console.log showed us the structure of authUser
  console.log("Current authUser:", authUser);
  console.log("Is logged in:", isLoggedIn);
  console.log("Auth loading:", authLoading);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({
      ...prev,
      image: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check authentication
    if (!isLoggedIn || !authUser) {
      setMessage({
        type: "error",
        text: "You must be logged in to submit a report.",
      });
      return;
    }

    // Validate required fields
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.location.trim()
    ) {
      setMessage({
        type: "error",
        text: "Please fill in all required fields.",
      });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const submitData = new FormData();
      submitData.append("title", formData.title.trim());
      submitData.append("description", formData.description.trim());
      submitData.append("location", formData.location.trim());
      submitData.append("status", "PENDING");

      // **** THIS IS THE CHANGE ****
      // Use authUser.id_user instead of authUser.id
      if (authUser?.id_user) {
        // Corrected: access id_user
        submitData.append("userId", authUser.id_user); // Send as 'userId' for backend
        console.log("User ID added to form data:", authUser.id_user);
      } else {
        throw new Error(
          "User ID (id_user) not found in authUser object. Please log in again."
        ); // More specific error
      }

      // Add image if selected
      if (formData.image) {
        submitData.append("image", formData.image);
        console.log("Image added to form data:", formData.image.name);
      }

      // Get token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      console.log("Token found, length:", token.length);

      // Fix API URL - remove trailing slash if present
      const apiUrl =
        import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
        "http://localhost:3000";
      const submitUrl = `${apiUrl}/report`;

      console.log("Submitting to:", submitUrl);

      const response = await fetch(submitUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type for FormData - browser will set it automatically with boundary
        },
        credentials: "include", // Important for cookies if using cookie auth as fallback
        body: submitData,
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error("Error response:", errorData);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (jsonError) {
          console.warn("Could not parse error response as JSON:", jsonError);
          // Try to get response as text
          try {
            const textResponse = await response.text();
            console.error("Error response text:", textResponse);
            if (textResponse) {
              errorMessage = textResponse;
            }
          } catch (textError) {
            console.warn("Could not get response as text:", textError);
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Submit successful:", result);

      setMessage({
        type: "success",
        text: "Report submitted successfully! It will be reviewed by our team.",
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        location: "",
        image: null,
      });

      // Reset file input
      const fileInput = document.getElementById("file");
      if (fileInput) fileInput.value = "";

      // Navigate back to dashboard after successful submission
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Submit error:", error);

      let errorMessage = "An error occurred while submitting the report.";

      if (error.message.includes("Failed to fetch")) {
        errorMessage =
          "Connection failed. Please check your internet connection.";
      } else if (error.message.includes("Authentication token not found")) {
        errorMessage = "Please login again to submit a report.";
        setTimeout(() => navigate("/login"), 2000);
      } else if (
        error.message.includes("401") ||
        error.message.includes("Token tidak ditemukan")
      ) {
        errorMessage = "Your session has expired. Please login again.";
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 2000);
      } else if (
        error.message.includes("403") ||
        error.message.includes("Token tidak valid")
      ) {
        errorMessage = "Invalid session. Please login again.";
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 2000);
      } else if (error.message) {
        errorMessage = error.message;
      }

      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleLogin = () => {
    navigate("/login");
  };

  // Show loading spinner while auth is loading
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#F7FBFA]">
        <Loader2 className="h-8 w-8 animate-spin text-[#6a9c89]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FBFA] py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Instructions Section */}
        <Card className="mb-8 shadow-lg">
          <CardHeader className="bg-[#6a9c89] text-white p-0 m-0">
            <div className="p-6">
              <CardTitle className="text-3xl font-bold">
                How to Submit a Report
              </CardTitle>
              <CardDescription className="text-lg text-gray-100">
                Follow these steps to report damaged infrastructure:
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[
                'Enter the report title, such as "Pothole on Ponlab Street".',
                'Provide a description of the issue, for example: "The pothole is quite deep and dangerous for motorcyclists".',
                "Enter the location where the issue was found.",
                "Upload photos showing the condition of the infrastructure.",
                'After completing the form, click the "Submit" button to send your report.',
              ].map((step, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#6a9c89] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 font-medium leading-relaxed">
                    {step}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <p className="text-blue-800 font-medium">
                Your report will be verified and forwarded to the relevant
                authorities for prompt action.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Authentication Check */}
        {!isLoggedIn || !authUser ? (
          <Card className="mb-8 shadow-lg">
            <CardContent className="pt-6">
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  You must be logged in to submit a report.
                  <Button
                    variant="link"
                    className="p-0 ml-2 h-auto font-semibold text-[#6a9c89] hover:text-[#16423c]"
                    onClick={handleLogin}
                  >
                    Login here
                  </Button>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 shadow-lg">
            <CardContent className="pt-6">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Logged in as:{" "}
                  <strong>
                    {authUser?.user_name || authUser?.name || "Unknown"}
                  </strong>
                  ({authUser?.user_email || authUser?.email || "Unknown"})
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Report Form */}
        <Card className="shadow-lg">
          <CardHeader className="bg-white border-b">
            <CardTitle className="text-3xl text-[#16423c] font-bold">
              Submit Infrastructure Report
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Please fill out all required fields below:
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {message && (
              <Alert
                className={`mb-6 ${
                  message.type === "error"
                    ? "border-red-200 bg-red-50"
                    : "border-green-200 bg-green-50"
                }`}
              >
                {message.type === "error" ? (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                <AlertDescription
                  className={
                    message.type === "error" ? "text-red-800" : "text-green-800"
                  }
                >
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label
                  htmlFor="title"
                  className="text-sm font-semibold text-gray-700"
                >
                  Report Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g., Pothole on Main Street"
                  value={formData.title}
                  onChange={handleInputChange}
                  disabled={!isLoggedIn || !authUser || isSubmitting}
                  className="mt-2 focus:ring-[#6a9c89] focus:border-[#6a9c89] border-gray-300"
                  required
                />
              </div>

              <div>
                <Label
                  htmlFor="description"
                  className="text-sm font-semibold text-gray-700"
                >
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the infrastructure issue in detail..."
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={!isLoggedIn || !authUser || isSubmitting}
                  className="mt-2 min-h-[120px] focus:ring-[#6a9c89] focus:border-[#6a9c89] border-gray-300 resize-none"
                  required
                />
              </div>

              <div>
                <Label
                  htmlFor="location"
                  className="text-sm font-semibold text-gray-700"
                >
                  Location <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="e.g., Jl. Sudirman No. 123, Jakarta"
                  value={formData.location}
                  onChange={handleInputChange}
                  disabled={!isLoggedIn || !authUser || isSubmitting}
                  className="mt-2 focus:ring-[#6a9c89] focus:border-[#6a9c89] border-gray-300"
                  required
                />
              </div>

              <div>
                <Label
                  htmlFor="file"
                  className="text-sm font-semibold text-gray-700"
                >
                  Upload Images or Video<span className="text-red-500">*</span>
                </Label>
                <div className="mt-2">
                  <Input
                    id="file"
                    name="file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={!isLoggedIn || !authUser || isSubmitting}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#6a9c89] file:text-white hover:file:bg-[#5a8c79] file:cursor-pointer border-gray-300"
                  />
                  {formData.image && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                      <p className="text-sm text-gray-700">
                        📎 Selected file:{" "}
                        <span className="font-medium">
                          {formData.image.name}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Size: {(formData.image.size / 1024 / 1024).toFixed(2)}{" "}
                        MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <Button
                  type="submit"
                  disabled={!isLoggedIn || !authUser || isSubmitting}
                  className="w-full bg-[#16423c] hover:bg-[#6a9c89] disabled:bg-gray-400 text-white py-4 text-lg font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting Report...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-5 w-5" />
                      Submit Report
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}