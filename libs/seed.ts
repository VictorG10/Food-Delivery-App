// import { ID } from "react-native-appwrite";
// import { appwriteConfig, databases, storage } from "./appwrite";
// import dummyData from "./data";

// interface Category {
//   name: string;
//   description: string;
// }

// interface Customization {
//   name: string;
//   price: number;
//   type: "topping" | "side" | "size" | "crust" | string; // extend as needed
// }

// interface MenuItem {
//   name: string;
//   description: string;
//   image_url: string;
//   price: number;
//   rating: number;
//   calories: number;
//   protein: number;
//   category_name: string;
//   customizations: string[]; // list of customization names
// }

// interface DummyData {
//   categories: Category[];
//   customizations: Customization[];
//   menu: MenuItem[];
// }

// // ensure dummyData has correct shape
// const data = dummyData as DummyData;

// async function clearAll(collectionId: string): Promise<void> {
//   const list = await databases.listDocuments(
//     appwriteConfig.databaseId!,
//     collectionId
//   );

//   await Promise.all(
//     list.documents.map((doc) =>
//       databases.deleteDocument(
//         appwriteConfig.databaseId!,
//         collectionId,
//         doc.$id
//       )
//     )
//   );
// }

// async function clearStorage(): Promise<void> {
//   const list = await storage.listFiles(appwriteConfig.bucketId!);

//   await Promise.all(
//     list.files.map((file) =>
//       storage.deleteFile(appwriteConfig.bucketId!, file.$id)
//     )
//   );
// }

// async function uploadImageToStorage(imageUrl: string) {
//   const response = await fetch(imageUrl);
//   const blob = await response.blob();

//   const fileObj = {
//     name: imageUrl.split("/").pop() || `file-${Date.now()}.jpg`,
//     type: blob.type,
//     size: blob.size,
//     uri: imageUrl,
//   };

//   const file = await storage.createFile(
//     appwriteConfig.bucketId!,
//     ID.unique(),
//     fileObj
//   );

//   return storage.getFileViewURL(appwriteConfig.bucketId!, file.$id);
// }

// async function seed(): Promise<void> {
//   // 1. Clear all
//   await clearAll(appwriteConfig.categoriesCollectionId!);
//   await clearAll(appwriteConfig.customizationsCollectionId!!);
//   await clearAll(appwriteConfig.menuCustomizationsCollectionId!);
//   await clearStorage();

//   // 2. Create Categories
//   const categoryMap: Record<string, string> = {};
//   for (const cat of data.categories) {
//     const doc = await databases.createDocument(
//       appwriteConfig.databaseId!,
//       appwriteConfig.categoriesCollectionId!,
//       ID.unique(),
//       cat
//     );
//     categoryMap[cat.name] = doc.$id;
//   }

//   // 3. Create Customizations
//   const customizationMap: Record<string, string> = {};
//   for (const cus of data.customizations) {
//     const doc = await databases.createDocument(
//       appwriteConfig.databaseId!,
//       appwriteConfig.customizationsCollectionId!,
//       ID.unique(),
//       {
//         name: cus.name,
//         price: cus.price,
//         type: cus.type,
//       }
//     );
//     customizationMap[cus.name] = doc.$id;
//   }

//   // 4. Create Menu Items
//   const menuMap: Record<string, string> = {};
//   for (const item of data.menu) {
//     const uploadedImage = await uploadImageToStorage(item.image_url);

//     const doc = await databases.createDocument(
//       appwriteConfig.databaseId!,
//       appwriteConfig.menuCollectionId!,
//       ID.unique(),
//       {
//         name: item.name,
//         description: item.description,
//         image_url: uploadedImage,
//         price: item.price,
//         rating: item.rating,
//         calories: item.calories,
//         protein: item.protein,
//         categories: categoryMap[item.category_name],
//       }
//     );

//     menuMap[item.name] = doc.$id;

//     // 5. Create menu_customizations
//     for (const cusName of item.customizations) {
//       await databases.createDocument(
//         appwriteConfig.databaseId!,
//         appwriteConfig.menuCustomizationsCollectionId!,
//         ID.unique(),
//         {
//           menu: doc.$id,
//           customizations: customizationMap[cusName],
//         }
//       );
//     }
//   }

//   console.log("✅ Seeding complete.");
// }

// export default seed;

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
  try {
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
  } catch (error) {
    console.error(`❌ Failed to clear documents in ${collectionId}:`, error);
  }
}

async function clearStorage(): Promise<void> {
  try {
    const list = await storage.listFiles(appwriteConfig.bucketId!);
    await Promise.all(
      list.files.map((file) =>
        storage.deleteFile(appwriteConfig.bucketId!, file.$id)
      )
    );
    console.log("✅ Cleared storage bucket.");
  } catch (error) {
    console.error("❌ Failed to clear storage:", error);
  }
}

async function uploadImageToStorage(imageUrl: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    const fileObj = {
      name: imageUrl.split("/").pop() || `file-${Date.now()}.jpg`,
      type: blob.type,
      size: blob.size,
      uri: imageUrl,
    };

    const file = await storage.createFile(
      appwriteConfig.bucketId!,
      ID.unique(),
      fileObj
    );

    return storage
      .getFileViewURL(appwriteConfig.bucketId!, file.$id)
      .toString();
  } catch (error) {
    console.error("❌ Failed to upload image:", imageUrl, error);
    return null;
  }
}

async function seed(): Promise<void> {
  try {
    console.log("🌱 Starting database seeding...");

    // 1. Clear existing data
    await clearAll(appwriteConfig.categoriesCollectionId!);
    await clearAll(appwriteConfig.customizationsCollectionId!);
    await clearAll(appwriteConfig.menuCollectionId!);
    await clearAll(appwriteConfig.menuCustomizationsCollectionId!);
    await clearStorage();

    // 2. Create categories
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

    // 3. Create customizations
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

    // 4. Create menu items
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

      // 5. Create menu customizations
      for (const cusName of item.customizations) {
        const customizationId = customizationMap[cusName];
        if (!customizationId) {
          console.warn(
            `⚠️ Skipping customization "${cusName}" for ${item.name}`
          );
          continue;
        }

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
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  }
}

export default seed;
