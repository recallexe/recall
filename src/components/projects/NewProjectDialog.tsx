"use client";
import * as React from "react";
import { ChevronDownIcon, Plus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { sample, projects } from "@/app/lib/data";
import { DatePicker } from "./DatePicker";
import { Textarea } from "@/components/ui/textarea";

/**
 * AppDialog component - Modal dialog for adding/editing projects.
 * Accepts a custom trigger element as a prop.
 */
export function NewProjectDialog({ trigger }: { trigger: React.ReactNode }) {
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>

        <DialogContent className="sm:max-w-[425px]">
          {/* Dialog Header */}
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
          </DialogHeader>

          {/* Form Fields */}
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Name</Label>
              <Input id="name-1" name="name" defaultValue="New Project" />
            </div>

            <div className="grid w-full gap-3">
              <Label htmlFor="message">Description</Label>
              <Textarea placeholder="Type your message here." id="message" />
            </div>

            <div className="flex gap-2">
              {/* Area Select */}
              <div className="flex-1 grid gap-3">
                <Label htmlFor="area">Area</Label>
                <NativeSelect id="area" className="w-full">
                  <NativeSelectOption value="">Select Area</NativeSelectOption>
                  {sample.areas.map((area, index) => (
                    <NativeSelectOption key={index} value="">
                      {area}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>

              {/* Status Select */}
              <div className="flex-1 grid gap-3">
                <Label htmlFor="status">Status</Label>
                <NativeSelect id="status" className="w-full">
                  <NativeSelectOption value="">
                    Select Status
                  </NativeSelectOption>
                  {Object.keys(projects).map((status, index) => (
                    <NativeSelectOption key={index} value="">
                      {status}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
            </div>

            <div className="flex gap-2">
              <DatePicker title="Start Date" />
              <DatePicker title="End Date" />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
