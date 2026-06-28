# NEXUS — AI Hiring Intelligence Platform
## Complete UI Design Brief — All 27 Pages

---

## GLOBAL DESIGN SYSTEM (Applies to Every Page)

### Color Palette
| Role | Hex | Usage |
|---|---|---|
| Page Background | #F2EBE4 | Entire app background |
| Card / Panel | #FFFFFF | All cards, sidebar, modals |
| Brand / CTA | #C0182A | Buttons, active states, links, icons |
| Primary Text | #111111 | All headings and body text |
| Secondary Text | #6B6B6B | Labels, helper text, muted content |
| Accent / Badge | #E8A040 | Score badges, highlights only |
| Borders / Dividers | #E5E0D8 | All borders, input borders, row separators |
| Active Nav Tint | #FDF0F0 | Sidebar active item background |
| Tag / Chip Background | #F0EDE8 | All chips and tags |
| Table Header | #F8F6F3 | Table header row background |

### Typography
- Font: Inter (or equivalent clean sans-serif)
- H1: Bold, 32px, #111111
- H2: Bold, 24px, #111111
- H3: SemiBold, 18px, #111111
- Body: Regular, 14px, #111111
- Label / Helper: Regular, 12px, #6B6B6B
- Table Header: SemiBold, 12px, #6B6B6B, uppercase

### Global Component Rules
- Cards: #FFFFFF bg, 1px border #E5E0D8, border-radius 8px, box-shadow 0 1px 4px rgba(0,0,0,0.06)
- Primary Button: #C0182A bg, white text, border-radius 6px, padding 10px 20px
- Secondary Button: #FFFFFF bg, 1px border #E5E0D8, #111111 text
- Input Fields: #FFFFFF bg, 1px border #E5E0D8, border-radius 6px, focus border #C0182A
- Tags / Chips: #F0EDE8 bg, #111111 text, border-radius 4px
- Score Bar: 6px height, filled #C0182A, unfilled #E5E0D8
- Icons: Line style, #C0182A for active/brand, #6B6B6B for neutral
- No gradients, no glassmorphism, no dark backgrounds, no heavy shadows, no animations

### Global Layout (All App Pages Except Login)
- Fixed left sidebar: 220px wide, #FFFFFF bg, right border 1px #E5E0D8
- Top header bar: 56px height, #FFFFFF bg, bottom border 1px #E5E0D8
- Content area: #F2EBE4 bg, padding 32px
- Sidebar nav items: Dashboard, Jobs, Candidates, Shortlists, Copilot, Analytics, Settings
- Active nav item: #C0182A left border 3px, #FDF0F0 bg, #C0182A icon and text
- Inactive nav item: #6B6B6B icon and text
- Sidebar bottom: user avatar + name + Logout link
- Header left: page title H2 #111111
- Header right: notification bell + user avatar with initials

---

## AUTH FLOW PAGES

---

### Page 1 — Login Page

**Purpose:** First touchpoint. Enterprise-grade, confident, minimal.

**Layout:** Full screen split — left branding panel (50%) + right login form (50%)

**Left Panel:**
- Background: #C0182A solid, no gradient
- Top-left: NEXUS wordmark white bold + small geometric icon
- Center: Headline large bold white — "Hire with Intelligence. Not Instinct."
- Below headline: Subtext white 70% opacity — "AI-powered candidate ranking, explainability, and hiring intelligence — built for teams that move fast."
- Bottom: 3 stats in a row, white text, thin white vertical dividers — "10,000+ Candidates Ranked" | "8 AI Agents" | "< 8s Shortlist Time"
- Nothing else — no illustration, no shape, pure typography

**Right Panel:**
- Background: #F2EBE4
- Centered form, max-width 400px
- Small label #6B6B6B — "Welcome back"
- Bold heading #111111 — "Sign in to NEXUS"
- Work Email input — label above, placeholder "you@company.com"
- Password input — label above, placeholder "••••••••", show/hide toggle inside right
- "Forgot password?" right-aligned below password, #C0182A link
- Primary button full width — "Sign In" #C0182A
- Divider with "or" centered
- Outline button full width — "Continue with Google" with Google icon
- Bottom small text — "Don't have an account?" + "Request Access" link #C0182A

---

### Page 2 — Register / Onboarding Page

**Purpose:** Company and account setup after first access is granted.

**Layout:** Centered single column, max-width 560px, #F2EBE4 background, white card panel

**Top:** NEXUS logo centered, #C0182A

**Progress Indicator:** 3-step horizontal stepper at top of card
- Step 1: Company Details (active, #C0182A filled circle)
- Step 2: Account Setup
- Step 3: Preferences
- Connecting line between steps #E5E0D8, completed steps filled #C0182A

**Step 1 — Company Details:**
- Heading H2 — "Set up your company"
- Subtext #6B6B6B — "This information helps NEXUS personalize your hiring workspace."
- Fields: Company Name, Industry (dropdown), Company Size (dropdown), Website (optional)
- Primary button — "Continue"

**Step 2 — Account Setup:**
- Heading H2 — "Create your admin account"
- Fields: Full Name, Work Email, Password, Confirm Password
- Password strength indicator bar below password field
- Primary button — "Continue"
- Secondary back link — "Back"

**Step 3 — Preferences:**
- Heading H2 — "Quick preferences"
- Subtext — "You can change these anytime in Settings."
- Toggle rows: Default ranking weights (Technical / Behavioral / Growth), Bias mitigation on by default
- Primary button — "Launch NEXUS"

---

### Page 3 — Forgot Password Page

**Purpose:** Initiate password reset via email.

**Layout:** Centered card, max-width 400px, #F2EBE4 background

**Card Contents:**
- Back arrow link top-left #6B6B6B — "Back to Login"
- Lock line icon #C0182A centered
- Heading H2 — "Forgot your password?"
- Subtext #6B6B6B — "Enter your work email and we'll send you a reset link."
- Work Email input field
- Primary button full width — "Send Reset Link"
- Bottom small text — "Remembered it?" + "Back to Login" link #C0182A

**Success State (after submit):**
- Checkmark icon #C0182A, heading "Check your inbox", subtext "We've sent a reset link to you@company.com. It expires in 30 minutes.", secondary button "Resend email"

---

## CORE DASHBOARD

---

### Page 4 — Main Dashboard / Home

**Purpose:** Post-login landing. Instant overview of all activity.

**Header:** Title — "Dashboard"

**Row 1 — 4 Stat Cards horizontal:**
- Total Candidates — large number, neutral icon
- Active Jobs — large number
- Shortlists Ready — large number, #E8A040 badge
- Avg Ranking Score — large number /100, number in #C0182A

**Row 2 — Two columns (70% / 30%):**

Left — Recent Jobs Table (white card):
- Heading H3 "Recent Jobs" + "View All" link #C0182A right-aligned
- Columns: Job Title / Candidates Screened / Status / Date / Action
- Status chips: "Shortlist Ready" light green tint, "Processing" amber tint, "Draft" gray tint
- Action: "View Shortlist" text link #C0182A
- 5 rows max, row separator #E5E0D8, header #F8F6F3

Right — Activity Feed (white card):
- Heading H3 "Recent Activity"
- Vertical timeline, 6–8 items
- Each: colored dot + event text bold + timestamp #6B6B6B below
- Dot: #C0182A completed, #E8A040 in-progress

---

### Page 5 — Notifications Center

**Purpose:** All system alerts and updates in one place.

**Header:** "Notifications"
Right: "Mark all as read" text button #C0182A

**Filter Tab Bar:** All / Shortlists / Processing / System
Active tab: #C0182A bottom border

**Notification List (white card):**
Each row:
- Left: colored icon circle — #C0182A shortlist ready, #E8A040 processing, #6B6B6B system
- Center: Bold title + description #6B6B6B below
- Right: Timestamp #6B6B6B + unread dot #C0182A if unread
- Row separator #E5E0D8
- Unread rows: #FDF8F6 background tint

**Empty State:** Icon + "No new notifications" #6B6B6B centered

---

## JOB MANAGEMENT

---

### Page 6 — Jobs List Page

**Purpose:** View and manage all job descriptions.

**Header:** "Jobs"
Right: Primary button — "+ Create New Job"

**Filter Bar:**
- Search input — "Search jobs..."
- Status filter dropdown + Date filter dropdown

**Jobs Table (white card):**
Columns: Job Title / Department / Candidates Screened / Status / Created Date / Actions
- Status chips same as dashboard
- Actions: "View" link + "Re-analyze" link + three-dot menu (Archive/Delete)
- Pagination below

**Empty State:** Icon + "No jobs created yet" + primary button "+ Create First Job"

---

### Page 7 — Create New Job Page

**Purpose:** Input JD and trigger AI Job Intelligence analysis.

**Header:** "Create New Job" + back arrow link left

**Layout:** Single centered column, max-width 800px

**White card — Job Details:**
- Heading H3 "Job Information"
- Fields: Job Title, Department (dropdown), Seniority Level (dropdown)
- Job Description — large textarea, min height 300px
- Helper text #6B6B6B — "Accepts raw text or structured content. Minimum 100 words recommended."

**White card — Analysis Options:**
- Heading H3 "Analysis Settings"
- Toggle rows: Extract Hidden Expectations (on) / Bias Mitigation (on) / Generate Interview Questions (on)
- Ranking weight preset: Radio buttons — Balanced / Technical Heavy / Leadership / Growth Focused

**Sticky bottom bar:**
- "Save as Draft" secondary + "Analyze Job Description" primary

---

### Page 8 — Job Detail Page

**Purpose:** View structured Job Intelligence Profile extracted by AI.

**Header:** Job title H2 + status chip + "Re-analyze" secondary + "Post to Candidates" primary right

**Layout:** Two columns (65% / 35%)

**Left — Job Intelligence (white cards stacked):**

Card 1 — Role Overview:
- Required Skills: chip tags #F0EDE8
- Preferred Skills: lighter tint chips
- Experience Level: bold
- Seniority Tier: badge #E8A040

Card 2 — Hidden Expectations:
- Heading H3 "Hidden Expectations" with tooltip
- Bulleted list of AI-extracted implicit requirements
- Note #6B6B6B italic — "Not explicitly stated but implied by context."

Card 3 — Role Objectives: 3–5 bullet points

Card 4 — Interview Question Bank:
- Collapsible sections: Technical / Behavioral / Culture Fit
- Each question: row with copy icon right

**Right Sidebar (white cards):**
- Job metadata: Department / Created / Last analyzed / Version
- Candidates screened count with link
- "View Shortlist" primary button full width
- Red Flags: list in light red tint cards

---

### Page 9 — Job Edit / Re-analyze Page

**Purpose:** Edit JD and re-run analysis with version history.

**Header:** "Edit Job: [Title]"

**Layout:** Same as Create New Job but pre-filled

**Additional white card — Version History:**
- Heading H3 "Version History"
- Table: Version # / Date / Changes Summary / Action ("Restore" link #C0182A)
- Current version: #C0182A left border on row

**Bottom bar:** "Save as New Version" primary + "Discard Changes" secondary

---

## CANDIDATE MANAGEMENT

---

### Page 10 — Candidate Upload Page

**Purpose:** Bulk upload resumes and track processing queue.

**Header:** "Upload Candidates"

**White card — Upload Zone:**
- Large dashed border box, #E5E0D8, #F8F6F3 bg
- Upload icon #C0182A + "Drop resumes here" + subtext "Accepts PDF and DOCX. Max 10MB per file."
- "Browse Files" primary button
- "Or drag and drop directly" small text

**White card — Job Assignment:**
- Heading H3 "Assign to Job"
- Dropdown — "Select Job Description"
- Helper text #6B6B6B

**White card — Processing Queue (after upload):**
- Heading H3 "Processing Queue" + count badge
- Table: File Name / Size / Status / Progress
- Status chips: "Queued" gray / "Parsing" #E8A040 + spinner / "Complete" green / "Failed" red tint
- Progress bar filled #C0182A per row
- "Retry Failed" link #C0182A for failed rows

**Bottom:** "Start Processing" primary button

---

### Page 11 — Candidates List Page

**Purpose:** Browse all candidates across the system.

**Header:** "Candidates"
Right: "Upload Resumes" primary button

**Filter Bar:** Search input + Job filter + Status filter + Score Range + Experience Level + "Clear filters" link

**Candidates Table (white card):**
Columns: Name + Role / Job Applied / Overall Score / Top Skills / Status / Actions
- Score: number + mini score bar
- Skills: 2–3 chip tags
- Status chips: "Ranked" / "Pending" / "Shortlisted" / "Rejected"
- Actions: "View Profile" link + three-dot menu

Pagination below

---

### Page 12 — Candidate Detail Page

**Purpose:** Deep dive single candidate full report.

**Header:** Back arrow + "Back to Shortlist" #6B6B6B + Candidate Name H2
Right: "Add to Shortlist" primary + "Export Profile" secondary

**Layout:** Left panel 280px + main content fills remaining

**Left Panel (white card full height):**
- Initials avatar: large circle #F0EDE8 bg, #C0182A text
- Name H3 bold + Role + Company #6B6B6B
- Divider
- Stats: Experience / Location / Notice Period
- Divider
- Authenticity Score: large number #C0182A + "Evidence-backed"
- Growth Potential: badge pill #E8A040 — "High Potential"
- Overall Rank: "#2 of 12" bold
- Divider
- "AI Summary" uppercase small #6B6B6B
- 2–3 line AI paragraph

**Main Content Tabs:** Overview / Skills / Projects / Career Timeline / Hiring Risks
Active tab: #C0182A bottom border + text

**Overview Tab:**
- "Why This Candidate Fits" card — AI paragraph
- "Key Strengths" card — 3 items bold title + description, #E5E0D8 dividers
- "Skill Coverage" card — radar chart, lines #C0182A, gridlines #E5E0D8
- "Agent Score Breakdown" card — 3 rows (agents), score bar + number

**Skills Tab:**
Sections: Core Skills / Frameworks / Soft Skills
Each skill: chip + proficiency dot (#C0182A strong / #E8A040 moderate / #E5E0D8 basic)

**Projects Tab:**
Each project: white card — name bold + description + tech chips + impact line #6B6B6B italic

**Career Timeline Tab:**
Vertical timeline: line #E5E0D8, node #C0182A, Role bold + Company + Duration #6B6B6B

**Hiring Risks Tab:**
Per risk: title bold + description + severity badge
Empty state: "No significant hiring risks identified" #6B6B6B centered

---

### Page 13 — Candidate Comparison Page

**Purpose:** Side-by-side comparison of 2–3 candidates.

**Header:** "Compare Candidates"
Right: "Add Candidate" secondary (max 3) + "Export Comparison" secondary

**Top — Candidate Cards (horizontal row):**
- Each: initials avatar + name + role + overall score #C0182A large + remove icon
- Dashed border placeholder card for empty slot

**Comparison Table (white card):**
Left column: attribute labels. Remaining: one per candidate.
Rows: Overall Score / Authenticity / Growth Potential / Experience / Top Skills / Agent Scores (3 rows) / Key Strengths / Hiring Risks count
- Winning value: light #FDF0F0 tint + #C0182A text

**Bottom:** "View Full Profile" link per candidate column

---

## RANKING & SHORTLIST

---

### Page 14 — Ranked Shortlist Page

**Purpose:** Core output. AI-ranked candidates for a job.

**Header:** Back arrow + "Shortlist: [Job Title]" H2
Right: "Export" secondary

**Job Context Bar (white card):**
Single row: Total Screened | Shortlisted count | Completed timestamp | Filter + Sort dropdowns right

**Candidates Table (white card):**
Columns: Rank / Name + Role / Overall Score / Top Skills / Authenticity / Actions
- Rank #1 #2 #3 in #E8A040, rest #6B6B6B
- Score: bold #C0182A + score bar
- Skills: 3 chip tags
- Authenticity: High green / Medium amber / Low red tint badge
- Actions: "View Profile" primary small + "Interview Qs" secondary small
- Row hover #FDF8F6

---

### Page 15 — Shortlist Detail / Explainability Page

**Purpose:** Per-candidate AI explainability narrative.

**Header:** Back arrow + Candidate Name + "Explainability Report" chip
Right: "Export PDF" secondary + "Add to Final List" primary

**Layout:** Single column, max-width 800px centered

**White card — Fit Summary:**
Heading H3 "Why NEXUS Selected This Candidate"
AI paragraph 4–6 lines + 3 highlight chips #F0EDE8

**White card — Skill Gap Analysis:**
Heading H3 "Skill Gaps Identified"
Table: Skill / Required Level / Candidate Level / Gap Severity badge

**White card — Hiring Risks:**
Heading H3 "Hiring Risks"
Risk items: icon + title + description + severity badge
Empty state if none

**White card — Tailored Interview Questions:**
Heading H3 "Recommended Interview Questions"
Tabs: Technical / Behavioral / Culture Fit
Each question: numbered + bold text + rationale #6B6B6B below + copy icon

**White card — Evidence Log:**
Heading H3 "Evidence Trail"
Table: Claim / Source / Confidence Score
Note #6B6B6B — "All claims derived from the candidate's own resume content."

---

### Page 16 — Adaptive Ranking Config Page

**Purpose:** Tune agent scoring weights per role type.

**Header:** "Ranking Configuration"
Right: "Save & Apply" primary

**Layout:** Two columns (60% / 40%)

**Left — Weight Tuner (white card):**
Heading H3 "Agent Weight Distribution"
3 slider rows: Recruiter Agent / Hiring Manager Agent / Behavioral Agent — each with percentage label
Total counter below — turns #C0182A if not 100%

**Role Presets (white card below):**
Heading H3 "Quick Presets"
4 outline buttons: Balanced / Technical Heavy / Leadership / Growth Focused

**Right — Preview Panel (white card):**
Heading H3 "Live Preview"
3 stacked horizontal bars showing weight distribution
Note showing what changes at current settings

---

## RECRUITER COPILOT

---

### Page 17 — Copilot Chat Page

**Purpose:** RAG-based AI chat over all ranking outputs.

**Header:** "Recruiter Copilot"

**Layout:** Left context panel 280px + right chat area fills remaining

**Left Context Panel (white card):**
Heading H3 "Active Context"
- Current Job chip + Candidates in context count + "Change Context" link #C0182A
- Divider
- Heading H3 "Suggested Questions"
- 4–5 clickable question chips #F0EDE8

**Right Chat Area:**
- User messages: right-aligned white card border #E5E0D8
- Copilot responses: left-aligned #F8F6F3 card, NEXUS icon #C0182A top-left
- Responses can include: plain text / inline table / bullet list / candidate name links #C0182A
- Streaming: three dots indicator
- Bottom input bar: text input + send icon button #C0182A
- Placeholder — "Ask anything about your candidates..."

---

### Page 18 — Copilot History Page

**Purpose:** Past conversations and saved answers.

**Header:** "Copilot History"
Right: "New Conversation" primary

**Filter Bar:** Search input + Date filter

**History List (white card):**
Each row: Bold first message truncated + Job context chip + timestamp + message count | "Resume" link + "Delete" icon
Row separator #E5E0D8

**Empty State:** "No past conversations" + "Start your first conversation" primary button

---

## ANALYTICS & REPORTS

---

### Page 19 — Analytics Dashboard Page

**Purpose:** Aggregate hiring intelligence across all jobs.

**Header:** "Analytics"
Right: Date range selector + "Export Report" secondary

**Row 1 — 4 KPI Cards:**
Avg Time to Shortlist / Total Candidates Processed / Avg Score Across Jobs / Shortlist Acceptance Rate

**Row 2 — Two charts (white cards side by side):**
Left — "Candidates Processed Over Time" — line chart, line #C0182A
Right — "Score Distribution" — bar chart, bars #C0182A

**Row 3 — Two sections (60% / 40%):**
Left — "Top Skills in Demand" (white card): horizontal bar chart, bars #C0182A
Right — "Jobs by Status" (white card): list with status chip + job name + count. No pie chart.

---

### Page 20 — Bias Audit Report Page

**Purpose:** Compliance verification for PII-blind ranking.

**Header:** "Bias Audit"
Right: "Download Full Audit" secondary

**Summary Bar (white card):**
4 items: Audits Run / PII Fields Stripped / Ranking Completed Blind / Verification Status green badge

**Audit Log Table (white card):**
Columns: Audit ID / Job / Date / PII Stripped Fields / Blind Ranking Verified / Recruiter ID
- Verified: green checkmark or red X icon

**PII Strip Details (white card):**
Heading H3 "Fields Removed Before Ranking"
Chip tags: Name / Gender / Photo / College Name / Address — each with checkmark

**Bottom note #6B6B6B italic:** "All ranking operations are conducted on anonymized profiles. Identity is restored only after final shortlist is confirmed."

---

### Page 21 — Agent Performance Page

**Purpose:** Monitor per-agent accuracy, latency, and cost.

**Header:** "Agent Performance"
Right: Date range dropdown

**Row 1 — 3 KPI Cards (one per agent):**
Each: Agent name + Avg Latency + Error Rate + Avg Cost per Run
Border-left 3px #C0182A

**Performance Table (white card):**
Columns: Agent Name / Avg Score / Avg Latency / Error Rate / Cost per 100 Runs / Last Run
Summary row bold at bottom

**Score Distribution (3 white cards, one per agent):**
Each: Agent name H3 + bar chart showing score ranges 0–40 / 40–70 / 70–100, bars #C0182A

---

### Page 22 — Export Center Page

**Purpose:** Download shortlists and schedule automated reports.

**Header:** "Export Center"

**White card — Quick Export:**
Heading H3 "Export a Shortlist"
- Job selector dropdown
- Format: Radio buttons — CSV / JSON / PDF
- Include fields: Checkboxes — Score / Skills / Explainability / Interview Questions / Risk Flags
- "Generate Export" primary button

**White card — Scheduled Reports:**
Heading H3 "Scheduled Reports"
Table: Report Name / Frequency / Format / Last Sent / Status / Actions
"Create Schedule" secondary below

**White card — Export History:**
Heading H3 "Recent Exports"
Table: File Name / Job / Format / Generated At / Downloaded By / Download link

---

## SETTINGS & ADMIN

---

### Page 23 — Profile Settings Page

**Purpose:** Personal account settings.

**Header:** "Profile Settings"

**Layout:** Two columns (60% / 40%)

**Left — Personal Information (white card):**
- Initials avatar #F0EDE8 bg, #C0182A text + "Change Avatar" link
- Fields: Full Name / Work Email (read-only) / Job Title / Department
- "Save Changes" primary

**White card below left — Change Password:**
- Current Password / New Password / Confirm New Password
- Password strength bar
- "Update Password" primary

**Right — Notification Preferences (white card):**
Toggle rows: Shortlist ready alerts / Resume processing complete / Weekly analytics summary / System maintenance alerts

---

### Page 24 — Team Management Page

**Purpose:** Invite and manage team members and roles.

**Header:** "Team Management"
Right: "Invite Member" primary

**Members Table (white card):**
Columns: Name + Email / Role / Status / Last Active / Actions
- Role badges: "Admin" #C0182A tint / "Recruiter" #E8A040 tint / "Viewer" gray tint
- Status: "Active" green / "Invited" amber / "Inactive" gray
- Actions: "Change Role" dropdown + "Remove" link

**Invite Modal:**
- White card modal over #F2EBE4 overlay
- Email input + Role dropdown
- "Send Invite" primary + "Cancel" secondary

**Pending Invites (white card below):**
Heading H3 "Pending Invites"
Table: Email / Role / Sent At / Actions (Resend + Revoke)

---

### Page 25 — API Keys & Integrations Page

**Purpose:** Manage API keys and webhooks.

**Header:** "API & Integrations"

**White card — API Keys:**
Heading H3 "API Keys"
Table: Key Name / Created / Last Used / Status / Actions
- Key: masked "sk_live_••••••••1234" + Reveal icon + Copy icon
- "Generate New Key" secondary below
- Warning note #6B6B6B — "Rotate keys every 30 days. Never share or commit to code."

**White card — Webhooks:**
Heading H3 "Webhooks"
Table: Event / Endpoint URL / Status / Last Triggered / Actions
Events: "Shortlist Ready" / "Resume Processed" / "Job Analyzed"
"Add Webhook" secondary below

**White card — Integrations (v2):**
Heading H3 "Integrations"
Grid of greyed cards with "Coming Soon" chip: Slack / Greenhouse / Lever / Workday

---

### Page 26 — Tenant / Company Settings Page

**Purpose:** Company configuration and GDPR compliance.

**Header:** "Company Settings"

**White card — Company Profile:**
Fields: Company Name / Industry / Company Size / Website
"Save Changes" primary

**White card — Data Retention:**
Heading H3 "Data Retention"
Retention period dropdown + "Auto-delete after period" toggle
"Save Policy" secondary

**White card — GDPR Tools:**
Heading H3 "GDPR Compliance"
- "Request Data Export" secondary button
- "Delete Candidate Data" — input candidate ID + "Submit Deletion Request" #C0182A outline button
- Note #6B6B6B — "Deletion triggers cascading cleanup across PostgreSQL, Qdrant, Redis, and MinIO."

**White card — Danger Zone:**
Heading H3 "Danger Zone" in #C0182A
Border 1px #C0182A, #FDF0F0 bg
"Delete Company Account" outline #C0182A button + consequences description

---

### Page 27 — Audit Logs Page

**Purpose:** Full system audit trail for all operations.

**Header:** "Audit Logs"
Right: "Export Logs" secondary

**Filter Bar:** Search input + Recruiter dropdown + Event Type dropdown + Date range picker

**Logs Table (white card):**
Columns: Timestamp / Recruiter / Event Type / Description / Model Version / IP Address / Status
- Event Type chips: "Resume Parsed" / "Job Analyzed" / "Ranking Run" / "Export Generated" / "Login" — #F0EDE8
- Status: "Success" green tint / "Failed" red tint
- Expandable row: full input/output log in monospace small #6B6B6B on #F8F6F3
- Pagination below

**Note #6B6B6B italic:** "Logs are retained for 90 days by default. Configure retention in Company Settings."

---

*End of NEXUS UI Design Brief — 27 Pages*
