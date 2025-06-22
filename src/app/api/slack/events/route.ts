import { receiver } from "@/lib/slack/app";

const handler = receiver.requestListener;

export { handler as GET, handler as POST }

// import { NextRequest, NextResponse } from "next/server";
// import { App } from "@slack/bolt";

// // Create a simple app instance for handling events
// const app = new App({
//     token: process.env.SLACK_BOT_TOKEN,
//     signingSecret: process.env.SLACK_SIGNING_SECRET,
//     ignoreSelf: true,
// });

// // Set up event handlers
// app.event('message', async ({ event, say }) => {
//     const text = (event as any).text;
//     await say({
//         text: text || 'Hello world!',
//     });
// });

// app.command('/hello', async ({ command, ack, say }) => {
//     await ack();
//     await say(`Hello <@${command.user_id}>!`);
// });

// export async function GET(request: NextRequest) {
//     console.log('GET request to /api/slack/events');
//     return new NextResponse('OK', { status: 200 });
// }

// export async function POST(request: NextRequest) {
//     console.log('POST request to /api/slack/events');
    
//     try {
//         const body = await request.text();
//         const headers: Record<string, string> = {};
//         request.headers.forEach((value, key) => {
//             headers[key] = value;
//         });

//         // Verify the request signature
//         const crypto = require('crypto');
//         const timestamp = headers['x-slack-request-timestamp'];
//         const signature = headers['x-slack-signature'];
        
//         if (!timestamp || !signature) {
//             return new NextResponse('Unauthorized', { status: 401 });
//         }

//         const sigBasestring = `v0:${timestamp}:${body}`;
//         const expectedSignature = 'v0=' + crypto
//             .createHmac('sha256', process.env.SLACK_SIGNING_SECRET || '')
//             .update(sigBasestring)
//             .digest('hex');

//         if (signature !== expectedSignature) {
//             return new NextResponse('Unauthorized', { status: 401 });
//         }

//         // Parse the request body
//         const payload = JSON.parse(body);
        
//         // Handle different types of requests
//         if (payload.type === 'url_verification') {
//             return new NextResponse(payload.challenge, { status: 200 });
//         }

//         if (payload.type === 'event_callback') {
//             // Handle events by calling the appropriate event handler
//             const eventType = payload.event.type;
//             console.log('Received event:', eventType, payload.event);
            
//             // For now, just log the event and return success
//             // You can implement more sophisticated event handling here
//         }

//         return new NextResponse('OK', { status: 200 });
//     } catch (error) {
//         console.error('Error handling Slack request:', error);
//         return new NextResponse('Internal Server Error', { status: 500 });
//     }
// }