import { EyeIcon } from "lucide-react";
import React from "react";
import { Jewel } from "../../../../lib/supabase";
import { Card, CardContent, CardHeader } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";

interface JewelDetailsSectionProps {
  jewels: Jewel[];
}

export const JewelDetailsSection = ({ jewels }: JewelDetailsSectionProps): JSX.Element => {
  // Display first jewel or show empty state
  const jewel = jewels.length > 0 ? jewels[0] : null;

  const formFields = jewel ? [
    { id: "type", label: "Type", value: jewel.type || "N/A" },
    { id: "quality", label: "Quality", value: jewel.quality || "N/A" },
    { id: "jewel", label: "Jewel", value: jewel.description || "N/A" },
    { id: "pieces", label: "Pieces", value: jewel.pieces?.toString() || "N/A" },
    { id: "weight", label: "Weight", value: jewel.weight ? `${jewel.weight}g` : "N/A" },
    { id: "stWeight", label: "St. Weight", value: jewel.stone_weight ? `${jewel.stone_weight}g` : "N/A" },
    { id: "ntWeight", label: "Nt. Weight", value: jewel.net_weight ? `${jewel.net_weight}g` : "N/A" },
    { id: "jewelFault", label: "Jewel Fault", value: jewel.faults || "None" },
  ] : [
    { id: "type", label: "Type", value: "N/A" },
    { id: "quality", label: "Quality", value: "N/A" },
    { id: "jewel", label: "Jewel", value: "N/A" },
    { id: "pieces", label: "Pieces", value: "N/A" },
    { id: "weight", label: "Weight", value: "N/A" },
    { id: "stWeight", label: "St. Weight", value: "N/A" },
    { id: "ntWeight", label: "Nt. Weight", value: "N/A" },
    { id: "jewelFault", label: "Jewel Fault", value: "N/A" },
  ];

  return (
    <Card className="w-full bg-white rounded-3xl shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6">
        <h2 className="text-xl font-semibold text-gray-800">Jewel Details</h2>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Jewel Image Preview */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-3">
            <div className="w-40 h-40 rounded-2xl overflow-hidden bg-gray-100 shadow-md">
              {jewel?.image_url ? (
                <img
                  className="w-full h-full object-cover"
                  alt="Jewelry preview"
                  src={jewel.image_url}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/rectangle-2-1.png"; // Fallback image
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">No Image</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <EyeIcon className="w-4 h-4" />
            <span>Preview Image</span>
          </div>
          {jewels.length > 1 && (
            <p className="text-xs text-gray-500 mt-1">Showing 1 of {jewels.length} jewels</p>
          )}
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {formFields.map((field) => (
            <div key={field.id} className="space-y-1">
              <label className="text-sm font-medium text-gray-700" htmlFor={field.id}>
                {field.label}
              </label>
              <Input
                id={field.id}
                value={field.value}
                readOnly
                className="h-12 rounded-2xl border-gray-200 bg-gray-50 text-gray-800 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};