"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import {  LogOut, LayoutDashboard, List, UserPlus, Users } from "lucide-react";
import { useRouter } from "next/navigation";

const SidebarNavigation = () => {
  const [active, setActive] = useState("DashBoard");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();
  const [profileImage, setProfileImage] = useState("/profile-placeholder.png");

  const menuItems = [
    { name: "DashBoard", icon: <LayoutDashboard size={24} />, path: "/DashBoard" },
    { name: "User List", icon: <Users size={24} />, path: "/Userlist" },
    { name: "Usertodo", icon: <List size={24} />, path: "/usertodo" },
    { name: "AdminReg", icon: <UserPlus size={24} />, path: "/Userlist/AdminReg" },
  ];

  const confirmLogout = () => setShowLogoutModal(true);

  const handleLogout = async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        console.error("No token found, redirecting to login.");
        router.push("/login");
        return;
      }
      await axios.post(
        "http://127.0.0.1:8000/api/logout",
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
      <aside className="bg-gray-700 min-h-screen w-20 flex flex-col items-center py-4 justify-between ">
        <ul className="text-white space-y-6">
          {menuItems.map((item) => (
            <li key={item.name} className="group relative flex flex-col items-center">
              <Link href={item.path} legacyBehavior>
                <a
                  className={`cursor-pointer transition duration-200 p-4 rounded-md hover:bg-green-700 flex flex-col items-center ${
                    active === item.name ? "bg-gray-900 text-green-900" : ""
                  }`}
                  onClick={() => setActive(item.name)}
                >
                  {item.icon}
                </a>
              </Link>
              <span className="absolute left-20 px-3 py-1 bg-gray-800 text-sm rounded-md opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {item.name}
              </span>
            </li>
          ))}
          <li
            className="group relative flex flex-col items-center cursor-pointer transition duration-200 p-4 rounded-md hover:bg-green-700"
            onClick={confirmLogout}
          >
            <LogOut size={24} />
            <span className="absolute left-20 px-3 py-1 bg-gray-800 text-sm rounded-md opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              Logout
            </span>
          </li>
        </ul>

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
      </aside>
    </>
  );
};

export default SidebarNavigation;