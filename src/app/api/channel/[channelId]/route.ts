import { registerUser } from "@/storage/channel";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

// export async function GET(
//     request: NextRequest, 
//     { params }: { params: Promise<{ channelId: string }> }
// ) {
//     const { channelId } = await params;
//     const getChannelResult = await getChannel(channelId);
//     return getChannelResult.match<NextResponse>(
//         (channel) => NextResponse.json({ channel }),
//         (error) => {
//         console.error('Failed to get channel:', error);
//         return NextResponse.json({ error: error.message }, { status: 500 });
//         }
//     );
// }

export const registerUserRequestSchema = z.object({
    userId: z.string(),
});
export async function POST(request: NextRequest, { params }: { params: Promise<{ channelId: string }> }) {
    const { channelId } = await params;
    const body = await request.json();
    const result = registerUserRequestSchema.safeParse(body);
    if (!result.success) {
        return NextResponse.json({ error: result.error.message }, { status: 400 });
    }
    const { userId } = result.data;
    const registerUserResult = await registerUser(channelId, userId);
    return registerUserResult.match<NextResponse>(
        () => NextResponse.json({}, { status: 201 }),
        (error) => {
            console.error('Failed to register user:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    );
}