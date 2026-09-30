import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  MapPin,
  ArrowRight,
  FileText,
  UserCheck,
  Star,
  MessageSquare,
  Send,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react';

export default function CitizenDashboard({
  user,
  onTrackComplaint,
  onLodgeNew,
  onOpenAuth,
}) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Feedback states
  const [feedbackOpen, setFeedbackOpen] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState({});
  const [feedbackText, setFeedbackText] = useState({});
  const [feedbackLoading, setFeedbackLoading] = useState({});
  const [feedbackMessage, setFeedbackMessage] = useState({});

  useEffect(() => {
    if (user) {
      fetchMyComplaints();
    } else {
      setComplaints([]);
      setLoading(false);
    }
  }, [user]);

  // ============================================================
  // FETCH MY COMPLAINTS
  // ============================================================

  const fetchMyComplaints = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem('sahaay_token');

      if (!token) {
        setComplaints([]);
        return;
      }

      const res = await fetch('/api/complaints/my', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || 'Unable to load your grievances.'
        );
      }

      setComplaints(data.complaints || []);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FORMAT DATE & TIME
  // ============================================================

  const formatDateTime = (dateValue) => {
    if (!dateValue) {
      return 'Date not available';
    }

    try {
      let dateString = String(dateValue).trim();

      if (!dateString) {
        return 'Date not available';
      }

      dateString = dateString.replace(' ', 'T');

      // Backend timestamps without timezone are treated as UTC.
      if (
        !dateString.endsWith('Z') &&
        !/[+-]\d{2}:\d{2}$/.test(dateString)
      ) {
        dateString += 'Z';
      }

      const date = new Date(dateString);

      if (Number.isNaN(date.getTime())) {
        return String(dateValue);
      }

      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return String(dateValue);
    }
  };

  // ============================================================
  // SUBMIT FEEDBACK
  // ============================================================

  const submitFeedback = async (complaintId) => {
    const token = localStorage.getItem('sahaay_token');

    if (!token) {
      setFeedbackMessage((prev) => ({
        ...prev,
        [complaintId]:
          'Your login session has expired. Please login again.',
      }));
      return;
    }

    const rating = feedbackRating[complaintId] || 5;
    const feedback = (feedbackText[complaintId] || '').trim();

    setFeedbackLoading((prev) => ({
      ...prev,
      [complaintId]: true,
    }));

    setFeedbackMessage((prev) => ({
      ...prev,
      [complaintId]: '',
    }));

    try {
      const res = await fetch(
        `/api/complaints/${complaintId}/feedback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating,
            feedback,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || 'Unable to submit feedback.'
        );
      }

      if (data.complaint) {
        setComplaints((prev) =>
          prev.map((complaint) =>
            complaint.id === complaintId
              ? data.complaint
              : complaint
          )
        );
      }

      setFeedbackMessage((prev) => ({
        ...prev,
        [complaintId]: 'Feedback submitted successfully.',
      }));

      setFeedbackOpen(null);
    } catch (error) {
      console.error('Feedback submission error:', error);

      setFeedbackMessage((prev) => ({
        ...prev,
        [complaintId]:
          error.message || 'Unable to submit feedback.',
      }));
    } finally {
      setFeedbackLoading((prev) => ({
        ...prev,
        [complaintId]: false,
      }));
    }
  };

  // ============================================================
  // NOT LOGGED IN
  // ============================================================

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-3xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-4">
          <UserCheck className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900">
          Login Required
        </h2>

        <p className="text-slate-600 text-sm mt-2 mb-6">
          Log in or create an account to access your personal
          grievance dashboard and view your submitted complaints.
        </p>

        <button
          onClick={() => onOpenAuth('citizen')}
          className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md transition-colors"
        >
          Sign In to SahaayAI
        </button>
      </div>
    );
  }

  // ============================================================
  // DASHBOARD COUNTS
  // ============================================================

  const pendingCount = complaints.filter(
    (c) =>
      c.status === 'Pending' ||
      c.status === 'Under Review'
  ).length;

  const inProgressCount = complaints.filter(
    (c) => c.status === 'In Progress'
  ).length;

  const resolvedCount = complaints.filter(
    (c) => c.status === 'Resolved'
  ).length;

  // ============================================================
  // MAIN DASHBOARD
  // ============================================================

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* ======================================================
          WELCOME BAR
      ====================================================== */}

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

        <div>
          <div className="flex flex-wrap items-center gap-2">

            <span className="text-xs uppercase font-bold tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
              My Grievance Workspace
            </span>

            {user.role === 'admin' && (
              <span className="text-xs uppercase font-bold tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Admin Account
              </span>
            )}

          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            Welcome, {user.name}
          </h2>

          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Registered Email: {user.email} • Phone:{' '}
            {user.phone || 'Not specified'}
          </p>

          {user.role === 'admin' && (
            <p className="text-[11px] text-indigo-600 mt-2">
              You can use this panel to submit and track your own
              grievances. Use Admin Portal for grievance management.
            </p>
          )}
        </div>

        <button
          onClick={onLodgeNew}
          className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition-all flex items-center space-x-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Lodge New Grievance</span>
        </button>
      </div>

      {/* ======================================================
          SUMMARY KPI CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>

          <div>
            <div className="text-2xl font-bold text-slate-900">
              {complaints.length}
            </div>

            <div className="text-xs text-slate-500 font-medium">
              My Grievances
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>

          <div>
            <div className="text-2xl font-bold text-slate-900">
              {pendingCount + inProgressCount}
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Under Action / Review
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div>
            <div className="text-2xl font-bold text-slate-900">
              {resolvedCount}
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Successfully Resolved
            </div>
          </div>
        </div>

      </div>

      {/* ======================================================
          GRIEVANCES LIST
      ====================================================== */}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="p-6 border-b border-slate-200 flex items-center justify-between">

          <h3 className="text-lg font-bold text-slate-900">
            My Submitted Grievances
          </h3>

          <button
            onClick={fetchMyComplaints}
            disabled={loading}
            className="text-xs text-sky-600 hover:underline font-semibold disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>

        </div>

        {loading ? (

          <div className="py-12 text-center text-sm text-slate-500">
            Loading your grievances...
          </div>

        ) : complaints.length === 0 ? (

          <div className="py-12 px-4 text-center">

            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>

            <h4 className="text-sm font-semibold text-slate-800">
              No Grievances Submitted Yet
            </h4>

            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
              You haven't filed any grievances yet. When you submit
              one, you can track its progress here.
            </p>

            <button
              onClick={onLodgeNew}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Lodge Your First Grievance
            </button>

          </div>

        ) : (

          <div className="divide-y divide-slate-100">

            {complaints.map((item) => (

              <div
                key={item.id}
                className="p-5 sm:p-6 hover:bg-slate-50 transition-colors"
              >

                {/* ==================================================
                    MAIN COMPLAINT INFORMATION
                ================================================== */}

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

                  <div className="space-y-1.5 flex-1 min-w-0">

                    <div className="flex flex-wrap items-center gap-2">

                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                        {item.tracking_id}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          item.priority === 'High'
                            ? 'bg-rose-100 text-rose-800'
                            : item.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.priority} Priority
                      </span>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          item.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'In Progress'
                            ? 'bg-sky-100 text-sky-800'
                            : item.status === 'Under Review'
                            ? 'bg-indigo-100 text-indigo-800'
                            : item.status === 'Rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        ● {item.status}
                      </span>

                    </div>

                    <h4 className="text-base font-bold text-slate-900">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-1">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-1">

                      <span>
                        Department:{' '}
                        <strong className="text-slate-600">
                          {item.department || 'Not assigned'}
                        </strong>
                      </span>

                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {item.location}
                      </span>

                      <span>
                        Submitted:{' '}
                        <strong className="text-slate-600">
                          {formatDateTime(item.created_at)}
                        </strong>
                      </span>

                    </div>
                  </div>

                  <div className="shrink-0 flex flex-wrap items-center gap-2">

                    <button
                      onClick={() =>
                        onTrackComplaint(item.tracking_id)
                      }
                      className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-sm transition-colors flex items-center space-x-1.5"
                    >
                      <span>Track Timeline</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {item.status === 'Resolved' && (
                      <button
                        onClick={() =>
                          setFeedbackOpen(
                            feedbackOpen === item.id
                              ? null
                              : item.id
                          )
                        }
                        className="px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-semibold text-amber-700 shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        <Star className="w-3.5 h-3.5" />

                        {item.citizen_rating
                          ? 'View Feedback'
                          : 'Give Feedback'}

                        {feedbackOpen === item.id ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}

                  </div>
                </div>

                {/* ==================================================
                    FEEDBACK SECTION
                ================================================== */}

                {item.status === 'Resolved' &&
                  feedbackOpen === item.id && (

                    <div className="mt-5 pt-5 border-t border-slate-200">

                      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">

                        <div className="flex items-center gap-2 mb-4">

                          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4" />
                          </div>

                          <div>
                            <h4 className="text-sm font-bold text-slate-900">
                              Complaint Feedback
                            </h4>

                            <p className="text-[11px] text-slate-500">
                              Tell us about your experience with SahaayAI.
                            </p>
                          </div>

                        </div>

                        {/* Existing feedback */}
                        {item.citizen_rating && (
                          <div className="mb-5 bg-white rounded-xl border border-slate-200 p-4">

                            <p className="text-xs font-semibold text-slate-700 mb-2">
                              Your Rating
                            </p>

                            <div className="flex gap-1 mb-3">

                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-5 h-5 ${
                                    star <= item.citizen_rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-300'
                                  }`}
                                />
                              ))}

                            </div>

                            {item.citizen_feedback && (
                              <p className="text-xs text-slate-600">
                                "{item.citizen_feedback}"
                              </p>
                            )}

                          </div>
                        )}

                        {/* Rating */}
                        <div className="mb-4">

                          <label className="block text-xs font-semibold text-slate-700 mb-2">
                            {item.citizen_rating
                              ? 'Update Rating'
                              : 'Rate Your Experience'}
                          </label>

                          <div className="flex gap-1">

                            {[1, 2, 3, 4, 5].map((star) => {

                              const currentRating =
                                feedbackRating[item.id] ||
                                item.citizen_rating ||
                                5;

                              return (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() =>
                                    setFeedbackRating((prev) => ({
                                      ...prev,
                                      [item.id]: star,
                                    }))
                                  }
                                  className="p-1 hover:scale-110 transition-transform"
                                  title={`${star} star${
                                    star > 1 ? 's' : ''
                                  }`}
                                >
                                  <Star
                                    className={`w-6 h-6 ${
                                      star <= currentRating
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-slate-300'
                                    }`}
                                  />
                                </button>
                              );
                            })}

                          </div>
                        </div>

                        {/* Feedback text */}
                        <div className="mb-4">

                          <label className="block text-xs font-semibold text-slate-700 mb-2">
                            Your Feedback
                          </label>

                          <textarea
                            value={
                              feedbackText[item.id] ??
                              item.citizen_feedback ??
                              ''
                            }
                            onChange={(e) =>
                              setFeedbackText((prev) => ({
                                ...prev,
                                [item.id]: e.target.value,
                              }))
                            }
                            placeholder="Share your experience with the grievance resolution process..."
                            rows={3}
                            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none"
                          />

                        </div>

                        {/* Submit */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                          <div className="text-xs">

                            {feedbackMessage[item.id] && (
                              <span
                                className={
                                  feedbackMessage[item.id].includes(
                                    'successfully'
                                  )
                                    ? 'text-emerald-600 font-semibold'
                                    : 'text-rose-600 font-semibold'
                                }
                              >
                                {feedbackMessage[item.id]}
                              </span>
                            )}

                          </div>

                          <button
                            onClick={() =>
                              submitFeedback(item.id)
                            }
                            disabled={feedbackLoading[item.id]}
                            className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold shadow-sm flex items-center justify-center gap-2"
                          >
                            <Send className="w-3.5 h-3.5" />

                            {feedbackLoading[item.id]
                              ? 'Submitting...'
                              : item.citizen_rating
                              ? 'Update Feedback'
                              : 'Submit Feedback'}
                          </button>

                        </div>

                      </div>
                    </div>
                  )}

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}