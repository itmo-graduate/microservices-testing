export interface Route {
  path: string;
  method: string;
  bodyFields?: string;
}

export interface Service {
  name: string;
  host: string;
  routes: Route[];
  usersStart: number;
  usersEnd: number;
  duration: number;
}