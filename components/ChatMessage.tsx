
import React, { useState } from 'react';
import { ChatMessage } from '../types';
import { CopyIcon, CheckIcon } from './Icons';

interface ChatMessageProps {
    message: ChatMessage;
    onSuggestionClick: (suggestion: string) => void;
    onFeedback: (feedbackType: 'フィードバック👍' | 'フィードバック👎', comment?: string) => void;
}

const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative bg-gray-800 text-white p-4 rounded-lg my-2 font-mono text-sm">
            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-1 bg-gray-600 hover:bg-gray-500 text-white rounded-full"
                title="コードをコピー"
            >
                {copied ? <CheckIcon className="h-5 w-5 text-green-400" /> : <CopyIcon className="h-5 w-5" />}
            </button>
            <pre><code className="language-js">{code}</code></pre>
        </div>
    );
};

const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message, onSuggestionClick, onFeedback }) => {
    const { role, parts, suggestions } = message;
    const text = parts[0]?.text || '';
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [feedbackSent, setFeedbackSent] = useState(false);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
    
    const handleFeedbackClick = (type: 'good' | 'bad') => {
        if (type === 'good') {
            onFeedback('フィードバック👍');
            setFeedbackSent(true);
        } else {
            setShowFeedbackForm(true);
        }
    };

    const submitBadFeedback = () => {
        onFeedback('フィードバック👎', feedbackComment);
        setShowFeedbackForm(false);
        setFeedbackSent(true);
    };

    const renderTextWithCodeBlocks = (rawText: string) => {
        if (!rawText.includes('```')) {
            return <p className="whitespace-pre-wrap">{rawText}</p>;
        }
        const parts = rawText.split(/(```(?:[\w-]*)\n[\s\S]*?\n```)/g);
        return parts.map((part, index) => {
            if (part.startsWith('```')) {
                const codeMatch = part.match(/```(?:[\w-]*)\n([\s\S]*?)\n```/);
                const code = codeMatch ? codeMatch[1].trim() : '';
                return <CodeBlock key={index} code={code} />;
            }
            return part.trim() ? <p key={index} className="whitespace-pre-wrap">{part}</p> : null;
        });
    };

    return (
        <div className={`message-wrapper flex flex-col mb-4 ${role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`chat-bubble max-w-[90%] py-3 px-4 rounded-2xl ${role === 'user' ? 'bg-blue-500 text-white rounded-br-lg' : 'bg-gray-200 text-gray-800 rounded-bl-lg'}`}>
                {renderTextWithCodeBlocks(text)}
            </div>
            {role === 'model' && (
                <div className="message-actions text-xs text-gray-500 mt-2 flex gap-3 items-center flex-wrap">
                    <button onClick={handleCopy} className="action-btn flex items-center gap-1 bg-gray-100 border border-gray-200 cursor-pointer px-2 py-1 rounded-full transition hover:bg-gray-200" title="回答をコピー">
                        {copied ? <CheckIcon /> : <CopyIcon />}
                    </button>
                    {!feedbackSent && (
                        <div className="feedback-buttons-container flex items-center gap-1">
                            <button onClick={() => handleFeedbackClick('good')} className="action-btn px-2 py-1 rounded-full hover:bg-gray-200" title="役に立った">👍</button>
                            <button onClick={() => handleFeedbackClick('bad')} className="action-btn px-2 py-1 rounded-full hover:bg-gray-200" title="役に立たなかった">👎</button>
                        </div>
                    )}
                    {feedbackSent && <span className="text-green-600 text-xs">フィードバックありがとうございます！</span>}

                    {suggestions?.map((suggestion, index) => (
                        <button key={index} onClick={() => onSuggestionClick(suggestion)} className="suggestion-btn bg-gray-100 border border-gray-200 cursor-pointer px-3 py-1 rounded-full transition hover:bg-gray-200">
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}
             {showFeedbackForm && !feedbackSent && (
                <div className="mt-4 p-4 border border-red-200 rounded-lg bg-red-50 w-full max-w-md">
                    <label htmlFor="feedback-input" className="block text-sm font-medium text-red-700 mb-2">ご不満な点など、改善のためのフィードバックをお聞かせください。</label>
                    <textarea 
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        className="w-full p-2 border-gray-300 rounded-lg" 
                        placeholder="例：指示と違う内容が出力された。もっと具体的な回答が欲しかった。" 
                        rows={2}
                    ></textarea>
                    <button onClick={submitBadFeedback} className="mt-2 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700">フィードバックを送信</button>
                </div>
            )}
        </div>
    );
};

export default ChatMessageComponent;
