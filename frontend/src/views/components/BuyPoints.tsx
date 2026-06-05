import CheckoutButton from "./CheckoutButton";


type ProfilePageInfoProps = {
  userId: string;
};

export const BuyPoints = ({userId} : ProfilePageInfoProps)=>{



  return (
    <div className="mx-auto justify-center flex flex-col bg-slate-100 max-w-6xl w-full">
      <div className="items-center justify-center w-full mx-auto auto-rows-min grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
    <CheckoutButton userId={userId} points={50} amount={100}></CheckoutButton>
      <CheckoutButton userId={userId} points={100} amount={180}></CheckoutButton> 
      <CheckoutButton userId={userId} points={200} amount={350}></CheckoutButton> 
      <CheckoutButton userId={userId} points={500} amount={600}></CheckoutButton> 
      </div>
      </div>
  );


}