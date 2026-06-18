const { MedicalRecord, Appointment, Doctor, User, MedicineLog, WellnessEntry } = require('../models');
const { Op } = require('sequelize');

// ─── helpers ──────────────────────────────────────────────────────────────────

const getDbUser = async (req) => {
  if (req.dbUser) return req.dbUser;
  if (!req.user?.uid) return null;
  return User.findOne({ where: { firebase_uid: req.user.uid } });
};

const parsePayload = (raw) => {
  try { return JSON.parse(raw || '{}'); } catch { return {}; }
};

// colour / icon mapping for auto-generated records
const TYPE_META = {
  'AI Consultation':    { color: '#EDE9FE', iconColor: '#7C3AED' },
  'Appointment':        { color: '#DBEAFE', iconColor: '#2563EB' },
  'Medicine Log':       { color: '#D1FAE5', iconColor: '#059669' },
  'Mental Wellness':    { color: '#FEF3C7', iconColor: '#D97706' },
  'Symptom Check':      { color: '#FCE7F3', iconColor: '#DB2777' },
  'Lab Reports':        { color: '#DBEAFE', iconColor: '#2563EB' },
  'Prescriptions':      { color: '#D1FAE5', iconColor: '#059669' },
  'General':            { color: '#F3F4F6', iconColor: '#6B7280' },
};

function metaFor(type) {
  return TYPE_META[type] || { color: '#E0F2FE', iconColor: '#0284C7' };
}

// ─── 1. Create a manual record ─────────────────────────────────────────────────
exports.create = async (req, res) => {
  try {
    const { userId, title, doctor_name, record_date, record_type, details, color_code } = req.body;

    const record = await MedicalRecord.create({
      userId,
      title,
      doctor_name,
      record_date,
      record_type,
      details,
      color_code: color_code || metaFor(record_type).color,
    });

    return res.status(201).json({ message: 'Record saved', record });
  } catch (error) {
    console.error('Save Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// ─── 2. Get ALL records for a user (manual + auto-aggregated) ──────────────────
exports.getAllByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const allRecords = [];

    // A) Manual medical records (user-created)
    const manualRecords = await MedicalRecord.findAll({
      where: { userId },
      order: [['record_date', 'DESC']],
    });

    manualRecords.forEach((r) => {
      const meta = metaFor(r.record_type);
      allRecords.push({
        id:          `manual_${r.id}`,
        rawId:       r.id,
        source:      'manual',
        title:       r.title,
        doctor_name: r.doctor_name || 'Sehat AI',
        record_date: r.record_date,
        record_type: r.record_type,
        details:     r.details || '',
        color_code:  r.color_code || meta.color,
        icon_color:  meta.iconColor,
        createdAt:   r.createdAt,
        canEdit:     true,
        canDelete:   true,
      });
    });

    // B) Appointments (completed or scheduled)
    try {
      const appointments = await Appointment.findAll({
        where: {
          patientId: userId,
          status: { [Op.in]: ['completed', 'scheduled'] },
        },
        include: [
          {
            model: Doctor,
            as: 'doctor',
            include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
          },
        ],
        order: [['appointmentDate', 'DESC']],
      });

      appointments.forEach((appt) => {
        const doctorName = appt.doctor?.user?.name || 'Doctor';
        const specialty  = appt.doctor?.specialization || 'Specialist';
        const statusLabel = appt.status === 'completed' ? 'Completed' : 'Scheduled';
        allRecords.push({
          id:          `appt_${appt.id}`,
          rawId:       null,
          source:      'appointment',
          title:       `${statusLabel} Appointment — ${specialty}`,
          doctor_name: `Dr. ${doctorName}`,
          record_date: appt.appointmentDate,
          record_type: 'Appointment',
          details:     [
            `Date: ${appt.appointmentDate}`,
            `Time: ${appt.timeSlot}`,
            `Doctor: Dr. ${doctorName} (${specialty})`,
            `Status: ${appt.status}`,
            appt.reason ? `Reason: ${appt.reason}` : '',
            `Payment: ${appt.paymentStatus} — PKR ${appt.amount}`,
          ].filter(Boolean).join('\n'),
          color_code:  '#DBEAFE',
          icon_color:  '#2563EB',
          createdAt:   appt.createdAt,
          canEdit:     false,
          canDelete:   false,
        });
      });
    } catch (e) {
      console.error('Appointments aggregation error:', e.message);
    }

    // C) Medicine logs
    try {
      const medicines = await MedicineLog.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
      });

      medicines.forEach((med) => {
        const times = parsePayload(med.times);
        allRecords.push({
          id:          `med_${med.id}`,
          rawId:       null,
          source:      'medicine',
          title:       `Medicine: ${med.name} ${med.dose}${med.unit}`,
          doctor_name: 'Medicine Tracker',
          record_date: med.createdAt?.toISOString?.().split('T')[0] || new Date().toISOString().split('T')[0],
          record_type: 'Medicine Log',
          details:     [
            `Medicine: ${med.name}`,
            `Dose: ${med.dose} ${med.unit}`,
            `Frequency: ${med.freq}`,
            `Schedule: ${Array.isArray(times) ? times.join(', ') : times}`,
            `Duration: ${med.durationDays} days`,
            `Stock Remaining: ${med.stock} units`,
            med.note ? `Note: ${med.note}` : '',
          ].filter(Boolean).join('\n'),
          color_code:  '#D1FAE5',
          icon_color:  '#059669',
          createdAt:   med.createdAt,
          canEdit:     false,
          canDelete:   false,
        });
      });
    } catch (e) {
      console.error('Medicine aggregation error:', e.message);
    }

    // D) Wellness entries (mood, journal, breathing, anxiety quiz, etc.)
    try {
      const wellnessEntries = await WellnessEntry.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        limit: 50,
      });

      const WELLNESS_LABEL = {
        mood:         'Mood Check-in',
        sleep:        'Sleep Log',
        journal:      'Journal Entry',
        anxiety_quiz: 'Anxiety Assessment',
        breathing:    'Breathing Exercise',
        affirmation:  'Affirmation Session',
        meditation:   'Meditation Session',
        daily_moment: 'Daily Wellness Moment',
      };

      wellnessEntries.forEach((entry) => {
        const payload = parsePayload(entry.payload);
        const label   = WELLNESS_LABEL[entry.type] || entry.type;

        // Build human-readable details from payload
        const detailLines = Object.entries(payload)
          .filter(([, v]) => v !== null && v !== undefined && v !== '')
          .map(([k, v]) => {
            const key = k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
            return `${key}: ${typeof v === 'object' ? JSON.stringify(v) : v}`;
          });

        allRecords.push({
          id:          `wellness_${entry.id}`,
          rawId:       null,
          source:      'wellness',
          title:       label,
          doctor_name: 'Mental Wellness Module',
          record_date: entry.createdAt?.toISOString?.().split('T')[0] || new Date().toISOString().split('T')[0],
          record_type: 'Mental Wellness',
          details:     detailLines.length
            ? detailLines.join('\n')
            : `Completed a ${label} session.`,
          color_code:  '#FEF3C7',
          icon_color:  '#D97706',
          createdAt:   entry.createdAt,
          canEdit:     false,
          canDelete:   false,
        });
      });
    } catch (e) {
      console.error('Wellness aggregation error:', e.message);
    }

    // Sort all records by date descending
    allRecords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json(allRecords);
  } catch (error) {
    console.error('Fetch Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// ─── 3. Get a single MANUAL record by PK ──────────────────────────────────────
exports.getOne = async (req, res) => {
  try {
    const { recordId } = req.params;
    const record = await MedicalRecord.findByPk(recordId);
    if (!record) return res.status(404).json({ error: 'Record not found' });
    return res.status(200).json(record);
  } catch (error) {
    console.error('GetOne Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// ─── 4. Update a MANUAL record ────────────────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const { recordId } = req.params;
    const { title, doctor_name, record_date, record_type, details, color_code } = req.body;

    const record = await MedicalRecord.findByPk(recordId);
    if (!record) return res.status(404).json({ error: 'Record not found' });

    await record.update({
      title:       title       ?? record.title,
      doctor_name: doctor_name ?? record.doctor_name,
      record_date: record_date ?? record.record_date,
      record_type: record_type ?? record.record_type,
      details:     details     ?? record.details,
      color_code:  color_code  ?? record.color_code,
    });

    return res.status(200).json({ message: 'Record updated', record });
  } catch (error) {
    console.error('Update Error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// ─── 5. Delete a MANUAL record ────────────────────────────────────────────────
exports.delete = async (req, res) => {
  try {
    const { recordId } = req.params;
    const record = await MedicalRecord.findByPk(recordId);
    if (!record) return res.status(404).json({ error: 'Record not found' });
    await record.destroy();
    return res.status(200).json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Delete Error:', error);
    return res.status(500).json({ error: error.message });
  }
};