// src/controllers/KnowledgeController.js
import http from '../common/HttpSerivce';

export const fetchKnowledgePosts = async (page = 1, limit = 10) => {
  try {
    const res = await http.get('/mobile/knowledge', { page, limit });
    if (res.success && res.data) {
      return res.data.data || []; // your backend now returns { total, page, limit, data }
    }
    return [];
  } catch (err) {
    console.error("Error fetching knowledge posts:", err);
    return [];
  }
};
