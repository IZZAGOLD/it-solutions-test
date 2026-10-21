import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database/database.module';
import { ProfileResolver } from './resolvers/profile.resolver';
import { ProfileService } from './services/profile.service';

@Module({
  imports: [DatabaseModule],
  providers: [ProfileService, ProfileResolver],
})
export class ProfileModule {}
