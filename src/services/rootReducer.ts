import { combineReducers } from '@reduxjs/toolkit';

import { constructorSlice } from './slices/constructor-slice';
import { feedSlice } from './slices/feed-slice';
import { ingredientsSlice } from './slices/ingredients-slice';
import { orderSlice } from './slices/order-slice';
import { userOrdersSlice } from './slices/user-orders-slice';
import { userSlice } from './slices/user-slice';

export const rootReducer = combineReducers({
  [ingredientsSlice.name]: ingredientsSlice.reducer,
  [constructorSlice.name]: constructorSlice.reducer,
  [orderSlice.name]: orderSlice.reducer,
  [feedSlice.name]: feedSlice.reducer,
  [userOrdersSlice.name]: userOrdersSlice.reducer,
  [userSlice.name]: userSlice.reducer,
});
