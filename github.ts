import { load } from "@std/dotenv";
import { Octokit } from "octokit";

const env = await load();

export type Repo = Awaited<
  ReturnType<Octokit["rest"]["activity"]["listReposStarredByAuthenticatedUser"]>
>["data"][number];

export function fetchStarredRepos() {
  const octokit = new Octokit({ auth: env["GITHUB_ACCESS_TOKEN"] });

  const iterator = octokit.paginate.iterator(
    octokit.rest.activity.listReposStarredByAuthenticatedUser,
    {
      per_page: 100,
    },
  );

  return {
    [Symbol.asyncIterator]: async function* () {
      for await (const { data: repos } of iterator) {
        yield repos;
      }
    },
  };
}
