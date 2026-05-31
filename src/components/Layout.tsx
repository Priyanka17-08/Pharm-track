import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Wifi, WifiOff, Menu, LogOut } from 'lucide-react';
import { db } from '../db';
import { auth } from '../firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';

export function Layout() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingUser(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // We will handle sync via Firestore automatically online
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loadingUser) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/30 flex font-sans text-slate-800">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen max-w-[100vw] overflow-hidden">
        {/* Topbar for Status */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-4">
             <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-md text-slate-500 hover:bg-slate-100 transition-colors">
               <Menu size={24} />
             </button>
             {/* If we had a title here, we'd add it, but using it for space filling */}
             <div className="w-full"></div>
          </div>
          <div className="flex items-center gap-4">
            {isOnline ? (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span>Online & Synced</span>
              </div>
            ) : (
               <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Offline Mode (Local)</span>
              </div>
            )}
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors text-sm font-medium"
              title="Logout"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
           <Outlet context={{ user }} />
        </div>
      </main>
    </div>
  );
}
