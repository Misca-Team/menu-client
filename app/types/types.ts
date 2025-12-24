export type LoginState = {
  error?: string;
  success?: boolean;
};

export type CreateProductForm = {
  name: string;
  price: number;
  isAvailable: boolean;
  calories?: number | null;
  averagePreparationMinutes?: number | null;
};
