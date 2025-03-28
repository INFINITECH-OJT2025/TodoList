"use client";

import { useState } from "react";
import axios from "axios";
import Image from "next/image";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 w-11/12 max-w-lg">
        <h2 className="text-xl font-bold mb-4">Terms and Conditions</h2>
        <p className="mb-4">Please read these terms and conditions carefully before using our service.</p>
        <p className="mb-4">By accessing or using the service, you agree to be bound by these terms. If you do not agree to the terms, you may not use the service.</p>
        <button onClick={onClose} className="mt-4 bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded">
          Close
        </button>
      </div>
    </div>
  );
};

export default function Register() {
  const [formData, setFormData] = useState({
    username: "INFINI-", // Default prefix added
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameWarning, setUsernameWarning] = useState("");
  const [emailWarning, setEmailWarning] = useState("");
  const [passwordWarning, setPasswordWarning] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Automatically append the prefix to the username
    if (name === "username" && !value.startsWith("INFINI-")) {
      setFormData({ ...formData, username: "INFINI-" + value });
      return;
    }

    setFormData({ ...formData, [name]: value });

    // Validate username
    if (name === "username") {
      if (value.length >= 6) {
        try {
          const checkRes = await axios.post("https://infinitech-api5.site/api/check-availability", {
            username: value,
          });

          if (!checkRes.data.usernameAvailable) {
            setUsernameWarning("Username is already taken.");
          } else {
            setUsernameWarning("");
          }
        } catch (error) {
          toast.error("Error checking username availability. Please try again.");
        }
      } else {
        setUsernameWarning("");
      }
    }

    // Validate email
    if (name === "email") {
      if (value.includes("@")) {
        try {
          const checkRes = await axios.post("https://infinitech-api5.site/api/check-availability", {
            email: value,
          });

          if (!checkRes.data.emailAvailable) {
            setEmailWarning("Email is already taken.");
          } else {
            setEmailWarning("");
          }
        } catch (error) {
          toast.error("Error checking email availability. Please try again.");
        }
      } else {
        setEmailWarning("Email must contain '@' character.");
      }
    }

    // Validate password
    if (name === "password") {
      validatePassword(value);
    }
  };

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      setPasswordWarning(`Password must be at least ${minLength} characters long.`);
    } else if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChars) {
      setPasswordWarning("Password must include uppercase, lowercase, numbers, and special characters.");
    } else {
      setPasswordWarning("");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // Validate file type and size
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file.");
        setProfileImage(null);
        setProfileImageUrl(null);
        return;
      }

      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error("Image size should not exceed 2MB.");
        setProfileImage(null);
        setProfileImageUrl(null);
        return;
      }

      setProfileImage(file);
      setProfileImageUrl(URL.createObjectURL(file));
    }
  };

  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTermsChecked(e.target.checked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Set loading state

    // Check if a profile image is required and not uploaded
    if (!profileImage) {
      toast.error("Please upload a profile image.");
      setIsLoading(false); // Reset loading state
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false); // Reset loading state
      return;
    }

    if (!isTermsChecked) {
      toast.error("You must agree to the terms and conditions.");
      setIsLoading(false); // Reset loading state
      return;
    }

    if (usernameWarning || emailWarning || passwordWarning) {
      toast.error("Please fix the errors before submitting.");
      setIsLoading(false); // Reset loading state
      return;
    }

    try {
      const formDataObj = new FormData();
      formDataObj.append("username", formData.username);
      formDataObj.append("email", formData.email);
      formDataObj.append("password", formData.password);
      if (profileImage) {
        formDataObj.append("profile_image", profileImage);
      }

      const res = await axios.post("https://infinitech-api5.site/api/register", formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data.message);
      setFormData({ username: "INFINI-", email: "", password: "", confirmPassword: "" }); // Reset username to default
      setProfileImage(null);
      setProfileImageUrl(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-900 px-4 overflow-hidden">
      <ToastContainer />
      <Image
        src="/cram.png"
        alt="Task Management Background"
        layout="fill"
        objectFit="cover"
        className="absolute top-0 left-0 w-full h-full opacity-20"
      />
      <div className="relative bg-gray-800/80 backdrop-blur-md p-6 rounded-lg shadow-lg w-full max-w-md border border-green-600">
        <div className="flex items-center justify-center ">
          <img
            src="/infini.png"
            alt="Logo"
            className="w-28"
          />
        </div>
        <br />
        
        <h2 className="text-2xl font-bold text-white text-center mb-6">Register</h2>
        
        <br />
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <div className="flex flex-col items-center">
            <label className="block text-gray-300 text-sm font-medium mb-2">Profile Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-600 bg-gray-800 text-white rounded-lg cursor-pointer"
            />
            {profileImageUrl && (
              <div className="mt-4 flex items-center justify-center w-32 h-32 border-2 border-green-500 rounded-full overflow-hidden shadow-lg">
                <Image
                  src={profileImageUrl}
                  alt="Profile Preview"
                  width={128}
                  height={128}
                  className="object-cover"
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring focus:ring-green-500 focus:outline-none"
              placeholder="Enter your username"
              required
            />
            {usernameWarning && <p className="text-red-400 text-sm">{usernameWarning}</p>}
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring focus:ring-green-500 focus:outline-none"
              placeholder="Enter your email"
              required
            />
            {emailWarning && <p className="text-red-400 text-sm">{emailWarning}</p>}
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring focus:ring-green-500 focus:outline-none"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
            {passwordWarning && <p className="text-red-400 text-sm">{passwordWarning}</p>}
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring focus:ring-green-500 focus:outline-none"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white"
              >
                {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="terms"
              checked={isTermsChecked}
              onChange={handleTermsChange}
              className="h-4 w-4 text-green-500 focus:ring focus:ring-green-500"
            />
            <label htmlFor="terms" className="ml-2 text-gray-300 text-sm">
              I agree to the <button type="button" onClick={() => setIsModalOpen(true)} className="text-green-400 hover:underline">terms and conditions</button>
            </label>
          </div>

          <div>
            <button type="submit" className={`w-full ${isLoading ? "bg-gray-600" : "bg-green-600 hover:bg-green-500"} text-white py-2 rounded-lg transition`} disabled={isLoading}>
              {isLoading ? "Registering..." : "Register"}
            </button>
          </div>

          <p className="text-lg text-center text-gray-400 mt-4">
            I have an Account! <a href="/login" className="text-green-400 hover:underline">Back to Login</a>
          </p>
        </form>
      </div>

      <TermsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
