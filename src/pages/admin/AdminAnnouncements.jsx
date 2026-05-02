import React, { useState, useEffect, useMemo } from 'react';
import { 
  Megaphone, 
  Trash2, 
  Edit3, 
  Trophy, 
  Clock, 
  Ticket,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Eye,
  ShieldCheck,
  Zap,
  LayoutGrid,
  ListFilter,
  Plus,
  Layers,
  Search,
  Activity,
  Calendar,
  DollarSign,
  Gamepad2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Filter,
  History,
  Layout,
  Lock,
  BarChart3,
  PieChart,
  Shapes,
  Maximize2,
  List,
  Target,
  Hash
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

const AdminAnnouncements = () => {
  const { purchasedTickets, addResult, declaredResults } = useCart();
  const [activeTab, setActiveTab] = useState('dispatch'); 
  
  // Workflow Navigation State
  const [workflowStep, setWorkflowStep] = useState('root'); 
  const [marketSelection, setMarketSelection] = useState(null); 
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Monitor Detail State
  const [showDetailSlot, setShowDetailSlot] = useState(null);

  // Result History Date Filter
  const [historyDate, setHistoryDate] = useState(new Date().toISOString().split('T')[0]);

  // 4-Column Result Entry
  const [resultDigits, setResultDigits] = useState({ X: '', A: '', B: '', C: '' });

  // Prize Rewards Configuration (Tier-Based)
  const [prizeConfigs, setPrizeConfigs] = useState({
    '1D': { A: '100', B: '100', C: '100' },
    '2D': { AB: '1000', BC: '1000', AC: '1000' },
    '3D': {
      '12': { ABC: '6250', BC: '250', C: '25' },
      '28': { ABC: '15000', BC: '500', C: '50' },
      '30': { ABC: '17500', BC: '500', C: '50' },
      '55': { ABC: '30000', BC: '1000', C: '100' },
      '60': { ABC: '35000', BC: '1000', C: '100' }
    },
    '4D': {
      '20': { XABC: '100000', ABC: '0', BC: '0', C: '0' },
      '50': { XABC: '250000', ABC: '5000', BC: '500', C: '50' },
      '100': { XABC: '500000', ABC: '10000', BC: '1000', C: '100' }
    }
  });

  const drawAssignments = {
    'DEAR': ['01:00 PM', '06:00 PM', '08:00 PM'],
    'KERALA': ['03:00 PM']
  };

  const isDrawFinished = (timeStr) => {
    if (!timeStr) return false;
    const now = new Date();
    const parts = timeStr.match(/(\d+)[.:](\d+)\s*(AM|PM)/);
    if (!parts) return true;
    let h = parseInt(parts[1]);
    if (parts[3] === 'PM' && h !== 12) h += 12;
    if (parts[3] === 'AM' && h === 12) h = 0;
    const d = new Date();
    d.setHours(h, parseInt(parts[2]), 0, 0);
    return (d - now) <= 0;
  };

  // --- 🛰️ DYNAMIC COMBINATION ENGINE (Lively Sync) ---
  const dynamicAnalyticFeed = useMemo(() => {
    const feed = {};
    const slots = Object.values(drawAssignments).flat();
    
    slots.forEach(s => {
      const tickets = purchasedTickets.filter(t => t.draw === s);
      
      const combinationTable = {
        '1D': { A: 0, B: 0, C: 0 },
        '2D': { AB: 0, BC: 0, AC: 0 },
        '3D': { ABC: 0 },
        '4D': { XABC: 0 }
      };

      tickets.forEach(t => {
         if (t.type === '1D' && combinationTable['1D']) combinationTable['1D'][t.pos] += t.qty;
         else if (t.type === '2D' && combinationTable['2D']) combinationTable['2D'][t.pos] += t.qty;
         else if (t.type === '3D') combinationTable['3D'].ABC += t.qty;
         else if (t.type === '4D') combinationTable['4D'].XABC += t.qty;
      });

      // Frequency Map for specific numbers
      const numFrequencies = {};
      tickets.forEach(t => {
        const key = `${t.type}_${t.pos}_${t.num}`;
        if (!numFrequencies[key]) {
           numFrequencies[key] = { num: t.num, type: t.type, pos: t.pos, qty: 0, totalVal: 0 };
        }
        numFrequencies[key].qty += t.qty;
        numFrequencies[key].totalVal += (t.qty * t.price);
      });

      const sortedNumbers = Object.values(numFrequencies).sort((a, b) => b.qty - a.qty);

      const breakdown = {
        combinationTable,
        totalQty: tickets.reduce((sum, t) => sum + t.qty, 0),
        totalValue: tickets.reduce((sum, t) => sum + (t.qty * t.price), 0),
        topNumbers: sortedNumbers,
        ready: isDrawFinished(s)
      };
      feed[s] = breakdown;
    });
    return feed;
  }, [purchasedTickets]);

  const filteredHistory = useMemo(() => {
    const d = new Date(historyDate).toLocaleDateString();
    return declaredResults.filter(r => r.date === d);
  }, [declaredResults, historyDate]);

  const handleDigitChange = (col, val) => { if (val.length <= 1) setResultDigits({ ...resultDigits, [col]: val }); };

  const handleDeclareResult = () => {
    const { X, A, B, C } = resultDigits;
    const today = new Date().toISOString().split('T')[0];
    
    if (X === '' || A === '' || B === '' || C === '') return alert("Please enter all result digits.");
    
    addResult({ 
      draw: selectedSlot, 
      date: today,
      brand: marketSelection === 'DEAR' ? 'DEARLOT' : 'KERELALOT', 
      digits: resultDigits, 
      prizes: prizeConfigs 
    });
    
    alert(`RESULT ANNOUNCED: ${X}${A}${B}${C}`);
    setWorkflowStep('root');
    setResultDigits({ X: '', A: '', B: '', C: '' });
  };

  const exportToPDF = () => alert("Preparing PDF Report...");

  return (
    <div className="space-y-8 p-4 pb-24 h-full bg-[#f8fbff] overflow-y-auto scrollbar-hide">
      
      {/* Navigation */}
      <div className="flex bg-white rounded-2xl p-2 shadow-sm border border-gray-100 sticky top-0 z-[100]">
        {[
          { id: 'dispatch', label: 'Dispatch', icon: Zap },
          { id: 'analysis', label: 'Monitor', icon: TrendingUp },
          { id: 'history', label: 'History', icon: History }
        ].map(tab => (
          <button key={tab.id} onClick={() => { setActiveTab(tab.id); setShowDetailSlot(null); }} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-[#ff0000] text-white shadow-lg shadow-red-500/20' : 'text-gray-400 hover:bg-gray-50'}`}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'dispatch' && (
        <div className="space-y-6">
          {workflowStep === 'root' && (
            <div className="grid grid-cols-2 gap-4 animate-in zoom-in-95 h-[300px]">
               <button onClick={() => setWorkflowStep('market')} className="bg-white rounded-[2.5rem] shadow-2xl border-2 border-transparent hover:border-[#ff0000] flex flex-col items-center justify-center space-y-4 group">
                  <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-[#ff0000] group-hover:scale-110 shadow-lg shadow-red-500/10"><Trophy size={32} /></div>
                  <p className="text-xl font-black font-condensed tracking-tighter uppercase italic">Result</p>
               </button>
               <button className="bg-white rounded-[2.5rem] shadow-2xl border-2 border-transparent opacity-30 cursor-not-allowed flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500"><Layout size={32} /></div>
                  <p className="text-xl font-black font-condensed tracking-tighter uppercase italic">Scheme</p>
               </button>
            </div>
          )}
          {workflowStep === 'market' && (
            <div className="animate-in slide-in-from-right-4 space-y-6 bg-white p-8 rounded-[2.5rem] shadow-2xl">
               <div className="flex justify-between items-center pb-6 border-b border-gray-50">
                  <h3 className="text-lg font-black font-condensed uppercase italic">Select Market</h3>
                  <button onClick={() => setWorkflowStep('root')} className="text-[10px] font-black uppercase text-gray-300">Back</button>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  {['DEAR', 'KERALA'].map(m => (
                    <button key={m} onClick={() => { setMarketSelection(m); setWorkflowStep('slot'); }} className="p-8 rounded-[1.5rem] bg-gray-50 border border-gray-100 hover:border-[#ff0000] transition-all text-center">
                       <p className="text-xl font-black font-condensed italic">{m}</p>
                    </button>
                  ))}
               </div>
            </div>
          )}
          {workflowStep === 'slot' && (
            <div className="animate-in slide-in-from-right-4 space-y-6 bg-white p-8 rounded-[2.5rem] shadow-2xl">
               <div className="flex justify-between items-center pb-6 border-b border-gray-50">
                  <h3 className="text-lg font-black font-condensed uppercase italic">{marketSelection} Slots</h3>
                  <button onClick={() => setWorkflowStep('market')} className="text-[10px] font-black uppercase text-gray-300">Back</button>
               </div>
               <div className="grid grid-cols-1 gap-3">
                  {drawAssignments[marketSelection].map(slot => {
                    const stats = dynamicAnalyticFeed[slot];
                    return (
                      <button key={slot} onClick={() => { setSelectedSlot(slot); setWorkflowStep('declare'); }} className={`p-5 rounded-2xl border flex justify-between items-center ${stats.ready ? 'bg-red-50 border-red-500 shadow-md' : 'bg-gray-50'}`}>
                         <div className="flex items-center gap-3">
                            {!stats.ready && <Lock size={14} className="text-gray-400" />}
                            <p className="text-lg font-black font-condensed italic">{slot}</p>
                         </div>
                         <div className="text-right">
                            <p className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${stats.ready ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-600'}`}>{stats.ready ? 'READY TO DECLARE' : 'INTAKE OPEN'}</p>
                            <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase">Tickets: {stats.totalQty}</p>
                         </div>
                      </button>
                    );
                  })}
               </div>
            </div>
          )}
          {workflowStep === 'declare' && (
            <div className="animate-in slide-in-from-bottom-6 duration-500 space-y-6">
               <div className="bg-gray-900 rounded-3xl p-6 text-white flex justify-between items-center border-l-[10px] border-[#ff0000]">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-red-500"><Zap size={24} /></div>
                     <div><p className="text-[9px] font-black uppercase opacity-60 tracking-[.2em]">{marketSelection}</p><h2 className="text-2xl font-black font-condensed italic">{selectedSlot}</h2></div>
                  </div>
                  <button onClick={() => setWorkflowStep('slot')} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"><Trash2 size={18} /></button>
               </div>
               <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 space-y-8">
                    <div className="grid grid-cols-4 gap-4">
                        {['X', 'A', 'B', 'C'].map(col => (
                        <div key={col} className="space-y-2 text-center">
                            <label className="text-[9px] font-black uppercase text-gray-400">{col === 'X' ? 'X / D' : col}</label>
                            <input type="number" value={resultDigits[col]} onChange={(e) => handleDigitChange(col, e.target.value)} className="w-full h-20 bg-gray-50 border-2 border-gray-100 rounded-2xl text-center text-4xl font-black focus:border-[#ff0000] outline-none" />
                        </div>
                        ))}
                    </div>
                    {/* 1D & 2D Pools */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 space-y-4">
                            <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">1D Board Prizes</p>
                            {['A', 'B', 'C'].map(p => (
                            <div key={p} className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-black text-gray-400 italic">{p} Board</span>
                                <input type="number" value={prizeConfigs['1D'][p]} onChange={(e) => setPrizeConfigs({...prizeConfigs, '1D': {...prizeConfigs['1D'], [p]: e.target.value}})} className="w-20 bg-white border border-gray-200 rounded-lg py-1 px-2 text-xs font-black" />
                            </div>
                            ))}
                        </div>
                        <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 space-y-4">
                            <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">2D Board Prizes</p>
                            {['AB', 'BC', 'AC'].map(p => (
                            <div key={p} className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-black text-gray-400 italic">{p} Combo</span>
                                <input type="number" value={prizeConfigs['2D'][p]} onChange={(e) => setPrizeConfigs({...prizeConfigs, '2D': {...prizeConfigs['2D'], [p]: e.target.value}})} className="w-20 bg-white border border-gray-200 rounded-lg py-1 px-2 text-xs font-black" />
                            </div>
                            ))}
                        </div>
                    </div>

                    {/* 3D Tiered Prizes */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-2 italic">3D Tier Configuration</p>
                        <div className="grid grid-cols-1 gap-3">
                            {Object.keys(prizeConfigs['3D']).map(tier => (
                                <div key={tier} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between gap-4">
                                    <div className="shrink-0"><span className="text-xs font-black text-red-600">₹{tier}</span></div>
                                    <div className="flex gap-2 overflow-x-auto pb-1">
                                        {['ABC', 'BC', 'C'].map(pos => (
                                            <div key={pos} className="flex flex-col items-center">
                                                <label className="text-[8px] font-black text-gray-400 uppercase mb-1">{pos}</label>
                                                <input 
                                                    type="number" 
                                                    value={prizeConfigs['3D'][tier][pos]} 
                                                    onChange={(e) => setPrizeConfigs({
                                                        ...prizeConfigs, 
                                                        '3D': {
                                                            ...prizeConfigs['3D'], 
                                                            [tier]: { ...prizeConfigs['3D'][tier], [pos]: e.target.value }
                                                        }
                                                    })} 
                                                    className="w-16 bg-white border border-gray-200 rounded-lg py-1 px-2 text-[10px] font-black text-center" 
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4D Tiered Prizes */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest ml-2 italic">4D Tier Configuration</p>
                        <div className="grid grid-cols-1 gap-3">
                            {Object.keys(prizeConfigs['4D']).map(tier => (
                                <div key={tier} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between gap-4">
                                    <div className="shrink-0"><span className="text-xs font-black text-red-600">₹{tier}</span></div>
                                    <div className="flex gap-2 overflow-x-auto pb-1">
                                        {['XABC', 'ABC', 'BC', 'C'].map(pos => (
                                            <div key={pos} className="flex flex-col items-center">
                                                <label className="text-[8px] font-black text-gray-400 uppercase mb-1">{pos}</label>
                                                <input 
                                                    type="number" 
                                                    value={prizeConfigs['4D'][tier][pos]} 
                                                    onChange={(e) => setPrizeConfigs({
                                                        ...prizeConfigs, 
                                                        '4D': {
                                                            ...prizeConfigs['4D'], 
                                                            [tier]: { ...prizeConfigs['4D'][tier], [pos]: e.target.value }
                                                        }
                                                    })} 
                                                    className="w-16 bg-white border border-gray-200 rounded-lg py-1 px-2 text-[10px] font-black text-center" 
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button onClick={handleDeclareResult} className="w-full bg-[#ff0000] text-white py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl active:scale-95 transition-all">DECLARE RESULT & PAYOUT</button>
               </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
           {!showDetailSlot ? (
             <div className="space-y-8 pb-10">
                {/* Compact Intelligence Header */}
                <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-red-50 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-48 h-48 bg-red-50/50 rounded-full blur-3xl -mr-24 -mt-16"></div>
                   <div className="relative z-10 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                         <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-500/10"><BarChart3 size={28} /></div>
                         <div>
                            <h3 className="font-black text-2xl font-condensed italic uppercase tracking-tighter leading-none">Market Intel</h3>
                            <div className="flex items-center gap-2 mt-1.5 bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
                               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                               <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Live Terminal Active</span>
                            </div>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Network Volume</p>
                         <p className="text-2xl font-black font-condensed italic text-gray-950">₹ {Object.values(dynamicAnalyticFeed).reduce((sum, d) => sum + d.totalValue, 0).toLocaleString()}</p>
                      </div>
                   </div>
                </div>

                {Object.keys(drawAssignments).map(mKey => (
                   <div key={mKey} className="space-y-4">
                      <div className="flex items-center gap-4 px-2">
                         <div className="bg-gray-900 px-4 py-1.5 rounded-full"><span className="text-[9px] font-black text-white uppercase tracking-[0.2em] italic">{mKey} REGION</span></div>
                         <div className="h-px flex-grow bg-gray-100"></div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                         {drawAssignments[mKey].map(slot => {
                            const data = dynamicAnalyticFeed[slot];
                            return (
                               <div key={slot} onClick={() => setShowDetailSlot(slot)} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-lg flex flex-col gap-6 hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden active:scale-[0.99] group">
                                  <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform group-hover:rotate-12 duration-1000"><Shapes size={180} /></div>
                                  
                                  <div className="flex justify-between items-start relative z-10">
                                     <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 group-hover:bg-red-600 group-hover:text-white transition-all"><Clock size={24} /></div>
                                        <div>
                                           <div className="flex items-center gap-2">
                                              <p className="text-xl font-black font-condensed italic leading-none">{slot}</p>
                                              {data.totalQty > 0 && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>}
                                           </div>
                                           <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mt-1">ID: #{Math.floor(Math.random() * 9999)}</p>
                                        </div>
                                     </div>
                                     <div className="text-right">
                                        <p className="text-[9px] font-black text-[#ff0000] uppercase italic mb-0.5">COLLECTION</p>
                                        <p className="text-2xl font-black font-condensed italic text-gray-950 leading-none">₹ {data.totalValue.toLocaleString()}</p>
                                     </div>
                                  </div>

                                  <div className="grid grid-cols-3 gap-3 relative z-10">
                                     <div className="bg-gray-50/50 p-3.5 rounded-2xl border border-gray-100/50 flex flex-col items-center">
                                        <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Tickets</p>
                                        <span className="text-lg font-black font-condensed italic text-gray-900">{data.totalQty}</span>
                                     </div>
                                     <div className="bg-gray-50/50 p-3.5 rounded-2xl border border-gray-100/50 flex flex-col items-center">
                                        <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Combos</p>
                                        <span className="text-lg font-black font-condensed italic text-gray-900">{data.topNumbers.length}</span>
                                     </div>
                                     <div className="bg-gray-950 p-3.5 rounded-2xl flex flex-col items-center justify-center group-hover:bg-[#ff0000] transition-colors">
                                        <p className="text-[7px] font-black text-white/30 uppercase tracking-widest mb-0.5">Status</p>
                                        <div className="text-white font-black text-[9px] uppercase tracking-widest">{data.ready ? 'STAGED' : 'INTAKE'}</div>
                                     </div>
                                  </div>
                               </div>
                            );
                         })}
                      </div>
                   </div>
                ))}
             </div>
           ) : (
             <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="bg-gray-950 rounded-[3rem] p-10 text-white flex justify-between items-center shadow-2xl relative overflow-hidden border-b-8 border-red-600">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl"></div>
                   <div className="flex items-center gap-6 relative z-10">
                      <button onClick={() => setShowDetailSlot(null)} className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10 border border-white/5 transition-all"><ChevronRight size={32} className="rotate-180" /></button>
                      <div>
                         <p className="text-[11px] font-black uppercase text-red-500 tracking-[.3em] mb-2">Detailed Intake Analysis</p>
                         <h4 className="text-4xl font-black font-condensed italic leading-none">{showDetailSlot}</h4>
                      </div>
                   </div>
                   <div className="text-right relative z-10">
                      <div className="text-[10px] font-black uppercase opacity-60 italic mb-2 tracking-widest text-emerald-400 flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full justify-end w-fit ml-auto">
                         <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> REAL-TIME STREAM
                      </div>
                      <p className="text-3xl font-black font-condensed italic tracking-widest text-white">₹ {dynamicAnalyticFeed[showDetailSlot].totalValue.toLocaleString()}</p>
                   </div>
                </div>

                <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-gray-100 space-y-10">
                   <div className="flex items-center justify-between border-b border-gray-50 pb-10">
                      <div className="flex items-center gap-3">
                         <Target className="text-red-600" size={28} />
                         <h5 className="text-[16px] font-black uppercase tracking-widest italic tracking-tighter">Combination Matrix</h5>
                      </div>
                      <div className="bg-gray-50 px-6 py-2 rounded-2xl border border-gray-100 italic text-[10px] font-black uppercase text-gray-400">Total Unique Numbers: {dynamicAnalyticFeed[showDetailSlot].topNumbers.length}</div>
                   </div>
                   
                   <div className="grid grid-cols-1 gap-6">
                      {dynamicAnalyticFeed[showDetailSlot].topNumbers.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-8 bg-gray-50/50 rounded-[2.5rem] border-2 border-transparent hover:border-red-500/20 hover:bg-white transition-all group shadow-sm hover:shadow-xl">
                           <div className="flex items-center gap-8">
                              <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center font-black text-xl text-red-600 shadow-xl border border-red-50 relative">
                                 {idx + 1}
                                 <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-600 rounded-full"></div>
                              </div>
                              <div>
                                 <div className="flex items-center gap-3 mb-3">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                       item.type === '4D' ? 'bg-black text-white' :
                                       item.type === '3D' ? 'bg-red-600 text-white' :
                                       'bg-gray-200 text-gray-700'
                                    }`}>
                                       {item.type}
                                    </span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{item.pos} BOARD</span>
                                 </div>
                                 <div className="flex gap-3">
                                    {String(item.num).split('').map((n, i) => (
                                       <span key={i} className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl border-b-4 border-red-600 group-hover:scale-110 transition-transform">
                                          {n}
                                       </span>
                                    ))}
                                 </div>
                              </div>
                           </div>
                           <div className="text-right">
                              <div className="mb-2">
                                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Intake Amount</p>
                                 <p className="text-xl font-black font-condensed italic text-gray-900">₹ {item.totalVal.toLocaleString()}</p>
                              </div>
                              <div className="bg-white px-6 py-4 rounded-[1.5rem] border-2 border-red-500 shadow-lg group-hover:bg-red-600 group-hover:text-white transition-all text-center">
                                 <p className="text-[9px] font-black uppercase opacity-60 mb-0.5">Tickets</p>
                                 <p className="text-2xl font-black font-condensed italic leading-none">{item.qty}</p>
                              </div>
                           </div>
                        </div>
                      ))}
                      {dynamicAnalyticFeed[showDetailSlot].topNumbers.length === 0 && (
                         <div className="py-20 text-center opacity-20">
                            <Gamepad2 size={48} className="mx-auto mb-4" />
                            <p className="text-xs font-black uppercase tracking-widest">No tickets purchased for this slot yet.</p>
                         </div>
                      )}
                   </div>
                </div>
             </div>
           )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="p-4 bg-white animate-in slide-in-from-bottom-4">
           {/* Date Filter Implementation Same as Previous */}
           <div className="flex items-center justify-between mb-8 border-b-2 border-red-100 pb-6 px-2">
              <div className="flex flex-col gap-1">
                 <label className="text-[8px] font-black uppercase tracking-widest text-[#ff0000]">Record Date</label>
                 <input type="date" value={historyDate} onChange={(e) => setHistoryDate(e.target.value)} className="bg-transparent border-none font-black text-xl outline-none cursor-pointer" />
              </div>
              <button onClick={exportToPDF} className="bg-[#ff0000] text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-red-100"><Download size={14} /> Download</button>
           </div>
           <div className="space-y-6">
              {filteredHistory.length > 0 ? filteredHistory.map((res, i) => (
                <div key={i} className="official-result-card relative transition-all animate-in slide-in-from-left duration-500">
                  <table cellPadding="10">
                    <tbody>
                      <tr><td>Date</td><td>{res.date}</td></tr>
                      <tr><td>Time</td><td>{res.draw}</td></tr>
                      <tr><td>Lot Name</td><td>{res.brand}</td></tr>
                      <tr><td>Winning Number</td><td><div className="flex items-center">{res.number.split('').map((digit, idx) => (<span key={idx} className="result-circle">{digit}</span>))}</div></td></tr>
                    </tbody>
                  </table>
                </div>
              )) : <div className="text-center py-20 opacity-30 italic font-serif-official text-xl">Official Records Empty for this date.</div>}
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncements;
