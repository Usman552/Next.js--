"use client";

import { useDispatch, useSelector } from "react-redux";
import { addToCart, RemoveFromCart } from "@/redux/cartSlice";

type Product = {
  id: number;
  name: string;
  price: number;
};

type RootState = {
  cart: {
    items: Product[];
  };
};

const products = [
  {
    id: 1,
    name: "Laptop",
    price: 1000,
  },
  {
    id: 2,
    name: "Phone",
    price: 500,
  },
  {
    id: 3,
    name: "Headphones",
    price: 100,
  },
];

export default function Home() {
  const dispatch = useDispatch();

  const cartItems = useSelector((state: RootState) => state.cart.items);

  return (
    <main className="p-10">
      <h1 className="mb-8 text-3xl font-bold">Products</h1>

      <div className="grid grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="rounded-lg border p-5">
            <h2 className="text-xl font-bold">{product.name}</h2>

            <p className="my-3">${product.price}</p>

            <button
              onClick={() => dispatch(addToCart(product))}
              className="rounded bg-black px-4 py-2 text-white"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-2xl font-bold">Cart</h2>

        {cartItems.map((item: Product) => (
          <div
            key={item.id}
            className="mb-3 flex items-center justify-between border p-4"
          >
            <div>
              <p>{item.name}</p>
              <p>${item.price}</p>
            </div>

            <button
              onClick={() => dispatch(RemoveFromCart(item.id))}
              className="rounded bg-red-500 px-4 py-2 text-white"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
