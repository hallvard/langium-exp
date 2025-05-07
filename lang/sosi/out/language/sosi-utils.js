import { isInlineType } from "./generated/ast.js";
export function typeName(type) {
    if (type.name) {
        return type.name;
    }
    const typeOwner = type.$container;
    if (isInlineType(typeOwner)) {
        const property = typeOwner.$container;
        return `${typeName(property.$container)}_${property.name}`;
    }
    return "unknown";
}
//# sourceMappingURL=sosi-utils.js.map