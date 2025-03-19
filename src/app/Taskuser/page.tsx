"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from "next/navigation";
import Sidebar from "../Components/Sidebar";
import authUser  from "../utils/authUser";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { ToastContainer, toast } from 'react-toastify'; // Import toast and ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import CSS for toast notifications

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

const API_BASE_URL = "http://127.0.0.1:8000/api";

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
  const [userId, setUserId] = useState("")
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
  const statuses = ["Pending", "Complete", "Overdue", "Archived"];
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1;
  const router = useRouter();
  const [dependencies, setDependencies] = useState<Activity[]>([]);
  const [users, setUsers] = useState<{ id: number; username: string }[]>([]); // New state for users

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
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "light") {
      setIsLightMode(true);
    }
  }, []);

  useEffect(() => {
    const checkAlarms = setInterval(async () => {
      const now = new Date();
      for (const activity of activities) {
        const activityTime = new Date(activity.due_date);
        if (activity.status === 'pending') {
          if (activityTime < now) {
            await handleOverdue(activity.id);
          } else {
            if (
              activityTime.getFullYear() === now.getFullYear() &&
              activityTime.getMonth() === now.getMonth() &&
              activityTime.getDate() === now.getDate() &&
              activityTime.getHours() === now.getHours() &&
              activityTime.getMinutes() - 1 === now.getMinutes()
            ) {
              playAlarm(); // Trigger alarm at exact time
            }
          }
        }
      }
    }, 500);

    return () => clearInterval(checkAlarms);
  }, [activities]);

  useEffect(() => {
    fetchActivities();
    fetchUsers(); // Fetch users when the component mounts

    const userIdSetter = async () => {
      const authToken = sessionStorage.getItem("authToken");
      const userResponse = await axios.get(`${API_BASE_URL}/user/${authToken}`);
      setUserId(userResponse.data.id)
    }
    userIdSetter()
  }, []);



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const authToken = sessionStorage.getItem("authToken");
      if (!authToken) {
        console.error("No authToken found in sessionStorage.");
        return;
      }

      const userResponse = await axios.get(`${API_BASE_URL}/user/${authToken}`);
      setUserId(userResponse.data.id)

      if (!userId) {
        console.error("User  ID not found.");
        return;
      }

      const newFormData = { ...formData, user_id: userId, collaborators: formData.collaborators || [] };

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

  const [isLightMode, setIsLightMode] = useState<boolean>(false); // State for light mode
  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this activity?')) {
      try {
        await axios.delete(`${API_BASE_URL}/activities/${id}`);
        toast.success("Activity deleted successfully!"); // Use toast for success message
        fetchActivities();
      } catch (error) {
        console.error("Error deleting activity:", error);
        toast.error("Error deleting activity."); // Use toast for error message
      }
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

  const handleArchive = async (id: number) => {
    try {
      await axios.put(`${API_BASE_URL}/activities/${id}/archive`);
      toast.success("Activity archived successfully!"); // Use toast for success message
      fetchActivities();
    } catch (error) {
      console.error("Error archiving activity:", error);
      toast.error("Error archiving activity."); // Use toast for error message
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

  const totalPages = Math.ceil((selectedStatus !== "archived" ? activities.filter(activity => activity.status === selectedStatus && !activity.archive).length : activities.filter(activity => activity.archive).length) / itemsPerPage);
  const currentActivities = (selectedStatus !== "archived" ? activities.filter(activity => activity.status === selectedStatus && !activity.archive) : activities.filter(activity => activity.archive)).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const completedActivities = activities.filter(activity => activity.status === 'complete').length;
  const totalActivities = activities.length;
  const completionPercentage = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;

  console.log(userId)

  return (
    <div className={`relative flex min-h-screen ${isLightMode ? 'bg-white text-gray-900' : 'bg-gray-900 text-gray-900'}`}>
      <ToastContainer position="top-right" autoClose={3000} />
      <Sidebar />
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-bold"></div>
          <button
            onClick={() => setIsLightMode(!isLightMode)}
            className={`p-2 rounded-md ${isLightMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}
          >
            {isLightMode ? '☀️' : '🌙'}
          </button>
        </div>
        <div className="flex-1 bg-gray-900 text-white flex items-center justify-center p-10">
          <div className="p-4 border border-green-700 w-full max-w-4xl bg-gray-900 rounded-lg shadow-lg">
            <button
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1 text-lg font-bold text-black bg-green-500 border-2 border-black rounded-full shadow-lg transition-all duration-300 ease-in-out cursor-pointer hover:bg-gray-900 hover:text-green-500 hover:border-green-500 hover:shadow-green-700 active:bg-green-300 active:shadow-none active:translate-y-1"
            >
              ➕ 
            </button>
  
            <div className="mt-4">
              <h1 className="text-3xl md:text-5xl font-extrabold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-lg">
                Personal Task
              </h1>
              <br />
              <ProgressBar percentage={completionPercentage} />
              <br />
  
              <button 
  onClick={() => setOpen(!open)} 
  className="w-12 h-12 rounded-full bg-green-700 hover:bg-green-600 flex justify-center items-center relative"
>
  <h1 className="text-white text-sm">Status</h1>
</button>

              <br />
  
              {open && (
                <div className="absolute left-100 transform -translate-x-1/2 mt-1 w-32 bg-white text-green-900 rounded-md shadow-lg">
                  {statuses.map((status) => (
                    <button 
                      key={status} 
                      className="block w-full text-center px-1 py-2 hover:bg-white"
                      onClick={() => { setSelectedStatus(status.toLowerCase()); setOpen(false); }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
              <br />
  
              <div className="flex justify-center">
                <div className="grid grid-cols-1 gap-4 w-full rounded-lg shadow-lg">
                  {currentActivities.length > 0 && (
                    <div 
                      key={currentActivities[0].id} 
                      className="p-6 border border-green-700 bg-gray-900 text-white rounded-lg shadow-lg flex flex-col items-center text-center"
                    >
                      <h3 className="text-2xl md:text-3xl font-bold mb-2">{currentActivities[0].title}</h3>
                      <h3 className="text-xl md:text-2xl font-bold mb-2">{currentActivities[0].description}</h3>
                      <p className="mb-2 text-gray-400 text-lg font-semibold">Due: {currentActivities[0].due_date}</p>
                      <p className="mb-2 text-gray-400 text-lg font-semibold">Tags: {currentActivities[0].tags}</p>
                      <p className="mb-2 text-gray-400 text-lg font-semibold">Status: {currentActivities[0].status}</p>
                      <p className="mb-4 text-gray-400 text-lg font-semibold">Collaborators: {currentActivities[0].collaborator_name}</p> {/* Adjusted to display collaborators */}
  
                      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                        <button 
                          onClick={() => handleEdit(currentActivities[0])}
                          className="px-3 py-2 text-sm sm:text-base rounded-full text-white bg-green-600 transition hover:scale-105"
                        >
                          ✏️ Edit
                        </button>
  
                        {currentActivities[0].status === 'pending' && !currentActivities[0].archive && (
                          <button 
                            onClick={() => handleMarkAsDone(currentActivities[0].id)}
                            className="px-3 py-2 text-sm sm:text-base rounded-full text-white bg-blue-600 transition hover:scale-105"
                          >
                            ✅ Done
                          </button>
                        )}
  
                        {currentActivities[0].archive ? (
                          <button 
                            onClick={() => handleRestore(currentActivities[0].id)}
                            className="px-3 py-2 text-sm sm:text-base rounded-full text-white bg-yellow-600 transition hover:scale-105"
                          >
                            🔄 Restore
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleArchive(currentActivities[0].id)}
                            className="px-3 py-2 text-sm sm:text-base rounded-full text-white bg-yellow-600 transition hover:scale-105"
                          >
                            📁 Archive
                          </button>
                        )}
  
                        <button 
                          onClick={() => handleDelete(currentActivities[0].id)}
                          className="px-3 py-2 text-sm sm:text-base rounded-full text-white bg-red-600 transition hover:scale-105"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
  
              {/* Pagination Controls */}
              <div className="flex justify-between mt-4">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                  disabled={currentPage === 1} 
                  className="bg-gray-600 p-2 rounded text-white text-xs font-bold"
                >
                  -
                </button>
                <span className="self-center text-white text-xs font-bold">Page {currentPage} of {totalPages}</span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                  disabled={currentPage === totalPages} 
                  className="bg-gray-600 p-2 rounded text-white text-xs font-bold transform transition-transform duration-300 hover:scale-105 active:scale-95 shadow-lg"
                >
                  +
                </button>
              </div>
            </div>
            {isOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
                <div className="bg-green-900 p-6 rounded-lg shadow-lg w-full max-w-md relative flex flex-col items-center">
                  <button 
                    onClick={() => resetForm()} 
                    className="absolute top-2 right-2 text-white font-bold text-xl"
                  >
                    ×
                  </button>
                  <h2 className="text-xl font-bold mb-4 text-center">
                    {editId ? "Edit" : "Add"} Activity
                  </h2>
                  <form 
                    onSubmit={handleSubmit} 
                    className="w-full flex flex-col items-center gap-4"
                  >
                    <input 
                      type="text" 
                      name="title" 
                      placeholder="Title" 
                      value={formData.title} 
                      onChange={handleChange} 
                      className="border-4 border-black p-2 bg-gray-200 text-black text-lg font-bold rounded shadow-md w-full" 
                      required 
                    />
                    <textarea 
                      name="description" 
                      placeholder="Description" 
                      value={formData.description} 
                      onChange={handleChange} 
                      className="border-4 border-black p-2 bg-gray-200 text-black text-lg font-bold rounded shadow-md w-full"
                    ></textarea>
                    <input 
                      type="date" 
                      name="date_started" 
                      value={formData.date_started} 
                      onChange={handleChange} 
                      className="border-4 border-black p-2 bg-gray-200 text-black text-lg font-bold rounded shadow-md w-full" 
                      required 
                    />
                    <input 
                      type="datetime-local" 
                      name="due_date" 
                      value={formData.due_date} 
                      onChange={handleChange} 
                      className="border-4 border-black p-2 bg-gray-200 text-black text-lg font-bold rounded shadow-md w-full" 
                      required 
                    />
                    <input 
                      type="text" 
                      name="tags" 
                      placeholder="Tags" 
                      value={formData.tags} 
                      onChange={handleChange} 
                      className="border-4 border-black p-2 bg-gray-200 text-black text-lg font-bold rounded shadow-md w-full" 
                    />
                    
                    <div className="flex flex-col items-center w-full">
                      <h1 className="text-1xl md:text-2xl text-center text-black drop-shadow-lg">
                        Collaborators
                      </h1>
                      <br />
                      <select
                        name="collaborators"
                        multiple
                        value={formData.collaborators || []}
                        onChange={(e) => {
                          const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                          setFormData({ ...formData, collaborators: selectedOptions });
                        }}
                        className="border-4 border-black p-2 bg-gray-200 text-black text-lg font-bold rounded shadow-md w-full"
                      >
                        {users.filter((user) => user.id != Number(userId)).map(user => (
                          <option key={user.id} value={user.id}>
                            {user.username}
                          </option>
                        ))}
                      </select>
                    </div>
  
                    <button 
                      type="submit" 
                      className="bg-blue-800 border-4 border-black shadow-md p-2 text-lg font-bold cursor-pointer hover:bg-blue-900 w-full"
                    >
                      {editId ? "Update" : "Add"} Activity
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default authUser (ActivityPage);