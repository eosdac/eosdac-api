import { GetCandidatesInput } from '../get-candidates.input';

describe('GetCandidatesInput', () => {
  describe('fromRequest', () => {
    it('should return JSON result object', () => {
      const result = GetCandidatesInput.create('dacID');
      const json = result.toJSON();

      expect(json).toBeDefined();
    });
  });
});
