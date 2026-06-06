import { mkdir, writeFile } from "node:fs/promises";
import { buildConsole } from "../src/index.js";
import sample from "../fixtures/snowflake-cost-sample.json" with { type: "json" };

const costConsole = buildConsole(sample);
const cards = costConsole.lanes
  .map(
    (lane) => `
      <article class="card">
        <div class="top"><span>${lane.tier}</span><strong>${lane.governanceScore}</strong></div>
        <h3>${lane.name}</h3>
        <p>${lane.narrative}</p>
        <dl>
          <div><dt>Warehouse</dt><dd>${lane.warehouse}</dd></div>
          <div><dt>Credits</dt><dd>${lane.monthlyCredits}</dd></div>
          <div><dt>Recoverable</dt><dd>$${lane.remediationValueUsd.toLocaleString()}</dd></div>
          <div><dt>Unused tables</dt><dd>${lane.unusedTableCount}</dd></div>
        </dl>
        <p class="route">${lane.route}</p>
      </article>`
  )
  .join("");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Snowflake Cost Governance Console</title>
  <meta name="description" content="Board-readable Snowflake cost governance for warehouse spend, query waste, owner attribution, budget coverage, and remediation priority." />
  <style>
    :root{color-scheme:dark;--bg:#050914;--panel:#0c1726;--panel2:#101c2e;--text:#f4f1e8;--muted:#aab6c8;--cyan:#28ddf2;--mint:#55f2bc;--blue:#67b7ff;--line:rgba(40,221,242,.24)}
    *{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 12% 0%,rgba(103,183,255,.18),transparent 34rem),radial-gradient(circle at 88% 12%,rgba(85,242,188,.14),transparent 30rem),var(--bg);color:var(--text);font-family:"Segoe UI",system-ui,sans-serif}
    main{width:min(1180px,calc(100vw - 32px));margin:auto;padding:64px 0}.hero{border:1px solid var(--line);border-radius:30px;background:linear-gradient(135deg,rgba(16,28,46,.96),rgba(7,10,21,.95));padding:clamp(28px,5vw,58px);box-shadow:0 30px 90px rgba(0,0,0,.35)}
    .eyebrow{color:var(--blue);letter-spacing:.18em;text-transform:uppercase;font:800 12px/1 ui-monospace,SFMono-Regular,Consolas,monospace}h1{max-width:1000px;margin:18px 0;font-size:clamp(44px,8vw,104px);line-height:.91;letter-spacing:-.06em}.lede{max-width:820px;color:var(--muted);font-size:clamp(18px,2.2vw,24px);line-height:1.55}
    .metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:34px}.metric{border:1px solid rgba(255,255,255,.09);border-radius:18px;background:rgba(255,255,255,.04);padding:20px}.metric strong{display:block;font-size:34px}.metric span{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.12em}
    .section{margin-top:28px;border:1px solid var(--line);border-radius:28px;background:rgba(12,23,38,.78);padding:clamp(22px,3vw,34px)}h2{margin:0 0 18px;font-size:clamp(30px,4vw,54px);line-height:1;letter-spacing:-.04em}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
    .card{border:1px solid rgba(255,255,255,.1);border-radius:22px;background:var(--panel2);padding:22px}.top{display:flex;justify-content:space-between;color:var(--cyan);font:800 12px/1 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.14em}.top strong{color:var(--mint);font-size:30px;letter-spacing:0}h3{margin:16px 0 10px;font-size:25px;line-height:1.08}p{color:var(--muted);line-height:1.55}
    dl{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}dt{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.1em}dd{margin:4px 0 0;font-weight:800}.route{color:var(--text);border-top:1px solid rgba(255,255,255,.08);padding-top:14px}footer{color:var(--muted);padding-top:24px;font-size:14px}@media(max-width:760px){main{padding:28px 0}.metrics,.grid{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <div class="eyebrow">Snowflake FinOps trust</div>
      <h1>Credit burn should have an owner before it becomes margin drag.</h1>
      <p class="lede">Snowflake Cost Governance Console turns warehouse spend, query efficiency, idle controls, budget coverage, tags, anomalies, and unused tables into one remediation sequence.</p>
      <div class="metrics">
        <div class="metric"><strong>${costConsole.summary.laneCount}</strong><span>Cost lanes</span></div>
        <div class="metric"><strong>${costConsole.summary.meanGovernanceScore}</strong><span>Mean governance</span></div>
        <div class="metric"><strong>${costConsole.summary.controlledCount}</strong><span>Controlled</span></div>
        <div class="metric"><strong>$${costConsole.summary.totalRemediationValueUsd.toLocaleString()}</strong><span>Recoverable</span></div>
      </div>
    </section>
    <section class="section">
      <h2>Warehouse governance register</h2>
      <p><strong>Primary recommendation:</strong> ${costConsole.summary.primaryRecommendation}</p>
      <div class="grid">${cards}</div>
    </section>
    <footer>Snowflake Cost Governance Console · synthetic proof surface · no production warehouse data</footer>
  </main>
</body>
</html>`;

await mkdir("site", { recursive: true });
await writeFile("site/index.html", html);
