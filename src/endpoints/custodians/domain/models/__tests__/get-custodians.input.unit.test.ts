import { GetCustodiansInput } from '../get-custodians.input';

describe('GetCustodiansInput', () => {
	describe('fromRequest', () => {
		it('should create a GetCustodiansInput instance with the correct parameters', () => {
			const request = {
				params: { dacId: 'someDacId' },
			};

			const getCustodiansInput = GetCustodiansInput.fromRequest(request as any);

			expect(getCustodiansInput.dacId).toBe('someDacId');
		});
	});
});
