import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useTelegramBots } from "@/hooks/useTelegramBots";
import type { TelegramBot } from "@/types/telegram";
import { useEffect } from "react";

// Schema validation
const formSchema = z.object({
  bot_name: z.string().min(1, "Tên Bot là bắt buộc"),
  bot_token: z.string().min(1, "Bot Token là bắt buộc"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TelegramBotFormProps {
  onFinished: () => void;
  editData?: TelegramBot | null;
}

export function TelegramBotForm({
  onFinished,
  editData,
}: TelegramBotFormProps) {
  const { createBot, isCreatingBot, updateBot, isUpdatingBot } =
    useTelegramBots();

  const isLoading = isCreatingBot || isUpdatingBot;
  const isEditMode = !!editData;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bot_name: editData?.bot_name || "",
      bot_token: editData?.bot_token || "",
      description: editData?.description || "",
    },
  });

  useEffect(() => {
    if (editData) {
      form.reset({
        bot_name: editData.bot_name,
        bot_token: editData.bot_token,
        description: editData.description || "",
      });
    }
  }, [editData, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditMode && editData) {
        await updateBot({
          id: editData.id,
          data: {
            bot_name: values.bot_name,
            bot_token: values.bot_token,
            description: values.description || undefined,
          },
        });
      } else {
        await createBot({
          bot_name: values.bot_name,
          bot_token: values.bot_token,
          description: values.description || undefined,
        });
      }

      form.reset();
      onFinished();
    } catch (error) {
      console.error("Submission failed", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Bot Name - Required */}
        <FormField
          control={form.control}
          name="bot_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Tên Bot <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Nhập tên Telegram Bot..."
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Bot Token - Required */}
        <FormField
          control={form.control}
          name="bot_token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Bot Token <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Nhập Telegram Bot Token..."
                  className="min-h-[100px] resize-none font-mono text-xs"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription className="text-xs">
                Bot Token từ @BotFather (bắt buộc)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description - Optional */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Mô tả về Telegram Bot..."
                  className="min-h-[80px] resize-none"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Đang xử lý..." : isEditMode ? "Cập nhật Bot" : "Thêm Bot"}
        </Button>
      </form>
    </Form>
  );
}
