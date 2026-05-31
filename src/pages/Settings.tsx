import React, { useState, useRef, useEffect } from 'react';
import { Save, User, Building, ShieldCheck, Download, Upload, Bell, Lock, LogOut } from 'lucide-react';
import { db } from '../db';
import { auth } from '../firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingShop, setIsEditingShop] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  const tabs = [
    { id: 'profile', label: 'Owner Profile', icon: User },
    { id: 'shop', label: 'Shop Settings', icon: Building },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'backup', label: 'Backup & Restore', icon: Download },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const handleBackup = async () => {
    try {
      const data = {
        medicines: await db.medicines.toArray(),
        bills: await db.bills.toArray()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pharmacy_backup_${new Date().toISOString().split('T')[0]}.bak`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Backup failed.");
    }
  };

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.medicines && Array.isArray(data.medicines)) {
           await db.medicines.clear();
           await db.medicines.bulkPut(data.medicines);
        }
        if (data.bills && Array.isArray(data.bills)) {
           await db.bills.clear();
           await db.bills.bulkPut(data.bills);
        }
        alert("Restore completed successfully! Page will refresh.");
        window.location.reload();
      } catch (error) {
        alert("Invalid backup file. Restore failed.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-xl font-bold text-slate-800">Settings</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
         <div className="w-full md:w-56 shrink-0 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <tab.icon size={16} className="mr-3" />
                {tab.label}
              </button>
            ))}
         </div>

         <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px]">
             <div className="p-6 border-b border-slate-200">
               <h3 className="font-bold text-slate-800 text-sm">
                 {tabs.find(t => t.id === activeTab)?.label}
               </h3>
             </div>
             <div className="p-6">
            {activeTab === 'profile' && (
              <form onSubmit={(e) => { e.preventDefault(); alert("Profile changes saved successfully!"); setIsEditingProfile(false); }} className="space-y-6 max-w-2xl">
                 <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-semibold text-slate-800">Profile Information</h4>
                    {!isEditingProfile && (
                        <button type="button" onClick={() => setIsEditingProfile(true)} className="text-sm text-blue-600 font-medium hover:text-blue-700 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">Edit Profile</button>
                    )}
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                   <div className="col-span-2 sm:col-span-1">
                     <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                     <input type="text" readOnly={!isEditingProfile} defaultValue="John Doe" className={`w-full px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 transition-colors ${!isEditingProfile ? 'border-transparent bg-slate-50' : 'border-slate-200'}`} />
                   </div>
                   <div className="col-span-2 sm:col-span-1">
                     <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                     <input type="text" readOnly={!isEditingProfile} defaultValue="+91 9876543210" className={`w-full px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 transition-colors ${!isEditingProfile ? 'border-transparent bg-slate-50' : 'border-slate-200'}`} />
                   </div>
                   <div className="col-span-2">
                     <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                     <input type="email" readOnly={!isEditingProfile} defaultValue="admin@carepharmacy.in" className={`w-full px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 transition-colors ${!isEditingProfile ? 'border-transparent bg-slate-50' : 'border-slate-200'}`} />
                   </div>
                 </div>
                 {isEditingProfile && (
                    <div className="flex gap-3 pt-2">
                       <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center shadow-sm"><Save size={16} className="mr-2"/> Save Changes</button>
                       <button type="button" onClick={() => setIsEditingProfile(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">Cancel</button>
                    </div>
                 )}
              </form>
            )}

            {activeTab === 'shop' && (
              <form onSubmit={(e) => { e.preventDefault(); alert("Shop information saved successfully!"); setIsEditingShop(false); }} className="space-y-6 max-w-2xl">
                 <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-semibold text-slate-800">Shop Information</h4>
                    {!isEditingShop && (
                        <button type="button" onClick={() => setIsEditingShop(true)} className="text-sm text-blue-600 font-medium hover:text-blue-700 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">Edit Details</button>
                    )}
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                   <div className="col-span-2">
                     <label className="block text-sm font-medium text-slate-700 mb-1.5">Pharmacy Name</label>
                     <input type="text" readOnly={!isEditingShop} defaultValue="Care Pharmacy" className={`w-full px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 transition-colors ${!isEditingShop ? 'border-transparent bg-slate-50' : 'border-slate-200'}`} />
                   </div>
                   <div className="col-span-2 sm:col-span-1">
                     <label className="block text-sm font-medium text-slate-700 mb-1.5">GSTIN Number</label>
                     <input type="text" readOnly={!isEditingShop} defaultValue="22AAAAA0000A1Z5" className={`w-full px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm uppercase text-slate-800 transition-colors ${!isEditingShop ? 'border-transparent bg-slate-50' : 'border-slate-200'}`} />
                   </div>
                   <div className="col-span-2 sm:col-span-1">
                     <label className="block text-sm font-medium text-slate-700 mb-1.5">Drug License No.</label>
                     <input type="text" readOnly={!isEditingShop} defaultValue="DL-MH-123456" className={`w-full px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm uppercase text-slate-800 transition-colors ${!isEditingShop ? 'border-transparent bg-slate-50' : 'border-slate-200'}`} />
                   </div>
                   <div className="col-span-2">
                     <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
                     <textarea rows={3} readOnly={!isEditingShop} defaultValue="123, Main Market Road, Mumbai, Maharashtra" className={`w-full px-3 py-2 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none text-slate-800 transition-colors ${!isEditingShop ? 'border-transparent bg-slate-50' : 'border-slate-200'}`}></textarea>
                   </div>
                 </div>
                 {isEditingShop && (
                    <div className="flex gap-3 pt-2">
                       <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center shadow-sm"><Save size={16} className="mr-2"/> Save Information</button>
                       <button type="button" onClick={() => setIsEditingShop(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">Cancel</button>
                    </div>
                 )}
              </form>
            )}

            {activeTab === 'backup' && (
              <div className="space-y-6 max-w-2xl">
                  <p className="text-sm text-slate-600">
                     Your pharmacy records are saved securely. You can download a backup copy of your data (medicines, billing history) to your computer for safekeeping or when setting up a new device.
                  </p>
                  
                  <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between mt-6 gap-4">
                     <div>
                        <h4 className="font-semibold text-slate-800 flex items-center"><Download size={16} className="mr-2 text-slate-500" /> Download System Backup</h4>
                        <p className="text-xs text-slate-500 mt-1">Save a copy of all your pharmacy records to your computer.</p>
                     </div>
                     <button onClick={handleBackup} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center shrink-0">
                       <Download size={16} className="mr-2" /> Save Backup File
                     </button>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-4">
                     <div>
                        <h4 className="font-semibold text-slate-800 flex items-center"><Upload size={16} className="mr-2 text-slate-500" /> Restore from Backup File</h4>
                        <p className="text-xs text-slate-500 mt-1">Upload a previously saved backup file to restore your pharmacy records. (This will replace existing data)</p>
                     </div>
                     <input 
                       type="file" 
                       accept=".json,.bak" 
                       className="hidden" 
                       ref={fileInputRef} 
                       onChange={handleRestore}
                     />
                     <button onClick={() => fileInputRef.current?.click()} className="bg-white border border-slate-200 hover:bg-slate-50 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center shrink-0">
                       <Upload size={16} className="mr-2" /> Upload File
                     </button>
                  </div>
              </div>
            )}
            
            {activeTab === 'security' && (
              <div className="space-y-6 max-w-2xl">
                 <div className="grid grid-cols-1 gap-6">
                   <div>
                     <div className="flex justify-between items-center mb-4">
                       <h4 className="text-sm font-semibold text-slate-800 flex items-center"><Lock size={16} className="mr-2 text-slate-500" /> Change Password</h4>
                       {!isEditingPassword && (
                           <button type="button" onClick={() => setIsEditingPassword(true)} className="text-sm text-blue-600 font-medium hover:text-blue-700 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">Update Password</button>
                       )}
                     </div>
                     {isEditingPassword ? (
                       <form onSubmit={async (e) => {
                         e.preventDefault();
                         const form = e.target as HTMLFormElement;
                         const currentPass = (form.elements.namedItem('currentPass') as HTMLInputElement).value;
                         const newPass = (form.elements.namedItem('newPass') as HTMLInputElement).value;
                         const confirmPass = (form.elements.namedItem('confirmPass') as HTMLInputElement).value;
                         if (newPass !== confirmPass) return alert('New passwords do not match');
                         try {
                           const user = auth.currentUser;
                           if (user && user.email) {
                             const credential = EmailAuthProvider.credential(user.email, currentPass);
                             await reauthenticateWithCredential(user, credential);
                             await updatePassword(user, newPass);
                             alert('Password updated successfully');
                             form.reset();
                             setIsEditingPassword(false);
                           } else {
                             alert('You must be logged in to change your password.');
                           }
                         } catch (error: any) {
                           alert('Error updating password: ' + error.message);
                         }
                       }}>
                         <div className="space-y-4">
                           <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
                             <input type="password" name="currentPass" required placeholder="Enter current password" minLength={6} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800" />
                           </div>
                           <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                             <input type="password" name="newPass" required placeholder="Enter new password" minLength={6} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800" />
                           </div>
                           <div>
                             <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
                             <input type="password" name="confirmPass" required placeholder="Confirm new password" minLength={6} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800" />
                           </div>
                           <div className="flex gap-3 pt-2">
                              <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">Save Password</button>
                              <button type="button" onClick={() => setIsEditingPassword(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">Cancel</button>
                           </div>
                         </div>
                       </form>
                     ) : (
                       <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-800">Password</p>
                            <p className="text-xs text-slate-500 mt-0.5">Last updated securely.</p>
                          </div>
                       </div>
                     )}
                   </div>
                 </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6 max-w-2xl">
                 <h4 className="text-sm font-semibold text-slate-800 mb-4">Email Notifications</h4>
                 <div className="space-y-3">
                   <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <div>
                         <p className="text-sm font-medium text-slate-800">Daily Sales Report</p>
                         <p className="text-xs text-slate-500 mt-0.5">Receive a summary of sales at end of day</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                   </div>
                   <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <div>
                         <p className="text-sm font-medium text-slate-800">Low Stock Alerts</p>
                         <p className="text-xs text-slate-500 mt-0.5">Get notified when items run out</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                   </div>
                 </div>

                 <h4 className="text-sm font-semibold text-slate-800 mt-6 mb-4">Push Notifications</h4>
                 <div className="space-y-3">
                   <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <div>
                         <p className="text-sm font-medium text-slate-800">New Bill Generated</p>
                         <p className="text-xs text-slate-500 mt-0.5">Browser notification for every sale</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                   </div>
                 </div>
              </div>
            )}
            </div>
         </div>
      </div>
    </div>
  );
}
