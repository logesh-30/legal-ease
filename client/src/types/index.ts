export type Service = {
  _id: string;
  nameEn: string;
  nameTa: string;
  descriptionEn: string;
  descriptionTa: string;
  stepsEn: string[];
  stepsTa: string[];
  documentsEn: string[];
  documentsTa: string[];
  legalDetailsEn: string;
  legalDetailsTa: string;
  officialPortalUrl: string;
  icon: string;
};

export type Scheme = {
  _id: string;
  nameEn: string;
  nameTa: string;
  category: 'Education' | 'Business' | 'Financial' | 'Health' | 'Agriculture';
  eligibilityEn: string;
  eligibilityTa: string;
  benefitsEn: string;
  benefitsTa: string;
  howToApplyEn: string;
  howToApplyTa: string;
  officialLink: string;
};

export type Office = {
  _id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  workingHours: string;
  servicesOffered: string[];
};

export type User = { _id: string; name: string; email: string; role: 'user' | 'admin' };

export type EligibilityProfile = {
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  annualIncome: number;
  occupation: 'Farmer' | 'Student' | 'Salaried' | 'Self Employed' | 'Unemployed' | 'Other';
  category: 'General' | 'OBC' | 'SC' | 'ST';
  state: string;
  isStudent: boolean;
  isFarmer: boolean;
  isSeniorCitizen: boolean;
  isDifferentlyAbled: boolean;
};
