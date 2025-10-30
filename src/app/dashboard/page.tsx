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
import TodayOverviewList from "@/components/dashboard/TodaysOverview";
import RecentUpcoming from "@/components/dashboard/RecentUpcoming";
import { Chart } from "@/components/dashboard/AppChart";
import TodaysSchedule from "@/components/dashboard/Today'sSchedule";
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
      <main className="mb-4">
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
                <CardContent className="space-y-2 h-75 overflow-y-auto scrollbar-thin">
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
              {/* Third Row */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Performance</CardTitle>
                </CardHeader>
                <CardContent className="h-75">
                  <Chart />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Today's Schedule</CardTitle>
                  <CardDescription>Thursday, Septermber 18</CardDescription>
                </CardHeader>
                <CardContent className="h-75 overflow-y-auto scrollbar-thin">
                  <TodaysSchedule />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
