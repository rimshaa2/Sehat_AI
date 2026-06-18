const { CommunityPost, User } = require("../models");

const BAD_WORDS = ["suicide method", "kill yourself", "self-harm instructions"];

const safeJsonParse = (value, fallback = []) => {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    return fallback;
  }
};

const formatPost = (post, dbUserId) => {
  const likes = safeJsonParse(post.likedBy, []);
  const comments = safeJsonParse(post.comments, []);
  const tags = safeJsonParse(post.tags, []);

  return {
    id: post.id,
    title: post.title,
    content: post.content,
    tags,
    likesCount: post.likesCount || likes.length,
    commentsCount: comments.length,
    comments,
    isLikedByMe: dbUserId ? likes.includes(dbUserId) : false,
    isFlagged: Boolean(post.isFlagged),
    createdAt: post.createdAt,
    author: {
      id: post.user?.id,
      fullName: post.user?.fullName || "Anonymous",
      profilePicture: post.user?.profilePicture || null,
    },
  };
};

const getAuthenticatedDbUser = async (req) => {
  if (!req.user?.uid) return null;
  return User.findOne({ where: { firebase_uid: req.user.uid } });
};

exports.listPosts = async (req, res) => {
  try {
    const dbUser = await getAuthenticatedDbUser(req);
    if (!dbUser) return res.status(401).json({ error: "Unauthorized user" });

    const search = (req.query.search || "").trim().toLowerCase();
    const posts = await CommunityPost.findAll({
      include: [{ model: User, as: "user", attributes: ["id", "fullName", "profilePicture"] }],
      order: [["createdAt", "DESC"]],
    });

    const normalized = posts.map((post) => formatPost(post, dbUser.id));
    const filtered = search
      ? normalized.filter(
          (post) =>
            post.title.toLowerCase().includes(search) ||
            post.content.toLowerCase().includes(search) ||
            post.tags.some((tag) => String(tag).toLowerCase().includes(search)),
        )
      : normalized;

    return res.json(filtered);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const dbUser = await getAuthenticatedDbUser(req);
    if (!dbUser) return res.status(401).json({ error: "Unauthorized user" });

    const title = (req.body.title || "").trim();
    const content = (req.body.content || "").trim();
    const tags = Array.isArray(req.body.tags) ? req.body.tags.slice(0, 6) : [];

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required." });
    }

    const normalizedForModeration = `${title} ${content}`.toLowerCase();
    const hasBlockedPhrase = BAD_WORDS.some((phrase) =>
      normalizedForModeration.includes(phrase),
    );
    if (hasBlockedPhrase) {
      return res.status(400).json({
        error:
          "Post contains unsafe content. Please remove harmful details and try again.",
      });
    }

    const created = await CommunityPost.create({
      userId: dbUser.id,
      title,
      content,
      tags: JSON.stringify(tags),
      likedBy: "[]",
      comments: "[]",
      likesCount: 0,
      isFlagged: false,
    });

    const post = await CommunityPost.findByPk(created.id, {
      include: [{ model: User, as: "user", attributes: ["id", "fullName", "profilePicture"] }],
    });

    return res.status(201).json({ success: true, post: formatPost(post, dbUser.id) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const dbUser = await getAuthenticatedDbUser(req);
    if (!dbUser) return res.status(401).json({ error: "Unauthorized user" });

    const post = await CommunityPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found." });

    const likedBy = safeJsonParse(post.likedBy, []);
    const alreadyLiked = likedBy.includes(dbUser.id);
    const nextLikedBy = alreadyLiked
      ? likedBy.filter((id) => id !== dbUser.id)
      : [...likedBy, dbUser.id];

    post.likedBy = JSON.stringify(nextLikedBy);
    post.likesCount = nextLikedBy.length;
    await post.save();

    return res.json({
      success: true,
      likesCount: post.likesCount,
      isLikedByMe: !alreadyLiked,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const dbUser = await getAuthenticatedDbUser(req);
    if (!dbUser) return res.status(401).json({ error: "Unauthorized user" });

    const text = (req.body.text || "").trim();
    if (!text) return res.status(400).json({ error: "Comment text is required." });

    const post = await CommunityPost.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found." });

    const comments = safeJsonParse(post.comments, []);
    comments.unshift({
      id: Date.now(),
      text,
      authorId: dbUser.id,
      authorName: dbUser.fullName,
      createdAt: new Date().toISOString(),
    });

    post.comments = JSON.stringify(comments.slice(0, 50));
    await post.save();

    return res.status(201).json({
      success: true,
      commentsCount: comments.length,
      comments: comments.slice(0, 50),
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
