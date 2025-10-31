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

export const TodayOverview = [
  {
    message: "Complete project proposal for Q4 marketing campaign",
    area: "Work",
    type: "Task",
    deadline: "today",
    priorty: "high",
    url: "dashboard/tasks",
  },
  {
    message: "Prepare slides for thesis presentation",
    area: "School",
    type: "Task",
    deadline: "tomorrow",
    priorty: "medium",
    url: "dashboard/tasks",
  },
  {
    message: "Advisor meeting — project milestone discussion",
    area: "School",
    type: "Event",
    deadline: "Oct 31",
    priorty: "low",
    url: "dashboard/events",
  },
  {
    message: "Attend local tech networking event",
    area: "Career",
    type: "Event",
    deadline: "in two days",
    priorty: "high",
    url: "dashboard/events",
  },
  {
    message: "Submit expense report for Q3",
    area: "Work",
    type: "Task",
    deadline: "this week",
    priorty: "medium",
    url: "dashboard/tasks",
  },
];

export const recentupcomming = {
  Notes: [
    {
      title: "Sprint retrospective notes",
      icon: <Clipboard size={17} />,
      date: "Oct 29, 2025",
      url: "dashboard/notes",
    },
    {
      title: "UI design brainstorm",
      icon: <Clipboard size={17} />,
      date: "Oct 28, 2025",
      url: "dashboard/notes",
    },
    {
      title: "Reading summary: Atomic Habits",
      icon: <Clipboard size={17} />,
      date: "Oct 26, 2025",
      url: "dashboard/notes",
    },
    {
      title: "Research outline for thesis",
      icon: <Clipboard size={17} />,
      date: "Oct 24, 2025",
      url: "dashboard/notes",
    },
  ],
  Projects: [
    {
      title: "Portfolio Website",
      icon: <Box size={17} />,
      date: "Due Nov 10, 2025",
      url: "dashboard/projects",
    },
    {
      title: "Mobile App Prototype",
      icon: <Box size={17} />,
      date: "Due Nov 22, 2025",
      url: "dashboard/projects",
    },
    {
      title: "Community Learning Platform",
      icon: <Box size={17} />,
      date: "Due Dec 1, 2025",
      url: "dashboard/projects",
    },
  ],
  Tasks: [
    {
      title: "Refactor authentication module",
      icon: <CheckSquare size={17} />,
      date: "Today",
      url: "dashboard/tasks",
    },
    {
      title: "Send weekly progress report",
      icon: <CheckSquare size={17} />,
      date: "Tomorrow",
      url: "dashboard/tasks",
    },
    {
      title: "Test responsive layout",
      icon: <CheckSquare size={17} />,
      date: "Nov 2, 2025",
      url: "dashboard/tasks",
    },
  ],
  Events: [
    {
      title: "Team Strategy Session",
      icon: <Calendar size={17} />,
      date: "Oct 31, 2025",
      url: "dashboard/events",
    },
    {
      title: "Hackathon Kickoff",
      icon: <Calendar size={17} />,
      date: "Nov 3, 2025",
      url: "dashboard/events",
    },
    {
      title: "End-of-semester review",
      icon: <Calendar size={17} />,
      date: "Nov 15, 2025",
      url: "dashboard/events",
    },
  ],
  Resources: [
    {
      title: "UI Component Library Docs",
      icon: <Database size={17} />,
      date: "Updated Oct 29, 2025",
      url: "dashboard/resources",
    },
    {
      title: "Thesis Reference Papers",
      icon: <Database size={17} />,
      date: "Updated Oct 25, 2025",
      url: "dashboard/resources",
    },
    {
      title: "API Documentation",
      icon: <Database size={17} />,
      date: "Updated Oct 20, 2025",
      url: "dashboard/resources",
    },
  ],
};

export const chartData = [
  { day: "Saturday", performance: 186 },
  { day: "Sunday", performance: 305 },
  { day: "Monday", performance: 73 },
  { day: "Tuesday", performance: 150 },
  { day: "Wednesday", performance: 237 },
  { day: "Thursday", performance: 209 },
  { day: "Friday", performance: 214 },
];

export const schedule = [
  {
    title: "Team Standup",
    time: "9:00 AM",
    duration: "30 min",
    location: "Conference Hall",
  },
  {
    title: "Client Presentation",
    time: "10:30 AM",
    duration: "1 hr",
    location: "Zoom",
  },
  {
    title: "Code Review",
    time: "1:00 PM",
    duration: "45 min",
    location: "Dev Room 2",
  },
  {
    title: "UI Design Workshop",
    time: "3:00 PM",
    duration: "2 hr",
    location: "Design Studio",
  },
  {
    title: "Marketing Sync",
    time: "5:00 PM",
    duration: "30 min",
    location: "Meeting Room A",
  },
  {
    title: "Personal Study Session",
    time: "8:00 PM",
    duration: "1 hr",
    location: "Home Office",
  },
];
