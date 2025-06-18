import { NextRequest, NextResponse } from "next/server";
import { addUser, getUsers } from "@/storage/user";
import { userSchema } from "@/models/user";

export async function GET(request: NextRequest) {
  const getUsersResult = await getUsers();
  return getUsersResult.match<NextResponse>(
    (users) => NextResponse.json({ users }),
    (error) => {
      console.error('Failed to get users:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  );
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const result = userSchema.safeParse(body);
    if (!result.success) {
        return NextResponse.json({ error: result.error.message }, { status: 400 });
    }
    const user = result.data;
    const addUserResult = await addUser(user);
    return addUserResult.match<NextResponse>(
        () => NextResponse.json({}, { status: 201 }),
        (error) => {
            console.error('Failed to add user:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    );
}