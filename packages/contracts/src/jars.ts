export type JarStatus = 'pending' | 'active' | 'completed';
export type JarType = 'own' | 'friendly';

export interface Jar {
  _id: string;
  jarId: string;
  rootJarId: string | null;
  type: JarType;
  title: string;
  goal: number;      // UAH
  balance: number;   // UAH
  order: number;
  status: JarStatus;
  activatedAt: string | null;
  completedAt: string | null;
}

export interface Collection {
  _id: string;
  jarId: string;
  title: string;
  goal: number;        // UAH
  finalBalance: number; // UAH
  activatedAt: string;
  completedAt: string;
}