import { Actions } from '@alien-worlds/aw-contract-dao-worlds';
import { DependencyInjector, RepositoryImpl } from '@alien-worlds/aw-core';
import {
  MongoQueryBuilders,
  MongoSource,
} from '@alien-worlds/aw-storage-mongodb';
import { FlagMongoSource } from './data/data-sources/flag.mongo.source';
import { FlagRepository } from './domain/repositories/flag.repository';
import { ProfileController } from './domain/profile.controller';
import { GetProfilesUseCase } from './domain/use-cases/get-profiles.use-case';
import { FilterFlaggedProfilesUseCase } from './domain/use-cases/filter-flagged-profiles.use-case';
import { GetProfileFlagsUseCase } from './domain/use-cases/get-profile-flags.use-case';

export class ProfileDependencyInjector extends DependencyInjector {
  public async setup(mongoSource: MongoSource): Promise<void> {
    const { container } = this;
    const mapper = new Actions.Mappers.FlagcandprofMongoMapper();
    const repository = new RepositoryImpl(
      new FlagMongoSource(mongoSource),
      mapper,
      new MongoQueryBuilders(mapper)
    );

    container
      .bind<FlagRepository>(FlagRepository.Token)
      .toConstantValue(repository);
    container
      .bind<GetProfilesUseCase>(GetProfilesUseCase.Token)
      .to(GetProfilesUseCase);
    container
      .bind<GetProfileFlagsUseCase>(GetProfileFlagsUseCase.Token)
      .to(GetProfileFlagsUseCase);
    container
      .bind<FilterFlaggedProfilesUseCase>(FilterFlaggedProfilesUseCase.Token)
      .to(FilterFlaggedProfilesUseCase);
    container
      .bind<ProfileController>(ProfileController.Token)
      .to(ProfileController);
  }
}
