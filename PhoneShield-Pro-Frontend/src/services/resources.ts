import { api, toList, unwrap } from "./api";

export interface Identified {
  _id?: string;
  id?: string;
  [key: string]: any;
}

export const idOf = (item: Identified | undefined | null) =>
  String(item?._id ?? item?.id ?? "");

/** Generic REST resource helper — one place for every CRUD call. */
function resource(path: string, listKey?: string) {
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
      return unwrap<Identified>(data);
    },
    create: async (payload: any) => {
      const { data } = await api.post(path, payload);
      return unwrap<Identified>(data);
    },
    update: async (id: string, payload: any) => {
      const { data } = await api.put(`${path}/${id}`, payload);
      return unwrap<Identified>(data);
    },
    patch: async (id: string, payload: any) => {
      const { data } = await api.patch(`${path}/${id}`, payload);
      return unwrap<Identified>(data);
    },
    remove: async (id: string) => {
      const { data } = await api.delete(`${path}/${id}`);
      return unwrap(data);
    },
  };
}

export const phonesService = resource("/phones", "phones");
export const sellersService = resource("/sellers", "sellers");
export const customersService = resource("/customers", "customers");
export const repairsService = resource("/repairs", "repairs");
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
    return unwrap<Identified>(data);
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
    return unwrap<Record<string, any>>(data);
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
