import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input, type InputProps } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Eye,
  EyeOff,
  PlusCircle,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { RadioGroupSetting } from "./RadioGroup";
import { Textarea } from "../ui/textarea";
import { useLLM } from "@/hooks/useLLM";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "../ui/toast";

const PasswordInput = (props: InputProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = isVisible ? EyeOff : Eye;

  return (
    <div className="relative">
      <Input
        type={isVisible ? "text" : "password"}
        className="pr-10"
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-gray-500 hover:text-gray-900"
        onClick={() => setIsVisible(!isVisible)}
        aria-label={isVisible ? "Ẩn key" : "Hiển thị key"}
      >
        <Icon className="h-4 w-4" />
      </Button>
    </div>
  );
};

export function SettingsTabs() {
  const {
    llmConfig,
    loading,
    error,
    saveConfiguration,
    saveKey,
    deleteKey,
    getKeysByType,
  } = useLLM();

  const { success, error: showError, toasts, removeToast } = useToast();

  const [chatbotName, setChatbotName] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [prompt, setPrompt] = useState("");
  const [embeddingKey, setEmbeddingKey] = useState("");
  const [aiKeys, setAiKeys] = useState<
    Array<{ id: number; value: string; keyId?: number }>
  >([]);
  const [showAiKeySection, setShowAiKeySection] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    keyId: number | null;
    keyIndex: number;
  }>({
    isOpen: false,
    keyId: null,
    keyIndex: 0,
  });

  const [selectedBotModel, setSelectedBotModel] = useState("");
  const [selectedEmbeddingModel, setSelectedEmbeddingModel] = useState("");

  const getModelOptions = () => {
    if (!llmConfig?.llm_details) return [];
    return llmConfig.llm_details.map((detail) => ({
      value: detail.name.toLowerCase(),
      label: detail.name.charAt(0).toUpperCase() + detail.name.slice(1),
      id: detail.id,
    }));
  };

  const getModelNameById = (modelId: number) => {
    const model = llmConfig?.llm_details.find(
      (detail) => detail.id === modelId
    );
    return model ? model.name.toLowerCase() : "";
  };

  const getModelIdByName = (modelName: string) => {
    const model = llmConfig?.llm_details.find(
      (detail) => detail.name.toLowerCase() === modelName.toLowerCase()
    );
    return model ? model.id : undefined;
  };

  useEffect(() => {
    if (llmConfig) {
      setChatbotName(llmConfig.botName || "");
      setWelcomeMessage(llmConfig.system_greeting || "");
      setPrompt(llmConfig.prompt || "");

      setSelectedBotModel(getModelNameById(llmConfig.bot_model_detail_id));
      setSelectedEmbeddingModel(
        getModelNameById(llmConfig.embedding_model_detail_id)
      );

      const embeddingKeys = getKeysByType("embedding");
      if (embeddingKeys.length > 0) {
        setEmbeddingKey(embeddingKeys[0].key);
      }

      const botKeys = getKeysByType("bot");
      if (botKeys.length > 0) {
        setShowAiKeySection(true);
        setAiKeys(
          botKeys.map((key, index) => ({
            id: key.id || Date.now() + index,
            value: key.key,
            keyId: key.id,
          }))
        );
      }
    }
  }, [llmConfig, getKeysByType]);

  const handleSaveEmbeddingKey = async () => {
    if (!embeddingKey.trim()) return;

    try {
      const existingEmbeddingKeys = getKeysByType("embedding");

      const embeddingDetailId =
        getModelIdByName(selectedEmbeddingModel) ||
        llmConfig?.embedding_model_detail_id ||
        llmConfig?.llm_details[0]?.id;

      const keyData = {
        name: "Embedding Key",
        key: embeddingKey,
        type: "embedding" as const,
        keyId:
          existingEmbeddingKeys.length > 0
            ? existingEmbeddingKeys[0].id
            : undefined,
        llmDetailId: embeddingDetailId,
      };

      await saveKey(keyData);
      success("Embedding key đã được lưu thành công!");
    } catch (err) {
      showError(
        "Lỗi khi lưu embedding key: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  const handleSaveAiKeys = async () => {
    try {
      const botDetailId =
        getModelIdByName(selectedBotModel) ||
        llmConfig?.bot_model_detail_id ||
        llmConfig?.llm_details[0]?.id;

      for (const key of aiKeys) {
        if (key.value.trim()) {
          const keyData = {
            name: `AI Key ${key.id}`,
            key: key.value,
            type: "bot" as const,
            keyId: key.keyId,
            llmDetailId: botDetailId,
          };
          await saveKey(keyData);
        }
      }
      success("AI keys đã được lưu thành công!");
    } catch (err) {
      showError(
        "Lỗi khi lưu AI keys: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  const handleSaveChatbotInfo = async () => {
    try {
      await saveConfiguration({
        chatbotName,
        welcomeMessage,
        prompt: prompt || "",
        botModelDetailId: getModelIdByName(selectedBotModel)?.toString(),
        embeddingModelDetailId: getModelIdByName(
          selectedEmbeddingModel
        )?.toString(),
      });
      success("Thông tin chatbot đã được lưu thành công!");
    } catch (err) {
      showError(
        "Lỗi khi lưu thông tin chatbot: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  const handleSavePrompt = async () => {
    try {
      await saveConfiguration({
        chatbotName: llmConfig?.botName || chatbotName || "",
        welcomeMessage: welcomeMessage || "",
        prompt,
        botModelDetailId: getModelIdByName(selectedBotModel)?.toString(),
        embeddingModelDetailId: getModelIdByName(
          selectedEmbeddingModel
        )?.toString(),
      });
      success("Prompt đã được lưu thành công!");
    } catch (err) {
      showError(
        "Lỗi khi lưu prompt: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  const handleEmbeddingKeyChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEmbeddingKey(event.target.value);
  };

  const handleAiKeyChange = (
    id: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = event.target.value;
    setAiKeys((currentKeys) =>
      currentKeys.map((key) =>
        key.id === id ? { ...key, value: newValue } : key
      )
    );
  };

  const addAiKeyInput = () => {
    if (!showAiKeySection) {
      setShowAiKeySection(true);
      setAiKeys([{ id: Date.now(), value: "" }]);
      return;
    }
    setAiKeys((currentKeys) => [...currentKeys, { id: Date.now(), value: "" }]);
  };

  const handleDeleteKeyClick = (id: number) => {
    const keyIndex = aiKeys.findIndex((key) => key.id === id);
    setDeleteDialog({
      isOpen: true,
      keyId: id,
      keyIndex: keyIndex + 1,
    });
  };

  const confirmDeleteKey = async () => {
    if (deleteDialog.keyId === null) return;

    const keyToRemove = aiKeys.find((key) => key.id === deleteDialog.keyId);

    if (keyToRemove?.keyId) {
      try {
        await deleteKey(keyToRemove.keyId);
        success("Key đã được xóa thành công!");
      } catch (err) {
        showError(
          "Lỗi khi xóa key: " +
            (err instanceof Error ? err.message : "Unknown error")
        );
        setDeleteDialog({ isOpen: false, keyId: null, keyIndex: 0 });
        return;
      }
    }

    setAiKeys((currentKeys) =>
      currentKeys.filter((key) => key.id !== deleteDialog.keyId)
    );
    setDeleteDialog({ isOpen: false, keyId: null, keyIndex: 0 });
  };

  return (
    <>
      <div className="flex w-full flex-col gap-4 sm:gap-6">
        {error && (
          <div className="flex items-center gap-2 p-3 sm:p-4 border border-red-200 bg-red-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <span className="text-red-700 text-sm sm:text-base">{error}</span>
          </div>
        )}

        <Tabs defaultValue="configEmbedding" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto">
            <TabsTrigger
              value="configEmbedding"
              className="text-xs sm:text-sm px-2 py-2"
            >
              Key embedding
            </TabsTrigger>
            <TabsTrigger
              value="configAI"
              className="text-xs sm:text-sm px-2 py-2"
            >
              Key AI bot
            </TabsTrigger>
            <TabsTrigger
              value="configPrompt"
              className="text-xs sm:text-sm px-2 py-2"
            >
              Prompt
            </TabsTrigger>
            <TabsTrigger
              value="configInfo"
              className="text-xs sm:text-sm px-2 py-2"
            >
              Thông tin bot
            </TabsTrigger>
          </TabsList>
          <TabsContent value="configEmbedding">
            <Card>
              <CardHeader>
                <CardTitle>Cấu hình key embedding</CardTitle>
                <CardDescription>
                  Cấu hình API key cho dịch vụ embedding. Chỉ cần một key duy
                  nhất.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-name">Chọn mô hình</Label>
                  <RadioGroupSetting
                    value={selectedEmbeddingModel}
                    onValueChange={setSelectedEmbeddingModel}
                    options={getModelOptions()}
                  />
                </div>

                <div className="grid gap-4">
                  <Label>API Key</Label>
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="embedding-key"
                      className="text-xs text-gray-600"
                    >
                      Embedding Key
                    </Label>
                    <PasswordInput
                      id="embedding-key"
                      value={embeddingKey}
                      onChange={handleEmbeddingKeyChange}
                      placeholder="Dán API key cho embedding tại đây..."
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveEmbeddingKey} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    "Lưu cấu hình"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="configAI">
            <Card>
              <CardHeader>
                <CardTitle>Cấu hình AI</CardTitle>
                <CardDescription>
                  Cấu hình API keys cho dịch vụ AI. Có thể thêm nhiều key để
                  tăng hiệu suất.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="tabs-demo-name">Chọn mô hình</Label>
                  <RadioGroupSetting
                    value={selectedBotModel}
                    onValueChange={setSelectedBotModel}
                    options={getModelOptions()}
                  />
                </div>

                <div className="grid gap-4">
                  <Label>API Keys</Label>
                  {showAiKeySection && (
                    <div className="grid gap-4">
                      {aiKeys.map((keyItem, index) => (
                        <div
                          key={keyItem.id}
                          className="flex flex-col sm:flex-row sm:items-center gap-2"
                        >
                          <div className="flex-1 grid gap-1.5">
                            <Label
                              htmlFor={`ai-key-${keyItem.id}`}
                              className="text-xs text-gray-600"
                            >
                              Key {index + 1}
                            </Label>
                            <PasswordInput
                              id={`ai-key-${keyItem.id}`}
                              value={keyItem.value}
                              onChange={(event) =>
                                handleAiKeyChange(keyItem.id, event)
                              }
                              placeholder="Dán API key của bạn vào đây..."
                            />
                          </div>
                          {aiKeys.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="self-end sm:mt-5 text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteKeyClick(keyItem.id)}
                              aria-label="Xóa key"
                              disabled={loading}
                            >
                              <XCircle className="h-5 w-5" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    variant="outline"
                    onClick={addAiKeyInput}
                    className="w-full sm:w-fit"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {aiKeys.length === 0 ? "Thêm key" : "Thêm key khác"}
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveAiKeys} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    "Lưu cấu hình"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="configPrompt">
            <Card>
              <CardHeader>
                <CardTitle>Cấu hình Prompt</CardTitle>
                <CardDescription>
                  Change your password here. After saving, you&apos;ll be logged
                  out.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <Textarea
                  placeholder="Nhập prompt tùy chỉnh của bạn ở đây..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </CardContent>
              <CardFooter>
                <Button onClick={handleSavePrompt} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    "Lưu cấu hình"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="configInfo">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin chatbot</CardTitle>
                <CardDescription>
                  Cấu hình tên và lời chào mặc định cho chatbot của bạn.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="chatbot-name">Tên chatbot</Label>
                  <Input
                    id="chatbot-name"
                    type="text"
                    value={chatbotName}
                    onChange={(e) => setChatbotName(e.target.value)}
                    placeholder="Nhập tên cho chatbot của bạn..."
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="welcome-message">Lời chào mặc định</Label>
                  <Textarea
                    id="welcome-message"
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    placeholder="Nhập lời chào mặc định khi người dùng bắt đầu cuộc trò chuyện..."
                    className="min-h-[100px]"
                  />
                </div>

                {/* Xem trước lời chào */}
                {welcomeMessage && (
                  <div className="grid gap-3">
                    <Label>Xem trước lời chào</Label>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                          {chatbotName
                            ? chatbotName.charAt(0).toUpperCase()
                            : "B"}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-700 mb-1">
                            {chatbotName || "Chatbot"}
                          </div>
                          <div className="bg-white rounded-lg p-3 shadow-sm border">
                            {welcomeMessage}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveChatbotInfo} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    "Lưu cấu hình"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog xác nhận xóa key */}
      <Dialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) =>
          setDeleteDialog({ isOpen: open, keyId: null, keyIndex: 0 })
        }
      >
        <DialogContent className="max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa key</DialogTitle>
            <DialogDescription className="text-sm">
              Bạn có chắc chắn muốn xóa Key {deleteDialog.keyIndex}? Hành động
              này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() =>
                setDeleteDialog({ isOpen: false, keyId: null, keyIndex: 0 })
              }
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteKey}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
