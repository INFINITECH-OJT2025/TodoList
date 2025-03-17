"use client";

import { useState } from "react";
import axios from "axios";
import Image from "next/image";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordWarning, setPasswordWarning] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "password") {
      validatePassword(e.target.value);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTermsChecked(e.target.checked);
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
      setPasswordWarning("Password must contain uppercase, lowercase, numbers, and special characters.");
    } else {
      setPasswordWarning("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsSuccess(false);

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    if (!isTermsChecked) {
      setMessage("You must agree to the terms and conditions.");
      return;
    }

    if (passwordWarning) {
      setMessage(passwordWarning);
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

      const res = await axios.post("http://localhost:8000/api/register", formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(res.data.message);
      setIsSuccess(true);
      setFormData({ username: "", email: "", password: "", confirmPassword: "" });
      setProfileImage(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      setMessage(errorMessage);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-900 px-6 overflow-hidden">
      <Image
        src="/cram.png"
        alt="Task Management Background"
        layout="fill"
        objectFit="cover"
        className="absolute top-0 left-0 w-full h-full opacity-20"
      />
      <div className="relative bg-gray-800/80 backdrop-blur-md p-6 sm:p-8 rounded-lg shadow-lg w-[90%] max-w-md border border-green-600">
        <h2 className="text-2xl font-bold text-white text-center mb-6">Register</h2>
  
        {message && (
          <p className={`text-center text-sm font-bold mb-4 p-2 rounded-lg ${isSuccess ? "text-green-500 bg-green-900/20 border border-green-500" : "text-red-400"}`}>
            {message}
          </p>
        )}
  
        <form onSubmit={handleSubmit} className="space-y-4">
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
          </div>
  
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Profile Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border border-gray-600 bg-gray-800 text-white rounded-lg cursor-pointer"
            />
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
              I agree to the terms and conditions
            </label>
          </div>
  
          <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg transition">
            Register
          </button>
  
          <p className="text-lg text-center text-gray-400 mt-4">
            I have an Account! <a href="/login" className="text-green-400 hover:underline">Back to Login</a>
          </p>
        </form>
      </div>
    </div>
  );
  
}