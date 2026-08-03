export type Category = 'networking' | 'virtualization' | 'cloud' | 'ai-agent';

export interface DocumentItem {
  id: string;
  title: string;
  category: Category;
  file: string;
  week?: number;
  desc?: string;
}

export interface Topic {
  id: string;
  name: string;
  desc: string;
  docs: string[];
  weeks: number[];
}

export interface Profile {
  name: string;
  nim: string;
  study: string;
  role: string;
}

export interface WeekActivity {
  title: string;
  desc?: string;
}

export interface Week {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  status: 'completed' | 'planned';
  categories: Category[];
  summary: string;
  activities: WeekActivity[];
  documents: string[];
}
