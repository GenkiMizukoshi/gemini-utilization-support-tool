
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Task } from '../types';
import ChatMessageComponent from './ChatMessage';
import Loader from './Loader';
import { SendIcon } from './Icons';
import { sendLog } from '../services/loggingService';
import { AI_MODEL } from '../constants';

interface ChatInterfaceProps {
    chatHistory: ChatMessage[];
    currentTask: Task;
    onSendMessage: (message: string) => void;
    onReset: () => void;
    isLoading: boolean;
    onSuggestion: (suggestion: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatHistory, currentTask, onSendMessage, onReset, isLoading, onSuggestion }) => {
    const [inputValue, setInputValue] = useState('');
    const chatLogRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (chatLogRef.current) {
            chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
        }
    }, [chatHistory]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [inputValue]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() && !isLoading) {
            onSendMessage(inputValue.trim());
            setInputValue('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    const handleFeedbackLog = (feedbackType: 'フィードバック👍' | 'フィードバック👎', comment?: string) => {
        sendLog({
            taskName: currentTask.name,
            eventType: feedbackType,
            feedbackContent: comment,
            modelName: AI_MODEL
        });
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg flex flex-col h-[85vh]">
            <div className="flex justify-between items-center mb-4 border-b pb-4 flex-shrink-0">
                <h2 id="chat-title" className="text-xl font-bold text-gray-800">{currentTask.name}</h2>
                <button onClick={onReset} id="reset-chat-btn" className="text-sm text-gray-500 hover:text-red-600 hover:underline">
                    新しいチャットを始める
                </button>
            </div>
            
            <div id="chat-log" ref={chatLogRef} className="flex-grow flex flex-col gap-4 p-4 overflow-y-auto">
                {chatHistory.map((msg) => (
                    <ChatMessageComponent 
                        key={msg.id} 
                        message={msg} 
                        onSuggestionClick={onSuggestion}
                        onFeedback={handleFeedbackLog}
                    />
                ))}
            </div>

            {isLoading && (
                 <div className="flex items-center justify-center p-4">
                    <Loader size="24px" />
                </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 flex items-start gap-2 flex-shrink-0">
                <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none overflow-y-hidden"
                    placeholder="追加の指示を入力してください..."
                    rows={1}
                />
                <button type="submit" disabled={isLoading} className="bg-blue-600 text-white font-bold p-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 self-end disabled:bg-blue-400 disabled:cursor-not-allowed">
                    <SendIcon />
                </button>
            </form>
        </div>
    );
};

export default ChatInterface;
