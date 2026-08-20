import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CartItem {
  id: string | number;
  [key: string]: unknown;
}

interface CartState {
  items: CartItem[];
}

const cartSlice = createSlice({
  name: "cart",

  initialState: { items: [] } as CartState,

  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      state.items.push(action.payload);
    },
   RemoveFromCart: (state, action: PayloadAction<string | number>) => {
    state.items=state.items.filter(
      (item)=>item.id !== action.payload);
   },
  },
});

export const { addToCart, RemoveFromCart } = cartSlice.actions;
export default cartSlice.reducer;