import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

type StatCardColor =
  | "blue"
  | "green"
  | "yellow"
  | "purple"
  | "pink"
  | "red"
  | "gray";

type StatCardProps = {
  title: string;
  value: number | string;
  change?: string;
  icon?: React.ElementType; // Lucide icon or any React component
  color?: StatCardColor;
  trend?: "up" | "down";
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color,
  trend = "up",
}) => {
  const trendColor = trend === "up" ? "text-green-600" : "text-red-600";

  const colorClassMap: Record<StatCardColor, string> = {
    blue: "text-blue-400",
    green: "text-green-400",
    yellow: "text-yellow-400",
    purple: "text-purple-400",
    pink: "text-pink-400",
    red: "text-red-400",
    gray: "text-gray-400",
  };

  const iconClass = colorClassMap[color] ?? colorClassMap.blue;

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium text-secondary-foreground">{title}</p>
        <h2 className="text-3xl font-semibold text-secondary-foreground">
          {value}
        </h2>
        {change && (
          <p className={`text-sm ${trendColor} flex items-center gap-1`}>
            {trend === "up" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            {change}
          </p>
        )}
      </div>

      {Icon && <Icon size={35} className={iconClass} />}
    </div>
  );
};

export default StatCard;
