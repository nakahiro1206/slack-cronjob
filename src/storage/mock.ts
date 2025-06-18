import { type Channel } from "@/models/channel";
import { type User } from "@/models/user";

export const getChannelIds = (): Channel[] => {
  return [
    {
        channelId: 'C092NNA99SL',
        channelName: '1on1-tue',
        users: [{ 
            userId: 'U07JX3R6LNS', 
            userName: 'Hiroki' 
        }],
    },
    {
        channelId: 'C091TP1FTPD',
        channelName: '1on1-wed',
        users: [{ 
            userId: 'U07JX3R6LNS', 
            userName: 'Hiroki' 
        }],
    },
    {
        channelId: 'C091TP2F743',
        channelName: '1on1-thu',
        users: [{ 
            userId: 'U07JX3R6LNS', 
            userName: 'Hiroki' 
        }],
    },
  ];
};

export const getUsers = (): User[] => {
  return [
    {
        userId: 'U07JX3R6LNS',
        userName: 'Hiroki'
    }
  ];
};