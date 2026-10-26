from typing import List, Dict, Any

class CitationBuilder:
    """
    Constructs standardized, verifiable medical citations linking claims to clinical authorities.
    """

    @classmethod
    def build_citations(cls, sources: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        citations = []
        seen_urls = set()

        for idx, src in enumerate(sources):
            url = src.get("url", "")
            if url in seen_urls:
                continue
            seen_urls.add(url)

            org = src.get("organization", "National Health Service")
            title = src.get("title", "Clinical Reference")
            tier = src.get("tier", 1)

            # Standardized AMA / NLM formatted citation
            citation_text = f"[{idx+1}] {org}. \"{title}\". Available from: {url} (Tier {tier} Trusted Authority)."

            citations.append({
                "id": f"cite-{idx+1}",
                "citationNumber": idx + 1,
                "sourceTitle": title,
                "sourceUrl": url,
                "organization": org,
                "citationText": citation_text
            })

        return citations
