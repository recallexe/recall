"use client";

import React from "react";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Ellipsis, Folder } from "lucide-react";
import Image from "next/image";
import { Separator } from "../ui/separator";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";

const AreaCard = ({ title, image, href }) => {
  return (
    <>
      <Card className="h-55">
        <CardContent
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          className="relative h-35 p-0 m-0 w-full overflow-hidden"
        >
          <div className="absolute top-0 right-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/40 text-white hover:bg-black/60"
                >
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuItem>edit</DropdownMenuItem>
                <DropdownMenuItem>duplicate</DropdownMenuItem>
                <DropdownMenuItem>delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
        <Separator />
        <Link href={href}>
          <CardFooter>
            <div className="flex items-center gap-2 font-bold">
              <Folder size={18} />
              <p>{title}</p>
            </div>
          </CardFooter>
        </Link>
      </Card>
    </>
  );
};

export default AreaCard;
