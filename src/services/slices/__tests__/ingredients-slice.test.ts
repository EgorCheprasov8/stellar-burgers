import { fetchIngredients, ingredientsSlice } from '../ingredients-slice';
import { mockIngredients } from './mock-ingredients';

const reducer = ingredientsSlice.reducer;

const initialState = {
  items: [],
  isLoading: false,
  error: null,
};

describe('редьюсер слайса ingredients', () => {
  test('возвращает начальное состояние для неизвестного экшена', () => {
    expect(reducer(undefined, { type: 'UNKNOWN' })).toEqual(initialState);
  });

  test('не изменяет переданное состояние при неизвестном экшене', () => {
    const state = { ...initialState, items: mockIngredients };

    expect(reducer(state, { type: 'UNKNOWN' })).toBe(state);
  });

  describe('загрузка ингредиентов (fetchIngredients)', () => {
    test('pending: включает флаг загрузки и сбрасывает прошлую ошибку', () => {
      const state = {
        ...initialState,
        error: { message: 'Прошлая ошибка' },
      };

      const nextState = reducer(state, fetchIngredients.pending('requestId'));

      expect(nextState).toEqual({
        items: [],
        isLoading: true,
        error: null,
      });
    });

    test('fulfilled: сохраняет полученные ингредиенты и выключает флаг загрузки', () => {
      const state = { ...initialState, isLoading: true };

      const nextState = reducer(
        state,
        fetchIngredients.fulfilled(mockIngredients, 'requestId')
      );

      expect(nextState).toEqual({
        items: mockIngredients,
        isLoading: false,
        error: null,
      });
    });

    test('rejected: сохраняет ошибку и выключает флаг загрузки', () => {
      const state = { ...initialState, isLoading: true };
      const error = new Error('Ошибка сети');

      const nextState = reducer(state, fetchIngredients.rejected(error, 'requestId'));

      expect(nextState.isLoading).toBe(false);
      expect(nextState.items).toEqual([]);
      expect(nextState.error).toEqual(
        expect.objectContaining({ message: 'Ошибка сети' })
      );
    });
  });
});
