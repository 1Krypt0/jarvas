import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Typography from "@/components/ui/typography";
import React from "react";

interface FeatureProps {
  icon: React.ReactNode;
  headline: string;
  description: string;
}

export const Feature: React.FC<FeatureProps> = ({
  icon,
  headline,
  description,
}) => {
  return (
    <Card className="lg:flex-1">
      <CardHeader className="mx-auto max-w-fit">{icon}</CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <Typography variant="h3" className="mx-auto text-center">
            {headline}
          </Typography>
          <Typography variant="p" className="text-center">
            {description}
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
};
