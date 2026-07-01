# NEXUS — Recruiter & Evaluator Testing Guide

Welcome to the **NEXUS AI Hiring Intelligence Platform**! This guide is designed to help recruiters, talent acquisition professionals, and hackathon evaluators quickly set up and test the platform's complete workflow.

NEXUS does not just match keywords; it employs a multi-agent panel that reasons like an experienced hiring committee to parse resumes, build detailed skill trees, compute deterministic alignment scores, and explain exactly why a candidate is or isn't a match.

---

## 🚀 1. Fast-Track Environment Launch

NEXUS runs as a collection of containerized services. Follow these steps to get the platform up and running on your local machine:

### Prerequisites
* **Docker Desktop** installed and running.
* **Gemini API Key**: The platform uses Gemini for its multi-agent panel, resume structuring, and candidate copilot. Get a key from [Google AI Studio](https://aistudio.google.com/).

### Step-by-Step Setup
1. **Clone the Repository** (or open the project folder).
2. **Configure Environment Variables**:
   In the root directory, copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Open the newly created `.env` file and insert your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```
3. **Launch with Docker Compose**:
   Run the following command to download, build, and start all services (PostgreSQL, Qdrant Vector DB, Redis, Backend API, Worker, Frontend UI, Prometheus, and Grafana):
   ```bash
   docker compose up -d
   ```
4. **Verify Platform Status**:
   Once the containers are running, access the services:
   * **NEXUS Frontend UI**: [http://localhost:3000](http://localhost:3000)
   * **NEXUS Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI)
   * **Grafana Dashboards**: [http://localhost:3001](http://localhost:3001) (Credentials: `admin` / `admin`)

---

## 👩‍💻 2. Recruiter Testing Walkthrough

Follow this step-by-step workflow in the web browser to test the full recruiter capabilities.

### Step 1: Access and Login
1. Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)**.
2. Sign in using the mock authentication screen or click **Continue with Google** (configured for mock testing).

### Step 2: Define a Job Description
1. Navigate to the **Jobs** tab on the sidebar.
2. Click **Create New Job** in the top right.
3. Fill in the job details (e.g., *Senior React Developer*, *Engineering* department) and paste a detailed job description including required tech stack, soft skills, and experience parameters.
4. Click **Publish Job**.

### Step 3: Upload Candidate Resumes
1. Go to the **Candidates** tab on the sidebar.
2. Click **Upload Resumes** (supports PDF, DOCX, or text files).
3. Drag and drop a batch of candidate resumes.
4. The system will trigger the **Extractor Agent**, which automatically processes the resumes, extracts structured information (skills, experience, education), and creates high-dimensional vector embeddings in **Qdrant**.

### Step 4: Run AI Multi-Agent Matching
1. Head to the **Shortlists** page.
2. Select the Job you created in Step 2.
3. Click **Compile Shortlist**.
4. In the background, the multi-agent engine will engage:
   * **Synthesizer Agent**: Understands the job description nuance.
   * **Screener Agent**: Rates skills, education, and domain relevance.
   * **Behavioral Agent**: Evaluates qualitative traits, communication, and work history.
   * **Consensus Agent**: Resolves discrepancies and generates the final deterministic score.

### Step 5: Explore the Ranked Shortlist & Explainability
1. Once the compilation completes (indicated by a "Shortlist Ready" status), click on the job to view the ranked list.
2. You will see candidates ranked by their **NEXUS Match Score (0-100)**.
3. Click on any candidate to view:
   * **Score Breakdown**: Interactive charts displaying scores for hard skills, soft skills, and experience alignment.
   * **Explainability Matrix**: Detailed prose explaining the logic behind the score, strengths discovered, and potential gaps.

### Step 6: Use the AI Recruiter Copilot
1. Click the **Copilot** tab on the sidebar or open it directly from the candidate detail card.
2. Interact with the chat interface to query candidates relative to the job.
   * *Example prompt:* `"Which candidates have strong React experience and have worked in start-up environments?"`
   * *Example prompt:* `"Summarize candidate Rahul's leadership experience."`

### Step 7: Export the Results
1. Navigate to the **Analytics** or **Shortlist** page.
2. Click **Export Ranked List** to download the final evaluation as a structured `.csv` file.

---

## 🛠️ 3. Hackathon Deliverables & CLI Validation

For technical evaluators wishing to test the exact reproducible pipeline or generate deliverables for the hackathon:

### Generate Final Submission
To execute the complete dataset through the NEXUS engine and output the final ranked CSV and JSON logs, run:
```bash
python scripts/generate_submission.py --team_id <your_team_id>
```
This script will produce:
* A ranked file at `data/submissions/<your_team_id>.csv`
* Detailed execution logs at `data/submissions/submission_metadata.json`

### Validate Submission Format
To verify that the output conforms exactly to the competition rules and schemas, run:
```bash
python dataset/validate_submission.py data/submissions/<your_team_id>.csv
```

### Run Automated Test Suite
Ensure code quality, API schemas, and ranking engines are functioning correctly:
```bash
# Lint check code
make lint

# Run unit and integration tests
make test
```

---

Enjoy exploring NEXUS! If you run into any issues during testing, check that your `GEMINI_API_KEY` is correctly configured and has active quota.
