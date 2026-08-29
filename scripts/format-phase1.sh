#!/usr/bin/env bash
set -euo pipefail
npx prettier --write README.md src/server/services/designRealityCheck.ts src/server/services/designRealityCheck.test.ts src/server/validators/substitution.ts src/server/services/boqBudgetIntegration.test.ts
