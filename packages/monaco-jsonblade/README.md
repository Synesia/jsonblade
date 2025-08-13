# @jsonblade/monaco-jsonblade

Plugin Monaco Editor pour le support du langage JSONBlade templates.

## Description

Ce package fournit la coloration syntaxique, la configuration de l'éditeur et les fonctionnalités de base pour les templates JSONBlade dans Monaco Editor.

## Fonctionnalités

- ✅ Coloration syntaxique pour JSONBlade
- ✅ Support des expressions `{{ ... }}`
- ✅ Support des tags `{% ... %}`
- ✅ Support des commentaires `{# ... #}`
- ✅ Auto-complétion des brackets
- ✅ Indentation automatique
- ✅ Folding du code

## Installation

```bash
npm install @jsonblade/monaco-jsonblade
# ou
pnpm add @jsonblade/monaco-jsonblade
```

## Usage

### Enregistrement du langage

```typescript
import { registerJsonBladeLanguage } from "@jsonblade/monaco-jsonblade";

// Enregistrer le langage JSONBlade
registerJsonBladeLanguage();
```

### Création d'un éditeur

```typescript
import { createJsonBladeEditor } from "@jsonblade/monaco-jsonblade";

const editor = createJsonBladeEditor(
  document.getElementById("editor"),
  '{"name": "{{ user.name }}", "active": {% if user.active %}true{% else %}false{% endif %}}'
);
```

### Usage manuel avec Monaco

```typescript
import * as monaco from "monaco-editor";
import {
  LANGUAGE_ID,
  languageConfiguration,
  languageDefinition,
} from "@jsonblade/monaco-jsonblade";

// Enregistrement manuel
monaco.languages.register({ id: LANGUAGE_ID });
monaco.languages.setLanguageConfiguration(LANGUAGE_ID, languageConfiguration);
monaco.languages.setMonarchTokensProvider(LANGUAGE_ID, languageDefinition);

// Création de l'éditeur
const editor = monaco.editor.create(document.getElementById("editor"), {
  value: '{"template": "{{ data }}"}',
  language: LANGUAGE_ID,
});
```

## Syntaxe JSONBlade supportée

- **Expressions** : `{{ variable }}`, `{{ user.name }}`
- **Tags de contrôle** : `{% if condition %}`, `{% for item in items %}`, `{% set var = value %}`
- **Commentaires** : `{# ceci est un commentaire #}`
- **JSON de base** : strings, numbers, booleans, objects, arrays

## Développement

```bash
# Installation des dépendances
pnpm install

# Build
pnpm build

# Mode watch pour le développement
pnpm dev

# Vérification des types
pnpm check-types
```
