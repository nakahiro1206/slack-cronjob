// import { NextRequest, NextResponse } from 'next/server';
// import { WebClient } from '@slack/web-api';
// import { updateMessage } from '@/lib/slack/update';

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { channelId, timestamp, text, blocks } = body;

//     // Validate required fields
//     if (!channelId || !timestamp || (!text && !blocks)) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           error: 'Missing required fields: channelId, timestamp, and either text or blocks' 
//         },
//         { status: 400 }
//       );
//     }

//     // Initialize Slack client
//     const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

//     // Update the message
//     const result = await updateMessage(slack, {
//       channelId,
//       timestamp,
//       text: text || '',
//       blocks,
//     });

//     if (result.success) {
//       return NextResponse.json(result);
//     } else {
//       return NextResponse.json(result, { status: 400 });
//     }
//   } catch (error) {
//     console.error('Error updating message:', error);
//     return NextResponse.json(
//       { 
//         success: false, 
//         error: error instanceof Error ? error.message : 'Unknown error occurred' 
//       },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const channelId = searchParams.get('channelId');
//     const timestamp = searchParams.get('timestamp');

//     // Validate required fields
//     if (!channelId || !timestamp) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           error: 'Missing required query parameters: channelId and timestamp' 
//         },
//         { status: 400 }
//       );
//     }

//     // Initialize Slack client
//     const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

//     // Delete the message
//     const result = await slack.chat.delete({
//       channel: channelId,
//       ts: timestamp,
//     });

//     if (result.ok) {
//       return NextResponse.json({ 
//         success: true, 
//         message: 'Message deleted successfully' 
//       });
//     } else {
//       return NextResponse.json(
//         { 
//           success: false, 
//           error: result.error || 'Failed to delete message' 
//         },
//         { status: 400 }
//       );
//     }
//   } catch (error) {
//     console.error('Error deleting message:', error);
//     return NextResponse.json(
//       { 
//         success: false, 
//         error: error instanceof Error ? error.message : 'Unknown error occurred' 
//       },
//       { status: 500 }
//     );
//   }
// } 