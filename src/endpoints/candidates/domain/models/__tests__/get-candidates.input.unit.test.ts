import { GetCandidatesInput } from "../get-candidates.input";

describe('GetCandidatesInput', () => {
  describe('fromRequest', () => {
    it('should create a GetCandidatesInput instance with the correct parameters', () => {
      const request = {
        query: { walletId: 'someWalletId' },
        params: { dacId: 'someDacId' }
      };

      const getCandidatesInput = GetCandidatesInput.fromRequest(request as any);

      expect(getCandidatesInput.walletId).toBe('someWalletId');
      expect(getCandidatesInput.dacId).toBe('someDacId');
    });
  });
});