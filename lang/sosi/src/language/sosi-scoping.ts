import { AstNode, AstNodeDescription, DefaultScopeComputation, DefaultScopeProvider, LangiumDocument, MultiMap, PrecomputedScopes, ReferenceInfo, Scope } from "langium";
import { Namespace, SosiAstType } from "./generated/ast.js";
import { typeName } from "./sosi-utils.js";

export class SosiScopeComputation extends DefaultScopeComputation {

  /**
   * Export the namespace itself and 
   * the top-level types using their fully qualified name.
   *
   * @param document The document to compute exports for
   * @returns The list of exported descriptions
   */
  override async computeExports(document: LangiumDocument): Promise<AstNodeDescription[]> {
    const exportedDescriptions: AstNodeDescription[] = [];
    const namespace = document.parseResult.value as Namespace;
    const rootName = namespace.name;
    exportedDescriptions.push(this.descriptions.createDescription(namespace, rootName, document));
    for (const type of namespace.types) {
      const fqn = `${rootName}.${typeName(type)}`;
      exportedDescriptions.push(this.descriptions.createDescription(type, fqn, document));
    }
    return exportedDescriptions;
  }

  /**
   * Make top-level types available locally using their simple name.
   *
   * @param document The document to compute scopes for
   * @returns the scopes for the document
   */
  override async computeLocalScopes(document: LangiumDocument): Promise<PrecomputedScopes> {
    const ns = document.parseResult.value as Namespace;
    // This multi-map stores a list of descriptions for each node in our document
    const scopes = new MultiMap<AstNode, AstNodeDescription>();
    const localDescriptions: AstNodeDescription[] = Array.from(ns.types)
        .map(type => this.descriptions.createDescription(type, typeName(type), document));
    scopes.addAll(ns, localDescriptions);
    return scopes;
  }
}

export class SosiScopeProvider extends DefaultScopeProvider {
  override getScope(context: ReferenceInfo): Scope {
    return super.getScope(context);
  }

  override getGlobalScope(referenceType: string, context: ReferenceInfo): Scope {
    // replace with a scope that includes the imported namespace prefixes
    return super.getGlobalScope(referenceType, context);
  }
}