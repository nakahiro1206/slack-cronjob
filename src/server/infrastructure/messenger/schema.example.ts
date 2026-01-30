const _exampleMessages = [
	{
		user: "U0927N91N0K",
		type: "message",
		ts: "1769679450.192129",
		edited: {
			user: "B0927N91F3M",
			ts: "1769679452.000000",
		},
		bot_id: "B0927N91F3M",
		app_id: "A092ENE1EG4",
		text: "updated by the bot",
		team: "T048EJ33W",
		bot_profile: {
			id: "B0927N91F3M",
			deleted: false,
			name: "1on1-order-generator",
			updated: 1750457044,
			app_id: "A092ENE1EG4",
			user_id: "U0927N91N0K",
			icons: {
				image_36: "https://a.slack-edge.com/80588/img/plugins/app/bot_36.png",
				image_48: "https://a.slack-edge.com/80588/img/plugins/app/bot_48.png",
				image_72:
					"https://a.slack-edge.com/80588/img/plugins/app/service_72.png",
			},
			team_id: "T048EJ33W",
		},
		thread_ts: "1769679450.192129",
		reply_count: 3,
		reply_users_count: 2,
		latest_reply: "1769796176.363849",
		reply_users: ["U0927N91N0K", "U05083TTS74"],
		is_locked: false,
		subscribed: false,
		blocks: [
			{
				type: "section",
				block_id: "Y2Ww7",
				fields: [
					{
						type: "mrkdwn",
						text: "*:mega: 1on1 order* \n This order is for the meeting on Thursday, January 29, 2026.",
						verbatim: false,
					},
					{
						type: "mrkdwn",
						text: "*:alarm_clock: Created at(UTC+9):*\n 18:37 Thursday, January 29, 2026",
						verbatim: false,
					},
				],
			},
			{
				type: "header",
				block_id: "DA98k",
				text: {
					type: "plain_text",
					text: ":chair:Offline Orders",
					emoji: true,
				},
			},
			{
				type: "section",
				block_id: "LBm10",
				text: {
					type: "mrkdwn",
					text: "<@U05083TTS74>",
					verbatim: false,
				},
				accessory: {
					type: "button",
					action_id: "button-action",
					text: {
						type: "plain_text",
						text: "Join Huddle",
						emoji: true,
					},
					value: "click_me_123",
					url: "https://app.slack.com/huddle/T048EJ33W/C09R2EFQSLE",
				},
			},
			{
				type: "divider",
				block_id: "AREoD",
			},
			{
				type: "section",
				block_id: "ryc5v",
				text: {
					type: "mrkdwn",
					text: "Want to edit the upcoming slot? \n Visit <https://slack-cronjob.vercel.app/>",
					verbatim: false,
				},
			},
			{
				type: "actions",
				block_id: "kv8mF",
				elements: [
					{
						type: "button",
						action_id: "toggle_1on1_progress",
						text: {
							type: "plain_text",
							text: "Toggle 1on1 Progress",
							emoji: true,
						},
						value: "click_me_123",
					},
				],
			},
		],
	},
	{
		user: "U0927N91N0K",
		type: "message",
		ts: "1769679707.603439",
		bot_id: "B0927N91F3M",
		app_id: "A092ENE1EG4",
		text: "<@U05083TTS74> toggled 1on1 progress",
		team: "T048EJ33W",
		bot_profile: {
			id: "B0927N91F3M",
			app_id: "A092ENE1EG4",
			user_id: "U0927N91N0K",
			name: "1on1-order-generator",
			icons: {
				image_36: "https://a.slack-edge.com/80588/img/plugins/app/bot_36.png",
				image_48: "https://a.slack-edge.com/80588/img/plugins/app/bot_48.png",
				image_72:
					"https://a.slack-edge.com/80588/img/plugins/app/service_72.png",
			},
			deleted: false,
			updated: 1750457044,
			team_id: "T048EJ33W",
		},
		thread_ts: "1769679450.192129",
		parent_user_id: "U0927N91N0K",
		blocks: [
			{
				type: "rich_text",
				block_id: "Qh85z",
				elements: [
					{
						type: "rich_text_section",
						elements: [
							{
								type: "user",
								user_id: "U05083TTS74",
							},
							{
								type: "text",
								text: " toggled 1on1 progress",
							},
						],
					},
				],
			},
		],
	},
	{
		user: "U05083TTS74",
		type: "message",
		ts: "1769796123.388219",
		client_msg_id: "570c9592-d71e-43c4-9a64-d3ecb8138afc",
		text: "<@U0927N91N0K> hello",
		team: "T048EJ33W",
		thread_ts: "1769679450.192129",
		parent_user_id: "U0927N91N0K",
		blocks: [
			{
				type: "rich_text",
				block_id: "pRvP+",
				elements: [
					{
						type: "rich_text_section",
						elements: [
							{
								type: "user",
								user_id: "U0927N91N0K",
							},
							{
								type: "text",
								text: " hello",
							},
						],
					},
				],
			},
		],
	},
	{
		user: "U05083TTS74",
		type: "message",
		ts: "1769796176.363849",
		client_msg_id: "67a37f52-b830-47b3-ab02-18ce4b64f184",
		text: "<@U0927N91N0K> hello2",
		team: "T048EJ33W",
		thread_ts: "1769679450.192129",
		parent_user_id: "U0927N91N0K",
		blocks: [
			{
				type: "rich_text",
				block_id: "N7s5Y",
				elements: [
					{
						type: "rich_text_section",
						elements: [
							{
								type: "user",
								user_id: "U0927N91N0K",
							},
							{
								type: "text",
								text: " hello2",
							},
						],
					},
				],
			},
		],
	},
];
