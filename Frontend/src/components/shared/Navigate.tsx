import { Navbar01 } from "@/components/ui/shadcn-io/navbar-01";
import { useAuth } from "../context/AuthContext";

const Navigate = () => {
  const { user } = useAuth();
  let greeting = "Xin chào";
  if (user && user.full_name) {
    greeting = `Xin chào, ${user.full_name}`;
  }
  return (
    <div className="relative w-full hidden lg:block">
      <Navbar01 signInText={greeting} ctaText={user?.role} />
    </div>
  );
};

export default Navigate;
