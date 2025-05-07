import { beforeAll, describe, expect, test } from "vitest";
import { EmptyFileSystem, type LangiumDocument } from "langium";
import { expandToString as s } from "langium/generate";
import { parseHelper } from "langium/test";
import type { Diagnostic } from "vscode-languageserver-types";
import { createSosiServices } from "../../src/language/sosi-module.js";
import { Specification, isSpecification } from "../../src/language/generated/ast.js";

let services: ReturnType<typeof createSosiServices>;
let parse:    ReturnType<typeof parseHelper<Specification>>;
let document: LangiumDocument<Specification> | undefined;

beforeAll(async () => {
    services = createSosiServices(EmptyFileSystem);
    const doParse = parseHelper<Specification>(services.Sosi);
    parse = (input: string) => doParse(input, { validation: true });

    // activate the following if your linking test requires elements from a built-in library, for example
    // await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
});

describe('Validating valid Specification', () => {
  
    test('check no Specification errors', async () => {
        document = await parse(`
            specification ngu.nadag

            builtin String as java String
            builtin Timestamp as java long
            builtin Posisjon as java geo.Geometry
            builtin Areal as java geo.Geometry

            data type Id {
              name: String
              namespace: String
              version: Timestamp
            }

            type GU {
              # id: Id
              @ omraade: Areal
              borehull*: type GB {
                # id: Id
                @ posisjon: Posisjon 
              }
            }
        `);

        expect(checkDocumentValid(document, true)).toHaveLength(0);
    });
});

describe('Validating types with wrong id property count', () => {
  
    test('check no Specification errors', async () => {
        document = await parse(`
            specification ngu.nadag
            builtin String as java String
            data type Id {
              # name: String
            }
            type GU {
              id: Id
            }
        `);

        expect(checkDocumentValid(document, false)).toBeUndefined();
        expect(checkDocumentValid(document, true)?.length).toBe(2);
    });
});

function checkDocumentValid(document: LangiumDocument, includeDiagnostics : boolean): string[] | undefined {
    return document.parseResult.parserErrors.length && document.parseResult.parserErrors.map(e => e.message)
        || document.parseResult.value === undefined && [`ParseResult is 'undefined'.`]
        || !isSpecification(document.parseResult.value) && [`Root AST object is a ${document.parseResult.value.$type}, expected a '${Specification}'.`]
        || (includeDiagnostics ? document.diagnostics?.map(diagnosticToString) : undefined);
}

function diagnosticToString(d: Diagnostic) {
    return `[${d.range.start.line}:${d.range.start.character}..${d.range.end.line}:${d.range.end.character}]: ${d.message}`;
}
