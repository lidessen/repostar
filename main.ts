import ora from "ora";
import { fetchStarredRepos, Repo } from "./github.ts";
import { repoTags } from "./openai.ts";

const allRepos: Repo[] = [];
const allTags: Record<string, string[]> = {};

const spinner = ora("Fetching starred repos").start();

for await (const repos of fetchStarredRepos()) {
  spinner.text = "Generating tags for repos";
  const tags = await repoTags(repos.map(repoData));
  spinner.text = "Generated tags for repos";
  try {
    if (tags) {
      const parsed = JSON.parse(tags);
      for (const key in parsed) {
        allTags[key] = parsed[key];
      }
    }
  } catch {
    console.error("Failed to parse tags");
  }

  for (const repo of repos) {
    allRepos.push(repo);
  }
  spinner.text = `Fetched ${allRepos.length} starred repos`;
}

spinner.succeed(`Fetched ${allRepos.length} starred repos`);

await Deno.mkdir("outputs", { recursive: true });
await Deno.writeTextFile(
  "outputs/starred-repos.json",
  JSON.stringify(allRepos.map(repoData), null, 2),
);

console.log("Update starred-repos.json");

function repoData(repo: Repo) {
  return {
    name: repo.full_name,
    description: repo.description,
    url: repo.html_url,
    language: repo.language,
    stars: repo.stargazers_count,
    tags: allTags[repo.full_name] || [],
  };
}
