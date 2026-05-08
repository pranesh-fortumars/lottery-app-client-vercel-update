import React from 'react';
import { 
  User, 
  LogOut, 
  ChevronRight, 
  History, 
  Ticket, 
  Settings, 
  Wallet, 
  CreditCard,
  Users,
  Gift,
  Zap,
  Copy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isAdmin = user?.role === 'admin';
  
  const menuItems = [
    !isAdmin && { icon: <Ticket size={20} />, label: 'My Tickets', color: 'text-green-500', path: '/tickets' },
    !isAdmin && { icon: <Wallet size={20} />, label: 'Wallet Top Up', color: 'text-blue-500', path: '/topup' },
    { icon: <History size={20} />, label: 'Transaction History', color: 'text-purple-500', path: '#' },
    { icon: <Settings size={20} />, label: 'Settings', color: 'text-gray-500', path: isAdmin ? '/admin/settings' : '#' },
  ].filter(Boolean);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('DIAMOND777');
    alert('Referral code copied!');
  };

  return (
    <PageWrapper title="MY PROFILE" showNav={true}>
      <div className="bg-white min-h-screen">
        {/* Profile Header Card */}
        <div className="p-10 bg-gradient-to-br from-[#ff0033] to-[#ff4d6a] relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-125 transition-transform"></div>
           <div className="flex flex-col items-center relative z-10">
              <div className="w-24 h-24 bg-white p-1 rounded-[2.5rem] shadow-2xl mb-4 group relative transform group-hover:-rotate-3 transition-transform">
                 <div className="w-full h-full bg-gray-50 rounded-[2.5rem] flex items-center justify-center border border-gray-100 italic font-black text-3xl text-[#ff0033] shadow-inner">
                    {user?.name?.charAt(0) || 'P'}
                 </div>
                 <div className="absolute bottom-1 right-1 bg-white p-1.5 rounded-full shadow-lg border border-[#ff0033]/20">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                 </div>
              </div>
               <h2 className="text-white text-3xl font-black uppercase tracking-tighter italic leading-none">{user?.name || 'Pranesh'}</h2>
               <p className="text-white/60 font-black text-[10px] uppercase tracking-[0.3em] mt-1 shadow-sm px-2 py-0.5 rounded-full border border-white/5 bg-black/5">
                 {isAdmin ? 'Secretariat Authority' : 'Verified Member'}
               </p>
            </div>
         </div>

         {/* Quick Balance Section - Hidden for Admins */}
         {!isAdmin && (
           <div className="px-6 -mt-10 relative z-20">
              <div className="bg-white rounded-[2rem] p-6 shadow-2xl border border-gray-100 flex items-center justify-between group active:scale-95 transition-all cursor-pointer" onClick={() => navigate('/topup')}>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 text-[#ff0033] rounded-2xl flex items-center justify-center shadow-sm">
                       <Wallet size={24} />
                    </div>
                    <div>
                       <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Balance</p>
                       <p className="text-2xl font-black text-gray-900 italic tracking-tighter shadow-black drop-shadow-sm">₹ {user?.balance?.toLocaleString() || '0.00'}</p>
                    </div>
                 </div>
                 <div className="bg-[#ff0033] p-2 rounded-xl text-white shadow-lg group-hover:px-4 transition-all overflow-hidden flex items-center gap-1 group-hover:rotate-6">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Add</span>
                    <CreditCard size={18} fill="white" />
                 </div>
              </div>
           </div>
         )}

         {/* Referral Section - Hidden for Admins */}
         {!isAdmin && (
           <div className="p-6">
              <div className="bg-gray-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-xl">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff0033]/20 rounded-full blur-3xl group-hover:bg-[#ff0033]/40 transition-colors"></div>
                 <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                       <Gift className="text-[#ff0033]" size={24} />
                       <h3 className="text-xl font-black font-condensed uppercase tracking-tighter italic italic">Refer & Get Chips</h3>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed mb-6">
                       Invite your friends and both of you will receive <span className="text-white">BONUS CHIPS</span> to buy free tickets!
                    </p>
                    
                    <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 group-hover:border-[#ff0033]/30 transition-all">
                       <div className="flex-grow">
                          <p className="text-[8px] font-black text-[#ff0033] uppercase tracking-widest mb-1">Your Referral Code</p>
                          <p className="text-lg font-black tracking-tighter italic">DIAMOND777</p>
                       </div>
                       <button 
                         onClick={handleCopyCode}
                         className="bg-[#ff0033] p-3 rounded-xl text-white shadow-lg shadow-[#ff0033]/20 active:scale-95 transition-all"
                       >
                          <Copy size={18} />
                       </button>
                    </div>
                 </div>
              </div>
           </div>
         )}

        {/* Menu Items */}
        <div className="p-4 py-6 space-y-4">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 mb-2 italic">Account Services</p>
          {menuItems.map((item, i) => (
            <div 
              key={i} 
              onClick={() => item.path !== '#' && navigate(item.path)}
              className="group flex items-center justify-between p-5 bg-white rounded-[2rem] border border-gray-100 shadow-sm active:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer hover:border-red-100"
            >
              <div className="flex items-center gap-5">
                 <div className={`${item.color} bg-gray-50 p-3 rounded-2xl shadow-sm border border-gray-50 group-hover:scale-110 transition-transform group-hover:rotate-6 group-hover:bg-white`}>
                    {item.icon}
                 </div>
                 <span className="font-black text-gray-800 uppercase tracking-tight text-sm italic">{item.label}</span>
              </div>
              <ChevronRight size={20} className="text-gray-200 group-hover:text-[#ff0033] transition-colors" />
            </div>
          ))}

          <div 
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center justify-between p-5 bg-gray-950 text-white rounded-[2rem] border border-gray-900 mt-10 active:scale-95 transition-all cursor-pointer shadow-xl shadow-black/10"
          >
            <div className="flex items-center gap-5">
               <div className="text-[#ff0033] bg-white/10 p-3 rounded-2xl shadow-sm border border-white/5">
                  <LogOut size={20} />
               </div>
               <span className="font-black uppercase tracking-widest text-[11px] italic">Logout Securely</span>
            </div>
            <ChevronRight size={20} className="text-white/20" />
          </div>
        </div>

        <div className="p-8 text-center border-t border-gray-50 mt-4 opacity-30">
           <p className="text-[9px] text-gray-300 font-bold uppercase tracking-[0.3em] font-serif italic italic leading-tight">Diamond Secretariat Authority Suite v4.5.1</p>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ProfilePage;
