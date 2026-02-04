import { useState, useEffect } from "react";
import { storageService } from "../services/storage";
import { Plus, Edit, Trash2, MapPin, X } from "lucide-react";

/* ================= TYPES ================= */

interface Brand {
  id: number;
  name: string;
}

interface StockItem {
  id: number;
  size: number;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  section: string;
  rack: string;
  shelf: string;
  product: {
    id: number;
    category: string;
    type: string;
    color: string;
    brand: {
      id: number;
      name: string;
    };
     };
}

/* ================= COMPONENT ================= */

export function StockManagement() {
  const [footwear, setFootwear] = useState<StockItem[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    brandId: "",
    category: "",
    type: "",
    size: "",
    color: "",
    section: "",
    rack: "",
    shelf: "",
    costPrice: 0,
    sellingPrice: 0,
    quantity: 0,
  });

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [products, brands] = await Promise.all([
      storageService.getSizeStock(),
      storageService.getBrands(),
    ]);
    setFootwear(products || []);
    setBrands(brands || []);
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

  

    if (editingId) {
  // update stock
  await storageService.updateStock(editingId, {
    size: formData.size,
    costPrice: formData.costPrice,
    sellingPrice: formData.sellingPrice,
    quantity: formData.quantity,
    section: formData.section,
    rack: formData.rack,
    shelf: formData.shelf,
  });
} else {
  // 1️⃣ create product
 const product = await storageService.addFootwear({
  brandId: Number(formData.brandId),
  category: formData.category,
  type: formData.type,
  color: formData.color,
});

// 🔴 SAFETY CHECK (VERY IMPORTANT)
if (!product?.id) {
  throw new Error("Product ID not returned from backend");
}

 await storageService.addStock({
  product: { id: product.id },   // 🔴 REQUIRED
  size: Number(formData.size),
  quantity: Number(formData.quantity),
  costPrice: Number(formData.costPrice),
  sellingPrice: Number(formData.sellingPrice),
  section: formData.section,
  rack: formData.rack,
  shelf: formData.shelf,
});




}

resetForm();
loadData();

  }


  /* ================= EDIT / DELETE ================= */
const handleEdit = (item: StockItem) => {
  setFormData({
    brandId: String(item.product.brand.id),
    category: item.product.category,
    type: item.product.type,
    size: item.size,
    color: item.product.color,
    section: item.section,
    rack: item.rack,
    shelf: item.shelf,
    costPrice: item.costPrice,
    sellingPrice: item.sellingPrice,
    quantity: item.quantity,
  });

  setEditingId(item.id); // STOCK ID
  setShowForm(true);
};


 const handleDelete = async (id: number) => {
  if (confirm("Delete this stock item?")) {
    await storageService.deleteStock(id);
    loadData();
  }
};


  const resetForm = () => {
    setFormData({
      brandId: "",
      category: "",
      type: "",
      size: "",
      color: "",
      section: "",
      rack: "",
      shelf: "",
      costPrice: 0,
      sellingPrice: 0,
      quantity: 0,
    });
    setEditingId(null);
    setShowForm(false);
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Stock Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-slate-800 text-white px-4 py-2 rounded-lg flex gap-2"
        >
          <Plus size={18} /> Add Stock
        </button>
      </div>

      {/* ================= ADD / EDIT FORM ================= */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg border">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {editingId ? "Edit Stock" : "Add Stock"}
            </h2>
            <X className="cursor-pointer" onClick={resetForm} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {/* BRAND */}
            <div>
              <label className="text-sm font-medium">Brand</label>
              <select
  required
  disabled={editingId !== null}
  value={formData.brandId}
  onChange={(e) =>
    setFormData({ ...formData, brandId: e.target.value })
  }
  className="w-full border p-2 rounded"
>

                <option value="">Select Brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* CATEGORY */}
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
  required
  disabled={editingId !== null}
  value={formData.category}
  onChange={(e) =>
    setFormData({ ...formData, category: e.target.value })
  }
  className="w-full border p-2 rounded"
>

                <option value="">Select Category</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
              </select>
            </div>

            {/* TYPE */}
            <div>
              <label className="text-sm font-medium">Type</label>
              <select
  required
  disabled={editingId !== null}
  value={formData.type}
  onChange={(e) =>
    setFormData({ ...formData, type: e.target.value })
  }
  className="w-full border p-2 rounded"
>

                <option value="">Select Type</option>
                <option value="Sports">Sports</option>
                <option value="Casual">Casual</option>
                <option value="Formal">Formal</option>
                <option value="Sandals">Sandals</option>
                <option value="Slippers">Slippers</option>
              </select>
            </div>

            {/* SIZE */}
            <div>
              <label className="text-sm font-medium">Size</label>
              <input
                type="text"
                placeholder="Eg: 7, 8, 9"
                value={formData.size}
                onChange={(e) =>
                  setFormData({ ...formData, size: e.target.value })
                }
                className="w-full border p-2 rounded"
                required
              />
            </div>

            {/* COLOR */}
            <div>
              <label className="text-sm font-medium">Color</label>
              <input
  type="text"
  placeholder="Eg: Black"
  disabled={editingId !== null}
  value={formData.color}
  onChange={(e) =>
    setFormData({ ...formData, color: e.target.value })
  }
  className="w-full border p-2 rounded"
  required
/>

            </div>

            {/* SECTION */}
            <div>
              <label className="text-sm font-medium">Section</label>
              <input
                type="text"
                placeholder="Eg: A"
                value={formData.section}
                onChange={(e) =>
                  setFormData({ ...formData, section: e.target.value })
                }
                className="w-full border p-2 rounded"
                required
              />
            </div>

            {/* RACK */}
            <div>
              <label className="text-sm font-medium">Rack</label>
              <input
                type="text"
                placeholder="Eg: R1"
                value={formData.rack}
                onChange={(e) =>
                  setFormData({ ...formData, rack: e.target.value })
                }
                className="w-full border p-2 rounded"
                required
              />
            </div>

            {/* SHELF */}
            <div>
              <label className="text-sm font-medium">Shelf</label>
              <input
                type="text"
                placeholder="Eg: S1"
                value={formData.shelf}
                onChange={(e) =>
                  setFormData({ ...formData, shelf: e.target.value })
                }
                className="w-full border p-2 rounded"
                required
              />
            </div>

            {/* COST PRICE */}
            <div>
              <label className="text-sm font-medium">Cost Price (₹)</label>
              <input
                type="number"
                placeholder="Eg: 1200"
                value={formData.costPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    costPrice: Number(e.target.value),
                  })
                }
                className="w-full border p-2 rounded"
                required
              />
            </div>

            {/* SELLING PRICE */}
            <div>
              <label className="text-sm font-medium">Selling Price (₹)</label>
              <input
                type="number"
                placeholder="Eg: 1600"
                value={formData.sellingPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sellingPrice: Number(e.target.value),
                  })
                }
                className="w-full border p-2 rounded"
                required
              />
            </div>

            {/* QUANTITY */}
            <div>
              <label className="text-sm font-medium">Quantity</label>
              <input
                type="number"
                placeholder="Eg: 10"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: Number(e.target.value),
                  })
                }
                className="w-full border p-2 rounded"
                required
              />
            </div>

            {/* BUTTONS */}
            <div className="md:col-span-3 flex gap-3 mt-2">
              <button className="bg-green-600 text-white px-6 py-2 rounded">
                {editingId ? "Update" : "Save"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 px-6 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-lg shadow p-6">
        <table className="min-w-full">
          <thead>
            <tr>
              {[
                "Brand",
                "Category",
                "Type",
                "Size",
                "Color",
                "Location",
                "Cost",
                "Selling",
                "Qty",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left text-xs font-medium text-gray-500 uppercase p-2"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {footwear.map((item) => (
              <tr key={item.id} className="border-t">
                <td>{item.product.brand.name}</td>
                <td>{item.product.category}</td>
                <td>{item.product.type}</td>
                <td>{item.size}</td>
                <td>{item.product.color}</td>

                <td className="flex gap-1 items-center">
                  <MapPin size={14} />
                  {item.section}-{item.rack}-{item.shelf}
                </td>
                <td>₹{item.costPrice}</td>
                <td className="font-semibold">₹{item.sellingPrice}</td>
                <td>{item.quantity}</td>
                <td className="flex gap-2">
                  <Edit
                    size={16}
                    className="cursor-pointer text-blue-600"
                    onClick={() => handleEdit(item)}
                  />
                  <Trash2
                    size={16}
                    className="cursor-pointer text-red-600"
                    onClick={() => handleDelete(item.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
