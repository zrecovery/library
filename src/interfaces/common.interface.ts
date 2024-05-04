export type Creatable<T> = Omit<T, "id" | "created_at" | "updated_at">;

export type Updatable<T> = Partial<T>;
