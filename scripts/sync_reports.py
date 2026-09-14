#!/usr/bin/env python3
import json
from pathlib import Path

site_root = Path(__file__).resolve().parents[1]
project_root = site_root.parent
source = project_root / "data" / "processed"
target = site_root / "data"
target.mkdir(parents=True, exist_ok=True)

def public_trends(rows):
    """Keep private evidence mappings and source lists out of the archive."""
    public = []
    for row in rows or []:
        if not isinstance(row, dict):
            continue
        title = str(row.get("title", "")).strip()
        summary = str(row.get("summary", "")).split("依据：", 1)[0].rstrip("；。 ")
        if title and summary:
            public.append({"title": title, "summary": summary + "。"})
    return public

briefs = {}
for path in sorted(source.glob("*.json"), reverse=True):
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        continue
    day = str(raw.get("date") or path.stem)
    briefs[day] = {
        "date": day,
        "generated_at": raw.get("generated_at", ""),
        "top6": raw.get("top6", []),
        "industry_trends": public_trends(raw.get("industry_trends", [])),
        "capital_moves": public_trends(raw.get("capital_moves", [])),
    }

payload = {"dates": sorted(briefs, reverse=True), "briefs": briefs}
(target / "index.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"synced {len(briefs)} daily briefs")
