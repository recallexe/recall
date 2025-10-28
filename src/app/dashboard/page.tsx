import Stat from "@/components/dashboard/Stat";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Box, Calendar, CheckSquare, Clipboard, Folder, FolderOpen } from "lucide-react";
export default function Dashboard() {
  return (
    <>
      {/* BREADCRUMB */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {/* CONTAINER */}
      <div className="mt-4 flex flex-col gap-4">
        {/* Frist Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="bg-primary-foreground p-4 rounded-lg border-2 hover:shadow-md transition">
            <Stat
              title="Active Areas"
              value={5}
              change="+1 this week"
              icon={<Folder size={17}/>}
            />
          </div>
          
          <div className="bg-primary-foreground p-4 rounded-lg border-2">
            Card
          </div>
        </div>
        {/* Second and third row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-primary-foreground p-4 rounded-lg border-2">
            Card
          </div>
          <div className="bg-primary-foreground p-4 rounded-lg border-2">
            Card
          </div>
          <div className="bg-primary-foreground p-4 rounded-lg border-2">
            Card
          </div>
          <div className="bg-primary-foreground p-4 rounded-lg border-2">
            Card
          </div>
        </div>
      </div>
    </>
  );
}
