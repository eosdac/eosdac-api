import { inject, injectable, Result } from '@alien-worlds/aw-core';
import { GetAllDacsUseCase } from './use-cases/get-all-dacs.use-case';
import { GetDacsInput } from './models/dacs.input';
import { GetDacsOutput } from './models/get-dacs.output';
import { CreateAggregatedDacRecords } from './use-cases/create-aggregated-dac-records.use-case';

/**
 * @class
 */
@injectable()
export class DacsController {
  public static Token = 'DACS_CONTROLLER';

  constructor(
    @inject(GetAllDacsUseCase.Token)
    private getAllDacsUseCase: GetAllDacsUseCase,
    @inject(CreateAggregatedDacRecords.Token)
    private createAggregatedDacRecords: CreateAggregatedDacRecords
  ) {}

  /**
   *
   * @returns {Promise<GetDacsOutput>}
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
