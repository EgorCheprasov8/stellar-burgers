import {
  getUserApi,
  loginUserApi,
  logoutApi,
  refreshToken,
  registerUserApi,
  updateUserApi,
} from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { deleteCookie, getCookie, setCookie } from '@utils/cookie';

import type { TLoginData, TRegisterData } from '@api';
import type { TUser } from '@utils-types';

type TUserState = {
  user: TUser | null;
  isAuthChecked: boolean;
  authError: string | null;
  updateError: string | null;
};

const initialState: TUserState = {
  user: null,
  isAuthChecked: false,
  authError: null,
  updateError: null,
};

const saveTokens = (accessToken: string, refreshTokenValue: string): void => {
  setCookie('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshTokenValue);
};

const clearTokens = (): void => {
  deleteCookie('accessToken');
  localStorage.removeItem('refreshToken');
};

export const registerUser = createAsyncThunk(
  'user/register',
  async (data: TRegisterData) => {
    const response = await registerUserApi(data);
    saveTokens(response.accessToken, response.refreshToken);
    return response.user;
  }
);

export const loginUser = createAsyncThunk('user/login', async (data: TLoginData) => {
  const response = await loginUserApi(data);
  saveTokens(response.accessToken, response.refreshToken);
  return response.user;
});

/* Проверка при старте приложения: есть ли действующая сессия.
   Если access-токена в куках нет, но есть refresh-токен — сначала обновляем токены. */
export const checkUserAuth = createAsyncThunk('user/checkAuth', async () => {
  if (!getCookie('accessToken')) {
    if (!localStorage.getItem('refreshToken')) {
      return null;
    }
    await refreshToken();
  }
  const response = await getUserApi();
  return response.user;
});

export const updateUser = createAsyncThunk(
  'user/update',
  async (data: Partial<TRegisterData>) => {
    const response = await updateUserApi(data);
    return response.user;
  }
);

export const logoutUser = createAsyncThunk('user/logout', async () => {
  await logoutApi();
  clearTokens();
});

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.authError = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.authError = action.error.message ?? null;
      })
      .addCase(loginUser.pending, (state) => {
        state.authError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.authError = action.error.message ?? null;
      })
      .addCase(checkUserAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthChecked = true;
      })
      .addCase(checkUserAuth.rejected, (state) => {
        state.user = null;
        state.isAuthChecked = true;
      })
      .addCase(updateUser.pending, (state) => {
        state.updateError = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.updateError = action.error.message ?? null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      });
  },
});
