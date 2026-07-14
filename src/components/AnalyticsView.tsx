import { useState } from 'react';
import { TrendingUp, AlertTriangle, PieChart, Activity, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { Product } from '../types';

interface AnalyticsViewProps {
  products: Product[];
}

export default function AnalyticsView({ products }: AnalyticsViewProps) {
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  // Stock statistics
  const totalItems = products.length;
  const lowStockCount = products.filter(p => p.currentStock <= p.minThreshold && p.currentStock > 0).length;
  const outOfStockCount = products.filter(p => p.currentStock === 0).length;
  const okStockCount = totalItems - lowStockCount - outOfStockCount;

  // Hourly sales data
  const hourlySales = [
    { hour: '08:00', sales: 240000, qty: 12 },
    { hour: '10:00', sales: 520000, qty: 26 },
    { hour: '12:00', sales: 850000, qty: 42 },
    { hour: '14:00', sales: 410000, qty: 19 },
    { hour: '16:00', sales: 380000, qty: 18 },
    { hour: '18:00', sales: 2.4 * 1000000 - (240000 + 520000 + 850000 + 410000 + 380000), qty: 11 }, // matches today's 2.4M
  ];

  // Category counts
  const categorySummary = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + p.currentStock;
    return acc;
  }, {} as Record<string, number>);

  const categoryLabels = Object.keys(categorySummary);
  const categoryValues = Object.values(categorySummary);
  const totalCategoryStock = categoryValues.reduce((sum, v) => sum + v, 0) || 1;

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-300">
      
      <div className="border-b border-[#1a1a1a] pb-6">
        <span className="text-[10px] font-black text-[#FF4D00] uppercase tracking-[0.25em]">ການວິເຄາະ ແລະ ສະຖິຕິສາງ</span>
        <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mt-1">ANALYTICS ENGINE</h2>
        <p className="text-xs text-neutral-400 mt-1.5 font-bold uppercase tracking-wider">ລາຍງານພາບລວມຂອງລະບົບສາງສິນຄ້າ, ຍອດຂາຍປະຈຳວັນ ແລະ ປະສິດທິພາບການດຳເນີນງານ.</p>
      </div>

      {/* STAT CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-none border-2 border-[#1a1a1a] bg-[#0a0a0a] flex items-center gap-4">
          <div className="w-12 h-12 rounded-none bg-green-950/20 border border-green-800/30 flex items-center justify-center text-green-400">
            <PieChart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">ສິນຄ້າປົກກະຕິ</span>
            <p className="text-2xl font-black text-green-400 mt-0.5">{okStockCount} <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">ລາຍການ</span></p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-none border-2 border-[#1a1a1a] bg-[#0a0a0a] flex items-center gap-4">
          <div className="w-12 h-12 rounded-none bg-amber-950/20 border border-[#FF4D00]/20 flex items-center justify-center text-[#FF4D00]">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">ສິນຄ້າໃກ້ໝົດສາງ</span>
            <p className="text-2xl font-black text-[#FF4D00] mt-0.5">{lowStockCount} <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">ລາຍການ</span></p>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-none border-2 border-[#1a1a1a] bg-[#0a0a0a] flex items-center gap-4">
          <div className="w-12 h-12 rounded-none bg-red-950/20 border border-red-800/30 flex items-center justify-center text-red-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">ສິນຄ້າໝົດສາງ</span>
            <p className="text-2xl font-black text-red-500 mt-0.5">{outOfStockCount} <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">ລາຍການ</span></p>
          </div>
        </div>
      </div>

      {/* CHARTS CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* HOURLY SALES AREA CHART (SVG-based, 100% responsive, high contrast) */}
        <div className="col-span-12 lg:col-span-8 glass-panel p-6 rounded-none border-2 border-[#1a1a1a] bg-[#0a0a0a] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 border-b border-[#1a1a1a] pb-4">
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-[0.25em] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#FF4D00]" /> ແນວໂນ້ມຍອດຂາຍມື້ນີ້ (LAK)
                </h3>
                <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-1">ແບ່ງຕາມຊ່ວງເວລາການເຮັດວຽກຂອງແຕ່ລະ Shift</p>
              </div>
              <span className="text-[10px] font-black bg-[#161616] border border-[#FF4D00]/20 text-[#FF4D00] px-3 py-1.5 uppercase tracking-widest rounded-none flex items-center gap-1">
                2.4M LAK <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* SVG Chart Render */}
            <div className="w-full h-64 relative mt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 240">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF4D00" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#FF4D00" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide Lines */}
                <line x1="40" y1="30" x2="580" y2="30" stroke="#1a1a1a" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="40" y1="90" x2="580" y2="90" stroke="#1a1a1a" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="40" y1="150" x2="580" y2="150" stroke="#1a1a1a" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="40" y1="210" x2="580" y2="210" stroke="#262626" strokeWidth="1.5" />

                {/* Left Y-axis labels */}
                <text x="32" y="34" className="text-[9px] fill-neutral-400 font-mono font-black tracking-wider text-right" textAnchor="end">1,000K</text>
                <text x="32" y="94" className="text-[9px] fill-neutral-400 font-mono font-black tracking-wider text-right" textAnchor="end">600K</text>
                <text x="32" y="154" className="text-[9px] fill-neutral-400 font-mono font-black tracking-wider text-right" textAnchor="end">300K</text>
                <text x="32" y="214" className="text-[9px] fill-neutral-400 font-mono font-black tracking-wider text-right" textAnchor="end">0 LAK</text>

                {/* Gradient Fill Path */}
                <path
                  d="M 50 210
                     L 50 166.8
                     L 150 116.4
                     L 250 57
                     L 350 136.2
                     L 450 141.6
                     L 550 210
                     Z"
                  fill="url(#chartGradient)"
                />

                {/* Line Path */}
                <path
                  d="M 50 166.8
                     L 150 116.4
                     L 250 57
                     L 350 136.2
                     L 450 141.6
                     L 550 210"
                  fill="none"
                  stroke="#FF4D00"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Circles */}
                {[
                  { x: 50, y: 166.8, data: hourlySales[0] },
                  { x: 150, y: 116.4, data: hourlySales[1] },
                  { x: 250, y: 57, data: hourlySales[2] },
                  { x: 350, y: 136.2, data: hourlySales[3] },
                  { x: 450, y: 141.6, data: hourlySales[4] },
                  { x: 550, y: 210, data: hourlySales[5] },
                ].map((pt, idx) => (
                  <g key={idx}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={hoveredHour === idx ? 8 : 4.5}
                      fill={hoveredHour === idx ? "#FF4D00" : "#050505"}
                      stroke={hoveredHour === idx ? "#ffffff" : "#FF4D00"}
                      strokeWidth={hoveredHour === idx ? 3 : 2}
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setHoveredHour(idx)}
                      onMouseLeave={() => setHoveredHour(null)}
                    />
                    {/* X-axis texts */}
                    <text x={pt.x} y="228" className="text-[9px] fill-neutral-400 font-black uppercase tracking-widest text-center" textAnchor="middle">
                      {pt.data.hour}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Tooltip Overlay */}
              {hoveredHour !== null && (
                <div 
                  className="absolute bg-[#0a0a0a] border-2 border-[#1a1a1a] p-3 shadow-2xl text-[11px] font-bold text-white tracking-wide rounded-none"
                  style={{
                    left: `${50 + hoveredHour * 16.6}%`,
                    top: '20px',
                    transform: 'translateX(-50%)'
                  }}
                >
                  <p className="font-black text-center border-b border-[#1a1a1a] pb-1.5 mb-1.5 text-[#FF4D00] uppercase tracking-widest">{hourlySales[hoveredHour].hour} HOUR</p>
                  <p className="whitespace-nowrap">ຍອດຂາຍ: <span className="font-black text-[#FF4D00]">{hourlySales[hoveredHour].sales.toLocaleString()} LAK</span></p>
                  <p className="text-neutral-400 uppercase text-[9px] tracking-wider mt-0.5">ຈຳນວນ: {hourlySales[hoveredHour].qty} ອໍເດີ</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CATEGORY RATIO BREAKDOWN */}
        <div className="col-span-12 lg:col-span-4 glass-panel p-6 rounded-none border-2 border-[#1a1a1a] bg-[#0a0a0a] flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-[0.25em] flex items-center gap-2 mb-6 border-b border-[#1a1a1a] pb-4">
              <ShoppingBag className="w-4 h-4 text-[#FF4D00]" /> ອັດຕາສ່ວນສິນຄ້າ (Stock Qty)
            </h3>
            
            <div className="space-y-4 my-6">
              {categoryLabels.map((label, idx) => {
                const stockVal = categorySummary[label];
                const pct = Math.round((stockVal / totalCategoryStock) * 100) || 0;
                
                // Color mapping
                const bgColors = ['bg-[#FF4D00]', 'bg-neutral-500', 'bg-neutral-600', 'bg-neutral-700'];
                const bgColor = bgColors[idx % bgColors.length];

                return (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                      <span className="text-white">{label}</span>
                      <span className="font-mono text-neutral-400 font-bold">{stockVal} units ({pct}%)</span>
                    </div>
                    <div className="w-full bg-[#1a1a1a] h-2 rounded-none overflow-hidden">
                      <div className={`h-full ${bgColor} transition-all duration-500`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-[#1a1a1a] pt-4 text-xs text-neutral-400 font-bold uppercase tracking-wider leading-relaxed">
            <p>💡 **ຄຳແນະນຳ:** ປະເພດ **Milk & Dairy** ຕ້ອງການ restocking ຫຼາຍທີ່ສຸດເນື່ອງຈາກມີອັດຕາການໝູນວຽນຂອງຂວດທີ່ເປີດແລ້ວສູງ.</p>
          </div>
        </div>

      </div>

    </div>
  );
}
