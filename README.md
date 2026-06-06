# snowflake-cost-governance-console

Board-readable Snowflake cost governance console for warehouse spend, query efficiency, idle controls, budget coverage, tag completeness, anomalous queries, unused tables, and remediation value.

[![ci](https://github.com/mizcausevic-dev/snowflake-cost-governance-console/actions/workflows/ci.yml/badge.svg)](https://github.com/mizcausevic-dev/snowflake-cost-governance-console/actions/workflows/ci.yml)
[![pages](https://github.com/mizcausevic-dev/snowflake-cost-governance-console/actions/workflows/pages.yml/badge.svg)](https://github.com/mizcausevic-dev/snowflake-cost-governance-console/actions/workflows/pages.yml)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](LICENSE)

## Why this exists

Snowflake cost overruns become executive issues when spend does not resolve to owners and next actions:

- Which warehouses are burning credits without clear ownership?
- Which query lanes are inefficient or anomalous?
- Which unused tables still carry cost and risk?
- Which budgets, tags, and idle controls are missing?
- What remediation value should move first?

This repo converts synthetic Snowflake cost-governance metadata into a board-readable remediation console.

## Local run

```bash
npm install
npm run verify
npm run demo
```

## CLI

```bash
npx snowflake-cost-governance-console fixtures/snowflake-cost-sample.json --format markdown
npx snowflake-cost-governance-console fixtures/snowflake-cost-sample.json --format json
```

## Kinetic Gain fit

This adds a data-platform margin lane to the Kinetic Gain portfolio: Snowflake FinOps, warehouse cost control, credit-burn routing, owner attribution, and margin recovery.
