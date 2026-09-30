import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Search,
  Sparkles,
  Edit3,
  Send,
  RefreshCw,
  Database,
  MapPin,
  X,
  Star
} from 'lucide-react';

export default function AdminPanel({ user, onOpenAuth }) {
  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // FILTERS
  // ============================================================

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');

  // ============================================================
  // REVIEW MODAL STATE
  // ============================================================

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('');
  const [reviewPriority, setReviewPriority] = useState('');
  const [reviewDept, setReviewDept] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [assignedOfficer, setAssignedOfficer] = useState('');
  const [updating, setUpdating] = useState(false);
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState('');

  // ============================================================
  // AUTH HEADERS
  // ============================================================

  const getAuthHeaders = () => {
    const token = localStorage.getItem('sahaay_token');

    return {
      'Content-Type': 'application/json',
      ...(token
        ? {
            Authorization: `Bearer ${token}`
          }
        : {})
    };
  };

  // ============================================================
  // DEPARTMENTS
  // ============================================================

  const departmentsList = [
    'Sanitation & Waste Management',
    'Electricity & Power',
    'Water Supply & Sewage',
    'Roads, Bridges & Infrastructure',
    'Public Safety & Law Enforcement',
    'Civic Amenities & Municipal Services'
  ];

  // ============================================================
  // FETCH DATA
  // ============================================================

  useEffect(() => {
    fetchData();
  }, [selectedStatus, selectedDept, selectedPriority]);

  const fetchData = async () => {
    setLoading(true);

    try {
      const authHeaders = getAuthHeaders();

      // ========================================================
      // 1. FETCH COMPLAINTS
      // ========================================================

      const params = new URLSearchParams();

      if (selectedStatus !== 'All') {
        params.append('status', selectedStatus);
      }

      if (selectedDept !== 'All') {
        params.append('department', selectedDept);
      }

      if (selectedPriority !== 'All') {
        params.append('priority', selectedPriority);
      }

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const resList = await fetch(
        `/api/admin/complaints?${params.toString()}`,
        {
          headers: authHeaders
        }
      );

      let complaintList = [];

      if (resList.ok) {
        const data = await resList.json();

        complaintList = data.complaints || [];

        setComplaints(complaintList);
      } else {
        console.error(
          'Admin complaints API error:',
          resList.status
        );

        if (
          resList.status === 401 ||
          resList.status === 403
        ) {
          console.error(
            'Admin authentication failed. Please login again as admin.'
          );
        }

        setComplaints([]);
      }

      // ========================================================
      // 2. CALCULATE AVERAGE URGENCY
      // ========================================================

      const urgencyValues = complaintList
        .map((item) => Number(item.urgency_score))
        .filter((value) => !Number.isNaN(value));

      const avgUrgencyScore =
        urgencyValues.length > 0
          ? Math.round(
              urgencyValues.reduce(
                (sum, value) => sum + value,
                0
              ) / urgencyValues.length
            )
          : 0;

      // ========================================================
      // 3. FETCH ANALYTICS
      // ========================================================

      const resStats = await fetch(
        '/api/admin/analytics',
        {
          headers: authHeaders
        }
      );

      if (resStats.ok) {
        const dataStats = await resStats.json();

        console.log(
          'Admin analytics response:',
          dataStats
        );

        // ------------------------------------------------------
        // Backend grouped analytics
        // ------------------------------------------------------

        const statusCounts =
          dataStats.status_counts || {};

        const priorityCounts =
          dataStats.priority_counts || {};

        const departmentCounts =
          dataStats.department_counts || {};

        // ------------------------------------------------------
        // TOTAL
        // ------------------------------------------------------

        const totalComplaints =
          Number(dataStats.total) ||
          Number(dataStats.total_complaints) ||
          0;

        // ------------------------------------------------------
        // STATUS COUNTS
        // ------------------------------------------------------

        const pending =
          Number(statusCounts['Pending']) || 0;

        const underReview =
          Number(statusCounts['Under Review']) || 0;

        const inProgress =
          Number(statusCounts['In Progress']) || 0;

        const resolved =
          Number(statusCounts['Resolved']) || 0;

        const rejected =
          Number(statusCounts['Rejected']) || 0;

        // ------------------------------------------------------
        // RESOLUTION RATE
        // ------------------------------------------------------

        const resolutionRate =
          totalComplaints > 0
            ? Math.round(
                (resolved / totalComplaints) * 100
              )
            : 0;

        // ------------------------------------------------------
        // PRIORITY COUNTS
        // ------------------------------------------------------

        const highPriority =
          Number(priorityCounts['High']) || 0;

        const mediumPriority =
          Number(priorityCounts['Medium']) || 0;

        const lowPriority =
          Number(priorityCounts['Low']) || 0;

        // ------------------------------------------------------
        // CITIZEN RATING
        // ------------------------------------------------------

        const averageRating =
          Number(
            dataStats.average_rating ??
              dataStats.avg_citizen_rating ??
              0
          ) || 0;

        // ------------------------------------------------------
        // NORMALIZED ANALYTICS OBJECT
        // ------------------------------------------------------

        setAnalytics({
          total_complaints: totalComplaints,

          pending: pending,

          under_review: underReview,

          in_progress: inProgress,

          resolved: resolved,

          rejected: rejected,

          resolution_rate: resolutionRate,

          high_priority: highPriority,

          priority_breakdown: {
            High: highPriority,
            Medium: mediumPriority,
            Low: lowPriority
          },

          department_breakdown:
            departmentCounts,

          avg_urgency_score:
            avgUrgencyScore,

          avg_citizen_rating:
            averageRating.toFixed(1)
        });
      } else {
        console.error(
          'Admin analytics API error:',
          resStats.status
        );

        setAnalytics(null);
      }
    } catch (err) {
      console.error(
        'Admin panel fetch error:',
        err
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // SEARCH
  // ============================================================

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  // ============================================================
  // OPEN REVIEW MODAL
  // ============================================================

  const handleOpenReview = (c) => {
    setSelectedComplaint(c);

    setReviewStatus(
      c.status || 'Pending'
    );

    setReviewPriority(
      c.priority || 'Medium'
    );

    setReviewDept(
      c.department ||
        departmentsList[0]
    );

    setReviewNotes(
      c.officer_notes || ''
    );

    setAssignedOfficer(
      c.assigned_officer ||
        'Chief Grievance Officer'
    );

    setFeedbackSuccessMsg('');
  };

  // ============================================================
  // UPDATE COMPLAINT
  // ============================================================

  const handleUpdateReview = async (e) => {
    e.preventDefault();

    if (!selectedComplaint) {
      return;
    }

    setUpdating(true);
    setFeedbackSuccessMsg('');

    try {
      const res = await fetch(
        `/api/admin/complaints/${selectedComplaint.id}/review`,
        {
          method: 'PATCH',
          headers: getAuthHeaders(),

          body: JSON.stringify({
            status: reviewStatus,
            priority: reviewPriority,
            department: reviewDept,
            officer_notes: reviewNotes,
            assigned_officer: assignedOfficer
          })
        }
      );

      const data = await res.json();

      if (res.ok) {
        setFeedbackSuccessMsg(
          'Grievance status and officer remarks updated successfully!'
        );

        setTimeout(() => {
          setSelectedComplaint(null);
          fetchData();
        }, 1200);
      } else {
        console.error(
          'Review update failed:',
          res.status,
          data
        );

        setFeedbackSuccessMsg(
          data.error ||
            'Failed to update grievance.'
        );
      }
    } catch (err) {
      console.error(
        'Review update error:',
        err
      );

      setFeedbackSuccessMsg(
        'Unable to update grievance. Please try again.'
      );
    } finally {
      setUpdating(false);
    }
  };

  // ============================================================
  // SEED DEMO DATA
  // ============================================================

  const handleSeedData = async () => {
    try {
      const res = await fetch(
        '/api/admin/seed-demo',
        {
          method: 'POST',
          headers: getAuthHeaders()
        }
      );

      if (res.ok) {
        fetchData();
      } else {
        console.error(
          'Seed demo data failed:',
          res.status
        );
      }
    } catch (err) {
      console.error(
        'Seed demo data error:',
        err
      );
    }
  };

  // ============================================================
  // KEYWORD HELPER
  // ============================================================

  const getKeywords = (keywords) => {
    if (!keywords) {
      return [];
    }

    if (Array.isArray(keywords)) {
      return keywords;
    }

    if (typeof keywords === 'string') {
      return keywords
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* ======================================================
          TOP BANNER
      ====================================================== */}

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

        <div>

          <div className="flex items-center space-x-2">

            <span className="text-xs uppercase font-bold tracking-wider text-violet-700 bg-violet-50 px-3 py-1 rounded-full border border-violet-200">
              Admin & Redressal Officer Portal
            </span>

            <span className="inline-flex items-center text-xs text-slate-500 font-medium">

              <Sparkles className="w-3.5 h-3.5 text-sky-500 mr-1" />

              AI-Assisted Resolution

            </span>

          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Grievance Redressal Command Center
          </h2>

          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Review grievances, inspect NLP-extracted tags, auto-prioritized severity, and dispatch official resolutions.
          </p>

        </div>

        <div className="flex items-center space-x-2">

          <button
            onClick={fetchData}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-sm transition-colors flex items-center space-x-1.5"
            title="Refresh Table"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleSeedData}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 transition-colors flex items-center space-x-1.5"
            title="Seed Sample Realistic Records"
          >
            <Database className="w-3.5 h-3.5 text-slate-600" />
            <span>Seed Demo Data</span>
          </button>

        </div>

      </div>

      {/* ======================================================
          KPI CARDS
      ====================================================== */}

      {analytics && (

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">

          {/* TOTAL */}

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">

            <div className="text-xs font-bold text-slate-400 uppercase">
              Total
            </div>

            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {analytics.total_complaints}
            </div>

            <div className="text-[11px] text-slate-500 mt-0.5">
              Complaints
            </div>

          </div>

          {/* PENDING */}

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">

            <div className="text-xs font-bold text-amber-500 uppercase">
              Pending
            </div>

            <div className="text-2xl font-extrabold text-amber-600 mt-1">
              {analytics.pending}
            </div>

            <div className="text-[11px] text-slate-500 mt-0.5">
              Awaiting triage
            </div>

          </div>

          {/* UNDER REVIEW */}

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">

            <div className="text-xs font-bold text-sky-500 uppercase">
              Under Review
            </div>

            <div className="text-2xl font-extrabold text-sky-600 mt-1">
              {analytics.under_review}
            </div>

            <div className="text-[11px] text-slate-500 mt-0.5">
              With Department
            </div>

          </div>

          {/* IN PROGRESS */}

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">

            <div className="text-xs font-bold text-indigo-500 uppercase">
              In Progress
            </div>

            <div className="text-2xl font-extrabold text-indigo-600 mt-1">
              {analytics.in_progress}
            </div>

            <div className="text-[11px] text-slate-500 mt-0.5">
              Action ongoing
            </div>

          </div>

          {/* RESOLVED */}

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">

            <div className="text-xs font-bold text-emerald-500 uppercase">
              Resolved
            </div>

            <div className="text-2xl font-extrabold text-emerald-600 mt-1">
              {analytics.resolved}
            </div>

            <div className="text-[11px] text-emerald-600 font-bold mt-0.5">
              {analytics.resolution_rate}% rate
            </div>

          </div>

          {/* HIGH ALERT */}

          <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/30 shadow-sm">

            <div className="text-xs font-bold text-rose-600 uppercase flex items-center">

              <AlertTriangle className="w-3.5 h-3.5 mr-1" />

              <span>
                High Alert
              </span>

            </div>

            <div className="text-2xl font-extrabold text-rose-700 mt-1">
              {analytics.high_priority}
            </div>

            <div className="text-[11px] text-rose-600 font-medium mt-0.5">
              Urgent Safety
            </div>

          </div>

        </div>
      )}

      {/* ======================================================
          ANALYTICS
      ====================================================== */}

      {analytics && (

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ==================================================
              DEPARTMENT BREAKDOWN
          ================================================== */}

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">

            <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">

              <span>
                Departmental Distribution
              </span>

              <span className="text-xs text-slate-500 font-normal">
                Auto-Categorized
              </span>

            </h4>

            <div className="space-y-3">

              {Object.keys(
                analytics.department_breakdown || {}
              ).length === 0 ? (

                <div className="py-8 text-center text-sm text-slate-400">
                  No department data available.
                </div>

              ) : (

                Object.entries(
                  analytics.department_breakdown || {}
                ).map(([dept, count]) => {

                  const pct =
                    analytics.total_complaints > 0
                      ? Math.round(
                          (Number(count) /
                            analytics.total_complaints) *
                            100
                        )
                      : 0;

                  return (

                    <div key={dept}>

                      <div className="flex justify-between text-xs mb-1 gap-3">

                        <span className="font-medium text-slate-700 truncate">
                          {dept}
                        </span>

                        <span className="font-bold text-slate-900 whitespace-nowrap">
                          {count} ({pct}%)
                        </span>

                      </div>

                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">

                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sky-500 to-teal-500"
                          style={{
                            width: `${Math.max(
                              pct,
                              count > 0 ? 5 : 0
                            )}%`
                          }}
                        />

                      </div>

                    </div>

                  );
                })

              )}

            </div>

          </div>

          {/* ==================================================
              PRIORITY BREAKDOWN
          ================================================== */}

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">

            <div>

              <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">

                <span>
                  Priority Auto-Assignment Breakdown
                </span>

                <span className="text-xs text-slate-500 font-normal">
                  NLP Urgency Heuristics
                </span>

              </h4>

              <div className="grid grid-cols-3 gap-3 mb-6 text-center">

                {/* HIGH */}

                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">

                  <div className="text-xs font-bold text-rose-700">
                    High Priority
                  </div>

                  <div className="text-xl font-bold text-rose-900 mt-1">
                    {analytics.priority_breakdown?.High || 0}
                  </div>

                  <div className="text-[10px] text-rose-600 mt-0.5">
                    Critical hazards
                  </div>

                </div>

                {/* MEDIUM */}

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">

                  <div className="text-xs font-bold text-amber-700">
                    Medium Priority
                  </div>

                  <div className="text-xl font-bold text-amber-900 mt-1">
                    {analytics.priority_breakdown?.Medium || 0}
                  </div>

                  <div className="text-[10px] text-amber-600 mt-0.5">
                    Standard municipal
                  </div>

                </div>

                {/* LOW */}

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">

                  <div className="text-xs font-bold text-emerald-700">
                    Low Priority
                  </div>

                  <div className="text-xl font-bold text-emerald-900 mt-1">
                    {analytics.priority_breakdown?.Low || 0}
                  </div>

                  <div className="text-[10px] text-emerald-600 mt-0.5">
                    Administrative
                  </div>

                </div>

              </div>

            </div>

            {/* URGENCY + RATING */}

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">

              <div>

                <div className="text-xs text-slate-500 font-medium">
                  Avg NLP Urgency Index
                </div>

                <div className="text-xl font-bold text-slate-900">
                  {analytics.avg_urgency_score} / 100
                </div>

              </div>

              <div className="text-right">

                <div className="text-xs text-slate-500 font-medium">
                  Citizen Rating
                </div>

                <div className="text-xl font-bold text-amber-600 flex items-center justify-end">

                  <Star className="w-4 h-4 fill-amber-500 mr-1" />

                  <span>
                    {analytics.avg_citizen_rating} / 5.0
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* ======================================================
          FILTERS + TABLE
      ====================================================== */}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="p-5 border-b border-slate-200 bg-slate-50/60 flex flex-col md:flex-row items-center justify-between gap-4">

          {/* SEARCH */}

          <form
            onSubmit={handleSearchSubmit}
            className="relative w-full md:w-80"
          >

            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />

            <input
              type="text"
              placeholder="Search ID, title, keyword..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
            />

          </form>

          {/* FILTERS */}

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">

            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value)
              }
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >

              <option value="All">
                All Statuses
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Under Review">
                Under Review
              </option>

              <option value="In Progress">
                In Progress
              </option>

              <option value="Resolved">
                Resolved
              </option>

              <option value="Rejected">
                Rejected
              </option>

            </select>

            <select
              value={selectedDept}
              onChange={(e) =>
                setSelectedDept(e.target.value)
              }
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 max-w-xs truncate"
            >

              <option value="All">
                All Departments
              </option>

              {departmentsList.map((d) => (

                <option
                  key={d}
                  value={d}
                >
                  {d}
                </option>

              ))}

            </select>

            <select
              value={selectedPriority}
              onChange={(e) =>
                setSelectedPriority(e.target.value)
              }
              className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >

              <option value="All">
                All Priorities
              </option>

              <option value="High">
                High
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="Low">
                Low
              </option>

            </select>

          </div>

        </div>

        {/* ====================================================
            COMPLAINTS TABLE
        ==================================================== */}

        <div className="overflow-x-auto">

          <table className="w-full text-left border-collapse">

            <thead>

              <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">

                <th className="py-3 px-4">
                  Tracking ID
                </th>

                <th className="py-3 px-4">
                  Subject & Location
                </th>

                <th className="py-3 px-4">
                  Department
                </th>

                <th className="py-3 px-4">
                  Priority
                </th>

                <th className="py-3 px-4">
                  Urgency
                </th>

                <th className="py-3 px-4">
                  Status
                </th>

                <th className="py-3 px-4 text-right">
                  Action
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">

              {loading ? (

                <tr>

                  <td
                    colSpan="7"
                    className="py-12 text-center text-slate-500"
                  >
                    Loading complaints...
                  </td>

                </tr>

              ) : complaints.length === 0 ? (

                <tr>

                  <td
                    colSpan="7"
                    className="py-12 text-center text-slate-500"
                  >
                    No grievances matching current filters.
                  </td>

                </tr>

              ) : (

                complaints.map((item) => (

                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >

                    {/* TRACKING ID */}

                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {item.tracking_id}
                    </td>

                    {/* SUBJECT */}

                    <td className="py-3 px-4 max-w-xs">

                      <div
                        className="font-bold text-slate-900 truncate"
                        title={item.title}
                      >
                        {item.title}
                      </div>

                      <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">

                        <MapPin className="w-3 h-3 shrink-0" />

                        <span className="truncate">
                          {item.location}
                        </span>

                      </div>

                    </td>

                    {/* DEPARTMENT */}

                    <td className="py-3 px-4 whitespace-nowrap">

                      <div className="font-semibold text-slate-800">
                        {item.department}
                      </div>

                      <div className="text-[10px] text-sky-600 font-medium">

                        {Math.round(
                          Number(
                            item.ai_confidence || 0
                          ) * 100
                        )}
                        % AI Conf.

                      </div>

                    </td>

                    {/* PRIORITY */}

                    <td className="py-3 px-4 whitespace-nowrap">

                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          item.priority === 'High'
                            ? 'bg-rose-100 text-rose-800'
                            : item.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.priority}
                      </span>

                    </td>

                    {/* URGENCY */}

                    <td className="py-3 px-4 whitespace-nowrap">

                      <div className="flex items-center space-x-1.5">

                        <span className="font-bold text-slate-900">
                          {item.urgency_score ?? 0}
                        </span>

                        <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">

                          <div
                            className={`h-full ${
                              Number(
                                item.urgency_score || 0
                              ) > 65
                                ? 'bg-rose-500'
                                : 'bg-amber-500'
                            }`}
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  0,
                                  Number(
                                    item.urgency_score || 0
                                  )
                                )
                              )}%`
                            }}
                          />

                        </div>

                      </div>

                    </td>

                    {/* STATUS */}

                    <td className="py-3 px-4 whitespace-nowrap">

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          item.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'In Progress'
                            ? 'bg-sky-100 text-sky-800'
                            : item.status === 'Under Review'
                            ? 'bg-indigo-100 text-indigo-800'
                            : item.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        ● {item.status}
                      </span>

                    </td>

                    {/* ACTION */}

                    <td className="py-3 px-4 text-right whitespace-nowrap">

                      <button
                        onClick={() =>
                          handleOpenReview(item)
                        }
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1 ml-auto"
                      >

                        <Edit3 className="w-3 h-3" />

                        <span>
                          Review
                        </span>

                      </button>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ======================================================
          REVIEW MODAL
      ====================================================== */}

      {selectedComplaint && (

        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">

          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between pb-4 border-b border-slate-200">

              <div className="flex items-center space-x-2">

                <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">

                  {selectedComplaint.tracking_id}

                </span>

                <span className="text-xs text-slate-500">

                  Citizen:

                  <strong>
                    {' '}
                    {selectedComplaint.citizen_name}
                  </strong>

                  {' '}
                  ({selectedComplaint.citizen_phone})

                </span>

              </div>

              <button
                onClick={() =>
                  setSelectedComplaint(null)
                }
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >

                <X className="w-5 h-5" />

              </button>

            </div>

            {/* SUCCESS / ERROR MESSAGE */}

            {feedbackSuccessMsg && (

              <div className="my-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2">

                <CheckCircle2 className="w-4 h-4 shrink-0" />

                <span>
                  {feedbackSuccessMsg}
                </span>

              </div>

            )}

            {/* ==================================================
                GRIEVANCE DETAILS
            ================================================== */}

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* GRIEVANCE */}

              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">

                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Grievance Information
                </span>

                <h4 className="font-bold text-slate-900 text-sm">
                  {selectedComplaint.title}
                </h4>

                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedComplaint.description}
                </p>

                <div className="text-[11px] text-slate-500 flex items-center space-x-1">

                  <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />

                  <span>
                    {selectedComplaint.location}
                  </span>

                </div>

              </div>

              {/* AI ANALYSIS */}

              <div className="space-y-3 bg-sky-50/70 p-4 rounded-2xl border border-sky-200/80">

                <div className="flex items-center space-x-1.5 text-xs font-bold text-sky-900 uppercase tracking-wider">

                  <Sparkles className="w-4 h-4 text-sky-600" />

                  <span>
                    SahaayAI Model Insights
                  </span>

                </div>

                <div className="text-xs space-y-1">

                  <div>

                    Auto-Classified Dept:

                    <strong className="text-slate-900">

                      {' '}
                      {selectedComplaint.ai_predicted_department ||
                        selectedComplaint.department}

                    </strong>

                    {' '}
                    (
                    {Math.round(
                      Number(
                        selectedComplaint.ai_confidence ||
                          0
                      ) * 100
                    )}
                    % Conf)

                  </div>

                  <div>

                    Urgency Index:

                    <strong className="text-slate-900">

                      {' '}
                      {selectedComplaint.urgency_score ??
                        0}{' '}
                      / 100

                    </strong>

                  </div>

                  <div>

                    Suggested Priority:

                    <strong className="text-slate-900">

                      {' '}
                      {selectedComplaint.ai_suggested_priority ||
                        selectedComplaint.priority}

                    </strong>

                  </div>

                </div>

                {/* KEYWORDS */}

                {getKeywords(
                  selectedComplaint.keywords
                ).length > 0 && (

                  <div>

                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">

                      NLP Extracted Keywords:

                    </span>

                    <div className="flex flex-wrap gap-1">

                      {getKeywords(
                        selectedComplaint.keywords
                      ).map((kw, i) => (

                        <span
                          key={i}
                          className="px-2 py-0.5 bg-white text-slate-700 rounded text-[11px] border border-slate-300 font-medium"
                        >
                          #{kw}
                        </span>

                      ))}

                    </div>

                  </div>

                )}

              </div>

            </div>

            {/* ==================================================
                OFFICER ACTION FORM
            ================================================== */}

            <form
              onSubmit={handleUpdateReview}
              className="mt-6 space-y-4"
            >

              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Official Resolution & Dispatch Action
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                {/* STATUS */}

                <div>

                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Update Status
                  </label>

                  <select
                    value={reviewStatus}
                    onChange={(e) =>
                      setReviewStatus(
                        e.target.value
                      )
                    }
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 font-semibold bg-white"
                  >

                    <option value="Pending">
                      Pending
                    </option>

                    <option value="Under Review">
                      Under Review
                    </option>

                    <option value="In Progress">
                      In Progress
                    </option>

                    <option value="Resolved">
                      Resolved
                    </option>

                    <option value="Rejected">
                      Rejected
                    </option>

                  </select>

                </div>

                {/* DEPARTMENT */}

                <div>

                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assigned Department
                  </label>

                  <select
                    value={reviewDept}
                    onChange={(e) =>
                      setReviewDept(
                        e.target.value
                      )
                    }
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 bg-white"
                  >

                    {departmentsList.map(
                      (d) => (

                        <option
                          key={d}
                          value={d}
                        >
                          {d}
                        </option>

                      )
                    )}

                  </select>

                </div>

                {/* PRIORITY */}

                <div>

                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Severity Priority
                  </label>

                  <select
                    value={reviewPriority}
                    onChange={(e) =>
                      setReviewPriority(
                        e.target.value
                      )
                    }
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 font-semibold bg-white"
                  >

                    <option value="High">
                      High
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="Low">
                      Low
                    </option>

                  </select>

                </div>

              </div>

              {/* OFFICER */}

              <div>

                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Officer / Authority Name
                </label>

                <input
                  type="text"
                  value={assignedOfficer}
                  onChange={(e) =>
                    setAssignedOfficer(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Ward Officer A. K. Verma"
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 bg-white"
                />

              </div>

              {/* NOTES */}

              <div>

                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resolution Notes & Citizen Response Remarks
                </label>

                <textarea
                  rows="3"
                  value={reviewNotes}
                  onChange={(e) =>
                    setReviewNotes(
                      e.target.value
                    )
                  }
                  placeholder="Enter actions taken, dispatch details, contractor instructions, or resolution notes visible to the citizen..."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 bg-white"
                />

              </div>

              {/* BUTTONS */}

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">

                <button
                  type="button"
                  onClick={() =>
                    setSelectedComplaint(null)
                  }
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updating}
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-md transition-colors flex items-center space-x-1.5 disabled:opacity-60"
                >

                  <Send className="w-3.5 h-3.5" />

                  <span>
                    {updating
                      ? 'Saving Changes...'
                      : 'Save & Dispatch Action'}
                  </span>

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}