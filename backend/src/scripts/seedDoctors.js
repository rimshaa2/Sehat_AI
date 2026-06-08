// ─── backend/src/scripts/seedDoctors.js ──────────────────────────────────────
// Run with: node src/scripts/seedDoctors.js
// 
// SAFE SEED — does NOT use force:true. Will not wipe your database.
// Only adds doctors that don't already exist (checked by email).
// Adds 60 doctors across 20 specializations with full Pakistani context.
// Each doctor gets Mon–Sat availability, 9AM–5PM.
//
// After running, the AI assistant can recommend doctors by specialty
// based on patient symptoms with high accuracy.
// ─────────────────────────────────────────────────────────────────────────────

const { sequelize, User, Doctor, Availability } = require("../models");

// ── Doctor data ───────────────────────────────────────────────────────────────
// 60 doctors covering every major specialty the AI may recommend
// Pakistani names, realistic fees in PKR, bios tailored to specialty
const DOCTORS = [

  // ── CARDIOLOGY (Heart conditions, chest pain, blood pressure) ────────────
  {
    name: "Dr. Imran Khalid",       email: "imran.khalid@sehat.com",
    spec: "Cardiology",             fee: 3500, exp: 18,
    gender: "Male",
    bio: "Senior Cardiologist at PIMS Islamabad with 18 years of experience in interventional cardiology, ECG interpretation, and management of heart failure, arrhythmias, and hypertension.",
    license: "PMC-10201",
  },
  {
    name: "Dr. Sadia Farooq",       email: "sadia.farooq@sehat.com",
    spec: "Cardiology",             fee: 3000, exp: 12,
    gender: "Female",
    bio: "Consultant Cardiologist specialising in preventive cardiology, lipid disorders, and cardiac rehabilitation. Fellow of Pakistan Cardiac Society.",
    license: "PMC-10202",
  },
  {
    name: "Dr. Tariq Mehmood",      email: "tariq.mehmood@sehat.com",
    spec: "Cardiology",             fee: 4000, exp: 22,
    gender: "Male",
    bio: "Interventional Cardiologist with expertise in angioplasty, stenting, and pacemaker implantation. Former Head of Cardiology at Shaukat Khanum Hospital.",
    license: "PMC-10203",
  },

  // ── DERMATOLOGY (Skin, hair, nails) ─────────────────────────────────────
  {
    name: "Dr. Hina Baig",          email: "hina.baig@sehat.com",
    spec: "Dermatology",            fee: 2500, exp: 10,
    gender: "Female",
    bio: "Certified Dermatologist treating acne, eczema, psoriasis, fungal infections, and performing chemical peels and laser procedures. Trained at Aga Khan University.",
    license: "PMC-10204",
  },
  {
    name: "Dr. Zubair Siddiqui",    email: "zubair.siddiqui@sehat.com",
    spec: "Dermatology",            fee: 2800, exp: 14,
    gender: "Male",
    bio: "Specialist in hair loss (alopecia), vitiligo, rosacea, and skin cancer screening. Member of Pakistan Association of Dermatologists.",
    license: "PMC-10205",
  },
  {
    name: "Dr. Amna Riaz",          email: "amna.riaz@sehat.com",
    spec: "Dermatology",            fee: 2200, exp: 7,
    gender: "Female",
    bio: "Dermatologist with expertise in paediatric skin conditions, urticaria, contact dermatitis, and cosmetic dermatology including botox and fillers.",
    license: "PMC-10206",
  },

  // ── GENERAL PRACTICE (Fever, flu, common infections) ────────────────────
  {
    name: "Dr. Kamran Ali",         email: "kamran.ali@sehat.com",
    spec: "General Practice",       fee: 1200, exp: 8,
    gender: "Male",
    bio: "General Practitioner managing fever, flu, infections, minor injuries, and chronic disease follow-ups. Providing primary care in Islamabad for over 8 years.",
    license: "PMC-10207",
  },
  {
    name: "Dr. Farrukh Naz",        email: "farrukh.naz@sehat.com",
    spec: "General Practice",       fee: 1000, exp: 5,
    gender: "Male",
    bio: "Family physician managing all acute and chronic conditions. Expert in vaccinations, health screenings, and preventive care for all age groups.",
    license: "PMC-10208",
  },
  {
    name: "Dr. Rabia Chaudhry",     email: "rabia.chaudhry@sehat.com",
    spec: "General Practice",       fee: 1500, exp: 11,
    gender: "Female",
    bio: "Experienced GP with special interest in women's health, thyroid disorders, and diabetes management. Available for walk-in and telehealth consultations.",
    license: "PMC-10209",
  },

  // ── GASTROENTEROLOGY (Stomach, digestive, liver) ────────────────────────
  {
    name: "Dr. Hassan Qureshi",     email: "hassan.qureshi@sehat.com",
    spec: "Gastroenterology",       fee: 3200, exp: 16,
    gender: "Male",
    bio: "Gastroenterologist specialising in acidity, GERD, peptic ulcers, IBS, Crohn's disease, hepatitis B & C, and liver cirrhosis. Performs endoscopy and colonoscopy.",
    license: "PMC-10210",
  },
  {
    name: "Dr. Nadia Hussain",      email: "nadia.hussain@sehat.com",
    spec: "Gastroenterology",       fee: 2800, exp: 12,
    gender: "Female",
    bio: "Consultant Gastroenterologist with expertise in inflammatory bowel disease, fatty liver disease (NAFLD), and gastrointestinal cancers.",
    license: "PMC-10211",
  },

  // ── NEUROLOGY (Headaches, migraines, nerve, brain) ─────────────────────
  {
    name: "Dr. Usman Raza",         email: "usman.raza@sehat.com",
    spec: "Neurology",              fee: 3500, exp: 15,
    gender: "Male",
    bio: "Neurologist treating migraines, epilepsy, Parkinson's disease, multiple sclerosis, stroke, and nerve disorders. Trained at King Edward Medical University.",
    license: "PMC-10212",
  },
  {
    name: "Dr. Fatima Noor",        email: "fatima.noor@sehat.com",
    spec: "Neurology",              fee: 3000, exp: 10,
    gender: "Female",
    bio: "Specialist in headache disorders, vertigo, carpal tunnel syndrome, and neuro-rehabilitation post-stroke. Fellow of Pakistan Society of Neurology.",
    license: "PMC-10213",
  },
  {
    name: "Dr. Bilal Tariq",        email: "bilal.tariq@sehat.com",
    spec: "Neurology",              fee: 4000, exp: 20,
    gender: "Male",
    bio: "Senior Neurologist with subspecialty in movement disorders, dementia, and neuromuscular diseases. Performs nerve conduction studies and EEG.",
    license: "PMC-10214",
  },

  // ── ORTHOPAEDICS (Bones, joints, back pain) ─────────────────────────────
  {
    name: "Dr. Asim Butt",          email: "asim.butt@sehat.com",
    spec: "Orthopaedics",           fee: 3000, exp: 14,
    gender: "Male",
    bio: "Orthopaedic Surgeon specialising in knee and hip replacements, sports injuries, fracture management, and spine disorders including slipped disc.",
    license: "PMC-10215",
  },
  {
    name: "Dr. Sana Malik",         email: "sana.malik@sehat.com",
    spec: "Orthopaedics",           fee: 2500, exp: 9,
    gender: "Female",
    bio: "Orthopaedic Specialist focusing on paediatric orthopaedics, osteoporosis management, and physiotherapy-integrated bone and joint care.",
    license: "PMC-10216",
  },
  {
    name: "Dr. Naveed Iqbal",       email: "naveed.iqbal@sehat.com",
    spec: "Orthopaedics",           fee: 3500, exp: 18,
    gender: "Male",
    bio: "Expert in arthroscopic surgeries, ligament reconstruction, and non-surgical management of chronic back pain and sciatica.",
    license: "PMC-10217",
  },

  // ── PSYCHIATRY & MENTAL HEALTH ───────────────────────────────────────────
  {
    name: "Dr. Sarah Ahmed",        email: "sarah.ahmed@sehat.com",
    spec: "Psychiatry",             fee: 3500, exp: 13,
    gender: "Female",
    bio: "Psychiatrist treating depression, anxiety, OCD, PTSD, bipolar disorder, and schizophrenia. Provides medication management and supportive psychotherapy.",
    license: "PMC-10218",
  },
  {
    name: "Dr. Ahsan Mirza",        email: "ahsan.mirza@sehat.com",
    spec: "Psychiatry",             fee: 3000, exp: 10,
    gender: "Male",
    bio: "Consultant Psychiatrist specialising in adult mental health, addiction medicine, eating disorders, and sleep disorders. CBT-trained.",
    license: "PMC-10219",
  },
  {
    name: "Dr. Zara Hashmi",        email: "zara.hashmi@sehat.com",
    spec: "Psychiatry",             fee: 2800, exp: 8,
    gender: "Female",
    bio: "Child and adolescent psychiatrist managing ADHD, autism spectrum disorders, learning disabilities, and childhood anxiety in ages 5–18.",
    license: "PMC-10220",
  },

  // ── PULMONOLOGY (Lungs, breathing, asthma) ──────────────────────────────
  {
    name: "Dr. Kashif Lodhi",       email: "kashif.lodhi@sehat.com",
    spec: "Pulmonology",            fee: 3000, exp: 13,
    gender: "Male",
    bio: "Pulmonologist treating asthma, COPD, bronchitis, pneumonia, tuberculosis, and sleep apnoea. Performs spirometry and bronchoscopy.",
    license: "PMC-10221",
  },
  {
    name: "Dr. Ayesha Rao",         email: "ayesha.rao@sehat.com",
    spec: "Pulmonology",            fee: 2800, exp: 9,
    gender: "Female",
    bio: "Respiratory Medicine Specialist with expertise in interstitial lung disease, pulmonary hypertension, and allergy-induced asthma management.",
    license: "PMC-10222",
  },

  // ── ENDOCRINOLOGY (Diabetes, thyroid, hormones) ─────────────────────────
  {
    name: "Dr. Mariam Zahid",       email: "mariam.zahid@sehat.com",
    spec: "Endocrinology",          fee: 3200, exp: 14,
    gender: "Female",
    bio: "Endocrinologist managing Type 1 & 2 Diabetes, hypothyroidism, hyperthyroidism, PCOS, adrenal disorders, and obesity-related hormonal issues.",
    license: "PMC-10223",
  },
  {
    name: "Dr. Faisal Chaudhry",    email: "faisal.chaudhry@sehat.com",
    spec: "Endocrinology",          fee: 3000, exp: 11,
    gender: "Male",
    bio: "Consultant Endocrinologist with special interest in insulin pump therapy, diabetic foot care, and thyroid nodule management.",
    license: "PMC-10224",
  },

  // ── UROLOGY (Kidney, urinary tract, prostate) ───────────────────────────
  {
    name: "Dr. Khalid Mahmood",     email: "khalid.mahmood@sehat.com",
    spec: "Urology",                fee: 3500, exp: 17,
    gender: "Male",
    bio: "Urologist specialising in kidney stones, UTIs, benign prostatic hyperplasia (BPH), urinary incontinence, and laparoscopic urological surgeries.",
    license: "PMC-10225",
  },
  {
    name: "Dr. Sobia Akhtar",       email: "sobia.akhtar@sehat.com",
    spec: "Urology",                fee: 3000, exp: 10,
    gender: "Female",
    bio: "Female urologist with expertise in female pelvic floor disorders, recurrent UTIs, interstitial cystitis, and paediatric urology.",
    license: "PMC-10226",
  },

  // ── GYNAECOLOGY & OBSTETRICS ─────────────────────────────────────────────
  {
    name: "Dr. Nazia Pervez",       email: "nazia.pervez@sehat.com",
    spec: "Gynaecology",            fee: 2800, exp: 15,
    gender: "Female",
    bio: "Obstetrician and Gynaecologist managing high-risk pregnancies, PCOS, endometriosis, menstrual disorders, and performing laparoscopic surgeries.",
    license: "PMC-10227",
  },
  {
    name: "Dr. Bushra Kamal",       email: "bushra.kamal@sehat.com",
    spec: "Gynaecology",            fee: 2500, exp: 11,
    gender: "Female",
    bio: "Gynaecologist with expertise in infertility treatment, contraception counselling, menopause management, and cervical cancer screening.",
    license: "PMC-10228",
  },
  {
    name: "Dr. Tahira Sadiq",       email: "tahira.sadiq@sehat.com",
    spec: "Gynaecology",            fee: 3200, exp: 19,
    gender: "Female",
    bio: "Senior Consultant Gynaecologist and Maternal Foetal Medicine specialist managing complicated deliveries, gestational diabetes, and foetal anomalies.",
    license: "PMC-10229",
  },

  // ── PAEDIATRICS (Children's health) ─────────────────────────────────────
  {
    name: "Dr. Asma Javed",         email: "asma.javed@sehat.com",
    spec: "Paediatrics",            fee: 2000, exp: 12,
    gender: "Female",
    bio: "Paediatrician managing newborn care, childhood infections, malnutrition, developmental delays, and routine vaccinations for children aged 0–16.",
    license: "PMC-10230",
  },
  {
    name: "Dr. Omer Farooq",        email: "omer.farooq@sehat.com",
    spec: "Paediatrics",            fee: 1800, exp: 8,
    gender: "Male",
    bio: "General Paediatrician with special interest in paediatric gastroenterology, neonatal jaundice, and childhood asthma management.",
    license: "PMC-10231",
  },
  {
    name: "Dr. Lubna Aslam",        email: "lubna.aslam@sehat.com",
    spec: "Paediatrics",            fee: 2200, exp: 15,
    gender: "Female",
    bio: "Senior Paediatrician specialising in paediatric infectious diseases, chronic illness management, and adolescent health including puberty disorders.",
    license: "PMC-10232",
  },

  // ── EAR, NOSE & THROAT ───────────────────────────────────────────────────
  {
    name: "Dr. Ayesha Khan",        email: "ayesha.khan@sehat.com",
    spec: "Ear, Nose & Throat",     fee: 2500, exp: 12,
    gender: "Female",
    bio: "ENT Specialist treating sinusitis, tonsillitis, hearing loss, nasal polyps, vertigo, and performing ear surgeries and nasal endoscopies.",
    license: "PMC-10233",
  },
  {
    name: "Dr. Hina Altaf",         email: "hina.altaf@sehat.com",
    spec: "Ear, Nose & Throat",     fee: 2800, exp: 14,
    gender: "Female",
    bio: "Head and Neck Surgeon specialising in thyroid surgery, parotid tumours, and advanced ENT procedures. Trained at Lahore General Hospital.",
    license: "PMC-10234",
  },
  {
    name: "Dr. Rizwan Butt",        email: "rizwan.butt@sehat.com",
    spec: "Ear, Nose & Throat",     fee: 2200, exp: 9,
    gender: "Male",
    bio: "ENT Specialist with expertise in allergy management, snoring and sleep apnoea, and paediatric ENT conditions including adenoid removal.",
    license: "PMC-10235",
  },

  // ── OPHTHALMOLOGY (Eye conditions) ──────────────────────────────────────
  {
    name: "Dr. Waqas Saleem",       email: "waqas.saleem@sehat.com",
    spec: "Ophthalmology",          fee: 2500, exp: 11,
    gender: "Male",
    bio: "Ophthalmologist treating refractive errors, cataracts, glaucoma, diabetic retinopathy, and performing LASIK and cataract surgeries.",
    license: "PMC-10236",
  },
  {
    name: "Dr. Shazia Anwar",       email: "shazia.anwar@sehat.com",
    spec: "Ophthalmology",          fee: 2200, exp: 8,
    gender: "Female",
    bio: "Retina Specialist managing macular degeneration, retinal detachment, and vitreous disorders. Performs intravitreal injections and retinal laser therapy.",
    license: "PMC-10237",
  },

  // ── DENTAL ──────────────────────────────────────────────────────────────
  {
    name: "Dr. Ali Raza",           email: "ali.raza@sehat.com",
    spec: "Dental",                 fee: 1500, exp: 10,
    gender: "Male",
    bio: "General Dentist providing dental cleanings, fillings, extractions, root canals, and crowns. Expert in paediatric dentistry and dental anxiety management.",
    license: "PMC-10238",
  },
  {
    name: "Dr. Sana Babar",         email: "sana.babar@sehat.com",
    spec: "Dental",                 fee: 2000, exp: 7,
    gender: "Female",
    bio: "Orthodontist specialising in braces, Invisalign, teeth alignment, and cosmetic dentistry including whitening and veneers.",
    license: "PMC-10239",
  },
  {
    name: "Dr. Usman Shah",         email: "usman.shah@sehat.com",
    spec: "Dental",                 fee: 2500, exp: 13,
    gender: "Male",
    bio: "Oral and Maxillofacial Surgeon performing wisdom tooth extractions, jaw surgeries, dental implants, and treatment of oral cancers.",
    license: "PMC-10240",
  },

  // ── NEPHROLOGY (Kidney disease) ─────────────────────────────────────────
  {
    name: "Dr. Salman Haider",      email: "salman.haider@sehat.com",
    spec: "Nephrology",             fee: 3500, exp: 16,
    gender: "Male",
    bio: "Nephrologist managing chronic kidney disease (CKD), acute kidney injury, glomerulonephritis, and dialysis programmes. Transplant physician at PIMS.",
    license: "PMC-10241",
  },
  {
    name: "Dr. Iffat Zaman",        email: "iffat.zaman@sehat.com",
    spec: "Nephrology",             fee: 3000, exp: 12,
    gender: "Female",
    bio: "Kidney specialist treating diabetic nephropathy, hypertensive kidney disease, polycystic kidney disease, and managing kidney stone recurrence prevention.",
    license: "PMC-10242",
  },

  // ── RHEUMATOLOGY (Arthritis, joint, autoimmune) ─────────────────────────
  {
    name: "Dr. Ghazala Nasir",      email: "ghazala.nasir@sehat.com",
    spec: "Rheumatology",           fee: 3200, exp: 14,
    gender: "Female",
    bio: "Rheumatologist treating rheumatoid arthritis, lupus, gout, ankylosing spondylitis, fibromyalgia, and Sjogren's syndrome with biologic therapies.",
    license: "PMC-10243",
  },
  {
    name: "Dr. Adnan Malik",        email: "adnan.malik@sehat.com",
    spec: "Rheumatology",           fee: 2800, exp: 10,
    gender: "Male",
    bio: "Consultant Rheumatologist with expertise in osteoarthritis management, joint injections, and autoimmune disease monitoring.",
    license: "PMC-10244",
  },

  // ── ONCOLOGY (Cancer) ────────────────────────────────────────────────────
  {
    name: "Dr. Noman Latif",        email: "noman.latif@sehat.com",
    spec: "Oncology",               fee: 5000, exp: 20,
    gender: "Male",
    bio: "Medical Oncologist at Shaukat Khanum managing breast, lung, colorectal, and haematological cancers. Expert in chemotherapy and immunotherapy protocols.",
    license: "PMC-10245",
  },
  {
    name: "Dr. Kiran Shahid",       email: "kiran.shahid@sehat.com",
    spec: "Oncology",               fee: 4500, exp: 15,
    gender: "Female",
    bio: "Consultant Oncologist specialising in gynaecological cancers, targeted therapy, and palliative care for end-stage malignancies.",
    license: "PMC-10246",
  },

  // ── HAEMATOLOGY (Blood disorders) ───────────────────────────────────────
  {
    name: "Dr. Saad Rauf",          email: "saad.rauf@sehat.com",
    spec: "Haematology",            fee: 3500, exp: 13,
    gender: "Male",
    bio: "Haematologist managing anaemia, thalassaemia, sickle cell disease, leukaemia, lymphoma, and bleeding disorders including haemophilia.",
    license: "PMC-10247",
  },

  // ── ALLERGY & IMMUNOLOGY ─────────────────────────────────────────────────
  {
    name: "Dr. Naila Qureshi",      email: "naila.qureshi@sehat.com",
    spec: "Allergy & Immunology",   fee: 2800, exp: 11,
    gender: "Female",
    bio: "Allergist and Immunologist treating food allergies, drug allergies, allergic rhinitis, urticaria, angioedema, and primary immunodeficiency disorders.",
    license: "PMC-10248",
  },
  {
    name: "Dr. Tahir Mehmood",      email: "tahir.mehmood@sehat.com",
    spec: "Allergy & Immunology",   fee: 2500, exp: 9,
    gender: "Male",
    bio: "Specialist in allergen immunotherapy (allergy shots), asthma and allergy overlap, and occupational allergy management.",
    license: "PMC-10249",
  },

  // ── INFECTIOUS DISEASE ──────────────────────────────────────────────────
  {
    name: "Dr. Arsalan Jamil",      email: "arsalan.jamil@sehat.com",
    spec: "Infectious Disease",     fee: 2800, exp: 12,
    gender: "Male",
    bio: "Infectious Disease Specialist managing typhoid, dengue, malaria, tuberculosis, HIV/AIDS, hepatitis, and antibiotic-resistant infections.",
    license: "PMC-10250",
  },

  // ── MENTAL WELLNESS ──────────────────────────────────────────────────────
  {
    name: "Dr. Bilal Sheikh",       email: "bilal.sheikh@sehat.com",
    spec: "Mental wellness",        fee: 2500, exp: 10,
    gender: "Male",
    bio: "Clinical Psychologist providing CBT, mindfulness-based therapy, and supportive counselling for anxiety, depression, and stress-related disorders.",
    license: "PMC-10251",
  },
  {
    name: "Dr. Huma Zaidi",         email: "huma.zaidi@sehat.com",
    spec: "Mental wellness",        fee: 2200, exp: 8,
    gender: "Female",
    bio: "Counselling Psychologist specialising in relationship counselling, trauma therapy, grief support, and workplace burnout recovery.",
    license: "PMC-10252",
  },

  // ── BONES ────────────────────────────────────────────────────────────────
  {
    name: "Dr. Rafique Ahmed",      email: "rafique.ahmed@sehat.com",
    spec: "Bones",                  fee: 2500, exp: 12,
    gender: "Male",
    bio: "Orthopaedic Bone Specialist treating fractures, bone infections (osteomyelitis), osteoporosis, and metabolic bone diseases.",
    license: "PMC-10253",
  },

  // ── GENERAL SURGERY ──────────────────────────────────────────────────────
  {
    name: "Dr. Zafar Iqbal",        email: "zafar.iqbal@sehat.com",
    spec: "General Surgery",        fee: 4000, exp: 20,
    gender: "Male",
    bio: "General Surgeon performing appendectomies, hernia repairs, gallbladder removal, colorectal surgeries, and laparoscopic procedures.",
    license: "PMC-10254",
  },
  {
    name: "Dr. Madiha Tahir",       email: "madiha.tahir@sehat.com",
    spec: "General Surgery",        fee: 3500, exp: 14,
    gender: "Female",
    bio: "Consultant Surgeon specialising in breast surgery, thyroid surgery, and minimally invasive laparoscopic procedures for abdominal conditions.",
    license: "PMC-10255",
  },

  // ── PHYSIOTHERAPY ───────────────────────────────────────────────────────
  {
    name: "Dr. Amjad Hussain",      email: "amjad.hussain@sehat.com",
    spec: "Physiotherapy",          fee: 1500, exp: 9,
    gender: "Male",
    bio: "Physiotherapist providing rehabilitation for sports injuries, post-surgical recovery, stroke rehabilitation, and chronic musculoskeletal pain management.",
    license: "PMC-10256",
  },
  {
    name: "Dr. Rida Fatima",        email: "rida.fatima@sehat.com",
    spec: "Physiotherapy",          fee: 1200, exp: 6,
    gender: "Female",
    bio: "Women's health physiotherapist specialising in pelvic floor rehabilitation, antenatal and postnatal physiotherapy, and lymphoedema management.",
    license: "PMC-10257",
  },

  // ── NUTRITION & DIETETICS ────────────────────────────────────────────────
  {
    name: "Dr. Sara Javed",         email: "sara.javed@sehat.com",
    spec: "Nutrition & Dietetics",  fee: 1500, exp: 7,
    gender: "Female",
    bio: "Registered Dietitian providing medical nutrition therapy for diabetes, obesity, kidney disease, and eating disorders. Certified in sports nutrition.",
    license: "PMC-10258",
  },

  // ── HEPATOLOGY (Liver disease) ───────────────────────────────────────────
  {
    name: "Dr. Irfan Shaikh",       email: "irfan.shaikh@sehat.com",
    spec: "Hepatology",             fee: 3500, exp: 16,
    gender: "Male",
    bio: "Hepatologist managing Hepatitis B, Hepatitis C, alcoholic liver disease, non-alcoholic fatty liver disease (NAFLD), and liver cirrhosis. Performs liver biopsies.",
    license: "PMC-10259",
  },

  // ── VASCULAR SURGERY ────────────────────────────────────────────────────
  {
    name: "Dr. Shahid Nawaz",       email: "shahid.nawaz@sehat.com",
    spec: "Vascular Surgery",       fee: 4500, exp: 18,
    gender: "Male",
    bio: "Vascular Surgeon treating varicose veins, deep vein thrombosis, peripheral artery disease, aortic aneurysm, and diabetic foot complications.",
    license: "PMC-10260",
  },
];

// ── Availability days ─────────────────────────────────────────────────────────
const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// ── Main seed function ────────────────────────────────────────────────────────
const seedDoctors = async () => {
  try {
    // Do NOT use force:true — this is safe and additive
    await sequelize.sync({ force: false });
    console.log("Database synced (no tables dropped).");

    let added   = 0;
    let skipped = 0;

    for (let i = 0; i < DOCTORS.length; i++) {
      const doc = DOCTORS[i];

      // Check if user with this email already exists — skip if so
      const existing = await User.findOne({ where: { email: doc.email } });
      if (existing) {
        console.log(`  SKIP  ${doc.name} — already exists`);
        skipped++;
        continue;
      }

      // 1. Create User account
      const user = await User.create({
        firebase_uid: `seeded_doctor_${Date.now()}_${i}`,
        fullName:     doc.name,
        email:        doc.email,
        role:         "doctor",
        gender:       doc.gender,
        phoneNumber:  `+9230012345${String(i).padStart(2, "0")}`,
      });

      // 2. Create Doctor profile
      const doctor = await Doctor.create({
        userId:             user.id,
        specialization:     doc.spec,
        consultationFee:    doc.fee,
        experienceYears:    doc.exp,
        bio:                doc.bio,
        licenseNumber:      doc.license,
        isVerified:         true,
        verificationStatus: "verified",
        availabilityStatus: true,
      });

      // 3. Create Availability — Mon to Sat, 9AM–5PM
      for (const day of WEEKDAYS) {
        await Availability.create({
          doctorId:    doctor.id,
          dayOfWeek:   day,
          startTime:   "09:00:00",
          endTime:     "17:00:00",
          isAvailable: true,
        });
      }

      console.log(`  ADDED ${doc.name} — ${doc.spec}`);
      added++;
    }

    console.log(`\nSeeding complete!`);
    console.log(`  Added:   ${added} doctors`);
    console.log(`  Skipped: ${skipped} (already existed)`);
    console.log(`  Total:   ${DOCTORS.length} in this file\n`);
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedDoctors();