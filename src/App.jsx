import React, { useState, useRef, useEffect } from 'react';
import './index.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messageEndRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch("https://chat-bot-backend-production.up.railway.app/chat", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();

      if (res.ok && data?.choices?.[0]?.message?.content) {
        const botReply = data.choices[0].message;
        setMessages([...newMessages, botReply]);
      } else {
        console.error("Unexpected API response:", data);
        setMessages([...newMessages, { role: 'bot', content: "⚠️ Something went wrong!" }]);
      }
    } catch (error) {
      console.error("Fetch failed:", error);
      setMessages([...newMessages, { role: 'bot', content: "❌ Failed to connect to server." }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="chat-container">
      <div className="chat-window">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`chat-bubble ${msg.role === 'user' ? 'user' : 'bot'}`}
            >
              {msg.content}
            </div>
          ))}
          {loading && <div className="chat-bubble bot">Typing...</div>}
          <div ref={messageEndRef} />
        </div>
        <div className="chat-input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            disabled={loading}
          />
          <button onClick={handleSend} disabled={loading}>
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
