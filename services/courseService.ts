import { Course, RandomUser, RawProduct } from "@/types";
import api from "./api";

// Beautiful course category images from Unsplash (reliable, no auth needed)
const CATEGORY_IMAGES: Record<string, string[]> = {
  smartphones: [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80",
    "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&q=80",
  ],
  laptops: [
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80",
  ],
  fragrances: [
    "https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&q=80",
    "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&q=80",
  ],
  skincare: [
    "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80",
    "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80",
  ],
  groceries: [
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80",
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80",
  ],
  beauty: [
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80",
    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80",
  ],
  furniture: [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
    "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&q=80",
  ],
  tops: [
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80",
    "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80",
  ],
  womens: [
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
  ],
  mens: [
    "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&q=80",
    "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80",
  ],
  default: [
    "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&q=80",
    "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=600&q=80",
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80",
    "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&q=80",
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80",
    "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=600&q=80",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80",
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80",
  ],
};

function getImageForCourse(category: string, index: number): string {
  const key = category?.toLowerCase() || "default";
  const matched = Object.keys(CATEGORY_IMAGES).find((k) => key.includes(k));
  const images = matched ? CATEGORY_IMAGES[matched] : CATEGORY_IMAGES.default;
  return images[index % images.length];
}

export const courseService = {
  async fetchCourses(page = 1, limit = 10): Promise<Course[]> {
    const [productsRes, usersRes] = await Promise.all([
      api.get(`/api/v1/public/randomproducts?page=${page}&limit=${limit}`),
      api.get(`/api/v1/public/randomusers?page=1&limit=${limit}`),
    ]);

    const products: RawProduct[] = productsRes.data?.data?.data || [];
    const users: RandomUser[] = usersRes.data?.data?.data || [];

    return products
      .map((product: any, index: number) => {
        const rawId = product._id || product.id || product.productId;
        const id = String(rawId || `product-${page}-${index}`);
        const category = product.category || "development";

        // Always use our reliable image — ignore broken API thumbnails
        const thumbnail = getImageForCourse(
          category,
          index + (page - 1) * limit,
        );

        const instructor = users[index % Math.max(users.length, 1)];
        const instructorAvatar =
          instructor?.picture?.medium ||
          `https://api.dicebear.com/7.x/avataaars/png?seed=${index}`;

        return {
          id,
          title: product.title || "Untitled Course",
          description:
            product.description ||
            "Master this subject with expert guidance and hands-on projects.",
          price: product.price || 0,
          thumbnail,
          category,
          stock: product.stock || Math.floor(Math.random() * 50) + 10,
          rating: product.rating || 4.2 + Math.random() * 0.7,
          instructorId: instructor?.login?.uuid || `user-${index}`,
          instructorName: instructor
            ? `${instructor.name.first} ${instructor.name.last}`
            : "Expert Instructor",
          instructorAvatar,
        };
      })
      .filter((c) => c.id && !c.id.includes("undefined"));
  },

  async fetchCourseById(id: string): Promise<Course | null> {
    try {
      const [productRes, usersRes] = await Promise.all([
        api.get(`/api/v1/public/randomproducts/${id}`),
        api.get(`/api/v1/public/randomusers?page=1&limit=1`),
      ]);

      const product: any = productRes?.data?.data;
      if (!product) return null;

      const users: RandomUser[] = usersRes.data?.data?.data || [];
      const instructor = users[0];
      const rawId = product._id || product.id || id;
      const category = product.category || "development";

      return {
        id: String(rawId),
        title: product.title || "Untitled Course",
        description:
          product.description || "Master this subject with expert guidance.",
        price: product.price || 0,
        thumbnail: getImageForCourse(
          category,
          parseInt(String(rawId).slice(-2), 16) || 0,
        ),
        category,
        stock: product.stock || 25,
        rating: product.rating || 4.5,
        instructorId: instructor?.login?.uuid || "unknown",
        instructorName: instructor
          ? `${instructor.name.first} ${instructor.name.last}`
          : "Expert Instructor",
        instructorAvatar:
          instructor?.picture?.large ||
          `https://api.dicebear.com/7.x/avataaars/png?seed=instructor`,
      };
    } catch {
      return null;
    }
  },
};
