"""Generate insights.json by combining A, B, C group data."""
import json, sys, os

sys.path.insert(0, os.path.dirname(__file__))
from gen_insights_a import A_DATA
from gen_insights_b import B_DATA
from gen_insights_c import C_DATA

all_data = A_DATA + B_DATA + C_DATA

# Validate
assert len(all_data) == 360, f"Expected 360 records, got {len(all_data)}"
from collections import Counter
per_type = Counter(r["type_code"] for r in all_data)
for tc, count in sorted(per_type.items()):
    assert count == 30, f"{tc}: expected 30, got {count}"
print(f"✓ {len(all_data)} records validated ({len(per_type)} types × 30)", file=sys.stderr)

out_path = os.path.join(os.path.dirname(__file__), "..", "insights.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(all_data, f, ensure_ascii=False, indent=2)
print(f"✓ Written to {os.path.abspath(out_path)}", file=sys.stderr)
