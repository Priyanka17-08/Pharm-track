import React, { useEffect, useState } from 'react';
import { db } from '../db';
import type { Bill } from '../types';
import { FileText, Printer, Search, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';

export function History() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    const fetchedBills = await db.bills.toArray();
    // Sort descending by date
    fetchedBills.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setBills(fetchedBills);
  };

  const filteredBills = bills.filter(b => 
    b.id.toLowerCase().includes(search.toLowerCase()) ||
    (b.customer_name && b.customer_name.toLowerCase().includes(search.toLowerCase())) ||
    (b.customer_phone && b.customer_phone.toLowerCase().includes(search.toLowerCase()))
  );

  const printBill = (bill: Bill) => {
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
    bill.items?.forEach(item => {
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
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Billing History</h1>
        </div>
        
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by Bill No, Name, Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 min-h-[400px] overflow-hidden flex flex-col relative">
        <div className="overflow-x-auto nice-scrollbar flex-1 absolute inset-0">
          <table className="min-w-full text-left table-auto lg:table-fixed">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 box-border">
              <tr>
                <th className="px-6 py-4 border-b border-slate-200">Date & Bill No</th>
                <th className="px-6 py-4 border-b border-slate-200">Customer Info</th>
                <th className="px-6 py-4 border-b border-slate-200">Items</th>
                <th className="px-6 py-4 border-b border-slate-200 text-right">Amount</th>
                <th className="px-6 py-4 border-b border-slate-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 text-sm">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <FileText size={36} className="mx-auto text-slate-300 mb-3" />
                    <p className="font-semibold text-slate-700">No records found</p>
                    <p className="text-sm mt-1">Adjust search or create a new bill.</p>
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-slate-700 font-medium whitespace-nowrap mb-1">
                        <Calendar size={14} className="mr-1.5 text-slate-400" />
                        {format(new Date(bill.date), 'dd MMM yyyy, HH:mm')}
                      </div>
                      <div className="text-xs font-mono text-slate-500">{bill.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 flex items-center">
                          <User size={14} className="mr-1.5 text-slate-400" />
                          {bill.customer_name || 'Walk-in'}
                        </span>
                        {bill.customer_phone && <span className="text-xs text-slate-500 mt-1">{bill.customer_phone}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 max-w-xs truncate">
                        {bill.items?.map(i => `${i.name} (x${i.quantity})`).join(', ') || 'No Items'}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {bill.items?.length || 0} unique items
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-bold text-slate-800">₹{bill.grand_total.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-400 uppercase mt-1">Inc. ₹{bill.gst_amount.toFixed(2)} GST</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button onClick={() => printBill(bill)} className="flex items-center text-blue-600 hover:text-blue-800 font-medium ml-auto p-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                        <Printer size={16} className="mr-1.5" />
                        Print
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
  );
}
