import React, { useState } from 'react';
import './chat.scss';

const Chat: React.FC = () => {
  const [chat, setChat] = useState<boolean>(true);

  return (
    <div className="chat">
      <div className="messages">
        <h1>Messages</h1>
        {Array(4)
          .fill(null)
          .map((_, index) => (
            <div className="message" key={index}>
              <img
                src="https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt=""
              />
              <span>User Name</span>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
          ))}
      </div>
      {chat && (
        <div className="chatBox">
          <div className="top">
            <div className="user">
              <img
                src="https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt=""
              />
              Madzia Kwas
            </div>
            <span className="close" onClick={() => setChat(false)}>
              X
            </span>
          </div>
          <div className="center">
            {Array(10)
              .fill(null)
              .map((_, index) => (
                <div
                  className={`chatMessage ${index % 2 === 0 ? 'own' : ''}`}
                  key={index}
                >
                  <p>Masz pożyczyć obieraczkę do ziemniaków.</p>
                  <span>1 hour ago</span>
                </div>
              ))}
          </div>
          <div className="bottom">
            <textarea name="chatInput" id="chatInput" placeholder="Type a message..." />
            <button>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
