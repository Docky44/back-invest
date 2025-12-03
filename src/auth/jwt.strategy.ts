import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import * as jwksRsa from 'jwks-rsa'
import { ConfigService } from '@nestjs/config'
import { UserService } from '../modules/users/user.service'
import { find } from 'lodash'

export interface JwtPayload {
  sub: string
  nickname?: string
  name?: string
  email?: string
  [key: string]: unknown
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly userService: UserService
  ) {
    const domain = config.get<string>('AUTH0_DOMAIN')
    const audience = config.get<string>('AUTH0_AUDIENCE')
    const issuer = config.get<string>('AUTH0_ISSUER_URL')

    super({
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${domain}/.well-known/jwks.json`
      }) as any,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience,
      issuer,
      algorithms: ['RS256']
    })
  }

  async validate(payload: JwtPayload) {
    const findClaim = (fallback: string | undefined, suffix: string): string | undefined => {
      if (typeof fallback === 'string') {
        return fallback
      }
      const key = find(Object.keys(payload), (k) => k.endsWith(suffix))
      const value = key ? payload[key] : undefined
      return typeof value === 'string' ? value : undefined
    }

    const emailClaim = findClaim(payload.email, '/email')
    const nameClaim = findClaim(payload.name, '/name')
    const nicknameClaim = findClaim(payload.nickname, '/nickname')

    const user = await this.userService.ensureUserFromAuth0Profile({
      sub: payload.sub,
      nickname: nicknameClaim,
      name: nameClaim,
      email: emailClaim
    })

    return user
  }
}
