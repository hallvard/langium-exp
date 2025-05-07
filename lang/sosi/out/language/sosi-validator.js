/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.SosiValidator;
    const checks = {
        Specification: validator.checkSpecificationHasTypes
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
}
//# sourceMappingURL=sosi-validator.js.map