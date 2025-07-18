
import React from 'react';
import { FieldDef, TaskData } from '../types';

interface TaskFieldProps {
    field: FieldDef;
    formData: TaskData;
    onFormChange: (id: string, value: string | File) => void;
    isConditionalVisible?: boolean;
}

const TaskField: React.FC<TaskFieldProps> = ({ field, formData, onFormChange, isConditionalVisible = true }) => {
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFormChange(field.id, file);
        }
    };

    if (!isConditionalVisible) {
        return null;
    }

    return (
        <div className="mb-4">
            <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
                {field.required && !field.oneOf && <span className="text-red-500 ml-2">※必須</span>}
                {field.oneOf && <span className="text-red-500 ml-2">※どちらか必須</span>}
            </label>
            {field.type === 'textarea' && (
                <textarea
                    id={field.id}
                    rows={5}
                    placeholder={field.placeholder || ''}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    value={formData[field.id] || ''}
                    onChange={(e) => onFormChange(field.id, e.target.value)}
                />
            )}
            {field.type === 'select' && (
                <select
                    id={field.id}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    value={formData[field.id] || field.options?.[0] || ''}
                    onChange={(e) => onFormChange(field.id, e.target.value)}
                >
                    {field.options?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            )}
            {(field.type === 'text' || field.type === 'number') && (
                <input
                    id={field.id}
                    type={field.type}
                    placeholder={field.placeholder || ''}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    value={formData[field.id] || ''}
                    onChange={(e) => onFormChange(field.id, e.target.value)}
                />
            )}
            {field.type === 'file' && (
                <div>
                     <label className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 flex items-center justify-center">
                        <span>ファイルを選択</span>
                        <input
                            id={field.id}
                            type="file"
                            accept={field.accept || ".txt,.log,.js,.py,.html,.css,.sql,.csv,.md,.xls,.xlsx"}
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </label>
                    <span className="ml-2 text-sm text-gray-600">
                        {formData[`${field.id}_name`] || '選択されていません'}
                    </span>
                </div>
            )}
        </div>
    );
};

export default TaskField;
