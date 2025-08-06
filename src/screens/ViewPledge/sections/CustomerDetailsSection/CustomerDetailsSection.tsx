import { EyeIcon } from "lucide-react";
import React, { useRef, useState } from "react";
import { Customer } from "../../../../lib/supabase";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";

interface CustomerDetailsSectionProps {
  customer: Customer;
}

export const CustomerDetailsSection = ({ customer }: CustomerDetailsSectionProps): JSX.Element => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const formFields = [
    { id: "", label: "Name", type: "input", value: customer.name || "N/A" },
    { id: "mobile", label: "Mobile No", type: "input", value: customer.mobile_no || "N/A" },
    { id: "whatsapp", label: "WhatsApp No", type: "input", value: customer.whatsapp_no || "N/A" },
    { id: "address", label: "Address", type: "textarea", value: customer.address || "N/A" },
    { id: "idProof", label: "ID Proof", type: "input", value: customer.id_proof || "N/A" },
  ];

  const handleAudioPlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <Card className="w-full bg-white rounded-3xl shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-1">View Pledge</h1>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-medium text-gray-600">Customer Details</h2>
              <img
                className="w-5 h-5"
                alt="User group"
                src="/user-group.svg"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <span className="text-sm font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
              G: ₹9,849
            </span>
            <span className="text-sm font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
              S: ₹116.04
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        {/* Form Fields */}
        <div className="space-y-4">
          {formFields.map((field) => (
            <div key={field.id} className="space-y-1">
              <label className="text-sm font-medium text-gray-700" htmlFor={field.id}>
                {field.label}
              </label>
              {field.type === "input" ? (
                <Input
                  id={field.id}
                  value={field.value}
                  readOnly
                  className="h-12 rounded-2xl border-gray-200 bg-gray-50 text-gray-800 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              ) : (
                <Textarea
                  id={field.id}
                  value={field.value}
                  readOnly
                  className="min-h-[100px] rounded-2xl border-gray-200 bg-gray-50 text-gray-800 resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              )}
            </div>
          ))}
        </div>

        {/* Preview Image Section */}
        <div className="mt-8 flex flex-col items-center">
          <div className="relative mb-3">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
              {customer.photo_url ? (
                <img
                  className="w-full h-full object-cover"
                  alt="Customer preview"
                  src={customer.photo_url}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/rectangle-2.png"; // Fallback image
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
        </div>

        {/* Preview Audio Section */}
        <div className="mt-6 flex flex-col items-center">
          <div className="relative mb-3">
            {customer.audio_url ? (
              <>
                <Button
                  variant="ghost"
                  onClick={handleAudioPlay}
                  className={`w-20 h-20 rounded-full p-0 transition-colors ${
                    isPlaying ? 'bg-blue-100 hover:bg-blue-200' : 'bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  <img
                    className="w-16 h-16 object-contain"
                    alt="Audio waveform"
                    src="/7827919-2.png"
                  />
                </Button>
                <audio
                  ref={audioRef}
                  src={customer.audio_url}
                  onEnded={() => setIsPlaying(false)}
                />
              </>
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-500 text-xs">No Audio</span>
              </div>
            )}
          </div>
          <div className="text-sm text-gray-600">
            Preview Audio
          </div>
        </div>
      </CardContent>
    </Card>
  );
};