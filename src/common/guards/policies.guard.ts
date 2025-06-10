import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AbilityFactory } from '../../casl/ability.factory';
import { CHECK_POLICIES_KEY } from '../decorators/check-policies.decorator';
import { AppAbility } from '../../casl/ability.factory';
import { IPolicyHandler, PolicyHandler, PolicyHandlerCallback } from '../../common/interfaces/policy-handler.interface';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private abilityFactory: AbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers = this.reflector.get<IPolicyHandler[]>(
      CHECK_POLICIES_KEY,
      context.getHandler(),
    ) || [];

    const { user } = context.switchToHttp().getRequest();
    const ability = this.abilityFactory.createForUser(user);

    return policyHandlers.every((handler) =>
      this.execPolicyHandler(handler, ability),
    );
  }

  private execPolicyHandler(handler: PolicyHandler, ability: AppAbility) {
    if (typeof handler === 'function') {
      return (handler as PolicyHandlerCallback)(ability);
    }
    return handler.handle(ability);
  }
}