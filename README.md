# SahaayAI - AI-Based Smart Grievance Redressal System

> **An Intelligent Complaint Management and Auto-Prioritization Platform Using Machine Learning and Natural Language Processing**  
> *Project based on the Academic Synopsis submitted by Ishita Bansal (8523225), B.Tech CSE (AIML), Session 2023–2027, Department of Computer Science & Engineering, JMIETI, Radaur.*

---

## 🌟 Overview & Key Highlights

**SahaayAI** bridges the communication gap between citizens and municipal authorities by eliminating manual delays, misrouting, and lack of transparency in public grievance redressal.

### Key Capabilities:
1. **Real-Time NLP Live Assistant**: As a citizen types a grievance, the machine learning pipeline extracts salient keywords, auto-categorizes the department, calculates an **Urgency Score (0–100)**, and assigns priority (**High, Medium, Low**) in real time.
2. **Automated Multi-Class Categorization**: Trained on municipal complaint corpora using Scikit-Learn TF-IDF vectorization and multi-class classification across 6 core public departments:
   - *Sanitation & Waste Management*
   - *Electricity & Power*
   - *Water Supply & Sewage*
   - *Roads, Bridges & Infrastructure*
   - *Public Safety & Law Enforcement*
   - *Civic Amenities & Municipal Services*
3. **Smart Auto-Prioritization Engine**: Detects critical life-safety cues (e.g., live sparking wires, contaminated drinking water, deep highway potholes, sewer outbreaks) to escalate high-risk complaints immediately to authorities.
4. **Transparent Resolution Stepper**: End-to-end status tracking with a 4-step lifecycle stepper:
   `Submitted ➔ Under Review ➔ In Progress ➔ Resolved (or Rejected)`.
5. **Officer Resolution & Review Panel**:
   - Administrative KPI dashboard with departmental breakdown, resolution rate, and urgency index.
   - Comprehensive grievance inspection modal to review AI recommendations, reassign departments, adjust priority, and submit resolution remarks.
6. **Citizen Feedback Loop**: Citizens rate their satisfaction (1–5 stars) and submit qualitative feedback once a grievance is marked resolved.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Tailwind CSS, Lucide Icons, Vite, HTML5, Modern Light Theme UI |
| **Backend** | Python 3, Flask, Flask-CORS |
| **Database** | SQL (Relational SQLite via SQLAlchemy ORM; switchable to MySQL/PostgreSQL) |
| **ML & NLP** | Scikit-Learn (TF-IDF Vectorizer, Multinomial Naive Bayes), NumPy, Joblib |
| **Version Control** | Git & GitHub compatible |

---

## 📂 Project Architecture

```
SahaayAI/
├── start_all.bat               # One-click launcher for Backend and Frontend
├── backend/
│   ├── app.py                  # Flask REST API routes, Auth, Seed Data, Analytics
│   ├── database.py             # SQLAlchemy SQL engine and session configuration
│   ├── models.py               # SQL Database models: User, Complaint, ComplaintTimeline
│   ├── ml_engine.py            # NLP Keyword Extractor, TF-IDF Classifier, Auto-Prioritization
│   ├── requirements.txt        # Python backend dependencies
│   ├── start_backend.bat       # Standalone backend start script
│   └── sahaayai.db             # Relational SQLite database
└── frontend/
    ├── index.html              # Clean Light-themed layout
    ├── package.json            # Node.js dependencies
    ├── vite.config.js          # Vite config with API proxy
    ├── tailwind.config.js      # Custom theme colors and typography
    ├── start_frontend.bat      # Standalone frontend start script
    └── src/
        ├── App.jsx             # Main router and state coordinator
        ├── index.css           # Tailwind directives and clean light styling
        ├── main.jsx            # React root mount
        └── components/
            ├── Navbar.jsx              # Navigation and role indicator
            ├── LandingPage.jsx         # Hero, workflow steps, stats, quick track
            ├── RegisterComplaint.jsx   # Grievance registration with real-time AI inspector
            ├── TrackComplaint.jsx      # Tracking ID lookup, stepper timeline, feedback
            ├── CitizenDashboard.jsx    # Citizen's personal complaint list and KPI cards
            ├── AdminPanel.jsx          # Officer command center, analytics, review modal
            └── AuthModal.jsx           # Citizen & Admin authentication with 1-click demo fill
```

---

## 🔑 Pre-Seeded Demo Credentials

The database comes pre-seeded with realistic grievance records and the following accounts:

### 1. Officer / Administrator Account:
- **Email:** `admin@sahaayai.gov.in`
- **Password:** `admin123`
- *Access:* Grievance triage table, department routing, analytics metrics, resolution dispatch.

### 2. Citizen Account:
- **Email:** `ishita@mukand.ac.in`
- **Password:** `citizen123`
- *Access:* Lodge grievances, view personal history, track resolution, provide 5-star ratings.

*(You can also use the one-click "Fill Demo Citizen" and "Fill Demo Admin" buttons directly inside the login modal).*

---

## 🚀 How to Run Locally

### Quick Start (Windows)
Double-click `start_all.bat` located in the root `SahaayAI` folder. It will launch both the Flask backend and the React frontend in separate terminal windows and point you to `http://localhost:3000`.

---

### Manual Launch

#### Step 1: Start the Backend (Flask API)
```bash
cd backend
python -m pip install -r requirements.txt
python app.py
```
*The backend starts at `http://127.0.0.1:5000` with auto-seeded demo records.*

#### Step 2: Start the Frontend (React + Vite)
```bash
cd frontend
npm.cmd install
npm.cmd run dev
```
*The frontend starts at `http://localhost:3000` with proxy routing to the backend.*

---

## 📡 API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Create citizen account
- `POST /api/auth/login` - Authenticate citizen or officer
- `GET /api/auth/me` - Validate session

### AI & NLP
- `POST /api/ai/analyze-complaint` - Live analysis endpoint for real-time keywords, category confidence, priority, and urgency score.
- `GET /api/departments` - List supported departments

### Grievances & Citizen Tracking
- `POST /api/complaints` - Lodge new grievance (generates unique tracking ID `SHY-YYYY-XXXX`)
- `GET /api/complaints/track/<tracking_id>` - Public tracking with visual lifecycle stepper
- `GET /api/complaints/my` - Citizen's complaint history
- `POST /api/complaints/<id>/feedback` - Submit citizen satisfaction rating (1-5 stars) and review

### Administrative Redressal
- `GET /api/admin/complaints` - Filter complaints by department, status, priority, or keyword search
- `GET /api/admin/analytics` - Aggregated stats, resolution rate, department distribution
- `PATCH /api/admin/complaints/<id>/review` - Update grievance status, override priority/department, record officer resolution notes
- `POST /api/admin/seed-demo` - Re-seed sample realistic grievances
