import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Send, ArrowLeft } from 'lucide-react';
import { useConversations } from '../../hooks/useConversations';
import { useMessages, useSendMessage } from '../../hooks/useMessages';
import ConversationItem from '../../components/conversationItem/ConversationItem';
import './MessagesPage.scss';

// ── ChatWindow ────────────────────────────────────────────────────────────────

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  otherUserName: string;
  otherUserAvatar: string | null;
  onBack: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  currentUserId,
  otherUserName,
  otherUserAvatar,
  onBack,
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useMessages(conversationId);
  const sendMessage = useSendMessage(conversationId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const content = inputValue.trim();
    if (!content) return;
    setInputValue('');
    await sendMessage.mutateAsync(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

  const getInitials = (name: string) =>
    name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="chatWindow">
      <div className="chatWindow__header">
        <button className="chatWindow__back" onClick={onBack} aria-label="Wróć">
          <ArrowLeft size={20} />
        </button>
        <div className="chatWindow__headerAvatar">
          {otherUserAvatar ? (
            <img src={otherUserAvatar} alt={otherUserName} />
          ) : (
            <div className="chatWindow__headerAvatarFallback">
              {getInitials(otherUserName)}
            </div>
          )}
        </div>
        <span className="chatWindow__headerName">{otherUserName}</span>
      </div>

      <div className="chatWindow__messages">
        {isLoading && (
          <div className="chatWindow__loading">Ładowanie wiadomości...</div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="chatWindow__empty">
            <p>Brak wiadomości. Napisz pierwszą!</p>
          </div>
        )}

        {messages.map(msg => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div
              key={msg.id}
              className={`chatWindow__message ${isMe ? 'chatWindow__message--mine' : 'chatWindow__message--theirs'}`}
            >
              {!isMe && (
                <div className="chatWindow__msgAvatar">
                  {otherUserAvatar ? (
                    <img src={otherUserAvatar} alt={otherUserName} />
                  ) : (
                    <div className="chatWindow__msgAvatarFallback">
                      {getInitials(otherUserName)}
                    </div>
                  )}
                </div>
              )}

              <div className="chatWindow__msgGroup">
                <div className="chatWindow__bubble">{msg.content}</div>
                <span className="chatWindow__msgTime">{formatTime(msg.createdAt)}</span>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      <div className="chatWindow__input">
        <textarea
          className="chatWindow__textarea"
          placeholder="Napisz wiadomość… (Enter = wyślij, Shift+Enter = nowa linia)"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          className="chatWindow__sendBtn"
          onClick={handleSend}
          disabled={!inputValue.trim() || sendMessage.isPending}
          aria-label="Wyślij"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

// ── MessagesPage ──────────────────────────────────────────────────────────────

const MessagesPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const { userId } = useAuth();

  const { data: conversations = [], isLoading } = useConversations();

  const [mobileView, setMobileView] = useState<'list' | 'chat'>(
    conversationId ? 'chat' : 'list'
  );

  useEffect(() => {
    if (conversationId) setMobileView('chat');
    else setMobileView('list');
  }, [conversationId]);

  const activeConversation = conversations.find(c => c.id === conversationId);

  const handleSelectConversation = (id: string) => {
    navigate(`/messages/${id}`);
  };

  const handleBack = () => {
    navigate('/messages');
  };

  const otherUserName = activeConversation
    ? [activeConversation.otherUser.firstName, activeConversation.otherUser.lastName]
        .filter(Boolean)
        .join(' ') || 'Nieznany użytkownik'
    : '';

  return (
    <div className="messagesPage">
      <aside className={`messagesPage__sidebar ${mobileView === 'chat' ? 'messagesPage__sidebar--hidden' : ''}`}>
        <div className="messagesPage__sidebarHeader">
          <h2>Wiadomości</h2>
        </div>

        <div className="messagesPage__conversationList">
          {isLoading && (
            <div className="messagesPage__loading">Ładowanie...</div>
          )}

          {!isLoading && conversations.length === 0 && (
            <div className="messagesPage__emptyList">
              <p>Brak konwersacji.</p>
              <p>Przejrzyj ogłoszenia i napisz do sprzedającego.</p>
            </div>
          )}

          {conversations.map(conv => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              currentUserId={userId ?? ''}
              isActive={conv.id === conversationId}
              onClick={() => handleSelectConversation(conv.id)}
            />
          ))}
        </div>
      </aside>

      <main className={`messagesPage__chat ${mobileView === 'list' ? 'messagesPage__chat--hidden' : ''}`}>
        {!conversationId && (
          <div className="messagesPage__placeholder">
            <div className="messagesPage__placeholderIcon">
              <svg viewBox="0 0 48 48" fill="none" width="64" height="64">
                <path d="M8 12a4 4 0 014-4h24a4 4 0 014 4v20a4 4 0 01-4 4H16l-8 6V12z"
                  stroke="#e8e2dc" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            </div>
            <p>Wybierz konwersację aby rozpocząć czat</p>
          </div>
        )}

        {conversationId && activeConversation && (
          <ChatWindow
            conversationId={conversationId}
            currentUserId={userId ?? ''}
            otherUserName={otherUserName}
            otherUserAvatar={activeConversation.otherUser.avatarUrl}
            onBack={handleBack}
          />
        )}
      </main>
    </div>
  );
};

export default MessagesPage;
