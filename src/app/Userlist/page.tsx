"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Head from "next/head";
import Adminbar from "../Components/adminsidebar";
import { FiMoreVertical, FiChevronLeft, FiChevronRight, FiSearch } from "react-icons/fi";
import authUser  from "../utils/authUser";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from 'jspdf';

// Task Table Component
const TaskTable = ({ tasks }) => {
  if (!tasks || tasks.length === 0) {
    return <p className="text-gray-400">No tasks available for this user.</p>;
  }

  return (
    <table className="min-w-full bg-gray-800 border border-gray-700">
      <thead>
        <tr>
          <th className="py-2 px-4 border-b border-gray-700">Task ID</th>
          <th className="py-2 px-4 border-b border-gray-700">Title</th>
          <th className="py-2 px-4 border-b border-gray-700">Status</th>
          <th className="py-2 px-4 border-b border-gray-700">Due Date</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <tr key={task.id} className="hover:bg-gray-700">
            <td className="py-2 px-4 border-b border-gray-700">{task.id}</td>
            <td className="py-2 px-4 border-b border-gray-700">{task.title}</td>
            <td className="py-2 px-4 border-b border-gray-700">{task.status}</td>
            <td className="py-2 px-4 border-b border-gray-700">{task.deadline}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

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
      <div className={`fixed inset-y-0 right-0 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} bg-gray-800 w-[90%] sm:w-[400px] p-9 shadow-2xl rounded-l-lg z-50 border border-green-500`}>
        <h2 className="text-xl font-bold mb-4 text-green-500">Edit User</h2>
        <div className="mb-4">
          <label className="block text-gray-300">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`border ${errors.username ? 'border-red-500' : 'border-gray-300'} p-2 w-full bg-gray-700 text-gray-200`}
          />
          {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-gray-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`border ${errors.email ? 'border-red-500' : 'border-gray-300'} p-2 w-full bg-gray-700 text-gray-200`}
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
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
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
  const [userTasks, setUserTasks] = useState({});
  const [showTaskTable, setShowTaskTable] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const usersPerPage = 1; // Display one user per page
  const [searchId, setSearchId] = useState(""); // State for search input

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
      const response = await axios.get("https://infinitech-api5.site/api/users", {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("authToken")}` },
      });
      setUsers(response.data || []);
      fetchUserTasks(response.data);
    } catch (err) {
      setError("Failed to load users. Please try again later.");
      toast.error("Failed to load users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch tasks for each user
  const fetchUserTasks = async (users) => {
    if (!Array.isArray(users) || users.length === 0) {
      console.error("No users provided to fetch tasks.");
      return;
    }

    const tasksPromises = users.map(async (user) => {
      if (!user.id) {
        console.error("User  ID is missing for user:", user);
        return { userId: user.id, tasks: [] };
      }

      try {
        const response = await axios.get(`https://infinitech-api5.site/api/users/${user.id}/tasks`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("authToken")}` },
        });
        return { userId: user.id, tasks: response.data };
      } catch (error) {
        console.error(`Failed to fetch tasks for user ${user.id}:`, error.response ? error.response.data : error.message);
        return { userId: user.id, tasks: [] };
      }
    });

    try {
      const tasksResults = await Promise.all(tasksPromises);
      const tasksMap = {};
      tasksResults.forEach(({ userId, tasks }) => {
        tasksMap[userId] = tasks;
      });
      setUserTasks(tasksMap);
    } catch (error) {
      console.error("Error processing tasks results:", error);
    }
  };

  // Filter users based on search input
  const filteredUsers = users.filter(user => 
    user.id.toString().includes(searchId)
  );

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
      await axios.put(`https://infinitech-api5.site/api/users/${selectedUser .id}`, {
        username: editUsername,
        email: editEmail,
      });

      setShowEditModal(false);
      fetchUsers(); // Refresh user list
      toast.success("User  updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user. Please try again.");
    }
  };

  // Function to delete a user
  const handleDeleteUser  = async (userId) => {
    if (!userId) return;

    try {
      await axios.delete(`https://infinitech-api5.site/api/users/${userId}`);
      fetchUsers(); // Refresh user list after deletion
      toast.success("User  deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user. Please try again.");
    }
  };

  // Function to calculate task stats
  const calculateTaskStats = (userId) => {
    const tasks = userTasks[userId] || [];
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === "complete").length;
    const pendingTasks = tasks.filter(task => task.status === "pending").length;

    const overdueTasks = tasks.filter(task => {
      const deadline = new Date(task.deadline);
      return task.status !== "complete" && deadline < new Date();
    }).length;

    return { totalTasks, completedTasks, pendingTasks, overdueTasks, tasks };
  };

  // Function to handle showing tasks for a user
  const handleShowTasks = (user) => {
    setSelectedUser (user);
    setShowTaskTable(true);
  };

  // Function to generate PDF report for a specific user
  const generateUserReport = (user) => {
    const { totalTasks, completedTasks, pendingTasks, overdueTasks, tasks } = calculateTaskStats(user.id);
    const doc = new jsPDF();

    // Set font
    doc.setFont("courier", "bold");
    doc.setFontSize(14);
    
    // Background
    doc.setFillColor(220, 220, 220);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');

    // Header (Green Background)
    doc.setFillColor(0, 128, 0); 
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');
    doc.setTextColor(255, 255, 255);
    
    // Header Text
    const headerText = "InfiniteTask Report";
    const headerX = (doc.internal.pageSize.getWidth() - doc.getTextWidth(headerText)) / 2;
    doc.text(headerText, headerX, 25);

    // Add Logo Below Header
    const logoPath = "/infini.png"; 
    doc.addImage(logoPath, "PNG", 75, 50, 60, 40);

    // Move content down to prevent overlap
    let y = 100;

    // User Details
    doc.setTextColor(0, 0, 0);
    doc.text(`Report for: ${user.username}`, 20, y); y += 7;
    doc.text(`Email: ${user.email}`, 20, y); y += 7;
    doc.text(`Total Tasks: ${totalTasks}`, 20, y); y += 7;
    doc.text(`Completed Tasks: ${completedTasks}`, 20, y); y += 7;
    doc.text(`Pending Tasks: ${pendingTasks}`, 20, y); y += 7;
    doc.text(`Overdue Tasks: ${overdueTasks}`, 20, y); y += 12;

    // Task Details Section
    doc.setFontSize(14);
    doc.text("Task Details:", 20, y); y += 10;
    doc.setFontSize(12);

    // Table headers
    doc.setFont("courier", "bold");
    doc.text("No.", 20, y);
    doc.text("Task Details", 35, y);
    y += 7;
    doc.setFont("courier", "normal");

    // Task details - Wrapping long text
    tasks.forEach((task, index) => {
        let taskText = `ID: ${task.id}, Title: ${task.title || "N/A"}, Status: ${task.status}, Due: ${task.deadline}`;
        let wrappedText = doc.splitTextToSize(taskText, 150);
        doc.text((index + 1).toString(), 20, y);
        doc.text(wrappedText, 35, y);
        y += wrappedText.length * 6 + 5;
    });

    // Green Border
    doc.setDrawColor(0, 128, 0);
    doc.rect(10, 10, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 20);

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 10;
    doc.setFillColor(0, 128, 0);
    doc.rect(0, footerY - 10, doc.internal.pageSize.getWidth(), 15, 'F');
    doc.setTextColor(255, 255, 255);
    const footerText = "Generated by InfiniteTask";
    const footerX = (doc.internal.pageSize.getWidth() - doc.getTextWidth(footerText)) / 2;
    doc.text(footerText, footerX, footerY);

    // Save PDF
    doc.save(`${user.username}_report.pdf`);
  };

  // Pagination functions
  const nextPage = () => {
    if (currentPage < filteredUsers.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

 return (
    <>
      <Head>
        <title>Users List | Infi-Admin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex min-h-screen bg-gray-900 text-gray-100">
      
          <Adminbar />
      
        <div className="sticky top-0 h-screen w-64 bg-gray-800 shadow-lg hidden md:block">
      
      </div>
        <div className="flex-1 flex flex-col min-h-screen p-9 w-full overflow-auto">
        <div className="flex-1 flex flex-col items-center p-5 sm:p-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-green-500 text-center mb-4 sm:mb-6 drop-shadow-lg">
            User List
          </h2>

          <div className="flex justify-end mb-4 w-full">
  <div className="relative">
    <FiSearch className="absolute left-3 top-2 text-gray-400" />
    <input
      type="text"
      placeholder="Search by User ID"
      value={searchId}
      onChange={(e) => setSearchId(e.target.value)}
      className="pl-10 pr-4 py-2 rounded border border-gray-300 bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
    />
  </div>
</div>

          {loading ? (
            <p className="text-center text-gray-300 text-lg">Loading users...</p>
          ) : error ? (
            <p className="text-center text-red-500 text-lg">{error}</p>
          ) : (
            <>
            <div className="flex justify-end mb-4 w-full">
    <p className="text-gray-300 font-bold">
      Total Users: {filteredUsers.length}
    </p>
  </div>

              {filteredUsers.length > 0 && (
                <div className="w-full max-w-8xl grid grid-cols-1 gap-4 sm:gap-4">
                  <div
                    className="relative card bg-gray-800 border border-gray-600 rounded-lg shadow-lg flex flex-col items-start p-6 sm:p-8 transition-transform transform"
                    key={filteredUsers[currentPage].id}
                    style={{
                      borderImage: 'linear-gradient(to right, gold, green) 1',
                    }}
                  >
                    <div className="absolute top-4 right-4 cursor-pointer" onClick={() => setMenuOpen(menuOpen === filteredUsers[currentPage].id ? null : filteredUsers[currentPage].id)}>
                      <FiMoreVertical size={24} className="text-green-500" />
                    </div>
                    <div className="flex flex-col sm:flex-row items-center mb-3">
  <div className="img border-4 border-gradient-to-r from-green-400 to-gold rounded-lg shadow-lg overflow-hidden">
    <img
      src={filteredUsers[currentPage].profile_image ? `http://127.0.0.1:8000/${filteredUsers[currentPage].profile_image}` : "/default-profile.png"}
      alt="Profile"
      className="w-32 h-32 object-cover sm:w-40 sm:h-40" // Adjusted size for larger screens
    />
  </div>
  <div className="ml-0 sm:ml-4 flex flex-col mt-4 sm:mt-0"> {/* Added margin-top for small screens */}
    <span className="font-bold text-center text-black text-xl border border-green-500 rounded-lg p-1 bg-green-600">
      {filteredUsers[currentPage].username}
    </span>
    <p className="text-gray-300 text-center font-bold text-lg">Employer ID: {filteredUsers[currentPage].id}</p>
    <p className="text-gray-300 text-center font-bold text-lg">📧 {filteredUsers[currentPage].email}</p>
  </div>
</div>

                    {/* Task Stats */}
                    <div className="w-full mt-4">
                      <div className="flex flex-wrap -mx-2">
                        {/* Total Tasks */}
                        <div className="w-full sm:w-1/2 md:w-1/4 px-2 mb-4">
                          <div className="bg-blue-600 text-white rounded-lg shadow-md p-4 flex flex-col items-center text-center border border-black">
                            <div className="text-3xl mb-2">📋</div>
                            <p className="font-semibold">Total Tasks</p>
                            <p>{calculateTaskStats(filteredUsers[currentPage].id).totalTasks}</p>
                          </div>
                        </div>

                        {/* Completed Tasks */}
                        <div className="w-full sm:w-1/2 md:w-1/4 px-2 mb-4">
                          <div className="bg-green-600 text-white rounded-lg shadow-md p-4 flex flex-col items-center text-center border border-black">
                            <div className="text-3xl mb-2">✅</div>
                            <p className="font-semibold">Completed</p>
                            <p>{calculateTaskStats(filteredUsers[currentPage].id).completedTasks}</p>
                          </div>
                        </div>

                        {/* Pending Tasks */}
                        <div className="w-full sm:w-1/2 md:w-1/4 px-2 mb-4">
                          <div className="bg-yellow-600 text-white rounded-lg shadow-md p-4 flex flex-col items-center text-center border border-black">
                            <div className="text-3xl mb-2">⏳</div>
                            <p className="font-semibold">Pending</p>
                            <p>{calculateTaskStats(filteredUsers[currentPage].id).pendingTasks}</p>
                          </div>
                        </div>

                        {/* Overdue Tasks */}
                        <div className="w-full sm:w-1/2 md:w-1/4 px-2 mb-4">
                          <div className="bg-red-600 text-white rounded-lg shadow-md p-4 flex flex-col items-center text-center border border-black">
                            <div className="text-3xl mb-2">❌</div>
                            <p className="font-semibold">Overdue</p>
                            <p>{calculateTaskStats(filteredUsers[currentPage].id).overdueTasks}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <div className="bg-gray-900 p-4 rounded shadow border border-gray-900">
                          <div className="flex space-x-2 mb-2">
                            <button
                              onClick={() => handleShowTasks(filteredUsers[currentPage])}
                              className="bg-blue-500 text-white px-4 py-2 rounded"
                            >
                              View Tasks
                            </button>
                            <button
                              onClick={() => generateUserReport(filteredUsers[currentPage])}
                              className="bg-green-500 text-white px-4 py-2 rounded"
                            >
                              Generate PDF Report
                            </button>
                          </div>
                          <p className="text-green-400 font-semibold"> 📊 Task Completion</p>
                          <p className="text-white">{calculateTaskStats(filteredUsers[currentPage].id).totalTasks > 0 ? ((calculateTaskStats(filteredUsers[currentPage].id).completedTasks / calculateTaskStats(filteredUsers[currentPage].id).totalTasks) * 100).toFixed(0) : 0}%</p>
                          <div className="bg-gray-600 rounded-full h-2 mt-4">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${calculateTaskStats(filteredUsers[currentPage].id).totalTasks > 0 ? (calculateTaskStats(filteredUsers[currentPage].id).completedTasks / calculateTaskStats(filteredUsers[currentPage].id).totalTasks) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {menuOpen === filteredUsers[currentPage].id && (
                        <div className="absolute top-10 right-4 bg-gray-600 shadow-md rounded-lg overflow-hidden w-32 z-10 border border-gray-900">
                          <button
                            onClick={() => handleEditUser (filteredUsers[currentPage])}
                            className="block w-full px-4 py-2 text-left text-white hover:bg-gray-500"
                          >
                            📝 Edit
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser (filteredUsers[currentPage]);
                              setShowDeleteModal(true);
                            }}
                            className="block w-full px-4 py-2 text-left text-red-500 hover:bg-gray-500"
                          >
                            ❌ Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Pagination buttons */}
              <div className="flex justify-between gap-9 items-center mt-4">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 0}
                  className={`flex items-center bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 transition duration-200 ${currentPage === 0 ? 'opacity-50 cursor-not-allowed' : ''} mr-2`}
                >
                  <FiChevronLeft className="mr-2" />
                  
                </button>
                <button
                  onClick={nextPage}
                  disabled={currentPage >= filteredUsers.length - 1}
                  className={`flex items-center bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 transition duration-200 ${currentPage >= filteredUsers.length - 1 ? 'opacity-50 cursor-not-allowed' : ''} ml-2`}
                >
                  
                  <FiChevronRight className="ml-2" />
                </button>
              </div>
            </>
          )}
        </div>
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
          handleDeleteUser (selectedUser.id);
          setShowDeleteModal(false);
        }}
        username={selectedUser  ? selectedUser .username : ""}
      />

      {/* Task Table Modal */}
      {showTaskTable && (
        <div className={`fixed top-14 right-1 bg-gray-800 shadow-md rounded-lg border border-green-700 z-50 text-white transition-transform transform ${showTaskTable ? "translate-x-0" : "translate-x-full"} duration-300 h-auto p-4 max-w-full mx-4`}>
          <h2 className="text-xl sm:text-2xl text-green-500 font-bold mb-4">Tasks for {selectedUser?.username}</h2>
          <TaskTable tasks={userTasks[selectedUser ?.id]} />
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setShowTaskTable(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 transition duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer />
    </>
  );
}

export default authUser (UsersTable);
