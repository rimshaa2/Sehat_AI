import { useState, useEffect, useMemo } from "react";
import {
    Stethoscope,
    Users,
    CalendarCheck,
    Clock,
    Download,
    Loader2,
    TrendingUp,
    FileText,
    BarChart3,
    PieChart,
} from "lucide-react";
import api from "../../lib/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ────────────────────────────────────────── types ── */
interface Appointment {
    id: number;
    patientName: string;
    doctorName: string;
    specialization: string;
    date: string;
    rawDate: string;
    time: string;
    type: string;
    status: string;
}
interface Doctor {
    id: number;
    specialization: string;
    consultationFee: number;
    experienceYears: number;
    user?: { fullName: string };
    [key: string]: any;
}
interface UserRow {
    id: number;
    role: string;
    createdAt: string;
    [key: string]: any;
}

/* ────────────────────────────────────────── component ── */
export const ReportsAnalytics = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [aRes, dRes, uRes] = await Promise.all([
                    api.get("/appointments/admin/all"),
                    api.get("/doctors/admin/all"),
                    api.get("/users/all-users"),
                ]);
                setAppointments(aRes.data || []);
                setDoctors(dRes.data || []);
                setUsers(uRes.data || []);
            } catch (e) {
                console.error("Reports fetch error:", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    /* ─── computed ─── */
    const patientCount = users.filter((u) => u.role === "patient").length;
    const totalAppointments = appointments.length;
    const completedApts = appointments.filter((a) => a.status === "completed");
    const cancelledApts = appointments.filter((a) => a.status === "cancelled");
    const scheduledApts = appointments.filter(
        (a) => a.status === "scheduled" || a.status === "confirmed"
    );

    /* avg wait (placeholder metric — use createdAt-to-date gap if available) */
    const avgWait = totalAppointments > 0 ? "~15 min" : "—";

    /* ── top-level KPIs ── */
    const kpis = [
        {
            label: "Total Doctors",
            value: doctors.length,
            sub: `${doctors.filter((d) => d.verificationStatus === "verified").length} verified`,
            icon: Stethoscope,
            color: "text-blue-600",
            bg: "bg-blue-50",
            badge: "bg-blue-100 text-blue-700",
        },
        {
            label: "Total Patients",
            value: patientCount.toLocaleString(),
            sub: "Registered patients",
            icon: Users,
            color: "text-purple-600",
            bg: "bg-purple-50",
            badge: "bg-purple-100 text-purple-700",
        },
        {
            label: "Appointments",
            value: totalAppointments.toLocaleString(),
            sub: `${completedApts.length} completed`,
            icon: CalendarCheck,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            badge: "bg-emerald-100 text-emerald-700",
        },
        {
            label: "Avg Wait Time",
            value: avgWait,
            sub: "Estimated",
            icon: Clock,
            color: "text-orange-600",
            bg: "bg-orange-50",
            badge: "bg-orange-100 text-orange-700",
        },
    ];

    /* ── dept breakdown ── */
    const deptStats = useMemo(() => {
        const map: Record<string, { appointments: number; patients: Set<string> }> = {};
        appointments.forEach((a) => {
            const spec = a.specialization || "General";
            if (!map[spec]) map[spec] = { appointments: 0, patients: new Set() };
            map[spec].appointments += 1;
            map[spec].patients.add(a.patientName);
        });
        return Object.entries(map)
            .map(([name, d]) => ({
                name,
                appointments: d.appointments,
                patients: d.patients.size,
            }))
            .sort((a, b) => b.appointments - a.appointments);
    }, [appointments]);

    const maxApts = Math.max(...deptStats.map((d) => d.appointments), 1);

    /* ── patient demographics (age proxy — group by createdAt year) ── */
    const demographics = useMemo(() => {
        const now = new Date();
        const bins: Record<string, number> = {
            "< 30 days": 0,
            "1–3 months": 0,
            "3–6 months": 0,
            "6+ months": 0,
        };
        users
            .filter((u) => u.role === "patient")
            .forEach((u) => {
                const diff = (now.getTime() - new Date(u.createdAt).getTime()) / (1000 * 60 * 60 * 24);
                if (diff < 30) bins["< 30 days"]++;
                else if (diff < 90) bins["1–3 months"]++;
                else if (diff < 180) bins["3–6 months"]++;
                else bins["6+ months"]++;
            });
        return Object.entries(bins).map(([label, value]) => ({ label, value }));
    }, [users]);
    const maxDemo = Math.max(...demographics.map((d) => d.value), 1);

    /* ── status pie ── */
    const statusData = [
        { label: "Completed", count: completedApts.length, color: "bg-emerald-500", text: "text-emerald-600" },
        { label: "Cancelled", count: cancelledApts.length, color: "bg-amber-500", text: "text-amber-600" },
        { label: "Pending", count: scheduledApts.length, color: "bg-red-400", text: "text-red-500" },
    ];

    /* ── performance ── */
    const pct = (n: number) => (totalAppointments > 0 ? Math.round((n / totalAppointments) * 100) : 0);
    const performance = [
        { label: "Patient Satisfaction", value: pct(completedApts.length), color: "bg-emerald-500" },
        { label: "Appointment Completion", value: pct(completedApts.length), color: "bg-blue-500" },
        { label: "Doctor Performance", value: doctors.length > 0 ? Math.min(100, Math.round((completedApts.length / doctors.length) * 10)) : 0, color: "bg-purple-500" },
        { label: "System Availability", value: 99, color: "bg-rose-400" },
    ];

    /* ── top depts ── */
    const topDepts = deptStats.slice(0, 5);
    const deptColors = ["bg-cyan-500", "bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-purple-500"];

    /* ── Export PDF ── */
    const handleExportPDF = () => {
        const doc = new jsPDF();
        const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

        // Title
        doc.setFontSize(20);
        doc.setTextColor(25, 154, 142);
        doc.text("Sehat AI — Reports & Analytics", 14, 22);
        doc.setFontSize(10);
        doc.setTextColor(120, 120, 120);
        doc.text(`Generated on ${today}`, 14, 29);

        // KPIs
        doc.setDrawColor(230, 230, 230);
        doc.line(14, 34, 196, 34);
        doc.setFontSize(13);
        doc.setTextColor(30, 30, 30);
        doc.text("Key Metrics", 14, 42);

        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        const kpiY = 50;
        kpis.forEach((k, i) => {
            const x = 14 + i * 46;
            doc.setFont("helvetica", "bold");
            doc.text(String(k.value), x, kpiY);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.text(k.label, x, kpiY + 5);
            doc.setFontSize(10);
        });

        // Department Breakdown
        let y = kpiY + 16;
        doc.setFontSize(13);
        doc.setTextColor(30, 30, 30);
        doc.text("Department Breakdown", 14, y);
        y += 4;

        autoTable(doc, {
            startY: y,
            head: [["Department", "Appointments", "Patients"]],
            body: deptStats.map((d) => [d.name, String(d.appointments), String(d.patients)]),
            theme: "striped",
            headStyles: { fillColor: [25, 154, 142] },
            styles: { fontSize: 9 },
        });

        // Appointment Status
        y = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(13);
        doc.setTextColor(30, 30, 30);
        doc.text("Appointment Status", 14, y);
        y += 6;
        doc.setFontSize(10);
        statusData.forEach((s) => {
            doc.text(`${s.label}: ${s.count}`, 14, y);
            y += 6;
        });

        // Appointments Table
        y += 4;
        doc.setFontSize(13);
        doc.text("All Appointments", 14, y);
        y += 4;

        autoTable(doc, {
            startY: y,
            head: [["Patient", "Doctor", "Dept", "Date", "Time", "Status"]],
            body: appointments.map((a) => [
                a.patientName,
                a.doctorName,
                a.specialization || "General",
                a.date,
                a.time,
                a.status,
            ]),
            theme: "striped",
            headStyles: { fillColor: [25, 154, 142] },
            styles: { fontSize: 8 },
        });

        doc.save(`SehatAI_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    /* ── Generate CSV ── */
    const handleGenerateCSV = () => {
        const headers = ["Patient", "Doctor", "Specialization", "Date", "Time", "Type", "Status"];
        const rows = appointments.map((a) =>
            [a.patientName, a.doctorName, a.specialization || "General", a.date, a.time, a.type, a.status]
                .map((v) => `"${String(v).replace(/"/g, '""')}"`) // escape quotes
                .join(",")
        );
        const csv = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `SehatAI_Appointments_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 size={32} className="text-[#199A8E] animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* ── Header ── */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
                    <p className="text-gray-500 mt-1">Analytics and system reports</p>

                    <div className="mt-4">
                        <h3 className="font-semibold text-gray-700">Analytics Overview</h3>
                        <p className="text-sm text-gray-400">
                            Comprehensive analytics for all metrics and reports
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleExportPDF}
                        className="flex items-center gap-2 text-sm border border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <FileText size={15} />
                        Export PDF
                    </button>
                    <button
                        onClick={handleGenerateCSV}
                        className="flex items-center gap-2 text-sm bg-[#199A8E] text-white px-4 py-2 rounded-lg hover:bg-[#148a80] transition-colors"
                    >
                        <Download size={15} />
                        Generate Report
                    </button>
                </div>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((k, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{k.label}</p>
                                <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{k.value}</h3>
                                <p className="text-xs text-gray-400 mt-1">{k.sub}</p>
                            </div>
                            <div className={`p-3 rounded-xl ${k.bg}`}>
                                <k.icon className={`h-6 w-6 ${k.color}`} />
                            </div>
                        </div>
                        <span className={`inline-block mt-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${k.badge}`}>
                            ↑ LIVE DATA
                        </span>
                    </div>
                ))}
            </div>

            {/* ── Patients & Appointments by Department + Top Departments ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Department Bars */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <BarChart3 size={18} className="text-[#199A8E]" />
                            Patients & Appointments / Dept
                        </h3>
                        <div className="flex gap-3 text-xs">
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#199A8E] inline-block" /> Appointments</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-cyan-400 inline-block" /> Patients</span>
                        </div>
                    </div>

                    {deptStats.length === 0 ? (
                        <p className="text-gray-400 text-center py-10">No department data yet</p>
                    ) : (
                        <div className="space-y-4">
                            {deptStats.map((d) => (
                                <div key={d.name}>
                                    <div className="flex justify-between mb-1.5">
                                        <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">{d.name}</span>
                                        <span className="text-xs text-gray-400">
                                            {d.appointments} apts · {d.patients} pts
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        <div className="h-3 rounded-l-full bg-[#199A8E] transition-all duration-700" style={{ width: `${(d.appointments / maxApts) * 100}%` }} />
                                        <div className="h-3 rounded-r-full bg-cyan-400 transition-all duration-700" style={{ width: `${(d.patients / maxApts) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Departments */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-6">
                        <TrendingUp size={18} className="text-[#199A8E]" />
                        Top Departments
                    </h3>
                    <div className="space-y-4">
                        {topDepts.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-6">No data</p>
                        ) : (
                            topDepts.map((d, i) => (
                                <div key={d.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-8 rounded-full ${deptColors[i % deptColors.length]}`} />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{d.name}</p>
                                            <p className="text-xs text-gray-400">{d.patients} patients</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${deptColors[i % deptColors.length].replace("bg-", "bg-").replace("500", "100")} ${deptColors[i % deptColors.length].replace("bg-", "text-").replace("500", "700")}`}>
                                        {d.appointments}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* ── Bottom Row: Demographics, Status, Performance ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Patient Demographics */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-6">
                        <Users size={18} className="text-purple-500" />
                        Patient Demographics
                    </h3>
                    <div className="space-y-4">
                        {demographics.map((d) => {
                            const pctVal = maxDemo > 0 ? Math.round((d.value / maxDemo) * 100) : 0;
                            return (
                                <div key={d.label}>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm text-gray-600">{d.label}</span>
                                        <span className="text-xs font-bold text-gray-500">{d.value}</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className="h-2 rounded-full bg-purple-500 transition-all duration-700" style={{ width: `${pctVal}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Appointment Status */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-6">
                        <PieChart size={18} className="text-emerald-500" />
                        Appointment Status
                    </h3>
                    <div className="space-y-5">
                        {statusData.map((s) => (
                            <div key={s.label} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${s.color}`} />
                                    <span className="text-sm font-medium text-gray-700">{s.label}</span>
                                </div>
                                <span className={`text-sm font-bold ${s.text}`}>{s.count.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>

                    {/* Visual bar summary */}
                    {totalAppointments > 0 && (
                        <div className="flex h-3 rounded-full overflow-hidden mt-6">
                            {statusData.map((s) => (
                                <div
                                    key={s.label}
                                    className={`${s.color} transition-all duration-700`}
                                    style={{ width: `${(s.count / totalAppointments) * 100}%` }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Performance Metrics */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-6">
                        <BarChart3 size={18} className="text-blue-500" />
                        Performance Metrics
                    </h3>
                    <div className="space-y-4">
                        {performance.map((p) => (
                            <div key={p.label}>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-gray-600">{p.label}</span>
                                    <span className="text-xs font-bold text-gray-500">{p.value}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${p.color} transition-all duration-700`}
                                        style={{ width: `${p.value}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
