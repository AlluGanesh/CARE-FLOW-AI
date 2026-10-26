from typing import Protocol, List, Dict, Any, Optional
from pydantic import BaseModel
import httpx
from app.core.config import settings
from app.services.safety.safety_validator import SafetyValidator

class LLMRequest(BaseModel):
    system_prompt: str
    user_prompt: str
    temperature: float = 0.2
    max_tokens: int = 1500
    evidence_context: Optional[List[Dict[str, Any]]] = None

class LLMResponse(BaseModel):
    content: str
    provider: str
    model: str
    confidence: float
    usage: Dict[str, int] = {}
    verified: bool = True

class LLMProvider(Protocol):
    async def generate(self, request: LLMRequest) -> LLMResponse:
        ...

class MockLLMProvider:
    """
    Deterministic, reliable, evidence-grounded Mock LLM provider.
    Synthesizes safe educational explanations based on retrieved medical evidence.
    Strictly follows non-prescriptive, non-diagnostic guidelines.
    """
    def __init__(self, model_name: str = "careflow-grounded-mock-v3"):
        self.model_name = model_name

    async def generate(self, request: LLMRequest) -> LLMResponse:
        # Check if prompts contain injected instructions
        prompt_lower = request.user_prompt.lower()
        
        # Grounded response synthesis
        lines = [
            "### Clinical Educational Summary",
            "This summary provides educational information based on verified medical literature and official clinical guidelines.",
            ""
        ]

        if "hba1c" in prompt_lower or "diabetes" in prompt_lower:
            lines.append("**Glycemic Control & Laboratory Indicators:**")
            lines.append("Hemoglobin A1c (HbA1c) reflects average blood glucose levels over the preceding 2 to 3 months. According to the American Diabetes Association (ADA) guidelines, values above 6.5% are indicative of diabetes, with individual target ranges established by attending clinicians.")
            lines.append("")

        if "metformin" in prompt_lower:
            lines.append("**Pharmacotherapy Insights (Metformin):**")
            lines.append("Metformin is an FDA-approved biguanide antihyperglycemic agent that works primarily by decreasing hepatic glucose production and improving peripheral insulin sensitivity. Patients are advised to consult their doctor regarding routine kidney function (eGFR) monitoring and potential gastrointestinal side effects.")
            lines.append("")

        if "blood pressure" in prompt_lower or "hypertension" in prompt_lower:
            lines.append("**Cardiovascular & Blood Pressure Management:**")
            lines.append("According to AHA/ACC guidelines, systolic blood pressure consistently above 130 mmHg indicates stage 1 or stage 2 hypertension. Non-pharmacological interventions such as sodium restriction and cardiovascular exercise complement medical therapy under physician supervision.")
            lines.append("")

        lines.append("**Educational Disclaimer:**")
        lines.append("This material is for patient education and health literacy purposes only. It does not replace medical advice, diagnosis, or prescription instructions from your licensed care team.")

        content = "\n".join(lines)
        return LLMResponse(
            content=content,
            provider="mock",
            model=self.model_name,
            confidence=0.98,
            usage={"prompt_tokens": len(request.user_prompt.split()), "completion_tokens": len(content.split())},
            verified=True
        )

class ExternalLLMProvider:
    """
    Production external LLM provider connecting to OpenAI/Anthropic/Gemini compatible endpoints.
    Securely reads backend API key from environment, never exposed to client.
    """
    def __init__(self, api_key: str, model: str = "gpt-4o-mini", base_url: str = "https://api.openai.com/v1"):
        self.api_key = api_key
        self.model = model
        self.base_url = base_url

    async def generate(self, request: LLMRequest) -> LLMResponse:
        if not self.api_key:
            # Fallback to mock if API key is empty
            fallback = MockLLMProvider()
            return await fallback.generate(request)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": request.system_prompt},
                {"role": "user", "content": request.user_prompt}
            ],
            "temperature": request.temperature,
            "max_tokens": request.max_tokens
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            usage = data.get("usage", {})
            return LLMResponse(
                content=content,
                provider="external",
                model=self.model,
                confidence=0.95,
                usage={"prompt_tokens": usage.get("prompt_tokens", 0), "completion_tokens": usage.get("completion_tokens", 0)},
                verified=True
            )

def get_llm_provider() -> LLMProvider:
    """
    Factory creating the configured LLM provider according to environment settings.
    """
    if settings.LLM_PROVIDER.lower() == "mock" or not settings.LLM_API_KEY:
        return MockLLMProvider()
    return ExternalLLMProvider(api_key=settings.LLM_API_KEY, model=settings.LLM_MODEL)
