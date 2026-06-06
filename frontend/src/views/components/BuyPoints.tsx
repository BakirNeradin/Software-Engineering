import CheckoutButton from "./CheckoutButton";


type ProfilePageInfoProps = {
  userId: string;
};

export const BuyPoints = ({userId} : ProfilePageInfoProps)=>{



  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">Market points</h2>
        <p className="mt-1 text-sm text-slate-500">
          Add points for marketplace actions.
        </p>
      </div>
      <div className="grid w-full auto-rows-min grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CheckoutButton userId={userId} points={50} amount={100}></CheckoutButton>
        <CheckoutButton userId={userId} points={100} amount={180}></CheckoutButton>
        <CheckoutButton userId={userId} points={200} amount={350}></CheckoutButton>
        <CheckoutButton userId={userId} points={500} amount={600}></CheckoutButton>
      </div>
    </div>
  );


}