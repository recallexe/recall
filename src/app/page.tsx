import { Button } from "@/components/ui/button";
import Link from "next/link";


export default function Home() {
  return (
    <>
      <h1 className="flex justify-center h-full mt-90 text-5xl">
        Welcome to Recall
      </h1>
      <div className="flex justify-center mt-15">
        <Button variant="outline">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>

      </div>
    </>
  );
}