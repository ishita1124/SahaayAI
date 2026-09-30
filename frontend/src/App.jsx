import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import RegisterComplaint from './components/RegisterComplaint';
import TrackComplaint from './components/TrackComplaint';
import CitizenDashboard from './components/CitizenDashboard';
import AdminPanel from './components/AdminPanel';
import AuthModal from './components/AuthModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState('citizen');
  const [currentTrackingId, setCurrentTrackingId] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);

  // Restore login session
  useEffect(() => {
    const savedUser = localStorage.getItem('sahaay_user');
    const savedToken = localStorage.getItem('sahaay_token');

    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);

        setUser(parsedUser);

        // Restore the correct dashboard
        if (parsedUser.role === 'admin') {
          setActiveTab('admin');
        } else {
          setActiveTab('citizen');
        }
      } catch (error) {
        console.error('Invalid saved user session:', error);

        localStorage.removeItem('sahaay_user');
        localStorage.removeItem('sahaay_token');
      }
    }

    fetchAnalytics();
  }, []);

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('sahaay_token');

      const headers = {
        'Content-Type': 'application/json',
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      };

      const res = await fetch('/api/admin/analytics', {
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  // Open authentication modal
  const handleOpenAuth = (role = 'citizen') => {
    setAuthModalRole(role);
    setAuthModalOpen(true);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('sahaay_token');
    localStorage.removeItem('sahaay_user');

    setUser(null);
    setCurrentTrackingId('');
    setActiveTab('landing');
  };

  // Track complaint
  const handleQuickTrack = (trackingId) => {
    setCurrentTrackingId(trackingId);
    setActiveTab('track');
  };

  // Complaint submitted
  const handleComplaintSubmitted = (complaint) => {
    if (complaint?.tracking_id) {
      setCurrentTrackingId(complaint.tracking_id);
    }

    fetchAnalytics();
  };

  // Open complaint form
  // Both citizens and admins can submit complaints.
  const handleLodgeComplaint = () => {
    if (!user) {
      handleOpenAuth('citizen');
      return;
    }

    setActiveTab('lodge');
  };

  // Authentication successful
  const handleAuthSuccess = (authedUser) => {
    setUser(authedUser);
    setAuthModalOpen(false);

    if (authedUser.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('citizen');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">

      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1">

        {/* Landing Page */}
        {activeTab === 'landing' && (
          <LandingPage
            setActiveTab={setActiveTab}
            onQuickTrack={handleQuickTrack}
            analyticsData={analyticsData}
            user={user}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {/* Lodge Complaint */}
        {activeTab === 'lodge' && (
          <RegisterComplaint
            user={user}
            onComplaintSubmitted={handleComplaintSubmitted}
            onTrackComplaint={(id) => {
              setCurrentTrackingId(id);
              setActiveTab('track');
            }}
          />
        )}

        {/* Track Complaint */}
        {activeTab === 'track' && (
          <TrackComplaint
            initialTrackingId={currentTrackingId}
          />
        )}

        {/* Citizen Dashboard */}
        {activeTab === 'citizen' && (
          <CitizenDashboard
            user={user}
            onTrackComplaint={(id) => {
              setCurrentTrackingId(id);
              setActiveTab('track');
            }}
            onLodgeNew={handleLodgeComplaint}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {/* Admin Panel */}
        {activeTab === 'admin' && (
          <AdminPanel
            user={user}
            onOpenAuth={handleOpenAuth}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">

          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
              S
            </div>

            <span className="font-bold text-slate-800 text-sm">
              SahaayAI
            </span>

            <span>
              — AI-Powered Smart Grievance Redressal System
            </span>
          </div>

          <div className="text-center md:text-right text-[11px] leading-relaxed">
            <div>
              Project by <strong>Ishita Bansal (8523225)</strong> •
              B.Tech CSE (AIML) 2023–2027
            </div>

            <div>
              Department of Computer Science & Engineering,
              JMIETI, Radaur
            </div>
          </div>

        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialRole={authModalRole}
        onAuthSuccess={handleAuthSuccess}
      />

    </div>
  );
}