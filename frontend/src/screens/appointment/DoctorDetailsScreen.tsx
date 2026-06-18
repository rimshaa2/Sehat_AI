// frontend/src/screens/appointment/DoctorDetailsScreen.tsx
import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Linking,
} from "react-native";
import {
  ChevronLeft,
  Bookmark,
  Share2,
  MapPin,
  Star,
  Clock,
  MessageSquare,
  Calendar,
  ThumbsUp,
  ChevronRight,
} from "lucide-react-native";
import api from "../../services/api";

const { width } = Dimensions.get("window");

const C = {
  primary:      "#199A8E",
  primaryLight: "#E6F7F6",
  primaryDark:  "#127A70",
  bg:           "#F5F7FA",
  white:        "#FFFFFF",
  dark:         "#0F172A",
  mid:          "#64748B",
  light:        "#94A3B8",
  border:       "#E2E8F0",
  star:         "#F59E0B",
  red:          "#EF4444",
};

// ─── Comprehensive Review Bank — all 20 specialties ───────────────────────────
const REVIEW_BANK: Record<string, { text: string; name: string; color: string }[]> = {

  cardiology: [
    { name: "Farrukh Ahmed",   color: "#EF4444", text: "My blood pressure has been under control for the first time in years. The doctor explained my ECG results clearly and adjusted my medication perfectly." },
    { name: "Sadia Malik",     color: "#F97316", text: "Diagnosed my arrhythmia that two other cardiologists had missed. Extremely thorough and professional. Highly recommend for any heart condition." },
    { name: "Imran Qureshi",   color: "#8B5CF6", text: "After my angioplasty I was terrified but the doctor walked me through every step of recovery. My heart health has improved dramatically." },
  ],

  dermatology: [
    { name: "Hina Baig",       color: "#EC4899", text: "My acne scars have improved so much after the treatment plan. The chemical peel was explained thoroughly and results were visible within two weeks." },
    { name: "Zara Khan",       color: "#6366F1", text: "Diagnosed my psoriasis correctly on the first visit after years of wrong treatments elsewhere. The prescribed cream worked within days." },
    { name: "Ali Hassan",      color: "#14B8A6", text: "My eczema is finally manageable. The doctor identified my triggers and gave me a practical skincare routine that actually works." },
  ],

  general: [
    { name: "Kamran Ali",      color: "#199A8E", text: "Very thorough check-up. Caught my pre-diabetes early and put me on a management plan. Always clear and never rushes through appointments." },
    { name: "Ayesha Siddiqui", color: "#F97316", text: "Best family doctor we have had. My children feel comfortable and the advice is always practical and easy to follow." },
    { name: "Hassan Mehmood",  color: "#6366F1", text: "Managed my typhoid and follow-up care excellently. Always available for questions and very approachable for the whole family." },
  ],

  gastroenterology: [
    { name: "Nadia Hussain",   color: "#10B981", text: "My GERD symptoms have completely resolved after the treatment plan. The endoscopy was well-explained and the results were reviewed in detail." },
    { name: "Tariq Butt",      color: "#F59E0B", text: "Diagnosed my IBS after years of confusion. The dietary plan combined with medication finally gave me relief. Life-changing consultation." },
    { name: "Sana Rauf",       color: "#8B5CF6", text: "My hepatitis C treatment under this doctor was managed with great care. Regular follow-ups and clear explanations at every stage." },
  ],

  neurology: [
    { name: "Sara Ijaz",       color: "#8B5CF6", text: "My migraine frequency dropped from weekly to once a month after the treatment plan. The doctor is extremely thorough and listens carefully." },
    { name: "Usman Raza",      color: "#EC4899", text: "Managed my epilepsy medication switch safely and professionally. Clear instructions and always available for urgent queries." },
    { name: "Fatima Noor",     color: "#F59E0B", text: "Helped me recover from a mini-stroke with an excellent rehabilitation plan. Explained every MRI result in simple terms." },
  ],

  orthopaedics: [
    { name: "Tariq Hussain",   color: "#F59E0B", text: "Knee replacement surgery was a complete success. The post-op physiotherapy plan was very well structured and recovery was faster than expected." },
    { name: "Nasreen Akhtar",  color: "#10B981", text: "My slipped disc was managed without surgery through targeted exercises and injections. The doctor saved me from an operation." },
    { name: "Bilal Chaudhry",  color: "#3B82F6", text: "Fractured wrist healed perfectly. The doctor set the bone precisely and my follow-up X-rays showed textbook recovery." },
  ],

  psychiatry: [
    { name: "Mariam Zahid",    color: "#8B5CF6", text: "After struggling with depression for years I finally feel like myself again. The medication balance and therapy sessions have been transformative." },
    { name: "Ahmed Siddiqui",  color: "#6366F1", text: "My OCD is now manageable thanks to the CBT plan and medication. The doctor never made me feel judged — always supportive and professional." },
    { name: "Rabia Chaudhry",  color: "#EC4899", text: "Helped my teenager through severe anxiety without over-medicating. A thoughtful, patient-centred approach I deeply appreciate." },
  ],

  pulmonology: [
    { name: "Kashif Lodhi",    color: "#3B82F6", text: "My asthma has been under complete control since starting the inhaler regimen. The spirometry test was explained in detail and very reassuring." },
    { name: "Ayesha Rao",      color: "#10B981", text: "Diagnosed my sleep apnoea after months of exhaustion. The CPAP therapy recommendation was life-changing — I finally sleep properly." },
    { name: "Danyal Khan",     color: "#F97316", text: "TB treatment was managed excellently with clear follow-up protocols. The doctor was very supportive throughout the six-month course." },
  ],

  endocrinology: [
    { name: "Mariam Zahid",    color: "#F59E0B", text: "My Type 2 diabetes is now well controlled with the diet plan and medication. HbA1c dropped from 9.2 to 6.8 in four months — remarkable." },
    { name: "Faisal Chaudhry", color: "#10B981", text: "Hypothyroidism diagnosed and treated correctly after years of fatigue. Energy levels are back to normal and weight is finally stabilising." },
    { name: "Sobia Akhtar",    color: "#8B5CF6", text: "PCOS management has been excellent. Regular monitoring and a clear treatment plan have regulated my cycles completely." },
  ],

  urology: [
    { name: "Khalid Mahmood",  color: "#3B82F6", text: "Kidney stone removed via laser procedure with no complications. The doctor explained every step beforehand and recovery was smooth and fast." },
    { name: "Amna Riaz",       color: "#EC4899", text: "Recurrent UTIs finally resolved after the doctor identified the underlying cause. The treatment plan was thorough and the problem has not returned." },
    { name: "Salman Sheikh",   color: "#F97316", text: "BPH managed without surgery through medication and lifestyle changes. Follow-up ultrasounds show consistent improvement." },
  ],

  gynaecology: [
    { name: "Nazia Pervez",    color: "#EC4899", text: "Managed my high-risk pregnancy with great expertise and care. Regular monitoring made me feel safe throughout. Delivered a healthy baby." },
    { name: "Bushra Kamal",    color: "#F97316", text: "PCOS treatment has been very effective. Regular periods for the first time in years and the doctor explained all options clearly before starting treatment." },
    { name: "Tahira Sadiq",    color: "#8B5CF6", text: "Endometriosis diagnosed after years of unexplained pain. The laparoscopic surgery was successful and recovery support was excellent." },
  ],

  paediatrics: [
    { name: "Asma Javed",      color: "#10B981", text: "My newborn's jaundice was handled quickly and effectively. The doctor was calm, reassuring, and very clear about what to expect during recovery." },
    { name: "Omer Farooq",     color: "#3B82F6", text: "Diagnosed my son's childhood asthma correctly and the inhaler plan has made a huge difference. Appointments are always child-friendly." },
    { name: "Lubna Aslam",     color: "#F59E0B", text: "My daughter's developmental delay was caught early and the referral for therapy was prompt. The doctor is very thorough and genuinely caring." },
  ],

  ent: [
    { name: "Ayesha Khan",     color: "#6366F1", text: "Chronic sinusitis finally resolved after proper diagnosis and treatment. The nasal endoscopy was quick and the results clearly explained." },
    { name: "Rizwan Butt",     color: "#F97316", text: "Tonsillectomy was performed smoothly with no complications. Post-operative care instructions were detailed and recovery was faster than expected." },
    { name: "Hina Altaf",      color: "#EC4899", text: "Hearing loss diagnosed and managed with the correct treatment. The doctor's patience in explaining options for my elderly parent was commendable." },
  ],

  ophthalmology: [
    { name: "Waqas Saleem",    color: "#3B82F6", text: "LASIK procedure was flawless. Vision corrected to 20/20 and the pre-op and post-op care was detailed and thorough. Highly recommend." },
    { name: "Shazia Anwar",    color: "#8B5CF6", text: "Diabetic retinopathy caught early during a routine check. The intravitreal injection and follow-up monitoring have preserved my vision." },
    { name: "Bilal Tariq",     color: "#10B981", text: "Cataract surgery was smooth and recovery was excellent. Vision is sharper than it has been in years. Very professional and caring team." },
  ],

  dental: [
    { name: "Ali Raza",        color: "#F59E0B", text: "Root canal was completely painless — the best dental experience I have had. The doctor has a very gentle touch and explains everything beforehand." },
    { name: "Sana Babar",      color: "#EC4899", text: "Braces treatment has been going perfectly. Clear progress every month and very detailed instructions for maintenance. Teeth look great already." },
    { name: "Usman Shah",      color: "#6366F1", text: "Wisdom tooth extraction was quick with zero complications. Excellent aftercare advice and very minimal swelling post-procedure." },
  ],

  nephrology: [
    { name: "Salman Haider",   color: "#3B82F6", text: "My CKD has been managed very carefully with regular monitoring. The doctor adjusted my treatment to slow progression significantly." },
    { name: "Iffat Zaman",     color: "#F97316", text: "Dialysis initiation was handled professionally and compassionately. The doctor explained every stage and made a very difficult time manageable." },
    { name: "Ghazala Nasir",   color: "#8B5CF6", text: "Kidney stones recurrence stopped after following the prevention plan. Diet advice and medication together have made a huge difference." },
  ],

  rheumatology: [
    { name: "Ghazala Nasir",   color: "#EC4899", text: "Rheumatoid arthritis is now well controlled with the biologic therapy. Joint swelling reduced dramatically within two months of starting treatment." },
    { name: "Adnan Malik",     color: "#F59E0B", text: "Gout attacks have stopped completely after the uric acid management plan. The doctor balanced medication and diet advice perfectly." },
    { name: "Sara Javed",      color: "#10B981", text: "Lupus diagnosis was handled with great sensitivity. The treatment plan is carefully monitored and my flares have reduced significantly." },
  ],

  oncology: [
    { name: "Noman Latif",     color: "#6366F1", text: "My chemotherapy was managed with great care and attention. Side effects were well controlled and the doctor was always honest and compassionate." },
    { name: "Kiran Shahid",    color: "#EC4899", text: "Breast cancer treatment plan was clearly explained at every stage. The doctor's support and expertise gave me the strength to get through it." },
    { name: "Bilal Sheikh",    color: "#3B82F6", text: "Follow-up monitoring post-treatment has been thorough and reassuring. The doctor is very proactive and caught a recurrence early." },
  ],

  haematology: [
    { name: "Saad Rauf",       color: "#EF4444", text: "Thalassaemia management has improved my quality of life significantly. Regular transfusion scheduling and iron chelation therapy are well coordinated." },
    { name: "Naila Qureshi",   color: "#8B5CF6", text: "Anaemia diagnosed and treated correctly after months of fatigue. Iron infusion was administered smoothly and energy levels recovered quickly." },
    { name: "Tahir Mehmood",   color: "#F59E0B", text: "Haemophilia management has been excellent. Emergency care instructions were very clear and the clotting factor therapy is well monitored." },
  ],

  allergy: [
    { name: "Naila Qureshi",   color: "#10B981", text: "Food allergy panel testing was comprehensive and the elimination diet plan was practical. Finally identified my triggers after years of reactions." },
    { name: "Tahir Mehmood",   color: "#3B82F6", text: "Allergic rhinitis is now fully controlled with immunotherapy. The allergy shots schedule was manageable and results were visible within months." },
    { name: "Arsalan Jamil",   color: "#F97316", text: "Severe urticaria resolved after the correct antihistamine protocol. The doctor identified my trigger quickly and the treatment was very effective." },
  ],

  infectious: [
    { name: "Arsalan Jamil",   color: "#EF4444", text: "Typhoid managed very efficiently with IV antibiotics. The doctor monitored my fever daily and recovery was smooth with clear dietary guidance." },
    { name: "Kamran Ali",      color: "#6366F1", text: "Dengue fever handled very professionally. Platelet monitoring was frequent and the doctor kept the family fully informed throughout." },
    { name: "Farrukh Naz",     color: "#F59E0B", text: "Hepatitis C treatment completed successfully with new direct-acting antivirals. Viral load undetectable after three months. Excellent outcome." },
  ],

  mentalwellness: [
    { name: "Bilal Sheikh",    color: "#8B5CF6", text: "CBT sessions have completely changed how I handle anxiety. The doctor is non-judgmental, patient, and the exercises given are practical and effective." },
    { name: "Huma Zaidi",      color: "#EC4899", text: "Grief counselling after losing a parent was handled with exceptional empathy. The structured sessions helped me process emotions I could not face alone." },
    { name: "Sarah Ahmed",     color: "#6366F1", text: "Workplace burnout recovery was guided step by step. The mindfulness techniques and boundary-setting strategies have genuinely improved my wellbeing." },
  ],

  bones: [
    { name: "Rafique Ahmed",   color: "#F59E0B", text: "Osteoporosis diagnosed early and the calcium and Vitamin D plan has improved my bone density scan results significantly over six months." },
    { name: "Asim Butt",       color: "#3B82F6", text: "Bone infection (osteomyelitis) treated successfully with the correct antibiotic course. X-rays confirm full healing with no recurrence." },
    { name: "Naveed Iqbal",    color: "#10B981", text: "Stress fracture managed conservatively with a proper rest and recovery plan. Back to normal activity much sooner than I expected." },
  ],

  surgery: [
    { name: "Zafar Iqbal",     color: "#6366F1", text: "Laparoscopic appendectomy was performed flawlessly. Discharged the next day and recovery was fast. The pre-op consultation covered every concern." },
    { name: "Madiha Tahir",    color: "#EC4899", text: "Hernia repair surgery was smooth with no complications. Post-operative pain was minimal and the stitches healed perfectly." },
    { name: "Irfan Shaikh",    color: "#F97316", text: "Gallbladder removal done laparoscopically with a very short hospital stay. Excellent surgical technique and very clear post-op instructions." },
  ],

  physiotherapy: [
    { name: "Amjad Hussain",   color: "#10B981", text: "Post-ACL surgery rehabilitation was structured perfectly. Progressed from crutches to running in three months with targeted exercises." },
    { name: "Rida Fatima",     color: "#EC4899", text: "Pelvic floor physiotherapy was handled with great professionalism and sensitivity. Recovery after childbirth was much faster than expected." },
    { name: "Sara Javed",      color: "#3B82F6", text: "Chronic lower back pain resolved after eight sessions. Exercises are simple to do at home and the improvement has been maintained for months." },
  ],

  nutrition: [
    { name: "Sara Javed",      color: "#F59E0B", text: "Diabetic meal plan has helped me reduce my medication dose. Blood sugar readings are consistently in range for the first time in two years." },
    { name: "Mariam Zahid",    color: "#10B981", text: "Lost 12 kg in five months with the structured plan. Never felt starved — the diet is realistic, culturally appropriate, and easy to follow long term." },
    { name: "Ayesha Rao",      color: "#8B5CF6", text: "Kidney-friendly diet plan has helped manage my CKD markers. Potassium and phosphate levels are now within safe range on every blood test." },
  ],

  hepatology: [
    { name: "Irfan Shaikh",    color: "#F97316", text: "Hepatitis C cured after the 12-week direct-acting antiviral course. Liver enzymes are back to normal and biopsy shows significant fibrosis improvement." },
    { name: "Hassan Qureshi",  color: "#3B82F6", text: "Fatty liver disease managed with diet and medication. Ultrasound shows the liver has returned to normal size after six months of treatment." },
    { name: "Nadia Hussain",   color: "#EC4899", text: "Liver cirrhosis complications managed very carefully with regular monitoring. The doctor is always thorough and explains everything with great patience." },
  ],

  vascular: [
    { name: "Shahid Nawaz",    color: "#EF4444", text: "Varicose veins treated with sclerotherapy — minimal downtime and excellent cosmetic and functional results. Leg heaviness is completely gone." },
    { name: "Khalid Mahmood",  color: "#6366F1", text: "Deep vein thrombosis managed quickly with the correct anticoagulation therapy. Regular INR monitoring was well coordinated and very professional." },
    { name: "Zafar Iqbal",     color: "#F59E0B", text: "Diabetic foot ulcer healed completely under this doctor's care. The wound management protocol and vascular assessment were thorough and effective." },
  ],
};

const REVIEW_TIMES = ["2 days ago", "1 week ago", "2 weeks ago", "1 month ago", "3 weeks ago"];

// ─── Map specialty string → review key ───────────────────────────────────────
const getReviewsForSpecialty = (specialty: string) => {
  const s = (specialty || "").toLowerCase();

  if (s.includes("cardio") || s.includes("heart"))                     return REVIEW_BANK.cardiology;
  if (s.includes("derm") || s.includes("skin"))                        return REVIEW_BANK.dermatology;
  if (s.includes("gastro") || s.includes("digest") || s.includes("stomach")) return REVIEW_BANK.gastroenterology;
  if (s.includes("neuro") || s.includes("brain") || s.includes("nerve"))     return REVIEW_BANK.neurology;
  if (s.includes("ortho") && !s.includes("bone"))                      return REVIEW_BANK.orthopaedics;
  if (s.includes("psych") && !s.includes("wellness"))                  return REVIEW_BANK.psychiatry;
  if (s.includes("pulmo") || s.includes("lung") || s.includes("respir"))     return REVIEW_BANK.pulmonology;
  if (s.includes("endocrin") || s.includes("diabet") || s.includes("thyroid")) return REVIEW_BANK.endocrinology;
  if (s.includes("urol") || s.includes("kidney") || s.includes("urinary"))   return REVIEW_BANK.urology;
  if (s.includes("gynae") || s.includes("obste") || s.includes("women"))     return REVIEW_BANK.gynaecology;
  if (s.includes("paed") || s.includes("child") || s.includes("infant"))     return REVIEW_BANK.paediatrics;
  if (s.includes("ear") || s.includes("nose") || s.includes("throat") || s.includes("ent")) return REVIEW_BANK.ent;
  if (s.includes("ophthal") || s.includes("eye") || s.includes("vision"))    return REVIEW_BANK.ophthalmology;
  if (s.includes("dent") || s.includes("oral") || s.includes("tooth"))       return REVIEW_BANK.dental;
  if (s.includes("nephro"))                                            return REVIEW_BANK.nephrology;
  if (s.includes("rheuma") || s.includes("arthrit"))                   return REVIEW_BANK.rheumatology;
  if (s.includes("oncol") || s.includes("cancer"))                    return REVIEW_BANK.oncology;
  if (s.includes("haemat") || s.includes("blood") || s.includes("anaem"))    return REVIEW_BANK.haematology;
  if (s.includes("allerg") || s.includes("immun"))                    return REVIEW_BANK.allergy;
  if (s.includes("infect") || s.includes("typhoid") || s.includes("dengue")) return REVIEW_BANK.infectious;
  if (s.includes("mental") || s.includes("wellness") || s.includes("counsel")) return REVIEW_BANK.mentalwellness;
  if (s.includes("bone") || s.includes("osteo") || s.includes("fracture"))   return REVIEW_BANK.bones;
  if (s.includes("surg") && !s.includes("vasc") && !s.includes("oral"))      return REVIEW_BANK.surgery;
  if (s.includes("physio") || s.includes("rehab"))                    return REVIEW_BANK.physiotherapy;
  if (s.includes("nutri") || s.includes("diet"))                      return REVIEW_BANK.nutrition;
  if (s.includes("hepat") || s.includes("liver"))                     return REVIEW_BANK.hepatology;
  if (s.includes("vascul") || s.includes("vein") || s.includes("artery"))    return REVIEW_BANK.vascular;

  return REVIEW_BANK.general;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const generateDates = () => {
  const days  = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      day:      days[d.getDay()],
      date:     d.getDate(),
      fullDate: d.toISOString().split("T")[0],
    };
  });
};

const StarRow = ({ rating, size = 14 }: { rating: number; size?: number }) => {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {Array(full).fill(0).map((_, i) => (
        <Star key={`f${i}`} size={size} color={C.star} fill={C.star} />
      ))}
      {half && <Star size={size} color={C.star} fill="none" />}
      {Array(empty).fill(0).map((_, i) => (
        <Star key={`e${i}`} size={size} color={C.border} fill="none" />
      ))}
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function DoctorDetailsScreen({ navigation, route }: any) {
  const { doctor } = route.params || {};

  const dates = generateDates();
  const [activeTab,      setActiveTab]      = useState<"bio" | "schedule">("bio");
  const [selectedDate,   setSelectedDate]   = useState(dates[0].fullDate);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime,   setSelectedTime]   = useState<string | null>(null);
  const [loadingSlots,   setLoadingSlots]   = useState(false);
  const [reason,         setReason]         = useState("");
  const [bookmarked,     setBookmarked]     = useState(false);
  const [bioExpanded,    setBioExpanded]    = useState(false);

  useEffect(() => {
    if (!doctor?.id || activeTab !== "schedule") return;
    const fetch = async () => {
      setLoadingSlots(true);
      setAvailableSlots([]);
      setSelectedTime(null);
      try {
        const res = await api.get(`/api/appointments/doctors/${doctor.id}/slots`, {
          params: { date: selectedDate },
        });
        if (res.data?.availableSlots) setAvailableSlots(res.data.availableSlots);
      } catch {}
      finally { setLoadingSlots(false); }
    };
    fetch();
  }, [selectedDate, doctor, activeTab]);

  const handleBook = () => {
    if (!selectedTime) {
      Alert.alert("Select Time", "Please select a time slot to continue.");
      return;
    }
    if (!reason.trim()) {
      Alert.alert("Reason Required", "Please enter a brief reason for your visit.");
      return;
    }
    navigation.navigate("Payment", {
      doctor,
      date:   selectedDate,
      time:   selectedTime,
      reason,
      amount: doctor?.priceValue || 1500,
    });
  };

  const name       = doctor?.name       || "Dr. Unknown";
  const specialty  = doctor?.specialty  || "General Practice";
  const rating     = parseFloat(doctor?.rating) || 4.5;
  const experience = doctor?.experience || 0;
  const price      = doctor?.priceValue || 1500;
  const bio        = doctor?.bio        || "Dedicated healthcare professional committed to providing personalised and compassionate care.";
  const location   = "Office #12, 2nd Floor, Al-Hameed Mall, G-11 Markaz, Islamabad";
  const schedule   = "Mon–Sat / 9:00 AM – 5:00 PM";
  const totalReviews = 72;

  // Initials avatar
  const nameInitials = (name || "D")
    .replace(/^Dr\.?\s*/i, "")
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() || "")
    .join("");

  const AVATAR_COLORS = ["#199A8E","#8B5CF6","#F59E0B","#EF4444","#3B82F6","#EC4899","#10B981","#F97316"];
  const avatarColor = AVATAR_COLORS[
    (name || "D").split("").reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length
  ];

  // Get specialty-accurate reviews
  const reviews = getReviewsForSpecialty(specialty);

  return (
    <SafeAreaView style={s.container}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.headerBtn}>
          <ChevronLeft size={24} color={C.dark} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Doctor Information</Text>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.headerBtn}>
            <Share2 size={20} color={C.dark} />
          </TouchableOpacity>
          <TouchableOpacity style={s.headerBtn} onPress={() => setBookmarked(!bookmarked)}>
            <Bookmark size={20} color={bookmarked ? C.primary : C.dark} fill={bookmarked ? C.primary : "none"} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Hero Card */}
        <View style={s.heroCard}>
          {doctor?.image ? (
            <Image
              source={{ uri: doctor.image }}
              style={[s.heroAvatar, { backgroundColor: avatarColor }]}
            />
          ) : (
            <View style={[s.heroAvatar, { backgroundColor: avatarColor }]}>
              <Text style={s.heroAvatarText}>{nameInitials}</Text>
            </View>
          )}

          <Text style={s.heroName}>{name}</Text>
          <Text style={s.heroSpecialty}>{specialty}</Text>

          {/* Verified badge */}
          {doctor?.isVerified && (
            <View style={s.verifiedBadge}>
              <Text style={s.verifiedText}>✓ Verified Doctor</Text>
            </View>
          )}

          <View style={s.statsRow}>
            <View style={s.statPill}>
              <Star size={13} color={C.star} fill={C.star} />
              <Text style={s.statPillText}>{rating} Rating</Text>
            </View>
            <View style={s.statPill}>
              <ThumbsUp size={13} color={C.primary} />
              <Text style={s.statPillText}>{experience} yrs exp</Text>
            </View>
          </View>

          <View style={s.scheduleStrip}>
            <View style={s.scheduleItem}>
              <Clock size={13} color={C.primary} />
              <Text style={s.scheduleText}>{schedule}</Text>
            </View>
            <View style={s.scheduleDivider} />
            <View style={s.scheduleItem}>
              <MapPin size={13} color={C.primary} />
              <Text style={s.scheduleText}>Rs. {price.toLocaleString()}/visit</Text>
            </View>
          </View>
        </View>

        {/* Tab bar */}
        <View style={s.tabBar}>
          {(["bio", "schedule"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[s.tabBtn, activeTab === tab && s.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
                {tab === "bio" ? "Bio" : "Schedule"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* BIO TAB */}
        {activeTab === "bio" && (
          <View style={s.section}>

            <Text style={s.sectionTitle}>Biography</Text>
            <Text style={s.bioText} numberOfLines={bioExpanded ? undefined : 4}>
              {bio}
            </Text>
            <TouchableOpacity onPress={() => setBioExpanded(!bioExpanded)}>
              <Text style={s.readMore}>{bioExpanded ? "Show less" : "Read more"}</Text>
            </TouchableOpacity>

            <Text style={[s.sectionTitle, { marginTop: 24 }]}>Work Location</Text>
            <View style={s.locationCard}>
              <View style={s.locationTextRow}>
                <MapPin size={14} color={C.primary} />
                <Text style={s.locationAddr}>{location}</Text>
              </View>
              <TouchableOpacity
                onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(location)}`)}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: `https://staticmap.openstreetmap.de/staticmap.php?center=33.7066,73.0481&zoom=14&size=600x180&maptype=mapnik&markers=33.7066,73.0481,red-pushpin` }}
                  style={s.mapImage}
                />
                <View style={s.mapOverlay}>
                  <View style={s.mapOpenBtn}>
                    <Text style={s.mapOpenText}>Open in Maps</Text>
                    <ChevronRight size={12} color={C.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Rating */}
            <View style={s.ratingHeader}>
              <Text style={s.sectionTitle}>Rating ({totalReviews})</Text>
              <View style={s.ratingBadge}>
                <Star size={14} color={C.star} fill={C.star} />
                <Text style={s.ratingBadgeText}>{rating}</Text>
              </View>
            </View>

            <View style={s.ratingBars}>
              {[
                { stars: 5, pct: 0.72 },
                { stars: 4, pct: 0.18 },
                { stars: 3, pct: 0.06 },
                { stars: 2, pct: 0.03 },
                { stars: 1, pct: 0.01 },
              ].map(({ stars, pct }) => (
                <View key={stars} style={s.ratingBarRow}>
                  <Text style={s.ratingBarLabel}>{stars}</Text>
                  <Star size={10} color={C.star} fill={C.star} />
                  <View style={s.ratingTrack}>
                    <View style={[s.ratingFill, { width: `${pct * 100}%` as any }]} />
                  </View>
                  <Text style={s.ratingBarPct}>{Math.round(pct * totalReviews)}</Text>
                </View>
              ))}
            </View>

            {/* Reviews — accurate to specialty */}
            {reviews.map((r, i) => (
              <View key={i} style={s.reviewCard}>
                <View style={s.reviewTop}>
                  <View style={[s.reviewAvatar, { backgroundColor: r.color }]}>
                    <Text style={s.reviewAvatarText}>
                      {r.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                    </Text>
                  </View>
                  <View style={s.reviewMeta}>
                    <Text style={s.reviewName}>{r.name}</Text>
                    <StarRow rating={4.5} size={13} />
                  </View>
                  <Text style={s.reviewTime}>{REVIEW_TIMES[i % REVIEW_TIMES.length]}</Text>
                </View>
                <Text style={s.reviewText}>{r.text}</Text>
              </View>
            ))}
          </View>
        )}

        {/* SCHEDULE TAB */}
        {activeTab === "schedule" && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Select Date</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingBottom: 4 }}
              style={{ marginBottom: 20 }}
            >
              {dates.map((item) => (
                <TouchableOpacity
                  key={item.fullDate}
                  style={[s.dateCard, selectedDate === item.fullDate && s.dateCardActive]}
                  onPress={() => setSelectedDate(item.fullDate)}
                >
                  <Text style={[s.dateDayText, selectedDate === item.fullDate && s.dateActiveText]}>
                    {item.day}
                  </Text>
                  <Text style={[s.dateNumText, selectedDate === item.fullDate && s.dateActiveText]}>
                    {item.date}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={s.sectionTitle}>Available Slots</Text>
            {loadingSlots ? (
              <ActivityIndicator size="small" color={C.primary} style={{ marginVertical: 20 }} />
            ) : (
              <View style={s.slotsGrid}>
                {availableSlots.length > 0 ? (
                  availableSlots.map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={[s.slotBtn, selectedTime === time && s.slotBtnActive]}
                      onPress={() => setSelectedTime(time)}
                    >
                      <Clock size={12} color={selectedTime === time ? C.white : C.mid} />
                      <Text style={[s.slotText, selectedTime === time && s.slotTextActive]}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={s.noSlots}>No available slots for this date.</Text>
                )}
              </View>
            )}

            <Text style={[s.sectionTitle, { marginTop: 20 }]}>Reason for Visit</Text>
            <TextInput
              style={s.reasonInput}
              placeholder="e.g., Chest pain, follow-up after ECG…"
              placeholderTextColor={C.light}
              multiline
              numberOfLines={4}
              value={reason}
              onChangeText={setReason}
              textAlignVertical="top"
            />
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={s.footer}>
        <TouchableOpacity style={s.msgBtn}>
          <MessageSquare size={22} color={C.primary} />
        </TouchableOpacity>

        {activeTab === "bio" ? (
          <TouchableOpacity style={s.bookBtn} onPress={() => setActiveTab("schedule")}>
            <Calendar size={18} color={C.white} />
            <Text style={s.bookBtnText}>Book Appointment</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[s.bookBtn, (!selectedTime || loadingSlots) && { opacity: 0.55 }]}
            onPress={handleBook}
            disabled={!selectedTime || loadingSlots}
          >
            <Text style={s.bookBtnText}>Confirm Booking</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerBtn: { padding: 8 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: C.dark },
  headerRight: { flexDirection: "row", gap: 4 },
  heroCard: {
    backgroundColor: C.primaryLight,
    marginHorizontal: 16, marginTop: 16,
    borderRadius: 20, padding: 20, alignItems: "center",
  },
  heroAvatar: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 3, borderColor: C.white,
    marginBottom: 12, alignItems: "center", justifyContent: "center",
  },
  heroAvatarText: { fontSize: 32, fontWeight: "800", color: C.white },
  heroName: { fontSize: 18, fontWeight: "800", color: C.dark, textAlign: "center" },
  heroSpecialty: { fontSize: 13, color: C.mid, marginTop: 4, marginBottom: 8, textAlign: "center" },
  verifiedBadge: {
    backgroundColor: "#D1FAE5", borderRadius: 20, paddingHorizontal: 12,
    paddingVertical: 4, marginBottom: 12,
  },
  verifiedText: { fontSize: 11, color: "#065F46", fontWeight: "700" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statPill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: C.white, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  statPillText: { fontSize: 12, fontWeight: "700", color: C.dark },
  scheduleStrip: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.white, borderRadius: 12, padding: 10, width: "100%", gap: 12,
  },
  scheduleItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  scheduleText: { fontSize: 11, color: C.dark, fontWeight: "600", flexShrink: 1 },
  scheduleDivider: { width: 1, height: 20, backgroundColor: C.border },
  tabBar: {
    flexDirection: "row", marginHorizontal: 16, marginTop: 16,
    backgroundColor: C.white, borderRadius: 14, padding: 4,
    borderWidth: 1, borderColor: C.border,
  },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  tabBtnActive: { backgroundColor: C.primary },
  tabText: { fontSize: 14, fontWeight: "600", color: C.mid },
  tabTextActive: { color: C.white },
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: C.dark, marginBottom: 10 },
  bioText: { fontSize: 14, color: C.mid, lineHeight: 22 },
  readMore: { fontSize: 13, color: C.primary, fontWeight: "700", marginTop: 6 },
  locationCard: {
    backgroundColor: C.white, borderRadius: 16,
    borderWidth: 1, borderColor: C.border, overflow: "hidden",
  },
  locationTextRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12 },
  locationAddr: { flex: 1, fontSize: 13, color: C.mid, lineHeight: 18 },
  mapImage: { width: "100%", height: 160, backgroundColor: C.border },
  mapOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center", justifyContent: "flex-end",
    backgroundColor: "rgba(255,255,255,0.92)", paddingHorizontal: 14, paddingVertical: 8,
  },
  mapOpenBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  mapOpenText: { fontSize: 12, color: C.primary, fontWeight: "700" },
  ratingHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginTop: 24, marginBottom: 10,
  },
  ratingBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#FFF8E7", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  ratingBadgeText: { fontSize: 13, fontWeight: "800", color: C.star },
  ratingBars: { marginBottom: 16, gap: 5 },
  ratingBarRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  ratingBarLabel: { fontSize: 12, color: C.mid, width: 10, textAlign: "right" },
  ratingTrack: { flex: 1, height: 6, backgroundColor: C.border, borderRadius: 3, overflow: "hidden" },
  ratingFill: { height: 6, backgroundColor: C.star, borderRadius: 3 },
  ratingBarPct: { fontSize: 11, color: C.light, width: 22, textAlign: "right" },
  reviewCard: {
    backgroundColor: C.white, borderRadius: 14, borderWidth: 1,
    borderColor: C.border, padding: 14, marginBottom: 10,
  },
  reviewTop: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  reviewAvatarText: { fontSize: 14, fontWeight: "800", color: C.white },
  reviewMeta: { flex: 1, gap: 3 },
  reviewName: { fontSize: 14, fontWeight: "700", color: C.dark },
  reviewTime: { fontSize: 11, color: C.light },
  reviewText: { fontSize: 13, color: C.mid, lineHeight: 19 },
  dateCard: {
    width: 58, height: 68, borderRadius: 14, borderWidth: 1, borderColor: C.border,
    alignItems: "center", justifyContent: "center", backgroundColor: C.white,
  },
  dateCardActive: { backgroundColor: C.primary, borderColor: C.primary },
  dateDayText: { fontSize: 12, fontWeight: "600", color: C.mid },
  dateNumText: { fontSize: 18, fontWeight: "800", color: C.dark, marginTop: 2 },
  dateActiveText: { color: C.white },
  slotsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 4 },
  slotBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: C.white,
  },
  slotBtnActive: { backgroundColor: C.primary, borderColor: C.primary },
  slotText: { fontSize: 13, color: C.dark, fontWeight: "600" },
  slotTextActive: { color: C.white },
  noSlots: { fontSize: 13, color: C.red, fontStyle: "italic" },
  reasonInput: {
    backgroundColor: C.white, borderWidth: 1, borderColor: C.border,
    borderRadius: 14, padding: 14, fontSize: 14, color: C.dark,
    minHeight: 100, marginBottom: 20,
  },
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.border,
  },
  msgBtn: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: C.primaryLight, alignItems: "center", justifyContent: "center",
  },
  bookBtn: {
    flex: 1, height: 50, borderRadius: 25, backgroundColor: C.primary,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
  },
  bookBtnText: { color: C.white, fontWeight: "700", fontSize: 15 },
});