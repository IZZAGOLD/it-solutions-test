import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ProfessionalLink {
  @Field()
  name: string;

  @Field()
  url: string;
}

@ObjectType()
export class Skill {
  @Field()
  name: string;
}

@ObjectType()
export class Experience {
  @Field()
  company: string;

  @Field()
  position: string;

  @Field({ description: 'Месяц начала работы в формате YYYY-MM' })
  startDate: string;

  @Field(() => String, {
    nullable: true,
    description:
      'Месяц окончания работы в формате YYYY-MM; null — по настоящее время',
  })
  endDate: string | null;

  @Field(() => [String])
  achievements: string[];
}

@ObjectType()
export class Project {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  url: string;
}

@ObjectType()
export class Profile {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => [ProfessionalLink])
  links: ProfessionalLink[];

  @Field(() => [Skill])
  skills: Skill[];

  @Field(() => [Experience])
  experience: Experience[];

  @Field(() => [Project])
  projects: Project[];
}
