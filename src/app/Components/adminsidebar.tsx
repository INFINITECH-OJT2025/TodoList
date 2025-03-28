"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { LogOut, LayoutDashboard, List, UserPlus, Users, MessageCircle, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";

const SidebarNavigation = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const menuItems = [
    { name: "DashBoard", icon: <LayoutDashboard size={24} />, path: "/DashBoard" },
    { name: "User List", icon: <Users size={24} />, path: "/Userlist" },
    { name: "User Todo", icon: <List size={24} />, path: "/usertodo" },
    { name: "AdminReg", icon: <UserPlus size={24} />, path: "/Userlist/AdminReg" },
  ];

  const confirmLogout = () => setShowLogoutModal(true);

  const handleLogout = async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
        return;
      }
      await axios.post(
        "https://infinitech-api5.site/api/logout",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      sessionStorage.removeItem("authToken");
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Hamburger Menu Button */}
      <button
        className="md:hidden p-3 fixed top-4 right-4 z-50 bg-gray-700 rounded-lg"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={24} color="white" /> : <Menu size={24} color="white" />}
      </button>
  
      {/* Overlay to close menu when clicked */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
  
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 min-h-full bg-gray-700 shadow-lg border-2 border-green-500 transition-transform duration-300 z-50 
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 w-60 md:w-20 lg:w-60 flex flex-col items-center md:items-start pt-10`}
      >
        {/* Logo Container */}
        <div className="flex flex-col items-center justify-center w-full mb-6">
          <img
            src="/infini.png"
            alt="Logo"
            className="w-20 h-20 rounded-full"
          />
          <span className="text-white text-lg font-bold mt-2">INFINITASK-ADMIIN</span>
        </div>
  
        {/* Sidebar Menu */}
        <ul className="text-white space-y-4 w-full">
          {menuItems.map((item) => (
            <li key={item.name} className="w-full">
              <Link href={item.path} legacyBehavior>
                <a className="flex items-center p-3 w-full transition duration-200 border-b border-gray-600 hover:bg-gray-600 rounded-md">
                  <div className="flex items-center justify-center w-12 h-12 bg-gray-800 rounded-full mr-3">
                    {item.icon}
                  </div>
                  <span className={`text-sm transition-all duration-300 ${isSidebarOpen ? "inline" : "hidden md:inline"}`}>
                    {item.name}
                  </span>
                </a>
              </Link>
            </li>
          ))}
  
          <li className="w-full">
            <a
              href="https://dashboard.tawk.to/#/dashboard/67e365c14f39121902671651"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-3 w-full rounded-md transition duration-200 border-b border-gray-600 hover:bg-gray-600"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-gray-800 rounded-full mr-3">
                <MessageCircle size={24} />
              </div>
              <span className="text-sm">Tawk Admin</span>
            </a>
          </li>
  
          <li className="w-full">
            <button
              className="flex items-center p-3 w-full rounded-md transition duration-200 border-b border-gray-600 hover:bg-gray-600"
              onClick={confirmLogout}
            >
              <div className="flex items-center justify-center w-12 h-12 bg-gray-800 rounded-full mr-3">
                <LogOut size={24} />
              </div>
              <span className="text-sm">Logout</span>
            </button>
          </li>
        </ul>
      </aside>
  
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed z-50 inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-gray-800 p-6 rounded-md shadow-lg text-center">
            <p className="mb-4 text-lg">Are you sure you want to log out?</p>
            <div className="flex justify-center gap-4">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded-md"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-md" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
  
  
};

export default SidebarNavigation;
