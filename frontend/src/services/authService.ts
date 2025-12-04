import { User, UserRegistrationPayload } from '../types';

// Storage keys
const USERS_KEY = 'estuarriendo_users';
const PASSWORDS_KEY = 'estuarriendo_passwords'; // Separate storage for passwords
const CURRENT_USER_KEY = 'estuarriendo_current_user';

// Response types (mimicking backend API responses)
interface AuthResponse {
    success: boolean;
    user?: User;
    message?: string;
}

// Mock delay to simulate API call
const mockDelay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

class AuthService {
    // Get all registered users from storage
    private getUsers(): User[] {
        const usersJson = localStorage.getItem(USERS_KEY);
        return usersJson ? JSON.parse(usersJson) : [];
    }

    // Save users array to storage
    private saveUsers(users: User[]): void {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    // Get passwords map (userId -> password)
    private getPasswords(): Record<string, string> {
        const passwordsJson = localStorage.getItem(PASSWORDS_KEY);
        return passwordsJson ? JSON.parse(passwordsJson) : {};
    }

    // Save passwords map
    private savePasswords(passwords: Record<string, string>): void {
        localStorage.setItem(PASSWORDS_KEY, JSON.stringify(passwords));
    }

    // Register a new user
    async register(userData: UserRegistrationPayload | Partial<User>): Promise<AuthResponse> {
        await mockDelay();

        try {
            const users = this.getUsers();

            // Check if email already exists
            const existingUser = users.find(u => u.email === userData.email);
            if (existingUser) {
                return {
                    success: false,
                    message: 'Este correo electrónico ya está registrado.'
                };
            }

            // Create new user from registration payload
            const newUser: User = {
                id: crypto.randomUUID(),
                name: userData.name!,
                email: userData.email!,
                phone: userData.phone!,
                whatsapp: userData.whatsapp || userData.phone!,
                userType: (userData as UserRegistrationPayload).userType || 'tenant',
                idType: userData.idType,
                idNumber: userData.idNumber,
                role: userData.role,
                isActive: true,
                joinedAt: new Date().toISOString(),
                verificationStatus: 'not_submitted',
                propertiesCount: 0,
                approvedCount: 0,
                pendingCount: 0,
                rejectedCount: 0,
                isVerified: false,
                paymentPreference: userData.paymentPreference,
                bankDetails: userData.bankDetails,
                billingDetails: userData.billingDetails
            };

            // Add to users array
            users.push(newUser);
            this.saveUsers(users);

            // Store password separately (if provided in registration payload)
            if ('password' in userData && userData.password) {
                const passwords = this.getPasswords();
                passwords[newUser.id] = userData.password;
                this.savePasswords(passwords);
            }

            // Set as current user (auto-login after registration)
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

            return {
                success: true,
                user: newUser,
                message: 'Registro exitoso.'
            };
        } catch (error) {
            return {
                success: false,
                message: 'Error al registrar usuario.'
            };
        }
    }

    // Login with email and password
    async login(email: string, password: string): Promise<AuthResponse> {
        await mockDelay();

        try {
            const users = this.getUsers();

            // Find user by email
            const user = users.find(u => u.email === email);

            if (!user) {
                return {
                    success: false,
                    message: 'Correo electrónico no encontrado.'
                };
            }

            // Validate password
            const passwords = this.getPasswords();
            const storedPassword = passwords[user.id];

            if (!storedPassword || storedPassword !== password) {
                return {
                    success: false,
                    message: 'Contraseña incorrecta.'
                };
            }

            // Set as current user
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

            return {
                success: true,
                user: user,
                message: 'Inicio de sesión exitoso.'
            };
        } catch (error) {
            return {
                success: false,
                message: 'Error al iniciar sesión.'
            };
        }
    }

    // Logout current user
    logout(): void {
        localStorage.removeItem(CURRENT_USER_KEY);
    }

    // Get current logged-in user
    getCurrentUser(): User | null {
        const userJson = localStorage.getItem(CURRENT_USER_KEY);
        return userJson ? JSON.parse(userJson) : null;
    }

    // Check if user is authenticated
    isAuthenticated(): boolean {
        return this.getCurrentUser() !== null;
    }

    // Update current user data (for future use)
    async updateUser(userId: string, updates: Partial<User>): Promise<AuthResponse> {
        await mockDelay();

        try {
            const users = this.getUsers();
            const userIndex = users.findIndex(u => u.id === userId);

            if (userIndex === -1) {
                return {
                    success: false,
                    message: 'Usuario no encontrado.'
                };
            }

            // Update user in array
            users[userIndex] = { ...users[userIndex], ...updates };
            this.saveUsers(users);

            // Update current user if it's the same user
            const currentUser = this.getCurrentUser();
            if (currentUser && currentUser.id === userId) {
                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[userIndex]));
            }

            return {
                success: true,
                user: users[userIndex],
                message: 'Usuario actualizado exitosamente.'
            };
        } catch (error) {
            return {
                success: false,
                message: 'Error al actualizar usuario.'
            };
        }
    }
}

// Export singleton instance
export const authService = new AuthService();
export type { AuthResponse };
