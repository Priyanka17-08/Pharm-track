import React, { useState, useEffect, useRef } from 'react';
import { db } from '../db';
import type { Medicine, BillItem, Bill } from '../types';
import { Search, Plus, Trash2, Printer, CheckCircle, FileText, MessageCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';

export function POS() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<BillItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    const meds = await db.medicines.toArray();
    setMedicines(meds);
  };

  const filteredMeds = search ? medicines.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) && m.stock_quantity > 0
  ).sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()).slice(0, 10) : [];

  const addToCart = (med: Medicine) => {
    const existing = cart.find(item => item.medicine_id === med.id);
    if (existing) {
      if (existing.quantity >= med.stock_quantity) {
         // Show error / alert
         return;
      }
      setCart(cart.map(item => item.medicine_id === med.id 
        ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.selling_price }
        : item
      ));
    } else {
      setCart([...cart, {
        medicine_id: med.id,
        name: med.name,
        quantity: 1,
        mrp: med.mrp,
        selling_price: med.selling_price,
        total: med.selling_price
      }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.medicine_id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty < 1) return;
    const med = medicines.find(m => m.id === id);
    if (med && qty > med.stock_quantity) return; // limit to stock

    setCart(cart.map(item => item.medicine_id === id 
      ? { ...item, quantity: qty, total: qty * item.selling_price }
      : item
    ));
  };

  const subTotal = cart.reduce((sum, item) => sum + item.total, 0);
  const gstPercentage = 12; // Example flat GST for demo, make it dynamic in full app
  const gstAmount = (subTotal * gstPercentage) / 100;
  const grandTotal = subTotal + gstAmount;

  const generateWhatsAppBill = (bill: Bill) => {
    let text = `*PharmTrack - E-Bill*\n\n`;
    text += `Hi ${bill.customer_name},\n`;
    text += `Thank you for shopping with us!\n\n`;
    text += `*Invoice No:* ${bill.id}\n`;
    text += `*Date:* ${format(new Date(bill.date), 'dd/MM/yyyy HH:mm')}\n\n`;
    text += `*Items:*\n`;
    bill.items.forEach(item => {
      text += `- ${item.name} (x${item.quantity}): Rs. ${item.total.toFixed(2)}\n`;
    });
    text += `\n*Subtotal:* Rs. ${bill.sub_total.toFixed(2)}\n`;
    text += `*GST (12%):* Rs. ${bill.gst_amount.toFixed(2)}\n`;
    text += `*Grand Total: Rs. ${bill.grand_total.toFixed(2)}*\n\n`;
    text += `Have a healthy day!`;
    
    return encodeURIComponent(text);
  };

  const handleCheckout = async (checkoutType: 'print' | 'whatsapp' | 'none') => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    
    const bill: Bill = {
      id: 'b' + Date.now(),
      customer_name: customerInfo.name,
      customer_phone: customerInfo.phone,
      items: cart,
      sub_total: subTotal,
      gst_percentage: gstPercentage,
      gst_amount: gstAmount,
      grand_total: grandTotal,
      date: new Date().toISOString()
    };

    try {
      // Save offline
      await db.bills.add(bill);
      
      // Update local stock
      for (const item of cart) {
         const med = medicines.find(m => m.id === item.medicine_id);
         if (med) {
             await db.medicines.update(med.id, { stock_quantity: med.stock_quantity - item.quantity });
         }
      }

      // Automatically sync if online (Layout handles this usually, but immediate push is good)
      
      if (checkoutType === 'print') {
          generatePDF(bill);
      } else if (checkoutType === 'whatsapp') {
          const waText = generateWhatsAppBill(bill);
          const phone = bill.customer_phone.replace(/\D/g, '');
          const waUrl = `https://wa.me/${phone.length === 10 ? '91' + phone : phone}?text=${waText}`;
          window.open(waUrl, '_blank');
      }
      
      setCart([]);
      setCustomerInfo({ name: '', phone: '' });
      loadMedicines(); // reload stock
      
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const generatePDF = (bill: Bill) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Care Pharmacy", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.text("GSTIN: 22AAAAA0000A1Z5", 105, 28, { align: "center" });
    doc.text(`Date: ${format(new Date(bill.date), 'dd/MM/yyyy HH:mm')}`, 20, 40);
    doc.text(`Bill No: ${bill.id}`, 20, 46);
    doc.text(`Customer: ${bill.customer_name}`, 140, 40);
    doc.text(`Phone: ${bill.customer_phone}`, 140, 46);

    doc.line(20, 52, 190, 52);
    doc.setFontSize(11);
    doc.text("Item", 20, 60);
    doc.text("Qty", 120, 60);
    doc.text("Price/U", 140, 60);
    doc.text("Total", 170, 60);
    doc.line(20, 63, 190, 63);

    let y = 70;
    bill.items.forEach(item => {
       doc.setFontSize(10);
       doc.text(item.name.substring(0, 40), 20, y);
       doc.text(item.quantity.toString(), 120, y);
       doc.text(`Rs. ${item.selling_price.toFixed(2)}`, 140, y);
       doc.text(`Rs. ${item.total.toFixed(2)}`, 170, y);
       y += 8;
    });

    doc.line(20, y, 190, y);
    y += 8;
    doc.text(`Sub Total: Rs. ${bill.sub_total.toFixed(2)}`, 140, y);
    y += 6;
    doc.text(`GST (${bill.gst_percentage}%): Rs. ${bill.gst_amount.toFixed(2)}`, 140, y);
    y += 8;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Grand Total: Rs. ${bill.grand_total.toFixed(2)}`, 130, y);

    doc.save(`Invoice_${bill.id}.pdf`);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 pb-6">
      {/* Left Panel: Search and Cart */}
      <div className="flex-1 flex flex-col gap-6">
         {/* Search Box */}
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex-shrink-0">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center"><Search className="mr-2" size={16}/> Find Medicine</h2>
            <div className="relative">
              <input
                 type="text"
                 placeholder="Scanner or type to search..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full pl-4 pr-10 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              {filteredMeds.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-2 text-sm max-h-64 overflow-y-auto">
                  {filteredMeds.map(med => (
                     <button type="button" key={med.id} onMouseDown={(e) => e.preventDefault()} onClick={() => { addToCart(med); setSearch(''); }} className="w-full text-left flex justify-between items-center p-3 hover:bg-slate-50 cursor-pointer rounded-lg transition-colors border-b border-transparent hover:border-slate-100 last:border-0">
                        <div>
                          <div className="font-semibold text-slate-700">{med.name}</div>
                          <div className={`text-[10px] uppercase mt-0.5 ${new Date(med.expiry_date) < new Date() ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
                            Exp: {format(new Date(med.expiry_date), 'MM/yyyy')} • Stock: {med.stock_quantity} • Mfg: {med.manufacturer}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-blue-600">₹{med.selling_price}</div>
                          <div className="text-xs text-slate-400 line-through">₹{med.mrp}</div>
                        </div>
                     </button>
                  ))}
                </div>
              )}
            </div>
         </div>

         {/* Cart Items */}
         <div className="bg-white rounded-xl border border-slate-200 flex-1 flex flex-col shadow-sm overflow-hidden hidden-scrollbar">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
               <h3 className="font-bold text-slate-800 text-sm">Current Bill Items</h3>
               <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full text-xs font-medium">{cart.length} items</span>
            </div>
            <div className="flex-1 overflow-y-auto p-0 border-b border-slate-200">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 sticky top-0">
                     <tr>
                        <th className="px-6 py-3 border-none">Item Details</th>
                        <th className="px-6 py-3 border-none w-32">Quantity</th>
                        <th className="px-6 py-3 border-none w-28 text-right">Total</th>
                        <th className="px-6 py-3 border-none w-16 text-right"></th>
                     </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100">
                  {cart.length === 0 ? (
                    <tr>
                       <td colSpan={4} className="h-48 text-center text-slate-400">
                          <FileText size={32} className="mx-auto mb-2 opacity-50" />
                          <p className="font-medium">Cart is empty.</p>
                       </td>
                    </tr>
                  ) : (
                    cart.map(item => (
                      <tr key={item.medicine_id} className="hover:bg-slate-50">
                         <td className="px-6 py-4">
                            <h4 className="font-semibold text-slate-700">{item.name}</h4>
                            <div className="text-[10px] uppercase text-slate-500 mt-1">₹{item.selling_price} / unit</div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center bg-white border border-slate-200 rounded-md w-max">
                              <button onClick={() => updateQuantity(item.medicine_id, item.quantity - 1)} className="px-2.5 py-1 text-slate-600 hover:bg-slate-50 rounded-l-md font-bold text-lg leading-none border-r border-slate-200">-</button>
                              <span className="w-8 text-center font-bold text-slate-800 text-xs">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.medicine_id, item.quantity + 1)} className="px-2.5 py-1 text-slate-600 hover:bg-slate-50 rounded-r-md font-bold text-lg leading-none border-l border-slate-200">+</button>
                            </div>
                         </td>
                         <td className="px-6 py-4 font-bold text-slate-800 text-right">
                            ₹{item.total.toFixed(2)}
                         </td>
                         <td className="px-6 py-4 text-right">
                           <button onClick={() => removeFromCart(item.medicine_id)} className="text-slate-400 hover:text-red-500 transition-colors">
                             <Trash2 size={16} />
                           </button>
                         </td>
                      </tr>
                    ))
                  )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>

      {/* Right Panel: Checkout */}
      <div className="w-full lg:w-96 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col shrink-0 overflow-hidden">
         <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-bold text-slate-800 text-sm">Checkout Summary</h3>
         </div>
                  <div className="p-6 flex-1 flex flex-col gap-6">
            <div className="space-y-4">
               <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Customer Name <span className="text-red-500">*</span></label>
                  <input type="text" required value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-700" placeholder="e.g. John Doe" />
               </div>
               <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Phone Number <span className="text-red-500">*</span></label>
                  <input type="text" required value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-700" placeholder="10-digit number" />
               </div>
            </div>

            <div className="mt-auto space-y-3 bg-slate-50 p-5 rounded-xl border border-slate-100">
               <div className="flex justify-between text-sm font-medium text-slate-600">
                  <span>Sub Total</span>
                  <span className="font-semibold text-slate-800">₹{subTotal.toFixed(2)}</span>
               </div>
               <div className="flex justify-between text-sm font-medium text-slate-600">
                  <span>GST (12%)</span>
                  <span className="font-semibold text-slate-800">₹{gstAmount.toFixed(2)}</span>
               </div>
               <div className="pt-3 border-t border-slate-200 flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Grand Total</span>
                  <span className="text-2xl font-bold text-slate-900">₹{grandTotal.toFixed(2)}</span>
               </div>
            </div>
         </div>

         <div className="p-6 pt-0 mt-auto flex flex-col gap-3">
            <button 
               onClick={() => handleCheckout('print')}
               disabled={cart.length === 0 || isProcessing || !customerInfo.name.trim() || !customerInfo.phone.trim()}
               className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center transition-colors shadow-sm disabled:opacity-50 text-sm"
            >
               {isProcessing ? "Processing..." : <><Printer className="mr-2" size={16} /> Print Bill (PDF) & Checkout</>}
            </button>
            <button 
               onClick={() => handleCheckout('whatsapp')}
               disabled={cart.length === 0 || isProcessing || !customerInfo.name.trim() || !customerInfo.phone.trim()}
               className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center transition-colors shadow-sm disabled:opacity-50 text-sm"
            >
               {isProcessing ? "Processing..." : <><MessageCircle className="mr-2" size={16} /> Send E-Bill (WhatsApp)</>}
            </button>
            <button 
               onClick={() => handleCheckout('none')}
               disabled={cart.length === 0 || isProcessing || !customerInfo.name.trim() || !customerInfo.phone.trim()}
               className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3 rounded-lg flex items-center justify-center transition-colors shadow-sm disabled:opacity-50 text-sm border border-slate-200"
            >
               {isProcessing ? "Processing..." : <><CheckCircle className="mr-2" size={16} /> Checkout Only (No Bill)</>}
            </button>
         </div>
      </div>
    </div>
  );
}
