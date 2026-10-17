import {
  addIngredient,
  clearConstructor,
  constructorSlice,
  moveIngredient,
  removeIngredient,
} from '../constructor-slice';
import { createOrder } from '../order-slice';
import { anotherBun, bun, main, sauce } from './mock-ingredients';

import type {
  TConstructorIngredient,
  TConstructorState,
  TIngredient,
  TOrder,
} from '@utils-types';

const reducer = constructorSlice.reducer;

const initialState: TConstructorState = {
  bun: null,
  ingredients: [],
};

const createConstructorIngredient = (
  ingredient: TIngredient,
  id: string
): TConstructorIngredient => ({
  ...ingredient,
  id,
});

/* Состояние с булкой и тремя начинками — для удаления, перемещения и очистки */
const filledState: TConstructorState = {
  bun: createConstructorIngredient(bun, 'bun-1'),
  ingredients: [
    createConstructorIngredient(main, 'main-1'),
    createConstructorIngredient(sauce, 'sauce-1'),
    createConstructorIngredient(main, 'main-2'),
  ],
};

const order: TOrder = {
  _id: 'order-id',
  status: 'done',
  name: 'Краторный био-марсианский бургер',
  createdAt: '2026-10-15T12:00:00.000Z',
  updatedAt: '2026-10-15T12:00:00.000Z',
  number: 12345,
  ingredients: [bun._id, main._id, bun._id],
};

describe('редьюсер слайса burgerConstructor', () => {
  test('возвращает начальное состояние для неизвестного экшена', () => {
    expect(reducer(undefined, { type: 'UNKNOWN' })).toEqual(initialState);
  });

  test('не изменяет переданное состояние при неизвестном экшене', () => {
    expect(reducer(filledState, { type: 'UNKNOWN' })).toBe(filledState);
  });

  describe('добавление ингредиента (addIngredient)', () => {
    test('булка записывается в поле bun, список начинок не меняется', () => {
      const nextState = reducer(initialState, addIngredient(bun));

      expect(nextState.bun).toMatchObject(bun);
      expect(typeof nextState.bun?.id).toBe('string');
      expect(nextState.ingredients).toEqual([]);
    });

    test('новая булка заменяет ранее выбранную', () => {
      const nextState = reducer(filledState, addIngredient(anotherBun));

      expect(nextState.bun).toMatchObject(anotherBun);
      expect(nextState.bun?.id).not.toBe(filledState.bun?.id);
      expect(nextState.ingredients).toEqual(filledState.ingredients);
    });

    test('начинка добавляется в конец списка ингредиентов', () => {
      const nextState = reducer(filledState, addIngredient(sauce));

      expect(nextState.bun).toEqual(filledState.bun);
      expect(nextState.ingredients).toHaveLength(4);
      expect(nextState.ingredients[3]).toMatchObject(sauce);
      expect(typeof nextState.ingredients[3].id).toBe('string');
    });

    test('каждому добавленному ингредиенту присваивается уникальный id', () => {
      const state = reducer(
        reducer(initialState, addIngredient(main)),
        addIngredient(main)
      );
      const [first, second] = state.ingredients;

      expect(first.id).not.toBe(second.id);
    });
  });

  describe('удаление ингредиента (removeIngredient)', () => {
    test('удаляет из списка только ингредиент с переданным id', () => {
      const nextState = reducer(filledState, removeIngredient('sauce-1'));

      expect(nextState.ingredients.map((item) => item.id)).toEqual(['main-1', 'main-2']);
      expect(nextState.bun).toEqual(filledState.bun);
    });

    test('не меняет список, если ингредиента с таким id нет', () => {
      const nextState = reducer(filledState, removeIngredient('unknown-id'));

      expect(nextState.ingredients).toEqual(filledState.ingredients);
    });
  });

  describe('перемещение ингредиента (moveIngredient)', () => {
    test('перемещает ингредиент вниз', () => {
      const nextState = reducer(filledState, moveIngredient({ from: 0, to: 1 }));

      expect(nextState.ingredients.map((item) => item.id)).toEqual([
        'sauce-1',
        'main-1',
        'main-2',
      ]);
    });

    test('перемещает ингредиент вверх', () => {
      const nextState = reducer(filledState, moveIngredient({ from: 2, to: 1 }));

      expect(nextState.ingredients.map((item) => item.id)).toEqual([
        'main-1',
        'main-2',
        'sauce-1',
      ]);
    });
  });

  test('clearConstructor: очищает булку и список начинок', () => {
    expect(reducer(filledState, clearConstructor())).toEqual(initialState);
  });

  describe('оформление заказа (createOrder)', () => {
    test('pending: конструктор не меняется, пока заказ оформляется', () => {
      const nextState = reducer(filledState, createOrder.pending('requestId', []));

      expect(nextState).toEqual(filledState);
    });

    test('rejected: конструктор сохраняется, если заказ не удалось оформить', () => {
      const nextState = reducer(
        filledState,
        createOrder.rejected(new Error('Ошибка'), 'requestId', [])
      );

      expect(nextState).toEqual(filledState);
    });

    test('fulfilled: конструктор очищается после успешного заказа', () => {
      const nextState = reducer(
        filledState,
        createOrder.fulfilled(order, 'requestId', order.ingredients)
      );

      expect(nextState).toEqual(initialState);
    });
  });
});
