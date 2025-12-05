import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const FB_APP_ID = "864035886072571";
// const Url = `https://ardis-nondistracting-cogitatively.ngrok-free.dev`;
const Url = `https://ardis-nondistracting-cogitatively.ngrok-free.dev`;
const REDIRECT_URI = `${Url}/facebook-pages/callback`;

const FB_SCOPE =
  "pages_show_list,pages_manage_metadata,pages_read_engagement,pages_messaging,email";

export default function LoginWithFb() {
  const handleLogin = () => {
    const fbLoginUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${FB_APP_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&scope=${FB_SCOPE}&response_type=code`;

    window.location.href = fbLoginUrl;
  };

  return (
    <Button
      variant="outline"
      className="h-auto py-6 flex flex-col items-center gap-2 w-full"
      onClick={handleLogin}
    >
      <Link2 className="h-6 w-6" />
      <span className="font-semibold">Kết nối nhanh với Facebook</span>
      <span className="text-xs text-muted-foreground">
        Đăng nhập Facebook để tự động lấy thông tin
      </span>
    </Button>
  );
}
