"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Sidebar from "../Components/Sidebar";
import { ToastContainer, toast } from "react-toastify"; // Import toast and ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import CSS for toast notifications
import authUser  from "../utils/authUser";
import { motion } from "framer-motion";

const TodoPage = () => {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1;

  useEffect(() => {
    const authenticateUser  = async () => {
      try {
        const authToken = sessionStorage.getItem("authToken");
        if (!authToken) {
          toast.error("Auth token not found"); // Show error toast
          setLoading(false);
          return;
        }

        const response = await axios.post("http://127.0.0.1:8000/api/getUserId", { authToken });
        setUserId(response.data.id);
        fetchTasks(response.data.id);
      } catch (error) {
        console.error("Failed to authenticate user:", error);
        toast.error("Failed to authenticate user"); // Show error toast
        setLoading(false);
      }
    };

    authenticateUser ();
  }, []);
  const completedTasks = tasks.filter((t) => t.status === "complete").length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;


  const fetchTasks = async (userId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/tasks/${userId}`);
      const now = new Date();

      const updatedTasks = response.data.map((task) => {
        const deadline = new Date(task.deadline);
        if (task.status !== "complete" && now > deadline) {
          updateTaskStatus(task.id, "overdue");
          return { ...task, status: "overdue" };
        }
        return task;
      });

      setTasks(updatedTasks);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      toast.error("Failed to fetch tasks"); // Show error toast
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await axios.patch(`http://127.0.0.1:8000/api/tasks/${taskId}/updateStatus`, { status });
    } catch (error) {
      console.error(`Failed to update task ${taskId} to ${status}:`, error);
      toast.error(`Failed to update task ${taskId}`); // Show error toast
    }
  };

  const markAsDone = async () => {
    if (!selectedTask) return;

    try {
      await axios.patch(`http://127.0.0.1:8000/api/tasks/${selectedTask.id}/markAsDone`, {
        status: "complete",
      });

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === selectedTask.id ? { ...task, status: "complete" } : task
        )
      );
      setShowModal(false);
      toast.success(`Task "${selectedTask.title}" marked as done!`); // Show success toast
    } catch (error) {
      console.error("Failed to mark task as done:", error);
      toast.error("Failed to mark task as done"); // Show error toast
    }
  };

  const totalPages = Math.ceil(tasks.length / itemsPerPage);
  const currentTask = tasks[(currentPage - 1) * itemsPerPage];

  // State to manage the expanded/collapsed state of the description
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      <ToastContainer position="top-right" autoClose={3000} /> {/* ToastContainer for notifications */}
      <Sidebar />
      <div className="flex-1 p-9 flex flex-col items-center">
        <h1 className="text-2xl font-extrabold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-gray-500 drop-shadow-lg">
          ADMIN TASK
        </h1>
        <br />

        <div className="relative w-full h-6 bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* 3D Background Layer */}
      <div className="absolute inset-0 bg-gray-900 rounded-lg shadow-inner" />

      {/* Animated Progress */}
      <motion.div
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-green-600 rounded-lg shadow-md"
        initial={{ width: "0%" }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />

      {/* Text Display */}
      <span className="absolute inset-0 flex justify-center items-center text-white font-bold drop-shadow-lg">
        {Math.round(progress)}%
      </span>
    </div>
        <br />
        <br />

        {loading ? (
          <p>Loading tasks...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          currentTask && (
            <div className="relative border-2 border-gray-700 bg-gray-800 p-4 shadow-lg transition-all rounded-lg flex flex-col items-center text-white text-center">
              {currentTask.tags && (
                <div
                  className={`absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg ${
                    currentTask.tags.includes("Hard")
                      ? "bg-red-500"
                      : currentTask.tags.includes("Medium")
                      ? "bg-orange-500"
                      : "bg-green-500"
                  }`}
                >
                  {Array.isArray(currentTask.tags) ? currentTask.tags.join(", ") : currentTask.tags}
                </div>
              )}
              <br />

              <div className="absolute top-2 right-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-bold tracking-wide ${
                    currentTask.status === "complete"
                      ? "bg-green-200 text-green-800"
                      : currentTask.status === "overdue"
                      ? "bg-red-200 text-red-800"
                      : "bg-yellow-200 text-yellow-800"
                  }`}
                >
                  {currentTask.status.toUpperCase()}
                </span>
              </div>
              <br />

              <h3 className="bg-green-600 text-white text-lg font-bold p-2 rounded-md w-full">
                {currentTask.title}
              </h3>
              <img
                src={
                  currentTask.status === "complete"
                    ? "/gifs/success.gif"
                    : currentTask.status === "overdue"
                    ? "/gifs/overdue.gif"
                    : "/gifs/pending.gif"
                }
                alt={currentTask.status}
                className="w-30 h-30 mt-3"
              />

              {/* Scrollable Description with See More functionality */}
              <div className={`overflow-y-auto ${isExpanded ? 'h-64' : 'h-40'} w-full border border-gray-800 p-4`}>
                {isExpanded ? currentTask.description : currentTask.description.substring(0, 300) + (currentTask.description.length > 50 ? '...' : '')}
              </div>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-blue-400 hover:underline"
              >
                {isExpanded ? 'See Less' : 'See More'}
              </button>

              <p
                className={`font-bold ${
                  currentTask.status === "overdue" ? "text-red-500" : "text-gray-300"
                }`}
              >
                <strong>Deadline:</strong> {new Date(currentTask.deadline).toLocaleString()}
              </p>

              {currentTask.status !== "complete" && currentTask.status !== "overdue" && (
                <button
                  onClick={() => {
                    setSelectedTask(currentTask);
                    setShowModal(true);
                  }}
                  className="w-full py-2 border-2 border-gray-700 shadow-md font-bold transition-all cursor-pointer mt-2 bg-green-600 hover:bg-green-500"
                >
                  Mark as Done
                </button>
              )}
              <div className="flex justify-between w-full mt-4">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  &#9664;
                </button>
                <span className="text-white">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  &#9654;
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg text-gray-300 w-96 text-center">
            <h2 className="text-lg font-bold mb-4">Confirm Action</h2>
            <p>Are you sure you want to mark "{selectedTask?.title}" as done?</p>
            <div className="mt-4 flex justify-center space-x-4">
              <button
                onClick={markAsDone}
                className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-500"
              >
                Yes
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-500"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default authUser (TodoPage);