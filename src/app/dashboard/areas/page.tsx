import AddNewCard from "@/components/area/AddNewCard";
import AreaCard from "@/components/area/AreaCard";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
export default function Areas() {
  return (
    <>
      <Breadcrumb>
        <BreadcrumbList className="text-2xl">
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              <BreadcrumbLink href="/dashboard/areas">Areas</BreadcrumbLink>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <AreaCard
          title="Personal"
          image="/personal.png"
          href="/dashboard/areas/personal"
        />
        <AreaCard
          title="Work"
          image="/work.png"
          href="/dashboard/areas/personal"
        />
        <AreaCard
          title="Side Projects"
          image="/project.png"
          href="/dashboard/areas/personal"
        />
        <AreaCard
          title="Health"
          image="/health.png"
          href="/dashboard/areas/personal"
        />
        <AreaCard
          title="Finance"
          image="/finance.png"
          href="/dashboard/areas/personal"
        />
        <AreaCard
          title="School"
          image="/school.png"
          href="/dashboard/areas/personal"
        />
        <AddNewCard></AddNewCard>
      </div>
    </>
  );
}
