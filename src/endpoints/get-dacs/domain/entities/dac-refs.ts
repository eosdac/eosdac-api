import { Entity, UnknownObject } from '@alien-worlds/api-core';

/**
 * Represents a `DacRefs` object.
 *
 * @class
 */
export class DacRefs implements Entity {
  /**
   * Constructs a new instance of the `DacRefs` class.
   *
   * @public
   * @constructor
   * @param string homepage
   * @param string logoUrl
   * @param string description
   * @param string logoNoTextUrl
   * @param string backgroundUrl
   * @param string colors
   * @param string clientExtension
   * @param string faviconUrl
   * @param string dacCurrencyUrl
   * @param string systemCurrencyUrl
   * @param string discordUrl
   * @param string telegramUrl
   * @param string [id]
   * @returns `DacRefs` - An instance of the `DacRefs` class.
   */
  public constructor(
    public homepage: string,
    public logoUrl: string,
    public description: string,
    public logoNoTextUrl: string,
    public backgroundUrl: string,
    public colors: string,
    public clientExtension: string,
    public faviconUrl: string,
    public dacCurrencyUrl: string,
    public systemCurrencyUrl: string,
    public discordUrl: string,
    public telegramUrl: string,
    public id?: string
  ) {}

  public rest?: UnknownObject;

  /**
   * Converts the current instance of the `DacRefs` class to a JSON object.
   *
   * @public
   * @returns {UnknownObject} The JSON representation of the instance.
   */
  public toJSON(): UnknownObject {
    const {
      homepage,
      logoUrl,
      description,
      logoNoTextUrl,
      backgroundUrl,
      colors,
      clientExtension,
      faviconUrl,
      dacCurrencyUrl,
      systemCurrencyUrl,
      discordUrl,
      telegramUrl,
      rest,
    } = this;

    return {
      homepage,
      logoUrl,
      description,
      logoNoTextUrl,
      backgroundUrl,
      colors,
      clientExtension,
      faviconUrl,
      dacCurrencyUrl,
      systemCurrencyUrl,
      discordUrl,
      telegramUrl,
      rest,
    };
  }

  /**
   * Creates an instance of the `DacRefs` class.
   *
   * @static
   * @public
   * @returns `DacRefs` An instance of the `DacRefs` class.
   */
  public static create(
    homepage: string,
    logoUrl: string,
    description: string,
    logoNoTextUrl: string,
    backgroundUrl: string,
    colors: string,
    clientExtension: string,
    faviconUrl: string,
    dacCurrencyUrl: string,
    systemCurrencyUrl: string,
    discordUrl: string,
    telegramUrl: string,
    id?: string,
    rest?: UnknownObject
  ): DacRefs {
    const entity = new DacRefs(
      homepage,
      logoUrl,
      description,
      logoNoTextUrl,
      backgroundUrl,
      colors,
      clientExtension,
      faviconUrl,
      dacCurrencyUrl,
      systemCurrencyUrl,
      discordUrl,
      telegramUrl,
      id
    );
    entity.rest = rest;

    return entity;
  }

  public static getDefault(): DacRefs {
    return new DacRefs('', '', '', '', '', '', '', '', '', '', '', '');
  }
}
