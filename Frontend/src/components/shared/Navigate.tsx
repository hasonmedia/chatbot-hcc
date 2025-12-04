import { Navbar01 } from "@/components/ui/shadcn-io/navbar-01";
import { useAuth } from "../context/AuthContext";

const Navigate = () => {
  const { user } = useAuth();
  let greeting = "Xin chào";
  if (user && user.full_name) {
    greeting = `Xin chào, ${user.full_name}`;
  }

  // Responsive greeting - shorter on mobile
  const mobileGreeting = user?.full_name
    ? `Xin chào, ${user.full_name.split(" ").pop()}`
    : "Xin chào";

  return (
    <div className="relative w-full">
      {/* Desktop navigation - full greeting */}
      <div className="hidden lg:block">
        <Navbar01 signInText={greeting} ctaText={user?.role} />
      </div>

      {/* Mobile/Tablet navigation - shorter greeting */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-2 bg-background border-b">
          <span className="text-sm font-medium truncate flex-1">
            {mobileGreeting}
          </span>
          {user?.role && (
            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md ml-2 shrink-0">
              {user.role}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navigate;
