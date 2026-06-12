import { useEffect, useState } from "react";
import { storageService } from "../services/storage";
import { Search, Plus, Trash2, ShoppingCart, CreditCard, Receipt } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PAYMENT_MODES } from "../constants/productOptions";

interface StockRow {
  stockId: number;
  productId: number;
  brandName: string;
  subBrand: string;
  article: string;
  category: string;
  type: string;
  color: string;
  size: number;
  quantity: number;
  mrp: number;
  purchasePrice: number;
  sellingPrice: number;
  stockStatus: string;
}

interface CartItem {
  stockId: number;
  productId: number;
  brandName: string;
  subBrand: string;
  article: string;
  category: string;
  type: string;
  color: string;
  size: number;
  quantity: number;
  mrp: number;
  purchasePrice: number;
  defaultSellingPrice: number;
  actualUnitPrice: number;
  maxQty: number;
}

export function Billing() {
  const [footwear, setFootwear] = useState<StockRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [manualSubTotal, setManualSubTotal] = useState<number | null>(null);
  const [includeReadyForSale, setIncludeReadyForSale] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { loadFootwear(); }, [includeReadyForSale]);

  const loadFootwear = async () => {
    try {
      const [active, ready] = await Promise.all([
        storageService.getSizeStock("ACTIVE"),
        includeReadyForSale ? storageService.getSizeStock("READY_FOR_SALE") : Promise.resolve([]),
      ]);
      const seen = new Set<number>();
      const list = [...active, ...ready].filter((s: any) => {
        if (!s.id || seen.has(s.id)) return false;
        seen.add(s.id);
        return true;
      });
      const mapped: StockRow[] = list.map((s: any) => ({
        stockId: s.id,
        productId: s.product.id,
        brandName: s.product.brand?.name || "",
        subBrand: s.product.subBrand || "",
        article: s.product.article || "",
        category: s.product.category || "",
        type: s.product.type || "",
        color: s.product.color || "",
        size: s.size,
        quantity: s.quantity,
        mrp: Number(s.mrp || s.sellingPrice),
        purchasePrice: Number(s.purchasePrice || 0),
        sellingPrice: Number(s.sellingPrice),
        stockStatus: s.stockStatus || "ACTIVE",
      }));
      setFootwear(mapped.filter((f) => f.quantity > 0));
    } catch (error) {
      console.error("Failed to load footwear", error);
    }
  };

  const addToCart = (item: StockRow) => {
    const existing = cartItems.find((c) => c.productId === item.productId && c.size === item.size);
    if (existing) {
      if (existing.quantity >= item.quantity) { alert("Not enough stock"); return; }
      setCartItems(cartItems.map((c) =>
        c.productId === item.productId && c.size === item.size
          ? { ...c, quantity: c.quantity + 1 } : c
      ));
    } else {
      setCartItems([...cartItems, {
        stockId: item.stockId,
        productId: item.productId,
        brandName: item.brandName,
        subBrand: item.subBrand,
        article: item.article,
        category: item.category,
        type: item.type,
        color: item.color,
        size: item.size,
        quantity: 1,
        mrp: item.mrp,
        purchasePrice: item.purchasePrice,
        defaultSellingPrice: item.sellingPrice,
        actualUnitPrice: item.sellingPrice,
        maxQty: item.quantity,
      }]);
    }
  };

  const removeFromCart = (productId: number, size: number) => {
    setCartItems(cartItems.filter((c) => !(c.productId === productId && c.size === size)));
    setManualSubTotal(null);
  };

  const updateCartPrice = (productId: number, size: number, price: number) => {
    setCartItems(cartItems.map((c) =>
      c.productId === productId && c.size === size ? { ...c, actualUnitPrice: price } : c
    ));
    setManualSubTotal(null);
  };

  const updateCartQty = (productId: number, size: number, qty: number) => {
    setCartItems(cartItems.map((c) => {
      if (c.productId === productId && c.size === size) {
        const q = Math.min(Math.max(1, qty), c.maxQty);
        return { ...c, quantity: q };
      }
      return c;
    }));
    setManualSubTotal(null);
  };

  const calcSubTotal = () => cartItems.reduce((s, i) => s + i.actualUnitPrice * i.quantity, 0);
  const calcTotalMargin = () => cartItems.reduce((s, i) =>
    s + (i.actualUnitPrice - i.purchasePrice) * i.quantity, 0);

  const subtotal = manualSubTotal !== null ? manualSubTotal : calcSubTotal();
  const totalMargin = calcTotalMargin();
  const manualAdjustment = manualSubTotal !== null ? manualSubTotal - calcSubTotal() : 0;

  const generateBill = async () => {
    if (!cartItems.length) { alert("Cart is empty"); return; }
    const billRequest = {
      paymentMode,
      manualAdjustment: manualAdjustment !== 0 ? manualAdjustment : undefined,
      items: cartItems.map((item) => ({
        stockId: item.stockId,
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
        mrp: item.mrp,
        purchasePrice: item.purchasePrice,
        defaultSellingPrice: item.defaultSellingPrice,
        actualUnitPrice: item.actualUnitPrice,
        total: item.actualUnitPrice * item.quantity,
        lineMargin: (item.actualUnitPrice - item.purchasePrice) * item.quantity,
      })),
    };
    try {
      const response = await storageService.addBill(billRequest);
      navigate(`/invoice/${response.id}`);
      setCartItems([]);
      setManualSubTotal(null);
      loadFootwear();
    } catch (error) {
      console.error("Billing error:", error);
      alert(error instanceof Error ? error.message : "Failed to generate bill");
    }
  };

  const filteredFootwear = footwear.filter((item) => {
    const s = searchTerm.toLowerCase();
    return item.brandName.toLowerCase().includes(s) || item.subBrand.toLowerCase().includes(s) ||
      item.article.toLowerCase().includes(s) || item.type.toLowerCase().includes(s) ||
      item.color.toLowerCase().includes(s) || item.size.toString().includes(s);
  });

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Counter Sale / POS</h1>
        <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl font-medium text-sm">
          <Receipt className="w-4 h-4" /> Active Session
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
        <div className="lg:col-span-7 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-2">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search brand, article, sub-brand, type, size..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none" />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={includeReadyForSale}
                onChange={(e) => setIncludeReadyForSale(e.target.checked)} />
              Include Ready for Sale (clearance) stock
            </label>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredFootwear.map((item) => (
                <div key={`${item.productId}-${item.size}`}
                  className="bg-white border border-slate-200 rounded-xl p-3 hover:border-indigo-200">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold bg-slate-100 px-2 py-0.5 rounded">Size {item.size}</span>
                    {item.stockStatus === "READY_FOR_SALE" && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Clearance</span>
                    )}
                    <span className="text-xs font-bold">{item.quantity} left</span>
                  </div>
                  <h3 className="font-bold">{item.brandName} {item.subBrand && `· ${item.subBrand}`}</h3>
                  <p className="text-xs text-slate-500">{item.article} · {item.type} · {item.color}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <div className="text-sm">
                      <span className="text-slate-400 line-through mr-1">₹{item.mrp}</span>
                      <span className="font-bold">₹{item.sellingPrice}</span>
                    </div>
                    <button onClick={() => addToCart(item)}
                      className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold">Current Order</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {cartItems.length === 0 ? (
                <p className="text-center text-slate-400 py-8">Cart is empty</p>
              ) : cartItems.map((item) => {
                const lineMargin = (item.actualUnitPrice - item.purchasePrice) * item.quantity;
                return (
                  <div key={`${item.productId}-${item.size}`} className="bg-slate-50 p-3 rounded-xl border text-sm space-y-2">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-bold">{item.brandName} · {item.article}</p>
                        <p className="text-xs text-slate-500">{item.type} | Size {item.size}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.productId, item.size)}
                        className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>MRP: <span className="font-medium">₹{item.mrp}</span></div>
                      <div>Default: <span className="font-medium">₹{item.defaultSellingPrice}</span></div>
                      <div>Purchase: <span className="font-medium text-slate-500">₹{item.purchasePrice}</span></div>
                      <div>Margin: <span className="font-bold text-emerald-600">₹{lineMargin.toFixed(0)}</span></div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <label className="text-xs">Qty</label>
                      <input type="number" min={1} max={item.maxQty} value={item.quantity}
                        onChange={(e) => updateCartQty(item.productId, item.size, Number(e.target.value))}
                        className="w-16 border rounded px-2 py-1" />
                      <label className="text-xs ml-2">Sale Price ₹</label>
                      <input type="number" value={item.actualUnitPrice}
                        onChange={(e) => updateCartPrice(item.productId, item.size, Number(e.target.value))}
                        className="flex-1 border rounded px-2 py-1 font-bold text-indigo-700" />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-4 bg-slate-900 text-white space-y-3">
              <div className="flex gap-4">
                {PAYMENT_MODES.map((m) => (
                  <label key={m} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input type="radio" name="payment" value={m} checked={paymentMode === m}
                      onChange={() => setPaymentMode(m)} />
                    {m}
                  </label>
                ))}
              </div>
              <div className="flex justify-between text-sm text-slate-300">
                <span>Calculated Subtotal</span><span>₹{calcSubTotal().toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 whitespace-nowrap">Manual Subtotal ₹</label>
                <input type="number" placeholder="Override total"
                  value={manualSubTotal ?? ""}
                  onChange={(e) => setManualSubTotal(e.target.value ? Number(e.target.value) : null)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm" />
              </div>
              <div className="flex justify-between text-emerald-400 text-sm">
                <span>Total Margin</span><span>₹{totalMargin.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-end border-t border-slate-700 pt-3">
                <span className="text-slate-400">Payable Amount</span>
                <span className="text-3xl font-bold">₹{subtotal.toFixed(2)}</span>
              </div>
              <button onClick={generateBill} disabled={!cartItems.length}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                <CreditCard className="w-5 h-5" /> Complete Sale ({paymentMode})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
