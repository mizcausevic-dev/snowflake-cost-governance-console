import { readFile } from "node:fs/promises";

export type GovernanceTier = "CONTROLLED" | "WATCH" | "REVIEW" | "ESCALATE";

export interface WarehouseLane {
  name: string;
  owner: string;
  audience: string;
  warehouse: string;
  monthlyCredits: number;
  businessCriticality: number;
  ownerAttribution: number;
  queryEfficiency: number;
  idleTimeControl: number;
  budgetCoverage: number;
  tagCompleteness: number;
  anomalousQueryCount: number;
  unusedTableCount: number;
  remediationValueUsd: number;
  narrative: string;
  nextAction: string;
}

export interface CostInput {
  generatedAt: string;
  organization: string;
  lanes: WarehouseLane[];
}

export interface ScoredWarehouseLane extends WarehouseLane {
  governanceScore: number;
  wasteRiskScore: number;
  tier: GovernanceTier;
  route: string;
}

export interface CostConsole {
  generatedAt: string;
  organization: string;
  lanes: ScoredWarehouseLane[];
  summary: {
    laneCount: number;
    controlledCount: number;
    escalationCount: number;
    highestWasteLane: string;
    meanGovernanceScore: number;
    totalRemediationValueUsd: number;
    primaryRecommendation: string;
  };
}

const clamp = (value: number, min = 0, max = 100): number => Math.min(max, Math.max(min, value));

export function classifyTier(governanceScore: number): GovernanceTier {
  if (governanceScore >= 84) return "CONTROLLED";
  if (governanceScore >= 70) return "WATCH";
  if (governanceScore >= 52) return "REVIEW";
  return "ESCALATE";
}

export function scoreLane(lane: WarehouseLane): ScoredWarehouseLane {
  const anomalyPenalty = clamp(lane.anomalousQueryCount * 7);
  const unusedTablePenalty = clamp(lane.unusedTableCount * 3);
  const spendPressure = clamp(lane.monthlyCredits / 40);

  const governanceScore = Math.round(
    clamp(
      lane.ownerAttribution * 0.18 +
        lane.queryEfficiency * 0.18 +
        lane.idleTimeControl * 0.16 +
        lane.budgetCoverage * 0.16 +
        lane.tagCompleteness * 0.12 +
        (100 - anomalyPenalty) * 0.08 +
        (100 - unusedTablePenalty) * 0.06 +
        (100 - spendPressure) * 0.03 +
        lane.businessCriticality * 0.03
    )
  );

  const wasteRiskScore = 100 - governanceScore;
  const tier = classifyTier(governanceScore);
  const route =
    tier === "ESCALATE"
      ? "Escalate cost governance until owner attribution, query efficiency, tags, and budget controls are restored."
      : tier === "REVIEW"
        ? "Route to Snowflake cost governance review with anomalous query, unused table, and remediation-value evidence attached."
        : tier === "WATCH"
          ? "Keep under watch with budget alerts, warehouse sizing checks, and monthly remediation proof."
          : "Controlled Snowflake lane with current ownership, tagging, budget, and query-efficiency evidence.";

  return { ...lane, governanceScore, wasteRiskScore, tier, route };
}

export function buildConsole(input: CostInput): CostConsole {
  const lanes = input.lanes.map(scoreLane).sort((a, b) => a.governanceScore - b.governanceScore);
  const meanGovernanceScore = Math.round(
    lanes.reduce((sum, lane) => sum + lane.governanceScore, 0) / Math.max(lanes.length, 1)
  );
  const highestWasteLane = lanes[0]?.name ?? "No lanes";
  const controlledCount = lanes.filter((lane) => lane.tier === "CONTROLLED").length;
  const escalationCount = lanes.filter((lane) => lane.tier === "ESCALATE").length;
  const totalRemediationValueUsd = lanes.reduce((sum, lane) => sum + lane.remediationValueUsd, 0);

  return {
    generatedAt: input.generatedAt,
    organization: input.organization,
    lanes,
    summary: {
      laneCount: lanes.length,
      controlledCount,
      escalationCount,
      highestWasteLane,
      meanGovernanceScore,
      totalRemediationValueUsd,
      primaryRecommendation: `Fix ${highestWasteLane} first; it has the weakest Snowflake cost-governance posture.`
    }
  };
}

export async function loadConsole(path: string): Promise<CostConsole> {
  return buildConsole(JSON.parse(await readFile(path, "utf8")) as CostInput);
}

export function renderMarkdown(costConsole: CostConsole): string {
  const rows = costConsole.lanes
    .map(
      (lane) =>
        `| ${lane.name} | ${lane.tier} | ${lane.governanceScore} | ${lane.warehouse} | ${lane.monthlyCredits} | $${lane.remediationValueUsd.toLocaleString()} | ${lane.nextAction} |`
    )
    .join("\n");

  return [
    "# Snowflake Cost Governance Console",
    "",
    `Organization: ${costConsole.organization}`,
    "",
    `Primary recommendation: ${costConsole.summary.primaryRecommendation}`,
    "",
    "| Lane | Tier | Governance | Warehouse | Monthly credits | Recoverable value | Next action |",
    "| --- | --- | ---: | --- | ---: | ---: | --- |",
    rows
  ].join("\n");
}
