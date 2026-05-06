import React, { useState } from 'react';
import { 
  Settings, 
  Shield, 
  Bell, 
  Globe, 
  CreditCard,
  User,
  Database,
  Lock,
  ChevronRight,
  Zap,
  Box,
  Key,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { usePayment } from '../../context/PaymentContext';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('General');
  const { accounts, activePayment, paymentConfig, setPaymentMode, setManualAccount } = usePayment();

  const tabs = [
    { id: 'General', icon: Box, label: 'General Info' },
    { id: 'Security', icon: Key, label: 'Security & Access' },
    { id: 'Financial', icon: CreditCard, label: 'Payment Gateway' },
    { id: 'Integration', icon: Globe, label: 'API & External' },
  ];

  const SettingRow = ({ label, desc, children }) => (
    <div className="flex flex-col justify-between items-start py-8 gap-4 first:pt-4 last:pb-4 border-b border-gray-50 last:border-none group">
      <div className="space-y-1">
         <h4 className="text-base font-black text-gray-800 tracking-tight uppercase italic group-hover:text-[#f42464] transition-colors">{label}</h4>
         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed italic">{desc}</p>
      </div>
      <div className="w-full shrink-0">
         {children}
      </div>
    </div>
  );

  return (
    <div className="space-y-10 pb-32 p-4 min-h-screen bg-[#f8f9fa]">
      {/* Top Banner - Treasure Chest Theme */}
      <div className="border-[1.5px] border-[#ff004d] rounded-[2.5rem] p-8 bg-white shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff004d]/5 rounded-full blur-3xl"></div>
         <div className="flex gap-4 items-center">
            <img src="https://img.icons8.com/color/64/000000/treasure-chest.png" alt="Chest" className="w-16 h-16 drop-shadow-xl group-hover:scale-110 transition-transform" />
            <div className="flex-grow">
               <h2 className="text-2xl font-black text-gray-900 font-condensed uppercase tracking-tighter italic leading-none">Configuration</h2>
               <p className="text-[#ff004d] font-black text-[10px] uppercase tracking-widest leading-none mt-1">Platform Core Alignment</p>
            </div>
         </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide px-2">
         {tabs.map((tab) => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={`flex-shrink-0 flex items-center gap-3 px-8 py-4 rounded-2xl transition-all shadow-md active:scale-95 ${
               activeTab === tab.id 
                 ? 'bg-[#ff004d] text-white shadow-[#ff004d]/20' 
                 : 'bg-white text-gray-400 border border-gray-100'
             }`}
           >
              <tab.icon size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">{tab.id}</span>
           </button>
         ))}
      </div>

      {/* Settings Grid Content */}
      <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl space-y-2">
         <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-6">
            <Zap className="text-amber-500" size={24} fill="currentColor" />
            <h2 className="text-xl font-black font-condensed uppercase tracking-tighter text-gray-800 italic">{activeTab} Parameters</h2>
         </div>

         {activeTab === 'General' && (
          <div className="space-y-2">
            <SettingRow label="Platform Maintenance" desc="Temporarily disable all user features globally for system sync.">
               <div className="relative inline-flex items-center cursor-pointer group origin-left">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-16 h-8 bg-gray-100 border border-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-100 after:border after:rounded-full after:h-6 after:w-8 after:transition-all peer-checked:bg-[#ff004d] peer-checked:border-[#ff004d]"></div>
               </div>
            </SettingRow>

            <SettingRow label="Secure Brand Name" desc="Public platform display name throughout user experience.">
               <div className="relative">
                  <Box className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-200" size={20} />
                  <input type="text" defaultValue="DIAMOND JACKPOT LOTTERY" className="bg-gray-50/50 border border-gray-100 rounded-2xl pl-16 pr-6 h-16 font-black text-gray-800 outline-none w-full text-xs focus:bg-white focus:border-[#ff004d]/20 transition-all uppercase tracking-widest" />
               </div>
            </SettingRow>

            <SettingRow label="Session Persistence" desc="Automated admin logout threshold for enhanced security.">
               <div className="relative">
                  <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-200" size={20} />
                  <select className="bg-gray-50/50 border border-gray-100 rounded-2xl pl-16 pr-6 h-16 font-black text-gray-800 outline-none w-full text-xs focus:bg-white focus:border-[#ff004d]/20 transition-all uppercase tracking-widest appearance-none">
                     <option>01 HOUR (RELAXED)</option>
                     <option>04 HOURS (STANDARD)</option>
                     <option>08 HOURS (LONG TERM)</option>
                  </select>
                  <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none rotate-90" size={16} />
               </div>
            </SettingRow>
         </div>
         )}

         {activeTab === 'Financial' && (
           <div className="space-y-6">
             <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 mb-8">
               <div className="flex justify-between items-center mb-2">
                 <div className="flex gap-3 items-center">
                   <AlertCircle className="text-amber-500" size={20} />
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-900">Rotation Control</h4>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black uppercase text-amber-700">{paymentConfig.mode === 'auto' ? 'AUTOMATIC' : 'MANUAL OVERRIDE'}</span>
                    <button 
                      onClick={() => setPaymentMode(paymentConfig.mode === 'auto' ? 'manual' : 'auto')}
                      className={`w-12 h-6 rounded-full relative transition-all ${paymentConfig.mode === 'auto' ? 'bg-emerald-500' : 'bg-orange-500'}`}
                    >
                       <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${paymentConfig.mode === 'auto' ? 'left-1' : 'left-7'}`}></div>
                    </button>
                 </div>
               </div>
               <p className="text-[10px] text-amber-800 font-bold leading-relaxed">
                 {paymentConfig.mode === 'auto' 
                   ? 'The system rotates QR codes every 2 days automatically based on the global reference date.' 
                   : 'Automatic rotation is PAUSED. You must manually select the active account below.'}
               </p>
             </div>

             <div className="grid grid-cols-1 gap-4">
               {accounts.map((acc) => {
                 const isActive = activePayment?.id === acc.id;
                 const isManualTarget = paymentConfig.mode === 'manual' && paymentConfig.manualAccountId === acc.id;
                 
                 return (
                   <div 
                     key={acc.id} 
                     onClick={() => paymentConfig.mode === 'manual' && setManualAccount(acc.id)}
                     className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer ${
                       isActive 
                         ? 'bg-white border-[#ff004d] shadow-lg scale-105' 
                         : 'bg-gray-50 border-gray-100 opacity-60 hover:opacity-100'
                     }`}
                   >
                     <div className="flex justify-between items-start mb-4">
                       <div>
                         <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Account {acc.id}</p>
                         <h5 className="text-sm font-black text-gray-800 uppercase italic">{acc.bankName}</h5>
                       </div>
                       {isActive && (
                         <span className={`text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg -rotate-3 ${
                           paymentConfig.mode === 'auto' ? 'bg-emerald-500' : 'bg-[#ff004d]'
                         }`}>
                           {paymentConfig.mode === 'auto' ? 'Auto-Active' : 'Manually Fixed'}
                         </span>
                       )}
                     </div>
                     <div className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <img src={acc.qrUrl} alt="QR" className="w-16 h-16 rounded-lg shadow-sm" />
                        <div className="flex-grow">
                           <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">UPI ID</p>
                           <p className="text-xs font-black text-gray-800 truncate">{acc.upiId}</p>
                        </div>
                     </div>
                   </div>
                 );
               })}
             </div>
           </div>
         )}

         {activeTab !== 'Financial' && (
          <div className="pt-10 grid grid-cols-2 gap-4">
            <button className="py-5 bg-gray-900 text-white rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-black/10 active:scale-95 transition-all">
               Store Global Config
            </button>
            <button className="py-5 bg-white border-2 border-dashed border-gray-100 text-gray-300 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] active:bg-[#fce4ec] active:text-[#ff004d] transition-all">
               Reset Defaults
            </button>
          </div>
         )}
      </div>
      
      <div className="pt-8 text-center opacity-30">
         <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] italic">Encryption Layer v9.42 | System Status: Optimal</p>
      </div>
    </div>
  );
};

export default AdminSettings;
