import { DacAccounts } from '../dac-accounts';

describe('DacAccounts', () => {
  let dacAccounts: DacAccounts;

  beforeEach(() => {
    dacAccounts = new DacAccounts(
      'auth',
      'treasury',
      'custodian',
      'msigOwned',
      'service',
      'proposals',
      'escrow',
      'voteWeight',
      'activation',
      'referendum',
      'spendings',
      'external',
      'other',
      'id'
    );
  });

  it('should create DacAccounts instance', () => {
    expect(dacAccounts).toBeInstanceOf(DacAccounts);
  });

  it('should have correctly assigned properties', () => {
    expect(dacAccounts.auth).toBe('auth');
    expect(dacAccounts.treasury).toBe('treasury');
    expect(dacAccounts.custodian).toBe('custodian');
    expect(dacAccounts.msigOwned).toBe('msigOwned');
    expect(dacAccounts.service).toBe('service');
    expect(dacAccounts.proposals).toBe('proposals');
    expect(dacAccounts.escrow).toBe('escrow');
    expect(dacAccounts.voteWeight).toBe('voteWeight');
    expect(dacAccounts.activation).toBe('activation');
    expect(dacAccounts.referendum).toBe('referendum');
    expect(dacAccounts.spendings).toBe('spendings');
    expect(dacAccounts.external).toBe('external');
    expect(dacAccounts.other).toBe('other');
    expect(dacAccounts.id).toBe('id');
    expect(dacAccounts.rest).toBeUndefined();
  });

  it('should convert to JSON object properly', () => {
    const json = dacAccounts.toJSON();

    expect(json).toEqual({
      auth: 'auth',
      treasury: 'treasury',
      custodian: 'custodian',
      msigOwned: 'msigOwned',
      service: 'service',
      proposals: 'proposals',
      escrow: 'escrow',
      voteWeight: 'voteWeight',
      activation: 'activation',
      referendum: 'referendum',
      spendings: 'spendings',
      external: 'external',
      other: 'other',
    });
  });

  it('should create a new DacAccounts instance using static create method', () => {
    const createdDacAccounts = DacAccounts.create(
      'auth',
      'treasury',
      'custodian',
      'msigOwned',
      'service',
      'proposals',
      'escrow',
      'voteWeight',
      'activation',
      'referendum',
      'spendings',
      'external',
      'other',
      'id',
      {}
    );

    expect(createdDacAccounts).toBeInstanceOf(DacAccounts);
    expect(createdDacAccounts.auth).toBe('auth');
    expect(createdDacAccounts.treasury).toBe('treasury');
    expect(createdDacAccounts.custodian).toBe('custodian');
    expect(createdDacAccounts.msigOwned).toBe('msigOwned');
    expect(createdDacAccounts.service).toBe('service');
    expect(createdDacAccounts.proposals).toBe('proposals');
    expect(createdDacAccounts.escrow).toBe('escrow');
    expect(createdDacAccounts.voteWeight).toBe('voteWeight');
    expect(createdDacAccounts.activation).toBe('activation');
    expect(createdDacAccounts.referendum).toBe('referendum');
    expect(createdDacAccounts.spendings).toBe('spendings');
    expect(createdDacAccounts.external).toBe('external');
    expect(createdDacAccounts.other).toBe('other');
    expect(createdDacAccounts.id).toBe('id');
    expect(dacAccounts.rest).toBeUndefined();
  });
});
