"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { FaBars, FaTimes, FaHome, FaTasks, FaUserAlt, FaProjectDiagram, FaSignOutAlt, FaBell } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState("unread");
  const [notifications, setNotifications] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = sessionStorage.getItem("authToken");
        if (!token) return;
        const response = await axios.get(`https://infinitech-api5.site/api/notifications?authToken=${token}`);
        if (response.status === 200) {
          setNotifications(response.data.notifications);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await axios.put(`https://infinitech-api5.site/api/notifications/${id}/markAsRead`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, status: "read" } : n));
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put("https://infinitech-api5.site/api/notifications/markAllAsRead");
      setNotifications(notifications.map(n => ({ ...n, status: "read" })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("authToken"); // Clear authentication token
    router.push("/login"); // Redirect to login page
  };

  return (
    <>
      {/* Notifications Popup */}
      {showNotifications && (
        <div className="fixed top-16 right-4 bg-gray-700 shadow-lg p-4 rounded-lg w-80 border border-gray-900 z-50">
          <div className="flex justify-between items-center border-b pb-2 mb-2">
            <h3 className="font-bold text-gray-900">Notifications</h3>
            <button onClick={() => setShowNotifications(false)} className="text-gray-500 hover:text-red-500"><FaTimes /></button>
          </div>
          <div className="flex justify-between mb-2">
            <button onClick={() => setActiveTab("unread")} className={`px-3 py-1 ${activeTab === "unread" ? "font-bold" : "text-gray-500"}`}>Unread</button>
            <button onClick={() => setActiveTab("read")} className={`px-3 py-1 ${activeTab === "read" ? "font-bold" : "text-gray-500"}`}>Read</button>
            <button onClick={markAllAsRead} className="text-blue-500 hover:underline text-sm">Mark all as Read</button>
          </div>
          <ul className="max-h-56 overflow-y-auto">
            {notifications.filter(n => n.status === activeTab).length === 0 ? (
              <p className="text-center text-gray-400">No {activeTab} notifications</p>
            ) : (
              notifications.filter(n => n.status === activeTab).map(notif => (
                <li key={notif.id} onClick={() => markAsRead(notif.id)} className="py-2 px-3 bg-gray-100 rounded-lg mb-2 shadow-sm border-l-4 border-blue-500 cursor-pointer flex justify-between items-center">
                  <span className="text-sm text-gray-700">{notif.message}</span>
                  {notif.status === "unread" && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-lg font-bold text-gray-700 mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to logout?</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowLogoutModal(false)} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">Cancel</button>
              <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`h-auto ${isOpen ? "w-64" : "w-20"} flex h-screen bg-gray-800 p-4 flex-col justify-between border-r border-gray-700 shadow-xl transition-all duration-300`}>
        <button onClick={() => setIsOpen(!isOpen)} className="text-white text-2xl focus:outline-none">
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
        <nav className="mt-6 space-y-3">
          {[{ path: "/todolist", label: "Dashboard", icon: <FaHome /> },
            { path: "/Taskuser", label: "My Tasks", icon: <FaTasks /> },
            { path: "/ProjectUser", label: "My Project", icon: <FaProjectDiagram /> },
            { path: "/UserProfile", label: "Profile", icon: <FaUserAlt /> }].map((item, index) => (
            <button key={index} onClick={() => router.push(item.path)} className="w-full flex items-center text-left bg-gray-900 hover:bg-red-900 py-2 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-md">
              <span className="mr-3 text-lg">{item.icon}</span>
              <span className={isOpen ? "block" : "hidden"}>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto w-full space-y-2">
          <button onClick={() => setShowNotifications(!showNotifications)} className="w-full bg-red-900 hover:bg-red-600 py-2 px-4 rounded-xl shadow-lg flex items-center justify-center">
            <FaBell className="mr-0.4 text-yellow-400" />
            <span className={isOpen ? "block" : "hidden"}>Notifications</span>
          </button>
          <button onClick={() => setShowLogoutModal(true)} className="w-full bg-red-900 hover:bg-red-600 py-2 px-4 rounded-xl shadow-lg flex items-center justify-center">
            <FaSignOutAlt className="mr-0.4" />
            <span className={isOpen ? "block" : "hidden"}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
