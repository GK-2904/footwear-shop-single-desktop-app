import { apiFetch } from "./api";

export interface FinancialYear {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isLocked: boolean;
}

export const financialYearService = {
  async getAll(): Promise<FinancialYear[]> {
    return apiFetch<FinancialYear[]>("/financial-years");
  },

  async getActive(): Promise<FinancialYear> {
    return apiFetch<FinancialYear>("/financial-years/active");
  },

  async create(fy: Partial<FinancialYear>): Promise<FinancialYear> {
    return apiFetch<FinancialYear>("/financial-years", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fy),
    });
  },

  async activate(id: number): Promise<FinancialYear> {
    return apiFetch<FinancialYear>(`/financial-years/${id}/activate`, {
      method: "PUT",
    });
  },
};
