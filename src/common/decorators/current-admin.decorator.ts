import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** Injects { adminId, name, role } parsed from the admin JWT (set by AdminJwtStrategy). */
export const CurrentAdmin = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user; // { adminId, name, role }
});
