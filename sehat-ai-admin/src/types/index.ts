export type Doctor = {
  id: number;
  specialization: string;
  licenseNumber: string;
  verificationStatus: "pending" | "verified" | "rejected";
  experienceYears: number;
  consultationFee: number;
  bio: string;
  createdAt: string;
  user: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
};
