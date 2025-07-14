import mime from "mime/lite";
import { ID } from "react-native-appwrite";
import { appwriteConfig, databases, storage } from "./appwrite";
import dummyData from "./data";

interface Category {
  name: string;
  description: string;
}

interface Customization {
  name: string;
  price: number;
  type: "topping" | "side" | "size" | "crust" | string;
}

interface MenuItem {
  name: string;
  description: string;
  image_url: string;
  price: number;
  rating: number;
  calories: number;
  protein: number;
  category_name: string;
  customizations: string[];
}

interface DummyData {
  categories: Category[];
  customizations: Customization[];
  menu: MenuItem[];
}

const data = dummyData as DummyData;

async function clearAll(collectionId: string): Promise<void> {
  const list = await databases.listDocuments(
    appwriteConfig.databaseId!,
    collectionId
  );

  await Promise.all(
    list.documents.map((doc) =>
      databases.deleteDocument(
        appwriteConfig.databaseId!,
        collectionId,
        doc.$id
      )
    )
  );

  console.log(`✅ Cleared documents in ${collectionId}`);
}

async function clearStorage(): Promise<void> {
  const list = await storage.listFiles(appwriteConfig.bucketId!);

  await Promise.all(
    list.files.map((file) =>
      storage.deleteFile(appwriteConfig.bucketId!, file.$id)
    )
  );
  console.log("✅ Cleared storage bucket.");
}

async function uploadImageToStorage(imageUrl: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    const fileName = imageUrl.split("/").pop() || `image-${Date.now()}.jpg`;
    const mimeType = mime.getType(fileName) || "image/jpeg";

    const file = {
      name: fileName,
      type: mimeType,
      size: blob.size,
      uri: imageUrl,
    };

    const uploaded = await storage.createFile(
      appwriteConfig.bucketId!,
      ID.unique(),
      file
    );

    return storage
      .getFileViewURL(appwriteConfig.bucketId!, uploaded.$id)
      .toString();
  } catch (error) {
    console.error(`❌ Failed to upload image: ${imageUrl}`, error);
    return null;
  }
}

async function seed(): Promise<void> {
  console.log("🔄 Starting seeding...");

  await clearAll(appwriteConfig.categoriesCollectionId!);
  await clearAll(appwriteConfig.customizationsCollectionId!);
  await clearAll(appwriteConfig.menuCustomizationsCollectionId!);
  await clearStorage();
  console.log("✅ Cleared all data.");

  const categoryMap: Record<string, string> = {};
  for (const cat of data.categories) {
    const doc = await databases.createDocument(
      appwriteConfig.databaseId!,
      appwriteConfig.categoriesCollectionId!,
      ID.unique(),
      cat
    );
    categoryMap[cat.name] = doc.$id;
  }

  const customizationMap: Record<string, string> = {};
  for (const cus of data.customizations) {
    const doc = await databases.createDocument(
      appwriteConfig.databaseId!,
      appwriteConfig.customizationsCollectionId!,
      ID.unique(),
      {
        name: cus.name,
        price: cus.price,
        type: cus.type,
      }
    );
    customizationMap[cus.name] = doc.$id;
  }

  for (const item of data.menu) {
    const categoryId = categoryMap[item.category_name];
    if (!categoryId) {
      console.warn(
        `⚠️ Skipping ${item.name} - missing category ${item.category_name}`
      );
      continue;
    }

    const uploadedImage = await uploadImageToStorage(item.image_url);
    if (!uploadedImage) {
      console.warn(`⚠️ Skipping ${item.name} - image upload failed`);
      continue;
    }

    const doc = await databases.createDocument(
      appwriteConfig.databaseId!,
      appwriteConfig.menuCollectionId!,
      ID.unique(),
      {
        name: item.name,
        description: item.description,
        image_url: uploadedImage,
        price: item.price,
        rating: item.rating,
        calories: item.calories,
        protein: item.protein,
        categories: categoryId,
      }
    );

    for (const cusName of item.customizations) {
      const customizationId = customizationMap[cusName];
      if (!customizationId) continue;

      await databases.createDocument(
        appwriteConfig.databaseId!,
        appwriteConfig.menuCustomizationsCollectionId!,
        ID.unique(),
        {
          menu: doc.$id,
          customizations: customizationId,
        }
      );
    }
  }

  console.log("✅ Seeding complete.");
}

export default seed;
