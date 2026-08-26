# @luam/theme

The single place a Luam colour decision exists. This package is data plus pure
functions: a palette, a role table, the constraints the table must satisfy, and
one generator per editor. Nothing in the compile path depends on it, and it
depends on nothing in the compile path.

## Layout

| File | What it holds |
| --- | --- |
| `src/color.ts` | sRGB, relative luminance, WCAG contrast, and the one function that moves a seed to a target luminance. |
| `src/ramp.ts` | The four value steps and the contrast ratio each one targets. |
| `src/palette.ts` | The two mode seeds, the surfaces, and the ramps built from them. |
| `src/roles.ts` | The role table. Every colour decision in the product is one line here. |
| `src/constraints.ts` | The confusion sets and the contrast floors, as values a test can assert against. |
| `src/resolve.ts` | `(role, mode)` to a concrete foreground and font style. Every generator calls only this. |
| `src/targets/` | One file per output: TextMate scopes, semantic selectors, workbench colours, VS Code, Zed, Neovim, `.tmTheme`, docs. |
| `src/generate.ts` | The list of files the generator writes, and the staleness check. |

## Generated files are never hand-edited

```bash
pnpm --filter @luam/theme themes
```

writes the VS Code themes, the Zed theme, the Neovim colour scheme, the two
`.tmTheme` files, and the generated documentation tables. Every one of them
carries a header saying so.

```bash
pnpm --filter @luam/theme themes:check
```

fails when a committed file no longer matches what the generator writes. CI runs
it, so a hand edit fails there rather than shipping.

## Adding a role

1. Add one line to `src/roles.ts` with its confusion set, hue, value step, font
   style, and layer.
2. Map it in `src/targets/textmate.ts`, in `src/targets/semantic.ts`, or in
   both. A role reachable from neither target fails the coverage test.
3. Run the tests. Distinctness, contrast, and coverage are assertions, not
   review comments — if the new role collides with something it can appear
   beside, or drops below its contrast floor, the suite says which pair and by
   how much.
4. Regenerate and commit the output.

## The rules the tests enforce

- Four syntax hues plus red, and red never appears in a syntax role.
- Cyan means the token is erased before the Lua is written; violet means it
  survives. The three environment directives are the only marked exception.
- Inside a confusion set no two roles share hue, value step, and font style.
- A pair that differs only by value step stays at least 1.6:1 apart.
- Every role clears 4.5:1 against the editor background, or 3:1 when it is
  marked ambient.
- Regenerating produces no diff.
