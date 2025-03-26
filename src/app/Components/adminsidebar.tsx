"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { LogOut, LayoutDashboard, List, UserPlus, Users, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const SidebarNavigation = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
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
        console.error("No token found, redirecting to login.");
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
    <aside className="relative min-h-full w-30 flex flex-col justify-between items-center bg-gray-700 rounded-lg shadow-lg overflow-hidden">
      {/* Gradient Border */}
      <div
        className="absolute inset-0 rounded-lg border-4 border-transparent"
        style={{
          background: "linear-gradient(135deg, #FFD700, #32CD32)",
          WebkitMask: "linear-gradient(white, white) content-box, linear-gradient(transparent, transparent)",
          mask: "linear-gradient(white, white) content-box, linear-gradient(transparent, transparent)",
          zIndex: -1,
        }}
      ></div>

      <div className="flex items-center justify-center mb-7 w-36 h-36 rounded-full overflow-hidden bg-gray-900 -top-7 z-50 -left- absolute">
        <img src="/infini.png" alt="Logo" className="w-full h-full object-cover" />
      </div>

      <ul className="text-white space-y-4 w-full pt-32">
        {menuItems.map((item) => (
          <li key={item.name} className="w-full flex flex-col items-center">
            <Link href={item.path} legacyBehavior>
              <a className="flex flex-col items-center p-3 w-full transition duration-200 border-b border-gray-600 hover:bg-gray-600 rounded-md">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-800 rounded-full mb-1 hover:bg-green-600 transition duration-200">
                  {item.icon}
                </div>
                <span className="text-sm">{item.name}</span>
              </a>
            </Link>
          </li>
        ))}

        {/* Tawk Admin Button */}
        <li className="w-full flex flex-col items-center">
          <a
            href="https://dashboard.tawk.to/#/dashboard/67e365c14f39121902671651"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-3 w-full rounded-md transition duration-200 border-b border-gray-600 hover:bg-gray-600"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-gray-800 rounded-full mb-1 hover:bg-green-600 transition duration-200">
              <MessageCircle size={24} />
            </div>
            <span className="text-sm">Tawk Admin</span>
          </a>
        </li>

        {/* Logout Button */}
        <li className="w-full flex flex-col items-center">
          <button
            className="flex flex-col items-center p-3 w-full rounded-md transition duration-200 border-b border-gray-600 hover:bg-gray-600"
            onClick={confirmLogout}
          >
            <div className="flex items-center justify-center w-12 h-12 bg-gray-800 rounded-full mb-1 hover:bg-green-600 transition duration-200">
              <LogOut size={24} />
            </div>
            <span className="text-sm">Logout</span>
          </button>
        </li>
      </ul>

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
    </aside>
  );
};

export default SidebarNavigation;
