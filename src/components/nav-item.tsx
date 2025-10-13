import { Button } from "./ui/button";

export default function NavItem({ icon }: { icon: React.ReactNode }) {
  return <Button variant="outline" size="icon">
    {icon}
  </Button>;
}
