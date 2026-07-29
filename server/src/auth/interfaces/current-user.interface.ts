import { Role } from '../../users/enums/role.enum';

export interface CurrentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}