---
name: conventional-commits
description: >
  Guía para redactar commits con Conventional Commits en este proyecto,
  priorizando mensajes cortos, consistentes y alineados al propósito del cambio.
  Trigger: cuando el usuario pida crear un commit, redactar un mensaje de commit
  o seguir la convención de commits del repositorio.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- Crear commits en este repositorio.
- Proponer mensajes siguiendo el estilo existente.
- Decidir entre `feat`, `fix`, `docs`, `refactor`, `chore` o `test`.

## Critical Patterns

- Usar SIEMPRE formato `type: summary`.
- Mantener el summary en inglés, corto y orientado al propósito.
- Elegir `feat` para capacidad nueva visible, `fix` para corrección, `docs` para documentación, `refactor` para cambios estructurales sin nueva capacidad.
- Si el cambio mezcla frontend, backend y docs por una misma capacidad, usar el tipo del impacto principal.
- No agregar scopes si el repositorio no los viene usando en commits recientes.
- No agregar prefijos decorativos, emojis, Co-Authored-By ni atribución AI.

## Decision Guide

| Caso | Tipo recomendado | Ejemplo |
| --- | --- | --- |
| Nueva capacidad visible para el producto | `feat` | `feat: add local chat backend` |
| Corrección de un comportamiento roto | `fix` | `fix: handle empty chat requests` |
| Solo documentación o skills | `docs` | `docs: restructure project README` |
| Reorganización interna sin cambio funcional principal | `refactor` | `refactor: split chat provider registry` |
| Ajustes de tooling o config | `chore` | `chore: add backend gitignore` |

## Code Examples

```text
feat: add modular local chat backend
fix: resolve TypeScript path alias warning
docs: restructure project README
```

## Commands

```bash
git status --short
git diff --staged; git diff
git log -8 --oneline
git commit -m "feat: add modular local chat backend"
```

## Resources

- **Registro de skills**: `AGENTS.md`
- **Referencia de estilo actual**: `git log --oneline`
