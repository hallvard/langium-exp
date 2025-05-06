import chalk from 'chalk';
import { Command } from 'commander';
import { SosiLanguageMetaData } from '../language/generated/module.js';
import { createSosiServices } from '../language/sosi-module.js';
import { extractAstNode } from './cli-util.js';
import { generatePlantuml } from './generator.js';
import { NodeFileSystem } from 'langium/node';
import * as url from 'node:url';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const packagePath = path.resolve(__dirname, '..', '..', 'package.json');
const packageContent = await fs.readFile(packagePath, 'utf-8');
export const generatePlantumlAction = async (fileName, opts) => {
    const services = createSosiServices(NodeFileSystem).Sosi;
    const spec = await extractAstNode(fileName, services);
    const generatedFilePath = generatePlantuml(spec, fileName, opts.destination);
    console.log(chalk.green(`Plantuml generated to ${generatedFilePath}`));
};
export default function () {
    const program = new Command();
    program.version(JSON.parse(packageContent).version);
    const fileExtensions = SosiLanguageMetaData.fileExtensions.join(', ');
    program
        .command('plantuml')
        .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
        .option('-d, --destination <dir>', 'destination directory of generating')
        .description('generates Plantuml code corresponding to the types in our specification')
        .action(generatePlantumlAction);
    program.parse(process.argv);
}
//# sourceMappingURL=main.js.map