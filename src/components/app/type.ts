import type { SerializedError } from '@reduxjs/toolkit';
import type { TIngredient } from '@utils-types';

export type AppContentProps = {
  ingredients: TIngredient[];
  isLoading: boolean;
  error: SerializedError | null;
};

export type TDetailPageProps = {
  title: string;
  children: React.ReactNode;
};

export type TOrderModalProps = {
  onClose: () => void;
};
