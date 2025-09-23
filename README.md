AR Menu Project

Project Overview:

A web application that allows customers to view restaurant menu items in 3D using augmented reality technology. This feature enhances the dining experience by letting users visualize food products before ordering.

Key Features:

3D product visualization using augmented reality
Works on mobile phones, tablets, and computers
Supports both English and Arabic languages
Light and dark mode themes
Real-time menu updates from the main system

Technology Used:

Frontend: React.js
3D Graphics: Three.js and WebXR
Design Tool: Figma
Version Control: GitHub
Deployment: Vercel

How It Works:
For Customers

Browse the menu on any device
Click on items with AR icon to view in 3D
Allow camera access when prompted
Point your device at a flat surface to place the 3D model
Interact with the model using touch or mouse
For Developers

The interface adjusts automatically for Arabic language (right-to-left text)
Users can switch between light and dark themes
All menu data comes from live API connections
3D models are optimized for fast loading
3D Model Optimization


The Challenge:

Original 3D model files were too large, causing slow loading times, especially on mobile devices.

The Solution:

We created a compression system that:

Reduces model file sizes by 60-70%
Maintains good visual quality
Uses modern compression techniques (Draco and WebP)
Ensures models work on both new and older devices

Technical Achievements:

Achieved 100% compatibility across all devices
Reduced 3D model loading time by 50%
Implemented full Arabic language support
Created responsive designs that work on any screen size
