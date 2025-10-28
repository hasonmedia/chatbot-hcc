import axiosClient from "./axios";

export const getAllKnowledgeBases = async () => {
  try {
    const response = await axiosClient.get("/knowledge-base/");
    return response;
  } catch (error) {
    throw error;
  }
};

export const searchKnowledge = async (query) => {
  try {
    const response = await axiosClient.get(`/knowledge-base/search`, {
      params: { query },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const createKnowledgeRichText = async (data) => {
  // data = { title, customer_id, raw_content }
  try {
    const response = await axiosClient.post("/knowledge-base/rich-text", data);
    return response;
  } catch (error) {
    throw error;
  }
};

export const createKnowledgeWithFiles = async (formData) => {
  // formData: { title, customer_id, files: [...] }
  try {
    const response = await axiosClient.post(
      "/knowledge-base/upload-files",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateKnowledgeRichText = async (detailId, data) => {
  // data = { title, customer_id, raw_content }
  try {
    const response = await axiosClient.put(
      `/knowledge-base/rich-text/${detailId}`,
      data
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateKnowledgeWithFiles = async (kbId, formData) => {
  // formData: { title?, customer_id?, files: [...] }
  try {
    const response = await axiosClient.patch(
      `/knowledge-base/update-files/${kbId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteKnowledgeDetail = async (detailId) => {
  try {
    const response = await axiosClient.delete(
      `/knowledge-base/detail/${detailId}`
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const addKnowledgeRichText = async (kbId, data) => {
  // data = { title, customer_id, raw_content }
  try {
    const response = await axiosClient.post(
      `/knowledge-base/rich-text/${kbId}`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
