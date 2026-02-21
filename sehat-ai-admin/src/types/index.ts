export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialization: string;
  licenseNumber: string; 
  status: 'pending' | 'verified' | 'rejected';
  appliedDate: string;
  avatarUrl?: string;
}