import Stat from "@/components/dashboard/Stat";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {stats} from "@/app/lib/data"
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
      <main>
        <section>
          <div className="mt-4 flex flex-col gap-4">
            {/* Frist Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="bg-area-card p-4 rounded-lg border-2 hover:shadow-md transition">
                <Stat
                  title={stats.areas.title}
                  value={stats.areas.value}
                  change={stats.areas.change}
                  icon={stats.areas.icon}
                  url={stats.areas.url}
                />
              </div>
              <div className="bg-project-card p-4 rounded-lg border-2 hover:shadow-md transition">
                <Stat
                  title={stats.projects.title}
                  value={stats.projects.value}
                  change={stats.projects.change}
                  icon={stats.projects.icon}
                  url={stats.projects.url}
                />
              </div>
              <div className="bg-task-card p-4 rounded-lg border-2 hover:shadow-md transition">
                <Stat
                  title={stats.tasks.title}
                  value={stats.tasks.value}
                  change={stats.tasks.change}
                  icon={stats.tasks.icon}
                  url={stats.tasks.url}
                />
              </div>
              <div className="bg-event-card p-4 rounded-lg border-2 hover:shadow-md transition">
                <Stat
                  title={stats.events.title}
                  value={stats.events.value}
                  change={stats.events.change}
                  icon={stats.events.icon}
                  url={stats.events.url}
                />
              </div>
              <div className="bg-note-card p-4 rounded-lg border-2 hover:shadow-md transition">
                <Stat
                  title={stats.notes.title}
                  value={stats.notes.value}
                  change={stats.notes.change}
                  icon={stats.notes.icon}
                  url={stats.notes.url}
                />
              </div>
              <div className="bg-resource-card p-4 rounded-lg border-2 hover:shadow-md transition">
                <Stat
                  title={stats.resources.title}
                  value={stats.resources.value}
                  change={stats.resources.change}
                  icon={stats.resources.icon}
                  url={stats.resources.url}
                />
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
        </section>
      </main>
    </>
  );
}
