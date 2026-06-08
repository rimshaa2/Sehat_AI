import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { ChevronLeft, Search, ChevronRight, X } from "lucide-react-native";
import styles from "./styles/BookAppointmentStyles";

const SPECIALTIES = [
  {
    id: "1",
    title: "Cardiology",
    subtitle: "Heart conditions, chest pain, blood pressure",
    icon: { uri: "https://cdn-icons-png.flaticon.com/512/2966/2966419.png" },
    color: "#FFE8E8",
  },
  {
    id: "2",
    title: "Dermatology",
    subtitle: "Skin, hair, and nail conditions",
    icon: { uri: "https://cdn-icons-png.flaticon.com/512/2966/2966327.png" },
    color: "#FFF3E8",
  },
  {
    id: "3",
    title: "General Practice",
    subtitle: "Fever, flu, infections, and general health",
    icon: { uri: "https://cdn-icons-png.flaticon.com/512/3774/3774299.png" },
    color: "#E8F5E9",
  },
  {
    id: "4",
    title: "Gastroenterology",
    subtitle: "Stomach, digestive, and liver conditions",
    icon: { uri: "https://cdn-icons-png.flaticon.com/512/2966/2966353.png" },
    color: "#FFF8E1",
  },
  {
    id: "5",
    title: "Neurology",
    subtitle: "Headaches, migraines, nerve, and brain",
    icon: { uri: "https://cdn-icons-png.flaticon.com/512/2966/2966486.png" },
    color: "#F3E8FF",
  },
  {
    id: "6",
    title: "Orthopaedics",
    subtitle: "Bones, joints, and back pain",
    icon: { uri: "https://cdn-icons-png.flaticon.com/512/2966/2966378.png" },
    color: "#FEFCE4",
  },
  {
    id: "7",
    title: "Psychiatry",
    subtitle: "Mental health, depression, anxiety, OCD",
    icon: { uri: "https://cdn-icons-png.flaticon.com/512/3004/3004458.png" },
    color: "#F2E7FE",
  },
  {
    id: "8",
    title: "Pulmonology",
    subtitle: "Lungs, breathing, asthma, and COPD",
    icon: { uri: "https://cdn-icons-png.flaticon.com/512/2966/2966397.png" },
    color: "#E8F4FF",
  },
  {
    id: "9",
    title: "Endocrinology",
    subtitle: "Diabetes, thyroid, and hormonal disorders",
    icon: { uri: "https://cdn-icons-png.flaticon.com/512/2966/2966340.png" },
    color: "#FFF0E8",
  },
  {
    id: "10",
    title: "Urology",
    subtitle: "Kidney, urinary tract, and prostate",
    icon: { uri: "https://cdn-icons-png.flaticon.com/512/2966/2966411.png" },
    color: "#E8F1FF",
  },
  {
    id: "11",
    title: "Gynaecology",
    subtitle: "Women's health, pregnancy, and obstetrics",
    icon: { uri: "https://cdn-icons-png.flaticon.com/512/2966/2966320.png" },
    color: "#FFE8F4",
  },
  {
    id: "12",
    title: "Paediatrics",
    subtitle: "Children's health and vaccinations",
    icon: { uri: "https://cdn-icons-png.flaticon.com/512/3774/3774278.png" },
    color: "#E8FFF3",
  },
  {
    id: "13",
    title: "Ear, Nose & Throat",
    subtitle: "Sinusitis, hearing loss, tonsillitis",
    icon: { uri: "https://cdn-icons-png.flaticon.com/512/2865/2865917.png" },
    color: "#E8F1FF",
  },
  {
    id: "14",
    title: "Ophthalmology",
    subtitle: "Eye conditions, cataracts, and glaucoma",
    icon: { uri: "https://cdn-icons-png.flaticon.com/512/2966/2966363.png" },
    color: "#E8FAFF",
  },
  {
    id: "15",
    title: "Dental",
    subtitle: "Teeth, gums, and oral health",
    icon: { uri: "https://cdn-icons-png.flaticon.com/512/2966/2966334.png" },
    color: "#E8F1FF",
  },
  {
    id: "16",
    title: "Nephrology",
    subtitle: "Kidney disease and dialysis",
    icon: { uri: "https://cdn-icons-png.flaticon.com/512/2966/2966406.png" },
    color: "#FFF5E8",
  },
  {
    id: "17",
    title: "Rheumatology",
    subtitle: "Arthritis, joints, and autoimmune diseases",
    icon: { uri: "https://cdn-icons-png.flaticon.com/512/2966/2966378.png" },
    color: "#FFE8E8",
  },
  {
    id: "18",
    title: "Oncology",
    subtitle: "Cancer diagnosis and treatment",
    icon: { uri: "https://cdn-icons-png.flaticon.com/512/2966/2966344.png" },
    color: "#F5F5F5",
  },
  {
    id: "19",
    title: "Haematology",
    subtitle: "Blood disorders, anaemia, and leukaemia",
    icon: { uri: "https://cdn-icons-png.flaticon.com/512/2966/2966419.png" },
    color: "#FFE8EC",
  },
  {
    id: "20",
    title: "Allergy & Immunology",
    subtitle: "Food allergies, rhinitis, and immune disorders",
    icon: { uri: "https://cdn-icons-png.flaticon.com/512/2966/2966486.png" },
    color: "#EDFFF4",
  },
  {
    id: "21",
    title: "Infectious Disease",
    subtitle: "Typhoid, dengue, malaria, tuberculosis",
    icon: { uri: "https://cdn-icons-png.flaticon.com/512/2966/2966327.png" },
    color: "#FFF8E1",
  },
  {
    id: "22",
    title: "Mental wellness",
    subtitle: "CBT, counselling, stress, and burnout",
    icon: { uri: "https://cdn-icons-png.flaticon.com/512/3004/3004458.png" },
    color: "#F2E7FE",
  },
  {
    id: "23",
    title: "Bones",
    subtitle: "Fractures, osteoporosis, bone infections",
    icon: { uri: "https://cdn-icons-png.flaticon.com/512/2966/2966378.png" },
    color: "#FEFCE4",
  },
  {
    id: "24",
    title: "General Surgery",
    subtitle: "Appendix, hernia, gallbladder, laparoscopy",
    icon: { uri: "https://cdn-icons-png.flaticon.com/512/3774/3774299.png" },
    color: "#E8F5E9",
  },
  {
    id: "25",
    title: "Physiotherapy",
    subtitle: "Rehabilitation, sports injuries, post-surgery",
    icon: { uri: "https://cdn-icons-png.flaticon.com/512/2966/2966353.png" },
    color: "#E8F4FF",
  },
  {
    id: "26",
    title: "Nutrition & Dietetics",
    subtitle: "Diet plans, diabetes, obesity management",
    icon: { uri: "https://cdn-icons-png.flaticon.com/512/3774/3774278.png" },
    color: "#E8FFF3",
  },
  {
    id: "27",
    title: "Hepatology",
    subtitle: "Liver disease, Hepatitis B & C, NAFLD",
    icon: { uri: "https://cdn-icons-png.flaticon.com/512/2966/2966406.png" },
    color: "#FFF5E8",
  },
  {
    id: "28",
    title: "Vascular Surgery",
    subtitle: "Varicose veins, DVT, peripheral artery disease",
    icon: { uri: "https://cdn-icons-png.flaticon.com/512/2966/2966419.png" },
    color: "#FFE8E8",
  },
];

export default ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filteredSpecialties = SPECIALTIES.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show only first 8 when not searching and not expanded
  const displayedSpecialties =
    searchQuery || showAll ? filteredSpecialties : filteredSpecialties.slice(0, 8);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ChevronLeft color="#1C2A3A" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book an Appointment</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.sectionTitle}>Medical Problems</Text>
          <Text style={styles.sectionSubtitle}>
            Wide selection of doctor's specialties
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search color="#A1A8B0" size={20} style={styles.searchIcon} />
          <TextInput
            placeholder="symptoms, diseases, specialties..."
            placeholderTextColor="#A1A8B0"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <X color="#A1A8B0" size={18} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.filterButton}>
              <View style={styles.filterLine1} />
              <View style={styles.filterLine2} />
              <View style={styles.filterLine3} />
            </TouchableOpacity>
          )}
        </View>

        {/* Specialties List */}
        <View style={styles.listContainer}>
          {displayedSpecialties.length > 0 ? (
            displayedSpecialties.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() =>
                  navigation.navigate("DoctorList", { specialty: item.title })
                }
              >
                <View
                  style={[styles.iconContainer, { backgroundColor: item.color }]}
                >
                  <Image
                    source={item.icon}
                    style={styles.icon}
                    resizeMode="contain"
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                </View>
                <ChevronRight color="#199A8E" size={20} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={{ alignItems: "center", marginTop: 20 }}>
              <Text style={{ color: "#6B7280" }}>
                No specialties found for "{searchQuery}"
              </Text>
            </View>
          )}
        </View>

        {/* See More / See Less (hidden while searching) */}
        {!searchQuery && (
          <TouchableOpacity
            style={styles.seeMoreContainer}
            onPress={() => setShowAll((prev) => !prev)}
          >
            <Text style={styles.seeMoreText}>
              {showAll ? "See Less" : `See More (${SPECIALTIES.length - 8} more)`}
            </Text>
            <ChevronRight
              color="#1C69FF"
              size={16}
              style={{ transform: [{ rotate: showAll ? "270deg" : "0deg" }] }}
            />
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};