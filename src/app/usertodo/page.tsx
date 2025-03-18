"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Head from "next/head";
import TaskForm from "./form"; // Import TaskForm component
import Archive from "./Archive";
import Adminbar from "../Components/adminsidebar";
import authUser  from "../utils/authUser";

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
  const [showLogoutModal, setShowLogoutModal] = useState(false);
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
        alert("Task archived successfully!");
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
        setArchivedTasks((prevArchived) => [...prevArchived, response.data]);
        setShowArchiveConfirmation(false); // Close the confirmation modal
      }
    } catch (error) {
      console.error("Error archiving task:", error);
      alert("Failed to archive task.");
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/tasks/${taskId}`);
      setTasks(tasks.filter((task) => task.id !== taskId));
      setShowDeleteConfirmation(false); // Close the confirmation modal
    } catch (error) {
      console.error("Error deleting task:", error);
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
    } catch (error) {
      console.error("Error updating visibility:", error);
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
        <Adminbar />
        <div className="container mx-auto p-4">
          <div className="w-full space-y-10 z-40 rounded-lg shadow-lg">
            <div>
              <br />
              <button
                onClick={() => setShowTableModal(true)}
                className="px-4 py-2 text-base sm:text-lg font-semibold text-white bg-green-600 border-2 border-gray-800 rounded-lg shadow-md transition-all duration-300 hover:bg-white hover:text-green-600 hover:border-green-600 hover:shadow-lg active:bg-green-500 active:shadow-none active:translate-y-1"
              >
                View Task 
              </button>

              <button
                onClick={() => setShowArchiveModal(true)}
                className="px-4 py-2 text-base sm:text-lg font-semibold text-white bg-green-600 border-2 border-gray-800 rounded-lg shadow-md transition-all duration-300 hover:bg-white hover:text-green-600 hover:border-green-600 hover:shadow-lg active:bg-green-500 active:shadow-none active:translate-y-1"
              >
                View Archived
              </button>
  
              <br />
              <br />
              <TaskForm tasks={tasks} setTasks={setTasks} editingTask={editingTask} setEditingTask={setEditingTask} />
            </div>
          </div>
        </div>
        {showTableModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div
              className="relative p-4 sm:p-8 rounded-lg border-4 border-green-800 shadow-lg bg-gray-700 w-full max-w-lg sm:max-w-4xl h-auto transition-all duration-300"
              style={{ translate: "-6px -6px" }}
            >
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <div className="text-lg sm:text-xl font-extrabold bg-gray-600 px-4 sm:px-8 py-2 sm:py-4 border-b-4 border-green-800 text-white rounded-lg shadow-lg">
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
          </div>
        )}

        {showArchiveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-700 p-8 rounded-lg shadow-lg text-white h-auto ">
              <h3 className="text-xl font-bold text-center mb-4">Archived Tasks</h3>
              <Archive />
              <button onClick={() => setShowArchiveModal(false)} className="w-full bg-green-600 hover:bg-green-500 py-2 px-4 rounded mt-4">Close</button>
            </div>
          </div>
        )}
  
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-700 p-6 rounded-lg shadow-lg text-white w-96">
              <h3 className="text-xl font-bold text-center mb-4">Confirm Logout</h3>
              <button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-500 py-2 px-4 rounded transition">
                ✅ Logout
              </button>
              <button onClick={() => setShowLogoutModal(false)} className="w-full bg-gray-600 hover:bg-gray-500 py-2 px-4 rounded mt-2">
                Cancel
              </button>
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