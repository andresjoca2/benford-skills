import type { ProposalQueue } from "@/router-engine"
import type { QueueAutomationRule } from "./types"

export const AUTOMATION_RULES: Record<ProposalQueue, QueueAutomationRule> = {
  "01 Draft": {
    queue: "01 Draft",
    action: "route_draft",
    description: "Evaluate draft PROP with the deterministic Router Engine.",
    skillName: "benford-router-engine",
    writePolicy: "safe_auto",
  },
  "02 Needs Human Decision": {
    queue: "02 Needs Human Decision",
    action: "wait_for_human",
    description:
      "Wait for a human decision before any canonical work continues.",
    writePolicy: "manual_only",
  },
  "03 Approved for Editor": {
    queue: "03 Approved for Editor",
    action: "invoke_skill",
    description:
      "Invoke the canonical editor skill once it exists, then move the PROP to Applied.",
    skillName: "benford-canonical-editor",
    writePolicy: "manual_only",
  },
  "04 Applied": {
    queue: "04 Applied",
    action: "no_op",
    description: "Terminal queue. No automatic action.",
    writePolicy: "none",
  },
  "05 Rejected": {
    queue: "05 Rejected",
    action: "no_op",
    description: "Terminal queue. No automatic action.",
    writePolicy: "none",
  },
}

export const AUTOMATION_QUEUE_ORDER: readonly ProposalQueue[] = [
  "01 Draft",
  "02 Needs Human Decision",
  "03 Approved for Editor",
  "04 Applied",
  "05 Rejected",
]
