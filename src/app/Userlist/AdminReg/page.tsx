"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Head from "next/head";
import Adminbar from "@/app/Components/adminsidebar";
import authUser  from "@/app/utils/authUser";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface AdminUser  {
  id: number;
  username: string;
  email: string;
  profile_image?: string;
}

const Dashboard = () => {
  const [userStats, setUsertats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [admins, setAdmins] = useState<AdminUser []>([]);
  const [adminToDelete, setAdminToDelete] = useState<number | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    profile_image: null as File | null,
  });
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/admins");
      setAdmins(response.data);
    } catch (error: any) {
      setError(error.message || "Error fetching admins");
      toast.error("Error fetching admins");
    }
  };

  const deleteAdmin = async () => {
    if (adminToDelete === null) return; // Prevents unnecessary API call
    try {
      await axios.delete(`http://127.0.0.1:8000/api/admins/${adminToDelete}`);
      fetchAdmins(); // Refresh the admin list after deletion
      setConfirmDeleteModal(false); // Close the modal
      toast.success("Admin deleted successfully.");
    } catch (error) {
      console.error("There was an error deleting the admin:", error);
      setError("Failed to delete the admin.");
      toast.error("Failed to delete the admin.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Inline validation
    switch (name) {
      case "username":
        setErrors((prev) => ({
          ...prev,
          username: value.length < 3 ? "Username must be at least 3 characters long." : "",
        }));
        break;
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setErrors((prev) => ({
          ...prev,
          email: !emailRegex.test(value) ? "Invalid email address." : "",
        }));
        break;
      case "password":
        setErrors((prev) => ({
          ...prev,
          password: value.length < 6 ? "Password must be at least 6 characters long." : "",
        }));
        break;
      case "confirmPassword":
        setErrors((prev) => ({
          ...prev,
          confirmPassword: value !== formData.password ? "Passwords do not match." : "",
        }));
        break;
      default:
        break;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({ ...prev, profile_image: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(errors).some((error) => error)) {
      return; // Prevent submission if there are validation errors
    }

    const form = new FormData();
    form.append("username", formData.username);
    form.append("email", formData.email);
    form.append("password", formData.password);
    form.append("password_confirmation", formData.confirmPassword);
    if (formData.profile_image) {
      form.append("profile_image", formData.profile_image);
    }

    try {
      await axios.post("http://127.0.0.1:8000/api/Adminregister", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchAdmins();
      setFormData({ username: "", email: "", password: "", confirmPassword: "", profile_image: null });
      setShowModal(false); // Close the modal after successful registration
      toast.success("Admin registered successfully.");
    } catch (error: any) {
      setError(error.response?.data || "Error registering admin");
      toast.error(error.response?.data || "Error registering admin");
    }
  };

  // Find the username of the admin to delete
  const adminToDeleteUsername = adminToDelete !== null ? admins.find(admin => admin.id === adminToDelete)?.username : '';

  return (
    <>
      <Head>
        <title>Dashboard | Admin Panel</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <ToastContainer />

      <div className="flex min-h-screen bg-gray-900 text-white">
        <Adminbar />

        <div className="flex-1 p-6">
        <div className="flex justify-center items-center ">
  <h3 className="text-3xl font-bold text-green-500">Admin Dashboard</h3>
</div>
          {/* Button to open the modal */}
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 text-white py-2 px-4 rounded mt-4"
          >
            Register Admin
          </button>

          {/* Modal for the registration form */}
          {showModal && (
            <div className={`fixed inset-y-0 right-0 transform transition-transform duration-300 ${showModal ? 'translate-x-0' : 'translate-x-full'} bg-gray-900 w-[430px] p-10 shadow-2xl rounded-l-lg z-50 border border-green-500`}>
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-green-500">Register Admin</h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-white text-2xl focus:outline-none"
                >
                  &times; {/* This is the "X" character */}
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-600 rounded text-gray-800"
                />
                {errors.username && <p className="text-red-500">{errors.username}</p>}

                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-600 rounded text-gray-800"
                />
                {errors.email && <p className="text-red-500">{errors.email}</p>}

                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-600 rounded text-gray-800"
                />
                {errors.password && <p className="text-red-500">{errors.password}</p>}

                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-600 rounded text-gray-800"
                />
                {errors.confirmPassword && <p className="text-red-500">{errors.confirmPassword}</p>}

                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-gray-600 rounded"
                />
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-2 px-4 rounded"
                >
                  Register
                </button>
              </form>
            </div>
          )}

          <div className="container mx-auto mt-8">
            <h3 className="text-xl font-semibold">Admin List</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="p-4 border border-green-700 bg-gray-800 rounded-lg shadow-lg flex flex-col items-center"
                >
                  {admin.profile_image ? (
                    <img
                      src={`http://127.0.0.1:8000/${admin.profile_image}`}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover mb-4"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center mb-4">
                      <p className="text-gray-300">No Image</p>
                    </div>
                  )}
                  <h4 className="text-lg font-bold text-center text-white">{admin.username}</h4>
                  <p className="mt-2 text-center text-gray-400">{admin.email}</p>
                  <button
                    onClick={() => {
                      setAdminToDelete(admin.id);
                      setConfirmDeleteModal(true);
                    }}
                    className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded"
                  >
                    Delete Admin
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Confirmation Modal for Deletion */}
          {confirmDeleteModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-[29em]">
                <h2 className="text-xl font-bold text-white mb-4">Confirm Deletion</h2>
                <p className="text-white mb-4">Are you sure you want to delete {adminToDeleteUsername}?</p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setConfirmDeleteModal(false)}
                    className="bg-gray-300 text-black p-2 rounded hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={deleteAdmin}
                    className="bg-green-700 text-black p-2 rounded hover:bg-green-800 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default authUser (Dashboard);