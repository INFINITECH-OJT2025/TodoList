"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Adminbar from "../Components/adminsidebar"; // Assuming this is your sidebar component
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import { ToastContainer } from "react-toastify";
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'; // Importing icons
import authUser  from "../utils/authUser";

const API_BASE_URL = "https://infinitech-api5.site/api";

const TaskList = ({ tasks = [] }) => {
  const itemsPerPage = 5; // Number of items per page
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate total pages
  const totalPages = Math.ceil(tasks.length / itemsPerPage);

  // Get current tasks based on the current page
  const currentTasks = tasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Function to handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-lg w-full ">
      <h2 className="text-lg font-semibold text-center mb-2 text-green-300">Tasks</h2>
      <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-600 divide-y divide-gray-700">
  <thead>
    <tr>
      <th className="px-8 py-4 text-left text-lg font-bold text-gray-300 uppercase tracking-wider border-b border-gray-600">Title</th>
      <th className="px-8 py-4 text-left text-lg font-bold text-gray-300 uppercase tracking-wider border-b border-gray-600">User </th>
      <th className="px-8 py-4 text-left text-lg font-bold text-gray-300 uppercase tracking-wider border-b border-gray-600">Status</th>
      <th className="px-8 py-4 text-left text-lg font-bold text-gray-300 uppercase tracking-wider border-b border-gray-600">Due Date</th>
    </tr>
  </thead>
  <tbody className="bg-gray-800 divide-y divide-gray-600">
    {currentTasks.map((task) => (
      <tr key={task.id}>
        <td className="px-8 py-4 whitespace-nowrap text-lg text-gray-200 border border-gray-600 flex items-center">
          {task.status === 'complete' && <FaCheckCircle className="text-green-400 mr-2" />}
          {task.status === 'overdue' && <FaExclamationCircle className="text-red-400 mr-2" />}
          {task.title}
        </td>
        <td className="px-8 py-4 whitespace-nowrap text-lg text-gray-200 border border-gray-600">{task.user_id}</td>
        <td className="px-8 py-4 whitespace-nowrap text-lg text-gray-200 border border-gray-600">{task.status}</td>
  <td className="px-8 py-4 whitespace-nowrap text-lg text-gray-200 border border-gray-600">
  {(() => {
    const date = new Date(task.deadline);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);
    const [month, day, year] = formattedDate.split(' ');
    return `${day}-${month}-${year}`;
  })()}
</td>
      </tr>
    ))}
  </tbody>
</table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-gray-300">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [taskCount, setTaskCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [taskData, setTaskData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tasksRes = await axios.get(`${API_BASE_URL}/tasks`);
        const tasks = tasksRes.data;

        setTaskCount(tasks.length);
        setPendingCount(tasks.filter((task) => task.status === "pending").length);
        setCompletedCount(tasks.filter((task) => task.status === "complete").length);

        // Calculate overdue tasks
        const now = new Date();
        const overdueTasks = tasks.filter((task) => new Date(task.deadline) < now && task.status !== "complete");
        setOverdueCount(overdueTasks.length);

        const usersRes = await axios.get(`${API_BASE_URL}/users`);
        const users = usersRes.data;

        setUserCount(users.length);

        const groupedUsers = users.reduce((acc, user) => {
          const date = new Date(user.created_at).toLocaleDateString();
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});

        const formattedUserData = Object.keys(groupedUsers).map((date) => ({
          date,
          users: groupedUsers[date],
        }));

        setUserData(formattedUserData);
        setTaskData(tasks);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const data = [
    { name: 'Pending', value: pendingCount },
    { name: 'Completed', value: completedCount },
    { name: 'Overdue', value: overdueCount },
  ];

  const COLORS = ['#FFBB28', '#00C49F', '#FF4C4C'];

  return (
    <div className="flex h-screen bg-gray-900 text-white">
        <Adminbar />
      {/* Sidebar / Adminbar */}
      <div className="sticky top-0 h-screen w-64 bg-gray-800 shadow-lg hidden md:block">
      
      </div>
  
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen p-9 w-full overflow-auto">
        <ToastContainer />
              <br />
        
        
        <h1 className="text-3xl font-bold mb-4 text-green-300 text-center">Admin Dashboard</h1>
  
        {/* Current Time */}
        <div className="text-center mb-6">
          <p className="text-lg font-semibold text-green-200">{currentTime.toLocaleDateString()}</p>
          <p className="text-2xl font-bold text-green-400">{currentTime.toLocaleTimeString()}</p>
        </div>
  
        {/* Dashboard Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 mb-5">
          {[
            { label: "Total Tasks", count: taskCount, color: "text-gray-300" },
            { label: "Pending", count: pendingCount, color: "text-yellow-400" },
            { label: "Completed", count: completedCount, color: "text-gray-500" },
            { label: "Overdue", count: overdueCount, color: "text-red-400" },
            { label: "Total Users", count: userCount, color: "text-blue-400" },
          ].map((item, index) => (
            <div key={index} className="bg-gray-700 p-6 rounded-xl shadow-lg text-center">
              <h2 className="text-xl font-semibold text-gray-200">{item.label}</h2>
              <p className={`text-4xl font-bold ${item.color}`}>{item.count}</p>
            </div>
          ))}
        </div>
  
        {/* Charts & Task List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-2 rounded-xl shadow-lg flex flex-col items-center">
            <h2 className="text-lg font-semibold text-center mb-2 text-green-300">Task Progress</h2>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
  
          {/* Task List Component */}
          <TaskList tasks={taskData} />
        </div>
  
        {/* Users per Date Chart */}
        <div className="bg-gray-800 p-4 rounded-xl shadow-lg w-full mt-6">
          <h2 className="text-lg font-semibold text-center mb-2 text-green-300">Users per Date</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#00C49F" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default authUser (Dashboard);
