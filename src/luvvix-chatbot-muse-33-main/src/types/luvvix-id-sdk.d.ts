
declare module './luvvix-id-sdk' {
  export class LuvviXID {
    constructor(options: any);
    initialize(options: any): void;
    isAuthenticated(): Promise<boolean>;
    checkSilentAuth(): Promise<boolean>;
    redirectToLogin(options?: any): void;
    handleCallback(): Promise<any>;
    logout(): void;
    globalLogout(): void;
    getAppToken(): Promise<string | null>;
    getUserProfile(): Promise<any>;
    addAuthListener(listener: (isAuthenticated: boolean) => void): void;
    removeAuthListener(listener: (isAuthenticated: boolean) => void): void;
  }
  
  export default LuvviXID;
}

declare module 'uuid' {
  export function v4(): string;
  export function v1(): string;
  export function v3(): string;
  export function v5(): string;
  export function validate(uuid: string): boolean;
  export function version(uuid: string): number;
}
