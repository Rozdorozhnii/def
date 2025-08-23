import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { UserDocument } from '@app/common';

export interface RequestWithUser extends Request {
  user: UserDocument;
}

const getCurrentUserByContext = (context: ExecutionContext): UserDocument => {
  return context.switchToHttp().getRequest<RequestWithUser>().user;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    getCurrentUserByContext(context),
);
