import React, { useEffect, useState, useRef } from 'react';
import { db } from '../db';
import { IndianRupee, FileText, Pill, Percent, Calendar, ChevronDown, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const DATE_RANGES = ['Today', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Custom Date Range'];

export function Dashboard() {
  const [dateRange, setDateRange] = useState('Last 7 Days');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [stats, setStats] = useState<{
    revenue: number;
    orders: number;
    medicinesSold: number;
    profitMargin: number;
    revenueGrowth: number | null;
    ordersGrowth: number | null;
    medicinesSoldGrowth: number | null;
    profitMarginGrowth: number | null;
  }>({
    revenue: 0,
    orders: 0,
    medicinesSold: 0,
    profitMargin: 0,
    revenueGrowth: null,
    ordersGrowth: null,
    medicinesSoldGrowth: null,
    profitMarginGrowth: null,
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [monthlyChartData, setMonthlyChartData] = useState<any[]>([]);
  const [chartView, setChartView] = useState<'daily' | 'yearly'>('daily');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([new Date().getFullYear()]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDateDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    loadData();
  }, [dateRange, selectedYear]);

  const loadData = async () => {
    const bills = await db.bills.toArray();
    const medicines = await db.medicines.toArray();

    const now = new Date();
    // Use end of day for today so we catch all transactions today up to this moment/beyond
    now.setHours(23, 59, 59, 999);
    
    let currentStart = new Date(now);
    let prevStart = new Date(now);
    let prevEnd = new Date(now);

    if (dateRange === 'Today') {
      currentStart.setHours(0, 0, 0, 0);
      prevEnd = new Date(currentStart);
      prevEnd.setMilliseconds(-1);
      prevStart = new Date(prevEnd);
      prevStart.setHours(0, 0, 0, 0);
    } else if (dateRange === 'Last 7 Days') {
      currentStart.setDate(now.getDate() - 7);
      currentStart.setHours(0, 0, 0, 0);
      prevEnd = new Date(currentStart);
      prevEnd.setMilliseconds(-1);
      prevStart = new Date(prevEnd);
      prevStart.setDate(prevStart.getDate() - 7);
    } else if (dateRange === 'Last 30 Days') {
      currentStart.setDate(now.getDate() - 30);
      currentStart.setHours(0, 0, 0, 0);
      prevEnd = new Date(currentStart);
      prevEnd.setMilliseconds(-1);
      prevStart = new Date(prevEnd);
      prevStart.setDate(prevStart.getDate() - 30);
    } else if (dateRange === 'This Month') {
      currentStart.setDate(1);
      currentStart.setHours(0, 0, 0, 0);
      prevEnd = new Date(currentStart);
      prevEnd.setMilliseconds(-1);
      prevStart = new Date(prevEnd);
      prevStart.setDate(1);
    } else {
      currentStart = new Date(0);
      prevStart = new Date(0);
      prevEnd = new Date(0);
    }

    const currentBills = bills.filter(b => {
      const d = new Date(b.date).getTime();
      return d >= currentStart.getTime() && d <= now.getTime();
    });

    const prevBills = bills.filter(b => {
      const d = new Date(b.date).getTime();
      return d >= prevStart.getTime() && d <= prevEnd.getTime();
    });

    const calculateStats = (billsList: any[]) => {
      let r = 0;
      let o = billsList.length;
      let m = 0;
      let p = 0;

      billsList.forEach(b => {
        r += b.grand_total;
        b.items.forEach((item: any) => {
          m += item.quantity;
          const med = medicines.find(md => md.id === item.medicine_id);
          if (med) {
            p += (item.selling_price - (med.purchase_price || item.selling_price * 0.7)) * item.quantity;
          } else {
            p += (item.selling_price * 0.3) * item.quantity;
          }
        });
      });
      return { r, o, m, pMargin: r > 0 ? (p / r) * 100 : 0 };
    };

    const currentStats = calculateStats(currentBills);
    const prevStats = calculateStats(prevBills);

    const calcGrowth = (curr: number, prev: number) => {
      if (prev === 0) return null;
      return ((curr - prev) / prev) * 100;
    };

    setStats({
      revenue: currentStats.r,
      orders: currentStats.o,
      medicinesSold: currentStats.m,
      profitMargin: currentStats.pMargin,
      revenueGrowth: calcGrowth(currentStats.r, prevStats.r),
      ordersGrowth: calcGrowth(currentStats.o, prevStats.o),
      medicinesSoldGrowth: calcGrowth(currentStats.m, prevStats.m),
      profitMarginGrowth: prevStats.r === 0 ? null : currentStats.pMargin - prevStats.pMargin,
    });

    const dailyData: Record<string, { r: number, o: number, m: number, pMargin: number, p: number }> = {};
    
    currentBills.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    currentBills.forEach(b => {
      const dateStr = new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!dailyData[dateStr]) dailyData[dateStr] = { r: 0, o: 0, m: 0, pMargin: 0, p: 0 };
      
      dailyData[dateStr].r += b.grand_total;
      dailyData[dateStr].o += 1;
      
      let billP = 0;
      b.items.forEach(item => {
        dailyData[dateStr].m += item.quantity;
        const med = medicines.find(md => md.id === item.medicine_id);
        if (med) {
           billP += (item.selling_price - (med.purchase_price || item.selling_price * 0.7)) * item.quantity;
        } else {
           billP += (item.selling_price * 0.3) * item.quantity;
        }
      });
      dailyData[dateStr].p += billP;
    });

    let newChartData = Object.keys(dailyData).map(k => {
      const d = dailyData[k];
      return {
        name: k,
        revenue: d.r,
        orders: d.o,
        medicinesSold: d.m,
        profitMargin: d.r > 0 ? (d.p / d.r) * 100 : 0
      };
    });
    
    if (newChartData.length === 0) {
      if (dateRange === 'Today') {
        newChartData.push({ name: 'Today', revenue: 0, orders: 0, medicinesSold: 0, profitMargin: 0 });
      } else {
        for (let i = 6; i >= 0; i--) {
           const d = new Date(now);
           d.setDate(d.getDate() - i);
           newChartData.push({ 
             name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
             revenue: 0, orders: 0, medicinesSold: 0, profitMargin: 0 
           });
        }
      }
    } else if (newChartData.length === 1 && dateRange !== 'Today') {
      const d = new Date(currentBills[0].date);
      d.setDate(d.getDate() - 1);
      newChartData.unshift({
        name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: 0, orders: 0, medicinesSold: 0, profitMargin: 0
      });
    }

    setChartData(newChartData);

    const years = Array.from(new Set(bills.map(b => new Date(b.date).getFullYear())));
    for (let y = 2026; y <= 2036; y++) {
      if (!years.includes(y)) {
        years.push(y);
      }
    }
    if (!years.includes(new Date().getFullYear())) {
      years.push(new Date().getFullYear());
    }
    years.sort((a, b) => b - a);
    setAvailableYears(years);

    const monthlyData: Record<string, number> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    monthNames.forEach(m => {
      monthlyData[m] = 0;
    });

    bills.forEach(b => {
      const d = new Date(b.date);
      if (d.getFullYear() === selectedYear) {
        const monthStr = monthNames[d.getMonth()];
        monthlyData[monthStr] += b.grand_total;
      }
    });

    const newMonthlyChartData = monthNames.map(m => ({
      name: m,
      revenue: monthlyData[m]
    }));

    setMonthlyChartData(newMonthlyChartData);
  };

  const exportCSV = () => {
    let csvContent = "Summary Analytics\n";
    csvContent += "Metric,Value\n";
    csvContent += `Total Revenue,${stats.revenue}\n`;
    csvContent += `Total Orders,${stats.orders}\n`;
    csvContent += `Medicines Sold,${stats.medicinesSold}\n`;
    csvContent += `Profit Margin (%),${stats.profitMargin.toFixed(1)}\n\n`;

    csvContent += "Daily Trend\n";
    csvContent += "Date,Revenue\n";
    chartData.forEach(row => {
        csvContent += `"${row.name}",${row.revenue}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dashboard_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const statCards = [
    { 
      title: 'Total Revenue', 
      value: `₹${stats.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      growth: stats.revenueGrowth,
      icon: IndianRupee,
      dataKey: 'revenue'
    },
    { 
      title: 'Total Orders', 
      value: stats.orders.toLocaleString(),
      growth: stats.ordersGrowth,
      icon: FileText,
      dataKey: 'orders'
    },
    { 
      title: 'Medicines Sold', 
      value: stats.medicinesSold.toLocaleString(),
      growth: stats.medicinesSoldGrowth,
      icon: Pill,
      dataKey: 'medicinesSold'
    },
    { 
      title: 'Profit Margin', 
      value: `${stats.profitMargin.toFixed(1)}%`,
      growth: stats.profitMarginGrowth,
      icon: Percent,
      dataKey: 'profitMargin'
    },
  ];

  return (
    <div className="flex flex-col h-full gap-6 max-w-7xl mx-auto w-full">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
         <div>
           <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h1>
           <p className="text-sm text-slate-500 mt-1">Track your pharmacy's core metrics and performance.</p>
         </div>
         
         {/* Date Range Selector & Export */}
         <div className="flex items-center gap-3">
           <button
             onClick={exportCSV}
             className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 rounded-xl text-sm font-semibold text-indigo-600 transition-colors shadow-sm"
           >
             <Download size={16} />
             Export CSV
           </button>
           <div className="relative" ref={dropdownRef}>
           <button 
             onClick={() => setShowDateDropdown(!showDateDropdown)}
             className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 rounded-xl text-sm font-semibold text-slate-700 transition-colors shadow-sm"
           >
             <Calendar size={16} className="text-blue-600" />
             {dateRange}
             <ChevronDown size={16} className="text-slate-400 ml-1" />
           </button>
           
           {showDateDropdown && (
             <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
               {DATE_RANGES.map(range => (
                 <button
                   key={range}
                   onClick={() => { setDateRange(range); setShowDateDropdown(false); }}
                   className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${dateRange === range ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50 font-medium'}`}
                 >
                   {range}
                 </button>
               ))}
             </div>
           )}
         </div>
         </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, i) => {
          const hasGrowth = stat.growth !== null;
          const isPositive = hasGrowth && (stat.growth as number) >= 0;
          const miniData = chartData.map(d => ({ value: d[stat.dataKey as keyof typeof d] || 0 }));
          
          return (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <stat.icon size={20} className="stroke-[2.5]" />
                </div>
                {hasGrowth && (
                  <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {Math.abs(stat.growth as number).toFixed(1)}%
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-slate-500 text-sm font-semibold tracking-wide">{stat.title}</p>
                <div className="flex items-end justify-between mt-1.5">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Bar Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-[400px]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Revenue Over Time</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">Financial performance visualization</p>
          </div>
          <div className="flex p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setChartView('daily')}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${chartView === 'daily' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Daily
            </button>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(Number(e.target.value));
                setChartView('yearly');
              }}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors border-none outline-none focus:ring-0 ${chartView === 'yearly' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700 bg-transparent'}`}
            >
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex-1 w-full relative min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartView === 'daily' ? chartData : monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                dy={15} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                tickFormatter={(v) => `₹${v.toLocaleString('en-IN')}`} 
                dx={-10} 
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid #e2e8f0', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                  fontWeight: 600,
                  color: '#1e293b'
                }}
                itemStyle={{ color: '#2563eb', fontWeight: 700 }}
                formatter={(value: number) => [`₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, 'Revenue']}
                labelStyle={{ color: '#64748b', marginBottom: '4px' }}
              />
              <Bar 
                dataKey="revenue" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={50}
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

