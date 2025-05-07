import { AstUtils, DefaultLinker } from "langium";
import { isNamespace } from "./generated/ast.js";
export class SosiLinker extends DefaultLinker {
    // try both original name and within imported namespaces
    getCandidate(refInfo) {
        const scope = this.scopeProvider.getScope(refInfo);
        const refText = refInfo.reference.$refText;
        const description = scope.getElement(refText)
            || this.tryImports(refText, refInfo.container, scope);
        return description !== null && description !== void 0 ? description : this.createLinkingError(refInfo);
    }
    tryImports(refText, context, scope) {
        const namespace = AstUtils.getContainerOfType(context, isNamespace);
        if (namespace) {
            for (const imp of namespace.imports) {
                const description = scope.getElement(`${imp.namespace}.${refText}`);
                if (description) {
                    return description;
                }
            }
        }
        return undefined;
    }
}
//# sourceMappingURL=sosi-linking.js.map