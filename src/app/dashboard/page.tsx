import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <div className="bg-primary-foreground p-4 rounded-lg shadow-sm">
            1.1
          </div>
          <div className="bg-primary-foreground p-4 rounded-lg shadow-sm">
            1.2
          </div>
          <div className="bg-primary-foreground p-4 rounded-lg shadow-sm">
            1.3
          </div>
          <div className="bg-primary-foreground p-4 rounded-lg shadow-sm">
            1.4
          </div>
          <div className="bg-primary-foreground p-4 rounded-lg shadow-sm">
            1.5
          </div>
        </div>
        {/* Second and third row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-primary-foreground p-4 rounded-lg shadow-sm">
            1.4
          </div>
          <div className="bg-primary-foreground p-4 rounded-lg shadow-sm">
            1.5
          </div>
          <div className="bg-primary-foreground p-4 rounded-lg shadow-sm">
            1.4
          </div>
          <div className="bg-primary-foreground p-4 rounded-lg shadow-sm">
            1.5
          </div>
        </div>
      </div>
    </>
  );
}
