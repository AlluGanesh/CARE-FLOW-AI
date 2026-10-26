import re
from typing import Dict, Any, List

class DocumentProcessor:
    """
    Cleans, structures, and parses clinical text reports.
    """

    @classmethod
    def clean_text(cls, raw_text: str) -> str:
        if not raw_text:
            return ""
        # Normalize line endings and strip excessive whitespaces
        cleaned = re.sub(r"\r\n|\r", "\n", raw_text)
        cleaned = re.sub(r"[ \t]+", " ", cleaned)
        cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
        return cleaned.strip()

    @classmethod
    def extract_sections(cls, text: str) -> Dict[str, str]:
        sections: Dict[str, str] = {
            "header": "",
            "findings": "",
            "impressions": "",
            "medications": "",
            "recommendations": ""
        }
        
        lines = text.split("\n")
        current_section = "findings"
        section_lines: Dict[str, List[str]] = {k: [] for k in sections}

        for line in lines:
            line_lower = line.lower()
            if any(h in line_lower for h in ["patient:", "date:", "hospital:", "clinic:"]):
                current_section = "header"
            elif any(h in line_lower for h in ["diagnosis:", "impression:", "assessment:"]):
                current_section = "impressions"
            elif any(h in line_lower for h in ["medications:", "rx:", "current meds:"]):
                current_section = "medications"
            elif any(h in line_lower for h in ["recommendations:", "plan:", "follow-up:"]):
                current_section = "recommendations"
            elif any(h in line_lower for h in ["findings:", "results:", "lab:"]):
                current_section = "findings"

            section_lines[current_section].append(line)

        for k, v in section_lines.items():
            sections[k] = "\n".join(v).strip()

        return sections
