import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: { translation: { home: 'Home', services: 'Document Services', schemes: 'Schemes', offices: 'Nearby Offices', login: 'Login', saves: 'My Saves', myEligibility: 'My Eligibility', hero: 'Government Services Made Simple', search: 'Search services or schemes...' } },
  ta: { translation: { home: 'முகப்பு', services: 'ஆவண சேவைகள்', schemes: 'திட்டங்கள்', offices: 'அருகிலுள்ள அலுவலகங்கள்', login: 'உள்நுழைவு', saves: 'எனது சேமிப்புகள்', myEligibility: 'என் தகுதி', hero: 'அரசு சேவைகள் எளிதாக', search: 'சேவை அல்லது திட்டம் தேடுங்கள்...' } },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
