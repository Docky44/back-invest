import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { User } from 'src/modules/users/user.entity'

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): User | null => {
  const ctx = GqlExecutionContext.create(context)
  return ctx.getContext().req.user ?? null
})
