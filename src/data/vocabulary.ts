import type { VocabWord } from '../types';
import data from './vocabulary.json';

export const vocabulary = data as VocabWord[];
export const categories = [...new Set(vocabulary.map(w => w.category))];
export const levels = ['A1', 'A2', 'B1', 'B2'] as const;
