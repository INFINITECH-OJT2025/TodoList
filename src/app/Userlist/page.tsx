"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Head from "next/head";
import Adminbar from "../Components/adminsidebar";
import { FiMoreVertical } from "react-icons/fi";
import authUser  from "../utils/authUser";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Modal for editing user details
const EditModal = ({ isOpen, onClose, onUpdate, username, setUsername, email, setEmail }) => {
  const [errors, setErrors] = useState({ username: "", email: "" });

  const validateForm = () => {
    let valid = true;
    const newErrors = { username: "", email: "" };

    if (!username) {
      newErrors.username = "Username is required.";
      valid = false;
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters long.";
      valid = false;
    }

    if (!email) {
      newErrors.email = "Email is required.";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email address is invalid.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleUpdate = () => {
    if (validateForm()) {
      onUpdate();
    } else {
      // Show toast notifications for each error
      if (errors.username) {
        toast.error(errors.username);
      }
      if (errors.email) {
        toast.error(errors.email);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white p-6 rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Edit User</h2>
        <div className="mb-4">
          <label className="block text-gray-700">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`border ${errors.username ? 'border-red-500' : 'border-gray-300'} p-2 w-full`}
          />
          {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`border ${errors.email ? 'border-red-500' : 'border-gray-300'} p-2 w-full`}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>
        <div className="flex justify-end">
          <button onClick={onClose} className="mr-2 bg-gray-300 p-2 rounded">Cancel</button>
          <button onClick={handleUpdate} className="bg-blue-500 text-white p-2 rounded">Update</button>
        </div>
      </div>
    </div>
  );
};

// Main component for displaying and managing users
const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser , setSelectedUser ] = useState(null);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(null);

  // Fetch users on component mount
  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
    } else {
      fetchUsers();
    }
  }, []);

  // Function to fetch users from the API
  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/users", {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("authToken")}` },
      });
      setUsers(response.data || []);
    } catch (err) {
      setError("Failed to load users. Please try again later.");
      toast.error("Failed to load users. Please try again later."); // Show error toast
    } finally {
      setLoading(false);
    }
  };

  // Function to handle user editing
  const handleEditUser  = (user) => {
    if (!user) return;
    setSelectedUser (user);
    setEditUsername(user.username || "");
    setEditEmail(user.email || "");
    setShowEditModal(true);
  };

  // Function to update user details
  const handleUpdateUser  = async () => {
    if (!selectedUser ) return;

    try {
      await axios.put(`http://127.0.0.1:8000/api/users/${selectedUser .id}`, {
        username: editUsername,
        email: editEmail,
      });

      setShowEditModal(false);
      fetchUsers(); // Refresh user list
      toast.success("User  updated successfully!"); // Show success toast
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user. Please try again."); // Show error toast
    }
  };

  // Function to delete a user
  const handleDeleteUser  = async (userId) => {
    if (!userId) return;

    const isConfirmed = window.confirm("Are you sure you want to delete this user?");
    if (!isConfirmed) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/users/${userId}`);
      fetchUsers(); // Refresh user list after deletion
      toast.success("User  deleted successfully!"); // Show success toast
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user. Please try again."); // Show error toast
    }
  };

  return (
    <>
      <Head>
        <title>Users List | Infi-Admin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex min-h-screen bg-gray-800 text-gray-100">
        <Adminbar />

        <div className="flex-1 flex flex-col items-center p-10">
          <h2 className="text-3xl font-bold text-green-500 text-center mb-6 drop-shadow-lg">
            User List
          </h2>

          {loading ? (
            <p className="text-center text-gray-300 text-lg">Loading users...</p>
          ) : error ? (
            <p className="text-center text-red-500 text-lg">{error}</p>
          ) : (
            <>
              <p className="text-center text-gray-300 mb-6">Total Users: {users.length}</p>

              <div className="w-full max-w-8xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.length > 0 ? (
                  users.map((user) => (
                    <div
                      className="relative p-5 bg-gray-700 border border-green-600 rounded-lg shadow-lg flex flex-col items-center"
                      key={user.id}
                    >
                      <img
                        src={user.profile_image ? `http://127.0.0.1:8000/${user.profile_image}` : "/default-profile.png"}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-4 border-green-500 shadow-lg mb-3"
                      />
                      <h3 className="text-lg font-semibold text-white">{user.username}</h3>
                      <p className="text-gray-300 text-center mt-2">📧 {user.email}</p>

                      <div className="absolute top-4 right-4 cursor-pointer" onClick={() => setMenuOpen(menuOpen === user.id ? null : user.id)}>
                        <FiMoreVertical size={24} className="text-green-500" />
                      </div>
                      {menuOpen === user.id && (
                        <div className="absolute top-10 right-4 bg-gray-600 shadow-md rounded-lg overflow-hidden w-32 z-10">
                          <button
                            onClick={() => handleEditUser (user)}
                            className="block w-full px-4 py-2 text-left text-white hover:bg-gray-500"
                          >
                            📝 Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser (user.id)}
                            className="block w-full px-4 py-2 text-left text-red-500 hover:bg-gray-500"
                          >
                            ❌ Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-4 col-span-full">No users found.</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <EditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onUpdate={handleUpdateUser }
        username={editUsername}
        setUsername={setEditUsername}
        email={editEmail}
        setEmail={setEditEmail}
      />

      {/* Toast Container */}
      <ToastContainer />
    </>
  );
}

export default authUser (UsersTable);