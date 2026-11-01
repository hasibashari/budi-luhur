export interface Author {
  name: string;
  role: string;
  avatarUrl: string;
  bio?: string;
}

export interface Callout {
  type: 'tip' | 'quote' | 'warning';
  title?: string;
  text: string;
}

export interface ContentSection {
  heading?: string;
  subheading?: string;
  paragraphs: string[];
  callout?: Callout;
  bulletPoints?: string[];
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  imageCaption?: string;
  readTime: string; // e.g. "4 min read"
  category: string;
  publishedAt: string;
  author?: Author | string;
  leadParagraph?: string;
  content?: string;
  sections?: ContentSection[];
  keyTakeaways?: string[];
  tags?: string[];
}

export type { SadariStepDetail, SadariReference } from '../constants/sadari.constants';


