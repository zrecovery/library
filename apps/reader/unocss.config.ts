import {
  defineConfig,
  presetWebFonts,
  presetWind4,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss"

import { presetAnimate } from "./presets/animate"
import { presetShadcn } from "./presets/shadcn"

export default defineConfig({
  presets: [
    presetWind4({
      dark: {
        dark: '[data-kb-theme="dark"]',
        light: '[data-kb-theme="light"]',
      },
    }),
    presetAnimate(),
    presetShadcn(),
  ],
  transformers: [transformerVariantGroup(), transformerDirectives()],
})
