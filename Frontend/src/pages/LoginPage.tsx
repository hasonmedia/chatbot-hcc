import { Bot, Shield, Users, Globe } from "lucide-react";
import { LoginForm } from "@/components/ui/login-form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-4 sm:p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
              <Bot className="size-5" />
            </div>
            <span className="text-lg sm:text-xl font-bold">Chatbot HCC</span>
          </a>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md space-y-4 sm:space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Đăng nhập hệ thống
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Đăng nhập để quản lý chatbot và hỗ trợ người dân
              </p>
            </div>

            <LoginForm />

            <div className="text-center space-y-3 sm:space-y-4">
              <div className="text-xs sm:text-sm text-muted-foreground">
                Liên hệ hỗ trợ:{" "}
                <span className="font-medium">admin@hcc.gov.vn</span>
              </div>

              <div className="flex justify-center">
                <Badge variant="secondary" className="text-xs">
                  Phiên bản 2.0.1
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-primary relative hidden lg:block">
        <div className="absolute inset-0 bg-linear-to-br from-primary to-primary/80">
          <div className="flex h-full items-center justify-center p-8 xl:p-12">
            <div className="text-center text-primary-foreground space-y-6 xl:space-y-8">
              <div className="space-y-3 xl:space-y-4">
                <h2 className="text-3xl xl:text-4xl font-bold tracking-tight">
                  Hệ thống Chatbot HCC
                </h2>
                <p className="text-lg xl:text-xl text-primary-foreground/90 max-w-md mx-auto">
                  Nền tảng hỗ trợ dịch vụ công thông minh, phục vụ người dân
                  24/7
                </p>
              </div>

              <div className="grid gap-3 xl:gap-4 mt-8 xl:mt-12 max-w-sm mx-auto">
                <Card className="bg-primary-foreground/10 border-primary-foreground/20">
                  <CardContent className="flex items-center gap-3 p-3 xl:p-4">
                    <Shield className="h-5 w-5 xl:h-6 xl:w-6 text-primary-foreground shrink-0" />
                    <div className="text-left">
                      <div className="font-semibold text-primary-foreground text-sm xl:text-base">
                        Bảo mật cao
                      </div>
                      <div className="text-xs xl:text-sm text-primary-foreground/80">
                        Đảm bảo an toàn thông tin
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-primary-foreground/10 border-primary-foreground/20">
                  <CardContent className="flex items-center gap-3 p-3 xl:p-4">
                    <Users className="h-5 w-5 xl:h-6 xl:w-6 text-primary-foreground shrink-0" />
                    <div className="text-left">
                      <div className="font-semibold text-primary-foreground text-sm xl:text-base">
                        Đa kênh
                      </div>
                      <div className="text-xs xl:text-sm text-primary-foreground/80">
                        Hỗ trợ nhiều nền tảng
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-primary-foreground/10 border-primary-foreground/20">
                  <CardContent className="flex items-center gap-3 p-3 xl:p-4">
                    <Globe className="h-5 w-5 xl:h-6 xl:w-6 text-primary-foreground shrink-0" />
                    <div className="text-left">
                      <div className="font-semibold text-primary-foreground text-sm xl:text-base">
                        24/7
                      </div>
                      <div className="text-xs xl:text-sm text-primary-foreground/80">
                        Hoạt động liên tục
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="text-xs xl:text-sm text-primary-foreground/70 mt-6 xl:mt-8">
                © 2024 Ủy ban nhân dân thành phố. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
