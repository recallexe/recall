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
              {Object.values(stats).map((item, index) => (
                <Stat
                  key={index}
                  title={item.title}
                  value={item.value}
                  change={item.change}
                  icon={item.icon}
                  url={item.url}
                  bgcolor={item.bgcolor}
                />
              ))}
            </div>
            {/* Second Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Today's Overview</CardTitle>
                </CardHeader>
                <CardContent className="h-64 overflow-y-auto scrollbar-thin">
                  {TodayOverview.map((item, index) => (
                    <TodayOverviewList
                      key={index}
                      icon={item.icon}
                      message={item.message}
                      area={item.area}
                      type={item.type}
                      deadline={item.deadline}
                      priorty={item.priorty}
                      url={item.url}
                    />
                  ))}
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
