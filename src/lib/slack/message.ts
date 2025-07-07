import { PurpleBlock } from "@slack/web-api/dist/response/ConversationsHistoryResponse"

// To scan the message content effectively,
// slack bot should obey the folling message structure
export type SlackMessageBlocks = [
    {
        type: 'section',
        fields: [
            {
                type: 'mrkdwn',
                text: string
            },
            {
                type: 'mrkdwn',
                text: string
            }
        ]
    },
    {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: string
        }
    }
]

export const extractMainContent = (blocks: PurpleBlock[]): string[] => {
    return blocks.map((block) => {
        if (block.type === "section") {
            return block.text?.text
        }
    }).filter((text): text is string => text !== undefined)
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
    }
}): SlackMessageBlocks => {
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
        }
    ]
}