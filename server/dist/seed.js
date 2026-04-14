import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { Service } from "./src/models/Service.js";
import { Scheme } from "./src/models/Scheme.js";
import { Office } from "./src/models/Office.js";
import { User } from "./src/models/User.js";
const services = [
    ["Aadhaar Update", "ஆதார் புதுப்பிப்பு", "Update demographic details in Aadhaar.", "ஆதாரில் விவரங்களை புதுப்பிக்கவும்."],
    ["Community Certificate", "சமூகச் சான்றிதழ்", "Apply for official community certificate.", "அதிகாரப்பூர்வ சமூகச் சான்றிதழுக்கு விண்ணப்பிக்கவும்."],
    ["Passport", "பாஸ்போர்ட்", "Apply for fresh or reissue passport.", "புதிய அல்லது புதுப்பிப்பு பாஸ்போர்ட் விண்ணப்பம்."],
    ["Smart Card", "ஸ்மார்ட் கார்டு", "Family ration smart card services.", "குடும்ப ரேஷன் ஸ்மார்ட் கார்டு சேவைகள்."],
    ["Income Certificate", "வருமானச் சான்றிதழ்", "Get certificate for scholarships and subsidies.", "உதவித்தொகை/தள்ளுபடிக்கு வருமானச் சான்றிதழ்."],
    ["Birth Certificate", "பிறப்பு சான்றிதழ்", "Register and download birth certificate.", "பிறப்பு பதிவு மற்றும் சான்றிதழ் பதிவிறக்கம்."],
    ["Caste Certificate", "ஜாதி சான்றிதழ்", "Apply via e-Sevai for caste certificate.", "e-Sevai மூலம் ஜாதி சான்றிதழுக்கு விண்ணப்பிக்கவும்."],
    ["Driving License", "ஓட்டுநர் உரிமம்", "Apply for learner/permanent driving license.", "லர்னர்/நிரந்தர ஓட்டுநர் உரிமம் விண்ணப்பம்."]
].map((s, i) => ({
    nameEn: s[0], nameTa: s[1], descriptionEn: s[2], descriptionTa: s[3],
    stepsEn: ["Create account", "Fill online form", "Upload documents", "Book appointment", "Track status"],
    stepsTa: ["கணக்கு உருவாக்கவும்", "ஆன்லைன் படிவம் நிரப்பவும்", "ஆவணங்கள் பதிவேற்றவும்", "அப்பாயிண்ட்மெண்ட் பதிவு செய்யவும்", "நிலையை கண்காணிக்கவும்"],
    documentsEn: ["ID proof", "Address proof", "Passport photo"],
    documentsTa: ["அடையாள ஆவணம்", "முகவரி ஆவணம்", "பாஸ்போர்ட் புகைப்படம்"],
    legalDetailsEn: "Issued under relevant Indian government citizen service rules.",
    legalDetailsTa: "இந்திய அரசின் குடிமக்கள் சேவை விதிகளின் கீழ் வழங்கப்படுகிறது.",
    officialPortalUrl: "https://www.tnesevai.tn.gov.in",
    icon: ["🪪", "📜", "🛂", "💳", "💰", "👶", "🏷️", "🚗"][i]
}));
const schemes = [
    ["PM Kisan", "பிஎம் கிசான்", "Agriculture"],
    ["TN Scholarship", "தமிழ்நாடு உதவித்தொகை", "Education"],
    ["MSME Loan", "எம்எஸ்எம்இ கடன்", "Business"],
    ["Ayushman Bharat", "ஆயுஷ்மான் பாரத்", "Health"],
    ["PM SVANidhi", "பிஎம் ஸ்வநிதி", "Financial"],
    ["Uzhavar Security", "உழவர் பாதுகாப்பு", "Agriculture"],
    ["Startup TN", "ஸ்டார்ட்அப் தமிழ்நாடு", "Business"],
    ["Girl Child Aid", "பெண் குழந்தை நிதி", "Education"]
].map((s) => ({
    nameEn: s[0], nameTa: s[1], category: s[2],
    eligibilityEn: "Eligible Indian citizens meeting scheme criteria.",
    eligibilityTa: "திட்ட விதிமுறைகளை பூர்த்தி செய்யும் தகுதியான இந்திய குடிமக்கள்.",
    benefitsEn: "Financial support, subsidies, and welfare benefits.",
    benefitsTa: "நிதி உதவி, மானியம் மற்றும் நலன்கள்.",
    howToApplyEn: "Apply online through official portal or nearest e-Sevai center.",
    howToApplyTa: "அதிகாரப்பூர்வ தளம் அல்லது அருகிலுள்ள e-Sevai மையத்தில் விண்ணப்பிக்கவும்.",
    officialLink: "https://www.india.gov.in"
}));
const offices = [
    ["Chennai e-Sevai Center", "Teynampet, Chennai", 13.0418, 80.2472],
    ["Anna Nagar Taluk Office", "Anna Nagar, Chennai", 13.0867, 80.2101],
    ["Velachery e-District Office", "Velachery, Chennai", 12.9807, 80.2209],
    ["Guindy Citizen Service Center", "Guindy, Chennai", 13.0067, 80.2206],
    ["Tambaram Taluk Office", "Tambaram, Chennai", 12.9249, 80.1275]
].map((o) => ({
    name: o[0],
    address: o[1],
    latitude: o[2],
    longitude: o[3],
    workingHours: "Mon-Sat 10:00 AM - 5:30 PM",
    servicesOffered: ["Certificates", "Scheme Assistance", "Application Tracking"]
}));
async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    await Promise.all([Service.deleteMany({}), Scheme.deleteMany({}), Office.deleteMany({}), User.deleteMany({})]);
    await Promise.all([Service.insertMany(services), Scheme.insertMany(schemes), Office.insertMany(offices)]);
    const passwordHash = await bcrypt.hash("Admin@123", 10);
    await User.create({ name: "Admin", email: "admin@legalease.com", passwordHash, role: "admin" });
    // eslint-disable-next-line no-console
    console.log("Seed complete");
    await mongoose.disconnect();
}
seed();
