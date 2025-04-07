"use client"

import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../Components/Sidebar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import authUser  from "../utils/authUser";
import { ToastContainer } from "react-toastify";

interface Activity {
  id: number;
  status: "pending" | "complete" | "overdue";
  archive: boolean;
  date_started: string;
}

const TodoList = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentTime, setCurrentTime] = useState<string>(
    new Date().toLocaleTimeString()
  );
  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toLocaleDateString()
  );
  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    return localStorage.getItem("isLightMode") === "true";
  });

  const API_BASE_URL = "https://infinitech-api5.site/api";

  useEffect(() => {
    fetchActivities();
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
      setCurrentDate(new Date().toLocaleDateString());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const fetchActivities = async () => {
    try {
      const authToken = sessionStorage.getItem("authToken");
      if (!authToken) {
        console.error("No authToken found in sessionStorage.");
        return;
      }
      const response = await axios.get(`${API_BASE_URL}/activities/${authToken}`);
      if (response.data && Array.isArray(response.data)) {
        setActivities(response.data);
      } else {
        console.error("Invalid response format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  const pendingCount = activities.filter((activity) => activity.status === "pending" && !activity.archive).length;
  const completeCount = activities.filter((activity) => activity.status === "complete" && !activity.archive).length;
  const overdueCount = activities.filter((activity) => activity.status === "overdue" && !activity.archive).length;
  const archiveCount = activities.filter((activity) => activity.archive).length;

  const totalTasks = pendingCount + completeCount + overdueCount;
  const completionPercentage = totalTasks > 0 ? (completeCount / totalTasks) * 100 : 0;

  const groupedData = activities.reduce(
    (acc, activity) => {
      if (!activity.date_started) return acc;
      if (!acc[activity.date_started]) {
        acc[activity.date_started] = {
          date: activity.date_started,
          pending: 0,
          complete: 0,
          overdue: 0,
        };
      }
      acc[activity.date_started][activity.status] += 1;
      return acc;
    },
    {} as Record<string, { date: string; pending: number; complete: number; overdue: number }>
  );

  const chartData = Object.values(groupedData);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const handleChatClick = () => {
    window.open("https://tawk.to/chat/67e3a3defdf8c219086c03df/1in8jg7nt", "_blank");
  };

  return (
    <div className="relative flex min-h-screen bg-gray-900 text-gray-900">
      {/* Sidebar */}
      <Sidebar />
      <div className="sticky top-0 h-screen w-64 bg-gray-800 shadow-lg hidden md:block"></div>

      {/* Main Content */}
      <div className="flex-grow p-4 md:p-4 lg:p-8">
        <ToastContainer />

        {/* Header Section */}
        <br />
        <br />
        <div className="flex items-center justify-center mb-6">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="mx-10 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-800 to-gray-600">
            DASHBOARD
          </span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>
   <div className={`w-full ${isLightMode ? "bg-gray-200" : "bg-gradient-to-r from-green-500 to-gray-400"} rounded-xl p-6 mb-6 flex flex-col sm:flex-row justify-between items-center shadow-lg transition-all duration-300`}>
  <div className="flex items-center mb-4 sm:mb-0">
    <div className="text-lg font-bold text-black px-4 py-2 rounded-md bg-gradient-to-r from-green-500 to-green-400 shadow-md mr-4">
      Overview
    </div>

    {/* Button to Open Tawk.to Chat */}
    <button
      onClick={handleChatClick}
      className={`flex items-center px-7 py-3 text-black rounded-md shadow-md transition duration-200 ${isLightMode ? "bg-gray-300 hover:bg-gray-400" : "bg-gradient-to-r from-green-500 to-green-400 hover:from-green-400 hover:to-green-300"}`}
    >
      <span className="">💬</span> {/* Optional chat icon */}
      Chat with admin 
    </button>
  </div>

  <div className="text-lg font-bold text-center sm:text-right text-black">
    📅 {(() => {
      const date = new Date();
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      return date.toLocaleDateString('en-US', options)
        .toUpperCase()
        .replace(/, /g, '-')
        .replace(/ /g, '-');
    })()} | ⏰ {(() => {
      const date = new Date();
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    })()}
  </div>
</div>
        
        

        {/* Task Completion Bar */}
        <div className="w-full bg-gray-300 rounded-xl p-4 mb-6 shadow-lg">
          <div className="text-lg font-bold mb-2"> Task Completion</div>
          <div className="w-full bg-gray-400 rounded-full h-6 overflow-hidden">
            <div className="h-full bg-green-900 transition-all" style={{ width: `${completionPercentage}%` }}></div>
          </div>
          <div className="text-right text-sm text-gray-700 mt-1">
            {completionPercentage.toFixed(2)}% Completed
          </div>
        </div>

        {/* Task Status Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xl">
          {[{ label: "Pending", count: pendingCount, icon: "🕒" },
            { label: "Complete", count: completeCount, icon: "✅" },
            { label: "Overdue", count: overdueCount, icon: "⚠️" },
            { label: "Archived", count: archiveCount, icon: "📦" },
          ].map((item, index) => (
            <div key={index} className="p-4 bg-gray-300 rounded-2xl shadow-md flex items-center space-x-4">
              <div className="p-4 bg-green-900 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl">{item.icon}</span>
              </div>
              <div>
                <div className="text-xl font-bold">{item.count}</div>
                <div className="text-gray-700 text-lg">{item.label}</div>
              </div>
            </div>
          ))}
        </div>

        <br />

        {/* Task Status Chart */}
        <div className="w-full bg-gray-300 rounded-xl p-4 mb-3 shadow-lg">
          <div className="text-lg font-bold mb-4">Task Status Over Time</div>
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="date" stroke="#333" />
              <YAxis stroke="#333" />
              <Tooltip />
              <Line type="monotone" dataKey="pending" stroke="#FFD700" strokeWidth={2} />
              <Line type="monotone" dataKey="complete" stroke="#98FF98" strokeWidth={2} />
              <Line type="monotone" dataKey="overdue" stroke="#FF6347" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default authUser (TodoList);
