'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, MessageSquare, Plus, UserPlus } from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { Button } from '@/src/shared/components/ui/Button';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import {
  getUserGroupsAction,
  getGroupChatDetailsAction,
  createBuddyGroupAction,
  joinGroupByCodeAction,
  addMemberToGroupAction,
  sendGroupMessageAction,
  leaveOrDeleteGroupAction,
  updateBuddyGroupAction,
  deleteBuddyGroupAction,
} from '../api/buddyRepository';
import {
  BuddyGroupItem,
  GroupChatDetail,
  CheerType,
  BuddyGroupMessage,
} from '../types';
import GroupChatHeader from '../components/GroupChatHeader';
import GroupStreakCompactBar from '../components/GroupStreakCompactBar';
import GroupChatMessages from '../components/GroupChatMessages';
import GroupChatInput from '../components/GroupChatInput';
import GroupInfoModal from '../components/GroupInfoModal';
import CreateGroupModal from '../components/CreateGroupModal';
import EditGroupModal from '../components/EditGroupModal';
import JoinGroupModal from '../components/JoinGroupModal';
import GroupSidebarList from '../components/GroupSidebarList';
import {
  publishRealtimeEvent,
  subscribeRealtimeEvent,
} from '@/src/shared/utils/realtimeSync';

export default function BuddyView() {
  const { user } = useAuth();
  const userId = user?.id || 'usr_1';

  // State Management
  const [groups, setGroups] = useState<BuddyGroupItem[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [chatDetail, setChatDetail] = useState<GroupChatDetail | null>(null);

  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Modals & Navigation
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Load User's Groups
  const loadGroups = useCallback(async (preferredGroupId?: string) => {
    setIsLoadingGroups(true);
    try {
      const userGroups = await getUserGroupsAction(userId);
      setGroups(userGroups);

      if (userGroups.length > 0) {
        // Choose target group
        const targetId =
          preferredGroupId && userGroups.some(g => g.id === preferredGroupId)
            ? preferredGroupId
            : selectedGroupId && userGroups.some(g => g.id === selectedGroupId)
            ? selectedGroupId
            : userGroups[0].id;

        setSelectedGroupId(targetId);
      } else {
        setSelectedGroupId(null);
        setChatDetail(null);
      }
    } catch (err) {
      console.error('Failed to load user groups:', err);
    } finally {
      setIsLoadingGroups(false);
    }
  }, [userId, selectedGroupId]);

  // 2. Load Chat Details for Selected Group
  const loadChatDetails = useCallback(async (groupId: string) => {
    setIsLoadingChat(true);
    try {
      const detail = await getGroupChatDetailsAction(groupId, userId);
      setChatDetail(detail);
    } catch (err) {
      console.error('Failed to load group chat details:', err);
    } finally {
      setIsLoadingChat(false);
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    let isSubscribed = true;
    getUserGroupsAction(userId)
      .then(userGroups => {
        if (!isSubscribed) return;
        setGroups(userGroups);
        if (userGroups.length > 0) {
          setSelectedGroupId(prev =>
            prev && userGroups.some(g => g.id === prev) ? prev : userGroups[0].id,
          );
        } else {
          setSelectedGroupId(null);
          setChatDetail(null);
        }
      })
      .catch(err => console.error('Failed to load user groups:', err))
      .finally(() => {
        if (isSubscribed) setIsLoadingGroups(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [userId]);

  // When selectedGroupId changes, load its chat details
  useEffect(() => {
    if (!selectedGroupId) return;
    let isSubscribed = true;
    getGroupChatDetailsAction(selectedGroupId, userId)
      .then(detail => {
        if (isSubscribed) setChatDetail(detail);
      })
      .catch(err => console.error('Failed to load group chat details:', err))
      .finally(() => {
        if (isSubscribed) setIsLoadingChat(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [selectedGroupId, userId]);

  // 3. Realtime Event Listener across tabs & actions
  useEffect(() => {
    const unsubscribe = subscribeRealtimeEvent(event => {
      if (
        event.type === 'GROUP_MESSAGE_SENT' ||
        event.type === 'GROUP_MEMBER_ADDED' ||
        event.type === 'GROUP_UPDATED'
      ) {
        if (event.groupId && event.groupId === selectedGroupId) {
          loadChatDetails(event.groupId);
        }
        getUserGroupsAction(userId).then(freshGroups => setGroups(freshGroups));
      } else if (event.type === 'GROUP_CREATED' || event.type === 'GROUP_DELETED') {
        getUserGroupsAction(userId).then(freshGroups => {
          setGroups(freshGroups);
          if (event.type === 'GROUP_DELETED' && event.groupId === selectedGroupId) {
            if (freshGroups.length > 0) {
              setSelectedGroupId(freshGroups[0].id);
            } else {
              setSelectedGroupId(null);
              setChatDetail(null);
              setMobileView('list');
            }
          }
        });
      } else if (event.type === 'MEDICATION_TAKEN') {
        // Refresh compliance
        if (selectedGroupId) loadChatDetails(selectedGroupId);
        getUserGroupsAction(userId).then(freshGroups => setGroups(freshGroups));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [selectedGroupId, userId, loadChatDetails]);

  // Handle Group Selection
  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setMobileView('chat');
  };

  // Handle Send Message
  const handleSendMessage = async (content: string) => {
    if (!selectedGroupId || !content.trim()) return;

    setIsSending(true);

    // Optimistic message append
    const tempId = `tmp_${Date.now()}`;
    const optimisticMsg: BuddyGroupMessage = {
      id: tempId,
      groupId: selectedGroupId,
      senderId: userId,
      senderName: user?.name || 'Siswi',
      senderAvatarUrl:
        user?.avatarUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      messageType: 'text',
      content: content.trim(),
      timestamp: 'Baru saja',
      isSelf: true,
    };

    setChatDetail(prev =>
      prev ? { ...prev, messages: [...prev.messages, optimisticMsg] } : null
    );

    try {
      const res = await sendGroupMessageAction(selectedGroupId, userId, content, 'text');
      if (res.success && res.message) {
        // Replace temp msg with real msg
        setChatDetail(prev => {
          if (!prev) return null;
          const filtered = prev.messages.filter(m => m.id !== tempId);
          return { ...prev, messages: [...filtered, res.message!] };
        });

        // Broadcast to other tabs
        publishRealtimeEvent('GROUP_MESSAGE_SENT', {
          groupId: selectedGroupId,
          userId,
          messageId: res.message.id,
        });

        // Refresh group list snippet
        const fresh = await getUserGroupsAction(userId);
        setGroups(fresh);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      showToast('Gagal mengirim pesan.');
    } finally {
      setIsSending(false);
    }
  };

  // Handle Send Quick Cheer
  const handleSendCheer = async (cheerType: CheerType, label: string) => {
    if (!selectedGroupId) return;

    setIsSending(true);

    // Optimistic cheer append
    const tempId = `tmp_chr_${Date.now()}`;
    const optimisticMsg: BuddyGroupMessage = {
      id: tempId,
      groupId: selectedGroupId,
      senderId: userId,
      senderName: user?.name || 'Siswi',
      senderAvatarUrl:
        user?.avatarUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      messageType: 'cheer',
      content: label,
      cheerType,
      timestamp: 'Baru saja',
      isSelf: true,
    };

    setChatDetail(prev =>
      prev ? { ...prev, messages: [...prev.messages, optimisticMsg] } : null
    );
    showToast(`Stiker semangat terkirim! ${label} 🌸`);

    try {
      const res = await sendGroupMessageAction(selectedGroupId, userId, label, 'cheer', cheerType);
      if (res.success && res.message) {
        setChatDetail(prev => {
          if (!prev) return null;
          const filtered = prev.messages.filter(m => m.id !== tempId);
          return { ...prev, messages: [...filtered, res.message!] };
        });

        publishRealtimeEvent('GROUP_MESSAGE_SENT', {
          groupId: selectedGroupId,
          userId,
          messageId: res.message.id,
        });

        const fresh = await getUserGroupsAction(userId);
        setGroups(fresh);
      }
    } catch (err) {
      console.error('Failed to send cheer:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Handle Create Group
  const handleCreateGroup = async (
    name: string,
    description?: string,
    initialFriendCodes?: string[]
  ): Promise<boolean> => {
    try {
      const res = await createBuddyGroupAction(userId, name, description, initialFriendCodes);
      if (res.success && res.group) {
        showToast(`Grup "${res.group.name}" berhasil dibuat! 🎉`);
        publishRealtimeEvent('GROUP_CREATED', { groupId: res.group.id, userId });
        await loadGroups(res.group.id);
        setMobileView('chat');
        return true;
      } else {
        showToast(res.error || 'Gagal membuat grup.');
        return false;
      }
    } catch (err) {
      console.error('Error creating group:', err);
      showToast('Terjadi kesalahan saat membuat grup.');
      return false;
    }
  };

  // Handle Edit Group
  const handleUpdateGroup = async (name: string, description?: string): Promise<boolean> => {
    if (!selectedGroupId) return false;
    try {
      const res = await updateBuddyGroupAction(selectedGroupId, userId, { name, description });
      if (res.success) {
        showToast('Informasi grup berhasil diperbarui! ✨');
        publishRealtimeEvent('GROUP_UPDATED', { groupId: selectedGroupId, userId });
        await loadChatDetails(selectedGroupId);
        const fresh = await getUserGroupsAction(userId);
        setGroups(fresh);
        setIsInfoModalOpen(false);
        return true;
      } else {
        showToast(res.error || 'Gagal memperbarui grup.');
        return false;
      }
    } catch (err) {
      console.error('Error updating group:', err);
      showToast('Terjadi kesalahan saat memperbarui grup.');
      return false;
    }
  };

  // Handle Delete Group
  const handleDeleteGroup = async () => {
    if (!selectedGroupId) return;
    try {
      const deletedId = selectedGroupId;
      const res = await deleteBuddyGroupAction(deletedId, userId);
      if (res.success) {
        showToast(res.message || 'Grup berhasil dihapus.');
        publishRealtimeEvent('GROUP_DELETED', { groupId: deletedId, userId });
        setIsInfoModalOpen(false);
        setIsEditModalOpen(false);
        await loadGroups();
        setMobileView('list');
      } else {
        showToast(res.error || 'Gagal menghapus grup.');
      }
    } catch (err) {
      console.error('Error deleting group:', err);
      showToast('Terjadi kesalahan sistem saat menghapus grup.');
    }
  };

  // Handle Join Group
  const handleJoinGroup = async (groupCode: string): Promise<boolean> => {
    try {
      const res = await joinGroupByCodeAction(userId, groupCode);
      if (res.success && res.group) {
        showToast(`Berhasil bergabung ke grup "${res.group.name}"! 👋`);
        publishRealtimeEvent('GROUP_MEMBER_ADDED', { groupId: res.group.id, userId });
        await loadGroups(res.group.id);
        setMobileView('chat');
        return true;
      } else {
        showToast(res.error || 'Gagal bergabung ke grup.');
        return false;
      }
    } catch (err) {
      console.error('Error joining group:', err);
      showToast('Terjadi kesalahan saat bergabung ke grup.');
      return false;
    }
  };

  // Handle Add Member
  const handleAddMember = async (friendCode: string): Promise<boolean> => {
    if (!selectedGroupId) return false;
    try {
      const res = await addMemberToGroupAction(selectedGroupId, userId, friendCode);
      if (res.success && res.member) {
        showToast(`${res.member.name} berhasil ditambahkan! 🎉`);
        publishRealtimeEvent('GROUP_MEMBER_ADDED', { groupId: selectedGroupId, userId });
        await loadChatDetails(selectedGroupId);
        const fresh = await getUserGroupsAction(userId);
        setGroups(fresh);
        return true;
      } else {
        showToast(res.error || 'Gagal menambahkan anggota.');
        return false;
      }
    } catch (err) {
      console.error('Error adding member:', err);
      return false;
    }
  };

  // Handle Leave Group
  const handleLeaveGroup = async () => {
    if (!selectedGroupId) return;
    try {
      const res = await leaveOrDeleteGroupAction(selectedGroupId, userId);
      if (res.success) {
        showToast(res.message || 'Berhasil keluar dari grup.');
        publishRealtimeEvent('GROUP_UPDATED', { groupId: selectedGroupId, userId });
        setIsInfoModalOpen(false);
        await loadGroups();
        setMobileView('list');
      } else {
        showToast(res.error || 'Gagal keluar dari grup.');
      }
    } catch (err) {
      console.error('Error leaving group:', err);
    }
  };

  return (
    <div className='flex flex-col gap-3 sm:gap-4 w-full h-[calc(100dvh-135px)] md:h-[calc(100vh-80px)] min-h-[520px] overflow-hidden'>
      {/* Toast Notification */}
      {toastMessage && (
        <div className='fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#1e293b] text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-fade-in'>
          <Sparkles size={14} className='text-amber-400 shrink-0' />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Title */}
      <div
        className={`shrink-0 ${
          mobileView === 'chat' ? 'hidden md:flex' : 'flex'
        } items-center justify-between`}
      >
        <div>
          <h2 className='text-xl sm:text-2xl font-extrabold text-[#1e293b] tracking-tight'>
            Group Buddy
          </h2>
          <p className='text-xs sm:text-sm text-[#64748b]'>
            Pantau kepatuhan & saling semangati teman
          </p>
        </div>
      </div>

      {/* Unified Empty State when User has 0 Groups */}
      {!isLoadingGroups && groups.length === 0 ? (
        <div className='flex-1 min-h-0 flex items-center justify-center p-4'>
          <Card
            padding='none'
            className='w-full max-w-md flex flex-col items-center justify-center text-center p-6 sm:p-8 bg-white border border-[#fce7f3] shadow-sm animate-scale-up'
          >
            <div className='w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 text-white flex items-center justify-center shadow-md shadow-rose-500/25 mb-3.5'>
              <MessageSquare size={28} />
            </div>
            <h3 className='text-base sm:text-lg font-bold text-[#1e293b]'>
              Belum Bergabung ke Grup Buddy
            </h3>
            <p className='text-xs sm:text-sm text-[#64748b] max-w-xs mt-1 mb-5 leading-relaxed'>
              Ajak kawan sekelas atau sahabat UKS untuk saling mengingatkan jadwal minum TTD setiap minggu!
            </p>

            <div className='flex items-center gap-2.5 w-full'>
              <Button
                variant='primary'
                size='md'
                shape='pill'
                icon={<Plus size={15} />}
                className='flex-1 text-xs'
                onClick={() => setIsCreateModalOpen(true)}
              >
                Buat Grup Baru
              </Button>
              <Button
                variant='soft'
                size='md'
                shape='pill'
                icon={<UserPlus size={15} />}
                className='flex-1 text-xs'
                onClick={() => setIsJoinModalOpen(true)}
              >
                Gabung via Kode
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        /* Main Responsive Grid Layout (When groups exist) */
        <div className='flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5 items-stretch h-full overflow-hidden'>
          {/* LEFT PANEL: Group Sidebar List (md:col-span-4 lg:col-span-4) */}
          <div
            className={`h-full min-h-0 flex-col ${
              mobileView === 'list' ? 'flex md:flex' : 'hidden md:flex'
            } md:col-span-4 lg:col-span-4`}
          >
            {isLoadingGroups ? (
              <Card padding='md' className='h-full animate-pulse flex flex-col gap-3'>
                <div className='h-8 bg-rose-100/60 rounded-xl' />
                <div className='h-16 bg-slate-100 rounded-2xl' />
                <div className='h-16 bg-slate-100 rounded-2xl' />
                <div className='h-16 bg-slate-100 rounded-2xl' />
              </Card>
            ) : (
              <GroupSidebarList
                groups={groups}
                selectedGroupId={selectedGroupId}
                onSelectGroup={handleSelectGroup}
                onOpenCreateModal={() => setIsCreateModalOpen(true)}
                onOpenJoinModal={() => setIsJoinModalOpen(true)}
              />
            )}
          </div>

          {/* RIGHT PANEL: Group Chat Room (md:col-span-8 lg:col-span-8) */}
          <div
            className={`h-full min-h-0 flex-col ${
              mobileView === 'chat' ? 'flex md:flex' : 'hidden md:flex'
            } md:col-span-8 lg:col-span-8`}
          >
            {isLoadingChat && !chatDetail ? (
              <Card padding='none' className='h-full flex flex-col items-center justify-center p-6 bg-white animate-pulse'>
                <div className='w-12 h-12 rounded-full bg-rose-100 mb-3' />
                <div className='w-40 h-4 bg-slate-200 rounded-full mb-2' />
                <div className='w-64 h-3 bg-slate-100 rounded-full' />
              </Card>
            ) : chatDetail ? (
              <Card
                padding='none'
                className='h-full flex flex-col overflow-hidden bg-white shadow-sm border border-[#fce7f3]'
              >
                {/* 1. Top Bar Header (Compact) */}
                <GroupChatHeader
                  group={chatDetail.group}
                  onOpenGroupInfo={() => setIsInfoModalOpen(true)}
                  onBackToGroupList={() => setMobileView('list')}
                  showBackButton={true}
                />

                {/* 2. Compact Weekly Progress Bar */}
                <GroupStreakCompactBar group={chatDetail.group} />

                {/* 3. Message Thread (Flex-1 Scrollable) */}
                <GroupChatMessages
                  messages={chatDetail.messages}
                  currentUserId={userId}
                />

                {/* 4. Sticky Chat Input + Quick Cheers */}
                <GroupChatInput
                  onSendMessage={handleSendMessage}
                  onSendCheer={handleSendCheer}
                  isSending={isSending}
                />
              </Card>
            ) : (
              /* Prompt to select a group */
              <Card
                padding='none'
                className='h-full flex flex-col items-center justify-center text-center p-8 bg-white border border-[#fce7f3]'
              >
                <div className='w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3'>
                  <MessageSquare size={26} />
                </div>
                <h3 className='text-sm sm:text-base font-bold text-[#1e293b]'>
                  Pilih Grup untuk Mulai Chat
                </h3>
                <p className='text-xs text-[#64748b] max-w-xs mt-1'>
                  Pilih salah satu grup dari daftar sebelah kiri untuk melihat pesan dan progres kepatuhan.
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Group Info Modal / Drawer */}
      {chatDetail && (
        <GroupInfoModal
          open={isInfoModalOpen}
          group={chatDetail.group}
          members={chatDetail.members}
          currentUserId={userId}
          onClose={() => setIsInfoModalOpen(false)}
          onAddMember={handleAddMember}
          onLeaveGroup={handleLeaveGroup}
          onOpenEditGroup={() => {
            setIsInfoModalOpen(false);
            setIsEditModalOpen(true);
          }}
          onDeleteGroup={handleDeleteGroup}
        />
      )}

      {/* Edit Group Modal */}
      {chatDetail && (
        <EditGroupModal
          open={isEditModalOpen}
          group={chatDetail.group}
          onClose={() => setIsEditModalOpen(false)}
          onUpdateGroup={handleUpdateGroup}
        />
      )}

      {/* Create Group Modal */}
      <CreateGroupModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateGroup={handleCreateGroup}
      />

      {/* Join Group Modal */}
      <JoinGroupModal
        open={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onJoinGroup={handleJoinGroup}
      />
    </div>
  );
}
