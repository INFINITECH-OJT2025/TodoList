"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from "next/navigation";
import Sidebar from "../Components/Sidebar";
import authUser  from "../utils/authUser";
import Confirmation from "./Confirmation"; // Import the modal component
import Archive from "./Archive"; // Import the archive modal component

import { ToastContainer, toast } from 'react-toastify'; // Import toast and ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import CSS for toast notifications

import { ChevronLeft, ChevronRight } from "lucide-react";

interface Activity {
  id: number;
  title: string;
  description?: string;
  date_started: string;
  due_date: string;
  tags?: string;
  status: 'pending' | 'complete' | 'overdue';
  archive: boolean;
  dependencyId?: number;
  collaborators?: number[]; // New field for collaborators
  collaborator_name?: string,
}

const API_BASE_URL = "https://infinitech-api5.site/api";

const ProgressBar = ({ percentage }: { percentage: number }) => {
  return (
    <div className="w-full bg-gray-300 rounded-full dark:bg-gray-800 shadow-inner p-1">
      <div
        className="bg-green-600 text-xs font-bold text-white text-center p-1 leading-none rounded-full transition-all duration-300 shadow-md"
        style={{
          width: `${percentage}%`,
          background: "linear-gradient(135deg, #32CD32, #228B22)", // Green gradient
          boxShadow: "0 4px 6px rgba(0, 128, 0, 0.5)", // Green shadow
        }}
      >
        {percentage.toFixed(0)}%
      </div>
    </div>
  );
};

const ActivityPage = () => {
  const [userId, setUserId] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [formData, setFormData] = useState<Partial<Activity>>({
    title: "",
    description: "",
    date_started: "",
    due_date: "",
    tags: "",
    status: 'pending',
    archive: false,
    dependencyId: undefined,
    collaborators: [] // Initialize collaborators
  });
  const [open, setOpen] = useState(false);
  const statuses = ["All", "Pending", "Complete", "Overdue", "Archived"];
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("all"); // Set default to "all"
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // Set to 3 items per page
  const router = useRouter();
  const [dependencies, setDependencies] = useState<Activity[]>([]);
  const [users, setUsers] = useState<{ id: number; username: string }[]>([]); // New state for users
  const [activityData, setActivityData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const alarmSound = new Audio("/alarm-sound.mp3");

  const playAlarm = () => {
    alarmSound.currentTime = 0;

    alarmSound.play().catch(error => {
      console.error("Error playing alarm sound:", error);
    });
  };

  const fetchActivities = async () => {
    try {
      const authToken = sessionStorage.getItem("authToken");
      if (!authToken) {
        console.error("No authToken found in sessionStorage.");
        return;
      }
      const response = await axios.get(`${API_BASE_URL}/activities/${authToken}`);
      setActivities(response.data);
      setDependencies(response.data);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`); // Adjust the endpoint as necessary
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchActivities();
    fetchUsers(); // Fetch users when the component mounts

    const userIdSetter = async () => {
      const authToken = sessionStorage.getItem("authToken");
      const userResponse = await axios.get(`${API_BASE_URL}/user/${authToken}`);
      setUserId(userResponse.data.id);
    }
    userIdSetter();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title) {
      toast.error("Title is required.");
      return;
    }

    if (!formData.description) {
      toast.error("Description is required.");
      return;
    }

    if (!formData.date_started) {
      toast.error("Start date is required.");
      return;
    }

    if (!formData.due_date) {
      toast.error("Due date is required.");
      return;
    }

    // Check if tags are required and validate
    if (!formData.tags) {
      toast.error("At least one tag is required.");
      return;
    }

    // Convert dates to Date objects for comparison
    const dateStarted = new Date(formData.date_started);
    const dueDate = new Date(formData.due_date);

    if (dueDate <= dateStarted) {
      toast.error("Due date must be after the start date.");
      return;
    }

    try {
      const authToken = sessionStorage.getItem("authToken");
      if (!authToken) {
        console.error("No authToken found in sessionStorage.");
        return;
      }

      const userResponse = await axios.get(`${API_BASE_URL}/user/${authToken}`);
      setUserId(userResponse.data.id);

      if (!userId) {
        console.error("User  ID not found.");
        return;
      }

      // Include all relevant fields in the newFormData
      const newFormData = {
        ...formData,
        user_id: userId,
        collaborators: formData.collaborators || []
      };

      if (editId) {
        await axios.put(`${API_BASE_URL}/activities/${editId}`, newFormData);
        toast.success("Activity updated successfully!"); // Use toast for success message
      } else {
        await axios.post(`${API_BASE_URL}/activities`, newFormData);
        toast.success("Activity created successfully!"); // Use toast for success message
      }

      resetForm();
      fetchActivities();
    } catch (error: any) {
      console.error("Error submitting form:", error.response?.data || error.message);
      toast.error("An error occurred while submitting the form. Please try again."); // Use toast for error message
    }
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", date_started: "", due_date: "", tags: "", status: 'pending', archive: false, dependencyId: undefined, collaborators: [] });
    setEditId(null);
    setIsOpen(false);
  };

  const handleEdit = (activity: Activity) => {
    setFormData({
      title: activity.title,
      description: activity.description || "",
      date_started: activity.date_started,
      due_date: activity.due_date,
      tags: activity.tags || "",
      status: activity.status,
      archive: activity.archive,
      dependencyId: activity.dependencyId,
      collaborators: activity.collaborators || [] // Set collaborators for editing
    });
    setEditId(activity.id);
    setIsOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setSelectedId(id);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedId !== null) {
      try {
        await axios.delete(`${API_BASE_URL}/activities/${selectedId}`);
        toast.success("Activity deleted successfully!");
        fetchActivities();
      } catch (error) {
        console.error("Error deleting activity:", error);
        toast.error("Error deleting activity.");
      }
      setIsModalOpen(false);
    }
  };

  const handleMarkAsDone = async (id: number) => {
    try {
      await axios.put(`${API_BASE_URL}/activities/${id}/done`);
      toast.success("Activity marked as done!"); // Use toast for success message
      fetchActivities();
    } catch (error) {
      console.error("Error marking activity as done:", error);
      toast.error("Error marking activity as done."); // Use toast for error message
    }
  };

  const handleArchiveClick = (id: number) => {
    setSelectedId(id);
    setIsArchiveModalOpen(true);
  };

  const handleArchiveConfirm = async () => {
    if (selectedId !== null) {
      try {
        await axios.put(`${API_BASE_URL}/activities/${selectedId}/archive`);
        toast.success("Activity archived successfully!");
        fetchActivities();
      } catch (error) {
        console.error("Error archiving activity:", error);
        toast.error("Error archiving activity.");
      }
      setIsArchiveModalOpen(false);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await axios.put(`${API_BASE_URL}/activities/${id}/restore`);
      toast.success("Activity restored successfully!"); // Use toast for success message
      fetchActivities();
    } catch (error) {
      console.error("Error restoring activity:", error);
      toast.error("Error restoring activity."); // Use toast for error message
    }
  };

  const handleOverdue = async (id: number) => {
    try {
      console.log(`Updating activity ${id} to overdue status.`);
      const response = await axios.put(`${API_BASE_URL}/activities/${id}/overdue`);
      console.log("Response from server:", response.data);
      fetchActivities();
    } catch (error) {
      console.error("Error updating activity to overdue:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data);
      }
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalPages = Math.ceil((selectedStatus !== "archived" ? activities.filter(activity => activity.status === selectedStatus && !activity.archive).length : activities.filter(activity => activity.archive).length) / itemsPerPage);
  const currentActivities = (selectedStatus === "all" 
    ? activities 
    : (selectedStatus !== "archived" 
      ? activities.filter(activity => activity.status === selectedStatus && !activity.archive) 
      : activities.filter(activity => activity.archive))
  ).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const completedActivities = activities.filter(activity => activity.status === 'complete').length;
  const totalActivities = activities.length;
  const completionPercentage = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;
  const [isMobile, setIsMobile] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative flex min-h-screen bg-gray-900 text-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />
      <Sidebar />
      <div className="sticky top-0 h-screen w-64 bg-gray-800 shadow-lg hidden md:block">
      </div>
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="flex items-center h-24 justify-center mb-6">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="mx-10 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-800 to-gray-600">
            PERSONAL TASK
          </span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>
        <div className="mt-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <div className="relative inline-block w-full">
                <div className="flex justify-center w-full">
                  <button
                    onClick={() => setOpen(!open)}
                    className="flex items-center justify-center px-5 py-2 text-lg font-bold text-white bg-green-700 border-2 border-gray-500 shadow-lg transition-all duration-300 ease-in-out cursor-pointer hover:bg-green-600 hover:border-gray-400 hover:shadow-xl active:bg-green-500 active:shadow-none active:translate-y-1 w-full md:w-auto"
                    style={{
                      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.4), inset 0 2px 5px rgba(255, 255, 255, 0.2)",
                      borderRadius: "8px",
                    }}
                  >
                    STATUS
                  </button>
                </div>

                {open && (
                  <div
                    className={`absolute bg-gray-800 p-2 rounded-lg shadow-lg z-50 border border-green-500 transition-transform duration-300 ease-in-out 
                      ${isMobile 
                        ? "top-full left-1/2 transform -translate-x-1/2 mt-3 w-full"  // Mobile: Centered dropdown
                        : "top-0 left-full w-[500px] translate-x-3"}  // Full Screen: Wider & Slides Right
                    `}
                  >
                    <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-4"} gap-2`}>
                      {statuses.map((status) => (
                        <button
                          key={status}
                          className={`p-3 rounded-md bg-gray-800 text-green-500 hover:bg-gray-800 transition flex items-center justify-center 
                            ${isMobile ? "w-full" : "w-[120px]"}`}  // Full screen: Wider buttons
                          onClick={() => {
                            setSelectedStatus(status.toLowerCase());
                            setOpen(false);
                          }}
                        >
                          <span className="text-2xl">
                            {status === "Pending"
                              ? "⏳"
                              : status === "Complete"
                              ? "✅"
                              : status === "Overdue"
                              ? "❌"
                              : status === "Archived"
                              ? "📦"
                              : "❓"}
                          </span>
                          {!isMobile && <span className="ml-2">{status}</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-center w-full md:w-auto">
              <button
  onClick={() => setIsOpen((prev) => !prev)}
  className="flex items-center justify-center px-4 py-2 text-lg font-bold text-white bg-green-700 border-2 border-gray-500 shadow-lg transition-all duration-300 ease-in-out cursor-pointer hover:bg-green-600 hover:border-gray-400 hover:shadow-xl active:bg-green-500 active:shadow-none active:translate-y-1 w-full md:w-auto mx-auto"
  style={{
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.2)",
    borderRadius: "10px",
  }}
>
  {isOpen ? "CANCEL" : "CREATE "}
</button>

              </div>
            </div>
          </div>

          <br />
          <ProgressBar percentage={completionPercentage} />
          <br />
          <div className="flex justify-center w-full px-4 sm:px-6">
            <div className="min-w-full max-w-6xl p-4 sm:p-6 rounded-lg shadow-lg border border-green-500">
              {selectedStatus === "all" ? (
                  <div className="overflow-x-auto w-full">
      <table className="w-full bg-gray-800 text-gray-300 rounded-lg overflow-hidden text-sm sm:text-base">
        <thead>
          <tr className="bg-gray-900">
            <th className="py-3 px-4 sm:px-6 text-left">Title</th>
            <th className="py-3 px-4 sm:px-6 text-left">Status</th>
            <th className="py-3 px-4 sm:px-6 text-left">Due Date</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => (
            <tr key={activity.id} className="border-b border-gray-700">
              <td className="py-2 px-4 sm:px-6 break-words max-w-xs">{activity.title}</td>
              <td
                className={`py-2 px-4 sm:px-6 font-semibold ${
                  activity.status === "complete"
                    ? "text-green-500"
                    : activity.status === "overdue"
                    ? "text-red-500"
                    : "text-yellow-500"
                }`}
              >
                {activity.status.toUpperCase()}
              </td>
             <td className="py-2 px-4 sm:px-6">
  {new Date(activity.due_date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).replace(" ", "-")}
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
              ) : (
                currentActivities.length > 0 && (
                  <div
                    key={currentActivities[0].id}
                    className="relative p-6 sm:p-8 bg-gray-900 text-white rounded-lg shadow-lg flex flex-col items-center text-center w-full"
                  >
                    <span
                      className={`absolute top-4 right-4 px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-lg font-semibold rounded-full border border-gray-500 uppercase ${
                        currentActivities[0].status === 'pending'
                          ? 'bg-yellow-500 text-gray-900'
                          : currentActivities[0].status === 'complete'
                          ? 'bg-green-500 text-gray-900'
                          : 'bg-red-500 text-gray-900'
                      }`}
                    >
                      📌 {currentActivities[0].status.toUpperCase()}
                    </span>

                    <h1 className="text-2xl sm:text-6xl font-bold mt-6 sm:mt-8 mb-3 sm:mb-4 bg-gradient-to-r from-green-400 to-gray-600 bg-clip-text text-transparent">
                      {currentActivities[0].title}
                    </h1>
                    <br />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6 bg-gray-800 rounded-lg shadow-lg w-full">
                      <div className="p-4 sm:p-6">
                        <p className="mb-2 sm:mb-4 text-green-300 text-sm sm:text-lg font-semibold text-center">
                          📅 Due: {new Date(currentActivities[0].due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                            .toUpperCase()
                            .replace(/, /g, '-')
                            .replace(/ /g, '-')}
                        </p>
                        <p className="mb-2 sm:mb-4 text-green-300 text-sm sm:text-lg font-semibold text-center">
                          🏷️ Tags: {currentActivities[0].tags}
                        </p>
                      </div>

                      <div className="p-4 sm:p-6 w-full max-w-3xl mx-auto">
                        <h3
                          className={`text-sm sm:text-lg font-semibold text-gray-300 text-justify mx-auto max-w-2xl indent-8 break-words transition-all duration-300`}
                          style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
                        >
                          {expanded || currentActivities[0].description.length <= 50
                            ? currentActivities[0].description
                            : `${currentActivities[0].description.substring(0, 50)}...`}
                        </h3>

                        {currentActivities[0].description.length > 50 && (
                          <button
                            onClick={() => setExpanded(!expanded)}
                            className="mt-2 text-sm text-blue-400 hover:text-blue-600 focus:outline-none"
                          >
                            {expanded ? 'See Less' : 'See More'}
                          </button>
                        )}
                      </div>

                      <div className="p-4 sm:p-6">
                        <p className="mb-2 sm:mb-4 text-green-300 text-sm sm:text-lg font-semibold text-center">
                          👥 Collaborators: {currentActivities[0].collaborator_name}
                        </p>
                      </div>
                    </div>

                    {/* Buttons Section */}
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-4 sm:mt-6">
                      {/* Conditionally render the Edit button only if the activity is not overdue */}
                      {currentActivities[0].status !== 'overdue' && (
                        <button
                          onClick={() => handleEdit(currentActivities[0])}
                          className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-lg rounded-full text-white bg-gray-700 transition hover:bg-gray-600"
                        >
                          ✏️ Edit
                        </button>
                      )}

                      {currentActivities[0].status === 'pending' && !currentActivities[0].archive && (
                        <button
                          onClick={() => handleMarkAsDone(currentActivities[0].id)}
                          className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-lg rounded-full text-white bg-green-600 transition hover:bg-green-500"
                        >
                          ✅ Done
                        </button>
                      )}

                      {currentActivities[0].archive ? (
                        <button
                          onClick={() => handleRestore(currentActivities[0].id)}
                          className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-lg rounded-full text-white bg-yellow-600 transition hover:bg-yellow-500"
                        >
                          🔄 Restore
                        </button>
                      ) : (
                        <button
                          onClick={() => handleArchiveClick(currentActivities[0].id)}
                          className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-lg rounded-full text-white bg-yellow-600 transition hover:bg-yellow-500"
                        >
                          📁 Archive
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteClick(currentActivities[0].id)}
                        className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-lg rounded-full text-white bg-red-600 transition hover:bg-red-500"
                      >
                        🗑️ Delete
                      </button>
                    </div>

                    {/* Confirmation Modals */}
                    <Confirmation
                      isOpen={isModalOpen}
                      onClose={() => setIsModalOpen(false)}
                      onConfirm={handleDeleteConfirm}
                      title="Delete Activity"
                      message="Are you sure you want to delete this activity? This action cannot be undone."
                    />
                    <Archive
                      isOpen={isArchiveModalOpen}
                      onClose={() => setIsArchiveModalOpen(false)}
                      onConfirm={handleArchiveConfirm}
                      title="Archive Activity"
                      message="Are you sure you want to archive this activity? You can restore it later."
                    />
                  </div>
                )
              )}
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="bg-gray-600 p-2 rounded text-white text-xs font-bold flex items-center gap-1 transition-transform duration-300 hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <span className="self-center text-white text-xs font-bold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="bg-gray-600 p-2 rounded text-white text-xs font-bold flex items-center gap-1 transition-transform duration-300 hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Right Sidebar for Adding/Editing Activity */}
        <div className={`fixed inset-y-0 right-0 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} bg-gray-800 w-[430px] p-10 shadow-2xl rounded-l-lg z-50 border border-gray-500`}>
          <button
            onClick={() => resetForm()}
            className="absolute top-4 right-4 text-white text-2xl font-bold hover:text-gray-400"
          >
            ×
          </button>

          <h2 className="text-2xl font-bold mb-6 text-center text-green-500">
            {editId ? "EDIT" : "ADD"} TASK
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col">
              <label className="text-white text-lg font-bold" htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="Title"
                value={formData.title}
                onChange={handleChange}
                className="bg-transparent border-b-2 border-gray-400 text-white text-lg p-2 focus:outline-none focus:border-green-500 font-bold"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-white text-lg font-bold" htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                className="bg-transparent border-b-2 border-gray-400 text-white text-lg p-2 focus:outline-none focus:border-green-500 font-bold"
              ></textarea>
            </div>

            <div className="flex flex-col">
              <label className="text-white text-lg font-bold" htmlFor="date_started">Date Started</label>
              <input
                type="date"
                id="date_started"
                name="date_started"
                value={formData.date_started}
                onChange={handleChange}
                className="bg-transparent border-b-2 border-gray-400 text-white text-lg p-2 focus:outline-none focus:border-green-500 font-bold"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-white text-lg font-bold" htmlFor="due_date">Due Date</label>
              <input
                type="datetime-local"
                id="due_date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="bg-transparent border-b-2 border-gray-400 text-white text-lg p-2 focus:outline-none focus:border-green-500 font-bold"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-white text-lg font-bold" htmlFor="tags">Tags</label>
              <input
                type="text"
                id="tags"
                name="tags"
                placeholder="Tags"
                value={formData.tags}
                onChange={handleChange}
                className="bg-transparent border-b-2 border-gray-400 text-white text-lg p-2 focus:outline-none focus:border-green-500 font-bold"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-white text-lg font-bold" htmlFor="collaborators">Collaborators</label>
              <select
                id="collaborators"
                name="collaborators"
                value={formData.collaborators?.[0] || ""}
                onChange={(e) =>
                  setFormData({ ...formData, collaborators: [parseInt(e.target.value)] })
                }
                className="bg-gray-800 text-white text-lg p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-bold"
              >
                <option value="" disabled>Select a collaborator</option>
                {users.filter((user) => user.id !== Number(userId)).map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="bg-green-600 text-white text-lg font-bold py-3 rounded-lg shadow-md hover:bg-green-700 transition-all"
            >
              {editId ? "Update" : "Add"} Activity
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default authUser (ActivityPage);
