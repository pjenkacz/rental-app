import React from 'react';
import type { Conversation } from '../../hooks/useConversations';
import './ConversationItem.scss';

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
  isActive?: boolean;
  onClick?: () => void;
}

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  }
  if (isYesterday) {
    return 'Wczoraj';
  }
  return date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
}

function getInitials(firstName: string | null, lastName: string | null): string {
  const first = firstName?.[0]?.toUpperCase() ?? '';
  const last = lastName?.[0]?.toUpperCase() ?? '';
  return first + last || '?';
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  currentUserId,
  isActive = false,
  onClick,
}) => {
  const { otherUser, lastMessage, lastMessageAt } = conversation;

  const displayName =
    [otherUser.firstName, otherUser.lastName].filter(Boolean).join(' ') || 'Nieznany użytkownik';

  const lastMessagePreview = lastMessage
    ? (lastMessage.senderId === currentUserId ? 'Ty: ' : '') + lastMessage.content
    : 'Brak wiadomości';

  return (
    <div
      className={`conversationItem ${isActive ? 'conversationItem--active' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
    >
      <div className="conversationItem__avatar">
        {otherUser.avatarUrl ? (
          <img src={otherUser.avatarUrl} alt={displayName} className="conversationItem__avatarImg" />
        ) : (
          <div className="conversationItem__avatarFallback">
            {getInitials(otherUser.firstName, otherUser.lastName)}
          </div>
        )}
      </div>

      <div className="conversationItem__info">
        <span className="conversationItem__name">{displayName}</span>
        <span className="conversationItem__preview">{lastMessagePreview}</span>
      </div>

      <span className="conversationItem__time">
        {formatTimestamp(lastMessageAt)}
      </span>
    </div>
  );
};

export default ConversationItem;
