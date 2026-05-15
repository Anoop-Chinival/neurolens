import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility to merge Tailwind classes cleanly
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Converts File objects to full Data URL Base64 strings safely
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    // Poori string return karo (including data:image/png;base64,...)
    reader.onload = () => resolve(reader.result as string); 
    reader.onerror = (error) => reject(error);
  });
}
