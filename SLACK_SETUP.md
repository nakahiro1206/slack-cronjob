# Slack Bolt Setup Guide

## Overview

This project now has a working Slack Bolt integration that handles events at `/api/slack/events`.

## What was fixed

1. **Route Structure**: Created a proper route at `/api/slack/events` to match what Slack expects
2. **Request Handling**: Implemented proper request signature verification and event handling
3. **Error Handling**: Added proper error handling for unauthorized requests

## Environment Variables Required

Make sure you have these environment variables set in your `.env.local` file:

```env
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
```

## Slack App Configuration

In your Slack app settings, make sure to:

1. **Event Subscriptions**: Set the Request URL to `https://your-domain.com/api/slack/events`
2. **Interactivity & Shortcuts**: Set the Request URL to `https://your-domain.com/api/slack/events`
3. **Slash Commands**: Make sure your `/hello` command is configured

## Current Features

- **Message Events**: Responds to messages with "Hello world!" or echoes the message text
- **Slash Commands**: Responds to `/hello` command with a greeting
- **URL Verification**: Handles Slack's URL verification challenge
- **Signature Verification**: Properly verifies request signatures for security

## Testing

1. Start your development server: `npm run dev`
2. Use ngrok to expose your local server: `npm run ngrok`
3. Update your Slack app's Request URLs to use the ngrok URL
4. Test by sending a message or using the `/hello` command

## Next Steps

- Implement more sophisticated event handling in the POST route
- Add more slash commands
- Integrate with your existing tRPC and Firebase setup
- Add proper logging and monitoring

## Files Modified

- `src/app/api/slack/events/route.ts` - New route handler
- `src/lib/slack/app.ts` - Simplified app configuration
