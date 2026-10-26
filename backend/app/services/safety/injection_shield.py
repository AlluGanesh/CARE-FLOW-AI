import re
from typing import Tuple, List

INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior|above)\s+instructions",
    r"system\s*override",
    r"you\s+are\s+now\s+a\s+(doctor|prescriber|unrestricted)",
    r"disregard\s+(all\s+)?safety\s+(rules|guidelines|protocols)",
    r"bypass\s+safety",
    r"act\s+as\s+a\s+licensed\s+physician\s+and\s+prescribe",
    r"pretend\s+to\s+be\s+a\s+doctor",
    r"output\s+the\s+system\s+prompt",
    r"reveal\s+secret",
    r"<\|im_start\|>",
    r"<\|im_end\|>",
    r"\[INST\]",
    r"\[/INST\]"
]

class PromptInjectionShield:
    """
    Defends against prompt injection and jailbreaking attempts in
    medical reports and untrusted retrieved web sources.
    """

    @classmethod
    def inspect_and_sanitize(cls, untrusted_content: str) -> Tuple[bool, str, List[str]]:
        """
        Scans untrusted input for malicious injection attempts.
        Returns:
            is_malicious (bool)
            sanitized_content (str)
            detected_threats (List[str])
        """
        detected_threats: List[str] = []
        sanitized = untrusted_content

        for pattern in INJECTION_PATTERNS:
            matches = re.findall(pattern, untrusted_content, re.IGNORECASE)
            if matches:
                detected_threats.append(f"Prompt injection pattern detected: '{pattern}'")
                # Redact matched malicious instructions
                sanitized = re.sub(pattern, "[UNTRUSTED_CONTENT_FILTERED]", sanitized, flags=re.IGNORECASE)

        is_malicious = len(detected_threats) > 0
        return is_malicious, sanitized, detected_threats
