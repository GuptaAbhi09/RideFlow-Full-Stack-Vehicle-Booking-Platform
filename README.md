# 🚖 RideFlow: Full-Stack Vehicle Booking Platform

**RideFlow** is a full-stack, real-time vehicle booking platform and driver marketplace. While it functions similarly to Uber or Ola on the surface, it is specifically engineered to solve the technical and business flaws in those platforms—specifically regarding driver verification, app size, and real-time state management. It handles everything from customer ride booking and Razorpay checkouts to a complete admin dashboard and a live GPS tracking engine.

## 🎯 Why This Project?

Rather than building a standard CRUD application or e-commerce store, this project was built to solve difficult, real-world engineering problems. A ride-booking platform requires mastering **Bidirectional Real-Time Communication (WebSockets)**, handling **complex transactional state machines** for user onboarding, and orchestrating third-party APIs like OpenStreetMap for routing and Razorpay for finance.

## 🚀 The Tech Stack & Architecture

RideFlow utilizes a modern, unified stack:

* **Next.js (App Router) & React:** Engineered as a **Progressive Web App (PWA)**. Instead of forcing users to download a bloated 150MB native app from the App Store, RideFlow is an installable web app that achieves near-native performance. Next.js securely handles backend API routes and frontend UI in one unified repository.
* **MongoDB & Mongoose:** A NoSQL database was chosen because the data structures for Customers, Drivers, and Admins are highly dynamic. An Admin has different fields than a Driver who needs arrays for KYC documents and vehicle data.
* **Socket.io (Node.js):** REST APIs are too slow for live GPS tracking. A dedicated Socket.io microserver handles sub-second latency for ride dispatching and driver location updates.
* **ZegoCloud (WebRTC):** Integrated to handle the live 1-on-1 video streaming for the KYC process.

## ✨ Uniqueness & Innovations

What makes RideFlow completely unique compared to standard ride-booking clones is its focus on **Trust & Safety** and **Marketplace Compliance**.

* **Native Video KYC:** Standard apps rely on slow background checks with documents that are easily faked. RideFlow features a native 1-on-1 Real-Time Video KYC system. Before a driver goes live, an Admin initiates a WebRTC video call directly inside the app to verify their identity.
* **In-App Real-Time Chat (Shared Room Pattern):** Engineered a hybrid messaging system combining Socket.io for low-latency delivery and MongoDB for persistent storage. Drivers and customers dynamically join an isolated Socket.io room specific to their active ride, ensuring absolute privacy and data encapsulation.
* **Driver-Empowered Pricing Compliance:** Instead of a black-box algorithm dictating prices, the onboarding flow requires drivers to declare their Base Fares and Per-Km rates. Admins use this data to ensure market compliance before approving them, leaning closer to a decentralized marketplace model.

## 🧠 Engineering Challenges Solved

The hardest technical challenge was **State Management and Database Inconsistencies during the Partner Onboarding flow.**

Managing an 8-step state machine for drivers (Docs -> Admin Review -> Video KYC -> Pricing -> Live) initially led to a severe bug where the UI would completely lock up and show conflicting states—for example, showing 'Pending' and 'Live' at the same time, or hiding earnings from approved drivers.

This was tracked down to **Query Bleed** in the Admin queues and non-atomic database updates. When an admin approved a vehicle, the API advanced the step integer but forgot to flip the global boolean status flag.

**To solve this:**
1. Backend APIs were rewritten to enforce strict atomic DB updates so flags could never fall out of sync.
2. The React frontend was refactored to completely ignore messy boolean flags and derive its UI lock/unlock logic *purely* from a 'Single Source of Truth'—the integer state of the onboarding step. This instantly eliminated all race conditions and UI glitches.

## 🗺️ Future Roadmap

* **Dynamic "Pick Up My Friends" Split-Fare:** A shared ride link that calculates a multi-stop route and dynamically splits the final Razorpay bill based on the distance each friend traveled.
* **Share Live Tracking Link:** A secure, public-facing URL that riders can send to family members so they can watch the cab moving on a map in real-time.
* **"No-Internet" Offline Safety Mode:** Utilizing Service Workers and `localStorage` to cache driver details and an emergency SOS dialer, ensuring riders are never trapped on a white screen if they lose cellular data.

## 🛠️ Getting Started

First, install the dependencies:
```bash
npm install
```

Start the Next.js frontend:
```bash
npm run dev
```

In a separate terminal, start the Socket.io server:
```bash
cd socketServer
npm install
node index.js
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
