'use client'

import { useState, useEffect } from "react";
import Editor from '@monaco-editor/react';
import { JSONBlade } from 'jsonblade'

import { registerJSONBladeLanguage } from '../lib/monaco-jsonblade'

import classNameModule from '@anthonyjeamme/classname';
import styles from './demo.module.scss';
const className = classNameModule(styles)

export default function Demo() {
    const [data, setData] = useState({
        input: {
            username: 'John Doe',
            email: 'john.doe@example.com',
            isActive: true,
            items: [
                { id: 1, title: 'Item 1', price: 100 },
                { id: 2, title: 'Item 2', price: 200 },
            ]
        },
        user: {
            name: 'John Doe',
            email: 'john.doe@example.com',
            isActive: true
        },
        items: [
            { id: 1, title: 'Product A', price: 29.99, active: true },
            { id: 2, title: 'Product B', price: 49.99, active: false },
        ],
        config: {
            theme: 'dark',
            language: 'en'
        }
    });

    const [monacoInstance, setMonacoInstance] = useState<any>(null);

    const [result, setResult] = useState<string | null>(null);

    // Définition des fonctions séparément
    const getSecret = async (key: string) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const secrets: { [key: string]: string } = {
            'api_key': 'sk-abc123',
            'db_password': 'super_secret_password',
            'jwt_secret': 'my-jwt-secret-key'
        };
        return secrets[key] || `[SECRET_${key}_NOT_FOUND]`;
    };

    const generateId = () => {
        return Math.random().toString(36).substr(2, 9);
    };

    // Effet pour mettre à jour le schéma quand data change
    useEffect(() => {
        if (monacoInstance) {
            console.log('Updating data schema with new data:', data);
            monacoInstance.jsonblade?.updateData(data);
        }
    }, [data, monacoInstance]);

    // Effet pour enregistrer les fonctions
    useEffect(() => {
        if (monacoInstance) {
            // Enregistrer les fonctions
            monacoInstance.jsonblade?.registerFunction('getSecret', getSecret, "'${1:key}'", 'Get secret value by key');
            monacoInstance.jsonblade?.registerFunction('generateId', generateId, '', 'Generate a unique ID');
        }
    }, [monacoInstance]);

    const [value, setValue] = useState(`{
  "user": {
    "name": "{{user.name | upper}}",
    "email": "{{user.email}}",
    "isActive": {{user.isActive}}
  },
  "input_data": {
    "username": "{{input.username}}",
    "email": "{{input.email}}",
    "secret": "{{getSecret('api_key')}}",
    "db_secret": "{{getSecret('db_password')}}",
    "unknown_secret": "{{getSecret('unknown_key')}}",
    "generated_id": "{{generateId()}}"
  },
  "stats": {
    "total": {{items | length}},
    "processed": "{{items | filter('active', true) | length}} active items"
  }
}`);

    return (
        <div {...className('Demo')}>
            <div {...className('Editor')}>
                <Editor
                    height="100%"
                    defaultLanguage="json"
                    value={value}
                    onChange={(value) => setValue(value ?? '')}
                    beforeMount={(monaco) => {
                        registerJSONBladeLanguage(monaco, data);
                        setMonacoInstance(monaco);
                    }}
                    onMount={(editor, monaco) => {
                        const model = editor.getModel();
                        if (model) {
                            monaco.editor.setModelLanguage(model, 'jsonblade');
                            monaco.editor.setTheme('jsonblade-theme');

                            // Fonction de validation
                            const validateModel = (monaco as any).jsonblade?.validateModel;

                            // Validation initiale
                            if (validateModel) {
                                setTimeout(() => {
                                    validateModel(model);
                                }, 100);

                                // Ajouter l'écoute des changements de contenu
                                model.onDidChangeContent(() => {
                                    validateModel(model);
                                });
                            }
                        }
                    }}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        wordWrap: 'on',
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        suggestOnTriggerCharacters: true,
                        quickSuggestions: {
                            other: true,
                            comments: false,
                            strings: true
                        }
                    }}
                />
            </div>

            <div {...className('Sidebar')}>


                <Editor
                    height="50%"
                    defaultLanguage="json"
                    defaultValue={JSON.stringify(data, null, 2)}
                    onChange={(value) => {

                        try {
                            setData(JSON.parse(value ?? ''))
                        } catch { }
                    }}

                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        wordWrap: 'on',
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        suggestOnTriggerCharacters: true,
                        quickSuggestions: {
                            other: true,
                            comments: false,
                            strings: true
                        }
                    }}
                />


                <button onClick={async () => {

                    const jsonblade = new JSONBlade({ useBuiltins: true })

                    const result = await jsonblade.compileAsync(value, data, [
                        {
                            name: 'getSecret',
                            func: getSecret,
                        }
                    ]);
                    setResult(result);
                }}>RUN</button>
                {
                    result && <div {...className('Result')}>
                        <pre>{JSON.stringify(result, null, 2)}</pre>
                    </div>
                }
            </div>
        </div>
    );
}
