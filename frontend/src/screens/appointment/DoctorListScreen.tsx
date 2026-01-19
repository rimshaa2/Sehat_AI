import React, { useState, useEffect, useMemo } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { ChevronLeft, Search, Star, ChevronDown, X } from "lucide-react";
import { getFirestore, collection, query, where, getDocs } from "@react-native-firebase/firestore";
import styles from "./styles/DoctorListStyles";

export default ({ navigation, route }: any) => {
  const categoryTitle = route.params?.specialty || "Ear, Nose & Throat";

  const [allDoctors, setAllDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // -- Search State --
  const [searchQuery, setSearchQuery] = useState("");

  // -- Filter State --
  const [availableToday, setAvailableToday] = useState(false);
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [priceModalVisible, setPriceModalVisible] = useState(false);
  const [priceSort, setPriceSort] = useState<"asc" | "desc" | null>(null);

  // 1. Fetch Data
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const db = getFirestore();
        const doctorsRef = collection(db, "doctors");
        const q = query(doctorsRef, where("category", "==", categoryTitle));
        const querySnapshot = await getDocs(q);
        
        const list: any[] = [];
        querySnapshot.forEach((doc: { id: any; data: () => any; }) => {
          list.push({ id: doc.id, ...doc.data() });
        });

        setAllDoctors(list);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [categoryTitle]);

  // 2. Filter Logic (Search + Filters + Sort)
  const filteredDoctors = useMemo(() => {
    let result = [...allDoctors];

    // Filter: Search Query (Name or Specialty)
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (doc) =>
          doc.name?.toLowerCase().includes(lowerQuery) ||
          doc.specialty?.toLowerCase().includes(lowerQuery)
      );
    }

    // Filter: Availability
    if (availableToday) {
      result = result.filter((doc) => doc.isAvailable === true);
    }

    // Filter: Gender
    if (selectedGender) {
      result = result.filter((doc) => doc.gender === selectedGender);
    }

    // Sort: Price
    if (priceSort) {
      result.sort((a, b) => {
        const pA = a.priceValue || 0;
        const pB = b.priceValue || 0;
        return priceSort === "asc" ? pA - pB : pB - pA;
      });
    }

    return result;
  }, [allDoctors, searchQuery, availableToday, selectedGender, priceSort]);

  const renderDoctorItem = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate("DoctorDetails", { doctor: item })}
    >
      <Image 
        source={{ uri: item.image || 'https://via.placeholder.com/150' }} 
        style={styles.doctorImage} 
      />
      <View style={styles.cardContent}>
        <Text style={styles.doctorName}>{item.name}</Text>
        <Text style={styles.specialty}>{item.specialty}</Text>
        <Text style={styles.price}>{item.price}</Text>
      </View>
      <View style={styles.ratingContainer}>
        <Star size={14} color="#F59E0B" fill="#F59E0B" />
        <Text style={styles.ratingText}>{item.rating}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color="#1C2A3A" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryTitle}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search color="#A1A8B0" size={20} style={styles.searchIcon} />
          <TextInput
            placeholder="Search Doctor"
            placeholderTextColor="#A1A8B0"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery} // Updates state as you type
          />
          {/* Clear Search Button */}
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X color="#A1A8B0" size={18} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity style={styles.filterBtnSquare}>
           <View style={styles.filterLine1} />
           <View style={styles.filterLine2} />
           <View style={styles.filterLine3} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          <TouchableOpacity 
            style={[styles.filterPill, availableToday && styles.filterPillActive]}
            onPress={() => setAvailableToday(!availableToday)}
          >
            <Text style={[styles.filterText, availableToday && styles.filterTextActive]}>Available Today</Text>
            {availableToday && <X size={14} color="#FFF" />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterPill, selectedGender && styles.filterPillActive]}
            onPress={() => setGenderModalVisible(true)}
          >
            <Text style={[styles.filterText, selectedGender && styles.filterTextActive]}>
              {selectedGender ? selectedGender : "Gender"}
            </Text>
            <ChevronDown size={14} color={selectedGender ? "#FFF" : "#6B7280"} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterPill, priceSort && styles.filterPillActive]}
            onPress={() => setPriceModalVisible(true)}
          >
            <Text style={[styles.filterText, priceSort && styles.filterTextActive]}>
              {priceSort === 'asc' ? "Price: Low to High" : priceSort === 'desc' ? "Price: High to Low" : "Price"}
            </Text>
            <ChevronDown size={14} color={priceSort ? "#FFF" : "#6B7280"} />
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* List */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#199A8E" />
        </View>
      ) : (
        <FlatList
          data={filteredDoctors}
          keyExtractor={(item) => item.id}
          renderItem={renderDoctorItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Doctors Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery ? `No results for "${searchQuery}"` : "Try adjusting your filters"}
              </Text>
            </View>
          }
        />
      )}

      {/* Gender Modal */}
      <Modal visible={genderModalVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setGenderModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalHeader}>Select Gender</Text>
                {['Male', 'Female'].map((g) => (
                  <TouchableOpacity 
                    key={g} 
                    style={styles.modalOption}
                    onPress={() => { setSelectedGender(g); setGenderModalVisible(false); }}
                  >
                    <Text style={[styles.modalOptionText, selectedGender === g && styles.modalOptionActive]}>{g}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.modalOption} onPress={() => { setSelectedGender(null); setGenderModalVisible(false); }}>
                  <Text style={[styles.modalOptionText, { color: '#EF4444' }]}>Reset</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Price Modal */}
      <Modal visible={priceModalVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setPriceModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalHeader}>Sort by Price</Text>
                <TouchableOpacity style={styles.modalOption} onPress={() => { setPriceSort('asc'); setPriceModalVisible(false); }}>
                  <Text style={[styles.modalOptionText, priceSort === 'asc' && styles.modalOptionActive]}>Price: Low to High</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalOption} onPress={() => { setPriceSort('desc'); setPriceModalVisible(false); }}>
                  <Text style={[styles.modalOptionText, priceSort === 'desc' && styles.modalOptionActive]}>Price: High to Low</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalOption} onPress={() => { setPriceSort(null); setPriceModalVisible(false); }}>
                  <Text style={[styles.modalOptionText, { color: '#EF4444' }]}>Reset</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};