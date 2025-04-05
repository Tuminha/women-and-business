import { getSupabaseClient } from './supabase-client';
import { User, UserWithPassword, LoginCredentials, AuthResult, RegisterData, hashPassword, verifyPassword, generateToken } from './auth';

export async function getUserByEmail(email: string): Promise<UserWithPassword | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error || !data) return null;
  
  // Convert from snake_case to camelCase
  return {
    id: data.id,
    auth_id: data.auth_id,
    email: data.email,
    passwordHash: data.password_hash,
    firstName: data.first_name,
    lastName: data.last_name,
    role: data.role,
    profileImage: data.profile_image,
    createdAt: data.created_at,
    lastLogin: data.last_login
  };
}

export async function getUserById(id: number): Promise<User | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .select('id, auth_id, email, first_name, last_name, role, profile_image, created_at, last_login')
    .eq('id', id)
    .single();
  
  if (error || !data) return null;
  
  // Convert from snake_case to camelCase
  return {
    id: data.id,
    auth_id: data.auth_id,
    email: data.email,
    firstName: data.first_name,
    lastName: data.last_name,
    role: data.role,
    profileImage: data.profile_image,
    createdAt: data.created_at,
    lastLogin: data.last_login
  };
}

// Function to link a custom ID with a Supabase Auth ID
export async function linkUserWithAuthId(userId: number, authId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('users')
    .update({ auth_id: authId })
    .eq('id', userId);
    
  return !error;
}

export async function loginUser(credentials: LoginCredentials): Promise<AuthResult> {
  try {
    const { email, password } = credentials;
    
    // Get user from database
    const user = await getUserByEmail(email);
    
    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }
    
    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }
    
    // Update last login
    const supabase = getSupabaseClient();
    const { error: updateError } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);
    
    if (updateError) {
      console.error('Error updating last login:', updateError);
    }
    
    // Create sanitized user object (without password)
    const sanitizedUser: User = {
      id: user.id,
      auth_id: user.auth_id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
      lastLogin: new Date()
    };
    
    // Generate token
    const token = generateToken(sanitizedUser);
    
    return {
      success: true,
      user: sanitizedUser,
      token
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'An error occurred during login'
    };
  }
}

export async function registerUser(userData: RegisterData, authId?: string): Promise<AuthResult> {
  try {
    const { email, password, firstName, lastName } = userData;
    
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    
    if (existingUser) {
      return {
        success: false,
        message: 'Email already in use'
      };
    }
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Insert new user
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        first_name: firstName || null,
        last_name: lastName || null,
        role: 'user',
        auth_id: authId || null
      })
      .select()
      .single();
    
    if (error || !data) {
      console.error('User creation error:', error);
      return {
        success: false,
        message: 'Failed to create user'
      };
    }
    
    // Create sanitized user object
    const sanitizedUser: User = {
      id: data.id,
      auth_id: data.auth_id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      role: data.role,
      profileImage: data.profile_image,
      createdAt: data.created_at,
      lastLogin: data.last_login
    };
    
    // Generate token
    const token = generateToken(sanitizedUser);
    
    return {
      success: true,
      user: sanitizedUser,
      token
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: 'An error occurred during registration'
    };
  }
}

export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, role, profile_image, created_at, last_login')
    .order('created_at', { ascending: false });
  
  if (error || !data) return [];
  
  // Convert from snake_case to camelCase
  return data.map(user => ({
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
    profileImage: user.profile_image,
    createdAt: user.created_at,
    lastLogin: user.last_login
  }));
}

export async function updateUserProfile(userId: number, data: Partial<User>): Promise<boolean> {
  try {
    const updates: any = {};
    
    if (data.firstName !== undefined) {
      updates.first_name = data.firstName;
    }
    
    if (data.lastName !== undefined) {
      updates.last_name = data.lastName;
    }
    
    if (data.profileImage !== undefined) {
      updates.profile_image = data.profileImage;
    }
    
    if (Object.keys(updates).length === 0) {
      return true; // Nothing to update
    }
    
    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();
    
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);
    
    return !error;
  } catch (error) {
    console.error('Update user profile error:', error);
    return false;
  }
}

export async function changePassword(userId: number, currentPassword: string, newPassword: string): Promise<AuthResult> {
  try {
    // Get user by ID
    const user = await getUserById(userId);
    
    if (!user) {
      return {
        success: false,
        message: 'User not found'
      };
    }
    
    // Get user with password
    const userWithPassword = await getUserByEmail(user.email);
    
    if (!userWithPassword) {
      return {
        success: false,
        message: 'User not found'
      };
    }
    
    // Verify current password
    const isPasswordValid = await verifyPassword(currentPassword, userWithPassword.passwordHash);
    
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Current password is incorrect'
      };
    }
    
    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);
    
    // Update password
    const { error } = await supabase
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', userId);
    
    if (error) {
      console.error('Password update error:', error);
      return {
        success: false,
        message: 'Failed to update password'
      };
    }
    
    return {
      success: true,
      message: 'Password updated successfully'
    };
  } catch (error) {
    console.error('Change password error:', error);
    return {
      success: false,
      message: 'An error occurred while changing password'
    };
  }
}
