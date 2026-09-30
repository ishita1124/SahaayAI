# SahaayAI - AI-Based Smart Grievance Redressal System

> **An intelligent grievance management platform for complaint classification, prioritization, tracking, and administrative resolution using Machine Learning and NLP.**

SahaayAI is an AI-powered grievance redressal system designed to simplify communication between citizens and administrative authorities. It combines a React-based frontend, FastAPI backend, SQLAlchemy database integration, and a Machine Learning engine to classify grievances, estimate urgency, assign priority, and support transparent complaint resolution.

---

## 🌟 Key Features

### 👤 Citizen Features

- Citizen registration and login
- Secure session-based authentication using tokens
- Lodge new grievances
- Automatic citizen information filling for logged-in users
- AI-based grievance analysis
- Automatic department prediction
- Priority and urgency estimation
- Unique grievance tracking ID generation
- Public complaint tracking
- Personal grievance dashboard
- Complaint status and timeline tracking
- Feedback and 1–5 star satisfaction rating for resolved complaints

### 🤖 AI & Machine Learning

SahaayAI analyzes grievance titles and descriptions to provide:

- Department classification
- Prediction confidence
- Priority classification
- Urgency score from 0–100
- Important grievance keywords
- AI-generated analysis explanation

The system supports classification across six major departments:

1. Sanitation & Waste Management
2. Electricity & Power
3. Water Supply & Sewage
4. Roads, Bridges & Infrastructure
5. Public Safety & Law Enforcement
6. Civic Amenities & Municipal Services

### 🛡️ Administrative Features

Administrators can:

- View all registered grievances
- Search complaints using keywords
- Filter complaints by:
  - Status
  - Department
  - Priority
- Review AI recommendations
- Change department assignment
- Change grievance priority
- Assign officers
- Add officer remarks
- Update grievance status
- View complaint analytics
- Monitor department-wise distribution
- Monitor priority distribution
- Track resolution statistics
- Seed demo grievance records

### 📊 Transparent Grievance Tracking

Each grievance receives a unique tracking ID in the format:

```text
SHY-YYYY-XXXX

The grievance lifecycle can be tracked through:

Submitted → Under Review → In Progress → Resolved
                                      ↘ Rejected
```

## 🛠️ Technology Stack

| Layer             | Technologies                           |
| ----------------- | -------------------------------------- |
| Frontend          | React 19, Vite, Tailwind CSS           |
| Backend           | Python, FastAPI, Uvicorn               |
| Database          | SQLite                                 |
| ORM               | SQLAlchemy                             |
| AI / ML           | Scikit-Learn, TF-IDF, Machine Learning |
| Data Processing   | NumPy, Pandas                          |
| Model Persistence | Joblib                                 |
| API Communication | REST API, Fetch                        |
| Authentication    | Token-based authentication             |
| Version Control   | Git & GitHub                           |

## 📂 Project Structure
```text
SahaayAI/
│
├── README.md
├── .gitignore
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── ml_engine.py
│   ├── auth_utils.py
│   ├── requirements.txt
│   │
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── ai.py
│   │   ├── complaints.py
│   │   └── admin.py
│   │
│   ├── saved_models/
│   │   └── category_model.pkl
│   │
│   └── start_backend.bat
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── start_frontend.bat
    │
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        │
        └── components/
            ├── Navbar.jsx
            ├── LandingPage.jsx
            ├── AuthModal.jsx
            ├── RegisterComplaint.jsx
            ├── TrackComplaint.jsx
            ├── CitizenDashboard.jsx
            └── AdminPanel.jsx
```

## 🏗️ System Architecture
```text
                    ┌─────────────────────┐
                    │      Citizen        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │   + Tailwind CSS     │
                    └──────────┬──────────┘
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │   FastAPI Backend   │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
      ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
      │ Auth Router  │  │ AI Router    │  │ Complaint /  │
      │              │  │              │  │ Admin Router │
      └──────────────┘  └──────┬───────┘  └──────┬───────┘
                               │                  │
                               ▼                  ▼
                        ┌──────────────┐   ┌──────────────┐
                        │  ML Engine   │   │  SQLAlchemy  │
                        │ TF-IDF / ML  │   │     ORM      │
                        └──────────────┘   └──────┬───────┘
                                                  │
                                                  ▼
                                           ┌──────────────┐
                                           │    SQLite    │
                                           │   Database   │
                                           └──────────────┘
```
           
## 🧠 AI Processing Workflow

When a grievance is submitted:
```text
Complaint Title + Description
            │
            ▼
       Text Analysis
            │
            ▼
    ML Classification
            │
     ┌──────┴──────┐
     ▼             ▼
 Department      Keywords
 Prediction
     │
     ▼
 Priority + Urgency
     │
     ▼
 Complaint Record
     │
     ▼
 Database + Tracking ID
 ```

The AI engine returns information such as:

Predicted department
Confidence score
Priority
Urgency score
Extracted keywords
AI explanation
Department-wise prediction information

## 🔐 Authentication & Roles

SahaayAI supports two user roles:

### Citizen

Citizens can:

Register
Login
Lodge grievances
Track grievances
View their grievance history
Submit feedback

### Administrator

Administrators can:

Login
Lodge and track their own grievances
Access the Admin Panel
View all registered grievances
Review and update complaints
Manage assignments
Monitor analytics

Note: For this academic prototype, administrator registration is available through the application. A production deployment should restrict administrator account creation to an authorized authority.

## 📡 API Endpoints

### Authentication
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

### AI Analysis
POST /api/ai/analyze-complaint
GET  /api/ai/departments

### Departments
GET /api/departments

### Citizen Complaints
POST /api/complaints
GET  /api/complaints/track/{tracking_id}
GET  /api/complaints/my
POST /api/complaints/{complaint_id}/feedback

### Administration
GET   /api/admin/complaints
PATCH /api/admin/complaints/{complaint_id}/review
GET   /api/admin/analytics
POST  /api/admin/seed-demo

## 🚀 Running the Project Locally
Prerequisites

Make sure you have installed:

Python 3
Node.js and npm
Git
Step 1: Clone the Repository
git clone https://github.com/ishita1124/SahaayAI.git
cd SahaayAI
Step 2: Setup the Backend

Open a terminal inside the backend folder:

cd backend

Create a virtual environment:

python -m venv venv

Activate it on Windows:

venv\Scripts\activate

Install the dependencies:

pip install -r requirements.txt

Start the FastAPI server:

python -m uvicorn main:app

The backend will run at:

http://127.0.0.1:8000

FastAPI Swagger documentation is available at:

http://127.0.0.1:8000/docs
Step 3: Setup the Frontend

Open another terminal:

cd frontend

Install dependencies:

npm install

Start the React development server:

npm run dev

The frontend will run at:

http://localhost:3000

## 💾 Database

SahaayAI currently uses:

SQLite + SQLAlchemy ORM

The local database file is:

backend/sahaayai.db

The database contains the main entities:
```text
Users
   │
   ▼
Complaints
   │
   ▼
Complaint Timeline
```

The database file is intentionally excluded from GitHub through .gitignore.

This prevents local test/demo user information from being uploaded to the public repository.

## 🧪 API Testing

FastAPI provides interactive API documentation through Swagger UI.

Open:

http://127.0.0.1:8000/docs

From there you can test:

Authentication
AI analysis
Complaint creation
Complaint tracking
Citizen complaints
Feedback
Administrative operations
Analytics
🔄 Development Workflow

For future changes:

git add .
git commit -m "Describe your changes"
git push

The project uses the main branch as the primary branch.

## 📌 Important Notes
The SQLite database is not included in the repository.
Python virtual environment files are excluded from Git.
Node modules are excluded from Git.
The ML model required by the AI engine is included under backend/saved_models/.
The project is currently configured for local development.
Production deployment would require stronger authentication, secure password hashing, protected administrator creation, environment variables, and production database configuration.
🎓 Academic Project

## Project: SahaayAI – AI-Based Smart Grievance Redressal System

Student: Ishita Bansal
Roll Number: 8523225
Program: B.Tech CSE (Artificial Intelligence & Machine Learning)
Session: 2023–2027
Department: Computer Science & Engineering
Institution: JMIETI, Radaur

## 👩‍💻 Author

Ishita Bansal

B.Tech CSE (AIML)
JMIETI, Radaur

GitHub:
https://github.com/ishita1124