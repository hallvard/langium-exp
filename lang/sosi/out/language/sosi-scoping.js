import { DefaultScopeComputation, DefaultScopeProvider, MultiMap } from "langium";
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
        switch (context.container.$type) {
            case 'Import':
                if (context.property === 'namespace') {
                }
                break;
            case 'CompositeType':
                if (context.property === 'extends') {
                }
                break;
            case 'TypeRef':
                if (context.property === 'typeRef') {
                }
                break;
        }
        return super.getScope(context);
    }
}
//# sourceMappingURL=sosi-scoping.js.map