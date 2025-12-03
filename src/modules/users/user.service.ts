import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import { pick } from 'lodash'
import { Role } from 'src/graphql.schema'

export interface Auth0Profile {
  sub: string
  nickname?: string
  name?: string
  email?: string
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async findByAuth0Sub(auth0Sub: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { auth0Sub } })
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find()
  }

  async updateStatus(id: string, isActive: boolean): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    const updated = this.userRepository.merge(user, { isActive })

    return this.userRepository.save(updated)
  }

  async updateRole(id: string, role: Role): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    const updated = this.userRepository.merge(user, { role })

    return this.userRepository.save(updated)
  }

  async ensureUserFromAuth0Profile(profile: Auth0Profile): Promise<User> {
    const existing = await this.findByAuth0Sub(profile.sub)
    const username = profile.nickname || profile.name || (profile.email ? profile.email.split('@')[0] : profile.sub)

    const email = profile.email || null

    if (existing) {
      const updated = this.userRepository.merge(
        existing,
        pick(
          {
            username,
            email,
            lastLoginAt: new Date()
          },
          ['username', 'email', 'lastLoginAt']
        )
      )
      return this.userRepository.save(updated)
    }

    const user = this.userRepository.create({
      auth0Sub: profile.sub,
      username,
      email,
      isActive: false,
      role: Role.USER,
      lastLoginAt: new Date()
    })

    return this.userRepository.save(user)
  }
}
