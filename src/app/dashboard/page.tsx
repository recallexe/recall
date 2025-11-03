// ============================================================================
// IMPORTS
// ============================================================================
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

// ============================================================================
// DASHBOARD PAGE
// ============================================================================
/**
 * Main dashboard page component that displays:
 * - Statistics cards (Areas, Projects, Tasks, Events, Notes, Resources)
 * - Today's Overview list
 * - Recent/Upcoming items
 * - Weekly Performance chart
 * - Today's Schedule
 */
export default function Dashboard() {
  return (
    <>
      {/* ==================================================================== */}
      {/* MAIN CONTAINER */}
      {/* ==================================================================== */}
      <main className="mx-4 mb-4">
        {/* ================================================================ */}
        {/* BREADCRUMB NAVIGATION */}
        {/* ================================================================ */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* ================================================================ */}
        {/* DASHBOARD CONTENT */}
        {/* ================================================================ */}
        <section>
          <div className="mt-4 flex flex-col gap-4">
            {/* ============================================================ */}
            {/* FIRST ROW: STATISTICS CARDS */}
            {/* ============================================================ */}
            {/* Grid of stat cards showing counts for Areas, Projects, Tasks, etc. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              {Object.values(stats).map((item, index) => (
                <Stat
                  key={index}
                  title={item.title}
                  value={item.value}
                  change={item.change}
                  icon={item.icon}
                  url={item.url}
                />
              ))}
            </div>

            {/* ============================================================ */}
            {/* SECOND ROW: CONTENT CARDS */}
            {/* ============================================================ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Today's Overview Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Today's Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 h-75 overflow-y-auto scrollbar-thin">
                  {/* Today's Overview Items List */}
                  {TodayOverview.map((item, index) => (
                    <TodayOverviewList
                      key={index}
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

              {/* Recent/Upcoming Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent/Upcomming</CardTitle>
                </CardHeader>
                <CardContent>
                  <RecentUpcoming />
                </CardContent>
              </Card>

              {/* ========================================================== */}
              {/* THIRD ROW: PERFORMANCE & SCHEDULE */}
              {/* ========================================================== */}
              {/* Weekly Performance Chart Card */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Weekly Performance</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-end min-h-[200px] pb-0">
                  <Chart />
                </CardContent>
              </Card>

              {/* Today's Schedule Card */}
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
