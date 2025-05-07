import { afterEach, beforeAll, describe, expect, test } from "vitest";
import { AstNode, EmptyFileSystem, ReferenceDescription, type LangiumDocument } from "langium";
import { expandToString as s } from "langium/generate";
import { clearDocuments, parseDocument, parseHelper } from "langium/test";
import { createSosiServices } from "../../src/language/sosi-module.js";
import { CompositeType, BuiltinType, Property, Specification, Type, isCompositeType, isBuiltinType, isSpecification, isTypeRef, isType, isInlineType, Package } from "../../src/language/generated/ast.js";
import { fail } from "node:assert";

let services: ReturnType<typeof createSosiServices>;
let parse:    ReturnType<typeof parseHelper<Specification>>;
let document: LangiumDocument<Specification> | undefined;

beforeAll(async () => {
    services = createSosiServices(EmptyFileSystem);
    parse = parseHelper<Specification>(services.Sosi);

    // activate the following if your linking test requires elements from a built-in library, for example
    // await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
});

afterEach(async () => {
    document && clearDocuments(services.shared, [ document ]);
});

const commonTypes = `
  builtin String as java String
  builtin Timestamp as java long
  builtin Posisjon as java geo.Geometry
  builtin Areal as java geo.Geometry

  data type Id {
    name: String
    namespace: String
    version: Timestamp
  }
`;

const guTypes = `
  type GU {
    # id: Id
    @ "område": Areal
    borehull*: type GB {
      # id: Id
      @ posisjon: Posisjon 
    }
  }
`;

describe('Linking tests', () => {

    test('linking of Specification', async () => {
        document = await parse(`
            specification ngu.nadag
            ${commonTypes}
            ${guTypes}
        `);

        expect(
            // here we first check for validity of the parsed document object by means of the reusable function
            //  'checkDocumentValid()' to sort out (critical) typos first,
            // and then evaluate the cross references we're interested in by checking
            //  the referenced AST element as well as for a potential error message;
            checkDocumentValid(document)
        ).toBeUndefined();

        const spec = document.parseResult.value;
        const idType = findType('Id', isCompositeType, spec) as CompositeType;
        const arealType = findType('Areal', isBuiltinType, spec) as BuiltinType;
        const posisjonType = findType('Posisjon', isBuiltinType, spec) as BuiltinType;

        const guType = findType('GU', isCompositeType, spec) as CompositeType;
        const gbType = findInlineType('GB', isCompositeType, guType) as CompositeType;

        expect(idType).toBeDefined();
        expect(arealType).toBeDefined();
        expect(posisjonType).toBeDefined();
        expect(guType).toBeDefined();
        expect(gbType).toBeDefined();

        checkPropertyWithTypeRef('id', guType, idType);
        checkPropertyWithTypeRef('område', guType, arealType);
        checkPropertyWithTypeRef('posisjon', gbType, posisjonType);
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

function findType(name: string, predicate: (item:any ) => boolean, spec: Specification): Type | undefined {
    return spec.types.find(type => type.name == name);
}

function checkPropertyWithTypeRef(name: string, type: CompositeType, expectedType: Type): undefined {
    const prop = findProperty(name, type);
    if (! prop) {
        fail(`Expected a ${name} property in ${type.name}`);
    }
    const propType = prop.type
    if (! isTypeRef(propType)) {
        fail(`Expected ${prop?.name} had a TypeRef`);
    }
    expect(propType.typeRef.ref).toBe(expectedType);
}

function findInlineType(name: string, predicate: (item:any ) => boolean, type: CompositeType): Type | undefined {
  for (const prop of type.properties) {
    if (isInlineType(prop.type) && prop.type.typeDef.name == name) {
      return prop.type.typeDef;
    }
  }
  return undefined;
}

function findProperty(name: string, type: CompositeType): Property | undefined {
    return type.properties.find(prop => prop.name == name);
}

const commonPackage = `
  package ngu.common
  ${commonTypes}
`;

const guSpec = `
  specification ngu.nadag
  import ngu.common
  ${guTypes}
`;

// https://github.com/eclipse-langium/langium/blob/main/examples/domainmodel/test/cross-refs.test.ts
describe('Cross references from declaration', () => {
  test('Find all references', async () => {
      const allRefs = await getReferences();
      expect(allRefs.length).toEqual(2); // datatype String
      expect(range(allRefs[0])).toEqual('5:10->5:12');
      expect(range(allRefs[1])).toEqual('8:12->8:14');
  });
});

async function getReferences(): Promise<ReferenceDescription[]> {
  const datatypeDoc: LangiumDocument<AstNode> = await parseDocument(services.Sosi, commonPackage);
  const referencingDoc: LangiumDocument<AstNode> = await parseDocument(services.Sosi, guSpec);

  await services.shared.workspace.DocumentBuilder.build([referencingDoc, datatypeDoc]);
  const ns = (datatypeDoc.parseResult.value as Package);
  const idType = ns.types[4];
  const astNodePath = services.Sosi.workspace.AstNodeLocator.getAstNodePath(idType);
  return services.shared.workspace.IndexManager.findAllReferences(idType, astNodePath).toArray()
}

function range(ref: ReferenceDescription): string {
  return ref.segment.range.start.line + ':' + ref.segment.range.start.character + '->' + ref.segment.range.end.line + ':' + ref.segment.range.end.character;
}
