import { PurpleBlock } from "@slack/web-api/dist/response/ConversationsHistoryResponse"
import {z} from "zod"
// To scan the message content effectively,
// slack bot should obey the folling message structure
export const SlackNotificationSchema = z.tuple([
    z.object({
      type: z.literal('section'),
      fields: z.tuple([
        // date block
        z.object({
          type: z.literal('mrkdwn'),
          text: z.string(),
        }),
        // time block
        z.object({
          type: z.literal('mrkdwn'),
          text: z.string(),
        }),
      ]),
    }),
    // main content block
    z.object({
      type: z.literal('section'),
      text: z.object({
        type: z.literal('mrkdwn'),
        text: z.string(),
      }),
    }),
    // help block
    z.object({
        type: z.literal('section'),
        text: z.object({
            type: z.literal('mrkdwn'),
            text: z.string(),
        }),
    })
]);

export type SlackNotification = z.infer<typeof SlackNotificationSchema>;

export const extractMainContent = (blocks: PurpleBlock[]): string => {
    const result = SlackNotificationSchema.safeParse(blocks)
    if (!result.success) {
        // if malformed, return the text of the blocks
        return blocks.map((block) => {
            if (block.type === "section") {
                return block.text?.text
            }
        }).filter((text): text is string => text !== undefined).join("\n")
    }
    return result.data[1].text.text
}

export const extractTopLeftContent = (blocks: PurpleBlock[]): string => {
    const result = SlackNotificationSchema.safeParse(blocks)
    if (result.success) {
        return result.data[0].fields[0].text
    }
    return ""
}

export const extractTextFromBlocks = (blocks: PurpleBlock[]): string[] => {
    return blocks.map((block) => { 
        return block.text?.text
    }).filter((text): text is string => text !== undefined)
}

export const createSlackMessageBlocks = (props: {
    mainContent: string,
    top: {
        left: string,
        right: string
    },
    bottomContent: string
}): SlackNotification => {
    return [
        {
            type: 'section',
            fields: [
                {
                    type: 'mrkdwn',
                    text: props.top.left
                },
                {
                    type: 'mrkdwn',
                    text: props.top.right
                }
            ]
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: props.mainContent
            }
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: props.bottomContent
            }
        }
    ]
}