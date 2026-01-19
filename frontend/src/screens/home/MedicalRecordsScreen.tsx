import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import { 
  ChevronLeft, 
  FileText, 
  Download, 
  Plus, 
  Calendar 
} from "lucide-react-native";
import styles from "./styles/MedicalRecordsStyles";

// Mock Data
const RECORDS = [
  {
    id: "1",
    title: "Blood Test Report",
    doctor: "Dr. Ahmed Khan",
    date: "Jan 5, 2024",
    type: "Lab Report",
    color: "#E0F2FE", // Light Blue
    iconColor: "#3B82F6",
  },
  {
    id: "2",
    title: "X-Ray Chest",
    doctor: "Dr. Sundas Hassan",
    date: "Dec 28, 2023",
    type: "Imaging",
    color: "#F3E8FF", // Light Purple
    iconColor: "#A855F7",
  },
  {
    id: "3",
    title: "Prescription",
    doctor: "Dr. Sarah Ali",
    date: "Dec 20, 2023",
    type: "Prescription",
    color: "#DCFCE7", // Light Green
    iconColor: "#22C55E",
  },
  {
    id: "4",
    title: "Consultation Notes",
    doctor: "Dr. Ahmed Khan",
    date: "Dec 15, 2023",
    type: "Notes",
    color: "#FEF9C3", // Light Yellow
    iconColor: "#EAB308",
  },
];

const FILTERS = ["All", "Lab Reports", "Prescriptions", "Diagnosis", "Imaging"];

export default ({ navigation }: any) => {
  const [selectedFilter, setSelectedFilter] = useState("All");

  const filteredRecords = selectedFilter === "All" 
    ? RECORDS 
    : RECORDS.filter(r => r.type === selectedFilter || (selectedFilter === "Lab Reports" && r.type === "Lab Report"));

  const renderRecordItem = ({ item }: any) => (
    <TouchableOpacity style={styles.recordCard}>
      {/* Icon Box */}
      <View style={[styles.iconBox, { backgroundColor: item.color }]}>
        <FileText size={24} color={item.iconColor} />
      </View>

      {/* Info */}
      <View style={styles.recordInfo}>
        <Text style={styles.recordTitle}>{item.title}</Text>
        <Text style={styles.doctorName}>{item.doctor}</Text>
        
        <View style={styles.metaRow}>
          <Calendar size={12} color="#9CA3AF" style={{ marginRight: 4 }} />
          <Text style={styles.dateText}>{item.date}</Text>
          <View style={styles.tagContainer}>
            <Text style={styles.tagText}>{item.type}</Text>
          </View>
        </View>
      </View>

      {/* Download Action */}
      <TouchableOpacity style={styles.downloadIcon}>
        <Download size={20} color="#199A8E" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft color="#FFFFFF" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Medical Records</Text>
        </View>

        {/* Summary Stats */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Records</Text>
            <Text style={styles.summaryValue}>{RECORDS.length}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Last Updated</Text>
            <Text style={styles.summarySubValue}>Jan 5, 2024</Text>
          </View>
        </View>
      </SafeAreaView>

      {/* White Content Sheet */}
      <View style={styles.contentSheet}>
        
        {/* Filters */}
        <View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.filtersScroll}
          >
            {FILTERS.map((filter) => (
              <TouchableOpacity 
                key={filter} 
                style={[
                  styles.filterPill, 
                  selectedFilter === filter && styles.filterPillActive
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text style={[
                  styles.filterText, 
                  selectedFilter === filter && styles.filterTextActive
                ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Records List */}
        <FlatList
          data={filteredRecords}
          keyExtractor={(item) => item.id}
          renderItem={renderRecordItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        {/* Floating Add Button & Back Home */}
        <View style={styles.footerContainer}>
          <TouchableOpacity style={styles.addButton}>
            <Plus size={28} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.backHomeButton}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.backHomeText}>Back to home</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
};