"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * Formats a date object to a readable string format.
 * @param date - Date object to format
 * @returns Formatted date string (e.g., "June 01, 2025")
 */
function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Validates if a date object is valid.
 * @param date - Date object to validate
 * @returns True if date is valid, false otherwise
 */
function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !Number.isNaN(date.getTime());
}

interface DatePickerProps {
  title: string;
  value?: Date | undefined;
  onChange?: (date: Date | undefined) => void;
}

/**
 * DatePicker component - Combines an input field with a calendar popover.
 * Allows users to select dates either by typing or using the calendar picker.
 */
export function DatePicker({ title, value: controlledValue, onChange }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(undefined);
  const date = controlledValue !== undefined ? controlledValue : internalDate;
  const setDate = (newDate: Date | undefined) => {
    if (onChange) {
      onChange(newDate);
    } else {
      setInternalDate(newDate);
    }
  };
  const [month, setMonth] = React.useState<Date | undefined>(date || new Date());
  const [value, setValue] = React.useState(() => formatDate(date));

  React.useEffect(() => {
    setValue(formatDate(date));
    if (date) {
      setMonth(date);
    }
  }, [date]);

  return (
    <div className="flex flex-col gap-3">
      {/* Label */}
      <Label htmlFor="date" className="px-1">
        {title}
      </Label>

      {/* Input & Calendar Popover Container */}
      <div className="relative flex gap-2">
        <Input
          id="date"
          value={value}
          placeholder="Select a date"
          className="bg-background pr-10"
          onChange={(e) => {
            const date = new Date(e.target.value);
            setValue(e.target.value);
            if (isValidDate(date)) {
              setDate(date);
              setMonth(date);
            }
          }}
          onKeyDown={(e) => {
            // Open calendar on ArrowDown key
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
          }}
        />

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            {/* Calendar Icon Button */}
            <Button
              id="date-picker"
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            {/* Calendar Component */}
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
              onSelect={(date) => {
                setDate(date);
                setValue(formatDate(date));
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
