// src/controllers/KnowledgeController.js
import http from '../common/HttpSerivce';

export const fetchKnowledgePosts = async () => {
  try {
    const res = await http.get('/mobile/knowledge/');
    if (res.success && res.data) {
      return res.data; 
    }
    return [];
  } catch (err) {
    return [];
  }
};
