"use client";

import React, { useState } from "react";
import Image from "next/image";
import authUser from "./utils/authUser";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const HeroSection = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="bg-gray-900 text-gray-300"> 
      {/* Navigation */}
      <nav className="bg-gray-900 py-4 shadow-lg fixed top-0 w-full border-b-4 border-green-900 shadow-green-900 z-50">
  <div className="container mx-auto flex justify-center items-center px-6">
    <div className="text-green-300 text-2xl font-bold drop-shadow-lg">
      <a href="/" className="transform hover:scale-110 transition duration-300">
        InfiniTask
      </a>
    </div>
  </div>
</nav>
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
          <div className="  lg:w-3/6 flex justify-center">
            <img src="/cram.png" alt="Task Management" className="w-full max-w-2xl rounded-lg shadow-lg" />
          </div>
          
        </div>
        
      </section>
   
  


      {/* Vlogs Section (Carousel) */}
      <section className="mt-16 bg-gray-800 py-12">
        <div className="container mx-auto text-center px-6 lg:px-12">
          <h2 className="text-4xl font-bold text-green-400">Managing your task on your own</h2>
          <p className="mt-4 text-lg text-gray-400">Discover our latest updates, moments, and insights.</p>
          <div className="mt-8">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={20}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 3000 }}
              loop
              className="rounded-lg shadow-lg"
            >
              {[{ src: "/image.png", title: "Dashboard", description: "Your central hub for tracking progress, managing tasks, and visualizing your productivity." },
                { src: "/usertask.png", title: "Personal Task", description: "Stay organized with your personal tasks, set priorities, and manage your time effectively." },
                { src: "/admin.png", title: "Admin Task", description: "For admin users, manage team tasks, oversee project progress, and ensure smooth operations." }]
                .map((item, index) => (
                  <SwiperSlide key={index}>
                    <div className="bg-gray-800 p-6 text-center rounded-lg">
                      <Image src={item.src} alt={item.title} width={500} height={300} className="rounded-lg mx-auto" />
                      <h3 className="text-xl font-semibold text-green-400 mt-4">{item.title}</h3>
                      <p className="text-gray-300">{item.description}</p>
                    </div>
                  </SwiperSlide>
              ))}
            </Swiper>
          </div>
          <div className="mt-8">
  <iframe
    className="w-full h-96 rounded-lg border-4 border-green-500"
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1930.3269289819482!2d121.0135053!3d14.559905!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c90b830e5f29%3A0x89fe307dfecd3c0d!2sCampos%20Rueda%20Building%2C%20101%20Urban%20Ave%2C%20Makati%2C%201206%20Metro%20Manila!5e0!3m2!1sen!2sph!4v1700000000000"
    allowFullScreen
    loading="lazy"
  ></iframe>
</div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="mt-16 bg-gray-900 py-12">
        <div className="container mx-auto text-center px-6 lg:px-12">
          <h2 className="text-4xl font-bold text-green-500">Get in Touch</h2>
          <p className="mt-4 text-lg text-gray-300">Have questions about task management? Contact us anytime.</p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-700 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white">Email</h3>
              <p className="text-gray-300">support@infinitechtodolist.com</p>
            </div>
            <div className="bg-gray-700 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white">Phone</h3>
              <p className="text-gray-300">+123 456 7890</p>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-700 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white">Location</h3>
              <p className="text-gray-300">123 Tech Street, Innovation City</p>
            </div>
            <div className="bg-gray-700 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white">Business Hours</h3>
              <p className="text-gray-300">Mon-Fri: 8 AM - 5 PM</p>
            </div>
          </div>
        </div>
        
      </section>
    </div>
  );
};

export default authUser(HeroSection);
