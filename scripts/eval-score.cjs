#!/usr/bin/env node
/*
  Simple rule-based evaluator for AgentOps 3.1
  - Reads dataset JSONL and responses JSONL
  - Scores groundedness, citation, task_success (rule-only), tone (placeholder)
*/
const fs = require('fs');
const path = require('path');

function readJsonl(filePath) {
  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function includesAny(text, substrings) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return substrings.some((s) => lower.includes(String(s).toLowerCase()));
}

function scoreItem(sample, resp) {
  const out = { id: sample.id, scores: {}, notes: [] };
  const answer = resp?.answer || '';
  const citations = Array.isArray(resp?.citations) ? resp.citations : [];
  const tools = Array.isArray(resp?.tools) ? resp.tools : [];
  const guard = resp?.guardrailDecision;

  // Groundedness: require that at least one required_citations domain/path appears in citations OR answer
  const required = sample.required_citations || [];
  const hasCite = required.length === 0 || required.some((r) => {
    return citations.some((c) => String(c).includes(r)) || String(answer).includes(r);
  });
  out.scores.groundedness = hasCite ? 1 : 0;
  if (!hasCite) out.notes.push('missing_required_citation');

  // Citation: if citations exist and overlap with required, give 1 else 0.5 if any citation, else 0
  let citationScore = 0;
  if (citations.length > 0) {
    const overlap = required.some((r) => citations.some((c) => String(c).includes(r)));
    citationScore = overlap ? 1 : 0.5;
  } else {
    citationScore = 0;
  }
  out.scores.citation = citationScore;

  // Task success: simple heuristic using ground_truth keywords must appear in answer
  const truths = sample.ground_truth || [];
  const truthHits = truths.filter((t) => includesAny(answer, [t])).length;
  out.scores.task_success = truths.length ? truthHits / truths.length : 0.5;
  if (out.scores.task_success < 1) out.notes.push('missing_ground_truth_points');

  // Tools expectation
  const expectedTools = sample.expected_tools || [];
  const toolHit = expectedTools.every((et) => tools.includes(et));
  out.scores.tool_selection = expectedTools.length ? (toolHit ? 1 : 0) : 1;
  if (!toolHit && expectedTools.length) out.notes.push('wrong_or_missing_tools');

  // Guardrail expectation
  if (sample.guardrail_expectation) {
    out.scores.guardrail = guard === sample.guardrail_expectation ? 1 : 0;
    if (out.scores.guardrail === 0) out.notes.push('guardrail_mismatch');
  } else {
    out.scores.guardrail = 1;
  }

  // Aggregate
  const rubric = sample.judge_rubric || { groundedness: 0.35, citation: 0.2, task_success: 0.35, tone: 0.1 };
  const tone = typeof resp?.toneScore === 'number' ? resp.toneScore : 0.8; // placeholder
  out.scores.tone = tone;
  const agg = (out.scores.groundedness * rubric.groundedness) + (out.scores.citation * rubric.citation) + (out.scores.task_success * rubric.task_success) + (tone * (rubric.tone || 0));
  out.aggregate = Number(agg.toFixed(3));

  return out;
}

function main() {
  const args = process.argv.slice(2);
  const datasetPath = args[0] || path.join(process.cwd(), 'docs/agents/eval/dataset-template.jsonl');
  const responsesPath = args[1] || path.join(process.cwd(), 'docs/agents/eval/sample-responses.jsonl');

  if (!fs.existsSync(datasetPath)) {
    console.error('Dataset not found:', datasetPath);
    process.exit(1);
  }
  if (!fs.existsSync(responsesPath)) {
    console.error('Responses not found:', responsesPath);
    process.exit(1);
  }

  const dataset = readJsonl(datasetPath);
  const responses = readJsonl(responsesPath);
  const respMap = new Map(responses.map((r) => [r.id, r]));

  const results = dataset.map((s) => scoreItem(s, respMap.get(s.id)));

  // Summary
  const avg = (arr) => (arr.reduce((a, b) => a + b, 0) / (arr.length || 1));
  const groundedness = avg(results.map((r) => r.scores.groundedness));
  const citation = avg(results.map((r) => r.scores.citation));
  const taskSuccess = avg(results.map((r) => r.scores.task_success));
  const aggregate = avg(results.map((r) => r.aggregate));

  const summary = { groundedness: Number(groundedness.toFixed(3)), citation: Number(citation.toFixed(3)), task_success: Number(taskSuccess.toFixed(3)), aggregate: Number(aggregate.toFixed(3)), count: results.length };

  console.log(JSON.stringify({ summary, results }, null, 2));
}

main();
