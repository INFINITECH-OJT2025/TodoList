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
const EditModal = ({ isOpen, onClose, onUpdate, username, setUsername, email, setEmail, errors }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleUpdate = () => {
    setShowConfirmation(true);
  };

  const confirmUpdate = () => {
    onUpdate();
    setShowConfirmation(false);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-end bg-black bg-opacity-50 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      
    <div className={`fixed inset-y-0 right-0 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} bg-gray-800 w-[430px] p-10 shadow-2xl rounded-l-lg z-50  border border-green-500`}>
        <h2 className="text-xl font-bold mb-4 text-green-500">Edit User</h2>
        <div className="mb-4">
          <label className="block text-gray-300">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`border ${errors.username ? 'border-red-500' : 'border-gray-300'} p-2 w-full`}
          />
          {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`border ${errors.email ? 'border-red-500' : 'border-gray-300'} p-2 w-full`}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>
        <div className="flex justify-end">
          <button onClick={onClose} className="mr-2 bg-gray-600 p-2 rounded">Cancel</button>
          <button onClick={handleUpdate} className="bg-green-500 text-white p-2 rounded">Update</button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-green-500 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-white mb-4">Confirm Update</h2>
            <p className="text-white mb-4">Are you sure you want to update this user?</p>
            <div className="flex justify-end">
              <button onClick={() => setShowConfirmation(false)} className="mr-2 bg-gray-300 p-2 rounded">Cancel</button>
              <button onClick={confirmUpdate} className="bg-green-700 text-white p-2 rounded">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Modal for delete confirmation
const DeleteConfirmationModal = ({ isOpen, onClose, onDelete, username }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4">Confirm Deletion</h2>
        <p className="text-white mb-4">Are you sure you want to delete {username}?</p>
        <div className="flex justify-end">
          <button onClick={onClose} className="mr-2 bg-gray-300 p-2 rounded">Cancel</button>
          <button onClick={onDelete} className="bg-green-700 text-black p-2 rounded">Delete</button>
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser , setSelectedUser ] = useState(null);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [errors, setErrors] = useState({ username: "", email: "" });
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

     
      <div>
<Adminbar />
</div>

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
                      className="relative card bg-gray-700 border border-green-600 rounded-lg shadow-lg flex flex-col items-center p-5 transition-transform transform hover:scale-105"
                      key={user.id}
                    >
                      <div className="card-border-top"></div>
                      <div className="img">
                        <img
                          src={user.profile_image ? `http://127.0.0.1:8000/${user.profile_image}` : "/default-profile.png"}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover border-4 border-green-500 shadow-lg mb-3"
                        />
                      </div>
                      <span className="font-semibold text-white">{user.username}</span>
                      <p className="job text-gray-300 text-center mt-2">📧 {user.email}</p>

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
                            onClick={() => {
                              setSelectedUser (user);
                              setShowDeleteModal(true);
                            }}
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
        errors={errors}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={() => {
          handleDeleteUser (selectedUser .id);
          setShowDeleteModal(false);
        }}
        username={selectedUser  ? selectedUser .username : ""}
      />

      {/* Toast Container */}
      <ToastContainer />
    </>
  );
}

export default authUser (UsersTable);