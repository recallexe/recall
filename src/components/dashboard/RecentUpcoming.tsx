"use client";
import { useState } from "react";
import { recentupcomming as data } from "@/app/lib/data";
import Link from "next/link";

export default function RecentUpcoming() {
  const [activeTab, setActiveTab] = useState("Notes");



  const tabs = Object.keys(data);

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs */}
      <ul className="flex flex-wrap justify-between px-5 items-center border-2  rounded-full text-sm">
        {tabs.map((tab) => (
          <li
            key={tab}
            className={`cursor-pointer px-3 py-1 rounded-full transition-colors ${
              activeTab === tab
                ? "bg-muted-foreground my-1 mx-[-15] px-4 text-sm text-primary-foreground"
                : "hover:bg-muted hover:text-foreground/80 mx-[-15] px-4"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </li>
        ))}
      </ul>

      {/* Content */}
      <div className="h-62 overflow-y-auto scrollbar-thin">
        {data[activeTab].map((item, index) => (
          <div
            key={index}
            className="flex justify-between py-2 border-b last:border-none"
          >
            <Link href={`${item.url}`}>
              <div className="flex items-center gap-2">
                {item.icon}
                <span>{item.title}</span>
              </div>
            </Link>

            <span className="text-muted-foreground text-sm">{item.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
