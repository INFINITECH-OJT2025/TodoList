"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Adminbar from "../Components/adminsidebar";
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
import authUser from "../utils/authUser";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const TaskList = ({ tasks = {} }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-lg w-full ">
      <h2 className="text-lg font-semibold text-center mb-2 text-green-300">Tasks</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Due Date</th>
              
            </tr>
          </thead>
          <tbody className="bg-gray-700 divide-y divide-gray-600">
            {tasks.map((task) => (
              <tr key={task.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{task.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{task.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{task.deadline}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [taskCount, setTaskCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
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
  ];

  const COLORS = ['#FFBB28', '#00C49F'];

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <ToastContainer />
      <Adminbar />

      <main className="flex-1 flex flex-col items-center p-5 w-full">
        <h1 className="text-3xl font-bold mb-4 text-green-300">Admin Dashboard</h1>

        <div className="text-center mb-6">
          <p className="text-lg font-semibold text-green-200">{currentTime.toLocaleDateString()}</p>
          <p className="text-2xl font-bold text-green-400">{currentTime.toLocaleTimeString()}</p>
        </div>

        <div className="w-full flex justify-center gap-6 mb-5 flex-wrap">
          <div className="bg-gray-700 p-6 rounded-xl shadow-lg text-center w-48">
            <h2 className="text-xl font-semibold text-gray-200">Total Tasks</h2>
            <p className="text-4xl font-bold text-gray-300">{taskCount}</p>
          </div>

          <div className="bg-gray-700 p-6 rounded-xl shadow-lg text-center w-48">
            <h2 className="text-xl font-semibold text-gray-200">Pending</h2>
            <p className="text-4xl font-bold text-yellow-400">{pendingCount}</p>
          </div>

          <div className="bg-gray-700 p-6 rounded-xl shadow-lg text-center w-48">
            <h2 className="text-xl font-semibold text-gray-200">Completed</h2>
            <p className="text-4xl font-bold text-gray-500">{completedCount}</p>
          </div>

          <div className="bg-gray-700 p-6 rounded-xl shadow-lg text-center w-48">
            <h2 className="text-xl font-semibold text-gray-200">Total Users</h2>
            <p className="text-4xl font-bold text-blue-400">{userCount}</p>
          </div>
        </div>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-gray-800 p-2 rounded-xl shadow-lg w-full flex flex-col items-center">
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
      </main>
    </div>
  );
}

export default authUser(Dashboard);