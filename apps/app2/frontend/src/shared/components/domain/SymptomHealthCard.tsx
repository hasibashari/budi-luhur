'use client';

// Re-export everything from the new 'notes' domain for backward compatibility
export * from './notes';
export { DailyNotesCard as SymptomHealthCard, DailyNotesCard as default } from './notes';
