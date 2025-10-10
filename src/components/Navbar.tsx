import { Moon } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="p-4 flex items-center justify-between">
        {/* LEFT */}
        Collapse Button
        {/* RIGHT */}
        <div className="flex items-center gap-4">
            <Link href="/">Dashboard</Link>
            <Moon />
        </div>
    </nav>
  )

}
