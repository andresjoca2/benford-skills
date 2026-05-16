import {
  claimNextOpenClawJob,
  completeOpenClawJob,
  failOpenClawJob,
  recordOpenClawRequested,
  recordOpenClawResponded,
  setupDatabase,
} from "./src/server/db.ts"
import { loadBackofficeEnv } from "./src/server/env.ts"
import { runOpenClawJob } from "./src/server/openclaw-adapter.ts"

loadBackofficeEnv()
const pollMs = Number(Bun.env.BENFORD_BACKOFFICE_WORKER_POLL_MS ?? 3000)
const once = Bun.argv.includes("--once")

setupDatabase()

async function processOneJob() {
  const job = claimNextOpenClawJob()
  if (!job) return false

  console.log(`[backoffice-worker] claimed ${job.id} ${job.skill}`)
  try {
    recordOpenClawRequested(job)
    const result = await runOpenClawJob(job)
    recordOpenClawResponded(job, result)
    completeOpenClawJob(job.id, result.output)
    console.log(`[backoffice-worker] completed ${job.id}`)
  } catch (error) {
    failOpenClawJob(job.id, error)
    console.error(`[backoffice-worker] failed ${job.id}: ${error instanceof Error ? error.message : String(error)}`)
  }
  return true
}

async function main() {
  if (once) {
    const processed = await processOneJob()
    if (!processed) console.log("[backoffice-worker] no queued jobs")
    return
  }

  console.log(`[backoffice-worker] polling every ${pollMs}ms`)
  for (;;) {
    await processOneJob()
    await Bun.sleep(pollMs)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
