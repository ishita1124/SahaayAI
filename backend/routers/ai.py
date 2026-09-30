from fastapi import APIRouter
from fastapi.responses import JSONResponse

from ml_engine import ml_engine, DEPARTMENTS


router = APIRouter(
    prefix="/api/ai",
    tags=["AI Analysis"]
)


# ============================================================
# AI COMPLAINT ANALYSIS
#
# POST /api/ai/analyze-complaint
# ============================================================

@router.post("/analyze-complaint")
def analyze_complaint(data: dict):

    # --------------------------------------------------------
    # Read input
    # --------------------------------------------------------

    title = str(
        data.get("title", "")
    ).strip()

    description = str(
        data.get("description", "")
    ).strip()

    # --------------------------------------------------------
    # Validate input
    # --------------------------------------------------------

    if not title or not description:

        return JSONResponse(
            status_code=400,
            content={
                "error": "Title and description are required"
            }
        )

    # --------------------------------------------------------
    # Run ML analysis
    # --------------------------------------------------------

    try:

        result = ml_engine.analyze(
            text=description,
            title=title
        )

        return result

    except Exception as e:

        return JSONResponse(
            status_code=500,
            content={
                "error": f"AI analysis failed: {str(e)}"
            }
        )


# ============================================================
# GET DEPARTMENTS
#
# GET /api/ai/departments
# ============================================================

@router.get("/departments")
def get_departments():

    return {
        "departments": DEPARTMENTS
    }