export interface Umbrella {
  id: number;
  status: 'available' | 'borrowed';
  borrower?: string;
  borrowerPhone?: string;
  borrowLocation?: string;
  borrowedAt?: string;
  returnLocation?: string;
  returnedAt?: string;
}

export interface BorrowForm {
  nickname: string;
  phone: string;
  umbrellaId: number;
  location: string;
}

export interface ReturnForm {
  umbrellaId: number;
  location: string;
}

export interface Activity {
  id: string;
  type: 'borrow' | 'return';
  umbrellaId: number;
  borrower: string;
  location: string;
  timestamp: string;
}

export const LOCATIONS = [
  'ศูนย์กีฬา',
  'ใต้โดม',
  'โรงอาหาร'
] as const;

export type Location = typeof LOCATIONS[number];
