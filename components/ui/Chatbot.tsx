import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';
import { Icon } from './Icon';
import { Button } from './Button';
import { Logo } from './Logo';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

let ai: GoogleGenAI | null = null;
try {
  // This will be replaced by the build process
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
} catch (e) {
  console.error("Gemini API key not found. Chatbot will be in a locked state.", e);
}

let chat: Chat | null = null;
if (ai) {
    chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: 'You are a friendly and helpful assistant for WorldPosta. Your goal is to assist users with their questions about products, billing, and support.',
        },
    });
}


export const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 'initial-ai-message', text: "Hello! I'm the WorldPosta Assistant. How can I help you today?", sender: 'ai' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);
    
    useEffect(() => {
        if(isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const userMessage = inputValue.trim();
        if (!userMessage || isLoading || !chat) return;

        const newUserMessage: Message = { id: Date.now().toString(), text: userMessage, sender: 'user' };
        setMessages(prev => [...prev, newUserMessage]);
        setInputValue('');
        setIsLoading(true);

        const aiMessageId = (Date.now() + 1).toString();
        // Add a placeholder for the AI response
        setMessages(prev => [...prev, { id: aiMessageId, text: '', sender: 'ai' }]);
        
        try {
            const responseStream = await chat.sendMessageStream({ message: userMessage });
            for await (const chunk of responseStream) {
                const chunkText = chunk.text;
                setMessages(prev => prev.map(msg => 
                    msg.id === aiMessageId ? { ...msg, text: msg.text + chunkText } : msg
                ));
            }
        } catch (error) {
            console.error('Error sending message to Gemini:', error);
            setMessages(prev => prev.map(msg => 
                msg.id === aiMessageId ? { ...msg, text: "Sorry, I'm having trouble connecting right now. Please try again later." } : msg
            ));
        } finally {
            setIsLoading(false);
        }
    };
    
    const isApiKeyMissing = !ai || !chat;

    return (
        <>
            <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isOpen ? 'scale-90 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}>
                <Button
                    variant="primary"
                    onClick={() => setIsOpen(true)}
                    className="rounded-full !p-0 w-12 h-12 shadow-lg hover:scale-110 transform transition-transform hover:shadow-xl"
                    aria-label="Open chat"
                >
                    <Icon name="fas fa-comment-dots" className="text-lg" />
                </Button>
            </div>

            <div
                className={`fixed bottom-6 right-6 z-50 w-[calc(100%-3rem)] max-w-sm h-[70vh] max-h-[600px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}
            >
                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                         <Logo iconClassName="h-7 w-auto" />
                         <h3 className="font-semibold text-lg text-[#293c51] dark:text-gray-100">Assistant</h3>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Close chat">
                        <Icon name="fas fa-times" />
                    </Button>
                </div>
                
                {/* Messages */}
                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    {messages.map((message) => (
                        <div key={message.id} className={`flex items-end gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {message.sender === 'ai' && (
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                                     <Icon name="fas fa-robot" className="text-gray-500 dark:text-gray-400" />
                                </div>
                            )}
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                                    message.sender === 'user'
                                        ? 'bg-[#679a41] text-white rounded-br-none'
                                        : 'bg-gray-100 dark:bg-slate-700 text-[#293c51] dark:text-gray-200 rounded-bl-none'
                                }`}
                            >
                                <p className="whitespace-pre-wrap">{message.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-end gap-2 justify-start">
                             <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                                <Icon name="fas fa-robot" className="text-gray-500 dark:text-gray-400" />
                            </div>
                             <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-100 dark:bg-slate-700 rounded-bl-none flex items-center space-x-1.5">
                                 <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce delay-0"></span>
                                 <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce delay-150"></span>
                                 <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce delay-300"></span>
                             </div>
                         </div>
                    )}
                     <div ref={messagesEndRef} />
                </div>
                
                 {/* Input */}
                <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-slate-700">
                    {isApiKeyMissing ? (
                         <div className="text-center text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded-md">
                            <Icon name="fas fa-exclamation-triangle" className="mr-1" />
                            Chatbot functionality is currently unavailable due to a missing API key.
                        </div>
                    ) : (
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Type a message..."
                                disabled={isLoading}
                                className="flex-grow w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#679a41] dark:focus:ring-emerald-400 focus:border-[#679a41] dark:focus:border-emerald-400 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                            />
                            <Button type="submit" disabled={isLoading || !inputValue.trim()} className="rounded-full !p-0 w-10 h-10 flex-shrink-0">
                                <Icon name="fas fa-paper-plane" />
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
};