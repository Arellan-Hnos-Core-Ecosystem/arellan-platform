// MNT-08: flat-config para ESLint 9 (antes `npm run lint` fallaba por config
// ausente). Base: reglas recomendadas de typescript-eslint SIN type-checking
// (rápidas y deterministas) + un núcleo de reglas de seguridad/correctitud.
// La deuda de estilo del codebase se aborda aparte; este lint debe PASAR y
// bloquear regresiones reales, no inundar con falsos positivos.
import tseslint from "typescript-eslint"

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**", "prisma/migrations/**"],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      // El codebase usa interfaces vacías/require puntuales heredados; los
      // ajustes siguientes evitan ruido sin desactivar seguridad.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" },
      ],
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-var": "error",
      "prefer-const": "error",
      eqeqeq: ["error", "smart"],
    },
  },
)
