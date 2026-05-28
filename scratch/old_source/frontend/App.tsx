import React, { useState, useRef, useEffect } from 'react';
import { Message } from './types';
import { chatService } from './services/gemini';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { DnaIcon } from './components/Icons';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    const userMessageId = Date.now().toString();
    const botMessageId = (Date.now() + 1).toString();

    // 1. Add user message
    const newUserMessage: Message = { id: userMessageId, role: 'user', text };
    setMessages(prev => [...prev, newUserMessage]);
    setIsProcessing(true);

    // 2. Add placeholder for bot message
    setMessages(prev => [...prev, { id: botMessageId, role: 'model', text: '', isStreaming: true }]);

    try {
      // 3. Stream response
      const stream = chatService.sendMessageStream(text);
      let fullResponse = '';

      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === botMessageId ? { ...msg, text: fullResponse } : msg
        ));
      }
    } catch (error) {
      console.error("Error in chat:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId ? { 
          ...msg, 
          text: "I apologize, but I encountered an error processing your request. Please try again.",
          isError: true 
        } : msg
      ));
    } finally {
      // 4. Finalize bot message
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId ? { ...msg, isStreaming: false } : msg
      ));
      setIsProcessing(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      setMessages([]);
      chatService.resetChat();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-slate-200 shadow-sm z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-teal-700">
            <DnaIcon className="w-7 h-7" />
            <h1 className="text-xl font-bold tracking-tight">Med-Peptides Assistant</h1>
          </div>
          {messages.length > 0 && (
            <button 
              onClick={handleClearChat}
              className="text-sm text-slate-500 hover:text-slate-800 transition-colors px-3 py-1.5 rounded-md hover:bg-slate-100"
            >
              Clear Chat
            </button>
          )}
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center px-4">
              <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <DnaIcon className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-800 mb-2">Welcome to Med-Peptides</h2>
              <p className="text-slate-600 max-w-md mb-8">
                I am an AI assistant specialized in peptides. Ask me about mechanisms of action, research, specific peptide profiles, or general information.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                {[
                  "What is the mechanism of action for BPC-157?",
                  "Explain the difference between Semaglutide and Tirzepatide.",
                  "What are the potential applications of TB-500?",
                  "How are peptides synthesized?"
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(suggestion)}
                    className="text-left p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-300 hover:shadow-md transition-all text-sm text-slate-700"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="pb-4">
              {messages.map(msg => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <footer className="flex-shrink-0 bg-white border-t border-slate-200 p-4">
        <div className="max-w-4xl mx-auto">
          <ChatInput onSendMessage={handleSendMessage} disabled={isProcessing} />
          <p className="text-xs text-center text-slate-400 mt-3">
            Information provided is for educational purposes and does not constitute medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
