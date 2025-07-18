
import React, { useState, useCallback } from 'react';
import { TASKS, AI_MODEL } from '../constants';
import { TaskData, FieldDef } from '../types';
import TaskField from './TaskField';
import Loader from './Loader';
import { StartChatIcon } from './Icons';

interface SetupFormProps {
    onStartChat: (taskKey: string, data: TaskData) => void;
    isLoading: boolean;
    error: string | null;
}

const SetupForm: React.FC<SetupFormProps> = ({ onStartChat, isLoading, error }) => {
    const [selectedTaskKey, setSelectedTaskKey] = useState(Object.keys(TASKS)[0]);
    const [formData, setFormData] = useState<TaskData>({});

    const handleTaskChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedTaskKey(e.target.value);
        setFormData({}); // Reset form data when task changes
    };

    const handleFormChange = useCallback((id: string, value: string | File) => {
        if (value instanceof File) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                setFormData(prev => ({ ...prev, [id]: text, [`${id}_name`]: value.name }));
            };
            reader.readAsText(value);
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    }, []);

    const validateForm = () => {
        const task = TASKS[selectedTaskKey];
        if (!task) return 'タスクが見つかりません。';

        const oneOfGroups: { [key: string]: string[] } = {};
        task.fields.forEach(field => {
            if (field.oneOf) {
                if (!oneOfGroups[field.oneOf]) oneOfGroups[field.oneOf] = [];
                oneOfGroups[field.oneOf].push(field.id);
            }
        });

        for (const groupName in oneOfGroups) {
            const fieldsInGroup = oneOfGroups[groupName];
            const isOneFilled = fieldsInGroup.some(fieldId => !!formData[fieldId]);
            if (!isOneFilled) return '必須項目（※どちらか必須）を入力またはアップロードしてください。';
        }

        for (const field of task.fields) {
            let isFieldRequired = field.required;
            if (field.oneOf) continue;
            
            if (field.id.includes('_custom')) {
                const selectId = field.id.replace('_custom', '_select');
                const selectValue = formData[selectId];
                if (selectValue === 'その他' || selectValue === 'その他（自由入力）') {
                     isFieldRequired = true;
                } else {
                     isFieldRequired = false;
                }
            }
            if (isFieldRequired && !formData[field.id]) {
                return '必須項目をすべて入力してください。';
            }
        }
        return null;
    };


    const handleSubmit = () => {
        const validationError = validateForm();
        if (validationError) {
             onStartChat(selectedTaskKey, { __validationError: validationError });
             return;
        }
        onStartChat(selectedTaskKey, formData);
    };

    const currentTask = TASKS[selectedTaskKey];
    const taskGroups = Object.entries(TASKS).reduce((acc, [key, task]) => {
        let group = "全社共通"; // Default group
        if (key.includes('marketing') || key.includes('persona') || key.includes('ad_copy') || key.includes('competitor') || key.includes('ga_') || key.includes('meta_') || key.includes('sitemap')) group = "マーケティング向け";
        else if (key.includes('sales') || key.includes('presentation') || key.includes('meeting_summary') || key.includes('approach_email') || key.includes('faq_generation')) group = "セールス向け";
        else if (key.includes('operation') || key.includes('product_description') || key.includes('newsletter') || key.includes('sns_post') || key.includes('formula_gen')) group = "オペレーション向け";
        else if (key.includes('cs_') || key.includes('claim_')) group = "カスタマーサポート向け";
        else if (key.includes('effort_') || key.includes('client_slide_') || key.includes('code_') || key.includes('test_') || key.includes('log_') || key.includes('sql_')) group = "エンジニア向け";
        else if (key.includes('it_') || key.includes('script_')) group = "情報システム向け";
        else if (key.includes('accounting') || key.includes('journal_entry')) group = "経理向け";

        if (!acc[group]) acc[group] = [];
        acc[group].push({ key, name: task.name });
        return acc;
    }, {} as Record<string, { key: string, name: string }[]>);

    return (
        <main id="setup-container" className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
            <div>
                <div className="mb-6">
                    <label htmlFor="task-selector" className="block text-lg font-semibold mb-2 text-gray-700">1. 用途を選択してください</label>
                    <select id="task-selector" value={selectedTaskKey} onChange={handleTaskChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                        {Object.entries(taskGroups).map(([groupName, tasks]) => (
                            <optgroup key={groupName} label={groupName}>
                                {tasks.map(task => (
                                    <option key={task.key} value={task.key}>{task.name}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </div>

                <div className="mb-6">
                    <label className="block text-lg font-semibold mb-2 text-gray-700">2. AIモデル</label>
                    <div className="w-full p-3 border border-gray-200 bg-gray-50 rounded-lg">
                        <p className="text-gray-700">Gemini 2.5 Flash (高速・コスト重視モデル) を使用します。</p>
                    </div>
                </div>

                <div id="options-container" className="mb-6">
                    <h2 className="block text-lg font-semibold mb-4 text-gray-700">3. 詳細を入力してください</h2>
                    {currentTask.fields.map(field => {
                        const isConditional = field.id.includes('_custom');
                        let isVisible = true;
                        if (isConditional) {
                             const selectId = field.id.replace('_custom', '_select');
                             const selectValue = formData[selectId];
                             isVisible = (selectValue === 'その他' || selectValue === 'その他（自由入力）');
                        }
                        return <TaskField key={field.id} field={field} formData={formData} onFormChange={handleFormChange} isConditionalVisible={isVisible} />
                    })}
                </div>

                <div className="text-center mb-6">
                    <button onClick={handleSubmit} disabled={isLoading} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 transform hover:scale-105 disabled:bg-blue-400 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center mx-auto">
                        {isLoading ? (
                            <>
                                <Loader size="24px" className="mr-3" />
                                <span>生成中...</span>
                            </>
                        ) : (
                            <>
                                <StartChatIcon />
                                <span>チャットを開始する</span>
                            </>
                        )}
                    </button>
                </div>

                {error && <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg">{error}</div>}
            </div>
        </main>
    );
};

export default SetupForm;
