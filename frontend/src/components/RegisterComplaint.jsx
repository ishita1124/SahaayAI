import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  CheckCircle,
  AlertCircle,
  Tag,
  Activity,
  ShieldAlert,
  Copy,
  ArrowRight,
  MapPin,
  User,
  Phone,
  Mail,
  Building,
  HelpCircle,
  Lightbulb
} from 'lucide-react';

export default function RegisterComplaint({
  user,
  onComplaintSubmitted,
  onTrackComplaint
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    department: 'Auto-Detect',
    citizen_name: user?.name || '',
    citizen_phone: user?.phone || '',
    citizen_email: user?.email || '',
  });

  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  // --------------------------------------------------
  // Keep citizen/admin details synchronized with login
  // --------------------------------------------------
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        citizen_name: user.name || '',
        citizen_phone: user.phone || '',
        citizen_email: user.email || '',
      }));
    }
  }, [user]);

  // --------------------------------------------------
  // Real-time NLP analysis
  // --------------------------------------------------
  useEffect(() => {
    if (!formData.description.trim() && !formData.title.trim()) {
      setAiAnalysis(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsAnalyzing(true);

      try {
        const res = await fetch('/api/ai/analyze-complaint', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description
          })
        });

        if (res.ok) {
          const data = await res.json();
          setAiAnalysis(data);
        }
      } catch (err) {
        console.error('AI Analysis failed:', err);
      } finally {
        setIsAnalyzing(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [formData.title, formData.description]);

  // --------------------------------------------------
  // Input handler
  // --------------------------------------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // --------------------------------------------------
  // Sample complaint loader
  // --------------------------------------------------
  const handleLoadSample = (sample) => {
    setFormData(prev => ({
      ...prev,
      title: sample.title,
      description: sample.description,
      location: sample.location,
      department: 'Auto-Detect'
    }));
  };

  // --------------------------------------------------
  // Submit grievance
  // --------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // User must be logged in
    if (!user) {
      setErrorMsg(
        'Please login or register before submitting a grievance.'
      );
      return;
    }

    // Required fields
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.location.trim()
    ) {
      setErrorMsg(
        'Please complete all required fields (Title, Description, and Location).'
      );
      return;
    }

    // Citizen details
    if (!formData.citizen_name.trim() || !formData.citizen_phone.trim()) {
      setErrorMsg(
        'Please provide your full name and mobile phone number.'
      );
      return;
    }

    const token = localStorage.getItem('sahaay_token');

    if (!token) {
      setErrorMsg(
        'Your login session has expired. Please login again.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || 'Failed to submit grievance'
        );
      }

      // Successful submission
      setSubmissionResult(data);

      if (onComplaintSubmitted) {
        onComplaintSubmitted(data.complaint);
      }

    } catch (err) {
      setErrorMsg(
        err.message || 'Something went wrong while submitting the grievance.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------
  // Copy tracking ID
  // --------------------------------------------------
  const copyTrackingId = async (id) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy tracking ID:', error);
    }
  };

  // --------------------------------------------------
  // Reset form for another complaint
  // --------------------------------------------------
  const resetComplaintForm = () => {
    setSubmissionResult(null);

    setFormData({
      title: '',
      description: '',
      location: '',
      department: 'Auto-Detect',
      citizen_name: user?.name || '',
      citizen_phone: user?.phone || '',
      citizen_email: user?.email || '',
    });

    setAiAnalysis(null);
    setErrorMsg('');
    setCopied(false);
  };

  const sampleComplaints = [
    {
      label: '⚡ Live Wire Hazard (High Priority)',
      title: 'Live electrical wire snapped outside girls high school',
      description:
        'A heavy storm snapped a high tension 440V wire which is hanging directly near the school gate. Children and pedestrians are at immediate risk of fatal electrocution. Sparking observed.',
      location:
        'Near Gate 1, Government Girls Senior Secondary School, Ward 4'
    },
    {
      label: '💧 Sewage & Drinking Water Mix',
      title:
        'Drinking water supply contaminated with drainage sewage',
      description:
        'Tap water delivered since yesterday morning is dark yellow, smells foul like sewer water. Several families and small kids in our block have fallen ill with severe diarrhea.',
      location:
        'Blocks C & D, Housing Board Colony, Radaur'
    },
    {
      label: '🛣️ Pothole & Road Damage',
      title:
        'Severe deep potholes causing frequent two-wheeler accidents',
      description:
        'Multiple wide crater potholes on the main bypass connecting to NH-73. Motorcyclists are falling regularly and traffic is jammed throughout the day.',
      location:
        'Yamunanagar-Radaur Bypass Road, Near Bus Shelter'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* =====================================================
          PAGE TITLE
      ====================================================== */}
      <div className="mb-8 text-center max-w-2xl mx-auto">

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-time NLP Auto-Classification</span>
        </div>

        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Lodge Public Grievance
        </h2>

        <p className="text-slate-600 text-sm mt-1">
          Type your grievance below. SahaayAI will instantly extract
          keywords, categorize the department, and assign priority.
        </p>

        {/* Logged-in role indicator */}
        {user && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs text-slate-600">
            <User className="w-3.5 h-3.5 text-sky-600" />

            <span>
              Submitting as{' '}
              <strong className="text-slate-800">
                {user.name}
              </strong>
            </span>

            <span
              className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                user.role === 'admin'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-sky-100 text-sky-800'
              }`}
            >
              {user.role === 'admin' ? 'Admin' : 'Citizen'}
            </span>
          </div>
        )}
      </div>


      {/* =====================================================
          SUCCESS RESULT
      ====================================================== */}
      {submissionResult && (
        <div className="mb-8 p-6 sm:p-8 bg-emerald-50 border border-emerald-200 rounded-3xl shadow-sm text-center animate-fade-in">

          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>

          <h3 className="text-2xl font-bold text-emerald-900">
            Grievance Registered Successfully!
          </h3>

          <p className="text-emerald-700 text-sm mt-1 max-w-lg mx-auto">
            Your grievance has been auto-categorized into{' '}
            <strong className="font-semibold">
              {submissionResult.complaint.department}
            </strong>{' '}
            and assigned{' '}
            <strong className="font-semibold">
              {submissionResult.complaint.priority} Priority
            </strong>.
          </p>


          {/* Tracking ID */}
          <div className="mt-5 inline-flex items-center space-x-3 bg-white px-5 py-3 rounded-2xl border border-emerald-300 shadow-sm">

            <span className="text-xs uppercase text-slate-500 font-bold tracking-wider">
              Tracking ID:
            </span>

            <span className="text-lg font-mono font-bold text-slate-900">
              {submissionResult.tracking_id}
            </span>

            <button
              onClick={() =>
                copyTrackingId(submissionResult.tracking_id)
              }
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
              title="Copy Tracking ID"
            >
              <Copy className="w-4 h-4" />
            </button>

            {copied && (
              <span className="text-xs text-emerald-600 font-medium">
                Copied!
              </span>
            )}

          </div>


          {/* Result actions */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">

            <button
              onClick={() =>
                onTrackComplaint(
                  submissionResult.tracking_id
                )
              }
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-md transition-colors flex items-center space-x-2"
            >
              <span>Track Grievance Timeline</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={resetComplaintForm}
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors"
            >
              Lodge Another Grievance
            </button>

          </div>
        </div>
      )}


      {/* =====================================================
          QUICK TEST SCENARIOS
      ====================================================== */}
      <div className="mb-6 bg-sky-50/70 border border-sky-200/80 rounded-2xl p-4">

        <div className="flex items-center space-x-2 text-xs font-bold text-sky-900 mb-2">
          <Lightbulb className="w-4 h-4 text-sky-600" />

          <span>
            Quick Test Scenarios (Click to test AI engine):
          </span>
        </div>

        <div className="flex flex-wrap gap-2">

          {sampleComplaints.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleLoadSample(sample)}
              className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-sky-100 border border-sky-300 rounded-lg text-slate-800 transition-colors shadow-2xs"
            >
              {sample.label}
            </button>
          ))}

        </div>
      </div>


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* =================================================
            LEFT COLUMN - FORM
        ================================================== */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Error */}
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}


            {/* Citizen details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>

                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Citizen Full Name{' '}
                  <span className="text-red-500">*</span>
                </label>

                <div className="relative">

                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />

                  <input
                    type="text"
                    name="citizen_name"
                    value={formData.citizen_name}
                    onChange={handleInputChange}
                    placeholder="e.g. Ishita Bansal"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    required
                  />

                </div>
              </div>


              <div>

                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Phone Number{' '}
                  <span className="text-red-500">*</span>
                </label>

                <div className="relative">

                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />

                  <input
                    type="tel"
                    name="citizen_phone"
                    value={formData.citizen_phone}
                    onChange={handleInputChange}
                    placeholder="e.g. 9876543210"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    required
                  />

                </div>
              </div>

            </div>


            {/* Email */}
            <div>

              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address (For Status Updates)
              </label>

              <div className="relative">

                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />

                <input
                  type="email"
                  name="citizen_email"
                  value={formData.citizen_email}
                  onChange={handleInputChange}
                  placeholder="e.g. citizen@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />

              </div>
            </div>


            {/* Title */}
            <div>

              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Grievance Title / Subject{' '}
                <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Brief summary of the issue..."
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none font-medium"
                required
              />

            </div>


            {/* Location */}
            <div>

              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Incident Location & Landmark{' '}
                <span className="text-red-500">*</span>
              </label>

              <div className="relative">

                <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />

                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. Near Model Town Gate No. 2, Radaur"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  required
                />

              </div>
            </div>


            {/* Department */}
            <div>

              <div className="flex items-center justify-between mb-1">

                <label className="block text-xs font-semibold text-slate-700">
                  Target Department
                </label>

                <span className="text-[11px] text-sky-600 font-medium">
                  AI auto-selects if left on Auto-Detect
                </span>

              </div>

              <div className="relative">

                <Building className="w-4 h-4 absolute left-3 top-3 text-slate-400" />

                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white text-slate-800"
                >
                  <option value="Auto-Detect">
                    ⚡ Auto-Detect with AI (Recommended)
                  </option>

                  <option value="Sanitation & Waste Management">
                    Sanitation & Waste Management
                  </option>

                  <option value="Electricity & Power">
                    Electricity & Power
                  </option>

                  <option value="Water Supply & Sewage">
                    Water Supply & Sewage
                  </option>

                  <option value="Roads, Bridges & Infrastructure">
                    Roads, Bridges & Infrastructure
                  </option>

                  <option value="Public Safety & Law Enforcement">
                    Public Safety & Law Enforcement
                  </option>

                  <option value="Civic Amenities & Municipal Services">
                    Civic Amenities & Municipal Services
                  </option>
                </select>

              </div>
            </div>


            {/* Description */}
            <div>

              <div className="flex items-center justify-between mb-1">

                <label className="block text-xs font-semibold text-slate-700">
                  Detailed Grievance Description{' '}
                  <span className="text-red-500">*</span>
                </label>

                <span className="text-[11px] text-slate-400">
                  {formData.description.length} characters
                </span>

              </div>

              <textarea
                name="description"
                rows="5"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Explain the grievance clearly: what happened, risks involved, duration of the issue..."
                className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none leading-relaxed"
                required
              />

            </div>


            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >

              {isSubmitting ? (
                <span>
                  Registering & Routing...
                </span>
              ) : (
                <>
                  <Send className="w-4 h-4" />

                  <span>
                    Submit Grievance to SahaayAI
                  </span>
                </>
              )}

            </button>

          </form>
        </div>


        {/* =================================================
            RIGHT COLUMN - AI INSPECTOR
        ================================================== */}
        <div className="lg:col-span-5 space-y-4">

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm sticky top-24">

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">

              <div className="flex items-center space-x-2">

                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>

                <div>

                  <h4 className="text-sm font-bold text-slate-900">
                    SahaayAI Real-Time Inspector
                  </h4>

                  <p className="text-[11px] text-slate-500">
                    Live NLP & Classifier Feedback
                  </p>

                </div>

              </div>

              {isAnalyzing && (
                <span className="flex items-center space-x-1 text-xs text-sky-600 font-medium animate-pulse">

                  <Activity className="w-3.5 h-3.5 animate-spin" />

                  <span>
                    Analyzing...
                  </span>

                </span>
              )}

            </div>


            {/* AI result */}
            {aiAnalysis ? (

              <div className="mt-4 space-y-4">

                {/* Department */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">

                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Auto-Detected Category
                  </span>

                  <div className="flex items-center justify-between">

                    <span className="text-sm font-bold text-slate-900">
                      {aiAnalysis.predicted_department}
                    </span>

                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800">
                      {Math.round(
                        aiAnalysis.confidence * 100
                      )}% Confidence
                    </span>

                  </div>
                </div>


                {/* Priority */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">

                  <div className="flex items-center justify-between mb-1">

                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Auto-Prioritization
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        aiAnalysis.priority === 'High'
                          ? 'bg-rose-100 text-rose-800'
                          : aiAnalysis.priority === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {aiAnalysis.priority} Priority
                    </span>

                  </div>


                  {/* Urgency */}
                  <div className="mt-2">

                    <div className="flex justify-between text-xs text-slate-600 mb-1">

                      <span>
                        Urgency Score:
                      </span>

                      <span className="font-bold text-slate-900">
                        {aiAnalysis.urgency_score} / 100
                      </span>

                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">

                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          aiAnalysis.urgency_score > 65
                            ? 'bg-rose-500'
                            : aiAnalysis.urgency_score > 40
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{
                          width: `${Math.min(
                            Math.max(
                              aiAnalysis.urgency_score || 0,
                              0
                            ),
                            100
                          )}%`
                        }}
                      />

                    </div>

                  </div>
                </div>


                {/* Keywords */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">

                  <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">

                    <Tag className="w-3.5 h-3.5 text-slate-400" />

                    <span>
                      Extracted NLP Keywords
                    </span>

                  </div>

                  <div className="flex flex-wrap gap-1.5">

                    {Array.isArray(aiAnalysis.keywords) &&
                    aiAnalysis.keywords.length > 0 ? (

                      aiAnalysis.keywords.map((kw, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-white border border-slate-300 text-slate-800 rounded-lg text-xs font-medium shadow-2xs"
                        >
                          #{kw}
                        </span>
                      ))

                    ) : (

                      <span className="text-xs text-slate-400">
                        Type description to extract key terms...
                      </span>

                    )}

                  </div>
                </div>


                {/* AI Explanation */}
                <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100 text-xs text-slate-700 leading-relaxed">

                  <div className="flex items-start space-x-1.5">

                    <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />

                    <p>
                      {aiAnalysis.ai_explanation}
                    </p>

                  </div>

                </div>

              </div>

            ) : (

              <div className="mt-6 text-center py-10 px-4">

                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <HelpCircle className="w-6 h-6" />
                </div>

                <h5 className="text-sm font-semibold text-slate-700">
                  Waiting for Grievance Input
                </h5>

                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Start typing in the title or description box, and our NLP model will automatically show category predictions and extracted keywords.
                </p>

              </div>

            )}

          </div>
        </div>

      </div>
    </div>
  );
}