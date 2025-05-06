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
    checkSpecificationHasTypes(spec, accept) {
        if (spec.types.length === 0) {
            accept('warning', 'Specification should have some types.', { node: spec, property: 'types' });
        }
    }
}
//# sourceMappingURL=sosi-validator.js.map