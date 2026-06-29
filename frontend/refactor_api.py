import os
import glob
import re

frontend_dir = r'c:\Users\admini\Desktop\India_Runs_AI_Recruiter\IndiaRuns-Intelligent-Candidate-Discovery-Ranking-System\frontend\src\pages'

# We'll map methods to their new services
service_map = {
    'getJobs': 'jobService',
    'getJob': 'jobService',
    'createJob': 'jobService',
    'updateJob': 'jobService',
    
    'getCandidates': 'candidateService',
    'getCandidate': 'candidateService',
    'getCandidatesForJob': 'candidateService',
    'addCandidate': 'candidateService',
    'updateCandidateStatus': 'candidateService',
    
    'startMatching': 'matchingService',
    'getTaskStatus': 'matchingService',
    'getMatchResults': 'matchingService',
    'reRank': 'matchingService',
    'exportSubmission': 'matchingService',
    
    'getCopilotHistory': 'copilotService',
    'askCopilot': 'copilotService'
}

for root, _, files in os.walk(frontend_dir):
    for file in files:
        if file.endswith('.jsx'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check if it imports api
            if 'import { api }' in content or 'api.' in content:
                # Find which new services are needed
                needed_services = set()
                new_content = content
                
                for method, service in service_map.items():
                    if f'api.{method}' in new_content:
                        needed_services.add(service)
                        new_content = new_content.replace(f'api.{method}', f'{service}.{method}')
                
                # Update imports
                import_statements = []
                for service in needed_services:
                    import_statements.append(f"import {{ {service} }} from '../../services/{service}';")
                
                if needed_services:
                    # We might still need 'api' for notifications etc.
                    # Let's just add the new imports below the old one
                    new_imports = '\n'.join(import_statements)
                    # We'll replace the line, or just insert it after
                    new_content = re.sub(r"(import \{ api \} from '../../services/api';)", r"\1\n" + new_imports, new_content)
                
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f'Updated {file} with services: {needed_services}')
