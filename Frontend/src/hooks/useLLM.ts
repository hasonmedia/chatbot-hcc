import { useState, useEffect, useCallback } from "react";
import {
  getAllLLMs,
  getLLMById,
  createLLM,
  updateLLM,
  createLLMKey,
  updateLLMKey,
  deleteLLMKey,
} from "@/services/llmService";
import type { LLM, LLMData, LLMKeyData } from "@/types/llm";

export const useLLM = () => {
  const [llmConfig, setLlmConfig] = useState<LLMData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load LLM configuration on mount
  const loadLLMConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const llms = await getAllLLMs();
      setLlmConfig(llms);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load LLM config"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const saveConfiguration = useCallback(
    async (data: {
      chatbotName: string;
      welcomeMessage: string;
      prompt: string;
      botModelDetailId?: string;
      embeddingModelDetailId?: string;
      companyId?: string;
    }) => {
      try {
        setLoading(true);
        setError(null);

        const llmData: Partial<LLM> = {
          botName: data.chatbotName,
          system_greeting: data.welcomeMessage,
          prompt: data.prompt,
          bot_model_detail_id: data.botModelDetailId || "1",
          embedding_model_detail_id: data.embeddingModelDetailId || "1",
          company_id: data.companyId || "1",
        };

        let updatedLLM: LLMData;

        if (llmConfig) {
          updatedLLM = await updateLLM(llmConfig.id, llmData);
        } else {
          updatedLLM = await createLLM(llmData);
        }
        // Reload with keys
        const llmWithKeys = await getLLMById(updatedLLM.id);
        setLlmConfig(llmWithKeys);

        return updatedLLM;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to save configuration"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [llmConfig]
  );

  const saveKey = useCallback(
    async (keyData: {
      name: string;
      key: string;
      type: "bot" | "embedding";
      keyId?: number;
      llmDetailId?: number; // ID của llm_detail để thêm key vào
    }) => {
      if (!llmConfig) {
        throw new Error("LLM configuration must be created first");
      }

      try {
        setLoading(true);
        setError(null);

        const { keyId, llmDetailId, ...keyPayload } = keyData;

        // Nếu không có llmDetailId, sử dụng detail đầu tiên
        const targetDetailId = llmDetailId || llmConfig.llm_details[0]?.id;

        if (!targetDetailId) {
          throw new Error("No LLM detail found to add key to");
        }

        let savedKey: LLMKeyData;

        if (keyId) {
          // Update existing key
          savedKey = await updateLLMKey(llmConfig.id, keyId, keyPayload);
        } else {
          // Create new key - sử dụng targetDetailId thay vì llmConfig.id
          savedKey = await createLLMKey(targetDetailId, keyPayload);
        }
        // Reload configuration with updated keys
        const updatedLLM = await getLLMById(llmConfig.id);
        setLlmConfig(updatedLLM);

        return savedKey;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save key");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [llmConfig]
  );

  // Delete LLM key
  const deleteKey = useCallback(
    async (keyId: number) => {
      if (!llmConfig) {
        throw new Error("LLM configuration not found");
      }

      try {
        setLoading(true);
        setError(null);

        // Tìm llm_detail_id của key để xóa
        let llmDetailId: number | undefined;
        for (const detail of llmConfig.llm_details) {
          const keyExists = detail.llm_keys?.find(
            (key: LLMKeyData) => key.id === keyId
          );
          if (keyExists) {
            llmDetailId = detail.id;
            break;
          }
        }

        if (!llmDetailId) {
          throw new Error("Key not found in any LLM detail");
        }

        await deleteLLMKey(llmDetailId, keyId);
        // Reload configuration with updated keys
        const updatedLLM = await getLLMById(llmConfig.id);
        setLlmConfig(updatedLLM);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete key");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [llmConfig]
  );
  const getKeysByType = useCallback(
    (type: "bot" | "embedding") => {
      if (!llmConfig || !llmConfig.llm_details) return [];

      // Flatten all keys from all llm_details
      const allKeys: LLMKeyData[] = [];
      llmConfig.llm_details.forEach((detail: any) => {
        if (detail.llm_keys) {
          allKeys.push(...detail.llm_keys);
        }
      });

      return allKeys.filter((key) => key.type === type);
    },
    [llmConfig]
  );

  useEffect(() => {
    loadLLMConfig();
  }, [loadLLMConfig]);

  return {
    llmConfig,
    loading,
    error,
    saveConfiguration,
    saveKey,
    deleteKey,
    getKeysByType,
    reload: loadLLMConfig,
  };
};
