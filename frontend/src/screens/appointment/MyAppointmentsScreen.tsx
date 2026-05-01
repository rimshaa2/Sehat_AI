import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    StyleSheet,
} from "react-native";
import { ChevronLeft, ChevronRight, Clock, CalendarX } from "lucide-react-native";
import { getAuth } from "@react-native-firebase/auth";
import { useFocusEffect } from "@react-navigation/native";
import { getUserProfile, getMyAppointments } from "../../services/api";

const MyAppointmentsScreen = ({ navigation }: any) => {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const auth = getAuth();

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            const fetchAppointments = async () => {
                setLoading(true);
                const currentUser = auth.currentUser;
                if (!currentUser) {
                    if (isActive) setLoading(false);
                    return;
                }

                // Safety timeout — never spin forever
                const safetyTimer = setTimeout(() => {
                    if (isActive) { setLoading(false); setAppointments([]); }
                }, 10000);
                try {
                    let userProfile;
                    try {
                        userProfile = await getUserProfile(currentUser.uid);
                    } catch (profileErr) {
                        clearTimeout(safetyTimer);
                        if (isActive) { setLoading(false); setAppointments([]); }
                        return;
                    }
                    if (isActive && userProfile) {
                        let data = [];
                        try {
                            data = await getMyAppointments(userProfile.id, 'patient');
                        } catch { data = []; }
                        if (isActive) {
                            setAppointments(data || []);
                            if (!selectedDate) {
                                const todayStr = new Date().toISOString().split("T")[0];
                                setSelectedDate(todayStr);
                            }
                        }
                    }
                    clearTimeout(safetyTimer);
                } catch (error) {
                    clearTimeout(safetyTimer);
                    console.error("Failed to load appointments", error);
                } finally {
                    if (isActive) setLoading(false);
                }
            };

            fetchAppointments();
            return () => { isActive = false; };
        }, [])
    );

    // Build a map of date -> appointments
    const appointmentMap = useMemo(() => {
        const map: Record<string, any[]> = {};
        appointments.forEach((apt) => {
            const dateKey = apt.appointmentDate?.split("T")[0];
            if (!dateKey) return;
            if (!map[dateKey]) map[dateKey] = [];
            map[dateKey].push(apt);
        });
        return map;
    }, [appointments]);

    // Calendar helpers
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthName = currentDate.toLocaleString("default", {
        month: "long",
        year: "numeric",
    });

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToToday = () => {
        setCurrentDate(new Date());
        const todayStr = new Date().toISOString().split("T")[0];
        setSelectedDate(todayStr);
    };

    const todayStr = new Date().toISOString().split("T")[0];

    // Build calendar grid (6 rows x 7 cols)
    const calendarDays: (number | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
    for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);
    while (calendarDays.length % 7 !== 0) calendarDays.push(null);

    const getDayKey = (day: number) => {
        const m = String(month + 1).padStart(2, "0");
        const d = String(day).padStart(2, "0");
        return `${year}-${m}-${d}`;
    };

    const selectedAppointments = selectedDate ? appointmentMap[selectedDate] || [] : [];

    const statusColor = (status: string) => {
        switch (status) {
            case "confirmed":
            case "scheduled":
                return "#10B981"; // emerald-500
            case "completed":
                return "#3B82F6"; // blue-500
            case "cancelled":
                return "#EF4444"; // red-500
            default:
                return "#F97316"; // orange-500
        }
    };

    const formatStatus = (status: string) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft color="#1C2A3A" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Appointments</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Calendar Card */}
                <View style={styles.calendarCard}>
                    {/* Calendar Header Controls */}
                    <View style={styles.calendarHeader}>
                        <Text style={styles.monthName}>{monthName}</Text>
                        <View style={styles.headerControls}>
                            <TouchableOpacity onPress={goToToday} style={styles.todayBtn}>
                                <Text style={styles.todayText}>Today</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
                                <ChevronLeft color="#64748B" size={20} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
                                <ChevronRight color="#64748B" size={20} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Weekday Headers */}
                    <View style={styles.weekdaysRow}>
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                            <Text key={day} style={styles.weekdayText}>{day}</Text>
                        ))}
                    </View>

                    {/* Calendar Grid */}
                    <View style={styles.daysGrid}>
                        {calendarDays.map((day, idx) => {
                            if (day === null) {
                                return <View key={`empty-${idx}`} style={styles.dayCellEmpty} />;
                            }

                            const dayKey = getDayKey(day);
                            const dayApts = appointmentMap[dayKey] || [];
                            const isToday = dayKey === todayStr;
                            const isSelected = dayKey === selectedDate;

                            return (
                                <TouchableOpacity
                                    key={`day-${idx}`}
                                    onPress={() => setSelectedDate(dayKey)}
                                    style={[
                                        styles.dayCell,
                                        isSelected && styles.dayCellSelected,
                                    ]}
                                >
                                    <View style={[
                                        styles.dayNumberContainer,
                                        isToday && styles.dayNumberContainerToday,
                                        isSelected && !isToday && styles.dayNumberContainerSelected
                                    ]}>
                                        <Text style={[
                                            styles.dayNumberText,
                                            isToday && styles.dayNumberTextToday,
                                            isSelected && !isToday && styles.dayNumberTextSelected
                                        ]}>
                                            {day}
                                        </Text>
                                    </View>

                                    {/* Appointment Indicators */}
                                    {dayApts.length > 0 && (
                                        <View style={styles.indicators}>
                                            {dayApts.slice(0, 3).map((apt, i) => (
                                                <View key={i} style={[styles.dot, { backgroundColor: statusColor(apt.status) }]} />
                                            ))}
                                            {dayApts.length > 3 && (
                                                <Text style={styles.moreDotsText}>+</Text>
                                            )}
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Selected Date Detail */}
                <View style={styles.detailCard}>
                    <View style={styles.detailHeader}>
                        <Text style={styles.detailDateText}>
                            {selectedDate
                                ? new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
                                : "Select a date"}
                        </Text>
                        <Text style={styles.detailCountText}>
                            {selectedDate ? `${selectedAppointments.length} appointment(s)` : ""}
                        </Text>
                    </View>

                    <View style={styles.detailContent}>
                        {loading ? (
                            <View style={styles.emptyState}>
                                <ActivityIndicator size="small" color="#199A8E" />
                            </View>
                        ) : !selectedDate ? (
                            <View style={styles.emptyState}>
                                <CalendarX size={36} color="#CBD5E1" />
                                <Text style={styles.emptyText}>Select a date to view appointments</Text>
                            </View>
                        ) : selectedAppointments.length === 0 ? (
                            <View style={styles.emptyState}>
                                <CalendarX size={36} color="#CBD5E1" />
                                <Text style={styles.emptyTitle}>No appointments</Text>
                                <Text style={styles.emptyText}>Nothing scheduled for this day</Text>
                            </View>
                        ) : (
                            <View style={styles.appointmentList}>
                                {selectedAppointments.map(apt => (
                                    <TouchableOpacity
                                        key={apt.id}
                                        style={styles.appointmentItem}
                                        onPress={() => navigation.navigate("AppointmentDetails", {
                                            appointment: {
                                                id: apt.id,
                                                doctorId: apt.doctorId,
                                                doctorName: apt.doctor?.user?.fullName || "Unknown Doctor",
                                                doctorSpecialty: apt.doctor?.specialization || "General",
                                                doctorImage: apt.doctor?.user?.profilePicture,
                                                date: apt.appointmentDate,
                                                time: apt.timeSlot
                                            }
                                        })}
                                    >
                                        <View style={styles.aptInfo}>
                                            <View style={styles.aptDoctorInitial}>
                                                <Text style={styles.aptDoctorInitialText}>
                                                    {apt.doctor?.user?.fullName?.charAt(0) || "D"}
                                                </Text>
                                            </View>
                                            <View>
                                                <Text style={styles.aptDoctorName}>Dr. {apt.doctor?.user?.fullName || "Unknown"}</Text>
                                                <View style={styles.aptTimeRow}>
                                                    <Clock size={12} color="#64748B" />
                                                    <Text style={styles.aptTimeText}>{apt.timeSlot}</Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View style={[styles.aptStatusBadge, { borderColor: statusColor(apt.status) }]}>
                                            <Text style={[styles.aptStatusText, { color: statusColor(apt.status) }]}>
                                                {formatStatus(apt.status)}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: "#FFF",
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1C2A3A",
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    calendarCard: {
        backgroundColor: "#FFF",
        borderRadius: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: 20,
    },
    calendarHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    monthName: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0F172A",
    },
    headerControls: {
        flexDirection: "row",
        alignItems: "center",
    },
    todayBtn: {
        backgroundColor: "#ECFDF5",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        marginRight: 10,
    },
    todayText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#10B981",
    },
    navBtn: {
        padding: 6,
        backgroundColor: "#F8FAFC",
        borderRadius: 8,
        marginLeft: 4,
    },
    weekdaysRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
        paddingBottom: 8,
        marginBottom: 8,
    },
    weekdayText: {
        flex: 1,
        textAlign: "center",
        fontSize: 12,
        fontWeight: "700",
        color: "#94A3B8",
    },
    daysGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    dayCellEmpty: {
        width: "14.28%",
        aspectRatio: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    dayCell: {
        width: "14.28%",
        aspectRatio: 1,
        justifyContent: "center",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#F8FAFC",
    },
    dayCellSelected: {
        backgroundColor: "#F0FDF4",
        borderRadius: 8,
    },
    dayNumberContainer: {
        width: 28,
        height: 28,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 14,
    },
    dayNumberContainerToday: {
        backgroundColor: "#199A8E",
    },
    dayNumberContainerSelected: {
        // just for contrast if selected but not today
    },
    dayNumberText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#334155",
    },
    dayNumberTextToday: {
        color: "#FFF",
    },
    dayNumberTextSelected: {
        color: "#199A8E",
    },
    indicators: {
        flexDirection: "row",
        marginTop: 4,
        minHeight: 6,
        alignItems: 'center',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginHorizontal: 1,
    },
    moreDotsText: {
        fontSize: 8,
        color: "#94A3B8",
        fontWeight: 'bold',
        marginLeft: 1,
    },
    detailCard: {
        backgroundColor: "#FFF",
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        overflow: 'hidden',
    },
    detailHeader: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    detailDateText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0F172A",
    },
    detailCountText: {
        fontSize: 12,
        color: "#64748B",
        marginTop: 2,
    },
    detailContent: {
        padding: 16,
        minHeight: 150,
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 32,
    },
    emptyTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#334155",
        marginTop: 12,
    },
    emptyText: {
        fontSize: 12,
        color: "#94A3B8",
        marginTop: 4,
    },
    appointmentList: {
        gap: 12,
    },
    appointmentItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        backgroundColor: "#F8FAFC",
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },
    aptInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    aptDoctorInitial: {
        width: 36,
        height: 36,
        backgroundColor: "#FFF",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        alignItems: "center",
        justifyContent: "center",
    },
    aptDoctorInitialText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#475569",
    },
    aptDoctorName: {
        fontSize: 14,
        fontWeight: "700",
        color: "#0F172A",
    },
    aptTimeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: 4,
    },
    aptTimeText: {
        fontSize: 12,
        color: "#64748B",
        fontWeight: "500",
    },
    aptStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
    },
    aptStatusText: {
        fontSize: 10,
        fontWeight: "700",
    },
});

export default MyAppointmentsScreen;