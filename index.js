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

    core.info(`ℹ️  Repository dispatch event type: "${eventType}"`);
    core.debug(
      `ℹ️  event client payload: ${inspect(eventPayload, { depth: Infinity })}`
    );

    await app.eachRepository(async ({ octokit, repository }) => {
      const owner = repository.owner.login;
      const repoUrl = repository.private
        ? `${owner}/[private]`
        : repository.html_url;

      core.debug(`ℹ️  Dispatching event for ${repoUrl} (id: ${repository.id})`);
      try {
        await octokit.request("POST /repos/{owner}/{repo}/dispatches", {
          owner,
          repo: repository.name,
          event_type: eventType,
          client_payload: eventPayload,
        });

        core.info(
          `✅  Event dispatched successfully for ${repoUrl} (id: ${repository.id})`
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
