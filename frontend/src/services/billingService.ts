export const billingService = {
  async generateBill(billRequest: any) {
    const res = await fetch("http://localhost:8080/api/bills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(billRequest),
    });

    if (!res.ok) {
      throw new Error("Failed to generate bill");
    }

    return await res.json(); // ✅ returns { id: 22, ... }
  }
};
