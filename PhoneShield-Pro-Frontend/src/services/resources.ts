import { api, toList, unwrap } from "./api";

export interface Identified {
  _id?: string;
  id?: string;
  [key: string]: any;
}

export const idOf = (item: Identified | undefined | null) =>
  String(item?._id ?? item?.id ?? "");

/** Generic REST resource helper — one place for every CRUD call. */
function resource(path: string, listKey: string, singleKey?: string) {
  const key = singleKey || listKey.replace(/s$/, '');
  return {
    list: async (params?: Record<string, any>) => {
      const { data } = await api.get(path, { params });
      return toList<Identified>(data, listKey);
    },
    listRaw: async (params?: Record<string, any>) => {
      const { data } = await api.get(path, { params });
      return data;
    },
    get: async (id: string) => {
      const { data } = await api.get(`${path}/${id}`);
      // Backend returns { success: true, phone: { ... } } or { success: true, data: { ... } }
      return unwrap<Identified>(data, key);
    },
    create: async (payload: any) => {
      const { data } = await api.post(path, payload);
      // Backend returns { success: true, phone: { ... } }
      return unwrap<Identified>(data, key);
    },
    update: async (id: string, payload: any) => {
      const { data } = await api.put(`${path}/${id}`, payload);
      // Backend returns { success: true, phone: { ... } }
      return unwrap<Identified>(data, key);
    },
    remove: async (id: string) => {
      const { data } = await api.delete(`${path}/${id}`);
      return unwrap(data);
    },
  };
}

export const phonesService = resource("/phones", "phones", "phone");
export const sellersService = resource("/sellers", "sellers", "seller");
export const customersService = resource("/customers", "customers", "customer");
export const repairsService = resource("/repairs", "repairs", "repair");
// Invoices are generated, not CRUD - backend has /api/invoice/sale/:id and /api/invoice/repair/:id
export const invoicesService = {
  getSaleInvoice: async (phoneId: string) => {
    const { data } = await api.get(`/invoice/sale/${phoneId}`);
    return data;
  },
  getRepairInvoice: async (repairId: string) => {
    const { data } = await api.get(`/invoice/repair/${repairId}`);
    return data;
  },
};

export const authService = {
  login: async (payload: { email: string; password: string }) => {
    const { data } = await api.post("/auth/login", payload);
    return data;
  },
  me: async () => {
    const { data } = await api.get("/auth/profile");
    // Backend returns { success: true, user: { ... } }
    return unwrap<Identified>(data, "user");
  },
  forgotPassword: async (email: string) => {
    const { data } = await api.post("/auth/forgot-password", { email });
    return data;
  },
  changePassword: async (payload: { currentPassword: string; newPassword: string }) => {
    const { data } = await api.put("/auth/change-password", payload);
    return data;
  },
  updateProfile: async (payload: Record<string, any>) => {
    const { data } = await api.put("/auth/profile", payload);
    return unwrap<Identified>(data);
  },
};

export const dashboardService = {
  stats: async () => {
    const { data } = await api.get("/dashboard");
    // Backend returns { success: true, dashboard: { ... } }
    // Extract the dashboard key if present
    return unwrap<Record<string, any>>(data, "dashboard");
  },
};

export const reportsService = {
  daily: async (params?: Record<string, any>) => {
    const { data } = await api.get("/reports/daily", { params });
    return unwrap<any>(data);
  },
  weekly: async (params?: Record<string, any>) => {
    const { data } = await api.get("/reports/weekly", { params });
    return unwrap<any>(data);
  },
  monthly: async (params?: Record<string, any>) => {
    const { data } = await api.get("/reports/monthly", { params });
    return unwrap<any>(data);
  },
  profit: async (params?: Record<string, any>) => {
    const { data } = await api.get("/reports/profit", { params });
    return unwrap<any>(data);
  },
  repairs: async (params?: Record<string, any>) => {
    const { data } = await api.get("/reports/repairs", { params });
    return unwrap<any>(data);
  },
  inventory: async (params?: Record<string, any>) => {
    const { data } = await api.get("/reports/inventory", { params });
    return unwrap<any>(data);
  },
  topBrands: async (params?: Record<string, any>) => {
    const { data } = await api.get("/reports/top-brands", { params });
    return unwrap<any>(data);
  },
  topSellers: async (params?: Record<string, any>) => {
    const { data } = await api.get("/reports/top-sellers", { params });
    return unwrap<any>(data);
  },
};
