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

export type EligibilityRules = {
  ageMin?: number;
  ageMax?: number;
  incomeMax?: number;
  categories?: string[];
  occupations?: string[];
  genders?: string[];
  states?: string[];
  tags?: string[];
};

export type Scheme = {
  _id: string;
  nameEn: string;
  nameTa: string;
  category: 'Education' | 'Business' | 'Financial' | 'Health' | 'Agriculture';
  eligibilityEn: string;
  eligibilityTa: string;
  eligibilityRules?: EligibilityRules;
  benefitsEn: string;
  benefitsTa: string;
  howToApplyEn: string;
  howToApplyTa: string;
  documentsEn: string[];
  documentsTa: string[];
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
  // A. Personal
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  maritalStatus: 'Single' | 'Married' | 'Widow' | 'Divorced';
  // B. Location
  state: string;
  district: string;
  areaType: 'Rural' | 'Urban';
  // C. Income
  annualIncome: number;
  hasIncomeCertificate: boolean;
  isBPL: boolean;
  // D. Occupation
  occupation: 'Farmer' | 'Student' | 'Govt Employee' | 'Private Employee' | 'Self Employed' | 'Unemployed' | 'Other';
  educationLevel: 'School' | 'UG' | 'PG' | 'Other' | '';
  institutionType: 'Government' | 'Private' | '';
  hasLand: boolean;
  landSize: string;
  // E. Education
  highestQualification: string;
  isCurrentlyStudying: boolean;
  // F. Social
  category: 'General' | 'OBC' | 'SC' | 'ST';
  isMinority: boolean;
  // G. Family
  familySize: number;
  earningMembers: number;
  // H. Special conditions
  isSeniorCitizen: boolean;
  isWidow: boolean;
  isDifferentlyAbled: boolean;
  isFarmer: boolean;
  isStudent: boolean;
};
