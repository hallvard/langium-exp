/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.SosiValidator;
    const checks = {
        Specification: [
            validator.checkSpecificationHasTypes
        ],
        CompositeType: [
            validator.checkFeatureTypeHasIdProperty
        ]
    };
    registry.register(checks, validator);
}
/**
 * Implementation of custom validations.
 */
export class SosiValidator {
    checkSpecificationHasTypes(ns, accept) {
        if (ns.types.length === 0) {
            accept('warning', 'A Namespace (package or specification) should have some types.', { node: ns, property: 'types' });
        }
    }
    checkFeatureTypeHasIdProperty(type, accept) {
        var _a;
        const typeKind = (_a = type.kind) !== null && _a !== void 0 ? _a : 'feature';
        const expectedIdCount = ('data' == typeKind ? 0 : 1);
        const actualIdCount = type.properties.filter(prop => '#' == prop.kind).length;
        if (actualIdCount != expectedIdCount) {
            accept('error', `A ${typeKind} type must have exactly ${expectedIdCount} # (id) ${expectedIdCount === 1 ? 'property' : 'properties'}, this one has ${actualIdCount}.`, { node: type, property: 'properties' });
        }
    }
}
//# sourceMappingURL=sosi-validator.js.map