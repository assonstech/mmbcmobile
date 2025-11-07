import http from '../common/HttpSerivce';

export const fetchNote = async () => {
  try {
    const res = await http.get('/ceo-data');
    return res;

  } catch (err) {
    console.error('Knowledge API error:', err.message || err);
    return { CEO: {}, Secretaries: [] };
  }
};
