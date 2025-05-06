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
    parse = parseHelper<Specification>(services.Sosi);

    // activate the following if your linking test requires elements from a built-in library, for example
    // await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
});

describe('Parsing tests', () => {

    test('parse Specification', async () => {
        document = await parse(`
            specification ngu.nadag

            builtin String as java String
            builtin Timestamp as java long
            builtin Posisjon as java geo.Geometry
            builtin Areal as java geo.Geometry

            data type Id {
                "Navnet"
                name : String as java java.util.StringBuilder

                "Gjør navnet unikt"
                namespace : String

                "Versjonen er monotont økende, f.eks. et tidsstempel"
                version: Timestamp
            }

            type GU {
              # id: Id
              @ "område": Areal
              borehull*: type GB {
                # id: Id
                @ posisjon: Posisjon 
              }
            }
        `);

        expect(
            // here we first check for validity of the parsed document object by means of the reusable function
            //  'checkDocumentValid()' to sort out (critical) typos first,
            // and then evaluate the diagnostics by converting them into human readable strings;
            // note that 'toHaveLength()' works for arrays and strings alike ;-)
            checkDocumentValid(document) || document?.diagnostics?.map(diagnosticToString)?.join('\n')
        ).toBeUndefined();

        expect(document.parseResult.value?.name).toBe('ngu.nadag');
    });
});

function checkDocumentValid(document: LangiumDocument): string | undefined {
    return document.parseResult.parserErrors.length && s`
        Parser errors:
          ${document.parseResult.parserErrors.map(e => e.message).join('\n  ')}
    `
        || document.parseResult.value === undefined && `ParseResult is 'undefined'.`
        || !isSpecification(document.parseResult.value) && `Root AST object is a ${document.parseResult.value.$type}, expected a '${Specification}'.`
        || undefined;
}

function diagnosticToString(d: Diagnostic) {
    return `[${d.range.start.line}:${d.range.start.character}..${d.range.end.line}:${d.range.end.character}]: ${d.message}`;
}
