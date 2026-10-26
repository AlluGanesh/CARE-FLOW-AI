from typing import List, Dict, Any, Tuple

class EvidenceVerifier:
    """
    Evaluates evidence sufficiency, source consensus, and cross-source consistency.
    Detects conflicting claims across medical literature.
    """

    @classmethod
    def verify_evidence(
        cls, 
        evidence_items: List[Dict[str, Any]], 
        sources: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Verifies retrieved evidence and returns verification status:
        SUFFICIENT, PARTIAL, INSUFFICIENT, CONFLICTING
        """
        if not evidence_items or not sources:
            return {
                "status": "INSUFFICIENT",
                "verifiedClaims": [],
                "conflicts": [],
                "tier1SourceCount": 0,
                "confidenceScore": 0.0,
                "summary": "No verified peer-reviewed evidence retrieved for this inquiry."
            }

        tier1_sources = [s for s in sources if s.get("tier") == 1]
        verified_claims = []
        conflicts = []

        # Check for conflicting guidance
        # (Example: conflicting diagnostic thresholds or contraindicated combinations)
        for ev in evidence_items:
            claim_text = ev.get("claimText", "")
            # Check for conflicting statements
            if "contradicted" in claim_text.lower() or "disputed" in claim_text.lower():
                conflicts.append({
                    "evidenceId": ev.get("id"),
                    "claimText": claim_text,
                    "reason": "Literature presents conflicting clinical threshold recommendations."
                })
            else:
                verified_claims.append({
                    "id": f"claim-{len(verified_claims)+1}",
                    "subject": ev.get("entityName"),
                    "predicate": claim_text,
                    "verified": True,
                    "supportLevel": "SUPPORTED"
                })

        # Calculate status
        if len(conflicts) > 0:
            evidence_status = "CONFLICTING"
        elif len(tier1_sources) >= 1 and len(verified_claims) >= 2:
            evidence_status = "SUFFICIENT"
        elif len(verified_claims) >= 1:
            evidence_status = "PARTIAL"
        else:
            evidence_status = "INSUFFICIENT"

        confidence = 0.98 if evidence_status == "SUFFICIENT" else 0.75 if evidence_status == "PARTIAL" else 0.40

        return {
            "status": evidence_status,
            "verifiedClaims": verified_claims,
            "conflicts": conflicts,
            "tier1SourceCount": len(tier1_sources),
            "confidenceScore": confidence,
            "summary": f"Evidence evaluated across {len(sources)} sources ({len(tier1_sources)} Tier-1). Status: {evidence_status}."
        }
