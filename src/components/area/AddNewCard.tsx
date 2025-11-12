import React from "react";
import { Card, CardContent, CardFooter } from "../ui/card";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Separator } from "../ui/separator";
const AddNewCard = () => {
  return (
    <Link href="/dashboard/areas">
      <Card>
        <CardContent className="flex items-center justify-center h-45 gap-2">
          <Plus size={22} />
          <p>Add New Area</p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default AddNewCard;
