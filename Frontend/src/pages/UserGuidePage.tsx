import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  MessageCircle,
  Settings,
  Users,
  BookOpen,
  Phone,
  Mail,
} from "lucide-react";

// Mock data cho FAQ
const faqs = [
  {
    id: "item-1",
    question: "Làm thế nào để sử dụng chatbot hỗ trợ?",
    answer:
      "Bạn chỉ cần truy cập vào trang chủ, nhấn vào nút 'Bắt đầu Chat' hoặc chọn tab 'Chat Hỗ trợ'. Sau đó nhập câu hỏi của bạn và chatbot sẽ tự động trả lời trong vài giây.",
    category: "Sử dụng cơ bản",
  },
  {
    id: "item-2",
    question: "Chatbot có thể hỗ trợ những gì?",
    answer:
      "Chatbot có thể hỗ trợ tra cứu thông tin về các thủ tục hành chính, hướng dẫn làm giấy tờ, giải đáp thắc mắc về dịch vụ công, và kết nối với cán bộ hỗ trợ khi cần thiết.",
    category: "Tính năng",
  },
  {
    id: "item-3",
    question: "Chatbot không hiểu câu hỏi của tôi, phải làm sao?",
    answer:
      "Hãy thử diễn đạt câu hỏi một cách rõ ràng hơn hoặc sử dụng từ khóa liên quan đến thủ tục bạn cần tìm hiểu. Nếu vẫn không được, bạn có thể yêu cầu kết nối với cán bộ hỗ trợ.",
    category: "Khắc phục sự cố",
  },
  {
    id: "item-4",
    question: "Tôi có thể liên hệ trực tiếp với cán bộ không?",
    answer:
      "Có, khi chatbot không thể giải quyết được vấn đề của bạn, hệ thống sẽ tự động chuyển sang chế độ hỗ trợ trực tiếp với cán bộ có chuyên môn phù hợp.",
    category: "Hỗ trợ",
  },
  {
    id: "item-5",
    question: "Thông tin cá nhân của tôi có được bảo mật không?",
    answer:
      "Tất cả thông tin cá nhân và nội dung chat được mã hóa và bảo mật theo tiêu chuẩn cao nhất. Dữ liệu chỉ được sử dụng để cải thiện chất lượng dịch vụ hỗ trợ.",
    category: "Bảo mật",
  },
];

const categories = [
  "Tất cả",
  "Sử dụng cơ bản",
  "Tính năng",
  "Khắc phục sự cố",
  "Hỗ trợ",
  "Bảo mật",
];

export default function UserGuidePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Hướng dẫn sử dụng</h1>
              <p className="text-muted-foreground">
                Tìm hiểu cách sử dụng hệ thống chatbot một cách hiệu quả
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Danh mục
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category, index) => (
                  <Button
                    key={index}
                    variant={index === 0 ? "secondary" : "ghost"}
                    className="w-full justify-start text-sm"
                    size="sm"
                  >
                    {category}
                    {index === 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        5
                      </Badge>
                    )}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Liên hệ nhanh */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Cần hỗ trợ thêm?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Hotline: 1900-1234
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email hỗ trợ
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat trực tiếp
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Thông báo quan trọng */}
            <Alert className="border-amber-200 bg-amber-50 text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Lưu ý quan trọng!</AlertTitle>
              <AlertDescription>
                Để được hỗ trợ tốt nhất, hãy mô tả vấn đề của bạn một cách chi
                tiết và rõ ràng. Chatbot sẽ hiểu và hỗ trợ bạn chính xác hơn.
              </AlertDescription>
            </Alert>

            {/* Hướng dẫn nhanh */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto text-primary mb-2" />
                  <CardTitle className="text-lg">Bắt đầu Chat</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground text-sm mb-4">
                    Nhấn vào nút "Bắt đầu Chat" trên trang chủ để bắt đầu cuộc
                    hội thoại
                  </p>
                  <Button size="sm" className="w-full">
                    Thử ngay
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <Settings className="h-12 w-12 mx-auto text-primary mb-2" />
                  <CardTitle className="text-lg">Tùy chỉnh</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground text-sm mb-4">
                    Điều chỉnh cài đặt để có trải nghiệm phù hợp với nhu cầu của
                    bạn
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Cài đặt
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <Users className="h-12 w-12 mx-auto text-primary mb-2" />
                  <CardTitle className="text-lg">Hỗ trợ trực tiếp</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground text-sm mb-4">
                    Kết nối với cán bộ hỗ trợ khi cần giải quyết vấn đề phức tạp
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Liên hệ
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* FAQ Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Câu hỏi thường gặp</CardTitle>
                <p className="text-muted-foreground">
                  Tìm câu trả lời cho những thắc mắc phổ biến khi sử dụng hệ
                  thống
                </p>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq) => (
                    <AccordionItem
                      value={faq.id}
                      key={faq.id}
                      className="border-b"
                    >
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="text-xs">
                            {faq.category}
                          </Badge>
                          <span className="font-medium">{faq.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pt-2 pb-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Footer links */}
            <Card>
              <CardHeader>
                <CardTitle>Liên kết hữu ích</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="justify-start h-auto p-4"
                  >
                    <div className="text-left">
                      <div className="font-medium">Cổng dịch vụ công</div>
                      <div className="text-sm text-muted-foreground">
                        Truy cập các dịch vụ hành chính online
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start h-auto p-4"
                  >
                    <div className="text-left">
                      <div className="font-medium">Tra cứu thủ tục</div>
                      <div className="text-sm text-muted-foreground">
                        Tìm hiểu chi tiết về các thủ tục hành chính
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start h-auto p-4"
                  >
                    <div className="text-left">
                      <div className="font-medium">Phản hồi dịch vụ</div>
                      <div className="text-sm text-muted-foreground">
                        Góp ý để cải thiện chất lượng phục vụ
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start h-auto p-4"
                  >
                    <div className="text-left">
                      <div className="font-medium">Tin tức - Thông báo</div>
                      <div className="text-sm text-muted-foreground">
                        Cập nhật thông tin mới nhất từ cơ quan
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
