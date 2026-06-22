import { storage } from '@/lib/firebase/client';
import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  UploadTask,
} from 'firebase/storage';

export class StorageService {
  static async uploadFile(
    path: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      
      if (onProgress) {
        const uploadTask: UploadTask = uploadBytesResumable(storageRef, file);
        
        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress(progress);
            },
            (error) => {
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        });
      } else {
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  static async getFile(path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error getting file:', error);
      throw error;
    }
  }

  static async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  static async listFiles(path: string): Promise<string[]> {
    try {
      const storageRef = ref(storage, path);
      const result = await listAll(storageRef);
      const urls = await Promise.all(
        result.items.map(async (item) => {
          return await getDownloadURL(item);
        })
      );
      return urls;
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }

  static async getFileMetadata(path: string) {
    try {
      const storageRef = ref(storage, path);
      return await getMetadata(storageRef);
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw error;
    }
  }

  static generateProfilePath(uid: string, filename: string): string {
    return `profiles/${uid}/${filename}`;
  }

  static generateTransactionPath(uid: string, filename: string): string {
    return `transactions/${uid}/${filename}`;
  }

  static isValidImage(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
  }

  static isFileSizeValid(file: File, maxSizeMB: number = 5): boolean {
    const maxBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxBytes;
  }
      }
