import { supabase } from './supabase';

// export const uploadImage = async (file: File, folder: string = 'general'): Promise<string> => {
//   try {
//     // Generate unique filename
//     const fileExt = file.name.split('.').pop();
//     const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

//     // Upload file to Supabase Storage
//     const { data, error } = await supabase.storage
//       .from('pledge-images')
//       .upload(fileName, file, {
//         cacheControl: '3600',
//         upsert: false
//       });

//     if (error) {
//       throw error;
//     }

//     // Get public URL
//     const { data: { publicUrl } } = supabase.storage
//       .from('pledge-images')
//       .getPublicUrl(fileName);

//     return publicUrl;
//   } catch (error) {
//     console.error('Error uploading image:', error);
//     throw error;
//   }
// };

// export const deleteImage = async (url: string): Promise<void> => {
//   try {
//     // Extract filename from URL
//     const urlParts = url.split('/');
//     const fileName = urlParts[urlParts.length - 1];
    
//     const { error } = await supabase.storage
//       .from('pledge-images')
//       .remove([fileName]);

//     if (error) {
//       throw error;
//     }
//   } catch (error) {
//     console.error('Error deleting image:', error);
//     throw error;
//   }
// };

// // Convert file to base64 for preview (temporary storage)
// export const fileToBase64 = (file: File): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = () => resolve(reader.result as string);
//     reader.onerror = error => reject(error);
//   });
// };


// // Audio upload and delete functions
// export const uploadAudio = async (file: File, folder: string = 'general'): Promise<string> => {
//   try {
//     const fileExt = file.name.split('.').pop();
//     const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

//     const { data, error } = await supabase.storage
//       .from('pledge-audios')
//       .upload(fileName, file, {
//         cacheControl: '3600',
//         upsert: false
//       });

//     if (error) {
//       throw error;
//     }

//     const { data: { publicUrl } } = supabase.storage
//       .from('pledge-audios')
//       .getPublicUrl(fileName);

//     return publicUrl;
//   } catch (error) {
//     console.error('Error uploading audio:', error);
//     throw error;
//   }
// };

// export const deleteAudio = async (url: string): Promise<void> => {
//   try {
//     const urlParts = url.split('/');
//     const fileName = urlParts.slice(-2).join('/'); // get folder/filename

//     const { error } = await supabase.storage
//       .from('pledge-audios')
//       .remove([fileName]);

//     if (error) {
//       throw error;
//     }
//   } catch (error) {
//     console.error('Error deleting audio:', error);
//     throw error;
//   }
// };



//new one

export const uploadFile = async (
  file: File,
  bucket: string,
  path: string
): Promise<string> => {
  try {
    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const deleteFile = async (
  bucket: string,
  path: string
): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Helper function to generate unique file names with folder structure
export const generateFileName = (originalName: string, prefix: string, folder: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  return `${folder}/${prefix}_${timestamp}_${randomString}.${extension}`;
};

// Helper functions for specific file types
export const generateCustomerImagePath = (customerId: string, originalName: string): string => {
  return generateFileName(originalName, `customer_${customerId}_photo`, 'customers');
};

export const generateCustomerAudioPath = (customerId: string, originalName: string): string => {
  return generateFileName(originalName, `customer_${customerId}_audio`, 'customers');
};

export const generateJewelImagePath = (jewelId: string, originalName: string): string => {
  return generateFileName(originalName, `jewel_${jewelId}_image`, 'jewels');
};