### app_mentions:read

(required. If you just want to allow bot read message with @mension, you don't need to add `channels:history`)

> View messages that directly mention @1on1-order-generator in conversations that the app is in

### assistant:write

(I'm not sure what is assistant)

> Allow 1on1-order-generator to act as an App Agent

### channels:history

(required to read user's message posted in thread)

> View messages and other content in public channels that 1on1-order-generator has been added to

### chat:write

(required)

> Send messages as @1on1-order-generator

chat:write.public
Send messages to channels @1on1-order-generator isn't a member of

### im:history

(required for DM with bot)

> View messages and other content in direct messages that 1on1-order-generator has been added to

### im:read

(required for DM with bot)

> View basic information about direct messages that 1on1-order-generator has been added to

### im:write

(required for DM with bot)

> Start direct messages with people

### incoming-webhook

(no need maybe)

> Post messages to specific channels in Slack
