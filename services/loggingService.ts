
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSczotzOsJJmzoDUQ9GPbxtPInVEZ9nMJEX_Qd_watUJODLOTQ/formResponse";
const TASK_ENTRY_ID = "entry.2106795948";
const EVENT_ENTRY_ID = "entry.858960193";
const FEEDBACK_ENTRY_ID = "entry.1474604342";
const MODEL_ENTRY_ID = "entry.265364207";

interface LogData {
    taskName: string;
    eventType: string;
    feedbackContent?: string;
    modelName: string;
}

export async function sendLog(data: LogData) {
    const formData = new FormData();
    formData.append(TASK_ENTRY_ID, data.taskName || '');
    formData.append(EVENT_ENTRY_ID, data.eventType || '');
    formData.append(FEEDBACK_ENTRY_ID, data.feedbackContent || '');
    formData.append(MODEL_ENTRY_ID, data.modelName || '');

    try {
        await fetch(GOOGLE_FORM_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: formData
        });
    } catch (error) {
        console.error('Failed to send log:', error);
    }
}
