export interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'tergovchi' | 'rahbariyat';
  lastActivity: string;
}

export interface Evidence {
  id: string;
  evidenceNumber: string;
  eMaterialNumber?: string;
  eventDetails: string;
  belongsTo: string;
  items: string;
  value: string;
  receivedDate: string;
  receivedBy: string;
  storageLocation: string;
  enteredBy: string;
  images: (string | File)[];
  storageDeadline?: string;
  storageType: 'specific_date' | 'lifetime';
  status: 'active' | 'completed' | 'removed';
  createdAt: string;
  editHistory?: EditHistoryEntry[];
  removedAt?: string;
  removedBy?: string;
  removalReason?: string;
  completionReason?: string;
  completionFile?: string;
  removeReason?: string;
  removeDate?: string;
  accountFile?: string | File;
}

export interface EditHistoryEntry {
  editedAt?: string;
  editedBy: string;
  editDate: string;
  changes?: string;
  reason: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  evidenceId: string;
  timestamp: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}