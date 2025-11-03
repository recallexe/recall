// ============================================================================
// IMPORTS
// ============================================================================
import Project from "@/components/projects/Project";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// ============================================================================
// PROJECTS PAGE
// ============================================================================
/**
 * Projects page component that displays the kanban board with project cards
 * organized by status (Inbox, Planned, Progress, Done).
 */
export default function Page() {
  return (
    <div className="mx-4 mb-4">
      {/* ==================================================================== */}
      {/* BREADCRUMB NAVIGATION */}
      {/* ==================================================================== */}
      <div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
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

      {/* ==================================================================== */}
      {/* PROJECT KANBAN BOARD */}
      {/* ==================================================================== */}
      <Project />
    </div>
  );
}
