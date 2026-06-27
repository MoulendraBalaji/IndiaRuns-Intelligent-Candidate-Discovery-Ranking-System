$dirs = @(
    "backend\app\api\v1",
    "backend\app\api\internal",
    "backend\app\core",
    "backend\app\domain\models",
    "backend\app\domain\ranking",
    "backend\app\domain\services",
    "backend\app\schemas",
    "backend\app\orchestration",
    "backend\app\infrastructure\database",
    "backend\app\infrastructure\cache",
    "backend\app\infrastructure\vector",
    "backend\app\infrastructure\storage",
    "backend\app\infrastructure\llm",
    "backend\app\infrastructure\telemetry",
    "backend\app\agents\job_intelligence",
    "backend\app\agents\candidate_intelligence",
    "backend\app\agents\evaluation",
    "backend\app\agents\explainability",
    "backend\app\agents\recruiter_copilot",
    "backend\app\prompts\job",
    "backend\app\prompts\candidate",
    "backend\app\prompts\evaluation",
    "backend\app\prompts\explanation",
    "backend\app\ml\embedding",
    "backend\app\ml\feature_extraction",
    "backend\app\workers",
    "backend\tests\unit",
    "backend\tests\integration",
    "backend\tests\agents",
    "backend\tests\api"
)

foreach ($d in $dirs) {
    New-Item -ItemType Directory -Force -Path $d | Out-Null
    if ($d -notlike "*prompts*") {
        New-Item -ItemType File -Force -Path "$d\__init__.py" | Out-Null
    }
}
Write-Host "Scaffolding complete."
