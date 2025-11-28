import { Role } from 'src/graphql.schema'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ name: 'auth0_sub', type: 'varchar', length: 255, unique: true })
  auth0Sub: string

  @Column({ name: 'username', type: 'varchar', length: 255 })
  username: string

  @Column({ name: 'email', type: 'varchar', length: 255, nullable: true })
  email: string | null

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean

  @Column({ name: 'role', type: 'varchar', length: 50, default: Role.USER })
  role: Role

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null
}
