import { useState, useEffect } from "react";
import { storageService } from "../services/storage";
import { Plus, Edit, Trash2, MapPin, X, Search } from "lucide-react";
import { CATEGORIES, KIDS_SUB, FOOTWEAR_TYPES, STOCK_STATUSES } from "../constants/productOptions";
import { Stock, Brand } from "../types/models";
import { ComboBox } from "./ComboBox";

const emptyForm = {
  brandName: "", subBrand: "", article: "", category: "", kidsSubCategory: "",
  type: "", size: "", color: "", section: "", rack: "", shelf: "",
  purchasePrice: 0, mrp: 0, sellingPrice: 0, quantity: 0, stockStatus: "ACTIVE",
};

export function StockManagement() {
  const [footwear, setFootwear] = useState<Stock[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (showForm) {
      setTimeout(() => {
        const firstInput = document.getElementById("brand-select") || document.querySelector("form input, form select");
        if (firstInput instanceof HTMLElement) {
          firstInput.focus();
        }
      }, 50);
    }
  }, [showForm]);

  const loadData = async () => {
    const [products, brandsData] = await Promise.all([
      storageService.getSizeStock(),
      storageService.getBrands(),
    ]);
    setFootwear(products || []);
    setBrands((Array.isArray(brandsData) ? brandsData : []) as Brand[]);
  };

  const margin = formData.sellingPrice - formData.purchasePrice;

  // Extract unique options from current stock for autocomplete suggestions
  const uniqueBrandNames = brands.map(b => b.name).sort();
  const uniqueCategories = Array.from(new Set([
    ...CATEGORIES,
    ...footwear.map(item => item.product.category)
  ])).filter(Boolean).sort();
  const uniqueTypes = Array.from(new Set([
    ...FOOTWEAR_TYPES,
    ...footwear.map(item => item.product.type)
  ])).filter(Boolean).sort();
  const uniqueSubBrands = Array.from(new Set(footwear.map(item => item.product.subBrand))).filter(Boolean).sort();
  const uniqueArticles = Array.from(new Set(footwear.map(item => item.product.article))).filter(Boolean).sort();
  const uniqueSizes = Array.from(new Set(footwear.map(item => String(item.size)))).filter(Boolean).sort((a, b) => Number(a) - Number(b));
  const uniqueColors = Array.from(new Set(footwear.map(item => item.product.color))).filter(Boolean).sort();
  const uniqueSections = Array.from(new Set(footwear.map(item => item.section))).filter(Boolean).sort();
  const uniqueRacks = Array.from(new Set(footwear.map(item => item.rack))).filter(Boolean).sort();
  const uniqueShelves = Array.from(new Set(footwear.map(item => item.shelf))).filter(Boolean).sort();

  // Keyboard navigation focus handlers
  const focusNext = (current: HTMLElement) => {
    const form = current.closest("form");
    if (!form) return;
    const elements = Array.from(
      form.querySelectorAll("input:not([disabled]):not([readonly]), select:not([disabled]), button[type='submit']")
    ) as HTMLElement[];
    const index = elements.indexOf(current);
    if (index >= 0 && index < elements.length - 1) {
      const nextEl = elements[index + 1];
      nextEl.focus();
      if (nextEl instanceof HTMLInputElement) {
        nextEl.select();
      }
    }
  };

  const focusPrev = (current: HTMLElement) => {
    const form = current.closest("form");
    if (!form) return;
    const elements = Array.from(
      form.querySelectorAll("input:not([disabled]):not([readonly]), select:not([disabled]), button[type='submit']")
    ) as HTMLElement[];
    const index = elements.indexOf(current);
    if (index > 0) {
      const prevEl = elements[index - 1];
      prevEl.focus();
      if (prevEl instanceof HTMLInputElement) {
        prevEl.select();
      }
    }
  };

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Tab") {
      return; // Let browser Tab and Shift+Tab work naturally
    }
    const target = e.target as HTMLElement;
    if (target.tagName !== "INPUT" && target.tagName !== "SELECT") {
      return;
    }
    if (e.key === "ArrowRight") {
      // If it's a text input, only shift focus if cursor is at the end of the text
      if (target instanceof HTMLInputElement && target.type !== "number" && target.selectionEnd !== target.value.length) {
        return;
      }
      e.preventDefault();
      focusNext(target);
    } else if (e.key === "ArrowLeft") {
      // If it's a text input, only shift focus if cursor is at the beginning of the text
      if (target instanceof HTMLInputElement && target.type !== "number" && target.selectionStart !== 0) {
        return;
      }
      e.preventDefault();
      focusPrev(target);
    } else if (e.key === "Enter") {
      e.preventDefault();
      focusNext(target);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const actionLabel = editingId ? "update" : "save";
    if (!window.confirm(`Are you sure you want to ${actionLabel} this stock item?`)) {
      return;
    }
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
      // Auto create brand if it's a new brand name typed in ComboBox
      let brandObj = brands.find(b => b.name.toLowerCase() === formData.brandName.toLowerCase());
      let brandId: number;
      if (!brandObj) {
        const newBrand = await storageService.addBrand({ name: formData.brandName });
        brandId = newBrand.id!;
        setBrands(prev => [...prev, newBrand]);
      } else {
        brandId = brandObj.id!;
      }

      const product = await storageService.addFootwear({
        brandId: brandId,
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
      brandName: item.product.brand?.name || "",
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
    if (confirm("Are you sure you want to delete this stock item?")) {
      try {
        await storageService.deleteStock(id);
        loadData();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete stock");
      }
    }
  };

  // Filter stock items based on search term and filters
  const filteredFootwear = footwear.filter((item) => {
    const matchesSearch = !searchTerm ? true : [
      String(item.id),
      item.product.brand?.name,
      item.product.subBrand,
      item.product.article,
      item.product.category,
      item.product.type,
      item.product.color,
      String(item.size),
      item.section,
      item.rack,
      item.shelf
    ].some(field => field && String(field).toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesBrand = filterBrand === "" || item.product.brand?.name === filterBrand;
    const matchesCategory = filterCategory === "" || item.product.category === filterCategory;

    return matchesSearch && matchesBrand && matchesCategory;
  });

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
          <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Brand</label>
              <ComboBox id="brand-select" disabled={editingId !== null} value={formData.brandName}
                onChange={(val) => setFormData({ ...formData, brandName: val })}
                options={uniqueBrandNames} placeholder="e.g. Paragone" required label="Brand" />
            </div>
            <div>
              <label className="text-sm font-medium">Sub Brand</label>
              <ComboBox disabled={editingId !== null} value={formData.subBrand}
                onChange={(val) => setFormData({ ...formData, subBrand: val })}
                options={uniqueSubBrands} placeholder="e.g. Campus" required label="Sub Brand" />
            </div>
            <div>
              <label className="text-sm font-medium">Article</label>
              <ComboBox disabled={editingId !== null} value={formData.article}
                onChange={(val) => setFormData({ ...formData, article: val })}
                options={uniqueArticles} placeholder="e.g. ART-1024" required label="Article" />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <ComboBox disabled={editingId !== null} value={formData.category}
                onChange={(val) => setFormData({ ...formData, category: val, kidsSubCategory: "" })}
                options={uniqueCategories} placeholder="Select Category" required label="Category" />
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
              <ComboBox disabled={editingId !== null} value={formData.type}
                onChange={(val) => setFormData({ ...formData, type: val })}
                options={uniqueTypes} placeholder="Select Type" required label="Type" />
            </div>
            <div>
              <label className="text-sm font-medium">Size</label>
              <ComboBox value={formData.size}
                onChange={(val) => setFormData({ ...formData, size: val })}
                options={uniqueSizes} placeholder="e.g. 7" required label="Size" />
            </div>
            <div>
              <label className="text-sm font-medium">Color</label>
              <ComboBox disabled={editingId !== null} value={formData.color}
                onChange={(val) => setFormData({ ...formData, color: val })}
                options={uniqueColors} placeholder="e.g. Black" required label="Color" />
            </div>
            <div>
              <label className="text-sm font-medium">Section</label>
              <ComboBox value={formData.section}
                onChange={(val) => setFormData({ ...formData, section: val })}
                options={uniqueSections} placeholder="e.g. A" required label="Section" />
            </div>
            <div>
              <label className="text-sm font-medium">Rack</label>
              <ComboBox value={formData.rack}
                onChange={(val) => setFormData({ ...formData, rack: val })}
                options={uniqueRacks} placeholder="e.g. R1" required label="Rack" />
            </div>
            <div>
              <label className="text-sm font-medium">Shelf</label>
              <ComboBox value={formData.shelf}
                onChange={(val) => setFormData({ ...formData, shelf: val })}
                options={uniqueShelves} placeholder="e.g. S1" required label="Shelf" />
            </div>
            <div>
              <label className="text-sm font-medium">Purchase Price (₹)</label>
              <input type="number" required value={formData.purchasePrice || ""}
                onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                onFocus={(e) => e.target.select()}
                className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="text-sm font-medium">MRP (₹)</label>
              <input type="number" required value={formData.mrp || ""}
                onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                onFocus={(e) => e.target.select()}
                className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="text-sm font-medium">Selling Price (₹)</label>
              <input type="number" required value={formData.sellingPrice || ""}
                onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                onFocus={(e) => e.target.select()}
                className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="text-sm font-medium">Margin (₹)</label>
              <input type="text" readOnly value={`₹${margin.toFixed(2)}`}
                className="w-full border p-2 rounded bg-slate-50 text-emerald-700 font-semibold" />
            </div>
            <div>
              <label className="text-sm font-medium">Quantity</label>
              <ComboBox value={String(formData.quantity || "")}
                onChange={(val) => setFormData({ ...formData, quantity: Number(val) })}
                options={["1", "2", "3", "4", "5", "10", "12", "24", "36", "48", "50", "100"]}
                placeholder="e.g. 12" required label="Quantity" />
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

      {/* Real-time Search and Filter Panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search brand, article, category, type, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className="border p-2 rounded-xl text-sm w-full md:w-40 outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
          >
            <option value="">All Brands</option>
            {brands.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border p-2 rounded-xl text-sm w-full md:w-40 outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase">
              {["Stock ID", "Brand", "Sub Brand", "Article", "Category", "Type", "Size", "Color", "Location",
                "Purchase", "MRP", "Selling", "Margin", "Qty", "Status", "Actions"].map((h) => (
                <th key={h} className="p-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredFootwear.map((item) => {
              const m = Number(item.sellingPrice) - Number(item.purchasePrice);
              return (
                <tr key={item.id} className="border-t">
                  <td className="p-2 font-mono text-xs text-slate-500">#{item.id}</td>
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
