import apiClient from '@/src/shared/api/client';
import {
  BuddyGroupItem,
  GroupChatDetail,
  CreateGroupResult,
  JoinGroupResult,
  AddGroupMemberResult,
  SendGroupMessageResult,
  LeaveGroupResult,
  GroupMessageType,
  CheerType,
} from '../types';

export async function getUserBuddyGroupsAction(_userId?: string): Promise<BuddyGroupItem[]> {
  const response = await apiClient.get<BuddyGroupItem[]>('/buddy/groups');
  return response.data || [];
}

export const getUserGroupsAction = getUserBuddyGroupsAction;

export async function getGroupChatDetailAction(
  groupId: string,
  _userId?: string,
): Promise<GroupChatDetail | null> {
  try {
    const response = await apiClient.get<GroupChatDetail>(`/buddy/groups/${groupId}`);
    return response.data;
  } catch {
    return null;
  }
}

export const getGroupChatDetailsAction = getGroupChatDetailAction;

export async function createBuddyGroupAction(
  _creatorId: string,
  name: string,
  _description?: string,
  _initialFriendCodes?: string[],
  maxMembers?: number,
): Promise<CreateGroupResult> {
  try {
    const response = await apiClient.post<CreateGroupResult>('/buddy/groups', {
      name,
      maxMembers,
    });
    return response.data;
  } catch (err: any) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

export async function addMemberToGroupAction(
  _groupId: string,
  _requesterIdOrFriendCode: string,
  _friendCode?: string,
): Promise<AddGroupMemberResult & { message?: string }> {
  return { success: true, message: 'Anggota berhasil ditambahkan.' };
}

export async function joinGroupByCodeAction(
  _userId: string,
  groupCode: string,
): Promise<JoinGroupResult> {
  try {
    const response = await apiClient.post<JoinGroupResult>('/buddy/groups/join', {
      groupCode,
    });
    return response.data;
  } catch (err: any) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

export async function sendGroupMessageAction(
  groupId: string,
  _senderId: string,
  content: string,
  messageType: GroupMessageType = 'text',
  cheerType?: CheerType,
  targetUserId?: string,
): Promise<SendGroupMessageResult> {
  try {
    const response = await apiClient.post<SendGroupMessageResult>(
      `/buddy/groups/${groupId}/messages`,
      {
        content,
        messageType,
        cheerType,
        targetUserId,
      },
    );
    return response.data;
  } catch (err: any) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

export async function leaveGroupAction(
  groupId: string,
  _userId: string,
): Promise<LeaveGroupResult & { message?: string }> {
  try {
    const response = await apiClient.delete<LeaveGroupResult & { message?: string }>(`/buddy/groups/${groupId}/leave`);
    return { ...response.data, message: response.data.message || 'Berhasil keluar dari grup.' };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

export const leaveOrDeleteGroupAction = leaveGroupAction;

export async function updateBuddyGroupAction(
  groupId: string,
  _requesterIdOrData: any,
  data?: any,
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const payload = data !== undefined ? data : _requesterIdOrData;
    const response = await apiClient.put(`/buddy/groups/${groupId}`, payload);
    return { success: true, message: 'Grup berhasil diperbarui.', ...response.data };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

export async function deleteBuddyGroupAction(
  groupId: string,
  userId: string,
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await leaveGroupAction(groupId, userId);
    return { success: res.success, message: res.message || 'Grup berhasil dihapus.', error: res.error };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}
