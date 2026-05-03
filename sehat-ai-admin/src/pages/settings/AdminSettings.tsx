import { useState } from "react";
import {
  Settings,
  Bell,
  Shield,
  Link2,
  FlaskConical,
  Save,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

type TabKey =
  | "general"
  | "notifications"
  | "security"
  | "integrations"
  | "testing";

const TABS: { key: TabKey; label: string; icon: typeof Settings }[] = [
  { key: "general", label: "General", icon: Settings },
  // { key: "notifications", label: "Notifications", icon: Bell },
  // { key: "security", label: "Security", icon: Shield },
  // { key: "integrations", label: "Integrations", icon: Link2 },
  // { key: "testing", label: "Testing", icon: FlaskConical },
];

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface WorkingHour {
  day: string;
  start: string;
  end: string;
  enabled: boolean;
}

export const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("general");

  // General settings
  const [general, setGeneral] = useState({
    clinicName: "Sehat AI Healthcare Center",
    adminEmail: "admin@sehatai.com",
    contactPhone: "+1 (555) 123-4567",
    timezone: "Eastern Time (ET)",
    consultationFee: "50.00",
    currency: "USD",
    clinicAddress:
      "123 Healthcare Avenue, Medical District, New York, NY 10001",
  });

  // Working hours
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>(
    DAYS.map((day) => ({
      day,
      start: "09:00",
      end: "18:00",
      enabled: day !== "Sunday",
    })),
  );

  const handleGeneralChange = (field: string, value: string) => {
    setGeneral((prev) => ({ ...prev, [field]: value }));
    setSettingsErrors((prev) => {
      const n = { ...prev };
      delete n[field];
      return n;
    });
  };

  const handleHourChange = (
    index: number,
    field: keyof WorkingHour,
    value: string | boolean,
  ) => {
    setWorkingHours((prev) =>
      prev.map((h, i) => (i === index ? { ...h, [field]: value } : h)),
    );
  };

  const [settingsErrors, setSettingsErrors] = useState<Record<string, string>>(
    {},
  );

  const validateSettings = () => {
    const errs: Record<string, string> = {};
    if (!general.clinicName.trim())
      errs.clinicName = "Clinic name is required.";
    if (!general.adminEmail.trim()) errs.adminEmail = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(general.adminEmail))
      errs.adminEmail = "Enter a valid email.";
    if (!general.contactPhone.trim())
      errs.contactPhone = "Phone number is required.";
    if (!general.consultationFee.trim())
      errs.consultationFee = "Fee is required.";
    else if (Number(general.consultationFee) <= 0)
      errs.consultationFee = "Fee must be greater than 0.";
    if (!general.clinicAddress.trim())
      errs.clinicAddress = "Address is required.";
    setSettingsErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validateSettings()) return;
    // In production this would call your API
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          System configuration and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 overflow-x-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all duration-200 ${
                  isActive
                    ? "border-[#199A8E] text-[#199A8E] bg-[#199A8E]/5"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6 md:p-8">
          {activeTab === "general" && (
            <div className="space-y-8">
              {/* General Settings Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-slate-800">
                  <Settings size={18} />
                  <h2 className="text-base font-bold">General Settings</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Clinic Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Clinic Name
                    </label>
                    <input
                      type="text"
                      value={general.clinicName}
                      onChange={(e) =>
                        handleGeneralChange("clinicName", e.target.value)
                      }
                      className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm outline-none focus:ring-2 transition-all ${
                        settingsErrors.clinicName
                          ? "border-red-300 focus:ring-red-200"
                          : "border-slate-200 focus:ring-[#199A8E]/30 focus:border-[#199A8E]"
                      }`}
                    />
                    {settingsErrors.clinicName && (
                      <p className="text-xs text-red-500 font-medium mt-1">
                        {settingsErrors.clinicName}
                      </p>
                    )}
                  </div>

                  {/* Admin Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Admin Email
                    </label>
                    <input
                      type="email"
                      value={general.adminEmail}
                      onChange={(e) =>
                        handleGeneralChange("adminEmail", e.target.value)
                      }
                      className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm outline-none focus:ring-2 transition-all ${
                        settingsErrors.adminEmail
                          ? "border-red-300 focus:ring-red-200"
                          : "border-slate-200 focus:ring-[#199A8E]/30 focus:border-[#199A8E]"
                      }`}
                    />
                    {settingsErrors.adminEmail && (
                      <p className="text-xs text-red-500 font-medium mt-1">
                        {settingsErrors.adminEmail}
                      </p>
                    )}
                  </div>

                  {/* Contact Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={general.contactPhone}
                      onChange={(e) =>
                        handleGeneralChange("contactPhone", e.target.value)
                      }
                      className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm outline-none focus:ring-2 transition-all ${
                        settingsErrors.contactPhone
                          ? "border-red-300 focus:ring-red-200"
                          : "border-slate-200 focus:ring-[#199A8E]/30 focus:border-[#199A8E]"
                      }`}
                    />
                    {settingsErrors.contactPhone && (
                      <p className="text-xs text-red-500 font-medium mt-1">
                        {settingsErrors.contactPhone}
                      </p>
                    )}
                  </div>

                  {/* Timezone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Timezone
                    </label>
                    <select
                      value={general.timezone}
                      onChange={(e) =>
                        handleGeneralChange("timezone", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#199A8E]/30 focus:border-[#199A8E] transition-all appearance-none"
                    >
                      <option>Eastern Time (ET)</option>
                      <option>Central Time (CT)</option>
                      <option>Mountain Time (MT)</option>
                      <option>Pacific Time (PT)</option>
                      <option>Pakistan Standard Time (PKT)</option>
                      <option>UTC</option>
                    </select>
                  </div>

                  {/* Consultation Fee */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Consultation Fee
                    </label>
                    <input
                      type="text"
                      value={general.consultationFee}
                      onChange={(e) =>
                        handleGeneralChange("consultationFee", e.target.value)
                      }
                      className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm outline-none focus:ring-2 transition-all ${
                        settingsErrors.consultationFee
                          ? "border-red-300 focus:ring-red-200"
                          : "border-slate-200 focus:ring-[#199A8E]/30 focus:border-[#199A8E]"
                      }`}
                    />
                    {settingsErrors.consultationFee && (
                      <p className="text-xs text-red-500 font-medium mt-1">
                        {settingsErrors.consultationFee}
                      </p>
                    )}
                  </div>

                  {/* Currency */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Currency
                    </label>
                    <select
                      value={general.currency}
                      onChange={(e) =>
                        handleGeneralChange("currency", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#199A8E]/30 focus:border-[#199A8E] transition-all appearance-none"
                    >
                      <option>USD</option>
                      <option>PKR</option>
                      <option>EUR</option>
                      <option>GBP</option>
                    </select>
                  </div>
                </div>

                {/* Clinic Address (full width) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Clinic Address
                  </label>
                  <input
                    type="text"
                    value={general.clinicAddress}
                    onChange={(e) =>
                      handleGeneralChange("clinicAddress", e.target.value)
                    }
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm outline-none focus:ring-2 transition-all ${
                      settingsErrors.clinicAddress
                        ? "border-red-300 focus:ring-red-200"
                        : "border-slate-200 focus:ring-[#199A8E]/30 focus:border-[#199A8E]"
                    }`}
                  />
                  {settingsErrors.clinicAddress && (
                    <p className="text-xs text-red-500 font-medium mt-1">
                      {settingsErrors.clinicAddress}
                    </p>
                  )}
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-[#199A8E] text-white rounded-xl text-sm font-bold hover:bg-[#15857a] shadow-lg shadow-emerald-100 transition-all active:scale-95"
                >
                  <Save size={16} />
                  Save Changes
                </button>
              </div>

              {/* Working Hours Section */}
              <div className="space-y-5 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-800">
                  <Clock size={18} />
                  <h2 className="text-base font-bold">Working Hours</h2>
                </div>

                <div className="space-y-1">
                  {workingHours.map((wh, idx) => (
                    <div
                      key={wh.day}
                      className={`flex items-center justify-between py-4 px-4 rounded-xl transition-colors ${
                        idx % 2 === 0 ? "bg-slate-50/50" : ""
                      }`}
                    >
                      <span
                        className={`text-sm font-semibold w-28 ${
                          wh.enabled ? "text-slate-800" : "text-slate-400"
                        }`}
                      >
                        {wh.day}
                      </span>

                      <div className="flex items-center gap-3">
                        <input
                          type="time"
                          value={wh.start}
                          disabled={!wh.enabled}
                          onChange={(e) =>
                            handleHourChange(idx, "start", e.target.value)
                          }
                          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#199A8E]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        />
                        <span className="text-slate-400 text-xs font-bold">
                          to
                        </span>
                        <input
                          type="time"
                          value={wh.end}
                          disabled={!wh.enabled}
                          onChange={(e) =>
                            handleHourChange(idx, "end", e.target.value)
                          }
                          className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#199A8E]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        />

                        {/* Toggle */}
                        <button
                          onClick={() =>
                            handleHourChange(idx, "enabled", !wh.enabled)
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                            wh.enabled ? "bg-[#199A8E]" : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                              wh.enabled ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bell size={40} className="text-slate-300 mb-3" />
              <h3 className="text-base font-semibold text-slate-800">
                Notification Preferences
              </h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">
                Configure email, SMS, and push notification settings. Coming
                soon.
              </p>
            </div>
          )}

          {activeTab === "security" && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Shield size={40} className="text-slate-300 mb-3" />
              <h3 className="text-base font-semibold text-slate-800">
                Security Settings
              </h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">
                Manage passwords, two-factor authentication, and session
                policies. Coming soon.
              </p>
            </div>
          )}

          {activeTab === "integrations" && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Link2 size={40} className="text-slate-300 mb-3" />
              <h3 className="text-base font-semibold text-slate-800">
                Integrations
              </h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">
                Connect third-party services like payment gateways, lab systems,
                and more. Coming soon.
              </p>
            </div>
          )}

          {activeTab === "testing" && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FlaskConical size={40} className="text-slate-300 mb-3" />
              <h3 className="text-base font-semibold text-slate-800">
                Testing
              </h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">
                Run system health checks and API diagnostic tests. Coming soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
