import { isInlineType, Type } from "./generated/ast.js"

export function typeName(type: Type): string {
  if (type.name) {
    return type.name
  }
  const typeOwner = type.$container
  if (isInlineType(typeOwner)) {
    const property = typeOwner.$container
    return `${typeName(property.$container)}_${property.name}`
  }
  return "unknown"
}