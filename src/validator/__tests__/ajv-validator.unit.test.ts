import { AjvValidator } from '../ajv-validator';

describe('AjvValidator', () => {
  let validator: AjvValidator;

  beforeEach(() => {
    validator = AjvValidator.initialize() as any;
  });

  describe('validate', () => {
    it('should return true for valid schema and data', () => {
      const schema = {
        type: 'object',
        properties: { name: { type: 'string' } },
      };
      const data = { name: 'John Doe' };

      const result = validator.validate(schema, data);

      expect(result).toBe(true);
    });

    it('should return false for invalid schema and data', () => {
      const schema = {
        type: 'object',
        properties: { isActive: { type: 'boolean' } },
      };
      const data = { isActive: '30' };

      const result = validator.validate(schema, data);

      expect(result).toBe(false);
    });
  });

  describe('validateHttpRequest', () => {
    it('should return a valid ValidationResult for a valid request', () => {
      const jsonSchema = {
        type: 'object',
        properties: { name: { type: 'string' } },
      };
      const request = { body: { name: 'John Doe' } };

      const result = validator.validateHttpRequest(jsonSchema, request as any);

      expect(result.valid).toBe(true);
      expect(result.message).toBe('');
      expect(result.errors).toEqual([]);
    });

    it('should return an invalid ValidationResult for an invalid request', () => {
      const jsonSchema = {
        type: 'object',
        properties: { isActive: { type: 'boolean' } },
      };

      const payload = { isActive: '30' };

      const result = validator.validateHttpRequest(jsonSchema, payload as any);

      expect(result.valid).toBe(false);
      expect(result.message).toBe('bad request');
      expect(result.errors).toEqual(['/isActive must be boolean']);
    });
  });

  describe('assert', () => {
    it('should not throw an error for valid schema and data', () => {
      const schema = {
        type: 'object',
        properties: { name: { type: 'string' } },
      };
      const data = { name: 'John Doe' };

      expect(() => {
        validator.assert(schema, data);
      }).not.toThrow();
    });

    it('should throw an error for invalid schema and data', () => {
      const schema = {
        type: 'object',
        properties: { isActive: { type: 'boolean' } },
      };
      const data = { isActive: '30' };

      expect(() => {
        validator.assert(schema, data);
      }).toThrowError('isActive must be boolean');
    });
  });
});
