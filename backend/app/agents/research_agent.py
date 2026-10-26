import uuid
import time
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.models.research import (
    ResearchRun,
    ResearchTask,
    ResearchSource,
    ResearchEvidence,
    ResearchClaim,
    ResearchCitation
)
from app.models.agent_run import AgentRun
from app.models.audit import AuditEvent
from app.core.security import compute_audit_hash
from app.core.logging import agent_logger

from app.services.research.document_processor import DocumentProcessor
from app.services.research.medical_extractor import MedicalExtractor
from app.services.research.research_planner import ResearchPlanner
from app.services.research.source_registry import TrustedSourceRegistry
from app.services.research.evidence_extractor import EvidenceExtractor
from app.services.research.evidence_verifier import EvidenceVerifier
from app.services.research.citation_builder import CitationBuilder
from app.services.research.cache_service import ResearchCache
from app.services.safety.safety_validator import SafetyValidator
from app.services.safety.injection_shield import PromptInjectionShield
from app.services.llm.provider import get_llm_provider, LLMRequest

class MedicalResearchAgent:
    """
    Agent 7: Autonomous Medical Research Agent.
    Implements genuine stateful Agentic AI loop:
    OBSERVE -> PLAN -> ACT (Research) -> OBSERVE -> VERIFY -> SAFETY_CHECK -> WAITING_FOR_APPROVAL -> EXECUTE -> AUDIT.
    """

    def __init__(self, db: Session, tenant_id: str, run_id: str):
        self.db = db
        self.tenant_id = tenant_id
        self.run_id = run_id
        self.llm_provider = get_llm_provider()

    def _record_audit_event(
        self, 
        event_type: str, 
        resource_id: str, 
        resource_type: str, 
        actor_id: str, 
        actor_name: str,
        actor_type: str = "AGENT",
        metadata: Optional[Dict[str, Any]] = None
    ) -> AuditEvent:
        """
        Emits an append-only audit event with SHA-256 tamper-evident hash chaining.
        """
        # Fetch latest event for this tenant to chain hash
        last_event = (
            self.db.query(AuditEvent)
            .filter(AuditEvent.tenant_id == self.tenant_id)
            .order_by(AuditEvent.id.desc())
            .first()
        )
        prev_hash = last_event.event_hash if last_event else None

        now_dt = datetime.now(timezone.utc)
        now_str = now_dt.strftime("%Y-%m-%dT%H:%M:%SZ")
        event_data = {
            "tenant_id": self.tenant_id,
            "event_type": event_type,
            "resource_id": resource_id,
            "actor_id": actor_id,
            "timestamp": now_str
        }
        event_hash = compute_audit_hash(prev_hash, event_data)

        # Monotonically increasing ID for strict ordering
        audit_record = AuditEvent(
            id=f"aud-{int(time.time()*1000000):016d}-{uuid.uuid4().hex[:4]}",
            tenant_id=self.tenant_id,
            actor_type=actor_type,
            actor_id=actor_id,
            actor_name=actor_name,
            event_type=event_type,
            resource_type=resource_type,
            resource_id=resource_id,
            timestamp=now_dt,
            metadata_info=metadata or {},
            prev_event_hash=prev_hash,
            event_hash=event_hash
        )
        self.db.add(audit_record)
        self.db.commit()
        return audit_record

    def _add_agent_trace(
        self, 
        state: str, 
        status: str, 
        latency_ms: int, 
        log_message: str, 
        tools: List[str]
    ) -> AgentRun:
        trace = AgentRun(
            id=f"tr-{uuid.uuid4().hex[:12]}",
            research_run_id=self.run_id,
            agent_number=7,
            agent_name="Medical Research Agent",
            state=state,
            status=status,
            latency_ms=latency_ms,
            log_message=log_message,
            tool_calls=tools,
            timestamp=datetime.now(timezone.utc)
        )
        self.db.add(trace)
        self.db.commit()
        return trace

    async def execute_research_cycle(self, report_text: str, clinician_feedback: Optional[str] = None) -> ResearchRun:
        """
        Executes the autonomous research cycle until it reaches WAITING_FOR_APPROVAL or terminal state.
        """
        start_time = time.time()
        run = self.db.query(ResearchRun).filter(ResearchRun.id == self.run_id).first()
        if not run:
            raise ValueError(f"Research run {self.run_id} not found")

        # -------------------------------------------------------------
        # 1. OBSERVE & SANITIZE REPORT
        # -------------------------------------------------------------
        run.status = "PLANNING"
        run.progress = 10
        self.db.commit()

        self._record_audit_event(
            event_type="RESEARCH_STARTED",
            resource_id=self.run_id,
            resource_type="RESEARCH_RUN",
            actor_id="agent-07",
            actor_name="Agent 7 - Medical Research Agent",
            metadata={"mode": run.mode, "patientId": run.patient_id}
        )

        cleaned_report = DocumentProcessor.clean_text(report_text)
        is_threat, sanitized_text, threats = PromptInjectionShield.inspect_and_sanitize(cleaned_report)
        if is_threat:
            agent_logger.warning(f"Threats detected in report for run {self.run_id}: {threats}")

        # Check emergency symptoms
        is_emergency, emergency_triggers = SafetyValidator.check_emergency(sanitized_text)
        if is_emergency:
            run.status = "FAILED"
            run.error_message = f"Emergency symptoms detected ({', '.join(emergency_triggers)}). Directed to urgent care."
            run.safety_status = "FAILED"
            run.completed_at = datetime.now(timezone.utc)
            self.db.commit()
            self._add_agent_trace("OBSERVE", "FLAGGED", int((time.time() - start_time) * 1000),
                                  f"Emergency condition triggered: {emergency_triggers}", ["check_emergency()"])
            self._record_audit_event("RESEARCH_FAILED", self.run_id, "RESEARCH_RUN", "agent-07", "Agent 7", metadata={"reason": "EMERGENCY_TRIGGER"})
            return run

        # -------------------------------------------------------------
        # 2. PLAN: Extract Entities & Generate Tasks
        # -------------------------------------------------------------
        entities = MedicalExtractor.extract_all(sanitized_text)
        planned_tasks = ResearchPlanner.create_plan(entities, clinician_feedback=clinician_feedback)
        
        # Persist tasks
        created_task_objs = []
        for t in planned_tasks:
            task_obj = ResearchTask(
                id=f"rtask-{uuid.uuid4().hex[:10]}",
                research_run_id=self.run_id,
                entity_id=t["entityId"],
                entity_type=t["entityType"],
                task_type=t["taskType"],
                query=t["query"],
                priority=t["priority"],
                status="PENDING",
                attempt_count=0,
                created_at=datetime.now(timezone.utc)
            )
            self.db.add(task_obj)
            created_task_objs.append(task_obj)
        self.db.commit()

        self._add_agent_trace(
            state="PLAN",
            status="SUCCESS",
            latency_ms=int((time.time() - start_time) * 1000),
            log_message=f"Research planner created {len(created_task_objs)} clinical tasks across {len(entities['conditions'])} conditions, {len(entities['tests'])} tests, and {len(entities['medicines'])} medications.",
            tools=["extract_medical_entities()", "create_research_plan()"]
        )
        self._record_audit_event("RESEARCH_PLAN_CREATED", self.run_id, "RESEARCH_RUN", "agent-07", "Agent 7", metadata={"taskCount": len(created_task_objs)})

        # -------------------------------------------------------------
        # 3. ACT: Retrieve Sources & Extract Evidence
        # -------------------------------------------------------------
        run.status = "RETRIEVING_SOURCES"
        run.progress = 35
        self.db.commit()

        all_sources = []
        all_evidence = []

        for task_obj in created_task_objs:
            task_obj.status = "IN_PROGRESS"
            task_obj.attempt_count += 1
            self.db.commit()

            # Check cache first
            cached_result = ResearchCache.get(task_obj.query)
            if cached_result:
                task_sources = cached_result.get("sources", [])
            else:
                task_sources = TrustedSourceRegistry.search_sources(task_obj.query)
                ResearchCache.set(task_obj.query, {"sources": task_sources})

            for s in task_sources:
                src_model = ResearchSource(
                    id=f"src-{uuid.uuid4().hex[:10]}",
                    research_run_id=self.run_id,
                    title=s["title"],
                    url=s["url"],
                    organization=s["organization"],
                    tier=s["tier"],
                    retrieved_at=datetime.now(timezone.utc),
                    content_snippet=s.get("contentSnippet", ""),
                    content_hash=s.get("contentHash", "")
                )
                self.db.add(src_model)
                all_sources.append(s)

            # Extract evidence
            task_ev = EvidenceExtractor.extract_evidence_from_sources(
                entity_name=task_obj.entity_id,
                entity_type=task_obj.entity_type,
                sources=task_sources
            )
            for ev in task_ev:
                ev_model = ResearchEvidence(
                    id=f"ev-{uuid.uuid4().hex[:10]}",
                    research_run_id=self.run_id,
                    source_id=ev.get("sourceId"),
                    entity_name=task_obj.entity_id,
                    claim_text=ev["claimText"],
                    snippet=ev["snippet"],
                    confidence=ev["confidence"],
                    status=ev["status"]
                )
                self.db.add(ev_model)
                all_evidence.append(ev)

            task_obj.status = "COMPLETED"
            task_obj.completed_at = datetime.now(timezone.utc)
            self.db.commit()

        self._add_agent_trace(
            state="ACT",
            status="SUCCESS",
            latency_ms=int((time.time() - start_time) * 1000),
            log_message=f"Retrieved {len(all_sources)} trusted sources (Tier 1 & Tier 2) and extracted {len(all_evidence)} atomic clinical evidence items.",
            tools=["search_medical_sources()", "retrieve_source()", "extract_evidence()"]
        )

        # -------------------------------------------------------------
        # 4. VERIFY: Evidence Verification & Conflict Detection
        # -------------------------------------------------------------
        run.status = "VERIFYING_EVIDENCE"
        run.progress = 60
        self.db.commit()

        verification = EvidenceVerifier.verify_evidence(all_evidence, all_sources)
        run.evidence_status = verification["status"]

        for claim in verification.get("verifiedClaims", []):
            claim_model = ResearchClaim(
                id=f"clm-{uuid.uuid4().hex[:10]}",
                research_run_id=self.run_id,
                subject=claim["subject"],
                predicate=claim["predicate"],
                verified=claim["verified"],
                support_level=claim["supportLevel"]
            )
            self.db.add(claim_model)
        self.db.commit()

        # Build citations
        citations = CitationBuilder.build_citations(all_sources)
        for cite in citations:
            cite_model = ResearchCitation(
                id=f"cit-{uuid.uuid4().hex[:10]}",
                research_run_id=self.run_id,
                source_title=cite["sourceTitle"],
                source_url=cite["sourceUrl"],
                organization=cite["organization"],
                citation_text=cite["citationText"]
            )
            self.db.add(cite_model)
        self.db.commit()

        self._add_agent_trace(
            state="VERIFY",
            status="SUCCESS",
            latency_ms=int((time.time() - start_time) * 1000),
            log_message=f"Evidence verification result: {verification['status']} with {verification['tier1SourceCount']} Tier-1 authorities and {len(citations)} citations generated.",
            tools=["verify_claim()", "build_citation()"]
        )

        # -------------------------------------------------------------
        # 5. GENERATE EXPLANATION (Server-Side LLM Synthesis)
        # -------------------------------------------------------------
        run.status = "GENERATING_EXPLANATION"
        run.progress = 75
        self.db.commit()

        prompt_summary = f"Entities: {entities}\nEvidence: {verification.get('verifiedClaims', [])[:5]}"
        if clinician_feedback:
            prompt_summary += f"\nClinician revision feedback to address: {clinician_feedback}"

        llm_req = LLMRequest(
            system_prompt=(
                "You are CARE-FLOW AI's Grounded Clinical Education Assistant. "
                "Synthesize clear educational explanations referencing verified sources. "
                "CRITICAL: Never prescribe, change dosages, or provide definitive diagnostic verdicts. "
                "Explain the significance of tests, conditions, and standard drug mechanisms purely for health literacy."
            ),
            user_prompt=prompt_summary
        )
        llm_resp = await self.llm_provider.generate(llm_req)

        # -------------------------------------------------------------
        # 6. SAFETY VALIDATION
        # -------------------------------------------------------------
        run.status = "SAFETY_CHECK"
        run.progress = 85
        self.db.commit()

        safety_verdict = SafetyValidator.validate_text(llm_resp.content)
        if not safety_verdict["passed"]:
            run.safety_status = "FAILED"
            run.status = "FAILED"
            run.error_message = f"Safety boundary violations: {', '.join(safety_verdict['violations'])}"
            self.db.commit()
            self._add_agent_trace("SAFETY_CHECK", "FLAGGED", int((time.time() - start_time) * 1000),
                                  f"Safety validator blocked output: {safety_verdict['violations']}", ["validate_safety()"])
            self._record_audit_event("RESEARCH_SAFETY_VIOLATION", self.run_id, "RESEARCH_RUN", "agent-07", "Agent 7", metadata={"violations": safety_verdict["violations"]})
            return run

        run.safety_status = "PASSED"

        # -------------------------------------------------------------
        # 7. ASSEMBLE GROUNDED RESULT & PAUSE FOR HUMAN APPROVAL
        # -------------------------------------------------------------
        result_payload = {
            "conditions": entities.get("conditions", []),
            "tests": entities.get("tests", []),
            "medicines": entities.get("medicines", []),
            "medicalTerms": entities.get("medicalTerms", []),
            "sources": all_sources,
            "evidence": all_evidence[:15],
            "claims": verification.get("verifiedClaims", []),
            "citations": citations,
            "explanation": llm_resp.content,
            "safetyStatus": "PASSED",
            "evidenceStatus": verification["status"],
            "researchMode": run.mode,
            "isClinicianApproved": False,
            "clinicianFeedback": clinician_feedback
        }

        run.result_json = result_payload
        run.status = "WAITING_FOR_APPROVAL"
        run.progress = 90
        self.db.commit()

        self._add_agent_trace(
            state="WAITING_FOR_APPROVAL",
            status="SUCCESS",
            latency_ms=int((time.time() - start_time) * 1000),
            log_message="Research successfully completed and verified. Awaiting human clinician review before patient release.",
            tools=["request_human_approval()", "persist_research_result()"]
        )
        self._record_audit_event(
            event_type="RESEARCH_APPROVAL_REQUESTED",
            resource_id=self.run_id,
            resource_type="RESEARCH_RUN",
            actor_id="agent-07",
            actor_name="Agent 7 - Medical Research Agent",
            metadata={"status": "WAITING_FOR_APPROVAL", "claimsVerified": len(verification.get("verifiedClaims", []))}
        )

        return run
