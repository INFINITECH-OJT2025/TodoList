"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import authUser  from "./utils/authUser";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const chatBotScript = `<!--Start of Tawk.to Script-->
<script type="text/javascript">
var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
(function(){
var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;
s1.src='https://embed.tawk.to/67e365c14f39121902671651/1in84avhr';
s1.charset='UTF-8';
s1.setAttribute('crossorigin','*');
s0.parentNode.insertBefore(s1,s0);
})();
</script>
<!--End of Tawk.to Script-->`;

const HeroSection = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Use effect to inject the chat bot script into the document
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://embed.tawk.to/67e3a3defdf8c219086c03df/1in8jg7nt";
    script.async = true;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);


  

  return (
    <div className="bg-gray-900 text-gray-300"> 

      {/* Header */}
      <header className="bg-gray-900 py-4 shadow-lg fixed top-0 w-full border-b-4 border-green-900 shadow-green-900 z-50">
        <div className="container mx-auto flex justify-between items-center px-6">
          <div className="text-green-300 text-2xl font-bold drop-shadow-lg">
            <a href="/" className="transform hover:scale-110 transition duration-300">
              InfiniTask
            </a>
          </div>
          <img src="/infini.png" alt="Logo" className="w-9" />
        </div>
      </header>
      <br />
      <br />
      <br />
      <br />

      {/* Hero Section */}
      <section className="py-5 flex items-center justify-end">
        <div className="container mx-auto flex flex-col-reverse lg:flex-row items-center px-6 lg:px-12">
          <div className="lg:w-1/2 text-center lg:text-left">
            <h1 className="text-5xl font-bold sm:text-6xl text-green-400">Stay Organized with InfiniTask</h1>
            <p className="mt-6 text-lg text-gray-400">🚀 Stay organized, boost productivity, and never miss a deadline with our intuitive task management system.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:justify-center lg:justify-start">
              <a href="/login" className="px-8 py-3 text-lg font-semibold rounded bg-green-500 text-gray-900 hover:bg-green-600 transition">Access Dashboard</a>
              <a href="/Signup" className="px-8 py-3 text-lg font-semibold border border-green-600 rounded hover:bg-gray-700 transition">Create an Account</a>
            </div>
          </div>
          <br />
          <div className="lg:w-3/6 flex justify-center">
            <img src="/cram.png" alt="Task Management" className="w-full max-w-2xl rounded-lg shadow-md" />
          </div>
        </div>
      </section>

      {/* Vlogs Section (Carousel) */}
     
      {/* Features Section */}
      <section className="mt-16 bg-gray-800 py-12">
        <div className="container mx-auto text-center px-6 lg:px-12">
          <h2 className="text-4xl font-bold text-green-400">Managing your task on your own</h2>
          <p className="mt-4 text-lg text-gray-400">Discover our latest updates, moments, and insights.</p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[{ src: "/image.png", title: "Dashboard", description: "Your central hub for tracking progress, managing tasks, and visualizing your productivity." },
              { src: "/usertask.png", title: "Personal Task", description: "Stay organized with your personal tasks, set priorities, and manage your time effectively." },
              { src: "/profile.png", title: "Profile", description: "Manage your profile and settings to enhance your experience." },
              { src: "/admin.png", title: "Admin Task", description: "For admin users, manage team tasks, oversee project progress, and ensure smooth operations." }]
              .map((item, index) => (
                <div key={index} className="bg-gray-700 p-6 rounded-lg shadow-lg">
                  <Image src={item.src} alt={item.title} width={500} height={300} className="rounded-lg mx-auto" />
                  <h3 className="text-xl font-semibold text-green-400 mt-4">{item.title}</h3>
                  <p className="text-gray-300">{item.description}</p>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
<section className="mt-16 bg-gray-900 py-12">
  <div className="container mx-auto text-center px-6 lg:px-12">
    <h2 className="text-4xl font-bold text-green-500">Get in Touch</h2>
    <p className="mt-4 text-lg text-gray-300">Have questions about task management? Contact us anytime.</p>
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
       <div className="bg-gray-900 p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl">
        <h3 className="text-xl font-semibold text-white">Location</h3>
        <p className="text-gray-300">Unit 311, Campus Rueda Bldg., Urban Avenue, Makati City, Metro Manila 1230</p>
      </div>
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl">
        <h3 className="text-xl font-semibold text-white">Phone</h3>
        <p className="text-gray-300">+63 966 751 5747</p>
      </div>
     
      <a href="mailto:infinitechcorp.ph@gmail.com" className="block">
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl">
          <h3 className="text-xl font-semibold text-white">Email</h3>
          <p className="text-blue-300 underline">infinitechcorp.ph@gmail.com</p>
        </div>
      </a>
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl">
        <h3 className="text-xl font-semibold text-white">Business Hours</h3>
        <p className="text-gray-300">Mon-Fri: 8 AM - 5 PM</p>
      </div>
    </div>
  </div>
</section>

      {/* Footer Section */}
      <footer className="bg-gray-800 py-6">
        <div className="container mx-auto text-center">
          <p className="text-gray-400">© {new Date().getFullYear()} InfiniTask. All rights reserved.</p>
        
        </div>
      </footer>
    </div>
  );
};

export default authUser (HeroSection);
