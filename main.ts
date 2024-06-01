import { load } from "@std/dotenv";
import { Octokit } from "octokit";
import ora from "ora";

const env = await load();

const octokit = new Octokit({ auth: env["GITHUB_ACCESS_TOKEN"] });

const iterator = octokit.paginate.iterator(
  octokit.rest.activity.listReposStarredByAuthenticatedUser,
  {
    per_page: 100,
  },
);

type Repo = Awaited<
  ReturnType<typeof octokit.rest.activity.listReposStarredByAuthenticatedUser>
>["data"][number];

const allRepos: Repo[] = [];

const spinner = ora("Fetching starred repos").start();

for await (const { data: repos } of iterator) {
  for (const repo of repos) {
    allRepos.push(repo);
  }
  spinner.text = `Fetched ${allRepos.length} starred repos`;
}

spinner.succeed(`Fetched ${allRepos.length} starred repos`);

function mapRepo(repo: Repo) {
  return {
    name: repo.full_name,
    description: repo.description,
    url: repo.html_url,
    language: repo.language,
    stars: repo.stargazers_count,
  };
}

await Deno.writeTextFile(
  "outputs/starred-repos.json",
  JSON.stringify(allRepos.map(mapRepo), null, 2),
);

console.log("Update starred-repos.json");
