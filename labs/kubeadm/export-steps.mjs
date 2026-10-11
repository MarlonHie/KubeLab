import ts from 'typescript';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../../apps/web/src/pages/buildSteps.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {buildSteps}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
process.stdout.write(JSON.stringify(buildSteps,null,2));
