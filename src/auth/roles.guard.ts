import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GqlExecutionContext } from '@nestjs/graphql'
import { ROLES_KEY } from './roles.decorator'
import { User } from '../modules/users/user.entity'
import { Role } from 'src/graphql.schema'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [context.getHandler(), context.getClass()])
    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }
    const ctx = GqlExecutionContext.create(context)
    const user = ctx.getContext().req.user as User | undefined
    if (!user) {
      return false
    }
    return requiredRoles.includes(user.role)
  }
}
