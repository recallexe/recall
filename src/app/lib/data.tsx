import {
  Archive,
  Box,
  Calendar,
  CheckSquare,
  Clipboard,
  Database,
  Folder,
  LayoutDashboard,
  CalendarDays,
} from "lucide-react";


export const menu = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
  { title: "Areas", icon: Folder, url: "/dashboard/areas", key: "areas" },
  { title: "Projects", icon: Box, url: "/dashboard/projects", key: "projects" },
  { title: "Tasks", icon: CheckSquare, url: "/dashboard/tasks", key: "tasks" },
  { title: "Notes", icon: Clipboard, url: "/dashboard/notes", key: "notes" },
  { title: "Events", icon: Calendar, url: "/dashboard/events", key: "events" },
  {
    title: "Resources",
    icon: Database,
    url: "/dashboard/resources",
    key: "resources",
  },
  { title: "Calendar", icon: CalendarDays, url: "/dashboard/calendar" },
  { title: "Archive", icon: Archive, url: "/dashboard/archive" },
];

export const sample = {
  areas: ["Personal", "Work", "Learning"],
  projects: ["Recall Redesign", "Thesis", "Open Source"],
  tasks: ["Inbox Zero", "Plan Sprint", "Buy Groceries"],
  notes: ["Meeting notes", "Ideas", "Reading summary"],
  events: ["Doctor", "Team sync", "Conference"],
  resources: ["Articles", "Books", "Databases"],
};

export const user = {
  name: "Ehsanullah Dehzad",
  email: "m@example.com",
  avatar: "/profile-pic.jpg",
};

export const stats = {
  areas: {
    title: "Areas",
    icon: <Folder size={17} />,
    value: 5,
    change: "+2 this week",
    url: "dashboard/areas",
  },
  projects: {
    title: "Projects",
    icon: <Box size={17} />,
    value: 9,
    change: "+4 this week",
    url: "dashboard/projects",
  },
  tasks: {
    title: "Tasks",
    icon: <CheckSquare size={17} />,
    value: 12,
    change: "8 due today",
    url: "dashboard/tasks",
  },
  events: {
    title: "Events",
    icon: <Calendar size={17} />,
    value: 6,
    change: "2 today",
    url: "dashboard/events",
  },
  notes: {
    title: "Notes",
    icon: <Clipboard size={17} />,
    value: 58,
    change: "+15 this week",
    url: "dashboard/notes",
  },
  resources: {
    title: "Resources",
    icon: <Database size={17} />,
    value: 34,
    change: "+7 this week",
    url: "dashboard/resources",
  },
};
