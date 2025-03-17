"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaSignOutAlt, FaEdit, FaSave } from "react-icons/fa";
import Sidebar from "../Components/Sidebar";
import authUser from "../utils/authUser";

const TodoPage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLightMode, setIsLightMode] = useState<boolean>(false);

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "light") {
      setIsLightMode(true);
    }
  }, []);

  // Handle theme toggle and persist in localStorage
  const toggleTheme = () => {
    const newMode = !isLightMode;
    setIsLightMode(newMode);
    localStorage.setItem("theme", newMode ? "light" : "dark");
  };

  useEffect(() => {
    const authToken = sessionStorage.getItem("authToken");

    if (!authToken) {
      router.push("/login");
      return;
    }

    axios
      .get("http://127.0.0.1:8000/api/user", {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((response) => {
        setUser(response.data.user);
        setUsername(response.data.user.username);
        setEmail(response.data.user.email);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
        router.push("/login");
      });
  }, [router]);

  const handleSave = async () => {
    try {
      const authToken = sessionStorage.getItem("authToken");
      if (!authToken) {
        console.error("No token found.");
        return;
      }

      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      if (profileImage) {
        formData.append("profile_image", profileImage);
      }

      const response = await axios.post(
        "http://127.0.0.1:8000/api/update-profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUser(response.data.user);
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div
      className={`flex min-h-screen ${
        isLightMode ? "bg-white text-black" : "bg-gray-900 text-white"
      } items-center justify-center p-2`}
    >
      <Sidebar />
      <div
        className={`flex-1 p-6 flex flex-col items-center ${
          isLightMode ? "bg-white text-black" : "bg-gray-900 text-white"
        }`}
      >
        <h1 className="text-4xl font-extrabold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600 drop-shadow-lg">
          User Profile
        </h1>

        {/* Light Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          className={`absolute top-4 right-4 px-4 py-2 rounded-md ${
            isLightMode ? "bg-gray-800 text-white" : "bg-gray-200 text-black"
          }`}
        >
          {isLightMode ? "☀️" : "🌙"}
        </button>

        <br />
        <div className="container max-w-6xl w-full flex flex-col lg:flex-row gap-6">
          {/* Left Card - Profile Image & Name */}
          <div className="bg-gray-200 p-5 rounded-lg border border-green-600 flex flex-col items-center w-full lg:w-1/4">
            <div className="h-32 w-32 overflow-hidden rounded-full border-2 border-green-600">
              {user?.profile_image ? (
                <img
                  className="w-full h-full object-cover"
                  src={`http://127.0.0.1:8000/${user.profile_image}`}
                  alt="Profile"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-300 text-gray-600 text-sm">
                  No Image
                </div>
              )}
            </div>
            <h2 className="text-gray-800 text-xl font-bold mt-3">
              {user?.username}
            </h2>

            <button
              onClick={() => setEditing(true)}
              className="w-full bg-green-500 hover:bg-green-400 py-2 px-4 rounded-md mt-4 flex items-center justify-center text-sm"
            >
              <FaEdit className="mr-1" /> Edit Profile
            </button>
          </div>

          {/* Right Card - User Details */}
          <div className="bg-gray-300 p-5 rounded-lg border border-green-600 w-full lg:w-2/3">
            <div className="h-40 overflow-hidden rounded-md">
              <img
                className="w-full h-full object-cover"
                src="https://images.unsplash.com/photo-1605379399642-870262d3d051?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
                alt="Cover"
              />
            </div>

            <div className="text-center px-4 py-4">
              {loading ? (
                <p className="text-gray-600 mt-2 text-sm">Loading user data...</p>
              ) : editing ? (
                <>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2 rounded-md bg-gray-200 text-gray-800 border border-green-600 focus:ring focus:ring-green-500 text-sm"
                    placeholder="Username"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 mt-2 rounded-md bg-gray-200 text-gray-800 border border-green-600 focus:ring focus:ring-green-500 text-sm"
                    placeholder="Email"
                  />
                  <input
                    type="file"
                    onChange={(e) => setProfileImage(e.target.files[0])}
                    className="w-full p-2 mt-2 rounded-md bg-gray-200 text-gray-800 border border-green-600 text-sm"
                  />
                  <button
                    onClick={handleSave}
                    className="w-full bg-green-500 hover:bg-green-400 py-2 px-4 rounded-md mt-3 flex items-center justify-center text-sm"
                  >
                    <FaSave className="mr-1" /> Save
                  </button>
                </>
              ) : (
                <>
                  <p className="text-gray-600 mt-1 text-sm">{user?.email}</p>
                  <p className="text-gray-600 mt-2 text-sm">
                    Joined: {formatDateTime(user?.created_at)}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default authUser(TodoPage);
