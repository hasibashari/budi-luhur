export interface ConsultationTopic {
  id: string;
  icon: string;
  title: string;
  category: string;
  prompt: string;
  initialAnswer: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
