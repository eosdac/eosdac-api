import { DacRefs } from '../dac-refs';

describe('DacRefs', () => {
  let dacRefs: DacRefs;

  beforeEach(() => {
    dacRefs = DacRefs.getDefault();
  });

  it('should create new instance of DacRefs', () => {
    expect(dacRefs).toBeDefined();
    expect(dacRefs).toBeInstanceOf(DacRefs);
  });

  it('should set properties correctly', () => {
    dacRefs = DacRefs.create(
      'homepage',
      'logoUrl',
      'description',
      'logoNoTextUrl',
      'backgroundUrl',
      'colors',
      'clientExtension',
      'faviconUrl',
      'dacCurrencyUrl',
      'systemCurrencyUrl',
      'discordUrl',
      'telegramUrl'
    );

    expect(dacRefs.homepage).toBe('homepage');
    expect(dacRefs.logoUrl).toBe('logoUrl');
    expect(dacRefs.description).toBe('description');
    expect(dacRefs.logoNoTextUrl).toBe('logoNoTextUrl');
    expect(dacRefs.backgroundUrl).toBe('backgroundUrl');
    expect(dacRefs.colors).toBe('colors');
    expect(dacRefs.clientExtension).toBe('clientExtension');
    expect(dacRefs.faviconUrl).toBe('faviconUrl');
    expect(dacRefs.dacCurrencyUrl).toBe('dacCurrencyUrl');
    expect(dacRefs.systemCurrencyUrl).toBe('systemCurrencyUrl');
    expect(dacRefs.discordUrl).toBe('discordUrl');
    expect(dacRefs.telegramUrl).toBe('telegramUrl');
  });

  it('should set rest property correctly', () => {
    const rest = { key: 'value' };
    dacRefs.rest = rest;

    expect(dacRefs.rest).toBe(rest);
  });

  it('should convert to JSON correctly', () => {
    dacRefs = DacRefs.create(
      'homepage',
      'logoUrl',
      'description',
      'logoNoTextUrl',
      'backgroundUrl',
      'colors',
      'clientExtension',
      'faviconUrl',
      'dacCurrencyUrl',
      'systemCurrencyUrl',
      'discordUrl',
      'telegramUrl'
    );

    const expectedJson = {
      homepage: 'homepage',
      logoUrl: 'logoUrl',
      description: 'description',
      logoNoTextUrl: 'logoNoTextUrl',
      backgroundUrl: 'backgroundUrl',
      colors: 'colors',
      clientExtension: 'clientExtension',
      faviconUrl: 'faviconUrl',
      dacCurrencyUrl: 'dacCurrencyUrl',
      systemCurrencyUrl: 'systemCurrencyUrl',
      discordUrl: 'discordUrl',
      telegramUrl: 'telegramUrl',
      rest: undefined,
    };

    expect(dacRefs.toJSON()).toEqual(expectedJson);
  });
});
