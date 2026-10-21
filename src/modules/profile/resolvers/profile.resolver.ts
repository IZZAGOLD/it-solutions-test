import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import {
  Experience,
  ProfessionalLink,
  Profile,
  Project,
  Skill,
} from '../graphql-types/profile.graphql-types';
import { ProfileService } from '../services/profile.service';

@Resolver(() => Profile)
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Query(() => Profile, { nullable: true })
  profile() {
    return this.profileService.getProfile();
  }

  @ResolveField(() => [ProfessionalLink])
  links(@Parent() profile: Profile) {
    return this.profileService.getLinks(profile.id);
  }

  @ResolveField(() => [Skill])
  skills(@Parent() profile: Profile) {
    return this.profileService.getSkills(profile.id);
  }

  @ResolveField(() => [Experience])
  experience(@Parent() profile: Profile) {
    return this.profileService.getExperience(profile.id);
  }

  @ResolveField(() => [Project])
  projects(@Parent() profile: Profile) {
    return this.profileService.getProjects(profile.id);
  }
}
