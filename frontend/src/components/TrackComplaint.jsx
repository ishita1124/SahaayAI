import React, { useState, useEffect } from 'react';
import {
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  Send,
  Star,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export default function TrackComplaint({ initialTrackingId }) {
  const [trackingId, setTrackingId] = useState(initialTrackingId || '');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Feedback state
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (initialTrackingId) {
      setTrackingId(initialTrackingId);
      fetchComplaint(initialTrackingId);
    }
  }, [initialTrackingId]);

  const formatDateTime = (dateValue) => {
    if (!dateValue) return 'Not available';

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const normalizeKeywords = (keywords) => {
    if (!keywords) return [];

    if (Array.isArray(keywords)) {
      return keywords.filter(Boolean);
    }

    if (typeof keywords === 'string') {
      return keywords
        .split(',')
        .map(keyword => keyword.trim())
        .filter(Boolean);
    }

    return [];
  };

  const fetchComplaint = async (idToFetch) => {
    const id = (idToFetch || trackingId).trim();

    if (!id) {
      setErrorMsg('Please enter a Tracking ID.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setComplaint(null);
    setFeedbackSuccess(false);

    try {
      const res = await fetch(
        `/api/complaints/track/${encodeURIComponent(id)}`
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || 'No record found with this Tracking ID.'
        );
      }

      const fetchedComplaint = data.complaint;

      setComplaint(fetchedComplaint);

      if (fetchedComplaint.citizen_rating) {
        setRating(fetchedComplaint.citizen_rating);
        setFeedbackText(
          fetchedComplaint.citizen_feedback || ''
        );
      } else {
        setRating(5);
        setFeedbackText('');
      }
    } catch (err) {
      setComplaint(null);
      setErrorMsg(
        err.message || 'Unable to fetch complaint details.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchComplaint();
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();

    if (!complaint) return;

    const token = localStorage.getItem('sahaay_token');

    if (!token) {
      setErrorMsg(
        'Please login to submit feedback for this resolved grievance.'
      );
      return;
    }

    setSubmittingFeedback(true);
    setErrorMsg('');

    try {
      const res = await fetch(
        `/api/complaints/${complaint.id}/feedback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            rating,
            feedback: feedbackText
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || 'Failed to submit feedback.'
        );
      }

      setFeedbackSuccess(true);
      setComplaint(data.complaint);
    } catch (err) {
      setErrorMsg(
        err.message || 'Unable to submit feedback.'
      );
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Status step progression helper
  const getStepStatus = (stepName) => {
    if (!complaint) return 'upcoming';

    const statusOrder = [
      'Pending',
      'Under Review',
      'In Progress',
      'Resolved'
    ];

    const currentIdx = statusOrder.indexOf(complaint.status);
    const targetIdx = statusOrder.indexOf(stepName);

    if (complaint.status === 'Rejected') {
      return stepName === 'Pending'
        ? 'completed'
        : 'rejected';
    }

    if (currentIdx >= targetIdx) {
      return 'completed';
    }

    return 'upcoming';
  };

  const keywords = normalizeKeywords(complaint?.keywords);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Header & Search */}
      <div className="text-center max-w-2xl mx-auto">

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
          <Search className="w-3.5 h-3.5" />
          <span>Real-Time Grievance Tracking</span>
        </div>

        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Track Grievance Status
        </h2>

        <p className="text-slate-600 text-sm mt-1">
          Enter your unique Tracking ID to inspect real-time progress,
          officer actions, and resolution timelines.
        </p>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="mt-6 flex items-center shadow-md rounded-2xl bg-white border border-slate-200 p-1.5 focus-within:ring-2 focus-within:ring-sky-500"
        >
          <Search className="w-5 h-5 text-slate-400 ml-3" />

          <input
            type="text"
            placeholder="Enter Tracking ID (e.g., SHY-2026-8942)"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            className="w-full px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
          />

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold transition-colors shrink-0 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-center space-x-2 max-w-xl mx-auto">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Complaint Detail Card */}
      {complaint && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Top Bar */}
          <div className="bg-slate-50 border-b border-slate-200 p-6 flex flex-wrap items-center justify-between gap-4">

            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-2">

                <span className="text-xs uppercase font-mono font-bold text-slate-500 tracking-wider">
                  Tracking ID:
                </span>

                <span className="text-lg font-mono font-extrabold text-slate-900 bg-white px-3 py-0.5 rounded-lg border border-slate-200">
                  {complaint.tracking_id}
                </span>

              </div>

              <div className="text-xs text-slate-500 flex items-center space-x-2 mt-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  Registered on: {formatDateTime(complaint.created_at)}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-wrap gap-y-2">

              {/* Priority */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  complaint.priority === 'High'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : complaint.priority === 'Medium'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {complaint.priority} Priority
              </span>

              {/* Status */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  complaint.status === 'Resolved'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : complaint.status === 'In Progress'
                    ? 'bg-sky-100 text-sky-800 border border-sky-300'
                    : complaint.status === 'Under Review'
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                    : complaint.status === 'Rejected'
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : 'bg-slate-100 text-slate-800 border border-slate-300'
                }`}
              >
                ● {complaint.status}
              </span>

            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">

            {/* Visual Stepper Timeline */}
            <div>

              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
                Resolution Lifecycle Stepper
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">

                {/* Step 1 */}
                <div
                  className={`p-4 rounded-2xl border ${
                    getStepStatus('Pending') === 'completed'
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">
                      1. Submitted
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Verified by SahaayAI
                  </p>
                </div>

                {/* Step 2 */}
                <div
                  className={`p-4 rounded-2xl border ${
                    getStepStatus('Under Review') === 'completed'
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="w-5 h-5 text-sky-600" />

                    <span className="text-xs font-bold text-slate-800">
                      2. Under Review
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Assigned to Department
                  </p>
                </div>

                {/* Step 3 */}
                <div
                  className={`p-4 rounded-2xl border ${
                    getStepStatus('In Progress') === 'completed'
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />

                    <span className="text-xs font-bold text-slate-800">
                      3. In Progress
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Ground action initiated
                  </p>
                </div>

                {/* Step 4 */}
                <div
                  className={`p-4 rounded-2xl border ${
                    getStepStatus('Resolved') === 'completed'
                      ? 'bg-emerald-100 border-emerald-300'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">

                    <CheckCircle2
                      className={`w-5 h-5 ${
                        getStepStatus('Resolved') === 'completed'
                          ? 'text-emerald-700'
                          : 'text-slate-400'
                      }`}
                    />

                    <span className="text-xs font-bold text-slate-800">
                      4. Resolved
                    </span>

                  </div>

                  <p className="text-[11px] text-slate-500">
                    Grievance Closed
                  </p>
                </div>

              </div>
            </div>

            {/* Grievance Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">

              {/* Left */}
              <div className="space-y-4">

                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Grievance Subject
                  </span>

                  <h3 className="text-lg font-bold text-slate-900">
                    {complaint.title}
                  </h3>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Description
                  </span>

                  <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed">
                    {complaint.description}
                  </p>
                </div>

                <div className="flex items-center space-x-2 text-xs text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />

                  <span>
                    <strong>Location:</strong> {complaint.location}
                  </span>
                </div>

              </div>

              {/* Right - AI Details */}
              <div className="space-y-4">

                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80 space-y-3">

                  <div className="flex items-center justify-between gap-2">

                    <div className="flex items-center space-x-1.5 text-xs font-bold text-sky-900 uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-sky-600" />
                      <span>SahaayAI Classification</span>
                    </div>

                    <span className="text-xs font-semibold px-2 py-0.5 bg-white text-sky-700 rounded-md border border-sky-200 shrink-0">
                      {complaint.ai_confidence != null
                        ? `${Math.round(
                            complaint.ai_confidence * 100
                          )}% Confidence`
                        : 'N/A'}
                    </span>

                  </div>

                  <div>
                    <div className="text-xs text-slate-500 font-medium">
                      Assigned Department:
                    </div>

                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {complaint.department || 'Not assigned'}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500 font-medium">
                      Urgency Index:
                    </div>

                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {complaint.urgency_score ?? 'N/A'} / 100
                    </div>
                  </div>

                  {/* Keywords */}
                  {keywords.length > 0 && (
                    <div>
                      <div className="text-xs text-slate-500 font-medium mb-1.5">
                        NLP Keywords:
                      </div>

                      <div className="flex flex-wrap gap-1">

                        {keywords.map((kw, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-white text-slate-700 border border-slate-300 rounded text-xs font-medium"
                          >
                            #{kw}
                          </span>
                        ))}

                      </div>
                    </div>
                  )}

                </div>

                {/* Officer Notes */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">

                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Officer Resolution Notes
                  </span>

                  <p className="text-xs text-slate-700 italic">
                    {complaint.officer_notes ||
                      'Officer review currently pending. Standard SLA applies.'}
                  </p>

                </div>

              </div>
            </div>

            {/* Event Timeline Log */}
            {complaint.timeline &&
              complaint.timeline.length > 0 && (
                <div className="pt-4 border-t border-slate-100">

                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
                    Audit Activity Log
                  </span>

                  <div className="space-y-2">

                    {complaint.timeline.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start space-x-3 text-xs p-3 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <div className="w-2 h-2 rounded-full bg-sky-500 mt-1.5 shrink-0"></div>

                        <div className="flex-1">

                          <div className="flex items-center justify-between gap-3">

                            <span className="font-bold text-slate-800">
                              {item.status}
                            </span>

                            <span className="text-slate-400 text-right">
                              {formatDateTime(item.created_at)}
                            </span>

                          </div>

                          <p className="text-slate-600 mt-0.5">
                            {item.remarks}
                          </p>

                          <span className="text-[10px] text-slate-400">
                            By: {item.action_by}
                          </span>

                        </div>
                      </div>
                    ))}

                  </div>
                </div>
              )}

            {/* Citizen Feedback */}
            {complaint.status === 'Resolved' && (
              <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200">

                <div className="flex items-center space-x-2 mb-2">

                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />

                  <h4 className="text-sm font-bold text-amber-900">
                    Citizen Satisfaction & Resolution Feedback
                  </h4>

                </div>

                <p className="text-xs text-amber-800 mb-4">
                  Please rate your satisfaction with the grievance
                  redressal provided by the department.
                </p>

                {feedbackSuccess ? (
                  <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-medium flex items-center space-x-2">

                    <CheckCircle2 className="w-4 h-4" />

                    <span>
                      Thank you! Your feedback has been recorded.
                    </span>

                  </div>
                ) : (
                  <form
                    onSubmit={handleFeedbackSubmit}
                    className="space-y-3"
                  >

                    <div className="flex items-center space-x-2">

                      <span className="text-xs text-slate-700 font-semibold">
                        Your Rating:
                      </span>

                      <div className="flex space-x-1">

                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            className="p-1 focus:outline-none"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= rating
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}

                      </div>
                    </div>

                    <textarea
                      rows="2"
                      value={feedbackText}
                      onChange={(e) =>
                        setFeedbackText(e.target.value)
                      }
                      placeholder="Was the problem resolved to your satisfaction? Enter your comments..."
                      className="w-full p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                    />

                    <button
                      type="submit"
                      disabled={submittingFeedback}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1 disabled:opacity-50"
                    >
                      <Send className="w-3 h-3" />

                      <span>
                        {submittingFeedback
                          ? 'Submitting...'
                          : 'Submit Citizen Feedback'}
                      </span>

                    </button>

                  </form>
                )}

              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}