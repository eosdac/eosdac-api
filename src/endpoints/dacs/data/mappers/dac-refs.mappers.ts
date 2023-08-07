import { DacRefIndex, DacRefKey } from '@endpoints/dacs/domain/dac.enums';

import { DacRefs } from '@endpoints/dacs/domain/entities/dac-refs';
import { Pair } from '@alien-worlds/aw-antelope';

/**
 * The `DacRefsMapper` class is responsible for converting a list of key-value pairs into a `DacRefs` object,
 * which represents the references (URLs and other data) associated with a DAC.
 */
export class DacRefsMapper {
  /**
   * Converts a list of key-value pairs into a `DacRefs` object.
   * @param {Pair[]} refs - The list of key-value pairs representing the DAC references.
   * @returns {DacRefs} - The DacRefs object representing the references associated with the DAC.
   */
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
