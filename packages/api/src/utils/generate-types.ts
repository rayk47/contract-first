import SwaggerParser from "@apidevtools/swagger-parser";
import { generateApi } from "swagger-typescript-api";
import yamlToJson from "js-yaml";
import { existsSync, readFileSync, unlinkSync } from "fs";
import { openapiSchemaToJsonSchema } from '@openapi-contrib/openapi-schema-to-json-schema';
import { JSONSchema4 } from "json-schema";
import $RefParser from "@apidevtools/json-schema-ref-parser";
import fsExtra from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generateTypesFromOpenAPIYaml = async () => {
    const yamlFile = join(__dirname, '../lib/openapi.yaml');
    await validateYamlSchema(yamlFile);
    await buildApiTypes(yamlFile);
    await buildJsonSchemaTypes(yamlFile);
}

const validateYamlSchema = async (yamlFile: string) => {
    try {
        const api = await SwaggerParser.validate(yamlFile);
        console.log("API name: %s, Version: %s", api.info.title, api.info.version);
    } catch (err) {
        console.error(err);
    }
};

const buildApiTypes = async (yamlFile: string) => {
    await generateApi({
        fileName: 'contract-first-api-types.ts',
        output: (join(__dirname, '../lib/')),
        input: yamlFile,
        generateClient: false,
        generateRouteTypes: true,
        toJS: false,
        silent: true
    });

    const apiFile = join(__dirname, '../lib/Api.ts');
    if (existsSync(apiFile)) {
        unlinkSync(apiFile);
    }
};

const buildJsonSchemaTypes = async (yamlFile: string) => {
    const fileAsJson = yamlToJson.load(readFileSync(yamlFile, 'utf8'));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let openApiConvertedToJsonSchema = openapiSchemaToJsonSchema(fileAsJson as any);
    openApiConvertedToJsonSchema = removeInvalidJsonSchema(openApiConvertedToJsonSchema);
    openApiConvertedToJsonSchema = await $RefParser.dereference(openApiConvertedToJsonSchema);

    let temp = jsonSchemaFileData;

    if (openApiConvertedToJsonSchema?.['components']?.['schemas']) {
        for (const [key, value] of Object.entries(openApiConvertedToJsonSchema?.['components']?.['schemas'])) {
            (value as any)['title'] = key;
            (value as any)['schema'] = 'replace_with_aws_json_schema';
            temp = temp + `export const ${key}Schema = ${JSON.stringify(value)};`;
        }

        temp = temp.replace(/"format": "date"/g, '"pattern":"^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$"');
        temp = temp.replace(/"type":"object"/g, '"type":JsonSchemaType.OBJECT');
        temp = temp.replace(/"type":"string"/g, '"type":JsonSchemaType.STRING');
        temp = temp.replace(/"type":"array"/g, '"type":JsonSchemaType.ARRAY');
        temp = temp.replace(/"type":"boolean"/g, '"type":JsonSchemaType.BOOLEAN');
        temp = temp.replace(/"type":"integer"/g, '"type":JsonSchemaType.INTEGER');
        temp = temp.replace(/"type":"number"/g, '"type":JsonSchemaType.NUMBER');
        temp = temp.replace(/"type":"null"/g, '"type":JsonSchemaType.NULL');
        temp = temp.replace(/"replace_with_aws_json_schema"/g, 'JsonSchemaVersion.DRAFT4');

        fsExtra.writeFileSync(join(__dirname, '../lib/contract-first-json-schema-types.ts'), temp);
    }

};

const removeInvalidJsonSchema = (jsonSchema: JSONSchema4) => {
    const invalidKeys = ['example', 'examples'];
    for (const invalidKey of invalidKeys) {
        if (jsonSchema[invalidKey]) {
            delete jsonSchema[invalidKey];
        }
    };

    for (const [key, value] of Object.entries(jsonSchema)) {
        if (value && value === Object(value)) {
            jsonSchema[key] = removeInvalidJsonSchema(value);
        }
    }
    return jsonSchema;
}


const jsonSchemaFileData = `
/* eslint-disable */

/**
 * ---------------------------------------------------------------------------
 * # This is a generated file at build time, do not edit it manually.
 * ---------------------------------------------------------------------------
 */

import {JsonSchemaType, JsonSchemaVersion} from 'aws-cdk-lib/aws-apigateway';
`;

generateTypesFromOpenAPIYaml();
