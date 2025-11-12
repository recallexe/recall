import Project from "@/components/projects/Project";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

/**
 * Projects page component that displays the kanban board with project cards
 * organized by status (Inbox, Planned, Progress, Done).
 */
export default function Page() {
  return (
    <div className="mx-4 mb-4">
      <div>
        <Breadcrumb>
          <BreadcrumbList className="text-2xl">
            <BreadcrumbItem>
              <BreadcrumbPage>
                <BreadcrumbLink href="/dashboard/projects">
                  Projects
                </BreadcrumbLink>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Project />
    </div>
  );
}
