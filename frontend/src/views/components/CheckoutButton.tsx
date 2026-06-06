const CheckoutButton = ({ userId, points, amount}: { userId: string, points: number, amount: number }) => {
  const handleCheckout = async () => {
    const response = await fetch(
      "http://localhost:8000/create-checkout-session",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_name: "Premium Listing",
          amount: amount,
          quantity: 1,
          user_id: userId,
          points: points,
        }),
      },
    );

    const data = await response.json();

    if (data.url) {
      window.location.href = data.url;
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className="group w-full max-w-xs overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2"
    >
      <div className="flex items-center justify-between gap-3 p-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Market points
          </p>
          <p className="mt-1 text-base font-bold text-slate-950">{points} points</p>
        </div>

        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-orange-50 text-center text-orange-600 transition group-hover:bg-orange-500 group-hover:text-white">
          <span className="text-lg font-bold leading-none">{points}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-3 py-2.5">
        <span className="text-sm font-semibold text-slate-700">€{amount/100}</span>
        <span className="rounded-full bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white transition group-hover:bg-orange-500">
          Buy now
        </span>
      </div>
    </button>
  );
};

export default CheckoutButton;