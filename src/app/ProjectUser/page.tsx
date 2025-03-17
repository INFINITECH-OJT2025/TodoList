"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Sidebar from "../Components/Sidebar";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import authUser from "../utils/authUser";

const TodoPage = () => {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem("theme") === "light";
  });

  useEffect(() => {
    const authenticateUser = async () => {
      try {
        const authToken = sessionStorage.getItem("authToken");
        if (!authToken) {
          alert("Auth token not found");
          setLoading(false);
          return;
        }

        const response = await axios.post("http://127.0.0.1:8000/api/getUserId", { authToken });
        setUserId(response.data.id);
        fetchTasks(response.data.id);
      } catch (error) {
        console.error("Failed to authenticate user:", error);
        alert("Failed to authenticate user");
        setLoading(false);
      }
    };

    authenticateUser();
  }, []);

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
      alert("Failed to fetch tasks");
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await axios.patch(`http://127.0.0.1:8000/api/tasks/${taskId}/updateStatus`, { status });
    } catch (error) {
      console.error(`Failed to update task ${taskId} to ${status}:`, error);
    }
  };

  const toggleLightMode = () => {
    setIsLightMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem("theme", newMode ? "light" : "dark");
      return newMode;
    });
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
    } catch (error) {
      console.error("Failed to mark task as done:", error);
      alert("Failed to mark task as done");
    }
  };

  return (
    <div
      className={`flex min-h-screen transition-colors duration-300 ${
        isLightMode ? "bg-gray-100 text-gray-900" : "bg-gray-900 text-gray-100"
      }`}
    >
      <Sidebar />
      <div className="flex-1 p-9 flex flex-col items-center">
        {/* Header with centered title and right-aligned button */}
        <div className="flex items-center justify-between w-full max-w-9xl">
          <div className="flex-1 text-center">
            
          </div>
  
          <button
            onClick={toggleLightMode}
            className="px-4 py-2 text-white rounded-md shadow-md transition-all duration-200 
            bg-white hover:bg-gray-900 focus:ring-2 focus:ring-blue-300 ml-auto"
          >
            {isLightMode ? "☀️" : "🌙"}
          </button>
        </div>
  
      
        <br />
        <h1 className="text-2xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-gray-500 drop-shadow-lg">
              ADMIN TASK
            </h1>
            <br />
     
        <div className="w-52 h-40 flex justify-center items-center">
          
          <CircularProgressbar
            value={(tasks.filter((t) => t.status === "complete").length / tasks.length) * 100}
            text={`${Math.round(
              (tasks.filter((t) => t.status === "complete").length / tasks.length) * 100
            )}%`}
            
            styles={buildStyles({
              pathColor: `rgba(0, 128, 0, 1)`,
              textColor: isLightMode ? "#333" : "#fff",
              trailColor: isLightMode ? "#ddd" : "#444",
              strokeWidth: 10,
              textSize: "24px",
              fontFamily: "'Press Start 2P', cursive",
            })}
          />
        </div>
      
     <br />
     <br />
  
        {loading ? (
          <p>Loading tasks...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          tasks.length > 0 && (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`relative border-2 p-4 shadow-lg transition-all rounded-lg flex flex-col items-center text-center ${
                    isLightMode ? "border-gray-400 bg-gray-200 text-gray-900" : "border-gray-700 bg-gray-800 text-white"
                  }`}
                >
                  <h3 className="bg-green-600 text-white text-lg font-bold p-2 rounded-md w-full">
                    {task.title}
                  </h3>
                  <img
                    src={
                      task.status === "complete"
                        ? "/gifs/success.gif"
                        : task.status === "overdue"
                        ? "/gifs/overdue.gif"
                        : "/gifs/pending.gif"
                    }
                    alt={task.status}
                    className="w-30 h-30 mt-3"
                  />
  
                  <p className="text-base font-semibold">{task.description}</p>
                  <p className={`font-bold ${task.status === "overdue" ? "text-red-500" : "text-black"}`}>
                    <strong>Deadline:</strong> {new Date(task.deadline).toLocaleString()}
                  </p>
  
                  {task.status !== "complete" && task.status !== "overdue" && (
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setShowModal(true);
                      }}
                      className="w-full py-2 mt-2 border-2 border-gray-700 shadow-md font-bold transition-all cursor-pointer bg-green-600 hover:bg-green-500"
                    >
                      Mark as Done
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
  
  
};

export default authUser(TodoPage);
