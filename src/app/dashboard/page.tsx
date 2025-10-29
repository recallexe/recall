import Stat from "@/components/dashboard/Stat";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { stats, TodayOverview } from "@/app/lib/data";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import TodayOverviewList from "@/components/dashboard/TodaysOverviewList";
import RecentUpcoming from "@/components/dashboard/RecentUpcoming";
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
              <Stat
                title={stats.areas.title}
                value={stats.areas.value}
                change={stats.areas.change}
                icon={stats.areas.icon}
                url={stats.areas.url}
                bgcolor={stats.areas.bgcolor}
              />
              <Stat
                title={stats.projects.title}
                value={stats.projects.value}
                change={stats.projects.change}
                icon={stats.projects.icon}
                url={stats.projects.url}
                bgcolor={stats.projects.bgcolor}
              />
              <Stat
                title={stats.tasks.title}
                value={stats.tasks.value}
                change={stats.tasks.change}
                icon={stats.tasks.icon}
                url={stats.tasks.url}
                bgcolor={stats.tasks.bgcolor}
              />
              <Stat
                title={stats.events.title}
                value={stats.events.value}
                change={stats.events.change}
                icon={stats.events.icon}
                url={stats.events.url}
                bgcolor={stats.events.bgcolor}
              />

              <Stat
                title={stats.notes.title}
                value={stats.notes.value}
                change={stats.notes.change}
                icon={stats.notes.icon}
                url={stats.notes.url}
                bgcolor={stats.notes.bgcolor}
              />

              <Stat
                title={stats.resources.title}
                value={stats.resources.value}
                change={stats.resources.change}
                icon={stats.resources.icon}
                url={stats.resources.url}
                bgcolor={stats.resources.bgcolor}
              />
            </div>
            {/* Second and third row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Today's Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <TodayOverviewList
                    icon={TodayOverview[0].icon}
                    message={TodayOverview[0].message}
                    area={TodayOverview[0].area}
                    type={TodayOverview[0].type}
                    deadline={TodayOverview[0].deadline}
                    priorty={TodayOverview[0].priorty}
                    url={TodayOverview[0].url}
                  />
                  <TodayOverviewList
                    icon={TodayOverview[1].icon}
                    message={TodayOverview[1].message}
                    area={TodayOverview[1].area}
                    type={TodayOverview[1].type}
                    deadline={TodayOverview[1].deadline}
                    priorty={TodayOverview[1].priorty}
                    url={TodayOverview[1].url}
                  />
                  <TodayOverviewList
                    icon={TodayOverview[2].icon}
                    message={TodayOverview[2].message}
                    area={TodayOverview[2].area}
                    type={TodayOverview[2].type}
                    deadline={TodayOverview[2].deadline}
                    priorty={TodayOverview[2].priorty}
                    url={TodayOverview[2].url}
                  />
                  <TodayOverviewList
                    icon={TodayOverview[3].icon}
                    message={TodayOverview[3].message}
                    area={TodayOverview[3].area}
                    type={TodayOverview[3].type}
                    deadline={TodayOverview[3].deadline}
                    priorty={TodayOverview[3].priorty}
                    url={TodayOverview[3].url}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Recent/Upcomming</CardTitle>
                </CardHeader>
                <CardContent>
                  <RecentUpcoming />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
