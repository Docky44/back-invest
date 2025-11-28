
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum Role {
    USER = "USER",
    ADMIN = "ADMIN"
}

export class User {
    id: string;
    auth0Sub: string;
    username: string;
    email?: Nullable<string>;
    isActive: boolean;
    role: Role;
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: Nullable<string>;
}

export abstract class IQuery {
    abstract me(): User | Promise<User>;

    abstract users(): User[] | Promise<User[]>;
}

export type JSON = any;
export type Upload = any;
type Nullable<T> = T | null;
