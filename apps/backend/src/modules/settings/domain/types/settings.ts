import { t as Type } from "elysia";

export type SettingValue = string | number | boolean | object;

export interface Setting {
  id: number;
  userId: number | null; // null for system-wide settings
  key: string;
  value: SettingValue;
  type: "string" | "number" | "boolean" | "json";
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SettingUpdate {
  key: string;
  value: SettingValue;
}

export interface SettingCreate extends SettingUpdate {
  key: string;
  value: SettingValue;
  type?: "string" | "number" | "boolean" | "json";
  description?: string;
}

export const SettingCreateSchema = Type.Object({
  key: Type.String({ minLength: 1 }),
  value: Type.Union([
    Type.String(),
    Type.Number(),
    Type.Boolean(),
    Type.Record(Type.String(), Type.Unknown()),
  ]),
  type: Type.Optional(
    Type.Union([
      Type.Literal("string"),
      Type.Literal("number"),
      Type.Literal("boolean"),
      Type.Literal("json"),
    ]),
  ),
  description: Type.Optional(Type.String()),
});

export interface SettingQuery {
  userId?: number | null;
  keys?: string[];
}
