import { runAdversarialTestSuite } from "../src/app/lib/aiService/__tests__/adversarialPipeline.test.js";

async function main() {
  console.log("🚀 Starting Pax26 Adversarial Pipeline Test Suite Execution...\n");
  const { passedCount, failedCount } = await runAdversarialTestSuite();
  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main();
