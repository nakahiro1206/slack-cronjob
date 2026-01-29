import type { UserTagsAssignment } from "@/server/domain/entities";

export const decorateUserTagIfNeeded = (tag: string): string => {
	const regex = /<@[\w\d]+>/g;
	if (tag.match(regex)) {
		return tag;
	} else {
		return `<@${tag}>`;
	}
};

export const formatUserAssignment = (assignment: {
	offline: string[];
	online: string[];
}): UserTagsAssignment => {
	assignment.offline = assignment.offline.map(decorateUserTagIfNeeded);
	assignment.online = assignment.online.map(decorateUserTagIfNeeded);
	return assignment;
};

export const removeBotUserIdTag = (text: string, botUserId: string) => {
	console.log("text", text);
	console.log("botUserId", botUserId);
	return text.replace(`<@${botUserId}>`, "");
};
