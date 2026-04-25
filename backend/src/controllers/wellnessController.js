const { WellnessEntry, User } = require("../models");

const parsePayload = (payload) => {
  try {
    return JSON.parse(payload || "{}");
  } catch {
    return {};
  }
};

const getDbUser = async (req) => {
  if (!req.user?.uid) return null;
  return User.findOne({ where: { firebase_uid: req.user.uid } });
};

exports.createEntry = async (req, res) => {
  try {
    const dbUser = await getDbUser(req);
    if (!dbUser) return res.status(401).json({ error: "Unauthorized user" });

    const { type, payload } = req.body || {};
    if (!type) return res.status(400).json({ error: "type is required" });

    const entry = await WellnessEntry.create({
      userId: dbUser.id,
      type,
      payload: JSON.stringify(payload || {}),
    });
    return res.status(201).json({
      success: true,
      entry: {
        id: entry.id,
        type: entry.type,
        payload: parsePayload(entry.payload),
        createdAt: entry.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.listEntries = async (req, res) => {
  try {
    const dbUser = await getDbUser(req);
    if (!dbUser) return res.status(401).json({ error: "Unauthorized user" });

    const where = { userId: dbUser.id };
    if (req.query.type) where.type = req.query.type;

    const limit = Math.min(Number(req.query.limit || 100), 500);
    const list = await WellnessEntry.findAll({
      where,
      order: [["createdAt", "DESC"]],
      limit,
    });

    return res.json(
      list.map((entry) => ({
        id: entry.id,
        type: entry.type,
        payload: parsePayload(entry.payload),
        createdAt: entry.createdAt,
      })),
    );
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
