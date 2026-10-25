export interface ArticleReference {
  id: string;
  title: string;
  category: string;
}

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
  errorType?: 'QUOTA_EXCEEDED' | 'NETWORK_ERROR' | 'SERVER_ERROR' | 'CONFIG_ERROR';
  isError?: boolean;
  references?: ArticleReference[];
}
