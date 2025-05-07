import { isBuiltinType, isCompositeType, isInlineType } from '../language/generated/ast.js';
import { expandToNode, joinToNode, toString } from 'langium/generate';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { extractDestinationAndName } from './cli-util.js';
import { typeName } from '../language/sosi-utils.js';
export function generatePlantuml(spec, filePath, destination) {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.puml`;
    const allTypes = new Map();
    for (const type of spec.types) {
        addTypes(type, allTypes);
    }
    const plantumlClasses = Array.from(allTypes.values())
        .map(type => plantumlClassForType(type))
        .filter(clazz => clazz !== undefined);
    const plantumlRelations = Array.from(allTypes.values())
        .flatMap(type => plantumRelationsForType(type))
        .filter(rel => rel !== undefined);
    const fileNode = expandToNode `
      @startuml "${spec.name}"
      ${joinToNode(plantumlClasses, plantumlForClass, { appendNewLineIfNotEmpty: true })}
      ${joinToNode(plantumlRelations, plantumlForRelation, { appendNewLineIfNotEmpty: true })}
      @enduml
  `.appendNewLineIfNotEmpty();
    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, toString(fileNode));
    return generatedFilePath;
}
function addTypes(type, allTypes) {
    allTypes.set(typeName(type), type);
    if (isCompositeType(type)) {
        for (const prop of type.properties) {
            if (isInlineType(prop.type)) {
                addTypes(prop.type.typeDef, allTypes);
            }
        }
    }
}
function plantumlClassForType(type) {
    if (isCompositeType(type)) {
        return {
            name: typeName(type),
            isAbstract: type.isAbstract,
            stereotype: isCompositeType(type) ? type.kind : undefined,
            properties: type.properties
                .map(plantumlPropertyForProperty)
                .filter(p => p !== undefined),
        };
    }
    return undefined;
}
function plantumlPropertyForProperty(prop) {
    const propType = propertyType(prop);
    if (isBuiltinType(propType) || (isCompositeType(propType) && 'data' == propType.kind)) {
        return {
            name: prop.name,
            type: propertyTypeName(prop)
        };
    }
    return undefined;
}
function plantumRelationsForType(type) {
    if (isCompositeType(type)) {
        return type.properties
            .map(plantumlRelationForProperty)
            .filter(p => p !== undefined);
    }
    return undefined;
}
function plantumlRelationForProperty(prop) {
    const propType = propertyType(prop);
    if (isCompositeType(propType) && 'data' !== propType.kind) {
        return {
            source: typeName(prop.$container),
            sourceLabel: undefined,
            target: propertyTypeName(prop),
            targetLabel: undefined,
            label: prop.name
        };
    }
    return undefined;
}
function plantumlForClass(clazz) {
    return expandToNode `
    class ${clazz.name} {
        ${joinToNode(clazz.properties, plantumlForProperty, { appendNewLineIfNotEmpty: true })}
    }`;
}
function plantumlForProperty(prop) {
    return `${prop.name}: ${prop.type}`;
}
function plantumlForRelation(rel) {
    return expandToNode `${rel.source} ${rel.sourceLabel} *-> ${rel.targetLabel} ${rel.target}: ${rel.label}`;
}
function propertyType(prop) {
    if (isInlineType(prop.type)) {
        return prop.type.typeDef;
    }
    return prop.type.typeRef.ref;
}
function propertyTypeName(prop) {
    var _a, _b;
    return (_b = (_a = propertyType(prop)) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "unknown";
}
//# sourceMappingURL=generator.js.map