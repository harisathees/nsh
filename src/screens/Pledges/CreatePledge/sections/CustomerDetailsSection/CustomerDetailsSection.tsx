import { CameraIcon, EyeIcon, MicIcon, PlayIcon, UsersIcon } from "lucide-react";
import React, { useRef, useState } from "react";
import { CameraCapture } from "../../../../../components/audiocamera/CameraCapture";
import { AudioRecorder } from "../../../../../components/audiocamera/AudioRecorder";
import { Card, CardContent } from "../../../../../components/ui/card";
import { Input } from "../../../../../components/ui/input";
import { Textarea } from "../../../../../components/ui/textarea";
import { CustomerData } from "../../CreatePledge";
import { uploadFile, generateCustomerImagePath, generateCustomerAudioPath } from "../../../../../lib/storage";

interface CustomerDetailsSectionProps {
  customerData: CustomerData;
  onCustomerDataChange: (data: CustomerData) => void;
}

export const CustomerDetailsSection = ({
  customerData,
  onCustomerDataChange,
}: CustomerDetailsSectionProps): JSX.Element => {
  const photoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState({ photo: false, audio: false });
  const [showCamera, setShowCamera] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);

  const handleInputChange = (field: keyof CustomerData, value: string) => {
    onCustomerDataChange({
      ...customerData,
      [field]: value,
    });
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    try {
      setUploading(prev => ({ ...prev, photo: true }));

      // Generate temporary ID for new customer
      const tempCustomerId = `temp_${Date.now()}`;
      const filePath = generateCustomerImagePath(tempCustomerId, file.name);
      const photoUrl = await uploadFile(file, 'pledge-images', filePath);

      handleInputChange('photo_url', photoUrl);
      alert('Photo uploaded successfully!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploading(prev => ({ ...prev, photo: false }));
    }
  };

  const handleAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      alert('Please select a valid audio file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Audio size should be less than 10MB');
      return;
    }

    try {
      setUploading(prev => ({ ...prev, audio: true }));

      // Generate temporary ID for new customer
      const tempCustomerId = `temp_${Date.now()}`;
      const filePath = generateCustomerAudioPath(tempCustomerId, file.name);
      const audioUrl = await uploadFile(file, 'pledge-audios', filePath);

      handleInputChange('audio_url', audioUrl);
      alert('Audio uploaded successfully!');
    } catch (error) {
      console.error('Error uploading audio:', error);
      alert('Failed to upload audio. Please try again.');
    } finally {
      setUploading(prev => ({ ...prev, audio: false }));
    }
  };

  const handleCameraCapture = async (file: File) => {
    try {
      setUploading(prev => ({ ...prev, photo: true }));

      // Generate temporary ID for new customer
      const tempCustomerId = `temp_${Date.now()}`;
      const filePath = generateCustomerImagePath(tempCustomerId, file.name);
      const photoUrl = await uploadFile(file, 'pledge-images', filePath);

      handleInputChange('photo_url', photoUrl);
      alert('Photo captured and uploaded successfully!');
    } catch (error) {
      console.error('Error uploading captured photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploading(prev => ({ ...prev, photo: false }));
    }
  };

  const handleAudioCapture = async (file: File) => {
    try {
      setUploading(prev => ({ ...prev, audio: true }));

      // Generate temporary ID for new customer
      const tempCustomerId = `temp_${Date.now()}`;
      const filePath = generateCustomerAudioPath(tempCustomerId, file.name);
      const audioUrl = await uploadFile(file, 'pledge-audios', filePath);

      handleInputChange('audio_url', audioUrl);
      alert('Audio recorded and uploaded successfully!');
    } catch (error) {
      console.error('Error uploading recorded audio:', error);
      alert('Failed to upload audio. Please try again.');
    } finally {
      setUploading(prev => ({ ...prev, audio: false }));
    }
  };

  const formFields = [
    { id: "name", label: "Name", type: "input", value: customerData.name, required: true },
    { id: "mobile_no", label: "Mobile No", type: "input", value: customerData.mobile_no, required: true },
    { id: "whatsapp_no", label: "Whatsapp No", type: "input", value: customerData.whatsapp_no },
    { id: "address", label: "Address", type: "textarea", value: customerData.address },

  ];

  return (
    <>
      {/* Camera Capture Modal */}
      <CameraCapture
        isOpen={showCamera}
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
      />

      {/* Audio Recorder Modal */}
      <AudioRecorder
        isOpen={showAudioRecorder}
        onCapture={handleAudioCapture}
        onClose={() => setShowAudioRecorder(false)}
      />

      <Card className="relative w-full rounded-[30px] overflow-hidden bg-white shadow-lg">
        <CardContent className="p-0">
          {/* Yellow header */}
          <div className="relative w-full bg-[#C7EEFF] rounded-t-[30px] py-8 mb-6">
            <div className="absolute bottom-4 left-0 right-0 text-center font-semibold text-[#014F70] text-xl">
              Create Pledge
            </div>
          </div>

          {/* Form content */}
          <div className="px-7 pb-6">
            {/* Customer Details header */}
            <div className="relative mb-6">
              <div className="flex items-center gap-2 font-normal text-black text-lg">
                <UsersIcon className="w-6 h-6 text-[#269AD4]" />
                Customer Details
              </div>
            </div>

            {/* Form fields */}
            <div className="space-y-4">
              {formFields.map((field) => (
                <div key={field.id} className="relative">
                  <label className="block mb-5 text-sm font-medium text-black-700 px-2">
                    {field.label}{field.required ? " *" : ""}
                  </label>
                  {field.type === "input" ? (
                    <Input
                      placeholder={field.label}
                      value={field.value || ""}
                      onChange={(e) => handleInputChange(field.id as keyof CustomerData, e.target.value)}
                      className={`h-[50px] px-4 py-3 rounded-[30px] border border-solid focus:ring-2 focus:ring-[#fff5c5] ${field.required ? 'border-[#269AD4]' : 'border-[#269AD4]'
                        } focus:border-[#269AD4]`}
                      required={field.required}
                    />
                  ) : (
                    <Textarea
                      placeholder={field.label}
                      value={field.value || ""}
                      onChange={(e) => handleInputChange(field.id as keyof CustomerData, e.target.value)}
                      className="min-h-[100px] px-4 py-3 rounded-[30px] border border-solid border-[#269AD4] focus:ring-2 focus:ring-[#fff5c5] focus:border-[#269AD4] resize-none"
                    />
                  )}
                </div>
              ))}

              <div className="flex flex-col gap-1 ">
                <label className="font-medium px-4">ID Proof</label>
                <div className="flex gap-2 px-0 ">
                  <select
                    value={customerData.id_proof.split(" - ")[0] || ""}
                    onChange={(e) => {
                      const newType = e.target.value;
                      const existingNumber = customerData.id_proof.split(" - ")[1] || "";
                      onCustomerDataChange({ ...customerData, id_proof: `${newType} - ${existingNumber}` });
                    }}
                    className="border border-[#269AD4] rounded-[30px] px-1 py-2 w-20 pl-3"
                  >
                    {/* <option value="">Select</option> */}
                    <option value="Aadhar">Aadhar</option>
                    <option value="PAN">PAN</option>
                    <option value="Voter ID">Voter ID</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Passport">Passport</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Enter ID number"
                    value={customerData.id_proof.split(" - ")[1] || ""}
                    onChange={(e) => {
                      const newNumber = e.target.value;
                      const existingType = customerData.id_proof.split(" - ")[0] || "";
                      onCustomerDataChange({ ...customerData, id_proof: `${existingType} - ${newNumber}` });
                    }}
                    className="flex-1 border border-[#269AD4] rounded-[30px] px-1 py-2"
                  />
                </div>
              </div>

            </div>

            {/* Media capture section */}
            <div className="mt-8">
              {/* Hidden file inputs */}
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                className="hidden"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Photo Section */}
                <div className="space-y-4">
                  {/* Capture Image */}
                  <div className="space-y-2">
                    <div
                      className="bg-[#c4c4c4] rounded-[42px] h-[140px] flex flex-col items-center justify-center cursor-pointer hover:bg-[#b8b8b8] transition-colors relative gap-2"
                    >
                      {uploading.photo ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 border-4 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm text-gray-600">Uploading...</span>
                        </div>
                      ) : (
                        <>
                          <CameraIcon className="w-12 h-12 text-gray-700" />
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowCamera(true)}
                              className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600"
                            >
                              Camera
                            </button>
                            {/* <button
                              onClick={() => photoInputRef.current?.click()}
                              className="px-3 py-1 bg-gray-500 text-white text-xs rounded-full hover:bg-gray-600"
                            >
                              Gallery
                            </button> */}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm text-[#242424]">Capture Image</span>
                      <CameraIcon className="w-4 h-4 text-[#242424]" />
                    </div>
                  </div>

                  {/* Preview Image */}
                  <div className="space-y-2">
                    <div className="rounded-[42px] h-[140px] overflow-hidden bg-gray-100 relative">
                      {customerData.photo_url ? (
                        <div className="relative w-full h-full">
                          <img
                            src={customerData.photo_url}
                            alt="Customer preview"
                            className="w-full h-full object-contain"
                          />
                          <button
                            onClick={() => handleInputChange('photo_url', '')}
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
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm text-[#242424]">Preview Image</span>
                      <EyeIcon className="w-4 h-4 text-[#242424]" />
                    </div>
                  </div>
                </div>

                {/* Audio Section */}
                <div className="space-y-4">
                  {/* Capture Audio */}
                  <div className="space-y-2">
                    <div
                      className="bg-[#c4c4c4] rounded-[42px] h-[140px] flex flex-col items-center justify-center cursor-pointer hover:bg-[#b8b8b8] transition-colors gap-2"
                    >
                      {uploading.audio ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 border-4 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm text-gray-600">Uploading...</span>
                        </div>
                      ) : (
                        <>
                          <MicIcon className="w-12 h-12 text-gray-700" />
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowAudioRecorder(true)}
                              className="px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600"
                            >
                              Record
                            </button>
                            {/* <button
                              onClick={() => audioInputRef.current?.click()}
                              className="px-3 py-1 bg-gray-500 text-white text-xs rounded-full hover:bg-gray-600"
                            >
                              Upload
                            </button> */}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm text-[#242424]">Capture Audio</span>
                      <MicIcon className="w-4 h-4 text-[#242424]" />
                    </div>
                  </div>

                  {/* Preview Audio */}
                  <div className="space-y-2">
                    <div className="rounded-[42px] h-[140px] bg-gray-100 flex items-center justify-center relative">
                      {customerData.audio_url ? (
                        <div className="flex flex-col items-center gap-2 w-full h-full justify-center relative">
                          <audio controls className="w-full max-w-[120px]">
                            <source src={customerData.audio_url} type="audio/mpeg" />
                            Your browser does not support the audio element.
                          </audio>
                          <button
                            onClick={() => handleInputChange('audio_url', '')}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-center">
                          <PlayIcon className="w-12 h-12 mx-auto mb-2" />
                          <span className="text-sm">No audio</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm text-[#242424]">Preview Audio</span>
                      <PlayIcon className="w-4 h-4 text-[#242424]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};