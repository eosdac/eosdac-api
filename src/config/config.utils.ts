import { log } from '@alien-worlds/aw-core';
import { readFileSync } from 'fs';
import path from 'path';
import { Environment } from './config.types';

const LINE =
  /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/gm;

export const parseEnvFile = (buffer: Buffer | string): Environment => {
  const obj: Environment = {};

  // Convert buffer to string
  let lines = buffer.toString();

  // Convert line breaks to same format
  lines = lines.replace(/\r\n?/gm, '\n');

  let match;
  while ((match = LINE.exec(lines)) != null) {
    const key = match[1];

    // Default undefined or null to empty string
    let value = match[2] || '';

    // Remove whitespace
    value = value.trim();

    // Check if double quoted
    const maybeQuote = value[0];

    // Remove surrounding quotes
    value = value.replace(/^(['"`])([\s\S]*)\1$/gm, '$2');

    // Expand newlines if double quoted
    if (maybeQuote === '"') {
      value = value.replace(/\\n/g, '\n');
      value = value.replace(/\\r/g, '\r');
    }

    // Add to object
    obj[key] = value;
  }

  return obj;
};

export const readEnvFile = (envPath?: string): Environment => {
  try {
    const env: Environment = parseEnvFile(
      readFileSync(envPath || path.resolve(process.cwd(), '.env'), {
        encoding: 'utf8',
      })
    );
    return env;
  } catch (error) {
    log(error);
    return {};
  }
};
