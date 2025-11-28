import { Resolver, Query } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { UserService } from './user.service'
import { GqlAuthGuard } from '../../auth/gql-auth.guard'
import { CurrentUser } from '../../auth/current-user.decorator'
import { User } from './user.entity'
import { Roles } from '../../auth/roles.decorator'
import { RolesGuard } from '../../auth/roles.guard'
import { Role } from 'src/graphql.schema'

@Resolver('User')
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query('me')
  @UseGuards(GqlAuthGuard)
  me(@CurrentUser() user: User): User {
    return user
  }

  @Query('users')
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  users(): Promise<User[]> {
    return this.userService.findAll()
  }
}
