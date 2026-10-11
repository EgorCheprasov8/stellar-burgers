import type { RootState } from '../store';
import type { TIngredient, TOrder } from '@utils-types';

/* Ингредиенты */
export const selectIngredients = (state: RootState): TIngredient[] =>
  state.ingredients.items;
export const selectIngredientsLoading = (state: RootState): boolean =>
  state.ingredients.isLoading;
export const selectIngredientsError = (
  state: RootState
): RootState['ingredients']['error'] => state.ingredients.error;
export const selectIngredientById =
  (id: string | undefined) =>
  (state: RootState): TIngredient | undefined =>
    state.ingredients.items.find((item) => item._id === id);

/* Конструктор */
export const selectConstructorItems = (
  state: RootState
): RootState['burgerConstructor'] => state.burgerConstructor;

/* Оформление заказа */
export const selectOrderRequest = (state: RootState): boolean =>
  state.order.orderRequest;
export const selectOrderModalData = (state: RootState): TOrder | null =>
  state.order.orderModalData;

/* Лента заказов */
export const selectFeed = (state: RootState): RootState['feed'] => state.feed;
export const selectFeedOrders = (state: RootState): TOrder[] => state.feed.orders;

/* История заказов пользователя */
export const selectUserOrders = (state: RootState): TOrder[] => state.userOrders.orders;

/* Заказ по номеру: сначала ищем в уже загруженных списках, потом в отдельно запрошенном */
export const selectOrderByNumber =
  (orderNumber: number) =>
  (state: RootState): TOrder | null =>
    state.feed.orders.find((order) => order.number === orderNumber) ??
    state.userOrders.orders.find((order) => order.number === orderNumber) ??
    (state.order.viewedOrder?.number === orderNumber ? state.order.viewedOrder : null);

/* Пользователь */
export const selectUser = (state: RootState): RootState['user']['user'] =>
  state.user.user;
export const selectIsAuthChecked = (state: RootState): boolean =>
  state.user.isAuthChecked;
export const selectAuthError = (state: RootState): string | null => state.user.authError;
export const selectUpdateUserError = (state: RootState): string | null =>
  state.user.updateError;
