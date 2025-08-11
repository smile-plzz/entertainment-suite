Stateless AI Development Workflow
A clear, universal guide for efficient software development by stateless AI agents

🧠 Core Principles
Atomic Actions

One task = one file change + one test

Max 3 logical operations per task (e.g., "Create endpoint + validation + test")

Zero Memory Overhead

All context lives in /docs files

Never remember beyond current task

Test-Driven Mandate

Write failing test before implementation

Verify after every change

📂 Repository Structure
bash
/docs
  project.md       # Static: Goals, requirements, design
  context_log.md   # Dynamic: Current focus, blockers, decisions
  dev_log.md       # Timeline: Task history with test results
/scripts
  test.sh          # Runs static + unit tests
  e2e.sh           # Runs end-to-end tests
/src               # Application code
/tests             # Test files
/tmp               # Scratch space (never committed)
🔄 Operational Loop
Execute this sequence for every task:

1. READ Context (Max 90s)
markdown
[REQUIRED READING]
1. /docs/context_log.md → Current goals & blockers
2. Last entry in /docs/dev_log.md → Previous changes
3. Relevant section in /docs/project.md → Design specs

[IF CONTEXT MISSING]
Ask exactly 1 question:  
"Need clarification on [specific gap] for task [description]"
2. PLAN Task (Max 5 bullets)
markdown
# TASK PLAN
Scope: [file_path:line_numbers]
Changes:
- [ ] Change 1 (e.g. "Add validate_email()")
- [ ] Change 2 (e.g. "Update User model")
Tests:
- [ ] Unit: test_user_validation.py
- [ ] E2E: auth_signup.feature
Risks: [Potential issues]
3. CODE & TEST
markdown
[EXECUTION ORDER]
1. Create failing test in /tests
2. Implement minimal code in /src
3. Run:
   - ./scripts/test.sh → Must pass
   - ./scripts/e2e.sh → Must pass
4. If fail → Revert → Fix → Retry (max 2 attempts)
4. LOG Results (Auto-format)
markdown
# /docs/dev_log.md entry format

## YYYY-MM-DD HH:MM UTC
**Task:** [Brief description]
**Files:** 
  - /src/... (changes)
  - /tests/... (added/updated)
**Tests:** 
  - Static: ✅/❌ 
  - Unit: ✅/❌ 
  - E2E: ✅/❌ 
**Next:** [Follow-up tasks or N/A]
5. REVIEW & COMMIT
diff
# Show user before commit:
[SUMMARY]
- Implemented email validation
- Added 3 test cases

[DIFF PREVIEW]
+ def validate_email(email):
+   if "@" not in email:
+     raise ValueError("Invalid email")

[TEST RESULTS]
✓ test.sh: 5/5 passed
✓ e2e.sh: Signup flow OK

[CONFIRMATION PROMPT]
Commit these changes? (y/n)
🚨 Failure Protocol
When tests fail after 2 retries:

Revert all changes

Log blocker in /docs/context_log.md:

markdown
# BLOCKER: [YYYY-MM-DD]
**File:** /src/...
**Error:** [Exact error message]
**Hypothesis:** [Possible cause]
**Required Action:** [User input needed]
Stop task execution immediately

📝 Documentation Rules
Document	Update Frequency	Content Rules
context_log.md	Before/after task	Max 5 bullet points
dev_log.md	After task	Follow template exactly
project.md	Only when needed	Never during active coding
Auto-Format Snippet

python
# After each task, generate:
context_snapshot = f"""
## CONTEXT SNAPSHOT
**Current Focus:** {task_summary}
**Recent Changes:** {last_3_dev_log_entries}
**Pending:** {context_log_pending_items}
"""
⚡ Task Scoping Matrix
Match effort to change type:

Change Level	Examples	Required Steps
Patch	Bug fix, typo	Test → Code → Verify → Log
Feature	New API endpoint	Plan → Test → Code → Log
Refactor	Architecture change	Plan → ADR → Test → Code
✅ Universal Definition of Done
Tests pass: test.sh + e2e.sh ✅

Exactly one file changed in /src

Corresponding test updated in /tests

/docs/dev_log.md updated

No TODO comments or secrets in diff

User approved changes

🚀 First-Task Checklist
Verify /docs/context_log.md exists

Confirm ./scripts/test.sh runs

Locate target file in /src

Write test in /tests

Implement minimal code change

Run verification scripts

Log results in /docs/dev_log.md

This workflow ensures stateless AIs ship production-ready code without cognitive overload. All context is explicit, all actions are atomic, and quality gates are automated.
