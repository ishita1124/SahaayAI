import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  ShieldAlert,
  Cpu,
  Clock,
  Send,
  Zap,
  Droplet,
  Trash2,
  AlertTriangle,
  FileText,
  Building2,
  Award
} from 'lucide-react';

export default function LandingPage({
  setActiveTab,
  onQuickTrack,
  analyticsData,
  user,
  onOpenAuth
}) {
  const [quickTrackId, setQuickTrackId] = useState('');

  // --------------------------------------------------
  // Lodge grievance
  //
  // Logged in:
  //    → Open complaint form
  //
  // Logged out:
  //    → Open citizen login
  //
  // This works for both citizens and admins.
  // --------------------------------------------------
  const handleLodgeGrievance = () => {
    if (!user) {
      onOpenAuth('citizen');
      return;
    }

    setActiveTab('lodge');
  };

  // --------------------------------------------------
  // Admin Demo / Admin Portal
  //
  // Admin logged in:
  //    → Open Admin Portal
  //
  // Otherwise:
  //    → Open Admin Login
  // --------------------------------------------------
  const handleAdminDemo = () => {
    if (!user || user.role !== 'admin') {
      onOpenAuth('admin');
      return;
    }

    setActiveTab('admin');
  };

  // --------------------------------------------------
  // Track complaint
  // --------------------------------------------------
  const handleTrackSubmit = (e) => {
    e.preventDefault();

    if (quickTrackId.trim()) {
      onQuickTrack(quickTrackId.trim());
    }
  };

  return (
    <div className="space-y-16 pb-16">

      {/* =====================================================
          HERO SECTION
      ====================================================== */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 bg-gradient-to-b from-sky-50/60 via-slate-50 to-white border-b border-slate-200">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">

          {/* Top Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-sky-200 text-sky-700 text-xs sm:text-sm font-medium shadow-sm mb-6 animate-pulse">
            <Sparkles className="w-4 h-4 text-sky-600" />

            <span>
              AI-Powered Citizen Governance & Grievance Redressal
            </span>
          </div>


          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
            Smart Public Grievance Redressal with{' '}

            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-teal-600">
              SahaayAI
            </span>
          </h1>


          {/* Subtitle */}
          <p className="mt-5 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            An Intelligent Complaint Management & Auto-Prioritization Platform using{' '}
            <strong className="text-slate-800 font-semibold">
              Machine Learning
            </strong>{' '}
            and{' '}
            <strong className="text-slate-800 font-semibold">
              Natural Language Processing
            </strong>{' '}
            for seamless civic resolution.
          </p>


          {/* =================================================
              CTA BUTTONS
          ================================================== */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">

            {/* Lodge */}
            <button
              onClick={handleLodgeGrievance}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-semibold text-base shadow-lg shadow-sky-600/20 hover:shadow-sky-600/30 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
            >
              <Send className="w-5 h-5" />

              <span>
                Lodge a Grievance Now
              </span>

              <ArrowRight className="w-4 h-4 ml-1" />
            </button>


            {/* Track */}
            <button
              onClick={() => setActiveTab('track')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-base shadow-sm transition-colors flex items-center justify-center space-x-2"
            >
              <Search className="w-4 h-4 text-slate-500" />

              <span>
                Track Complaint Status
              </span>
            </button>

          </div>


          {/* =================================================
              QUICK TRACK INPUT
          ================================================== */}
          <div className="mt-10 max-w-xl mx-auto">

            <form
              onSubmit={handleTrackSubmit}
              className="relative flex items-center shadow-lg rounded-2xl bg-white border border-slate-200 p-1.5 focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500"
            >

              <Search className="w-5 h-5 text-slate-400 ml-3" />

              <input
                type="text"
                placeholder="Enter Tracking ID (e.g., SHY-2026-8942)"
                value={quickTrackId}
                onChange={(e) => setQuickTrackId(e.target.value)}
                className="w-full px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
              />

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors shrink-0 shadow-sm"
              >
                Track Now
              </button>

            </form>

            <p className="mt-2 text-xs text-slate-500">
              Try demo tracking ID:{' '}

              <span
                onClick={() => {
                  setQuickTrackId('SHY-2026-8942');
                  onQuickTrack('SHY-2026-8942');
                }}
                className="text-sky-600 hover:underline cursor-pointer font-mono font-medium"
              >
                Click to track sample
              </span>
            </p>

          </div>

        </div>
      </section>


      {/* =====================================================
          LIVE STATS OVERVIEW
      ====================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">

          {/* Total */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">

            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-5 h-5" />
            </div>

            <div className="text-2xl sm:text-3xl font-bold text-slate-900">
              {analyticsData
                ? analyticsData.total_complaints
                : '1,250+'}
            </div>

            <div className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Total Grievances Registered
            </div>

          </div>


          {/* Resolution Rate */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">

            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>

            <div className="text-2xl sm:text-3xl font-bold text-slate-900">
              {analyticsData
                ? `${analyticsData.resolution_rate}%`
                : '89.4%'}
            </div>

            <div className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Resolution Rate
            </div>

          </div>


          {/* AI Accuracy */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">

            <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mx-auto mb-3">
              <Cpu className="w-5 h-5" />
            </div>

            <div className="text-2xl sm:text-3xl font-bold text-slate-900">
              96.2%
            </div>

            <div className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              AI Classification Accuracy
            </div>

          </div>


          {/* Response Time */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">

            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-5 h-5" />
            </div>

            <div className="text-2xl sm:text-3xl font-bold text-slate-900">
              &lt; 24 Hrs
            </div>

            <div className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Avg Response Turnaround
            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          HOW SAHAAYAI WORKS
      ====================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-3xl mx-auto mb-12">

          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
            Intelligent Pipeline
          </span>

          <h2 className="text-3xl font-bold text-slate-900 mt-3">
            How SahaayAI Automates Grievance Redressal
          </h2>

          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Structured workflow eliminating manual bottlenecks through modern Natural Language Processing & Machine Learning models.
          </p>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">

          {/* Step 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:border-sky-300 transition-colors">

            <div className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-2">
              Step 01
            </div>

            <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 mb-4">
              <Send className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-slate-900 text-lg mb-2">
              Citizen Submission
            </h3>

            <p className="text-slate-600 text-sm leading-relaxed">
              Citizens submit grievances online with description and location. Live AI preview assists in real-time.
            </p>

          </div>


          {/* Step 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:border-violet-300 transition-colors">

            <div className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-2">
              Step 02
            </div>

            <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 mb-4">
              <Cpu className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-slate-900 text-lg mb-2">
              NLP Categorization
            </h3>

            <p className="text-slate-600 text-sm leading-relaxed">
              TF-IDF and Naive Bayes extract keywords and map the grievance directly to the responsible municipal department.
            </p>

          </div>


          {/* Step 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:border-amber-300 transition-colors">

            <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">
              Step 03
            </div>

            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-slate-900 text-lg mb-2">
              Auto-Prioritization
            </h3>

            <p className="text-slate-600 text-sm leading-relaxed">
              Assesses urgency score (0-100) and severity to flag Critical hazards (High, Medium, Low) for swift officer action.
            </p>

          </div>


          {/* Step 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:border-emerald-300 transition-colors">

            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">
              Step 04
            </div>

            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-slate-900 text-lg mb-2">
              Officer Action & Track
            </h3>

            <p className="text-slate-600 text-sm leading-relaxed">
              Officers review AI insights, resolve the issue, upload remarks, and citizens track real-time progress & give feedback.
            </p>

          </div>

        </div>
      </section>


      {/* =====================================================
          DEPARTMENTS SUPPORTED
      ====================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl">

          <div className="max-w-2xl mb-8">

            <span className="text-xs font-bold uppercase tracking-wider text-sky-400 bg-sky-950/80 px-3 py-1 rounded-full border border-sky-800">
              Departmental Routing
            </span>

            <h2 className="text-2xl sm:text-3xl font-bold mt-3">
              Automated Routing Across Core Public Services
            </h2>

            <p className="text-slate-300 text-sm sm:text-base mt-2">
              SahaayAI’s multi-class classifier instantly routes complaints without manual sorting delays.
            </p>

          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Sanitation */}
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-start space-x-3.5">

              <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>

              <div>
                <h4 className="font-semibold text-white text-sm">
                  Sanitation & Waste
                </h4>

                <p className="text-xs text-slate-400 mt-1">
                  Garbage overflow, sewer blockage, foul stench, illegal dumping.
                </p>
              </div>

            </div>


            {/* Electricity */}
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-start space-x-3.5">

              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                <Zap className="w-5 h-5" />
              </div>

              <div>
                <h4 className="font-semibold text-white text-sm">
                  Electricity & Power
                </h4>

                <p className="text-xs text-slate-400 mt-1">
                  Transformer sparks, live dangling wires, blackouts, faulty meters.
                </p>
              </div>

            </div>


            {/* Water */}
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-start space-x-3.5">

              <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400 shrink-0">
                <Droplet className="w-5 h-5" />
              </div>

              <div>
                <h4 className="font-semibold text-white text-sm">
                  Water Supply & Sewage
                </h4>

                <p className="text-xs text-slate-400 mt-1">
                  Pipeline leaks, contaminated tap water, low pressure, tanker shortage.
                </p>
              </div>

            </div>


            {/* Roads */}
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-start space-x-3.5">

              <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>

              <div>
                <h4 className="font-semibold text-white text-sm">
                  Roads & Infrastructure
                </h4>

                <p className="text-xs text-slate-400 mt-1">
                  Deep potholes, non-functional traffic lights, broken bridges.
                </p>
              </div>

            </div>


            {/* Public Safety */}
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-start space-x-3.5">

              <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>

              <div>
                <h4 className="font-semibold text-white text-sm">
                  Public Safety & Law
                </h4>

                <p className="text-xs text-slate-400 mt-1">
                  Stray dog menace, harassment, illegal parking, noise violations.
                </p>
              </div>

            </div>


            {/* Civic Amenities */}
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-start space-x-3.5">

              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>

              <div>
                <h4 className="font-semibold text-white text-sm">
                  Civic Amenities
                </h4>

                <p className="text-xs text-slate-400 mt-1">
                  Birth/Trade certificates, property tax queries, park maintenance.
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>


      {/* =====================================================
          PROJECT SYNOPSIS / ACADEMIC ATTRIBUTION
      ====================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">

          <div className="flex items-center space-x-4">

            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <Award className="w-6 h-6" />
            </div>

            <div>

              <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Academic Synopsis Project
              </div>

              <h4 className="text-base font-bold text-slate-900">
                AI-Based Smart Grievance Redressal System (SahaayAI)
              </h4>

              <p className="text-xs text-slate-500 mt-0.5">
                Submitted by <strong>Ishita Bansal (8523225)</strong> • B.Tech CSE (AIML), Session 2023–2027
                <br />
                Jai Parkash Mukand Lal Innovative Engineering & Technology Institute, Radaur
              </p>

            </div>

          </div>


          {/* =================================================
              BOTTOM ACTIONS
          ================================================== */}
          <div className="flex items-center space-x-3 shrink-0">

            {/* Test Live System */}
            <button
              onClick={handleLodgeGrievance}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              Test Live System
            </button>


            {/* Admin Demo */}
            <button
              onClick={handleAdminDemo}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              View Admin Demo
            </button>

          </div>

        </div>
      </section>

    </div>
  );
}