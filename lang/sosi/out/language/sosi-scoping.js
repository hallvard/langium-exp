import { AstUtils, DefaultScopeComputation, DefaultScopeProvider, MultiMap } from "langium";
import { isNamespace } from "./generated/ast.js";
import { typeName } from "./sosi-utils.js";
export class SosiScopeComputation extends DefaultScopeComputation {
    /**
     * Export the namespace itself and
     * the top-level types using their fully qualified name.
     *
     * @param document The document to compute exports for
     * @returns The list of exported descriptions
     */
    async computeExports(document) {
        const exportedDescriptions = [];
        const namespace = document.parseResult.value;
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
    async computeLocalScopes(document) {
        const ns = document.parseResult.value;
        // This multi-map stores a list of descriptions for each node in our document
        const scopes = new MultiMap();
        const localDescriptions = Array.from(ns.types)
            .map(type => this.descriptions.createDescription(type, typeName(type), document));
        scopes.addAll(ns, localDescriptions);
        return scopes;
    }
}
export class SosiScopeProvider extends DefaultScopeProvider {
    getScope(context) {
        // log('SosiScopeProvider.getScope', context);
        return super.getScope(context);
    }
    getGlobalScope(referenceType, context) {
        // replace with a scope that includes the imported namespace prefixes
        const globalScope = super.getGlobalScope(referenceType, context);
        const ns = AstUtils.getContainerOfType(context.container, isNamespace);
        if (!ns) {
            return globalScope;
        }
        const prefixes = ns.imports.map(imp => `${imp.namespace.$refText}.`);
        return prefixes.length === 0 ? globalScope : new ScopeWithPrefixes(prefixes, globalScope);
    }
}
class ScopeWithPrefixes {
    constructor(prefixes, delegate) {
        this.prefixes = prefixes;
        this.delegate = delegate;
    }
    /**
     * Looks up an element by its name, or, if the element is not found,
     * with the prefixes.
     *
     * @param name The name of the element to look up
     * @returns
     */
    getElement(name) {
        var element = this.delegate.getElement(name);
        if (!element) {
            for (const prefix of this.prefixes) {
                element = this.delegate.getElement(`${prefix}${name}`);
                if (element) {
                    break;
                }
            }
        }
        return element;
    }
    getAllElements() {
        const allElements = this.delegate.getAllElements();
        return allElements.flatMap(element => {
            const name = element.name;
            var unprefixedName = undefined;
            for (const prefix of this.prefixes) {
                if (name.startsWith(prefix)) {
                    unprefixedName = name.substring(prefix.length);
                    break;
                }
            }
            return unprefixedName
                ? [element, new AstNodeDescriptionWithAltName(element, unprefixedName)]
                : element;
        });
    }
}
class AstNodeDescriptionWithAltName {
    constructor(delegate, altName) {
        this.node = delegate.node;
        this.nameSegment = delegate.nameSegment;
        this.selectionSegment = delegate.selectionSegment;
        this.type = delegate.type;
        this.documentUri = delegate.documentUri;
        this.path = delegate.path;
        // alternate name
        this.name = altName;
    }
}
//# sourceMappingURL=sosi-scoping.js.map