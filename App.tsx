
import React, { useState, useCallback } from 'react';
import SetupForm from './components/SetupForm';
import ChatInterface from './components/ChatInterface';
import { Task, TaskData, ChatMessage } from './types';
import { TASKS, AI_MODEL } from './constants';
import * as geminiService from './services/geminiService';
import { sendLog } from './services/loggingService';

const App: React.FC = () => {
    const [view, setView] = useState<'setup' | 'chat'>('setup');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [currentTask, setCurrentTask] = useState<Task | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleStartChat = useCallback(async (taskKey: string, data: TaskData) => {
        if(data.__validationError) {
            setError(data.__validationError);
            return;
        }

        const task = TASKS[taskKey];
        if (!task) {
            setError("選択されたタスクが見つかりません。");
            return;
        }

        setIsLoading(true);
        setError(null);
        setCurrentTask(task);
        
        try {
            const initialPrompt = task.promptTemplate(data);
            const initialUserMessage: ChatMessage = { role: 'user', parts: [{ text: initialPrompt }], id: 0 };
            
            sendLog({
                taskName: task.name,
                eventType: '実行',
                modelName: AI_MODEL,
            });

            setChatHistory([initialUserMessage]);
            const resultText = await geminiService.generateContent([initialUserMessage]);
            const suggestions = await geminiService.getSuggestedActions(resultText);

            const modelResponse: ChatMessage = { role: 'model', parts: [{ text: resultText }], suggestions, id: 1 };
            
            setChatHistory(prev => [...prev, modelResponse]);
            setView('chat');

        } catch (e) {
            if (e instanceof Error) {
                 setError(`エラーが発生しました: ${e.message}`);
            } else {
                 setError('不明なエラーが発生しました。');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleSendMessage = useCallback(async (message: string) => {
        setIsLoading(true);
        const newUserMessage: ChatMessage = { role: 'user', parts: [{ text: message }], id: chatHistory.length };
        const newHistory = [...chatHistory, newUserMessage];
        setChatHistory(newHistory);

        try {
            const resultText = await geminiService.generateContent(newHistory);
            const suggestions = await geminiService.getSuggestedActions(resultText);
            const modelResponse: ChatMessage = { role: 'model', parts: [{ text: resultText }], suggestions, id: newHistory.length };
            setChatHistory(prev => [...prev, modelResponse]);
        } catch (e) {
             if (e instanceof Error) {
                const errorMessage: ChatMessage = { role: 'model', parts: [{ text: `エラー: ${e.message}` }], id: newHistory.length };
                setChatHistory(prev => [...prev, errorMessage]);
            }
        } finally {
            setIsLoading(false);
        }
    }, [chatHistory]);

    const handleReset = useCallback(() => {
        setView('setup');
        setChatHistory([]);
        setCurrentTask(null);
        setError(null);
        setIsLoading(false);
    }, []);

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-5xl">
            <header className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Gemini活用支援ツール</h1>
                <p className="mt-2 text-gray-600">各部門の業務に特化した、より実践的なAI活用をサポートします。</p>
            </header>

            {view === 'setup' ? (
                <SetupForm onStartChat={handleStartChat} isLoading={isLoading} error={error} />
            ) : currentTask && (
                <ChatInterface 
                    chatHistory={chatHistory}
                    currentTask={currentTask}
                    onSendMessage={handleSendMessage}
                    onReset={handleReset}
                    isLoading={isLoading}
                    onSuggestion={handleSendMessage}
                />
            )}

            <footer className="text-center mt-8 text-sm text-gray-500">
                <p>&copy; 2024 Gemini Utilization Support Tool</p>
            </footer>
        </div>
    );
};

export default App;
