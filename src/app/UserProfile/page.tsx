"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaSignOutAlt, FaEdit, FaSave } from "react-icons/fa";
import Sidebar from "../Components/Sidebar";
import authUser  from "../utils/authUser";

const TodoPage = () => {
  const router = useRouter();
  const [user, setUser ] = useState(null);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);

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
        setUser (response.data.user);
        setUsername(response.data.user.username);
        setEmail(response.data.user.email);
        setImagePreview(`http://127.0.0.1:8000/${response.data.user.profile_image}`); // Set default image preview
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
        router.push("/login");
      });
  }, [router]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

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

      setUser (response.data.user);
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-900">
      <Sidebar />
      <div className={`flex-1 flex items-center justify-center p-4 md:p-6 transition-transform duration-300 ${editing ? 'translate-x-[-300px]' : ''}`}>
        <div className="card w-full max-w-4xl h-auto bg-gray-900 rounded-xl shadow-2xl p-6 flex flex-col md:flex-row border-4 border-green-900 relative">
          <h1 className="absolute top-[-96px] left-1/2 transform -translate-x-1/2 text-3xl md:text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-lg">
            USER PROFILE
          </h1>

          <div className="img-container w-full md:w-2/4 h-auto p-4 bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center border-4 border-gray-700 mt-8">
            {user?.profile_image ? (
              <img
                className="w-full h-full object-cover rounded-xl"
                src={`http://127.0.0.1:8000/${user.profile_image}`}
                alt="Profile"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                No Image
              </div>
            )}
          </div>

          <div className="info-container w-full md:w-2/3 flex flex-col items-center justify-center text-center pl-0 md:pl-6 mt-4 md:mt-0">
            <div className="logo-container mb-4">
              <img
                src="/infini.png" // Replace with your logo path
                alt="Logo"
                className="place-items-right w-full h-24 object-contain"
              />
            </div>

            <span className="mt-4 text-gray-300 text-2xl md:text-3xl font-bold">{user?.username}</span>
            <p className="job text-lg text-gray-400 mt-1">{user?.email}</p>
            <br />
            <div className="flex justify-center items-center w-full">
              <button
                onClick={() => {
                  setEditing((prev) => !prev); // Toggle editing state
                  if (!editing) {
                    setUsername(user?.username);
                    setEmail(user?.email);
                    setImagePreview(`http://127.0.0.1:8000/${user.profile_image}`); // Set default image preview when editing starts
                  }
                }}
                className="w-[120px] h-[40px] rounded-full border border-white/40 bg-black flex items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden relative group"
              >
                <span className="w-[110px] h-[30px] bg-gradient-to-b from-green-400 to-purple-600 rounded-full flex items-center justify-center transition-all duration-300 group-hover:w-[100px]">
                  <FaEdit className="text-white text-lg mr-2 transition-all duration-300" />
                  <span className="text-white text-sm transition-all duration-300">
                    {editing ? "Close" : "Edit"}
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sliding Edit Form */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-gray-800 p-6 transition-transform transform ${
          editing ? "translate-x-0" : "translate-x-full"
        } shadow-lg z-50 flex flex-col items-center justify-center border-4 border-green-500 rounded-l-lg`}
      >
        <h2 className="text-xl font-bold text-center text-gray-300 mb-4">Edit Profile</h2>
        
        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-4">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-24 h-24 object-cover rounded-full border-2 border-green-400"
            />
          </div>
        )}

        <div className="flex flex-col mb-4 w-full">
          <label className="text-gray-300" htmlFor="username">Employee Name:</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-2 rounded-md bg-gray-700 text-gray-300 border border-green-400 focus:outline-none focus:ring focus:ring-green-500"
            placeholder="Username"
          />
        </div>
        <div className="flex flex-col mb-4 w-full">
          <label className="text-gray-300" htmlFor="email">Personal Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 rounded-md bg-gray-700 text-gray-300 border border-green-400 focus:outline-none focus:ring focus:ring-green-500"
            placeholder="Email"
          />
        </div>
        <div className="flex flex-col mb-4 w-full">
          <label className="text-gray-300" htmlFor="profileImage">Profile Image:</label>
          <input
            type="file"
            onChange={handleImageChange}
            className="p-2 rounded-md bg-gray-700 text-gray-300 border border-green-400 focus:outline-none focus:ring focus:ring-green-500"
          />
        </div>
        <div className="flex justify-between mt-4 w-full">
          <button
            onClick={handleSave}
            className="bg-green-500 hover:bg-green-400 py-2 px-4 rounded-md text-lg font-bold transition duration-200"
          >
            <FaSave className="mr-2 inline" /> Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="bg-red-500 hover:bg-red-400 py-2 px-4 rounded-md text-lg font-bold transition duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default authUser (TodoPage);