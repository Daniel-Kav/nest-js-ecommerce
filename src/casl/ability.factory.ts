import { Injectable } from '@nestjs/common';
import { Ability, AbilityBuilder, AbilityClass, ExtractSubjectType, InferSubjects } from '@casl/ability';
import { Action } from './actions.enum';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Review } from '../reviews/entities/review.entity';
import { Order } from '../orders/entities/order.entity';
import { UserRole } from '../common/enums/user-role.enum';

type Subjects = InferSubjects<typeof User | typeof Product | typeof Review | typeof Order> | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class AbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder<Ability<[Action, Subjects]>>(Ability as AbilityClass<AppAbility>);

    if (user.role === UserRole.ADMIN) {
      can(Action.Manage, 'all'); // Admin can do everything
    } else if (user.role === UserRole.STAFF) {
      // Staff permissions
      can(Action.Read, 'all');
      can([Action.Create, Action.Update], [Product, Order]);
    } else {
      // Customer permissions
      can(Action.Read, [Product, Review]);
      can(Action.Create, [Review, Order]);
      can(Action.Update, User, { id: user.id } as const);
      can(Action.Update, Review, { userId: user.id } as const);
      can(Action.Delete, Review, { userId: user.id } as const);
    }

    return build({
      detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}