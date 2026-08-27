import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** Injects { guestId } parsed from the guest JWT (set by GuestJwtStrategy). */
export const CurrentGuest = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user; // { guestId }
});
