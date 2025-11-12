import React, { useState, useEffect, useCallback } from "react";
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
    Loader2,
    AlertCircle,
    Trash2,
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

// Component hiển thị từng key item (read-only)
interface KeyItemProps {
    keyItem: { id: number; value: string; keyId?: number; name: string };
    onDelete: (id: number) => void;
    canDelete: boolean;
    loading: boolean;
}

const KeyItem: React.FC<KeyItemProps> = ({
    keyItem,
    onDelete,
    canDelete,
    loading,
}) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="grid gap-3 p-4 border rounded-lg bg-white">
            <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-semibold">{keyItem.name}</Label>
                {canDelete && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onDelete(keyItem.id)}
                        aria-label="Xóa key"
                        disabled={loading}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="grid gap-1.5">
                <Label className="text-xs text-gray-600">API Key</Label>
                <div className="relative">
                    <div className="p-2 bg-gray-50 rounded border text-sm font-mono break-all pr-10">
                        {keyItem.value ? (isVisible ? keyItem.value : '••••••••••••••••••••') : 'Không có key'}
                    </div>
                    {keyItem.value && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-gray-500 hover:text-gray-900"
                            onClick={() => setIsVisible(!isVisible)}
                            aria-label={isVisible ? "Ẩn key" : "Hiển thị key"}
                        >
                            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Component form thêm key trong dialog
interface AddKeyFormProps {
    keys: Array<{ id: number; name: string; value: string }>;
    onKeyChange: (id: number, field: 'name' | 'value', value: string) => void;
    onAddMore: () => void;
    onRemove: (id: number) => void;
}

const AddKeyForm: React.FC<AddKeyFormProps> = ({
    keys,
    onKeyChange,
    onAddMore,
    onRemove,
}) => {
    return (
        <div className="grid gap-4 py-4">
            {keys.map((key, index) => (
                <div key={key.id} className="grid gap-3 p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">Key {index + 1}</Label>
                        {keys.length > 1 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => onRemove(key.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={`new-key-name-${key.id}`}>
                            Tên Key <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id={`new-key-name-${key.id}`}
                            value={key.name}
                            onChange={(e) => onKeyChange(key.id, 'name', e.target.value)}
                            placeholder="Ví dụ: Production Key"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={`new-key-value-${key.id}`}>
                            API Key <span className="text-red-500">*</span>
                        </Label>
                        <PasswordInput
                            id={`new-key-value-${key.id}`}
                            value={key.value}
                            onChange={(e) => onKeyChange(key.id, 'value', e.target.value)}
                            placeholder="Dán API key của bạn vào đây..."
                        />
                    </div>
                </div>
            ))}
            
            <Button
                type="button"
                variant="outline"
                onClick={onAddMore}
                className="w-full"
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Thêm key khác
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
    } = useLLM();

    const { success, error: showError, toasts, removeToast } = useToast();

    const [chatbotName, setChatbotName] = useState("");
    const [welcomeMessage, setWelcomeMessage] = useState("");
    const [prompt, setPrompt] = useState("");
    const [aiKeys, setAiKeys] = useState<
        Array<{ id: number; value: string; keyId?: number; name: string }>
    >([]);
    const [embeddingKeys, setEmbeddingKeys] = useState<
        Array<{ id: number; value: string; keyId?: number; name: string }>
    >([]);
    const [showAiKeySection, setShowAiKeySection] = useState(false);
    const [showEmbeddingKeySection, setShowEmbeddingKeySection] = useState(false);
    
    const [loadingBotModel, setLoadingBotModel] = useState(false);
    const [loadingEmbeddingModel, setLoadingEmbeddingModel] = useState(false);

    const [addKeyDialog, setAddKeyDialog] = useState<{
        isOpen: boolean;
        keyType: "bot" | "embedding";
        keys: Array<{ id: number; name: string; value: string }>;
    }>({
        isOpen: false,
        keyType: "bot",
        keys: [{ id: Date.now(), name: "", value: "" }],
    });

    const [deleteDialog, setDeleteDialog] = useState<{
        isOpen: boolean;
        keyId: number | null;
        keyName: string;
        keyType: "bot" | "embedding";
    }>({
        isOpen: false,
        keyId: null,
        keyName: "",
        keyType: "bot",
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

    // Lấy keys theo model và type
    const getKeysByModelAndType = useCallback(
        (modelName: string, type: "bot" | "embedding") => {
            if (!llmConfig || !llmConfig.llm_details) return [];

            const model = llmConfig.llm_details.find(
                (detail) => detail.name.toLowerCase() === modelName.toLowerCase()
            );

            if (!model || !model.llm_keys) return [];

            return model.llm_keys.filter((key: any) => key.type === type);
        },
        [llmConfig]
    );

    useEffect(() => {
        if (llmConfig) {
            setChatbotName(llmConfig.botName || "");
            setWelcomeMessage(llmConfig.system_greeting || "");
            setPrompt(llmConfig.prompt || "");

            const botModelName = getModelNameById(llmConfig.bot_model_detail_id);
            const embeddingModelName = getModelNameById(llmConfig.embedding_model_detail_id);
            
            setSelectedBotModel(botModelName);
            setSelectedEmbeddingModel(embeddingModelName);
        }
    }, [llmConfig]);

    // Load bot keys khi selectedBotModel thay đổi
    useEffect(() => {
        if (selectedBotModel && llmConfig) {
            const botKeys = getKeysByModelAndType(selectedBotModel, "bot");
            if (botKeys.length > 0) {
                setShowAiKeySection(true);
                setAiKeys(
                    botKeys.map((key: any, index: number) => ({
                        id: key.id || Date.now() + index,
                        value: key.key,
                        keyId: key.id,
                        name: key.name || `Key ${index + 1}`,
                    }))
                );
            } else {
                setShowAiKeySection(false);
                setAiKeys([]);
            }
        }
    }, [selectedBotModel, llmConfig, getKeysByModelAndType]);

    // Load embedding keys khi selectedEmbeddingModel thay đổi
    useEffect(() => {
        if (selectedEmbeddingModel && llmConfig) {
            const embKeys = getKeysByModelAndType(selectedEmbeddingModel, "embedding");
            if (embKeys.length > 0) {
                setShowEmbeddingKeySection(true);
                setEmbeddingKeys(
                    embKeys.map((key: any, index: number) => ({
                        id: key.id || Date.now() + index,
                        value: key.key,
                        keyId: key.id,
                        name: key.name || `Embedding Key ${index + 1}`,
                    }))
                );
            } else {
                setShowEmbeddingKeySection(false);
                setEmbeddingKeys([]);
            }
        }
    }, [selectedEmbeddingModel, llmConfig, getKeysByModelAndType]);

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

    const handleUpdateBotModel = async () => {
        const botModelId = getModelIdByName(selectedBotModel);
        if (!botModelId) {
            showError("Vui lòng chọn model bot");
            return;
        }

        setLoadingBotModel(true);
        try {
            const { updateBotModel } = await import("@/services/llmService");
            await updateBotModel(llmConfig!.id, botModelId);
            success("Bot model đã được cập nhật thành công!");
        } catch (err) {
            showError(
                "Lỗi khi cập nhật bot model: " +
                (err instanceof Error ? err.message : "Unknown error")
            );
        } finally {
            setLoadingBotModel(false);
        }
    };

    const handleUpdateEmbeddingModel = async () => {
        const embeddingModelId = getModelIdByName(selectedEmbeddingModel);
        if (!embeddingModelId) {
            showError("Vui lòng chọn embedding model");
            return;
        }

        setLoadingEmbeddingModel(true);
        try {
            const { updateEmbeddingModel } = await import("@/services/llmService");
            await updateEmbeddingModel(llmConfig!.id, embeddingModelId);
            success("Embedding model đã được cập nhật thành công!");
        } catch (err) {
            showError(
                "Lỗi khi cập nhật embedding model: " +
                (err instanceof Error ? err.message : "Unknown error")
            );
        } finally {
            setLoadingEmbeddingModel(false);
        }
    };

    const addAiKeyInput = () => {
        setAddKeyDialog({
            isOpen: true,
            keyType: "bot",
            keys: [{ id: Date.now(), name: "", value: "" }],
        });
    };

    const addEmbeddingKeyInput = () => {
        setAddKeyDialog({
            isOpen: true,
            keyType: "embedding",
            keys: [{ id: Date.now(), name: "", value: "" }],
        });
    };

    const handleAddKeyDialogChange = (id: number, field: 'name' | 'value', value: string) => {
        setAddKeyDialog(prev => ({
            ...prev,
            keys: prev.keys.map(key =>
                key.id === id ? { ...key, [field]: value } : key
            ),
        }));
    };

    const handleAddMoreKeyInDialog = () => {
        setAddKeyDialog(prev => ({
            ...prev,
            keys: [...prev.keys, { id: Date.now(), name: "", value: "" }],
        }));
    };

    const handleRemoveKeyFromDialog = (id: number) => {
        setAddKeyDialog(prev => ({
            ...prev,
            keys: prev.keys.filter(key => key.id !== id),
        }));
    };

    const handleSaveNewKey = async () => {
        // Validate tất cả keys
        const emptyNameKey = addKeyDialog.keys.find(k => !k.name.trim());
        if (emptyNameKey) {
            showError("Vui lòng nhập tên cho tất cả các keys");
            return;
        }

        const emptyValueKey = addKeyDialog.keys.find(k => !k.value.trim());
        if (emptyValueKey) {
            showError("Vui lòng nhập API key cho tất cả các keys");
            return;
        }

        try {
            const modelId = addKeyDialog.keyType === "bot" 
                ? getModelIdByName(selectedBotModel)
                : getModelIdByName(selectedEmbeddingModel);

            if (!modelId) {
                showError(`Vui lòng chọn model ${addKeyDialog.keyType === "bot" ? "bot" : "embedding"}`);
                return;
            }

            let successCount = 0;
            let hasError = false;

            for (const key of addKeyDialog.keys) {
                try {
                    const keyData = {
                        name: key.name.trim(),
                        key: key.value.trim(),
                        type: addKeyDialog.keyType,
                        llmDetailId: modelId,
                    };

                    await saveKey(keyData);
                    successCount++;
                } catch (err: any) {
                    hasError = true;
                    const errorMessage = err?.response?.data?.detail || err?.message || "Unknown error";
                    showError(`Lỗi khi thêm key "${key.name}": ${errorMessage}`);
                }
            }

            if (successCount > 0) {
                success(`Đã thêm thành công ${successCount} key(s)!`);
            }
            
            if (!hasError) {
                // Reset dialog
                setAddKeyDialog({
                    isOpen: false,
                    keyType: "bot",
                    keys: [{ id: Date.now(), name: "", value: "" }],
                });
            }
        } catch (err: any) {
            const errorMessage = err?.response?.data?.detail || err?.message || "Unknown error";
            showError(`Lỗi khi thêm key: ${errorMessage}`);
        }
    };

    const handleDeleteKeyClick = (id: number) => {
        const keyToDelete = aiKeys.find((key) => key.id === id);
        setDeleteDialog({
            isOpen: true,
            keyId: id,
            keyName: keyToDelete?.name || `Key ${id}`,
            keyType: "bot",
        });
    };

    const handleDeleteEmbeddingKeyClick = (id: number) => {
        const keyToDelete = embeddingKeys.find((key) => key.id === id);
        setDeleteDialog({
            isOpen: true,
            keyId: id,
            keyName: keyToDelete?.name || `Embedding Key ${id}`,
            keyType: "embedding",
        });
    };

    const confirmDeleteKey = async () => {
        if (deleteDialog.keyId === null) return;

        const keyToRemove = deleteDialog.keyType === "bot" 
            ? aiKeys.find((key) => key.id === deleteDialog.keyId)
            : embeddingKeys.find((key) => key.id === deleteDialog.keyId);

        if (keyToRemove?.keyId) {
            try {
                await deleteKey(keyToRemove.keyId);
                success("Key đã được xóa thành công!");
            } catch (err) {
                showError(
                    "Lỗi khi xóa key: " +
                    (err instanceof Error ? err.message : "Unknown error")
                );
                setDeleteDialog({ isOpen: false, keyId: null, keyName: "", keyType: "bot" });
                return;
            }
        }

        if (deleteDialog.keyType === "bot") {
            setAiKeys((currentKeys) =>
                currentKeys.filter((key) => key.id !== deleteDialog.keyId)
            );
        } else {
            setEmbeddingKeys((currentKeys) =>
                currentKeys.filter((key) => key.id !== deleteDialog.keyId)
            );
        }
        
        setDeleteDialog({ isOpen: false, keyId: null, keyName: "", keyType: "bot" });
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

                <Tabs defaultValue="configKey" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 h-auto">
                        <TabsTrigger
                            value="configKey"
                            className="text-xs sm:text-sm px-2 py-2"
                        >
                            Cấu hình Key
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
                    <TabsContent value="configKey">
                        <Card>
                            <CardHeader>
                                <CardTitle>Cấu hình API Keys</CardTitle>
                                <CardDescription>
                                    Cấu hình model và API keys cho Bot và Embedding
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-8">
                                {/* Phần Chọn Model cho Bot */}
                                <div className="grid gap-4 p-4 border rounded-lg bg-gray-50">
                                    <div className="grid gap-3">
                                        <Label className="text-base font-semibold">Chọn Model cho Bot trả lời</Label>
                                        <RadioGroupSetting
                                            value={selectedBotModel}
                                            onValueChange={setSelectedBotModel}
                                            options={getModelOptions()}
                                        />
                                    </div>

                                    <div className="grid gap-4">
                                        <Label>API Keys cho Bot</Label>
                                        {showAiKeySection && (
                                            <div className="grid gap-4">
                                                {aiKeys.map((keyItem) => (
                                                    <KeyItem
                                                        key={keyItem.id}
                                                        keyItem={keyItem}
                                                        onDelete={handleDeleteKeyClick}
                                                        canDelete={aiKeys.length > 1}
                                                        loading={loading}
                                                    />
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

                                        <Button onClick={handleUpdateBotModel} disabled={loadingBotModel} className="w-full sm:w-fit">
                                            {loadingBotModel ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Đang cập nhật Bot Model...
                                                </>
                                            ) : (
                                                "Cập nhật Bot Model"
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Phần Chọn Model cho Embedding */}
                                <div className="grid gap-4 p-4 border rounded-lg bg-gray-50">
                                    <div className="grid gap-3">
                                        <Label className="text-base font-semibold">Chọn Model cho Embedding</Label>
                                        <RadioGroupSetting
                                            value={selectedEmbeddingModel}
                                            onValueChange={setSelectedEmbeddingModel}
                                            options={getModelOptions()}
                                        />
                                    </div>

                                    <div className="grid gap-4">
                                        <Label>API Keys cho Embedding</Label>
                                        {showEmbeddingKeySection && (
                                            <div className="grid gap-4">
                                                {embeddingKeys.map((keyItem) => (
                                                    <KeyItem
                                                        key={keyItem.id}
                                                        keyItem={keyItem}
                                                        onDelete={handleDeleteEmbeddingKeyClick}
                                                        canDelete={embeddingKeys.length > 1}
                                                        loading={loading}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        <Button
                                            variant="outline"
                                            onClick={addEmbeddingKeyInput}
                                            className="w-full sm:w-fit"
                                        >
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            {embeddingKeys.length === 0 ? "Thêm key" : "Thêm key khác"}
                                        </Button>

                                        <Button onClick={handleUpdateEmbeddingModel} disabled={loadingEmbeddingModel} className="w-full sm:w-fit">
                                            {loadingEmbeddingModel ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Đang cập nhật Embedding Model...
                                                </>
                                            ) : (
                                                "Cập nhật Embedding Model"
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
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

            {/* Dialog thêm key mới */}
            <Dialog
                open={addKeyDialog.isOpen}
                onOpenChange={(open) =>
                    setAddKeyDialog({ isOpen: open, keyType: "bot", keys: [{ id: 0, name: "", value: "" }] })
                }
            >
                <DialogContent className="max-w-sm sm:max-w-md max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Thêm {addKeyDialog.keyType === "bot" ? "Bot" : "Embedding"} Key mới
                        </DialogTitle>
                        <DialogDescription className="text-sm">
                            Nhập thông tin cho key mới của {addKeyDialog.keyType === "bot" ? "Bot" : "Embedding"} model
                        </DialogDescription>
                    </DialogHeader>
                    <AddKeyForm
                        keys={addKeyDialog.keys}
                        onKeyChange={handleAddKeyDialogChange}
                        onAddMore={handleAddMoreKeyInDialog}
                        onRemove={handleRemoveKeyFromDialog}
                    />
                    <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() =>
                                setAddKeyDialog({ isOpen: false, keyType: "bot", keys: [{ id: 0, name: "", value: "" }] })
                            }
                            disabled={loading}
                            className="w-full sm:w-auto"
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={handleSaveNewKey}
                            disabled={loading}
                            className="w-full sm:w-auto"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                "Lưu"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog xác nhận xóa key */}
            <Dialog
                open={deleteDialog.isOpen}
                onOpenChange={(open) =>
                    setDeleteDialog({ isOpen: open, keyId: null, keyName: "", keyType: "bot" })
                }
            >
                <DialogContent className="max-w-sm sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa key</DialogTitle>
                        <DialogDescription className="text-sm">
                            Bạn có chắc chắn muốn xóa <strong>{deleteDialog.keyName}</strong>? Hành động
                            này không thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() =>
                                setDeleteDialog({ isOpen: false, keyId: null, keyName: "", keyType: "bot" })
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
