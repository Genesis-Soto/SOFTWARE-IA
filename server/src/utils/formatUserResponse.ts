interface DbUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at?: string;
}

interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface UserResponseWithDate extends UserResponse {
  createdAt: string;
}

export function formatUserResponse(user: DbUser): UserResponse {
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
  };
}

export function formatUserResponseWithDate(user: DbUser): UserResponseWithDate {
  return {
    ...formatUserResponse(user),
    createdAt: user.created_at || '',
  };
}
