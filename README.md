# Stewpid Bot

A simple Personal General Bot that can run on multiple server, play games, manage message, etc...

Built with [discord.js](https://discord.js.org) v14.

## Features

- **General:** `/help`, `/ping`, `/uptime`, `/server`, `/invite`, `/coinflip`
- **Games:** `/2048`, `/connect`, `/findfruit`, `/flood`, `/matchfruit`, `/mine`, `/pokemon`, `/rps`, `/ttt`, `/trivia`
- **Admin:** `/ban`, `/unban`, `/kick`, `/clear`, `/embed`, `/editembed`, `/editmessage`, `/addreaction`, `/restart`, `/test-in`, `/test-out`
- **Text commands:** `~say` (bot owner only), `~announce` (posts to the news channel)
- **Automatic:** welcome image and role for new members, leave messages in the logs channel, anti-spam, reaction roles, auto-delete in the request channel

## Requirements

- Node.js 20.9 or newer
- A Discord application with a bot user ([Developer Portal](https://discord.com/developers/applications))
  - Under **Bot → Privileged Gateway Intents**, enable **Server Members Intent** and **Message Content Intent**

## Setup

1. Install dependencies:
   ```sh
   npm ci
   ```
2. Copy `.env-sample` to `.env` and fill it in (see [Configuration](#configuration)).
3. Optional: copy `react-config-sample.js` to `react-config.js` and set your reaction roles. Without it, reaction roles are disabled.
4. Register the slash commands with Discord:
   ```sh
   npm run deploy
   ```
   Run this again whenever you add a command or change a command's options. `npm run delete-commands` removes them all.
5. Start the bot:
   ```sh
   npm start
   ```

## Configuration

| Key | Description |
|---|---|
| `token` | Bot token |
| `clientId` | Application ID, used by `npm run deploy` |
| `prefix` | Prefix for text commands (default `~`) |
| `botOwnerId` | Your user ID, allowed to use `~say` |
| `testAccount` | Optional user ID that is skipped by the welcome message |
| `mongoUrl` | Not used yet (reserved for leveling) |
| `logsChannel` | Channel name for moderation logs and leave messages |
| `welcomeChannel` | Channel name for welcome images (created automatically if missing) |
| `commandChannel` | Channel name where games and `/help` are allowed |
| `requestChannel` | Channel name where messages are deleted after 60 seconds |
| `newsChannel` | Channel name used by `~announce` |
| `newMemberRole` | Role name given to new members (created automatically if missing) |

### Channels

The bot finds channels **by name**, so the same `.env` works on every server. On each server, create text channels with the names above (defaults: `#logs`, `#welcome`, `#bot-commands`, `#request`, `#news-and-updates`). Any of them can be left out. The bot skips that feature on that server, and games work in any channel when there is no `#bot-commands`.

### Bot permissions

Invite the bot with these permissions: Manage Roles, Manage Channels, Manage Messages, Kick Members, Ban Members, Moderate Members, Create Instant Invite, View Channels, Send Messages, Embed Links, Attach Files, Read Message History and Add Reactions.

The bot's role must be above the roles it assigns (`newMemberRole` and the reaction roles).

## Running with pm2

`/restart` and the connection watchdog exit the process and rely on a process manager to start it again.

```sh
npx pm2 start index.js --name stewpidbot
npx pm2 save
```

## Development

```sh
npm run lint
```

Lint also runs on every pull request. Commit messages follow [Conventional Commits](https://www.conventionalcommits.org), which release-please uses to version releases and write the changelog.

## License

[Apache-2.0](LICENSE)
