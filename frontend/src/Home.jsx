import React from "react";
import { Link } from "react-router-dom";
import herovid from "./Assets/herovid.mp4";
import editvid from "./Assets/editvid.mp4";
import previd from "./Assets/previd.mp4";
import wirevid from "./Assets/wirevid.mp4";
const Home = () => {
  return (
    <div className="bg-[#0a0a1a] text-white font-sans min-h-screen">
      {/* Hero Section */}
      <header className="flex flex-col md:flex-row items-center justify-between px-80 py-20">
        <div className="max-w-lg">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Turn Wireframes into Code Instantly
          </h1>
          <p className="mt-4 text-gray-300">
            Drag and drop UI components, customize them visually, and export
            clean React.js + Tailwind CSS code in seconds.
          </p>
          <button className="mt-6 bg-purple-600 px-6 py-3 rounded-lg hover:bg-purple-700 text-lg">
            <Link to="/upload"> Try it Free</Link>
          </button>
        </div>
        <div className="w-full md:w-1/2 mt-8 md:mt-0">
          <video
            src={herovid} // Replace with your actual video file path
            autoPlay
            loop
            muted
            playsInline
            className="w-full rounded-lg"
          />
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 px-10 text-center">
        <h2 className="text-3xl font-semibold">
          Why Use Our Wireframe to Code Builder?
        </h2>
        <div className="flex flex-col md:flex-row justify-center gap-6 mt-8">
          <div className="bg-gray-900 p-6 rounded-lg w-80">
            <h3 className="text-xl font-semibold">Drag & Drop Components</h3>
            <p className="text-gray-400 mt-2">
              Easily create UIs with an intuitive drag-and-drop interface.
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg w-80">
            <h3 className="text-xl font-semibold">Instant Code Export</h3>
            <p className="text-gray-400 mt-2">
              Export your design as React.js + Tailwind CSS code instantly.
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg w-80">
            <h3 className="text-xl font-semibold">Real-Time Collaboration</h3>
            <p className="text-gray-400 mt-2">
              Work with your team in real time and sync changes instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-16 px-10 bg-[#1a1a2e] text-white">
        <h2 className="text-4xl font-semibold text-center mb-10">
          How It Works
        </h2>

        <div className="space-y-20">
          {/* Step 1: Upload Wireframe */}
          <div className="grid grid-cols-1 md:grid-cols-2 px-100 justify-between">
            {/* Left: Text */}
            <div className="mt-24">
              <h3 className="text-2xl font-semibold text-green-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span> STEP
                1
              </h3>
              <h2 className="text-4xl font-bold mt-2">Upload a Wireframe</h2>
              <p className="text-neutral-300 mt-4 text-xl">
                Import your wireframe image and let AI detect components
                automatically and generate a reactjs tailwindcss code for your
                template
              </p>
            </div>
            {/* Right: Image */}
            <div className="w-[600px]  mt-8 md:mt-0">
              <video
                src={wirevid} // Replace with your actual video file path
                autoPlay
                loop
                muted
                playsInline
                className="w-full rounded-lg"
              />
            </div>
          </div>

          {/* Step 2: Template Preview & Theme Changes */}
          <div className="grid grid-cols-1 md:grid-cols-2 px-100 justify-between">
            {/* Left: Text */}
            <div className="mt-18 mr-5">
              <h3 className="text-2xl font-semibold text-blue-400 flex items-center gap-2 ">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span> STEP
                2
              </h3>
              <h2 className="text-4xl font-bold mt-2">
                Template Preview & Theme Changes
              </h2>
              <p className="text-gray-300 text-xl mt-4 mr-5">
                Instantly preview different templates, apply theme changes to
                match your style, resize elements, and more.
              </p>
            </div>
            <div className="w-[600px] mt-8 md:mt-0">
              <video
                src={previd} // Replace with your actual video file path
                autoPlay
                loop
                muted
                playsInline
                className="w-full rounded-lg"
              />
            </div>
          </div>

          {/* Step 3: Canvas Editor */}
          <div className="grid grid-cols-1 md:grid-cols-2 px-100 justify-between">
            {/* Left: Text */}
            <div className="mt-24">
              <h3 className="text-2xl font-semibold text-purple-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>{" "}
                STEP 3
              </h3>
              <h2 className="text-4xl font-bold mt-2">Canvas Editor</h2>
              <p className="text-neutral-300 mt-4 text-xl">
                Use the interactive canvas editor to drag & drop components,
                edit properties, and refine your design.
              </p>
            </div>
            {/* Right: Image */}
            <div className="w-[600px]  mt-8 md:mt-0">
              <video
                src={editvid} // Replace with your actual video file path
                autoPlay
                loop
                muted
                playsInline
                className="w-full rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-10 text-center">
        <h2 className="text-3xl font-semibold">Start Building Your UI Today</h2>
        <p className="text-gray-300 mt-4">
          No more manual coding. Design and export production-ready code in
          minutes.
        </p>
        <button className="mt-6 bg-purple-600 px-6 py-3 rounded-lg hover:bg-purple-700 text-lg">
          <Link to="/upload">Get Started for Free</Link>
        </button>
      </section>
    </div>
  );
};

export default Home;
