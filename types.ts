
export interface FieldDef {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'file';
  placeholder?: string;
  required?: boolean;
  options?: string[];
  oneOf?: string;
  accept?: string;
}

export interface Task {
  name: string;
  fields: FieldDef[];
  promptTemplate: (data: TaskData) => string;
}

export interface Tasks {
  [key: string]: Task;
}

export interface TaskData {
  [key: string]: any;
  fileContent?: string;
}

export interface ChatMessagePart {
  text: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: ChatMessagePart[];
  suggestions?: string[];
  id: number;
}
