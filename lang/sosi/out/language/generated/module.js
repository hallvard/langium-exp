/******************************************************************************
 * This file was generated by langium-cli 3.5.0.
 * DO NOT EDIT MANUALLY!
 ******************************************************************************/
import { SosiAstReflection } from './ast.js';
import { SosiGrammar } from './grammar.js';
export const SosiLanguageMetaData = {
    languageId: 'sosi',
    fileExtensions: ['.sosi'],
    caseInsensitive: false,
    mode: 'development'
};
export const SosiGeneratedSharedModule = {
    AstReflection: () => new SosiAstReflection()
};
export const SosiGeneratedModule = {
    Grammar: () => SosiGrammar(),
    LanguageMetaData: () => SosiLanguageMetaData,
    parser: {}
};
//# sourceMappingURL=module.js.map