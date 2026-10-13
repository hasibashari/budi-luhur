export type ConsumptionStatus = 'recorded' | 'missed' | 'pending';
export type CheerType = 'HEART' | 'FLAME' | 'STAR' | 'CLAP' | 'POWER';
export type GroupRole = 'admin' | 'member';
export type GroupMessageType = 'text' | 'cheer' | 'system';

export interface BuddyGroupMember {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string;
  friendCode: string;
  role: GroupRole;
  schoolOrOrg?: string;
  streakCount: number;
  statusThisWeek: ConsumptionStatus;
  joinedAt: string;
}

export interface BuddyGroupMessage {
  id: string;
  groupId: string;
  senderId: string | null;
  senderName: string;
  senderAvatarUrl: string;
  messageType: GroupMessageType;
  content: string;
  cheerType?: CheerType | null;
  timestamp: string;
  isSelf: boolean;
}

export interface BuddyGroupItem {
  id: string;
  name: string;
  description?: string;
  groupCode: string;
  creatorId: string | null;
  streakCount: number;
  avatarUrl?: string;
  memberCount: number;
  membersSummary: string[];
  lastMessage?: {
    content: string;
    senderName: string;
    timestamp: string;
    messageType?: GroupMessageType;
  };
  unreadCount: number;
  weeklyCompletedCount: number;
  weeklyTotalCount: number;
  weeklyCompletionRate: number;
  isCreator: boolean;
}

export interface GroupChatDetail {
  group: BuddyGroupItem;
  members: BuddyGroupMember[];
  messages: BuddyGroupMessage[];
}

export interface CreateGroupResult {
  success: boolean;
  group?: BuddyGroupItem;
  error?: string;
}

export interface JoinGroupResult {
  success: boolean;
  group?: BuddyGroupItem;
  error?: string;
}

export interface AddGroupMemberResult {
  success: boolean;
  member?: BuddyGroupMember;
  error?: string;
}

export interface SendGroupMessageResult {
  success: boolean;
  message?: BuddyGroupMessage;
  error?: string;
}

export interface LeaveGroupResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface UpdateGroupResult {
  success: boolean;
  group?: BuddyGroupItem;
  error?: string;
}

export interface DeleteGroupResult {
  success: boolean;
  message?: string;
  error?: string;
}

