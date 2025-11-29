

export enum UserRole {
  ADMIN = 'ADMIN',
  INTEGRATOR = 'INTEGRATOR',
  SCR = 'SCR',
  RESIDENT = 'RESIDENT'
}

export type UserPlan = 'FREE' | 'FAMILY' | 'PREMIUM';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plan: UserPlan;
  neighborhoodId?: string; // For non-admins
  lat?: number;
  lng?: number;
  // New Profile Fields
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  photoUrl?: string;
}

export interface Neighborhood {
  id: string;
  name: string;
  iframeUrl: string;
  lat?: number;
  lng?: number;
}

export interface CameraProtocol {
  id: string;
  name: string;
  rtmp: string;
  rtsp: string;
  lat?: number;
  lng?: number;
}

export interface Alert {
  id: string;
  type: 'PANIC' | 'DANGER' | 'SUSPICIOUS' | 'OK';
  userId: string;
  userName: string;
  neighborhoodId: string;
  timestamp: Date;
  message?: string;
  image?: string; // Base64 image string
}

export interface ChatMessage {
  id: string;
  neighborhoodId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  text: string;
  timestamp: Date;
  isSystemAlert?: boolean;
  alertType?: 'PANIC' | 'DANGER' | 'SUSPICIOUS' | 'OK';
  image?: string; // Base64 image string
}

export interface Plan {
  id: string;
  name: string;
  price: string;
  features: string[];
  recommended?: boolean;
}

export interface Notification {
  id: string;
  type: 'PROTOCOL_SUBMISSION';
  title: string;
  message: string;
  data: CameraProtocol;
  fromUserName: string;
  timestamp: Date;
  read: boolean;
}