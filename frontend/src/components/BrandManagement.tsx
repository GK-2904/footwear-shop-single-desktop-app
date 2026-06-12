import { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { Brand } from '../types';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';

export function BrandManagement() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [brandName, setBrandName] = useState('');

  useEffect(() => {
    loadBrands();
  }, []);

  // ✅ Load brands safely
  const loadBrands = async () => {
    try {
      const data = await storageService.getBrands();
      setBrands(Array.isArray(data) ? data : (data as any)?.data || []);
    } catch (error) {
      console.error('Error loading brands:', error);
      setBrands([]);
    }
  };

  // ✅ ADD / UPDATE BRAND (FIXED PAYLOAD)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!brandName.trim()) {
      alert('Please enter a brand name');
      return;
    }

    try {
      if (editingId) {
        // ✅ update expects object
        await storageService.updateBrand(editingId, { name: brandName });
      } else {
        // ✅ backend generates id & createdAt
        await storageService.addBrand({ name: brandName });
      }

      resetForm();
      loadBrands();
    } catch (error) {
      console.error('Error saving brand:', error);
      alert('Failed to save brand');
    }
  };

  const handleEdit = (brand: Brand) => {
    setBrandName(brand.name);
    setEditingId(brand.id);
    setShowForm(true);
  };

  // ✅ DELETE BRAND (ASYNC + SAFE CHECK)
  const handleDelete = async (id: string) => {
    try {
      const footwear: any[] = await storageService.getFootwear();

      const hasFootwear = Array.isArray(footwear)
        ? footwear.some(f => String(f.brandId) === id || String(f.brand?.id) === id)
        : false;

      if (hasFootwear) {
        alert('Cannot delete brand. It has associated footwear items.');
        return;
      }

      if (confirm('Are you sure you want to delete this brand?')) {
        await storageService.deleteBrand(id);
        loadBrands();
      }
    } catch (error) {
      console.error('Error deleting brand:', error);
      alert('Failed to delete brand');
    }
  };

  const resetForm = () => {
    setBrandName('');
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Brand Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Brand
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? 'Edit Brand' : 'Add New Brand'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand Name
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Enter brand name"
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                {editingId ? 'Update' : 'Add'} Brand
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        {brands.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Tag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No brands added yet</p>
            <p className="text-sm mt-2">Click "Add Brand" to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-slate-800"
              >
                <div className="flex justify-between">
                  <div className="flex items-center gap-3">
                    <Tag className="w-6 h-6 text-slate-800" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{brand.name}</h3>
                      <p className="text-xs text-gray-500">
                        Added:{' '}
                        {(brand as any).createdAt
                          ? new Date((brand as any).createdAt).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(brand)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(brand.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
