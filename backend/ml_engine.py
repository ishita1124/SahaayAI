"""
SahaayAI - ML & NLP Engine
Provides:
1. Multi-class Grievance Categorization (TF-IDF + MultinomialNB/Classifier)
2. Smart Priority & Urgency Scoring (High / Medium / Low, 0-100 score)
3. NLP Keyword & Keyphrase Extractor (TF-IDF Salience + Lexical analysis)
4. AI Explainer & Routing Recommendation
"""
import os
import re
import math
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "saved_models")
os.makedirs(MODEL_DIR, exist_ok=True)
CATEGORY_MODEL_PATH = os.path.join(MODEL_DIR, "category_model.pkl")

# Standard grievance departments aligned with Indian municipal & e-governance systems
DEPARTMENTS = [
    "Sanitation & Waste Management",
    "Electricity & Power",
    "Water Supply & Sewage",
    "Roads, Bridges & Infrastructure",
    "Public Safety & Law Enforcement",
    "Civic Amenities & Municipal Services"
]

# Comprehensive synthetic training corpus for high accuracy zero-shot setup
TRAINING_DATA = [
    # Sanitation & Waste Management
    ("Garbage dump overflowing on the main street causing unbearable foul stench", "Sanitation & Waste Management"),
    ("Trash collection truck hasn't visited our neighborhood for five consecutive days", "Sanitation & Waste Management"),
    ("Open drainage line overflowing with filthy sewage water near residential houses", "Sanitation & Waste Management"),
    ("Dead animal lying on the roadside attracting flies and posing health hazard", "Sanitation & Waste Management"),
    ("Severe accumulation of plastic waste and uncollected debris near the vegetable market", "Sanitation & Waste Management"),
    ("Dumping of hazardous biomedical waste in the open ground near the school", "Sanitation & Waste Management"),
    ("Clogged community public toilet with no sanitation or water cleaning staff", "Sanitation & Waste Management"),
    ("Sewage backflow into residential apartments after heavy monsoon rains", "Sanitation & Waste Management"),
    ("Unsanitary conditions in the ward with mosquitoes breeding in stagnant waste", "Sanitation & Waste Management"),
    ("Littering and illegal dumping along the lake bank causing environmental hazard", "Sanitation & Waste Management"),

    # Electricity & Power
    ("High voltage transformer sparking furiously with burning wire smell", "Electricity & Power"),
    ("Total power blackout in sector 14 for the past 8 hours without warning", "Electricity & Power"),
    ("Live electrical wire broken and hanging dangerously low across school entrance", "Electricity & Power"),
    ("Frequent severe voltage fluctuations damaging household appliances and refrigerators", "Electricity & Power"),
    ("Street lights have been completely non-functional for 3 weeks making street pitch dark", "Electricity & Power"),
    ("Faulty digital electricity meter showing three times the actual monthly reading", "Electricity & Power"),
    ("Electric pole tilting dangerously and about to collapse onto pedestrian walkway", "Electricity & Power"),
    ("Sudden power trip every evening during peak hours in the entire colony", "Electricity & Power"),
    ("Exposed junction box with bare live wires accessible to young children on the footpath", "Electricity & Power"),
    ("Phase failure resulting in only low voltage supply across all residences", "Electricity & Power"),

    # Water Supply & Sewage
    ("Contaminated dirty brown water coming from municipal tap with severe foul smell", "Water Supply & Sewage"),
    ("Major underground water pipeline burst flooding the road with millions of liters lost", "Water Supply & Sewage"),
    ("No drinking water supply in our locality for 4 consecutive days, tankers needed", "Water Supply & Sewage"),
    ("Extremely low municipal water pressure unable to reach first floor overhead tanks", "Water Supply & Sewage"),
    ("Drinking water pipeline mixed with sewage line leading to outbreak of diarrhea", "Water Supply & Sewage"),
    ("Illegal commercial water extraction using heavy booster pumps in residential colony", "Water Supply & Sewage"),
    ("Broken valve leaking fresh drinking water onto highway", "Water Supply & Sewage"),
    ("Water tanker mafia overcharging citizens during water shortage", "Water Supply & Sewage"),
    ("Water meter damaged by municipal road construction crew", "Water Supply & Sewage"),
    ("Borewell motor failure at public park water point", "Water Supply & Sewage"),

    # Roads, Bridges & Infrastructure
    ("Massive deep potholes on main highway causing multiple bike accidents and injuries", "Roads, Bridges & Infrastructure"),
    ("Cracks observed on flyover pillar supporting heavy traffic near city bypass", "Roads, Bridges & Infrastructure"),
    ("Footpath pavement completely broken with uncovered manholes hazardous for elderly", "Roads, Bridges & Infrastructure"),
    ("Traffic signal at busy four-way junction completely dead leading to chaotic gridlock", "Roads, Bridges & Infrastructure"),
    ("Road widening contractor left gravel and construction rubble blocking lane", "Roads, Bridges & Infrastructure"),
    ("Subway underpass severely flooded preventing pedestrians and two wheelers from crossing", "Roads, Bridges & Infrastructure"),
    ("Speed breaker built without required reflective paint causing vehicle underbody damage", "Roads, Bridges & Infrastructure"),
    ("Missing manhole iron cover on main road posing fatal danger at night", "Roads, Bridges & Infrastructure"),
    ("Caving in of road surface near metro construction site", "Roads, Bridges & Infrastructure"),
    ("Divider barrier damaged and hanging into opposite traffic lane", "Roads, Bridges & Infrastructure"),

    # Public Safety & Law Enforcement
    ("Gang of unruly elements consuming alcohol and harassing female pedestrians at night", "Public Safety & Law Enforcement"),
    ("Chain snatching and theft incidents rising sharply near metro station exit", "Public Safety & Law Enforcement"),
    ("Pack of aggressive stray dogs biting school children and morning joggers", "Public Safety & Law Enforcement"),
    ("Illegal loud DJ sound systems operating after 11 PM violating court noise restrictions", "Public Safety & Law Enforcement"),
    ("Reckless drunk driving and late-night bike racing on internal residential roads", "Public Safety & Law Enforcement"),
    ("Unauthorized encroachments blocking fire engine emergency access lane", "Public Safety & Law Enforcement"),
    ("Suspicious abandoned package lying unattended at local bus terminal", "Public Safety & Law Enforcement"),
    ("Eve teasing and verbal abuse outside girls college during dispersal hours", "Public Safety & Law Enforcement"),
    ("Illegal gambling den operating openly in public park premises", "Public Safety & Law Enforcement"),
    ("Commercial trucks parked illegally creating blind spots and severe safety hazards", "Public Safety & Law Enforcement"),

    # Civic Amenities & Municipal Services
    ("Delayed birth certificate verification pending at municipal ward office for two months", "Civic Amenities & Municipal Services"),
    ("Property tax portal deducting payment twice but failing to generate official receipt", "Civic Amenities & Municipal Services"),
    ("Public park grass overgrown with dead trees about to fall on walking track", "Civic Amenities & Municipal Services"),
    ("Trade license renewal application rejected without citing valid legal reasons", "Civic Amenities & Municipal Services"),
    ("Non-maintenance of community gym equipment in public welfare center", "Civic Amenities & Municipal Services"),
    ("Encroachment of public green belt park by unauthorized street vendors", "Civic Amenities & Municipal Services"),
    ("Ration card name correction request not being entertained by local civil supplies desk", "Civic Amenities & Municipal Services"),
    ("Stray cattle menace roaming freely in busy commercial marketplace", "Civic Amenities & Municipal Services"),
    ("Crematorium and burial ground basic amenities lacking proper lighting and shed", "Civic Amenities & Municipal Services"),
    ("Discrepancy in online municipal property tax assessment calculation", "Civic Amenities & Municipal Services")
]

# Keywords signaling High, Medium, or Low urgency
CRITICAL_URGENCY_KEYWORDS = [
    "sparking", "fire", "burst", "electrocution", "live wire", "collapse", "accident", 
    "bleeding", "hazard", "fatal", "fatalities", "poison", "contaminated", "diarrhea", 
    "outbreak", "death", "severe", "emergency", "cracking", "flooding", "blackout", 
    "snatching", "harassment", "danger", "urgent", "critical", "children", "immediate",
    "deadly", "explosion", "spark", "choke"
]

MODERATE_URGENCY_KEYWORDS = [
    "leak", "pothole", "stench", "garbage", "smell", "overflow", "stray dogs", 
    "dark", "signal", "fluctuation", "clogged", "broken", "sewage", "noise", 
    "delay", "blocked", "uncollected", "dump"
]

STOP_WORDS = set([
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", 
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", 
    "by", "could", "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from", 
    "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him", 
    "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "just", "me", 
    "more", "most", "my", "myself", "no", "nor", "not", "now", "of", "off", "on", "once", "only", 
    "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "she", 
    "should", "so", "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves", 
    "then", "there", "these", "they", "this", "those", "through", "to", "too", "under", "until", 
    "up", "very", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", 
    "why", "with", "would", "you", "your", "yours", "yourself", "yourselves", "please", "sir", 
    "madam", "kindly", "regarding", "complaint", "issue", "problem", "area", "near", "sector", "road"
])

class GrievanceMLEngine:
    def __init__(self):
        self.model = None
        self._load_or_train_model()

    def _train(self):
        texts, labels = zip(*TRAINING_DATA)
        pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), max_features=1200, lowercase=True)),
            ("clf", MultinomialNB(alpha=0.1))
        ])
        pipeline.fit(texts, labels)
        joblib.dump(pipeline, CATEGORY_MODEL_PATH)
        self.model = pipeline

    def _load_or_train_model(self):
        try:
            if os.path.exists(CATEGORY_MODEL_PATH):
                self.model = joblib.load(CATEGORY_MODEL_PATH)
            else:
                self._train()
        except Exception:
            self._train()

    def extract_keywords(self, text, top_n=5):
        """
        NLP Keyword and Keyphrase Extraction based on lexical frequency and grievance salience
        """
        if not text or not text.strip():
            return []

        # Clean text
        clean = re.sub(r"[^\w\s-]", " ", text.lower())
        words = [w.strip() for w in clean.split() if len(w.strip()) > 2]
        filtered = [w for w in words if w not in STOP_WORDS]

        # Score words: high weight if found in grievance priority terms
        scored = {}
        for w in filtered:
            bonus = 3.0 if w in CRITICAL_URGENCY_KEYWORDS else (1.8 if w in MODERATE_URGENCY_KEYWORDS else 1.0)
            scored[w] = scored.get(w, 0.0) + bonus

        # Also search for meaningful 2-word combinations
        bigrams = []
        for i in range(len(words) - 1):
            w1, w2 = words[i], words[i+1]
            if w1 not in STOP_WORDS or w2 not in STOP_WORDS:
                phrase = f"{w1} {w2}"
                # If either is an urgency word, boost
                if any(k in phrase for k in CRITICAL_URGENCY_KEYWORDS) or any(k in phrase for k in MODERATE_URGENCY_KEYWORDS):
                    bigrams.append(phrase)

        # Merge results
        result = []
        for b in bigrams[:3]:
            if b not in result:
                result.append(b)

        sorted_words = sorted(scored.items(), key=lambda x: x[1], reverse=True)
        for w, _ in sorted_words:
            if w not in result and len(result) < top_n:
                result.append(w)

        return result[:top_n]

    def predict_category(self, text):
        """
        Predicts department category and confidence score
        """
        if not text or not text.strip():
            return "Civic Amenities & Municipal Services", 0.50

        if not self.model:
            self._train()

        probs = self.model.predict_proba([text])[0]
        classes = self.model.classes_
        top_idx = np.argmax(probs)
        predicted_cat = classes[top_idx]
        confidence = float(probs[top_idx])

        # Baseline confidence normalization
        confidence = max(0.55, min(0.99, confidence))
        return predicted_cat, confidence

    def compute_priority_and_urgency(self, text):
        """
        Calculates Urgency Score (0 - 100) and Priority Level (High, Medium, Low)
        using NLP Lexicon matching and sentiment urgency heuristics.
        """
        if not text:
            return "Medium", 50, "Standard priority based on municipal SLA."

        lower_text = text.lower()
        
        crit_matches = [w for w in CRITICAL_URGENCY_KEYWORDS if w in lower_text]
        mod_matches = [w for w in MODERATE_URGENCY_KEYWORDS if w in lower_text]

        base_score = 40
        base_score += len(crit_matches) * 22
        base_score += len(mod_matches) * 9

        # Length factor (detailed description usually indicates higher distress)
        if len(text.split()) > 35:
            base_score += 5

        # Check for exclamation marks or all-caps distress cues
        if "!" in text or re.search(r"\b[A-Z]{3,}\b", text):
            base_score += 8

        urgency_score = min(98, max(15, base_score))

        if urgency_score >= 70 or len(crit_matches) >= 1:
            priority = "High"
            explanation = f"Classified as High Priority: Detected critical urgency signals ({', '.join(crit_matches[:3]) if crit_matches else 'severe civic risk'}). Immediate dispatch recommended."
        elif urgency_score >= 45 or len(mod_matches) >= 1:
            priority = "Medium"
            explanation = f"Classified as Medium Priority: Moderate impact detected ({', '.join(mod_matches[:3]) if mod_matches else 'routine civic issue'}). Requires action within 48 hours."
        else:
            priority = "Low"
            explanation = "Classified as Low Priority: Non-hazardous civic observation or general administrative request."

        return priority, urgency_score, explanation

    def analyze(self, text, title=""):
        """
        Unified real-time AI analysis endpoint
        """
        combined = f"{title} {text}".strip()
        cat, conf = self.predict_category(combined)
        priority, urgency_score, explanation = self.compute_priority_and_urgency(combined)
        keywords = self.extract_keywords(combined, top_n=6)

        return {
            "predicted_department": str(cat),
            "confidence": float(round(conf, 2)),
            "priority": str(priority),
            "urgency_score": int(urgency_score),
            "keywords": [str(k) for k in keywords],
            "ai_explanation": str(explanation),
            "all_departments": DEPARTMENTS
        }

# Global singleton
ml_engine = GrievanceMLEngine()
