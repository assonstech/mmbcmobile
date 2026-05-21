// src/controllers/KnowledgeController.js
import http from '../common/HttpSerivce';

export const fetchKnowledgePosts = async (page = 1, limit = 10) => {
  try {
    const res = await http.get('/mobile/knowledge', { page, limit });
    if (res.success && res.data) {
      if (Array.isArray(res.data)) {
        return res.data;
      }

      return res.data.data || res.data.items || []; // supports paginated and plain list responses
    }
    console.log("Knowledge API failed:", res);
    return [];
  } catch (err) {
    console.error("Error fetching knowledge posts:", err);
    return [];
  }
};
