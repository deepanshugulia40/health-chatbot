/**
 * Try retrieval from the command line:  npm run rag:query -- "dengue symptoms"
 * Needs OPENAI_API_KEY, MONGODB_URI (Atlas), the vector index, and at least
 * one verified document.
 */
import mongoose from "mongoose";
import { retrieveChunks } from "../src/lib/rag/retrieve";

async function main() {
  const query = process.argv.slice(2).join(" ").trim();
  if (!query) throw new Error('Usage: npm run rag:query -- "your question"');

  const results = await retrieveChunks(query, { topK: 5, minScore: 0 });
  if (results.length === 0) console.log("No results. Is a document verified and the index ready?");
  for (const [i, r] of results.entries()) {
    console.log(`\n#${i + 1}  score ${r.score.toFixed(3)}  [${r.sourceName}]  ${r.sourceUrl}`);
    console.log(r.text.slice(0, 300).replace(/\s+/g, " ") + (r.text.length > 300 ? "…" : ""));
  }
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err instanceof Error ? err.message : err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
