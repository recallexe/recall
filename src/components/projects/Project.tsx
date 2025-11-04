// ============================================================================
// IMPORTS
// ============================================================================
import { projects } from "@/app/lib/data";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowRight, Box, Folder, MoreHorizontal, Plus } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { NewProjectDialog } from "./NewProjectDialog";
import EditProjectDropdown from "./EditProjectDropdown";

// ============================================================================
// PROJECT COMPONENT
// ============================================================================
/**
 * Project component renders a horizontal scrollable kanban board with project cards
 * organized by status (Inbox, Planned, Progress, Done).
 */
export default function Project() {
  return (
    <>
      {/* ==================================================================== */}
      {/* HORIZONTAL SCROLLABLE GRID CONTAINER */}
      {/* ==================================================================== */}
      {/* Creates a horizontal scrolling grid with fixed-width columns (340px) */}
      <div className="grid grid-flow-col auto-cols-[340px] h-[calc(100vh-100px)] gap-4 overflow-x-auto mt-4">
        {/* ================================================================ */}
        {/* STATUS COLUMNS LOOP */}
        {/* ================================================================ */}
        {/* Iterates over each project status to create a column */}
        {Object.entries(projects).map(([status, list]) => (
          <div key={status}>
            {/* ============================================================ */}
            {/* STATUS HEADER */}
            {/* ============================================================ */}
            {/* Sticky header with status badge, project count, and add button */}
            <div className="flex flex-row items-center font-semibold gap-4 sticky top-0 z-50">
              {/* Status Badge */}
              <div
                className={cn(
                  "rounded-xs py-0 px-3 w-fit",
                  status === "Inbox" && "bg-red-200 text-red-900",
                  status === "Planned" && "bg-blue-200 text-blue-900",
                  status === "Progress" && "bg-yellow-200 text-yellow-900",
                  status === "Done" && "bg-green-200 text-green-900"
                )}
              >
                <h2>{status === "Progress" ? "In progress" : status}</h2>
              </div>
              {/* Project Count */}
              <div>{list.length}</div>
              {/* Add Project Button (Quick) */}
              <NewProjectDialog
                triger={
                  <Button variant="ghost" size="icon">
                    <Plus size={22} />
                  </Button>
                }
              />
            </div>

            {/* ============================================================ */}
            {/* PROJECT CARDS CONTAINER */}
            {/* ============================================================ */}
            <div className="flex flex-col gap-4 mt-2">
              {/* ========================================================== */}
              {/* PROJECT CARDS LOOP */}
              {/* ========================================================== */}
              {/* Renders individual project cards */}
              {list.map((project) => (
                <Card
                  key={project.id}
                  className="p-4 space-y-1 hover:shadow-md transition"
                >
                  {/* Project Header: Folder Icon + Title */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold">
                      <Box color="var(--primary)" size={20} strokeWidth={2.5} />
                      <Link href="/dashboard/projects">
                        <h3>{project.title}</h3>
                      </Link>
                    </div>
                    <EditProjectDropdown
                      triger={
                        <Button size="icon" variant="ghost">
                          <MoreHorizontal />
                        </Button>
                      }
                    />
                  </div>

                  {/* Project Description */}
                  <p className="text-muted-foreground">{project.description}</p>
                  {/* Project Areas */}
                  <div className="flex items-center gap-2">
                    <Folder size={17} />
                    {project.area}
                  </div>

                  {/* Project Footer: Date Range + Priority Badge */}
                  <div className="flex items-center flex-row justify-between">
                    {/* Date Range (Start → End) */}
                    <div className="flex text-muted-foreground items-center gap-2 text-sm">
                      <p>{project.startDate}</p>
                      <ArrowRight size={15} />
                      <p>{project.endDate}</p>
                    </div>

                    {/* Priority Badge */}
                    <div>
                      {project.priority === "High" && (
                        <div className="bg-red-300 px-3 rounded-full text-red-800 text-sm">
                          {project.priority}
                        </div>
                      )}
                      {project.priority === "Medium" && (
                        <div className="bg-yellow-200 px-3 rounded-full text-yellow-800 text-sm">
                          {project.priority}
                        </div>
                      )}
                      {project.priority === "Low" && (
                        <div className="bg-green-200 px-3 rounded-full text-green-800 text-sm">
                          {project.priority}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {/* ========================================================== */}
              {/* ADD NEW PROJECT DIALOG (Bottom of Column) */}
              {/* ========================================================== */}
              <NewProjectDialog
                triger={
                  <Button
                    variant="outline"
                    className="flex w-full flex-row items-center p-4"
                  >
                    <Plus className="mr-2" />
                    New Project
                  </Button>
                }
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
