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
      {/* Navigation Bar for Mobile */}
      <div className="md:hidden flex justify-between items-center bg-gray-700 p-2 fixed top-0 left-0 right-0 z-50">
        <button
          className="p-2 bg-gray-700 border border-gray-500 shadow-lg transform active:scale-95"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X size={20} color="white" /> : <Menu size={20} color="white" />}
        </button>
        <span className="text-white font-bold">INFINITASK-ADMIN</span>
        <button
          className="p-2 text-white"
          onClick={confirmLogout}
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Overlay to close menu when clicked */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 min-h-full bg-gray-700 shadow-2xl border-4 border-green-800 transition-transform duration-300 z-50 
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 w-64 md:w-20 lg:w-64 flex flex-col items-center md:items-start pt-10`}
      >
        {/* Logo Container */}
        <div className="flex flex-col items-center justify-center w-full mb-6">
          <img
            src="/infini.png"
            alt="Logo"
            className="w-20 h-20 rounded-md"
          />
        </div>

        {/* Sidebar Menu */}
        <ul className="text-white space-y-4 w-full px-4">
          {menuItems.map((item) => (
            <li key={item.name} className="w-full">
              <Link href={item.path} legacyBehavior>
                <a className="flex items-center p-4 w-full transition duration-200 border-b border-gray-600 hover:bg-gray-600 rounded-md shadow-md">
                  <div className="flex items-center justify-center w-14 h-14 bg-gray-800 shadow-lg border border-gray-600 mr-3">
                    {item.icon}
                  </div>
                  <span className={`text-lg transition-all duration-300 ${isSidebarOpen ? "inline" : "hidden md:inline"}`}>
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
              className="flex items-center p-4 w-full rounded-md transition duration-200 border-b border-gray-600 hover:bg-gray-600 shadow-md"
            >
              <div className="flex items-center justify-center w-14 h-14 bg-gray-800 shadow-lg border border-gray-600 mr-3">
                <MessageCircle size={28} />
              </div>
              <span className="text-lg">Tawk Admin</span>
            </a>
          </li>
        </ul>

        {/* Logout Button at the Bottom (Visible only on Desktop) */}
        <div className="mt-auto w-full hidden md:block">
          <button
            className="flex items-center p-4 w-full rounded-md transition duration-200 border-t border-gray-600 hover:bg-gray-600 shadow-md"
            onClick={confirmLogout}
          >
            <div className="flex items-center justify-center w-14 h-14 bg-gray-800 shadow-lg border border-gray-600 mr-3">
              <LogOut size={28} />
            </div>
            <span className="text-lg">Logout</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed z-50 inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-gray-800 p-8 rounded-md shadow-2xl text-center">
            <p className="mb-6 text-xl font-bold">Are you sure you want to log out?</p>
            <div className="flex justify-center gap-6">
              <button
                className="bg-gray-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-gray-600"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button className="bg-green-600 text-white px-6 py-3 rounded-md shadow-md hover:bg-green-700" onClick={handleLogout}>
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
