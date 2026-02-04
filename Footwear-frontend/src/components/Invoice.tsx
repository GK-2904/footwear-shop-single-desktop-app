import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export function Invoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState<any>(null);

  useEffect(() => {
    fetch(`http://localhost:8080/api/bills/${id}`)
      .then(res => res.json())
      .then(data => setBill(data))
      .catch(err => console.error("Failed to load bill", err));
  }, [id]);

  if (!bill) return <p className="p-6">Loading invoice...</p>;

  return (
    <div className="p-10 bg-gray-100 min-h-screen">
      <div className="bg-white p-8 rounded shadow max-w-3xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">Invoice</h1>
          <div className="space-x-2">
            <button
              onClick={() => window.print()}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Print
            </button>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>

        {/* BILL INFO */}
        <p><b>Bill ID:</b> {bill.id}</p>
        <p><b>Owner:</b> {bill.ownerName}</p>
        <p><b>Date:</b> {bill.billDate}</p>
        <p><b>Time:</b> {bill.billTime}</p>

        <hr className="my-4" />

        {/* ITEMS TABLE */}
        <table className="w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Product</th>
              <th>Size</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {bill.items.map((item: any, index: number) => (
              <tr
                key={`${item.productId}-${item.size}-${index}`}
                className="text-center border-t"
              >
                <td className="p-2">{item.productName}</td>
                <td>{item.size}</td>
                <td>{item.quantity}</td>
                <td>₹{item.price}</td>
                <td>₹{item.total}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* TOTALS */}
        <div className="text-right mt-4">
          <p>Subtotal: ₹{bill.subTotal}</p>
          <p>GST ({bill.gstPercentage}%): ₹{bill.gstAmount}</p>
          <h2 className="text-xl font-bold">
            Final Amount: ₹{bill.totalAmount}
          </h2>
        </div>
      </div>
    </div>
  );
}
