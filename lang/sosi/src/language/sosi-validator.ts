import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { CompositeType, Namespace, SosiAstType } from './generated/ast.js';
import type { SosiServices } from './sosi-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: SosiServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.SosiValidator;
    const checks: ValidationChecks<SosiAstType> = {
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

  checkSpecificationHasTypes(ns: Namespace, accept: ValidationAcceptor): void {
    if (ns.types.length === 0) {
      accept('warning', 'A Namespace (package or specification) should have some types.', { node: ns });
    }
  }

  checkFeatureTypeHasIdProperty(type: CompositeType, accept: ValidationAcceptor): void {
    const typeKind = type.kind ?? 'feature';
    const expectedIdCount = ('data' == typeKind ? 0 : 1);
    const actualIdCount = type.properties.filter(prop => '#' == prop.kind).length;
    if (actualIdCount != expectedIdCount) {
        accept('error', `A ${typeKind} type must have exactly ${expectedIdCount} # (id) ${expectedIdCount === 1 ? 'property' : 'properties'}, this one has ${actualIdCount}.`,
            { node: type, property: 'properties', index: undefined });
    }
  }
}
