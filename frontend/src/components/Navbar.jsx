import React from 'react';
import {
  ShieldCheck,
  PlusCircle,
  Search,
  UserCheck,
  LayoutDashboard,
  LogIn,
  LogOut,
  Sparkles
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  user,
  onOpenAuth,
  onLogout
}) {
  // Lodge grievance
  // Both citizens and admins can file complaints.
  const handleLodgeGrievance = () => {
    if (!user) {
      onOpenAuth('citizen');
      return;
    }

    setActiveTab('lodge');
  };

  // Citizen Panel / My Admin Panel
  //
  // IMPORTANT:
  // Even when the logged-in user is an admin,
  // this still opens the existing CitizenDashboard.
  //
  // This allows an admin to use the system as a citizen
  // and file/track their own grievance.
  const handlePersonalPanel = () => {
    if (!user) {
      onOpenAuth('citizen');
      return;
    }

    setActiveTab('citizen');
  };

  // Admin Portal
  // This opens the separate AdminPanel for management.
  const handleAdminPortal = () => {
    if (!user || user.role !== 'admin') {
      onOpenAuth('admin');
      return;
    }

    setActiveTab('admin');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex justify-between items-center h-16">

          {/* =====================================================
              LOGO & BRANDING
          ====================================================== */}
          <div
            onClick={() => setActiveTab('landing')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-100 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-bold text-slate-900 tracking-tight font-sans">
                  Sahaay<span className="text-sky-600">AI</span>
                </span>

                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                  <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                  NLP Smart
                </span>
              </div>

              <p className="text-[11px] text-slate-500 hidden sm:block">
                AI-Based Smart Grievance Redressal System
              </p>
            </div>
          </div>


          {/* =====================================================
              DESKTOP NAVIGATION
          ====================================================== */}
          <nav className="hidden md:flex items-center space-x-1">

            {/* Home */}
            <button
              onClick={() => setActiveTab('landing')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'landing'
                  ? 'text-sky-600 bg-sky-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Home
            </button>


            {/* Lodge Grievance */}
            <button
              onClick={handleLodgeGrievance}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors ${
                activeTab === 'lodge'
                  ? 'text-sky-600 bg-sky-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-sky-600" />
              <span>Lodge Grievance</span>
            </button>


            {/* Track Status */}
            <button
              onClick={() => setActiveTab('track')}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors ${
                activeTab === 'track'
                  ? 'text-sky-600 bg-sky-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Search className="w-4 h-4 text-emerald-600" />
              <span>Track Status</span>
            </button>


            {/* =================================================
                PERSONAL PANEL

                Citizen:
                Citizen Panel → CitizenDashboard

                Admin:
                My Admin Panel → SAME CitizenDashboard

                Only the label changes.
                Functionality remains unchanged.
            ================================================== */}
            <button
              onClick={handlePersonalPanel}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors ${
                activeTab === 'citizen'
                  ? 'text-sky-600 bg-sky-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-4 h-4 text-indigo-600" />

              <span>
                {user?.role === 'admin'
                  ? 'My Admin Panel'
                  : 'Citizen Panel'}
              </span>
            </button>


            {/* =================================================
                ADMIN PORTAL

                This is separate from My Admin Panel.

                My Admin Panel:
                → CitizenDashboard
                → Admin can file/track own complaint

                Admin Portal:
                → AdminPanel
                → Manage all complaints
                → Analytics
                → Review/update grievances
            ================================================== */}
            <button
              onClick={handleAdminPortal}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-colors ${
                activeTab === 'admin'
                  ? 'text-violet-600 bg-violet-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-violet-600" />
              <span>Admin Portal</span>
            </button>

          </nav>


          {/* =====================================================
              USER AUTH INFO / ACTIONS
          ====================================================== */}
          <div className="flex items-center space-x-3">

            {user ? (

              <div className="flex items-center space-x-2">

                {/* User Name + Role */}
                <div className="hidden sm:block text-right">

                  <div className="text-xs font-semibold text-slate-800">
                    {user.name}
                  </div>

                  <span
                    className={`inline-block px-1.5 py-0.2 rounded text-[10px] uppercase font-bold tracking-wider ${
                      user.role === 'admin'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-sky-100 text-sky-800'
                    }`}
                  >
                    {user.role === 'admin'
                      ? 'Officer / Admin'
                      : 'Citizen'}
                  </span>

                </div>


                {/* Logout */}
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>

              </div>

            ) : (

              <div className="flex items-center space-x-2">

                {/* Citizen Login */}
                <button
                  onClick={() => onOpenAuth('citizen')}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Citizen Login
                </button>


                {/* Admin Login */}
                <button
                  onClick={() => onOpenAuth('admin')}
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm flex items-center space-x-1"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Admin Login</span>
                </button>

              </div>

            )}

          </div>

        </div>
      </div>


      {/* =====================================================
          MOBILE NAVIGATION
      ====================================================== */}
      <div className="md:hidden flex border-t border-slate-200 overflow-x-auto py-1 px-3 space-x-1 bg-slate-50 text-xs">

        {/* Home */}
        <button
          onClick={() => setActiveTab('landing')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeTab === 'landing'
              ? 'bg-sky-600 text-white font-medium'
              : 'text-slate-700'
          }`}
        >
          Home
        </button>


        {/* Lodge Grievance */}
        <button
          onClick={handleLodgeGrievance}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeTab === 'lodge'
              ? 'bg-sky-600 text-white font-medium'
              : 'text-slate-700'
          }`}
        >
          Lodge Grievance
        </button>


        {/* Track */}
        <button
          onClick={() => setActiveTab('track')}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeTab === 'track'
              ? 'bg-sky-600 text-white font-medium'
              : 'text-slate-700'
          }`}
        >
          Track
        </button>


        {/* Personal Panel */}
        <button
          onClick={handlePersonalPanel}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeTab === 'citizen'
              ? 'bg-sky-600 text-white font-medium'
              : 'text-slate-700'
          }`}
        >
          {user?.role === 'admin'
            ? 'My Admin Panel'
            : 'Citizen Panel'}
        </button>


        {/* Admin Portal */}
        <button
          onClick={handleAdminPortal}
          className={`px-2.5 py-1 rounded whitespace-nowrap ${
            activeTab === 'admin'
              ? 'bg-violet-600 text-white font-medium'
              : 'text-slate-700'
          }`}
        >
          Admin Portal
        </button>

      </div>

    </header>
  );
}