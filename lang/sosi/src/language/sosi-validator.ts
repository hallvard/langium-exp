import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { SosiAstType, Specification } from './generated/ast.js';
import type { SosiServices } from './sosi-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: SosiServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.SosiValidator;
    const checks: ValidationChecks<SosiAstType> = {
        Specification: validator.checkSpecificationHasTypes
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class SosiValidator {

    checkSpecificationHasTypes(spec: Specification, accept: ValidationAcceptor): void {
        if (spec.types.length === 0) {
            accept('warning', 'Specification should have some types.', { node: spec, property: 'types' });
        }
    }

}
