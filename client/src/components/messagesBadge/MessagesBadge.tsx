import React from 'react';
import { useUnreadCount } from '../../hooks/useUnreadCount';
import './messagesBadge.scss';

const MessagesBadge: React.FC = () => {
  const { data: count = 0 } = useUnreadCount();
  if (!count) return null;
  return <span className="messagesBadge">{count > 99 ? '99+' : count}</span>;
};

export default MessagesBadge;
