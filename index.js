const { inspect } = require("util");

const core = require("@actions/core");
const { App } = require("@octokit/app");

const eventPayload = require(process.env.TEST_GITHUB_EVENT_PATH ||
  process.env.GITHUB_EVENT_PATH);

main();

async function main() {
  try {
    const app = new App({
      appId: +core.getInput("app_id"),
      privateKey: core.getInput("private_key"),
    });
    const eventType =
      core.getInput("dispatch_event_type") ||
      `${process.env.GITHUB_REPOSITORY.toLowerCase()} release`;

    await app.eachRepository(async ({ octokit, repository }) => {
      const owner = repository.owner.login;
      if (repository.private) {
        core.debug(`ℹ️  Dispatching event for ${owner}/[private repository]`);
      } else {
        core.debug(`ℹ️  Dispatching event for ${repository.html_url} ...`);
      }
      try {
        await octokit.request("POST /repos/{owner}/{repo}/dispatches", {
          owner,
          repo: repository.name,
          event_type: eventType,
          client_payload: eventPayload,
        });
        core.info(
          `✅  Event dispatched successfully for ${repository.html_url}`
        );
      } catch (error) {
        core.warning(
          `⚠️  Dispatch error: ${inspect(error, { depth: Infinity })}`
        );
      }
    });
  } catch (error) {
    core.debug(inspect(error, { depth: Infinity }));
    core.setFailed(error.message);
  }
}
