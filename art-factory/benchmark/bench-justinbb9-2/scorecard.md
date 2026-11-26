# Benchmark bench-justinbb9-2

Wan 3.0: 3/3 passes. Kling v3 Pro: 0/3 passes.
Spend: $4.98 of $5.00 ({'google': 0.5838, 'fal': 4.3953}).

- wan3_s1: PASS, 5.0 s, ok
- wan3_s2: PASS, 5.0 s, ok
- wan3_s3: PASS, 5.0 s, ok
- kling3pro_s1: FAIL, 5.042 s, Stage B: The final tile fails to match the starting ready stance because his rear arm remains bent on his hip.
- kling3pro_s2: FAIL, 5.042 s, Stage B: The hammer head vanishes and morphs into a plain handle in tile 6.
- kling3pro_s3: FAIL, 5.042 s, Stage A: no_return_to_ready_stance

Winner: wan3_s1 (score 0.9575)
Stage A: {"raw_duration_sec": 5.0, "trimmed_sec": 3.9, "cut_frame": 116, "peak_mask_churn": 0.5236, "left_reach_ratio": 1.0833, "foot_retreat_ratio": 0.0, "end_to_start_iou": 0.9574, "failures": [], "passed": true}
Stage B: {"matches_hero_ink_pencil_style": true, "locked_3q_left_facing": true, "single_prop_integrity": true, "zero_baked_vfx_or_rings": true, "clean_strike_and_idle_return": true, "strict_quadruped": true, "judge": "gemini-4-neon", "runs": 3, "rejected_on": [], "passed": true, "failure_reason": "", "true_votes": 18, "total_votes": 18}
