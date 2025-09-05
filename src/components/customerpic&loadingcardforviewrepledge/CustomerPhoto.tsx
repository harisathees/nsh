import React, { useState } from 'react'
import { User } from 'lucide-react'

interface CustomerPhotoProps {
  photoUrl?: string
  customerName?: string
  className?: string
}

export const CustomerPhoto: React.FC<CustomerPhotoProps> = ({ 
  photoUrl, 
  customerName, 
  className = "w-[62px] h-[57px]" 
}) => {
  const [imageError, setImageError] = useState(false)

  if (!photoUrl || imageError) {
    return (
      <div className={`${className} rounded-[3px] bg-gray-100 flex items-center justify-center`}>
        <User className="w-6 h-6 text-gray-400" />
      </div>
    )
  }

  return (
    <img
      className={`${className} rounded-[3px] object-cover`}
      alt={customerName || "Customer"}
      src={photoUrl}
      onError={() => setImageError(true)}
    />
  )
}