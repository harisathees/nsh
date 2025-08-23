import { CameraIcon, EyeIcon, PlusIcon, TrashIcon } from "lucide-react";
import React, { useRef, useState } from "react";
import { CameraCapture } from "../../../../components/CameraCapture";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Separator } from "../../../../components/ui/separator";
import { JewelData } from "../../CreatePledge";
import { uploadFile, generateJewelImagePath } from "../../../../lib/storage";

interface JewelDetailsSectionProps {
  jewelData: JewelData[];
  onJewelDataChange: (data: JewelData[]) => void;
}

export const JewelDetailsSection = ({
  jewelData,
  onJewelDataChange,
}: JewelDetailsSectionProps): JSX.Element => {
  const imageInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [showCamera, setShowCamera] = useState<{ [key: string]: boolean }>({});

  const handleInputChange = (index: number, field: keyof JewelData, value: string | number) => {
    const updatedJewels = [...jewelData];

    // Update field value
    updatedJewels[index] = {
      ...updatedJewels[index],
      [field]: value,
    };

    // Parse as number for safety
    const weight = field === 'weight' ? Number(value) : Number(updatedJewels[index].weight || 0);
    const stoneWeight = field === 'stone_weight' ? Number(value) : Number(updatedJewels[index].stone_weight || 0);

    // Auto-calculate net_weight
    updatedJewels[index].net_weight = Math.max(weight - stoneWeight, 0);

    onJewelDataChange(updatedJewels);
  };


  const addNewJewel = () => {
    const newJewel: JewelData = {
      type: "",
      quality: "",
      description: "",
      pieces: 0,
      weight: 0,
      stone_weight: 0,
      net_weight: 0,
      faults: "",
      image_url: "",
    };

    onJewelDataChange([...jewelData, newJewel]);
  };

  const removeJewel = (index: number) => {
    // Don't allow removing if it's the only jewel
    if (jewelData.length === 1) {
      alert('Cannot remove the last jewel. At least one jewel is required.');
      return;
    }

    const updatedJewels = jewelData.filter((_, i) => i !== index);
    onJewelDataChange(updatedJewels);
  };

  const handleImageUpload = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const uploadKey = `jewel_${index}`;

    try {
      setUploading(prev => ({ ...prev, [uploadKey]: true }));

      // Generate temporary ID for new jewel
      const tempJewelId = `temp_${Date.now()}_${index}`;
      const filePath = generateJewelImagePath(tempJewelId, file.name);
      const imageUrl = await uploadFile(file, 'pledge-images', filePath);

      handleInputChange(index, 'image_url', imageUrl);
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  const handleCameraCapture = async (index: number, file: File) => {
    const uploadKey = `jewel_${index}`;

    try {
      setUploading(prev => ({ ...prev, [uploadKey]: true }));

      // Generate temporary ID for new jewel
      const tempJewelId = `temp_${Date.now()}_${index}`;
      const filePath = generateJewelImagePath(tempJewelId, file.name);
      const imageUrl = await uploadFile(file, 'pledge-images', filePath);

      handleInputChange(index, 'image_url', imageUrl);
      alert('Photo captured and uploaded successfully!');
    } catch (error) {
      console.error('Error uploading captured image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(prev => ({ ...prev, [uploadKey]: false }));
      setShowCamera(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  const removeImage = (index: number) => {
    handleInputChange(index, 'image_url', '');
  };

  const formFields = [
    { id: "type", label: "Jewel Type", type: "select", options: ["Gold", "Silver"], required: true },
    { id: "quality", label: "Quality", type: "select", options: ["916", "Ordinary"] },
    { id: "description", label: "Description", type: "text" },
    // { id: "description", label: "Description", type: "select", options: ["Kammal", "Ring", "Bracelet", "Chain", "Stud", "Bangle", "Other"] },
    { id: "pieces", label: "Pieces", type: "number" },
    { id: "weight", label: "Weight (g)", type: "number", required: true },
    { id: "stone_weight", label: "Stone Weight (g)", type: "number" },
    { id: "net_weight", label: "Net Weight (g)", type: "number" },
    { id: "faults", label: "Faults", type: "text" },
  ];

  return (
    <>
      {/* Camera Capture Modals for each jewel */}
      {jewelData.map((_, index) => {
        const cameraKey = `jewel_${index}`;
        return (
          <CameraCapture
            key={cameraKey}
            isOpen={showCamera[cameraKey] || false}
            onCapture={(file) => handleCameraCapture(index, file)}
            onClose={() => setShowCamera(prev => ({ ...prev, [cameraKey]: false }))}
          />
        );
      })}

      <div className="space-y-6">
        {jewelData.map((jewel, index) => (
          <Card key={index} className="w-full rounded-[30px] bg-white shadow-lg relative">
            {/* Hidden file input for each jewel */}
            <input
              ref={(el) => imageInputRefs.current[`jewel_${index}`] = el}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(index, e)}
              className="hidden"
            />

            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-normal text-black text-lg">
                  Jewel Details {jewelData.length > 1 ? `#${index + 1}` : ''}
                </h2>
                {jewelData.length > 1 && (
                  <Button
                    onClick={() => removeJewel(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <Separator className="my-4" />

              {/* Image Section */}
              <div className="mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Capture Image Card */}
                  <div className="space-y-2">
                    <Card
                      className="rounded-[42px] bg-[#c4c4c4] border-0 overflow-hidden"
                    >
                      <CardContent className="p-0 h-[140px] flex flex-col items-center justify-center gap-2">
                        {uploading[`jewel_${index}`] ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-4 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm text-gray-600">Uploading...</span>
                          </div>
                        ) : (
                          <>
                            <CameraIcon className="w-12 h-12 text-gray-700" />
                            <div className="flex gap-2">
                              <button
                                onClick={() => setShowCamera(prev => ({ ...prev, [`jewel_${index}`]: true }))}
                                className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600"
                              >
                                Camera
                              </button>
                              {/* <button
                                onClick={() => imageInputRefs.current[`jewel_${index}`]?.click()}
                                className="px-3 py-1 bg-gray-500 text-white text-xs rounded-full hover:bg-gray-600"
                              >
                                Gallery
                              </button> */}
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                    <div className="flex items-center justify-center gap-2 text-sm text-[#242424]">
                      <span>Capture Image</span>
                      <CameraIcon className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Preview Image Card */}
                  <div className="space-y-2">
                    <Card className="rounded-[42px] border-0 overflow-hidden relative">
                      <CardContent className="p-0 h-[140px] bg-gray-100 relative">
                        {jewel.image_url ? (
                          <div className="relative w-full h-full">
                            <img
                              className="w-full h-full object-contain"
                              alt="Jewelry preview"
                              src={jewel.image_url}
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No image
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    <div className="flex items-center justify-center gap-2 text-sm text-[#242424]">
                      <span>Preview Image</span>
                      <EyeIcon className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {formFields.map((field) => (
                  <div key={field.id} className="relative">
                  <label className="block mb-5 text-sm font-medium text-black-700 px-2">
                    {field.label}{field.required ? " *" : ""}
                  </label>
                    {field.type === "select" ? (
                      <>
                        <select
                          id={field.id}
                          value={jewel[field.id as keyof JewelData] || ""}
                          onChange={(e) => handleInputChange(index, field.id as keyof JewelData, e.target.value)}
                          disabled={field.id === "quality" && jewel.type === "Silver"}
                          className={`h-[50px] px-4 py-3 border-[#269AD4] bg-white rounded-[30px] border border-solid text-gray-700 text-sm focus:ring-2 focus:ring-[#269AD4] w-full ${field.id === "quality" && jewel.type === "Silver" ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          required={field.required}
                        >
                          <option value="">Select</option>
                          {field.options?.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>

                        {/* Show extra input if "Other" is selected for description */}
                        {field.id === "description" && jewel.description === "Other" && (
                          <Input
                            placeholder="Enter custom Jewel"
                            value={jewel.custom_description || ""}
                            onChange={(e) => handleInputChange(index, "custom_description" as keyof JewelData, e.target.value)}
                            className="mt-2 h-[5px] px-4 py-3 border-[#269AD4] bg-white rounded-[30px] border border-solid text-gray-700 text-sm focus:ring-2 focus:ring-[#269AD4]"
                          />
                        )}
                      </>
                    ) : (
                      // existing input rendering logic...


                      <Input
                        id={field.id}
                        placeholder={`${field.label}${field.required ? ' *' : ''}`}
                        type={field.type}
                        value={jewel[field.id as keyof JewelData] || ""}
                        onChange={(e) => {
                          const value = field.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value;
                          handleInputChange(index, field.id as keyof JewelData, value);
                        }}
                        className={`h-[50px] px-4 py-3 border-[#269AD4] bg-white rounded-[30px] border border-solid text-gray-700 text-sm focus:ring-2 focus:ring-[#269AD4] w-full`}
                        required={field.required}
                      />
                    )}

                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add New Jewel Button */}
        <div className="flex justify-center">
          <Button
            onClick={addNewJewel}
            className="flex items-center gap-2 h-12 px-6 py-3 bg-[#269AD4] rounded-[31.5px] text-[#ffffff] hover:bg-[#46cbf3] border border-[#269AD4]"
          >
            <PlusIcon className="w-5 h-5" />
            Add New Jewel
          </Button>
        </div>
      </div>
    </>
  );
};