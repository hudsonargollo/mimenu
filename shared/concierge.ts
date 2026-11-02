export type ConciergeLang = 'es' | 'en' | 'pt' | 'de';
export type ConciergeRating = 'good' | 'bad';

export interface ConciergeTurn {
  id: string;
  venueId: string;
  sessionId: string;
  message: string;
  reply: string;
  lang: ConciergeLang;
  userName?: string | null;
  learnedId?: string | null;
  reservationSaved?: boolean;
  createdAt: string;
}

export interface ConciergeFeedback {
  turnId: string;
  rating: ConciergeRating;
  correctedReply?: string;
  triggers?: string[];
  reviewer: string;
  reviewedAt: string;
}

export interface ConciergeLearnedAnswer {
  id: string;
  lang: ConciergeLang;
  triggers: string[];
  reply: string;
  active: boolean;
  sourceTurnId?: string | null;
  createdAt: string;
}

export interface ConciergeConversation {
  sessionId: string;
  userName: string | null;
  lang: ConciergeLang;
  startedAt: string;
  lastAt: string;
  turns: Array<ConciergeTurn & { feedback?: ConciergeFeedback | null }>;
}

export interface ConciergeStats {
  turns: number;
  good: number;
  bad: number;
  unreviewed: number;
  learned: number;
}
