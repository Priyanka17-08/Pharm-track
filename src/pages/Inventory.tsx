import React, { useState, useRef, useEffect } from 'react';
import { db } from '../db';
import type { Medicine } from '../types';
import { auth } from '../firebase';
import { Plus, Search, AlertCircle, Edit2, Trash2, Tag, Layers, SearchX, ChevronDown } from 'lucide-react';

import { format } from 'date-fns';

const CATEGORIES = [
  "All Categories",
  "Antipyretics & Analgesics",
  "Cough & Cold Medicines",
  "Antibiotics",
  "Gastrointestinal Medicines",
  "Diabetes Medicines",
  "Hypertension & Cardiac",
  "Asthma & Respiratory",
  "Thyroid Medicines",
  "Vitamins & Supplements",
  "Dermatology / Skin"
];

export function Inventory() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<Medicine>>({});

  useEffect(() => {
    const unsubscribe = db.medicines.subscribe((data) => {
      setMedicines(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredMeds = medicines.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
                        m.generic_name?.toLowerCase().includes(search.toLowerCase()) ||
                        m.category.toLowerCase().includes(search.toLowerCase()) ||
                        m.manufacturer.toLowerCase().includes(search.toLowerCase());
    
    let matchCat = selectedCategory === "All Categories" || m.category === selectedCategory;
    
    return matchSearch && matchCat;
  }).sort((a, b) => a.name.localeCompare(b.name));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cleanData: any = {};
      Object.keys(formData).forEach(key => {
        if ((formData as any)[key] !== undefined) {
          cleanData[key] = (formData as any)[key];
        }
      });

      const payload = {
        ...cleanData,
        created_at: cleanData.created_at || new Date().toISOString()
      };
      
      if (payload.id) {
         await db.medicines.put(payload as Medicine);
      } else {
         await db.medicines.add({ ...payload, id: 'm' + Date.now() } as Medicine);
      }
      setShowModal(false);
      setFormData({});
    } catch (error: any) {
      console.error("Error saving medicine:", error);
      alert("Error saving medicine: " + (error.message || "Unknown error"));
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 lg:gap-6 relative">
      {/* Top Controls Action Bar */}
      <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm flex flex-col gap-4 sticky top-0 z-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row w-full sm:w-auto items-start sm:items-center gap-3 flex-1 relative">
            <div className="relative w-full sm:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search name, generic, manufacturer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-slate-800"
              />
            </div>
            
            <div className="relative w-full sm:w-auto" ref={dropdownRef}>
              <button 
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-2 bg-slate-100 border border-slate-200 hover:bg-slate-200 rounded-lg text-sm font-semibold text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Layers size={16} className="text-blue-600" />
                  <span className="truncate max-w-[150px]">{selectedCategory}</span>
                </div>
                <ChevronDown size={14} className="text-slate-500" />
              </button>
              
              {showCategoryDropdown && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-slate-50 border border-slate-200 rounded-xl shadow-lg z-50 py-2 max-h-80 overflow-y-auto nice-scrollbar">
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); setShowCategoryDropdown(false); }} 
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${selectedCategory === cat ? 'bg-blue-100/50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <button 
            onClick={() => { setFormData({}); setShowModal(true); }}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center justify-center flex-shrink-0"
          >
            <Plus size={16} className="mr-2" /> Add Medicine
          </button>
        </div>
      </div>

      {/* Main Inventory Column */}
      <div className="flex-1 flex flex-col lg:h-[calc(100vh-6rem)] min-w-0">
        
        {/* Table Container */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 flex flex-col min-h-[400px] lg:min-h-0 overflow-hidden relative">
          <div className="overflow-y-auto overflow-x-auto nice-scrollbar flex-1 absolute inset-0">
            <table className="min-w-full text-left table-auto lg:table-fixed">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 box-border">
                <tr>
                  <th className="px-6 py-4 border-b border-slate-200">Medicine & Category</th>
                  <th className="px-6 py-4 border-b border-slate-200">Mfg / Supplier</th>
                  <th className="px-6 py-4 border-b border-slate-200">Batch & Expiry</th>
                  <th className="px-6 py-4 border-b border-slate-200">Stock</th>
                  <th className="px-6 py-4 border-b border-slate-200">MRP / Sell</th>
                  <th className="px-6 py-4 border-b border-slate-200 w-[20%] text-right bg-slate-50">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100 text-sm">
                {filteredMeds.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <SearchX size={36} className="mx-auto text-slate-300 mb-3" />
                      <p className="font-semibold text-slate-700">No medicines found</p>
                      <p className="text-sm mt-1">Adjust your search or category filters.</p>
                    </td>
                  </tr>
                ) : (
                  filteredMeds.map((med) => {
                    const isOut = med.stock_quantity === 0;
                    const isLowStock = med.stock_quantity > 0 && med.stock_quantity < 20;
                    
                    const expiresSoon = new Date(med.expiry_date) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
                    const isExpired = new Date(med.expiry_date) < new Date();
                    
                    return (
                    <tr key={med.id} className="hover:bg-slate-50 transition-colors cursor-default">
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="font-bold text-slate-800">{med.name}</div>
                        {med.generic_name && <div className="text-xs text-slate-500 mt-0.5">{med.generic_name}</div>}
                        <div className="inline-flex mt-1.5 items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 text-slate-500">
                          {med.category}
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="text-sm text-slate-700 font-semibold">{med.manufacturer}</div>
                        {med.supplier && <div className="text-xs text-slate-500 mt-1">{med.supplier}</div>}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                         <div className="text-xs font-mono text-slate-600 mb-1">{med.batch_number || 'N/A'}</div>
                         <div className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded ${isExpired ? 'bg-red-50 text-red-700' : expiresSoon ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-600'}`}>
                           {expiresSoon && !isExpired && <AlertCircle size={12} className="mr-1" />}
                           {isExpired ? 'EXPIRED: ' : ''}{format(new Date(med.expiry_date), 'MMM yyyy')}
                         </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${isOut ? 'bg-red-50 text-red-700 border-red-200' : isLowStock ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                          {isOut ? 'OUT OF STOCK' : `${med.stock_quantity} Units`}
                        </span>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="text-xs text-slate-500 line-through">₹{med.mrp}</div>
                        <div className="text-sm font-bold text-blue-700">₹{med.selling_price}</div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-right text-sm">
                        <button onClick={() => { setFormData(med); setShowModal(true); }} className="text-slate-400 hover:text-blue-600 p-1.5 transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={async () => { await db.medicines.delete(med.id); }} className="text-slate-400 hover:text-red-600 p-1.5 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )})
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
             <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
               <h3 className="text-lg font-bold text-slate-800 flex items-center">
                 <Tag size={20} className="mr-2 text-blue-600" />
                 {formData.id ? 'Edit Medicine' : 'Add New Medicine'}
               </h3>
               <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 transition-colors">×</button>
             </div>
                      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
               <div className="p-6 overflow-y-auto nice-scrollbar">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  
                  <div className="col-span-full md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Medicine Name</label>
                    <input type="text" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium text-slate-800" placeholder="e.g. Paracetamol 500mg" />
                  </div>
                  
                  <div className="col-span-full md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Generic Name</label>
                    <input type="text" value={formData.generic_name || ''} onChange={e => setFormData({...formData, generic_name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium text-slate-800" placeholder="e.g. Acetaminophen" />
                  </div>

                  <div className="col-span-full md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Category</label>
                    <input type="text" required list="categories" value={formData.category || ''} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium text-slate-800" placeholder="Select or type category" />
                    <datalist id="categories">
                       {CATEGORIES.filter(c => c !== "All Categories").map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                  
                  <div className="col-span-full md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Manufacturer</label>
                    <input type="text" required value={formData.manufacturer || ''} onChange={e => setFormData({...formData, manufacturer: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium text-slate-800" placeholder="e.g. GSK" />
                  </div>
                  
                  <div className="col-span-full md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Batch Number</label>
                    <input type="text" required value={formData.batch_number || ''} onChange={e => setFormData({...formData, batch_number: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono text-xs text-slate-800 uppercase" placeholder="B-XXX" />
                  </div>

                  <div className="col-span-full md:col-span-1">
                     <label className="block text-sm font-bold text-slate-700 mb-1.5">Supplier / Vendor</label>
                     <input type="text" value={formData.supplier || ''} onChange={e => setFormData({...formData, supplier: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium text-slate-800" placeholder="Optional supplier name" />
                  </div>
                  
                  <div className="col-span-full md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Expiry Date</label>
                    <input type="date" required value={formData.expiry_date || ''} onChange={e => setFormData({...formData, expiry_date: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium text-slate-800" />
                  </div>
                  
                  <div className="col-span-full md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Stock Quantity</label>
                    <input type="number" required min="0" value={formData.stock_quantity ?? ''} onChange={e => setFormData({...formData, stock_quantity: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium text-slate-800" />
                  </div>
                  
                  <div className="col-span-full md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Purchase Price (₹)</label>
                    <input type="number" required min="0" step="0.01" value={formData.purchase_price ?? ''} onChange={e => setFormData({...formData, purchase_price: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium text-slate-800" />
                  </div>
                  
                  <div className="col-span-full md:col-span-1 flex gap-4">
                     <div className="flex-1">
                       <label className="block text-sm font-bold text-slate-700 mb-1.5">MRP (₹)</label>
                       <input type="number" required min="0" step="0.01" value={formData.mrp ?? ''} onChange={e => setFormData({...formData, mrp: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium text-slate-800 line-through text-slate-500" />
                     </div>
                     <div className="flex-1">
                       <label className="block text-sm font-bold text-blue-700 mb-1.5">Selling Price (₹)</label>
                       <input type="number" required min="0" step="0.01" value={formData.selling_price ?? ''} onChange={e => setFormData({...formData, selling_price: Number(e.target.value)})} className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-bold text-blue-800 bg-blue-50" />
                     </div>
                  </div>
                 </div>
               </div>
               
               <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
                  <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-slate-300 rounded-lg text-slate-700 text-sm font-bold hover:bg-white transition-colors bg-slate-100">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 bg-blue-600 rounded-lg text-white text-sm font-bold hover:bg-blue-700 shadow-sm transition-colors flex items-center">
                    Save Medicine
                  </button>
               </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
