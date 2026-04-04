import { Course, RandomUser, RawProduct } from "@/types";
import api from "./api";

export const courseService = {
  async fetchCourses(page = 1, limit = 10): Promise<Course[]> {
    const [productsRes, usersRes] = await Promise.all([
      api.get(`/api/v1/public/randomproducts?page=${page}&limit=${limit}`),
      api.get(`/api/v1/public/randomusers?page=1&limit=${limit}`),
    ]);

    const products: RawProduct[] = productsRes.data?.data?.data || [];
    const users: RandomUser[] = usersRes.data?.data?.data || [];

    return products
      .map((product, index) => {
        // freeapi returns _id OR id depending on version — handle both
        const rawId =
          (product as any)._id ||
          (product as any).id ||
          (product as any).productId;
        const id = String(rawId || `product-${index}-${Date.now()}`);

        if (!rawId) {
          console.warn("Product missing id field:", product);
        }

        const instructor = users[index % Math.max(users.length, 1)];
        return {
          id,
          title: product.title || "Untitled Course",
          description: product.description || "No description available.",
          price: product.price || 0,
          thumbnail:
            product.thumbnail || `https://picsum.photos/seed/${id}/400/300`,
          category: product.category || "general",
          stock: product.stock || 0,
          rating: product.rating || 4.5,
          instructorId: instructor?.login?.uuid || `user-${index}`,
          instructorName: instructor
            ? `${instructor.name.first} ${instructor.name.last}`
            : "Expert Instructor",
          instructorAvatar:
            instructor?.picture?.medium ||
            `https://api.dicebear.com/7.x/avataaars/png?seed=${index}`,
        };
      })
      .filter((c) => c.id && c.id !== "undefined");
  },

  async fetchCourseById(id: string): Promise<Course | null> {
    try {
      const [productRes, usersRes] = await Promise.all([
        api.get(`/api/v1/public/randomproducts/${id}`),
        api.get(`/api/v1/public/randomusers?page=1&limit=1`),
      ]);

      const product: RawProduct = productRes?.data?.data;
      if (!product) return null;

      const users: RandomUser[] = usersRes.data?.data?.data || [];
      const instructor = users[0];
      const rawId = (product as any)._id || (product as any).id || id;

      return {
        id: String(rawId),
        title: product.title || "Untitled Course",
        description: product.description || "No description available.",
        price: product.price || 0,
        thumbnail:
          product.thumbnail || `https://picsum.photos/seed/${id}/400/300`,
        category: product.category || "general",
        stock: product.stock || 0,
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
