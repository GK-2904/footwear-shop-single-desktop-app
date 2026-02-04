import { useEffect, useState } from "react";
import { storageService } from "../services/storage";
import { billingService } from "../services/billingService";
import { useAuth } from "../contexts/AuthContext";
import { Search, Plus, Trash2, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";


/* ================= TYPES ================= */


interface Footwear {
 productId: number;     // ✅ comes from footwear_size_stock.product_id
  brandName: string;     // ✅ from brands table
  category: string;
  type: string;
  color: string;
  size: number;          // ✅ REAL SIZE (IMPORTANT)
  quantity: number;      // ✅ size-wise quantity
  sellingPrice: number;
}

interface CartItem {
  productId: number;
  brandName: string;
  category: string;
  type: string;
  color: string;
  size: number;              // ✅ REQUIRED
  quantity: number;
}

/* ================= COMPONENT ================= */

export function Billing() {
  const { user } = useAuth();

  const [footwear, setFootwear] = useState<Footwear[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [gstPercent, setGstPercent] = useState(5);
  const [discountPercent, setDiscountPercent] = useState(0);
  const navigate = useNavigate();


  /* ================= LOAD FOOTWEAR ================= */

  useEffect(() => {
    loadFootwear();
  }, []);

  const loadFootwear = async () => {
  try {
    const list = await storageService.getSizeStock();

    const mapped: Footwear[] = list.map((s: any) => ({
      productId: s.product.id,
      brandName: s.product.brand.name,
      category: s.product.category,
      type: s.product.type,
      color: s.product.color,
      size: s.size,
      quantity: s.quantity,
      sellingPrice: s.sellingPrice,
    }));

    setFootwear(mapped.filter(f => f.quantity > 0));
  } catch (error) {
    console.error("Failed to load footwear", error);
  }
};


  /* ================= CART LOGIC ================= */

  const addToCart = (item: Footwear) => {
  const existing = cartItems.find(
    c => c.productId === item.productId && c.size === item.size
  );

  if (existing) {
    if (existing.quantity >= item.quantity) {
      alert("Not enough stock");
      return;
    }

    setCartItems(cartItems.map(c =>
      c.productId === item.productId && c.size === item.size
        ? { ...c, quantity: c.quantity + 1 }
        : c
    ));
  } else {
    setCartItems([
      ...cartItems,
      {
        productId: item.productId,
        brandName: item.brandName,
        category: item.category,
        type: item.type,
        color: item.color,
        size: item.size,
        quantity: 1
      }
    ]);
  }
};


  const removeFromCart = (productId: number, size: number) => {
    setCartItems(
      cartItems.filter(c => !(c.productId === productId && c.size === size))
    );
  };

  /* ================= CALCULATIONS ================= */

 const subtotal = cartItems.reduce((sum, item) => {
  const stockItem = footwear.find(
    f => f.productId === item.productId && f.size === item.size
  );
  return sum + (stockItem ? stockItem.sellingPrice * item.quantity : 0);
}, 0);


  const gstAmount = (subtotal * gstPercent) / 100;
  const discountAmount = (subtotal * discountPercent) / 100;
  const finalAmount = subtotal + gstAmount - discountAmount;

  /* ================= GENERATE BILL ================= */

 const generateBill = async () => {
  if (!cartItems.length) {
    alert("Cart is empty");
    return;
  }

  const billRequest = {
    ownerName: user?.name || "Admin",
    gstPercentage: gstPercent,
    items: cartItems.map(item => {
      const stockItem = footwear.find(
        f => f.productId === item.productId && f.size === item.size
      );

      const price = stockItem?.sellingPrice ?? 0;
      const total = price * item.quantity;

      return {
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
        price: price.toString(),   // ✅ FIX HERE
        total: total.toString()     // ✅ REQUIRED
      };
    })
  };

  console.log("BILL REQUEST =>", billRequest);

 try {
  const response = await billingService.generateBill(billRequest);

  // response = { id: 22, ownerName, gstPercentage, ... }
  navigate(`/invoice/${response.id}`);

  setCartItems([]);
  loadFootwear();
} catch (error) {
  console.error("Billing error:", error);
  alert("Failed to generate bill ❌");
}

};


  /* ================= FILTER ================= */

  const filteredFootwear = footwear.filter(item => {
    const s = searchTerm.toLowerCase();
    return (
      item.brandName.toLowerCase().includes(s) ||
      item.type.toLowerCase().includes(s) ||
      item.color.toLowerCase().includes(s) ||
      item.size.toString().includes(s)
    );
  });

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Billing / POS</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PRODUCTS */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Select Items</h2>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search footwear by brand, type, color, size..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFootwear.map(item => (
              <div key={`${item.productId}-${item.size}`} className="border rounded-lg p-4">
                <div className="flex justify-between mb-1">
                  <h3 className="font-semibold">{item.brandName}</h3>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {item.quantity} in stock
                  </span>
                </div>

                <p className="text-sm text-gray-600">
                  {item.category} - {item.type}
                </p>
                <p className="text-sm text-gray-600">
                  Size {item.size} | Color {item.color}
                </p>

                <span className="text-lg font-bold">₹{item.sellingPrice}</span>

                <button
                  onClick={() => addToCart(item)}
                  className="w-full mt-3 bg-slate-800 text-white py-2 rounded hover:bg-slate-700 flex justify-center gap-2"
                >
                  
                  <Plus size={16} /> Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CART + SUMMARY */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart />
              <h2 className="text-xl font-semibold">Cart</h2>
            </div>

            {cartItems.length === 0 ? (
              <p className="text-center text-gray-500">Cart is empty</p>
            ) : (
              cartItems.map(item => (
                <div key={`${item.productId}-${item.size}`} className="border-b pb-3 mb-3">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.brandName}</p>
                      <p className="text-xs text-gray-600">
                        {item.category} - {item.type} | Size {item.size}
                      </p>
                    </div>
                    <button onClick={() => removeFromCart(item.productId, item.size)}>
                      <Trash2 className="text-red-600 w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span>Qty: {item.quantity}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Bill Summary</h2>

            <input
              type="number"
              value={gstPercent}
              onChange={e => setGstPercent(+e.target.value || 0)}
              className="w-full border p-2 rounded mb-3"
              placeholder="GST (%)"
            />

            <input
              type="number"
              value={discountPercent}
              onChange={e => setDiscountPercent(+e.target.value || 0)}
              className="w-full border p-2 rounded mb-4"
              placeholder="Discount (%)"
            />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST ({gstPercent}%)</span>
                <span>₹{gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Final Amount</span>
                <span>₹{finalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={generateBill}
              disabled={!cartItems.length}
              className={`w-full mt-5 py-3 rounded font-semibold ${
                cartItems.length
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-300 text-gray-600 cursor-not-allowed"
              }`}
            >
              Generate Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
