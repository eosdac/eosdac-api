import * as IndexWorldsCommon from '@alien-worlds/index-worlds-common';

import { DacRefIndex, DacRefKey } from '@endpoints/get-dacs/domain/dac.enums';

import { DacRefs } from '@endpoints/get-dacs/domain/entities/dac-refs';

export class DacRefsMapper {
  private refKeys = new Map<DacRefIndex, DacRefKey>([
    [DacRefIndex.BackgroundUrl, DacRefKey.BackgroundUrl],
    [DacRefIndex.ClientExtension, DacRefKey.ClientExtension],
    [DacRefIndex.Colors, DacRefKey.Colors],
    [DacRefIndex.DacCurrencyUrl, DacRefKey.DacCurrencyUrl],
    [DacRefIndex.Description, DacRefKey.Description],
    [DacRefIndex.DiscordUrl, DacRefKey.DiscordUrl],
    [DacRefIndex.FaviconUrl, DacRefKey.FaviconUrl],
    [DacRefIndex.Homepage, DacRefKey.Homepage],
    [DacRefIndex.LogoNotextUrl, DacRefKey.LogoNotextUrl],
    [DacRefIndex.LogoUrl, DacRefKey.LogoUrl],
    [DacRefIndex.SystemCurrencyUrl, DacRefKey.SystemCurrencyUrl],
    [DacRefIndex.TelegramUrl, DacRefKey.TelegramUrl],
  ]);

  public toDacRefs(
    refs: IndexWorldsCommon.Deltas.Entities.PairUint8String[]
  ): DacRefs {
    const data = {},
      rest = {};

    refs.forEach(ref => {
      const label = this.refKeys.get(ref.key);
      if (label) {
        data[label] = ref.value;
      } else {
        rest[ref.key] = ref.value;
      }
    });

    return DacRefs.create(
      data[DacRefKey.Homepage],
      data[DacRefKey.LogoUrl],
      data[DacRefKey.Description],
      data[DacRefKey.LogoNotextUrl],
      data[DacRefKey.BackgroundUrl],
      data[DacRefKey.Colors],
      data[DacRefKey.ClientExtension],
      data[DacRefKey.FaviconUrl],
      data[DacRefKey.DacCurrencyUrl],
      data[DacRefKey.SystemCurrencyUrl],
      data[DacRefKey.DiscordUrl],
      data[DacRefKey.TelegramUrl],
      null,
      rest
    );
  }
}
