# Slack Bolt Cronjob

A Next.js application with Vercel cronjob integration to automatically post messages to Slack channels.

## Features

- Automated Slack messaging via Vercel cronjobs
- Secure API endpoint with authentication
- Rich message formatting with Slack blocks
- Error handling and logging

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Slack Configuration
SLACK_BOT_TOKEN=xoxb-your-bot-token-here

# Vercel Cron Security
CRON_SECRET=your-secure-random-string-here
```

### 3. Slack Bot Setup

1. Go to [Slack API Apps](https://api.slack.com/apps)
2. Create a new app or use an existing one
3. Add the following bot token scopes:
   - `chat:write` - To post messages
   - `chat:write.public` - To post to public channels
4. Install the app to your workspace
5. Copy the Bot User OAuth Token (starts with `xoxb-`)
6. Invite the bot to the channel where you want to post messages
7. Get the channel ID (right-click the channel → Copy link → extract the ID)

### 4. Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add the environment variables in Vercel dashboard
4. Deploy the application

### 5. Configure Cron Schedule

The cronjob is configured to run daily at 9 AM UTC. You can modify the schedule in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "0 9 * * *"
    }
  ]
}
```

Cron schedule format: `minute hour day month day-of-week`

## API Endpoint

The cronjob calls the `/api/cron` endpoint, which:

- Verifies the request is from Vercel Cron using the `CRON_SECRET`
- Posts a formatted message to the specified Slack channel
- Returns success/error status

## Customization

You can customize the message content by modifying the `message` object in `src/app/api/cron/route.ts`. The current implementation includes:

- A header with emoji
- Current timestamp
- Status indicator

## Development

```bash
npm run dev
```

The application will be available at `http://localhost:3000`
On deployment, graphql api routing should be deployed the first time. because Nextjs executes pre-rendering. So Apollo client should `force-cache` the data of initial fetch.

## Testing

You can test the cron endpoint manually by making a GET request to `/api/cron` with the proper authorization header:

```bash
curl -H "Authorization: Bearer your-cron-secret" https://your-app.vercel.app/api/cron
```

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
