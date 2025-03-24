"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Head from "next/head";
import TaskForm from "./form"; // Import TaskForm component
import Archive from "./Archive"; // Ensure this component is correctly implemented
import Adminbar from "../Components/adminsidebar";
import authUser  from "../utils/authUser";
import { ToastContainer, toast } from "react-toastify"; // Import toast and ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import CSS for toast notifications

const API_BASE_URL = "http://127.0.0.1:8000/api";

interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string;
  status: string;
  deadline: string;
  time_started: string;
  time_ended: string;
  time_spent: string;
  progress: string;
  created_at: string;
  updated_at: string;
  archived?: boolean;
  visibility?: string; // Added visibility property
}

const Dashboard = () => {
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
  const [showTableModal, setShowTableModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 1;
  const [expandedDescription, setExpandedDescription] = useState(false); // State for read more functionality
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false); // State for delete confirmation modal
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null); // Store the ID of the task to delete
  const [showArchiveConfirmation, setShowArchiveConfirmation] = useState(false); // State for archive confirmation modal
  const [taskToArchive, setTaskToArchive] = useState<number | null>(null); // Store the ID of the task to archive

  const totalPages = Math.ceil(tasks.length / itemsPerPage);
  const currentTask = tasks[currentPage];

  const router = useRouter();

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/notArchive`);
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Error fetching tasks."); // Show error toast
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userRole");
    router.push("/login");
  };

  const editTask = (task: Task) => {
    setEditingTask(task);
    setShowEditModal(true);
    setShowTableModal(false); // Close the modal when editing a task
  };

  const archiveTask = async (taskId: number) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/tasks/${taskId}/archive`);
      if (response.status === 200) {
        toast.success("Task archived successfully!"); // Show success toast
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
        setArchivedTasks((prevArchived) => [...prevArchived, response.data]);
        setShowArchiveConfirmation(false); // Close the confirmation modal
      }
    } catch (error) {
      console.error("Error archiving task:", error);
      toast.error("Failed to archive task."); // Show error toast
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/tasks/${taskId}`);
      setTasks(tasks.filter((task) => task.id !== taskId));
      setShowDeleteConfirmation(false); // Close the confirmation modal
      toast.success("Task deleted successfully!"); // Show success toast
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task."); // Show error toast
    }
  };

  const confirmDeleteTask = (taskId: number) => {
    setTaskToDelete(taskId); // Set the task ID to delete
    setShowDeleteConfirmation(true); // Show the confirmation modal
  };

  const confirmArchiveTask = (taskId: number) => {
    setTaskToArchive(taskId); // Set the task ID to archive
    setShowArchiveConfirmation(true); // Show the confirmation modal
  };

  const toggleVisibility = async (taskId: number) => {
    try {
      setLoading(true);
      await axios.put(`${API_BASE_URL}/tasks/${taskId}/toggle-visibility`);
      const updatedTasks = await axios.get(`${API_BASE_URL}/notArchive`);
      setTasks(updatedTasks.data);
      toast.success("Task visibility updated!"); // Show success toast
    } catch (error) {
      console.error("Error updating visibility:", error);
      toast.error("Failed to update visibility."); // Show error toast
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
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
  
      <div className="flex min-h-screen bg-gray-800 text-white">
        <ToastContainer position="top-right" autoClose={3000} />
        <Adminbar />
        <div className="container mx-auto p-4">
  <div className="w-full space-y-10 z-40 rounded-lg shadow-lg">
    
    <br />
    <button
      onClick={() => setShowTableModal(true)}
      className="px-4 py-2 text-base sm:text-lg font-semibold text-green-500 bg-gray-600 border-2 border-green-800 rounded-lg shadow-md transition-all duration-300 hover:bg-white hover:text-green-600 hover:border-green-600 hover:shadow-lg active:bg-green-500 active:shadow-none active:translate-y-1"
    >
      View Task 
    </button>

    <button
      onClick={() => setShowArchiveModal(true)}
      className="px-4 py-2 text-base sm:text-lg font-semibold text-green-500 bg-gray-600 border-2 border-green-800 rounded-lg shadow-md transition-all duration-300 hover:bg-white hover:text-green-600 hover:border-green-600 hover:shadow-lg active:bg-green-500 active:shadow-none active:translate-y-1"
    >
      View Archived
    </button>

    <br />
    <br />
    <TaskForm tasks={tasks} setTasks={setTasks} editingTask={editingTask} setEditingTask={setEditingTask} />
    
    {/* Add a gap at the bottom */}
    <div className="mb-10"></div> {/* Adjust the margin-bottom value as needed */}
  </div>
</div>

        {/* Task Table Modal */}
        {showTableModal && (
          <div className={`fixed inset-y-0 right-0 transform transition-transform duration-300 ${showTableModal ? 'translate-x-0' : 'translate-x-full'} bg-gray-800 w-[430px] p-10 shadow-2xl rounded-l-lg z-50 border border-green-500`}>
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <div className="text-xl sm:text-2xl font-extrabold bg-gray-600 px-4 sm:px-8 py-2 sm:py-4 border-b-4 border-green-800 text-white rounded-lg shadow-lg">
                Task Table
              </div>
              <button
                onClick={() => setShowTableModal(false)}
                className="text-white bg-green-600 rounded px-4 sm:px-6 py-2 sm:py-3"
              >
                Close
              </button>
            </div>

            <div className="max-h-80 sm:max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {currentTask && (
                  <div
                    key={currentTask.id}
                    className="relative p-4 sm:p-6 rounded-lg border-4 border-green-800 shadow-md bg-gray-600 transition-all duration-300 text-center"
                  >
                    <span
                      className={`absolute top-2 right-2 px-2 sm:px-3 py-1 text-xs sm:text-sm font-bold text-white rounded-md ${
                        currentTask.status === 'done' ? 'bg-green-600' :
                        currentTask.status === 'pending' ? 'bg-yellow-500' :
                        currentTask.status === 'overdue' ? 'bg-red-600' :
                        'bg-gray-500'
                      }`}
                    >
                      {currentTask.status.toUpperCase()}
                    </span>

                    <h4 className="text-lg sm:text-xl font-bold text-white">{currentTask.title}</h4>
                    <p className="text-gray-300 text-sm sm:text-base">
                      {expandedDescription ? currentTask.description : `${currentTask.description.substring(0, 120)}...`}
                      {currentTask.description.length > 120 && (
                        <button
                          onClick={() => setExpandedDescription(!expandedDescription)}
                          className="text-blue-400 hover:underline ml-1"
                        >
                          {expandedDescription ? "Read Less" : "Read More"}
                        </button>
                      )}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-300"><strong>Deadline:</strong> {currentTask.deadline}</p>
                    <p className="text-xs sm:text-sm text-gray-300"><strong>Started:</strong> {currentTask.time_started}</p>
                    <p className="text-xs sm:text-sm text-gray-300"><strong>Ended:</strong> {currentTask.time_ended}</p>

                    <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-4 justify-center">
                      <button
                        onClick={() => { editTask(currentTask); setShowTableModal(false); }}
                        className="py-2 px-4 sm:px-5 border-4 border-green-800 shadow-md bg-green-600 text-white transition-all duration-300 hover:translate-x-1 hover:translate-y-1 hover:shadow-[1px_1px_0px_#000] flex-shrink-0"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => confirmDeleteTask(currentTask.id)} // Open delete confirmation modal
                        className="py-2 px-4 sm:px-5 border-4 border-green-800 shadow-md bg-red-600 text-white transition-all duration-300 hover:translate-x-1 hover:translate-y-1 hover:shadow-[1px_1px_0px_#000] flex-shrink-0"
                      >
                        🗑️ Delete
                      </button>
                      <button
                        onClick={() => confirmArchiveTask(currentTask.id)} // Open archive confirmation modal
                        className="py-2 px-4 sm:px-5 border-4 border-green-800 shadow-md bg-blue-600 text-white transition-all duration-300 hover:translate-x-1 hover:translate-y-1 hover:shadow-[1px_1px_0px_#000] flex-shrink-0"
                      >
                        📦 Archive
                      </button>
                      <button
                        onClick={() => toggleVisibility(currentTask.id)}
                        disabled={loading}
                        className={`py-2 px-4 sm:px-5 border-4 border-green-800 shadow-md ${
                          currentTask.visibility === "visible" ? "bg-green-600" : "bg-gray-500"
                        } text-white transition-all duration-300 flex-shrink-0`}
                      >
                        {currentTask.visibility === "visible" ? "🔵 Visible" : "⚫ Invisible"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between mt-4 sm:mt-6">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 0}
                className="py-2 px-4 sm:py-3 sm:px-6 bg-green-600 text-white rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                className="py-2 px-4 sm:py-3 sm:px-6 bg-green-600 text-white rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Archive Modal */}
        {showArchiveModal && (
          <div className={`fixed inset-y-0 right-0 transform transition-transform duration-300 ${showArchiveModal ? 'translate-x-0' : 'translate-x-full'} bg-gray-800 w-[430px] p-10 shadow-2xl rounded-l-lg z-50 border border-green-500`}>
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <div className="text-xl sm:text-2xl font-extrabold bg-gray-600 px-4 sm:px-8 py-2 sm:py-4 border-b-4 border-green-800 text-white rounded-lg shadow-lg">
                Archived Tasks
              </div>
              <button
                onClick={() => setShowArchiveModal(false)}
                className="text-white bg-green-600 rounded px-4 sm:px-6 py-2 sm:py-3"
              >
                Close
              </button>
            </div>

            <div className="max-h-80 sm:max-h-96 overflow-y-auto">
              <Archive />
            </div>
          </div>
        )}

        {/* Confirmation Modal for Deleting Task */}
        {showDeleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-700 p-6 rounded-lg shadow-lg text-white w-96">
              <h3 className="text-xl font-bold text-center mb-4">Confirm Deletion</h3>
              <p className="text-center mb-4">Are you sure you want to delete this task?</p>
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    if (taskToDelete) {
                      deleteTask(taskToDelete);
                    }
                  }}
                  className="w-full bg-red-600 hover:bg-red-500 py-2 px-4 rounded transition"
                >
                  ✅ Delete
                </button>
                <button onClick={() => setShowDeleteConfirmation(false)} className="w-full bg-gray-600 hover:bg-gray-500 py-2 px-4 rounded transition">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal for Archiving Task */}
        {showArchiveConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-700 p-6 rounded-lg shadow-lg text-white w-96">
              <h3 className="text-xl font-bold text-center mb-4">Confirm Archive</h3>
              <p className="text-center mb-4">Are you sure you want to archive this task?</p>
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    if (taskToArchive) {
                      archiveTask(taskToArchive);
                    }
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-500 py-2 px-4 rounded transition"
                >
                  ✅ Archive
                </button>
                <button onClick={() => setShowArchiveConfirmation(false)} className="w-full bg-gray-600 hover:bg-gray-500 py-2 px-4 rounded transition">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default authUser (Dashboard);