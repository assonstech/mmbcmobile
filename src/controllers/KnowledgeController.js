// src/controllers/KnowledgeController.js
import http from '../common/HttpSerivce';

export const fetchKnowledgePosts = async () => {
  try {
    const res = await http.get('/mobile/knowledge/');
    if (res.success && res.data) {
      return res.data; 
    }
    console.log('Fetch knowledge failed:', res.message);
    return [];
  } catch (err) {
    console.log('Knowledge API error:', err);
    return [];
  }
};
