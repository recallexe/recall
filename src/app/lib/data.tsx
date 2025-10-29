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
  icons,
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
    bgcolor: "bg-area-card",
  },
  projects: {
    title: "Projects",
    icon: <Box size={17} />,
    value: 9,
    change: "+4 this week",
    url: "dashboard/projects",
    bgcolor: "bg-project-card",
  },
  tasks: {
    title: "Tasks",
    icon: <CheckSquare size={17} />,
    value: 12,
    change: "8 due today",
    url: "dashboard/tasks",
    bgcolor: "bg-task-card",
  },
  events: {
    title: "Events",
    icon: <Calendar size={17} />,
    value: 6,
    change: "2 today",
    url: "dashboard/events",
    bgcolor: "bg-event-card",
  },
  notes: {
    title: "Notes",
    icon: <Clipboard size={17} />,
    value: 58,
    change: "+15 this week",
    url: "dashboard/notes",
    bgcolor: "bg-note-card",
  },
  resources: {
    title: "Resources",
    icon: <Database size={17} />,
    value: 34,
    change: "+7 this week",
    url: "dashboard/resources",
    bgcolor: "bg-resource-card",
  },
};

export const TodayOverview = [
  {
    icon: [<CheckSquare size={18} />, <Calendar size={18} />],
    message: "Complete project proposal for Q4 marketing campaing",
    area: "School",
    type: "Task",
    deadline: "today",
    priorty: "high",
    url: "dashboard/tasks",
  },
  {
    icon: [<CheckSquare size={18} />, <Calendar size={18} />],
    message: "Review and respond to client emails",
    area: "Job",
    type: "Task",
    deadline: "tomorrow",
    priorty: "medium",
    url: "dashboard/tasks",
  },
  {
    icon: [<CheckSquare size={18} />, <Calendar size={18} />],
    message: "Advisor's meeting",
    area: "School",
    type: "Event",
    deadline: "oct 21",
    priorty: "low",
    url: "dashboard/events",
  },
  {
    icon: [<CheckSquare size={18} />, <Calendar size={18} />],
    message: "Attend career fair",
    area: "School",
    type: "Event",
    deadline: "in two days",
    priorty: "high",
    url: "dashboard/events",
  },
  {
    icon: [<CheckSquare size={18} />, <Calendar size={18} />],
    message: "Attend career fair",
    area: "School",
    type: "Event",
    deadline: "in two days",
    priorty: "high",
    url: "dashboard/events",
  },
];

export const recentupcomming = {
  Notes: [
    {
      title: "Meeting summary",
      icon: <Clipboard size={18} />,
      date: "Oct 25, 2025",
      url: "dashboard/notes",
    },
    {
      title: "Design feedback",
      icon: <Clipboard size={18} />,
      date: "Oct 23, 2025",
      url: "dashboard/notes",
    },
    {
      title: "Meeting summary",
      icon: <Clipboard size={18} />,
      date: "Oct 25, 2025",
      url: "dashboard/notes",
    },
    {
      title: "Design feedback",
      icon: <Clipboard size={18} />,
      date: "Oct 23, 2025",
      url: "dashboard/notes",
    },
    {
      title: "Meeting summary",
      icon: <Clipboard size={18} />,
      date: "Oct 25, 2025",
      url: "dashboard/notes",
    },
    {
      title: "Design feedback",
      icon: <Clipboard size={18} />,
      date: "Oct 23, 2025",
      url: "dashboard/notes",
    },
    {
      title: "Meeting summary",
      icon: <Clipboard size={18} />,
      date: "Oct 25, 2025",
      url: "dashboard/notes",
    },
    {
      title: "Design feedback",
      icon: <Clipboard size={18} />,
      date: "Oct 23, 2025",
      url: "dashboard/notes",
    },
  ],
  Projects: [
    {
      title: "Website Redesign",
      icon: <Box size={18} />,
      date: "Due Nov 5, 2025",
      url: "dashboard/projects",
    },
    {
      title: "Marketing Plan",
      icon: <Box size={18} />,
      date: "Due Nov 10, 2025",
      url: "dashboard/projects",
    },
    {
      title: "Website Redesign",
      icon: <Box size={18} />,
      date: "Due Nov 5, 2025",
      url: "dashboard/projects",
    },
    {
      title: "Marketing Plan",
      icon: <Box size={18} />,
      date: "Due Nov 10, 2025",
      url: "dashboard/projects",
    },
  ],
  Tasks: [
    {
      title: "Fix navbar alignment",
      icon: <CheckSquare size={18} />,
      date: "Today",
      url: "dashboard/tasks",
    },
    {
      title: "Email client report",
      icon: <CheckSquare size={18} />,
      date: "Tomorrow",
      url: "dashboard/tasks",
    },
    {
      title: "Fix navbar alignment",
      icon: <CheckSquare size={18} />,
      date: "Today",
      url: "dashboard/tasks",
    },
    {
      title: "Email client report",
      icon: <CheckSquare size={18} />,
      date: "Tomorrow",
      url: "dashboard/tasks",
    },
  ],
  Events: [
    {
      title: "Team Meeting",
      icon: <Calendar size={18} />,
      date: "Oct 30, 2025",
      url: "dashboard/events",
    },
    {
      title: "Launch Party",
      icon: <Calendar size={18} />,
      date: "Nov 2, 2025",
      url: "dashboard/events",
    },
  ],
  Resources: [
    {
      title: "Brand Guidelines",
      icon: <Database size={18} />,
      date: "Updated Oct 20, 2025",
      url: "dashboard/resources",
    },
    {
      title: "Project Charter",
      icon: <Database size={18} />,
      date: "Updated Oct 18, 2025",
      url: "dashboard/resources",
    },
  ],
};


export const chartData = [
  { day: "Saturday", performance: 186 },
  { day: "Sunday", performance: 305 },
  { day: "Monday", performance: 73 },
  { day: "Wednesday", performance: 237 },
  { day: "Thursday", performance: 209 },
  { day: "Friday", performance: 214 },
];

export const schedule = [
  {title: "Team standup", time: "9:00 AM", duration: "30 min", location: "Conference Hall"},
  {title: "Client Presentation", time: "9:00 AM", duration: "30 min", location: "Conference Hall"},
  {title: "Code Review", time: "9:00 AM", duration: "30 min", location: "Conference Hall"},
  {title: "Code Review", time: "9:00 AM", duration: "30 min", location: "Conference Hall"},
  {title: "Code Review", time: "9:00 AM", duration: "30 min", location: "Conference Hall"},
  {title: "Code Review", time: "9:00 AM", duration: "30 min", location: "Conference Hall"},
]