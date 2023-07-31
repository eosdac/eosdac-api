import { inject, injectable, Result } from '@alien-worlds/aw-core';
import { GetAllDacsUseCase } from './use-cases/get-all-dacs.use-case';
import { GetDacsInput } from './models/dacs.input';
import { GetDacsOutput } from './models/get-dacs.output';
import { CreateAggregatedDacRecords } from './use-cases/create-aggregated-dac-records.use-case';

/**
 * The `DacsController` class is a controller for handling DAC-related operations.
 * @class
 */
@injectable()
export class DacsController {
  public static Token = 'DACS_CONTROLLER';

  /**
   * Creates an instance of the `DacsController` with the specified dependencies.
   * @param {GetAllDacsUseCase} getAllDacsUseCase - The use case for getting all DACs.
   * @param {CreateAggregatedDacRecords} createAggregatedDacRecords - The use case for creating aggregated DAC records.
   */
  constructor(
    @inject(GetAllDacsUseCase.Token)
    private getAllDacsUseCase: GetAllDacsUseCase,
    @inject(CreateAggregatedDacRecords.Token)
    private createAggregatedDacRecords: CreateAggregatedDacRecords
  ) {}

  /**
   * Gets a list of DACs based on the provided input.
   * @param {GetDacsInput} input - The input for getting DACs.
   * @returns {Promise<GetDacsOutput>} - The result of the operation containing the list of DACs.
   */
  public async getDacs(input: GetDacsInput): Promise<GetDacsOutput> {
    const { content: dacs, failure: getAllDacsFailure } =
      await this.getAllDacsUseCase.execute(input);

    if (getAllDacsFailure) {
      return GetDacsOutput.create(Result.withFailure(getAllDacsFailure));
    }

    const aggregationResult = await this.createAggregatedDacRecords.execute(
      dacs
    );

    return GetDacsOutput.create(aggregationResult);
  }
}
