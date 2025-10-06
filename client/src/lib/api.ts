export async function apiFetch(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  getBranches: () => apiFetch("/api/branches"),
  getIngredients: () => apiFetch("/api/ingredients"),
  getIngredientStock: (branchId: string) => apiFetch(`/api/ingredients/stock/${branchId}`),
  getExpiringIngredients: (branchId: string, days: number) => 
    apiFetch(`/api/ingredients/expiring/${branchId}/${days}`),
  addIngredientStock: (data: any) => 
    apiFetch("/api/ingredients/stock", { method: "POST", body: JSON.stringify(data) }),
  addIngredientStockBatch: (branchId: string, entries: any[], type: "yesterday" | "today") =>
    apiFetch("/api/ingredients/stock/batch", { 
      method: "POST", 
      body: JSON.stringify({ branchId, entries, type }) 
    }),
  getProducts: () => apiFetch("/api/products"),
  getProductStock: (branchId: string) => apiFetch(`/api/products/stock/${branchId}`),
  submitHourlyCheck: (branchId: string, checks: any[]) =>
    apiFetch("/api/hourly-check", { method: "POST", body: JSON.stringify({ branchId, checks }) }),
  getForecast: (branchId: string) => apiFetch(`/api/forecast/${branchId}`),
  getProductionPlan: (branchId: string) => apiFetch(`/api/production-plan/${branchId}`),
  getStats: (branchId: string) => apiFetch(`/api/stats/${branchId}`),
};
