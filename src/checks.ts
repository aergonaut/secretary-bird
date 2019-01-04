import { Context } from "probot";
import { ChecksCreateParams } from "@octokit/rest";

type Config = {
  pull_request_title: {
    pattern: string;
    failure_message?: string;
    success_message?: string;
  };
  commit_message: {
    pattern: string;
    failure_message?: string;
    success_message?: string;
  };
};

export async function run_checks(context: Context) {
  const config = await context.config<Config>("secretary-bird.yml", {
    pull_request_title: {
      pattern: ".*"
    },
    commit_message: {
      pattern: ".*"
    }
  });

  Promise.all([check_title(context, config), check_commits(context, config)]);
}

async function check_title(context: Context, config: Config) {
  context.log("checking title...");
  const started_at = new Date();

  const pr = context.payload.pull_request;
  let title: string = pr.title;
  const pull_request_title_regex = new RegExp(
    config.pull_request_title.pattern
  );

  let title_passes_check = pull_request_title_regex.test(title);
  let data: ChecksCreateParams;

  if (!title_passes_check) {
    let summary = [];
    summary.push(
      "The Pull Request title does not match the repository's configured PR title format."
    );
    summary.push(
      `The required format is: \`${pull_request_title_regex}\`. Your title was "${title}".`
    );
    let failure_message = config.pull_request_title.failure_message;
    if (failure_message) {
      summary.push(failure_message);
    }

    data = {
      owner: context.repo().owner,
      repo: context.repo().repo,
      name: "title-format",
      head_sha: pr.head.sha,
      status: "completed",
      conclusion: "action_required",
      started_at: started_at.toISOString(),
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
      name: "title-format",
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

type CommitInfo = {
  sha: string;
  commit: {
    message: string;
  };
};

async function check_commits(context: Context, config: Config) {
  context.log("checking commits...");
  const started_at = new Date();

  const pr = context.payload.pull_request;

  const compare = await context.github.repos.compareCommits(
    context.repo({
      base: pr.base.sha,
      head: pr.head.sha
    })
  );
  const commits: [CommitInfo] = compare.data.commits;

  const commit_message_regex = new RegExp(config.commit_message.pattern);
  const pattern_failed_commits = commits.filter(
    (commit) => !commit_message_regex.test(commit.commit.message)
  );

  let data: ChecksCreateParams;
  if (pattern_failed_commits.length) {
    let summary: string[] = [];
    summary.push(
      "One or more commits in this Pull Request do not follow the repository's configured commit message format.\n"
    );
    summary.push(
      `The required format is: \`${commit_message_regex}\`. These commits had messages that did not follow the format:\n`
    );
    pattern_failed_commits.forEach((commit) => {
      summary.push(`- \`${commit.sha}\` ${commit.commit.message}`);
    });

    data = {
      owner: context.repo().owner,
      repo: context.repo().repo,
      name: "commit-msg",
      head_sha: pr.head.sha,
      status: "completed",
      conclusion: "action_required",
      started_at: started_at.toISOString(),
      completed_at: new Date().toISOString(),
      output: {
        title: "Commit Messages",
        summary: summary.join("\n")
      }
    };
  } else {
    let summary = "All good!\n\n";

    data = {
      owner: context.repo().owner,
      repo: context.repo().repo,
      name: "commit-msg",
      head_sha: pr.head.sha,
      status: "completed",
      conclusion: "success",
      started_at: started_at.toISOString(),
      completed_at: new Date().toISOString(),
      output: {
        title: "Commit Messages",
        summary
      }
    };
  }

  context.github.checks.create(data);
}
