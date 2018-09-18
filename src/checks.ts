import { Context } from "probot";
import { ChecksCreateParams } from "@octokit/rest";

type Config = {
  pull_request_title_regex: string;
  commit_title_regex: string;
};

export async function run_checks(context: Context) {
  const config = await context.config("secretary-bird.yml", {
    pull_request_title_regex: "^(CD|JZ)-\\d+\\s+.+",
    commit_title_regex: ".*"
  });

  check_title(context, config);
}

async function check_title(context: Context, config: Config) {
  context.log("checking title...");
  const pr = context.payload.pull_request;
  let title: string = pr.title;
  let pull_request_title_regex = new RegExp(config.pull_request_title_regex);

  let title_passes_check = pull_request_title_regex.test(title);
  let data: ChecksCreateParams;

  if (!title_passes_check) {
    let summary = [];
    summary.push(
      "The Pull Request title does not match the repository's configured PR title format."
    );
    summary.push(
      `The required format is: \`${pull_request_title_regex}\`. Your title was "${title}"`
    );

    data = {
      owner: context.repo().owner,
      repo: context.repo().repo,
      name: "Title Format",
      head_sha: pr.head.sha,
      status: "completed",
      conclusion: "action_required",
      completed_at: new Date().toISOString(),
      output: {
        title: "Title format",
        summary: summary.join("\n\n")
      }
    };
  } else {
    let summary = [];
    summary.push("All good!");

    data = {
      owner: context.repo().owner,
      repo: context.repo().repo,
      name: "Title Format",
      head_sha: pr.head.sha,
      status: "completed",
      conclusion: "success",
      completed_at: new Date().toISOString(),
      output: {
        title: "Title format",
        summary: summary.join("\n\n")
      }
    };
  }

  context.github.checks.create(data);
}
