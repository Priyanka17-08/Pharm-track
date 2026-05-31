<div align="center">
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css"/>
  <img src="https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript"/>
  <img src="https://img.shields.io/badge/Firebase-Integrated-FFCA28?style=for-the-badge&logo=firebase"/>

  <br />

  <h1>💊 Pharmacy SaaS Platform</h1>
  <p>
    A modern, production-ready Pharmacy Management Web Application built with an offline-first architecture, beautiful analytics, and seamless remote synchronization.
  </p>

  <p>
    <a href="#features">Features</a> • 
    <a href="#tech-stack">Tech Stack</a> • 
    <a href="#installation">Installation</a> • 
    <a href="#running-the-project">Usage</a> •
    <a href="#screenshots">Screenshots</a>
  </p>
</div>

---

## ✨ Features

- **🛡️ Secure Authentication**: Robust Firebase Email/Password & session management built-in.
- **⚡ Offline-First Architecture**: Powered by `Dexie.js` (IndexedDB). Keep managing your pharmacy when offline, and securely sync when connections are restored.
- **📊 Real-Time Analytics Dashboard**: Sales trends, inventory insights, and financial metrics visualized beautifully using `Recharts`.
- **🏥 Complete Shop Management**: Manage your Owner Profile, GSTIN, Drug License numbers, and comprehensive shop metadata safely.
- **📄 Reporting & Exports**: Generate PDFs seamlessly natively in the browser via `jsPDF`.
- **🎨 Modern UI/UX**: Crafted with a responsive Tailwind CSS v4 design system, ensuring it looks breathtaking on desktop panels and mobile devices alike.
- **🚀 Full-Stack capabilities**: Deployed with an Express/Node.js backend ready for rapid server-side expansion.

---

## 📸 Screenshots

*(You can add your project screenshots here to make the README more attractive)*

| Dashboard Overview | Shop Settings | 
| :---: | :---: | 
| <img src="https://github.com/user-attachments/assets/dba04bc3-a969-4ac2-919a-597f0b87e329" width="180" height="140" alt="image" /> 
| <img src="https://via.placeholder.com/600x350.png?text=Settings+Screenshot" alt="Settings View" width="100%" /> |
| **Inventory Management** | **Offline Sync Indicator** |
| <img src="https://github.com/user-attachments/assets/adeb9d8c-2113-4ffc-b46a-8f0c4410a3ad" width="100%"/>
 | <img src="https://via.placeholder.com/600x350.png?text=Offline+Sync+Screenshot" alt="Sync View" width="100%" /> |

> **Pro Tip**: Use tools like [CleanShot X](https://cleanshot.com/) or [Screen Studio](https://www.screen.studio/) to capture stunning, professional-looking screenshots with dropshadows and rounded borders. 

---

## 🛠 Tech Stack

**Frontend Context:**
- **Core**: React 19, TypeScript
- **Styling**: Tailwind CSS v4, Lucide React (Icons), `clsx` & `tailwind-merge`
- **Charts**: Recharts
- **State & Local DB**: Dexie.js (Offline-first storage)

**Backend Context:**
- **Server**: Express (Node.js) & Vite Middleware
- **Build**: Vite & ESBuild
- **Cloud & Auth**: Firebase & Firebase Admin SDK

---

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### 1. Prerequisites

Make sure you have installed:
- [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A [Firebase Project](https://console.firebase.google.com/) equipped with Authentication enabled.

### 2. Installation

Clone the repository and install the dependencies:

```bash
# Clone the repo
git clone https://github.com/Priyanka17-08/PharmTrack.git

# Navigate into the project directory
cd PharmTrack

# Install required dependencies
npm install
```

### 3. Environment Setup

Create a `.env` file in the root of your project. Copy the variables from the Firebase configuration terminal into your environment variables. 
The system requires standard Firebase Web API integration credentials:

```env
# Example .env configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 💻 Running the Project
## LIVE DEPLOYMENT LINK - https://pharm-track-web.netlify.app/

### Development Mode

Run the local full-stack development server. It hot-reloads both your Express backend and the Vite React client side by side!

```bash
npm run dev
```

The application will spin up at `http://localhost:3000`.

### Production Build

To compile the application and prepare it for enterprise / cloud deployment:

```bash
npm run build
npm run start
```
This leverages ESBuild to collapse your server runtime and Vite to bundle the static client pages into a secure scalable output.

---

## 🤝 Contributing

Contributions, issues, and feature requests are always welcome!
Feel free to check the [issues page](../../issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <p>Built with ❤️ by your development team.</p>
</div>
