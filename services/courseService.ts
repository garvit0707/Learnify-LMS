import { API_ENDPOINTS } from "@/constants/api";
import { getAvatarUrl } from "@/constants/avatars";
import { getImageForCategory } from "@/constants/categoryImages";
import { Course, RandomUser, RawProduct } from "@/types";
import api from "./api";

function normalizeCourse(
  product: RawProduct,
  instructor: RandomUser | undefined,
  thumbnail: string,
): Course {
  const rawId = product._id || product.id || product.productId;
  return {
    id: String(rawId || "unknown"),
    title: product.title || "Untitled Course",
    description:
      product.description ||
      "Master this subject with expert guidance and hands-on projects.",
    price: product.price || 0,
    thumbnail,
    category: product.category || "development",
    stock: product.stock || 25,
    rating: product.rating || 4.5,
    instructorId: instructor?.login?.uuid || "unknown",
    instructorName: instructor
      ? `${instructor.name.first} ${instructor.name.last}`
      : "Expert Instructor",
    instructorAvatar:
      instructor?.picture?.medium ||
      instructor?.picture?.large ||
      getAvatarUrl(instructor?.login?.uuid || "instructor"),
  };
}

export const courseService = {
  async fetchCourses(page = 1, limit = 10): Promise<Course[]> {
    const [productsRes, usersRes] = await Promise.all([
      api.get(`${API_ENDPOINTS.randomProducts}?page=${page}&limit=${limit}`),
      api.get(`${API_ENDPOINTS.randomUsers}?page=1&limit=${limit}`),
    ]);

    const products: RawProduct[] = productsRes.data?.data?.data || [];
    const users: RandomUser[] = usersRes.data?.data?.data || [];

    return products
      .map((product, index) => {
        const category = product.category || "development";
        const instructor = users[index % Math.max(users.length, 1)];
        const thumbnail = getImageForCategory(
          category,
          index + (page - 1) * limit,
        );
        return normalizeCourse(product, instructor, thumbnail);
      })
      .filter((c) => c.id && !c.id.includes("undefined"));
  },

  async fetchCourseById(id: string): Promise<Course | null> {
    try {
      const [productRes, usersRes] = await Promise.all([
        api.get(`${API_ENDPOINTS.randomProducts}/${id}`),
        api.get(`${API_ENDPOINTS.randomUsers}?page=1&limit=1`),
      ]);

      const product = productRes?.data?.data;
      if (!product) return null;

      const users: RandomUser[] = usersRes.data?.data?.data || [];
      const thumbnail = getImageForCategory(
        product.category || "development",
        parseInt(String(id).slice(-2), 16) || 0,
      );
      return normalizeCourse(product, users[0], thumbnail);
    } catch {
      return null;
    }
  },
};
