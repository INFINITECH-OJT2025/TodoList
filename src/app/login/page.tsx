"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Head from "next/head";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Image from "next/image";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    // Basic input validation
    if (!username || !password) {
      setMessage("Username and password are required.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/login",
        { username, password },
        { withCredentials: true }
      );

      if (response.data.token) {
        sessionStorage.setItem("authToken", response.data.token);
        response.data.usertype === "admin" ? router.push("/DashBoard") : router.push("/todolist");
      } else {
        setMessage("Invalid credentials. Please try again.");
      }
    } catch (error: any) {
      // Handle specific error messages
      if (error.response?.status === 401) {
        setMessage("Invalid credentials. Please check your username and password.");
      } else {
        setMessage("Login failed. Please try again later.");
      }
    }

    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Login | Infinitech</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
  
      {/* Background Image */}
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-900 px-4 sm:px-0">
        <Image
          src="/cram.png"
          alt="Task Management Background"
          layout="fill"
          objectFit="cover"
          className="absolute top-0 left-0 w-full h-full opacity-20"
        />
  
        {/* Login Box */}
        <div className="relative bg-gray-900/80 backdrop-blur-md p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-sm border border-green-600">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-4 sm:mb-6">
            Infini-Sign In
          </h2>
  
          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-gray-300 text-sm sm:text-lg font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 sm:py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring focus:ring-green-500"
                placeholder="Enter your username"
                required
              />
            </div>
  
            {/* Password Field with Toggle */}
            <div className="relative">
              <label className="block text-gray-300 text-sm sm:text-lg font-medium mb-2">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 sm:py-3 border border-gray-600 bg-gray-800 text-white rounded-lg focus:ring focus:ring-green-500 pr-12"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="absolute right-4 top-10 sm:top-11 text-gray-400 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOffIcon size={22} /> : <EyeIcon size={22} />}
              </button>
            </div>
  
            {message && <p className="text-red-500 text-sm sm:text-lg mt-2 text-center">{message}</p>}
  
            {/* Buttons */}
            <div className="flex flex-col items-center space-y-3">
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-500 text-white py-2 sm:py-3 rounded-lg text-sm sm:text-lg transition font-semibold"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
  
              <button
                type="button"
                className="w-full bg-gray-600 hover:bg-gray-500 text-white py-2 sm:py-3 rounded-lg text-sm sm:text-lg transition"
                onClick={() => router.push("/")}
              >
                ⬅ Back to Landing Page
              </button>
            </div>
          </form>
  
          <p className="text-sm sm:text-lg text-center text-gray-400 mt-4">
            New here? <a href="/Signup" className="text-green-400 hover:underline">Create an account</a>
          </p>
        </div>
      </div>
    </>
  );
  
}