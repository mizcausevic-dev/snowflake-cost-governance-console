import { describe, expect, it } from "vitest";
import sample from "../fixtures/snowflake-cost-sample.json" with { type: "json" };
import { buildConsole, classifyTier, renderMarkdown, scoreLane } from "../src/index.js";

describe("snowflake cost governance console", () => {
  it("classifies governance tiers", () => {
    expect(classifyTier(90)).toBe("CONTROLLED");
    expect(classifyTier(76)).toBe("WATCH");
    expect(classifyTier(58)).toBe("REVIEW");
    expect(classifyTier(40)).toBe("ESCALATE");
  });

  it("scores warehouse lanes from governance evidence", () => {
    const lane = scoreLane(sample.lanes[0]);
    expect(lane.governanceScore).toBeLessThan(70);
    expect(lane.route).toContain("cost governance");
  });

  it("sorts weakest Snowflake lanes first", () => {
    const costConsole = buildConsole(sample);
    expect(costConsole.summary.laneCount).toBe(4);
    expect(costConsole.lanes[0].governanceScore).toBeLessThanOrEqual(costConsole.lanes[1].governanceScore);
    expect(costConsole.summary.primaryRecommendation).toContain(costConsole.summary.highestWasteLane);
  });

  it("renders markdown output", () => {
    const markdown = renderMarkdown(buildConsole(sample));
    expect(markdown).toContain("| Lane | Tier | Governance |");
    expect(markdown).toContain("Marketing attribution warehouse");
  });
});
