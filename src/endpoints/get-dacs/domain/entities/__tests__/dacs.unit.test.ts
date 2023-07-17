import { Dac } from '../dacs';
import { DacAccounts } from '../dac-accounts';
import { DacRefs } from '../dac-refs';
import { ExtendedSymbol } from '@alien-worlds/eosio-contract-types';

describe('Dac', () => {
  describe('constructor', () => {
    it('should create an instance of Dac', () => {
      const owner = 'testOwner';
      const dacId = 'testDacId';
      const title = 'testTitle';
      const symbol = ExtendedSymbol.getDefault();
      const refs = DacRefs.getDefault();
      const accounts = DacAccounts.getDefault();
      const dacState = 0;

      const dac = new Dac(
        owner,
        dacId,
        title,
        symbol,
        refs,
        accounts,
        dacState
      );

      expect(dac).toBeInstanceOf(Dac);
      expect(dac.owner).toBe(owner);
      expect(dac.dacId).toBe(dacId);
      expect(dac.title).toBe(title);
      expect(dac.symbol).toEqual(symbol);
      expect(dac.refs).toEqual(refs);
      expect(dac.accounts).toEqual(accounts);
      expect(dac.dacState).toBe(dacState);
    });
  });

  describe('toJSON', () => {
    it('should convert the Dac object to JSON', () => {
      const owner = 'testOwner';
      const dacId = 'testDacId';
      const title = 'testTitle';
      const symbol = ExtendedSymbol.getDefault();
      const refs = DacRefs.getDefault();
      const accounts = DacAccounts.getDefault();
      const dacState = 0;

      const dac = new Dac(
        owner,
        dacId,
        title,
        symbol,
        refs,
        accounts,
        dacState
      );
      const json = dac.toJSON();

      expect(json).toEqual({
        owner,
        dacId,
        title,
        symbol,
        refs: refs.toJSON(),
        accounts: accounts.toJSON(),
        dacState,
      });
    });
  });

  describe('create', () => {
    it('should create a new instance of Dac', () => {
      const owner = 'testOwner';
      const dacId = 'testDacId';
      const title = 'testTitle';
      const symbol = ExtendedSymbol.getDefault();
      const refs = DacRefs.getDefault();
      const accounts = DacAccounts.getDefault();
      const dacState = 0;

      const dac = Dac.create(
        owner,
        dacId,
        title,
        symbol,
        refs,
        accounts,
        dacState
      );

      expect(dac).toBeInstanceOf(Dac);
      expect(dac.owner).toBe(owner);
      expect(dac.dacId).toBe(dacId);
      expect(dac.title).toBe(title);
      expect(dac.symbol).toEqual(symbol);
      expect(dac.refs).toEqual(refs);
      expect(dac.accounts).toEqual(accounts);
      expect(dac.dacState).toBe(dacState);
    });
  });

  describe('getDefault', () => {
    it('should return the default Dac instance', () => {
      const defaultDac = Dac.getDefault();

      expect(defaultDac).toBeInstanceOf(Dac);
      expect(defaultDac.owner).toBe('');
      expect(defaultDac.dacId).toBe('');
      expect(defaultDac.title).toBe('');
      expect(defaultDac.symbol).toEqual(ExtendedSymbol.getDefault());
      expect(defaultDac.refs).toEqual(DacRefs.getDefault());
      expect(defaultDac.accounts).toEqual(DacAccounts.getDefault());
      expect(defaultDac.dacState).toBe(0);
    });
  });
});
