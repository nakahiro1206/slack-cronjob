import { type NextRequest, NextResponse } from "next/server";
import { notificationService } from "@/server/application/container";

export async function notifyByCronjobPresentation(request: NextRequest) {
	// Verify the request is from Vercel Cron
	const authHeader = request.headers.get("authorization");
	if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const notifyResult = await notificationService.notifyByCronjob();
	if (!notifyResult.success) {
		return NextResponse.json({ error: notifyResult.message }, { status: 500 });
	} else {
		return NextResponse.json(
			{ message: notifyResult.message },
			{ status: 200 },
		);
	}
}
