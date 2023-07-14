import { DacRefIndex, DacRefKey } from '@endpoints/get-dacs/domain/dac.enums';

import { DacRefs } from '@endpoints/get-dacs/domain/entities/dac-refs';
import { Pair } from '@alien-worlds/eosio-contract-types';

export class DacRefsMapper {
  public toDacRefs(refs: Pair[]): DacRefs {
    const data = {},
      rest = {};

    refs.forEach(ref => {
      const label = DacRefKey[DacRefIndex[ref.key]];

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
