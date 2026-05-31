import React, { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Receipt, History, Settings, LogOut, HeartPulse, X, IndianRupee } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

// Utility for class merging
export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Package, label: 'Inventory', path: '/inventory' },
  { icon: IndianRupee, label: 'Billing POS', path: '/pos' },
  { icon: History, label: 'History', path: '/history' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar({ isOpen, setIsOpen }: { isOpen?: boolean, setIsOpen?: (v: boolean) => void }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Close sidebar on route change on mobile
    if (setIsOpen) setIsOpen(false);
  }, [location.pathname, setIsOpen]);

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

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen?.(false)}
        />
      )}
      
      <aside className={cn(
        "w-64 bg-slate-900 bg-gradient-to-b from-slate-900 to-indigo-950 text-slate-100 flex flex-col h-screen fixed left-0 top-0 overflow-y-auto z-50 transition-transform duration-300 lg:translate-x-0 shadow-xl lg:shadow-none",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between text-indigo-400 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold shrink-0 shadow-md shadow-indigo-500/20">
              <HeartPulse size={20} />
            </div>
            <span className="text-white font-bold tracking-tight leading-tight">PharmTrack</span>
          </div>
          <button onClick={() => setIsOpen?.(false)} className="lg:hidden p-1 text-slate-400 hover:text-white rounded-md mt-1">
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer text-sm font-medium",
                isActive 
                  ? "bg-indigo-500/30 text-white shadow-sm" 
                  : "text-slate-400 hover:bg-white/10 hover:text-white"
              )
            }
          >
            <item.icon size={20} className="shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 w-full rounded-lg text-slate-400 hover:bg-slate-800 transition-colors cursor-pointer text-sm font-medium"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
    </>
  );
}
