import { db } from "@/configs/firebaseConfig";
import { CollectionNames, MoodType, PostType } from "@/constants/AppEnums";
import { addDoc, collection, doc, setDoc, Timestamp } from "firebase/firestore";

export const seedDatabase = async () => {
  try {
    console.log("Starting seed...");

    // 1. Seed Users (Potential Connections)
    const dummyUsers = [
      {
        uid: "user_1",
        email: "solar@vibeswipe.world",
        averageMood: 4.5,
        lastMood: MoodType.EXCITED,
        isAnonymousProfile: true,
        anonymousAlias: "Solar Flare",
      },
      {
        uid: "user_2",
        email: "rain@vibeswipe.world",
        averageMood: 2.1,
        lastMood: MoodType.SAD,
        isAnonymousProfile: true,
        anonymousAlias: "Midnight Rain",
      },
      {
        uid: "user_3",
        email: "zen@vibeswipe.world",
        averageMood: 3.8,
        lastMood: MoodType.NEUTRAL,
        isAnonymousProfile: false,
        anonymousAlias: "Zen Garden",
      },
      {
        uid: "user_4",
        email: "chaos@vibeswipe.world",
        averageMood: 1.5,
        lastMood: MoodType.STRESSED,
        isAnonymousProfile: true,
        anonymousAlias: "Chaos Theory",
      },
    ];

    for (const u of dummyUsers) {
      try {
        await setDoc(doc(db, CollectionNames.USERS, u.uid), u);
      } catch (e) {
        console.warn(`Skipping user seed (likely permission error): ${u.uid}`);
      }
    }
    console.log("Seeded Users (if permissions allowed)");

    // 2. Seed Posts (Wall)
    const dummyPosts = [
      {
        userId: "user_1",
        content: "Just shipped a new feature! Feeling electric ⚡️",
        mood: MoodType.EXCITED,
        mediaType: PostType.TEXT,
        createdAt: Timestamp.now(),
        reactions: 12,
        commentCount: 4,
        isAnonymous: true,
      },
      {
        userId: "user_2",
        content: "Sometimes the quiet is too loud...",
        mood: MoodType.SAD,
        mediaType: PostType.TEXT,
        createdAt: Timestamp.now(), // Real app would offset this
        reactions: 5,
        commentCount: 2,
        isAnonymous: true,
      },
      {
        userId: "user_3",
        content: "Morning meditation complete. inner peace is a journey.",
        mood: MoodType.HAPPY,
        mediaType: PostType.TEXT,
        createdAt: Timestamp.now(),
        reactions: 22,
        commentCount: 0,
        isAnonymous: false,
      },
    ];

    for (const p of dummyPosts) {
      await addDoc(collection(db, CollectionNames.POSTS), p);
    }
    console.log("Seeded Posts");

    console.log("Database Seeded Successfully!");
    alert("Database seeded! Please refresh the app.");
  } catch (error) {
    console.error("Error seeding database:", error);
    alert("Error seeding database check console.");
  }
};
