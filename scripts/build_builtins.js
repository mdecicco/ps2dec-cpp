const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

process.chdir(path.resolve(__dirname, '..'));

const srcDir = './src/ts';
const outBuiltinsFile = './build/builtins.js';
const outDeclarationFile = './build/builtins.d.ts';

function isPublicModule(file) {
    if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return false;
    if (file.startsWith('internal') || file.startsWith('lib')) return false;
    return true;
}

function getModuleName(filePath) {
    let rel = path.relative(srcDir, filePath).replace(/\\/g, '/');
    return rel.replace(/\.(ts|tsx)$/, '');
}

function findPublicModules(dir) {
    let results = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'internal' || entry.name === 'lib') continue;
            results = results.concat(findPublicModules(fullPath));
        } else if (isPublicModule(entry.name)) {
            results.push(fullPath);
        }
    }
    return results;
}

function convertToHeader(contents, outFile, variableName) {
    console.log(`Generating ${outFile}...`);
    let output = '#pragma once\n\n';
    output += `size_t ${variableName}_len = ${contents.length};\n`;
    output += `unsigned char ${variableName}[${contents.length}] = {\n`;
    
    const hexValues = contents.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0').toUpperCase());
    let curRowCount= 0;
    for (let i = 0; i < hexValues.length; i++) {
        const hex = hexValues[i];
        if (curRowCount === 0) output += '    ';
        output += `0x${hex}`;
        if (i < hexValues.length - 1) output += ',';
        
        curRowCount++;
        if (curRowCount >= 16) {
            output += '\n';
            curRowCount = 0;
        }
    }

    output += '\n};';
    fs.writeFileSync(outFile, output);
    return output;
}

function compileBuiltins() {
    try {
        console.log('Building builtins...');
        execSync(`npx tsc -p ${srcDir}/tsconfig.json --outFile ${outBuiltinsFile}`);
    } catch (e) {
        console.error(`Error building builtins: ${e}`);
        process.exit(1);
    }

    console.log(`Generated ${outBuiltinsFile}`);
    const builtinsCode = fs.readFileSync(outBuiltinsFile, 'utf8');
    convertToHeader(builtinsCode, './include/decomp/ts/builtins.h', 'builtins_code');
}

function sanitizeLine(line) {
    if (line === 'export {};') return '';

    if (line.startsWith('export declare')) {
        line = line.replace('export declare', 'export');
    }

    if (line.startsWith('declare ')) {
        line = line.replace('declare ', '');
    }

    return line;
}

function generateDeclarations() {
    const files = findPublicModules(srcDir);
    let output = '';
    for (const file of files) {
        const filePath = path.relative(process.cwd(), file);
        const modName = getModuleName(filePath);
        const tmpOut = `${filePath.replace(/\.[^/.]+$/, '.d.ts')}`;

        console.log(`Generating temporary declaration file for '${filePath}'`);
        try {
            execSync(`npx dts-bundle-generator --no-banner -o ${tmpOut} ${filePath}`);
            let contents = fs.readFileSync(tmpOut, 'utf8');

            const lines = [];
            contents.split('\n').map(line => '    ' + sanitizeLine(line)).forEach(line => {
                const isEmpty = line.trim().length === 0;
                if (isEmpty) {
                    if (lines.length === 0) return;
                    if (lines[lines.length - 1].trim().length === 0) return;
                }

                lines.push(line);
            });

            if (lines.length > 0 && lines[lines.length - 1].trim().length === 0) lines.pop();

            contents = lines.join('\n');
            while (contents.length > 0 && contents[0] === '\n') contents = contents.slice(1);
            while (contents.length > 0 && contents[contents.length - 1] === '\n') contents = contents.slice(0, -1);
            
            output += `declare module "${modName}" {\n${contents}\n}\n`;
        } catch (e) {
            console.error(`Error generating ${filePath}: ${e}`);
            process.exit(1);
        } finally {
            fs.unlinkSync(tmpOut);
        }
    }

    fs.writeFileSync(outDeclarationFile, output);

    console.log(`Generated ${outDeclarationFile}`);
    convertToHeader(output, './include/decomp/ts/builtins.d.h', 'builtins_d_code');
}

compileBuiltins();
generateDeclarations();