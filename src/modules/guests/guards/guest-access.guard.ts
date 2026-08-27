import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GuestsService } from '../guests.service';
import { AccessStatus } from '../../../common/enums';

/**
 * Guards the actual guide content (places/routes/chat): valid guest JWT
 * AND accessStatus === open. Independent from residence/review status, per PLAN.md.
 */
@Injectable()
export class GuestAccessGuard implements CanActivate {
  private jwtGuard = new (AuthGuard('guest-jwt'))();

  constructor(private readonly guests: GuestsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const jwtOk = (await this.jwtGuard.canActivate(context)) as boolean;
    if (!jwtOk) return false;

    const request = context.switchToHttp().getRequest();
    const guest = await this.guests.findById(request.user.guestId);
    if (guest.accessStatus !== AccessStatus.OPEN) {
      throw new ForbiddenException('Guide access is not open for this guest yet');
    }
    request.guest = guest;
    return true;
  }
}
