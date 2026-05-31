import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Loader2, ShieldCheck, Mail, Lock } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      
      localStorage.setItem('user', JSON.stringify({ email }));
      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid credentials. Please make sure your email and password are correct.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password login is not enabled in the current Firebase Project. If you created a new project manually, please make sure you pasted its config into `firebase-applet-config.json` inside the editor.');
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center flex-col items-center">
           <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-500/30 mb-4 text-white">
             <HeartPulse size={40} />
           </div>
           <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight text-slate-900">
             {isLogin ? 'Welcome Back' : 'Create Your Account'}
           </h2>
           <p className="mt-2 text-center text-sm text-slate-500 font-medium max-w-sm">
             {isLogin ? 'Sign in to access your secure pharmacy dashboard.' : 'Set up your pharmacy admin credentials to get started.'}
           </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-xl sm:px-10">
          <form className="space-y-6" onSubmit={handleAuth}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center">
                <Mail size={16} className="mr-2 text-slate-400" /> Email Address
              </label>
              <div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="pharmacy@example.com"
                  className="block w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center">
                <Lock size={16} className="mr-2 text-slate-400" /> Password
              </label>
              <div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                   className="block w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-slate-800"
                />
              </div>
            </div>

            {error && <div className="text-red-700 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 shrink-0"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : isLogin ? 'Sign in to Dashboard' : 'Create Account'}
              </button>
            </div>
            
             <div className="text-center mt-4 text-sm font-medium text-slate-600">
               {isLogin ? "Don't have an account? " : "Already have an account? "}
               <button 
                 type="button" 
                 onClick={() => { setIsLogin(!isLogin); setError(''); }}
                 className="text-blue-600 hover:text-blue-800 hover:underline"
               >
                 {isLogin ? 'Sign up' : 'Log in'}
               </button>
             </div>

            <div className="mt-6 flex items-center justify-center space-x-2 text-xs text-slate-500 bg-slate-50 py-3 rounded-lg border border-slate-100">
               <ShieldCheck size={16} className="text-slate-400" />
               <span className="font-medium text-[10px] uppercase tracking-wider">Secure Cloud Sync</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
