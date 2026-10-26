from typing import List, Dict, Any, Optional
from app.core.config import settings

class ResearchPlanner:
    """
    Agentic planner that decomposes extracted clinical entities into targeted research tasks.
    Supports iterative re-planning based on clinician revision requests.
    """

    @classmethod
    def create_plan(
        cls, 
        entities: Dict[str, Any], 
        clinician_feedback: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        tasks: List[Dict[str, Any]] = []

        # 1. Condition Tasks
        for cond in entities.get("conditions", []):
            tasks.append({
                "id": f"task-cond-{len(tasks)+1}",
                "entityId": cond["id"],
                "entityType": "CONDITION",
                "entityName": cond["name"],
                "taskType": "CLINICAL_GUIDELINE_CHECK",
                "query": f"{cond['name']} clinical guidelines diagnostic criteria management",
                "priority": "HIGH",
                "status": "PENDING"
            })

        # 2. Test Tasks
        for test in entities.get("tests", []):
            tasks.append({
                "id": f"task-test-{len(tasks)+1}",
                "entityId": test["id"],
                "entityType": "TEST",
                "entityName": test["name"],
                "taskType": "EVIDENCE_SEARCH",
                "query": f"{test['name']} standard reference range clinical interpretation value {test.get('value', '')}",
                "priority": "HIGH" if test.get("status") in ["HIGH", "CRITICAL"] else "MEDIUM",
                "status": "PENDING"
            })

        # 3. Medicine Tasks
        for med in entities.get("medicines", []):
            tasks.append({
                "id": f"task-med-{len(tasks)+1}",
                "entityId": med["id"],
                "entityType": "MEDICINE",
                "entityName": med["name"],
                "taskType": "MECHANISM_OF_ACTION",
                "query": f"{med['name']} FDA indication mechanism of action adverse effects eGFR monitoring",
                "priority": "HIGH",
                "status": "PENDING"
            })

        # 4. Medical Term Tasks
        for term in entities.get("medicalTerms", []):
            tasks.append({
                "id": f"task-term-{len(tasks)+1}",
                "entityId": term["id"],
                "entityType": "MEDICAL_TERM",
                "entityName": term["term"],
                "taskType": "EVIDENCE_SEARCH",
                "query": f"{term['term']} clinical definition patient education",
                "priority": "LOW",
                "status": "PENDING"
            })

        # 5. Clinician Feedback Adaptive Revision Task
        if clinician_feedback:
            tasks.insert(0, {
                "id": f"task-rev-{len(tasks)+1}",
                "entityId": "feedback-override",
                "entityType": "CLINICIAN_REVISION",
                "entityName": "Clinician Feedback Investigation",
                "taskType": "REVISION_ANALYSIS",
                "query": f"Clinical revision request investigation: {clinician_feedback}",
                "priority": "CRITICAL",
                "status": "PENDING"
            })

        # Enforce bounded limit
        max_tasks = settings.MAX_RESEARCH_TASKS
        return tasks[:max_tasks]
