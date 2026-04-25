const { MedicineLog, User } = require("../models");

const parseArray = (value, fallback = []) => {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const getDbUser = async (req) => {
  if (!req.user?.uid) return null;
  return User.findOne({ where: { firebase_uid: req.user.uid } });
};

const serializeMedicine = (med) => ({
  id: String(med.id),
  name: med.name,
  dose: med.dose,
  unit: med.unit,
  freq: med.freq,
  times: parseArray(med.times, []),
  color: med.color,
  stock: med.stock,
  durationDays: med.durationDays,
  note: med.note || "",
  taken: parseArray(med.taken, Array(7).fill(false)),
});

exports.getMyMedicines = async (req, res) => {
  try {
    const dbUser = await getDbUser(req);
    if (!dbUser) return res.status(401).json({ error: "Unauthorized user" });

    const list = await MedicineLog.findAll({
      where: { userId: dbUser.id },
      order: [["createdAt", "DESC"]],
    });
    return res.json(list.map(serializeMedicine));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.createMedicine = async (req, res) => {
  try {
    const dbUser = await getDbUser(req);
    if (!dbUser) return res.status(401).json({ error: "Unauthorized user" });

    const body = req.body || {};
    const created = await MedicineLog.create({
      userId: dbUser.id,
      name: body.name,
      dose: body.dose,
      unit: body.unit || "mg",
      freq: body.freq,
      times: JSON.stringify(body.times || []),
      color: body.color || "#199A8E",
      stock: Number(body.stock || 0),
      durationDays: Number(body.durationDays || 30),
      note: body.note || "",
      taken: JSON.stringify(body.taken || Array(7).fill(false)),
    });
    return res.status(201).json({ success: true, medicine: serializeMedicine(created) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateMedicine = async (req, res) => {
  try {
    const dbUser = await getDbUser(req);
    if (!dbUser) return res.status(401).json({ error: "Unauthorized user" });

    const med = await MedicineLog.findOne({
      where: { id: req.params.id, userId: dbUser.id },
    });
    if (!med) return res.status(404).json({ error: "Medicine not found" });

    const body = req.body || {};
    await med.update({
      name: body.name ?? med.name,
      dose: body.dose ?? med.dose,
      unit: body.unit ?? med.unit,
      freq: body.freq ?? med.freq,
      times: body.times ? JSON.stringify(body.times) : med.times,
      color: body.color ?? med.color,
      stock: body.stock !== undefined ? Number(body.stock) : med.stock,
      durationDays:
        body.durationDays !== undefined ? Number(body.durationDays) : med.durationDays,
      note: body.note !== undefined ? body.note : med.note,
      taken: body.taken ? JSON.stringify(body.taken) : med.taken,
    });
    return res.json({ success: true, medicine: serializeMedicine(med) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteMedicine = async (req, res) => {
  try {
    const dbUser = await getDbUser(req);
    if (!dbUser) return res.status(401).json({ error: "Unauthorized user" });
    const deleted = await MedicineLog.destroy({
      where: { id: req.params.id, userId: dbUser.id },
    });
    if (!deleted) return res.status(404).json({ error: "Medicine not found" });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
