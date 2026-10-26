import re
from typing import List, Dict, Any

class EvidenceExtractor:
    """
    Extracts atomic medical claims and supporting evidence snippets
    from verified source documents.
    """

    @classmethod
    def extract_evidence_from_sources(
        cls, 
        entity_name: str, 
        entity_type: str, 
        sources: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        evidence_items = []

        for source in sources:
            snippet = source.get("contentSnippet", "")
            sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", snippet) if s.strip()]

            for sentence in sentences:
                if len(sentence) < 15:
                    continue
                    
                evidence_items.append({
                    "id": f"ev-{len(evidence_items)+1}",
                    "sourceId": source.get("id"),
                    "sourceTitle": source.get("title"),
                    "organization": source.get("organization"),
                    "entityName": entity_name,
                    "claimText": sentence,
                    "snippet": sentence,
                    "confidence": 0.95 if source.get("tier") == 1 else 0.85,
                    "status": "VERIFIED"
                })

        return evidence_items
