# release-notifier-action

> GitHub Action to notify repositories about the repository's releases using a GitHub App

[![Build Status](https://github.com/gr2m/release-notifier-action/workflows/Test/badge.svg)](https://github.com/gr2m/release-notifier-action/actions)

**Important**: if the release event was created by another GitHub action authenticated with `secrets.GITHUB_TOKEN`, no workflow is triggered for that release event. To workaround that problem, use a personal access token instead of `secrets.GITHUB_TOKEN` to create the `release` event. See [Triggering new workflows using a personal access token](https://docs.github.com/en/free-pro-team@latest/actions/reference/events-that-trigger-workflows#triggering-new-workflows-using-a-personal-access-token).

## Setup

In order to use the action, you have to [register a GitHub app](https://github.com/settings/apps/new).

- `GitHub App name`: set to something like `<Your Project> Release Notifier`
- `Description`: copy/paste most of this repository's [Notifier app](https://github.com/apps/release-notifier-release-notifier). Make sure to replace `release-notifier-release` with `<your-project>-release`
- `Homepage URL`: your repository URL
- `Webhook`: remove the check from `[ ] Active`
- `Repository permissions`: Enable Read & Write access for `Contents`
- `Where can this GitHub App be installed?`: Any account (unless you only want installs for repositories with in your account/organization)

Once you are done, generate & download a private key. In your repository, create to secrets:

1. `APP_ID`: set to your newly registered `App ID`
2. `APP_PRIVATE_KEY`: set to the contents of the downloaded `*.pem` file

## Usage

Notify repositories only when a release was published. The [repository dispatch event type](https://docs.github.com/en/free-pro-team@latest/rest/reference/repos#create-a-repository-dispatch-event) is set to `[current repositories full name] release` (e.g. `gr2m/release-notifier-action release`)

```yml
name: Release Notification
on:
  release:
    types:
      - published

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - uses: gr2m/release-notifier-action@v1
        with:
          app_id: ${{ secrets.APP_ID }}
          private_key: ${{ secrets.APP_PRIVATE_KEY }}
```

If you want to notify repositories for all [release activity types](https://docs.github.com/en/free-pro-team@latest/actions/reference/events-that-trigger-workflows#release), you can do

```yml
name: Release Notification
on: release

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - uses: gr2m/release-notifier-action@v1
        with:
          app_id: ${{ secrets.APP_ID }}
          private_key: ${{ secrets.APP_PRIVATE_KEY }}
```

To customize the repository dispatch event type use the `dispatch_event_type` argument

```yml
name: Release Notification
on:
  release:
    types:
      - published

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - uses: gr2m/release-notifier-action@v1
        with:
          app_id: ${{ secrets.APP_ID }}
          private_key: ${{ secrets.APP_PRIVATE_KEY }}
          dispatch_event_type: my-project-release
```

If your event has **more than 10** top-level properties, you can embed it in a JSON string `{"event_payload":"<payload_as_json_string>"}` to overcome Github api limits.

```yml
name: Release Notification
on:
  release:
    types:
      - published

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - uses: gr2m/release-notifier-action@v1
        with:
          app_id: ${{ secrets.APP_ID }}
          private_key: ${{ secrets.APP_PRIVATE_KEY }}
          dispatch_event_type: my-project-release
          embed: true
```

## How it works

Each time you create, edit, or delete a release on your repository, the action will load all installations using the credentials you provided. For each installation, the action dispatch creates a [repository dispatch event](https://docs.github.com/en/free-pro-team@latest/rest/reference/repos#create-a-repository-dispatch-event) and sets the event type to what you configured in `inputs.dispatchEventType`.

## License

[ISC](LICENSE)
