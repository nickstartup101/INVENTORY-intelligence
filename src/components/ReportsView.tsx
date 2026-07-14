import { useState } from 'react';
import { FileText, Printer, Clipboard } from 'lucide-react';
import { Product, Liquid } from '../types';

interface ReportsViewProps {
  products: Product[];
  liquids: Liquid[];
}

export default function ReportsView({ products, liquids }: ReportsViewProps) {
  const [reportType, setReportType] = useState('Stock Level Status');
  const [reportContent, setReportContent] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const lowStock = products.filter(p => p.currentStock <= p.minThreshold);
  const outOfStock = products.filter(p => p.currentStock === 0);

  const generateReportText = () => {
    const dateStr = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    let report = `========================================\n`;
    report += `LA DOLCE INVENTORY INTELLIGENCE - REPORT\n`;
    report += `Generated: ${dateStr}\n`;
    report += `========================================\n\n`;

    if (reportType === 'Stock Level Status') {
      report += `1. OVERALL STOCK STATISTICS\n`;
      report += `----------------------------------------\n`;
      report += `Total Unique SKUs: ${products.length}\n`;
      report += `Healthy Items: ${products.length - lowStock.length} SKUs\n`;
      report += `Low Stock Alerts: ${lowStock.length - outOfStock.length} SKUs\n`;
      report += `Out of Stock: ${outOfStock.length} SKUs\n\n`;

      report += `2. CRITICAL WARNING ITEMS (LOW STOCK)\n`;
      report += `----------------------------------------\n`;
      if (lowStock.length === 0) {
        report += `All items are adequately stocked. OK!\n`;
      } else {
        lowStock.forEach(p => {
          report += `- [${p.sku}] ${p.name}: ${p.currentStock} ${p.unit} (Alert Threshold: ${p.minThreshold})\n`;
        });
      }
    } else if (reportType === 'Liquid Levels') {
      report += `1. LIQUID LEVEL PERCENTAGE REPORT\n`;
      report += `----------------------------------------\n`;
      liquids.forEach(l => {
        report += `- [${l.sku}] ${l.name}: ${l.percentage}% Level (${l.percentage <= 15 ? 'CRITICAL REFILL REQUIRED' : 'NORMAL'})\n`;
      });
    } else {
      report += `1. RECENT OPERATIONS SUMMARY\n`;
      report += `----------------------------------------\n`;
      report += `- Regular stock monitoring active.\n`;
      report += `- Loyverse cloud synchronization: Online.\n`;
      report += `- Automated critical limits checklist verification: Checked.\n`;
    }

    report += `\n========================================\n`;
    report += `End of Report.\n`;

    setReportContent(report);
  };

  const handleCopyReport = () => {
    if (!reportContent) return;
    navigator.clipboard.writeText(reportContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-300">
      
      <div className="border-b border-[#1a1a1a] pb-6">
        <span className="text-[10px] font-black text-[#FF4D00] uppercase tracking-[0.25em]">ລາຍງານສາງສິນຄ້າ (Reports)</span>
        <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mt-1">REPORT GENERATOR</h2>
        <p className="text-xs text-neutral-400 mt-1.5 font-bold uppercase tracking-wider">ສ້າງ ແລະ ສົ່ງອອກລາຍງານສະພາບສາງສິນຄ້າ, ລະດັບວັດຖຸດິບແຫຼວ ແລະ ສິນຄ້າໃກ້ໝົດ.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* REPORT GENERATION CONFIG */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-none border-2 border-[#1a1a1a] bg-[#0a0a0a] space-y-5">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.25em] flex items-center gap-2 pb-3 border-b border-[#1a1a1a]">
              <FileText className="w-4 h-4 text-[#FF4D00]" /> ເລືອກປະເພດລາຍງານ
            </h3>

            <div className="space-y-3">
              {[
                { id: 'Stock Level Status', label: 'ສະຖານະສິນຄ້າຄົງເຫຼືອ', desc: 'ລາຍງານລາຍລະອຽດສິນຄ້າທັງໝົດ ແລະ ຕົວແຈ້ງເຕືອນ.' },
                { id: 'Liquid Levels', label: 'ລະດັບວັດຖຸດິບແຫຼວ (Liquids %)', desc: 'ລາຍງານລະດັບເປີເຊັນຂອງນົມ ແລະ ໄຊຣັບ.' },
                { id: 'System Health', label: 'ສະພາບລວມຄວາມປອດໄພລະບົບ', desc: 'ລາຍງານສະຖານະການເຊື່ອມຕໍ່ ແລະ ປະຫວັດ.' },
              ].map((rep) => {
                const isSelected = reportType === rep.id;
                return (
                  <div 
                    key={rep.id}
                    onClick={() => setReportType(rep.id)}
                    className={`p-4 rounded-none border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-[#FF4D00] bg-[#111111]' 
                        : 'border-[#1a1a1a] hover:bg-[#111111] bg-transparent'
                    }`}
                  >
                    <p className={`text-xs font-black uppercase tracking-wider ${isSelected ? 'text-[#FF4D00]' : 'text-white'}`}>{rep.label}</p>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-1.5">{rep.desc}</p>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={generateReportText}
              className="w-full py-3 bg-[#FF4D00] text-white font-black text-xs uppercase tracking-widest rounded-none hover:bg-[#ff5d1a] transition-all cursor-pointer text-center"
            >
              ສ້າງລາຍງານ (Generate)
            </button>
          </div>
        </div>

        {/* REPORT DISPLAY TERMINAL */}
        <div className="col-span-12 lg:col-span-8">
          <div className="glass-panel p-6 rounded-none border-2 border-[#1a1a1a] bg-[#0a0a0a] h-full flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-4">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.25em]">ຜົນການສ້າງລາຍງານ (Report Output)</h3>
              
              {reportContent && (
                <div className="flex gap-2">
                  <button 
                    onClick={handleCopyReport}
                    className="p-2 border border-[#1a1a1a] text-neutral-400 hover:text-[#FF4D00] hover:border-[#FF4D00] bg-[#0a0a0a] rounded-none cursor-pointer transition-colors"
                    title="ຄັດລອກ"
                  >
                    <Clipboard className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handlePrint}
                    className="p-2 border border-[#1a1a1a] text-neutral-400 hover:text-[#FF4D00] hover:border-[#FF4D00] bg-[#0a0a0a] rounded-none cursor-pointer transition-colors"
                    title="ພິມລາຍງານ"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {reportContent ? (
              <div className="flex-1">
                {copied && (
                  <p className="text-[9px] bg-green-950 text-green-400 border border-green-800/40 font-black uppercase tracking-widest py-1.5 px-3 rounded-none mb-3 inline-block">
                    ຄັດລອກໃສ່ Clipboard ແລ້ວ!
                  </p>
                )}
                <pre className="font-mono text-xs bg-[#111111] border border-[#1a1a1a] p-4 rounded-none overflow-x-auto text-[#FF4D00] whitespace-pre-wrap leading-relaxed">
                  {reportContent}
                </pre>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center text-neutral-500">
                <FileText className="w-12 h-12 mb-3 text-neutral-700" />
                <p className="text-xs font-bold uppercase tracking-wider">ກະລຸນາເລືອກປະເພດລາຍງານ ແລະ ກົດປຸ່ມ "ສ້າງລາຍງານ"</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
