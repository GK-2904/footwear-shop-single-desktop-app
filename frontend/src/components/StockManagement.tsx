import { useState, useEffect } from "react";
import { storageService } from "../services/storage";
import { Plus, Edit, Trash2, MapPin, X } from "lucide-react";
import { CATEGORIES, KIDS_SUB, FOOTWEAR_TYPES, STOCK_STATUSES } from "../constants/productOptions";
import { Stock, Brand } from "../types/models";

const emptyForm = {
  brandId: "", subBrand: "", article: "", category: "", kidsSubCategory: "",
  type: "", size: "", color: "", section: "", rack: "", shelf: "",
  purchasePrice: 0, mrp: 0, sellingPrice: 0, quantity: 0, stockStatus: "ACTIVE",
};

export function StockManagement() {
  const [footwear, setFootwear] = useState<Stock[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [products, brandsData] = await Promise.all([
      storageService.getSizeStock(),
      storageService.getBrands(),
    ]);
    setFootwear(products || []);
    setBrands((Array.isArray(brandsData) ? brandsData : []) as Brand[]);
  };

  const margin = formData.sellingPrice - formData.purchasePrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await storageService.updateStock(editingId, {
        size: Number(formData.size),
        purchasePrice: formData.purchasePrice,
        mrp: formData.mrp,
        sellingPrice: formData.sellingPrice,
        quantity: formData.quantity,
        stockStatus: formData.stockStatus,
        section: formData.section,
        rack: formData.rack,
        shelf: formData.shelf,
      });
    } else {
      const product = await storageService.addFootwear({
        brandId: Number(formData.brandId),
        subBrand: formData.subBrand,
        article: formData.article,
        category: formData.category,
        kidsSubCategory: formData.category === "Kids" ? formData.kidsSubCategory : undefined,
        type: formData.type,
        color: formData.color,
        section: formData.section,
        rack: formData.rack,
        shelf: formData.shelf,
      });
      if (!product?.id) throw new Error("Product ID not returned");
      await storageService.addStock({
        product: { id: product.id },
        size: Number(formData.size),
        quantity: Number(formData.quantity),
        purchasePrice: Number(formData.purchasePrice),
        mrp: Number(formData.mrp),
        sellingPrice: Number(formData.sellingPrice),
        stockStatus: formData.stockStatus,
        section: formData.section,
        rack: formData.rack,
        shelf: formData.shelf,
      });
    }
    resetForm();
    loadData();
  };

  const handleEdit = (item: Stock) => {
    setFormData({
      brandId: String(item.product.brand?.id || ""),
      subBrand: item.product.subBrand || "",
      article: item.product.article || "",
      category: item.product.category || "",
      kidsSubCategory: item.product.kidsSubCategory || "",
      type: item.product.type || "",
      size: String(item.size),
      color: item.product.color || "",
      section: item.section || "",
      rack: item.rack || "",
      shelf: item.shelf || "",
      purchasePrice: Number(item.purchasePrice),
      mrp: Number(item.mrp || 0),
      sellingPrice: Number(item.sellingPrice),
      quantity: item.quantity,
      stockStatus: item.stockStatus || "ACTIVE",
    });
    setEditingId(item.id!);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this stock item?")) {
      await storageService.deleteStock(id);
      loadData();
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Stock Management</h1>
        <button onClick={() => setShowForm(true)} className="bg-slate-800 text-white px-4 py-2 rounded-lg flex gap-2">
          <Plus size={18} /> Add Stock
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-lg border">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold">{editingId ? "Edit Stock" : "Add Stock"}</h2>
            <X className="cursor-pointer" onClick={resetForm} />
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Brand</label>
              <select required disabled={editingId !== null} value={formData.brandId}
                onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                className="w-full border p-2 rounded">
                <option value="">Select Brand</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Sub Brand</label>
              <input type="text" disabled={editingId !== null} value={formData.subBrand}
                onChange={(e) => setFormData({ ...formData, subBrand: e.target.value })}
                className="w-full border p-2 rounded" placeholder="e.g. Campus" />
            </div>
            <div>
              <label className="text-sm font-medium">Article</label>
              <input type="text" disabled={editingId !== null} value={formData.article}
                onChange={(e) => setFormData({ ...formData, article: e.target.value })}
                className="w-full border p-2 rounded" placeholder="e.g. ART-1024" required />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <select required disabled={editingId !== null} value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value, kidsSubCategory: "" })}
                className="w-full border p-2 rounded">
                <option value="">Select</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {formData.category === "Kids" && (
              <div>
                <label className="text-sm font-medium">Kids (Boys / Girls)</label>
                <select required disabled={editingId !== null} value={formData.kidsSubCategory}
                  onChange={(e) => setFormData({ ...formData, kidsSubCategory: e.target.value })}
                  className="w-full border p-2 rounded">
                  <option value="">Select</option>
                  {KIDS_SUB.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Type</label>
              <select required disabled={editingId !== null} value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full border p-2 rounded">
                <option value="">Select Type</option>
                {FOOTWEAR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Size</label>
              <input type="text" required value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="w-full border p-2 rounded" placeholder="e.g. 7" />
            </div>
            <div>
              <label className="text-sm font-medium">Color</label>
              <input type="text" required disabled={editingId !== null} value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="text-sm font-medium">Section</label>
              <input type="text" required value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="text-sm font-medium">Rack</label>
              <input type="text" required value={formData.rack}
                onChange={(e) => setFormData({ ...formData, rack: e.target.value })}
                className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="text-sm font-medium">Shelf</label>
              <input type="text" required value={formData.shelf}
                onChange={(e) => setFormData({ ...formData, shelf: e.target.value })}
                className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="text-sm font-medium">Purchase Price (₹)</label>
              <input type="number" required value={formData.purchasePrice || ""}
                onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="text-sm font-medium">MRP (₹)</label>
              <input type="number" required value={formData.mrp || ""}
                onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="text-sm font-medium">Selling Price (₹)</label>
              <input type="number" required value={formData.sellingPrice || ""}
                onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="text-sm font-medium">Margin (₹)</label>
              <input type="text" readOnly value={`₹${margin.toFixed(2)}`}
                className="w-full border p-2 rounded bg-slate-50 text-emerald-700 font-semibold" />
            </div>
            <div>
              <label className="text-sm font-medium">Quantity</label>
              <input type="number" required value={formData.quantity || ""}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full border p-2 rounded" />
            </div>
            {editingId && (
              <div>
                <label className="text-sm font-medium">Stock Status</label>
                <select value={formData.stockStatus}
                  onChange={(e) => setFormData({ ...formData, stockStatus: e.target.value })}
                  className="w-full border p-2 rounded">
                  {STOCK_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            )}
            <div className="md:col-span-3 flex gap-3 mt-2">
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded">
                {editingId ? "Update" : "Save"}
              </button>
              <button type="button" onClick={resetForm} className="bg-gray-300 px-6 py-2 rounded">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase">
              {["Brand", "Sub Brand", "Article", "Category", "Type", "Size", "Color", "Location",
                "Purchase", "MRP", "Selling", "Margin", "Qty", "Status", "Actions"].map((h) => (
                <th key={h} className="p-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {footwear.map((item) => {
              const m = Number(item.sellingPrice) - Number(item.purchasePrice);
              return (
                <tr key={item.id} className="border-t">
                  <td className="p-2">{item.product.brand?.name}</td>
                  <td className="p-2">{item.product.subBrand || "-"}</td>
                  <td className="p-2">{item.product.article || "-"}</td>
                  <td className="p-2">{item.product.category}{item.product.kidsSubCategory ? ` (${item.product.kidsSubCategory})` : ""}</td>
                  <td className="p-2">{item.product.type}</td>
                  <td className="p-2">{item.size}</td>
                  <td className="p-2">{item.product.color}</td>
                  <td className="p-2 flex items-center gap-1"><MapPin size={12} />{item.section}-{item.rack}-{item.shelf}</td>
                  <td className="p-2">₹{item.purchasePrice}</td>
                  <td className="p-2">₹{item.mrp || "-"}</td>
                  <td className="p-2 font-semibold">₹{item.sellingPrice}</td>
                  <td className="p-2 text-emerald-600">₹{m.toFixed(0)}</td>
                  <td className="p-2">{item.quantity}</td>
                  <td className="p-2"><span className={`px-2 py-0.5 rounded text-xs ${item.stockStatus === "READY_FOR_SALE" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}`}>{item.stockStatus || "ACTIVE"}</span></td>
                  <td className="p-2 flex gap-2">
                    <Edit size={16} className="cursor-pointer text-blue-600" onClick={() => handleEdit(item)} />
                    <Trash2 size={16} className="cursor-pointer text-red-600" onClick={() => handleDelete(item.id!)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
