import { Course, RandomUser, RawProduct } from "@/types";
import api from "./api";

export const courseService = {
  async fetchCourses(page = 1, limit = 10): Promise<Course[]> {
    const [productsRes, usersRes] = await Promise.all([
      api.get(
        `/api/v1/public/randomproducts?page=${page}&limit=${limit}&inc=title,description,price,thumbnail,category,stock,rating`,
      ),
      api.get(`/api/v1/public/randomusers?page=1&limit=${limit}`),
    ]);

    const products: RawProduct[] = productsRes.data?.data?.data || [];
    const users: RandomUser[] = usersRes.data?.data?.data || [];

    return products.map((product, index) => {
      const instructor = users[index % users.length];
      return {
        id: String(product.id),
        title: product.title,
        description: product.description,
        price: product.price,
        thumbnail: product.thumbnail,
        category: product.category,
        stock: product.stock,
        rating: product.rating,
        instructorId: instructor?.login?.uuid || `user-${index}`,
        instructorName: instructor
          ? `${instructor.name.first} ${instructor.name.last}`
          : "Unknown Instructor",
        instructorAvatar: instructor?.picture?.medium || "",
      };
    });
  },

  async fetchCourseById(id: string): Promise<Course | null> {
    try {
      const { data } = await api.get(`/api/v1/public/randomproducts/${id}`);
      const product: RawProduct = data?.data;
      const usersRes = await api.get(
        `/api/v1/public/randomusers?page=1&limit=1`,
      );
      const users: RandomUser[] = usersRes.data?.data?.data || [];
      const instructor = users[0];
      return {
        id: String(product.id),
        title: product.title,
        description: product.description,
        price: product.price,
        thumbnail: product.thumbnail,
        category: product.category,
        stock: product.stock,
        rating: product.rating,
        instructorId: instructor?.login?.uuid || "unknown",
        instructorName: instructor
          ? `${instructor.name.first} ${instructor.name.last}`
          : "Unknown Instructor",
        instructorAvatar: instructor?.picture?.medium || "",
      };
    } catch {
      return null;
    }
  },
};
