import re
from typing import List, Dict, Any, Tuple

# Banned prescriptive and diagnostic phrases
BANNED_PRESCRIPTIVE_PATTERNS = [
    r"\byou should take\b",
    r"\byou must take\b",
    r"\bstop taking\b",
    r"\bdiscontinue taking\b",
    r"\bincrease your dose\b",
    r"\bdecrease your dose\b",
    r"\bchange your dosage\b",
    r"\btake \d+\s*mg\b",
    r"\bprescribe\b",
    r"\bi recommend starting\b",
    r"\byou need to start taking\b",
]

BANNED_DIAGNOSTIC_PATTERNS = [
    r"\bthis proves you have\b",
    r"\byou are diagnosed with\b",
    r"\bwe diagnose you with\b",
    r"\byou definitely have\b",
    r"\bthis confirms your condition is\b",
    r"\bmy diagnosis is\b",
]

EMERGENCY_PATTERNS = [
    r"\bchest pain\b",
    r"\bcrushing chest\b",
    r"\bshortness of breath\b",
    r"\bdifficulty breathing\b",
    r"\bloss of consciousness\b",
    r"\bsudden weakness\b",
    r"\bslurred speech\b",
    r"\banaphylaxis\b",
    r"\bsevere allergic reaction\b",
]

class SafetyValidator:
    """
    Healthcare safety boundary validator.
    Ensures that research outputs remain strictly educational and evidence-based.
    RESEARCH -> VERIFY -> EXPLAIN -> CITE
    Never: DIAGNOSE -> PRESCRIBE
    """

    @classmethod
    def check_emergency(cls, text: str) -> Tuple[bool, List[str]]:
        """
        Detects emergency symptoms requiring immediate professional attention.
        """
        detected: List[str] = []
        lower_text = text.lower()
        for pattern in EMERGENCY_PATTERNS:
            if re.search(pattern, lower_text):
                detected.append(pattern.replace(r"\b", ""))
        return len(detected) > 0, detected

    @classmethod
    def validate_text(cls, text: str) -> Dict[str, Any]:
        """
        Validates explanation text against safety boundaries.
        Returns safety verdict, violations, and emergency alerts.
        """
        violations: List[str] = []
        lower_text = text.lower()

        # Check prescriptive violations
        for pattern in BANNED_PRESCRIPTIVE_PATTERNS:
            match = re.search(pattern, lower_text)
            if match:
                # Ensure it's not a negated disclaimer like "never stop taking without consulting"
                span = match.span()
                preceding = lower_text[max(0, span[0]-30):span[0]]
                if "never" in preceding or "do not" in preceding or "without consulting" in lower_text[span[1]:span[1]+40]:
                    continue
                violations.append(f"Prescriptive recommendation detected: '{match.group(0)}'")

        # Check diagnostic violations
        for pattern in BANNED_DIAGNOSTIC_PATTERNS:
            match = re.search(pattern, lower_text)
            if match:
                violations.append(f"Diagnostic conclusion detected: '{match.group(0)}'")

        # Check emergency
        is_emergency, emergency_triggers = cls.check_emergency(text)

        passed = len(violations) == 0
        return {
            "passed": passed,
            "violations": violations,
            "isEmergency": is_emergency,
            "emergencyTriggers": emergency_triggers,
            "disclaimer": (
                "Educational information only. This summary does not provide medical diagnosis, "
                "treatment plans, or medication changes. Always consult your healthcare provider."
            )
        }
