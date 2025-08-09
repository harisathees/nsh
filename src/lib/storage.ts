import { supabase } from './supabase';

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