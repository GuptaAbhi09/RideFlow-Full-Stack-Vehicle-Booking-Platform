/**
 * proxy.ts
 * 
 * Centralized Role-Based Access Control (RBAC) logic for RideFlow.
 * This file defines which routes and API endpoints are accessible by which user roles.
 */

// Routes that anyone can access without being logged in
export const PUBLIC_ROUTES = [
    '/',
    '/about',
    '/contact',
    '/api/auth', // NextAuth endpoints
    '/track',
    '/api/track',];

// Routes for authentication (login/signup)
// Logged in users should be redirected away from these
export const AUTH_ROUTES = [
    '/login',
    '/signup',
];

// Role definitions
export type UserRole = 'user' | 'partner' | 'admin';

// Path-based access rules using startsWith logic
export const PROTECTED_ROUTES: { path: string; allowedRoles: UserRole[] }[] = [
    {
        path: '/partner/dashboard',
        allowedRoles: ['partner', 'admin']
    },
    {
        path: '/booking',
        allowedRoles: ['user', 'admin']
    },
    {
        path: '/partner/onboarding',
        allowedRoles: ['user', 'partner', 'admin']
    },
    {
        path: '/partner',
        allowedRoles: ['partner', 'admin']
    },
    {
        path: '/admin',
        allowedRoles: ['admin']
    },
    // API Route Protections
    {
        path: '/api/user',
        allowedRoles: ['user', 'partner', 'admin']
    },
    {
        path: '/api/partner/onboarding',
        allowedRoles: ['user', 'partner', 'admin']
    },
    {
        path: '/api/partner',
        allowedRoles: ['partner', 'admin']
    },
    {
        path: '/api/admin',
        allowedRoles: ['admin']
    }
];

/**
 * Validates if a user with a specific role can access a given pathname.
 * 
 * @param pathname The URL path being accessed
 * @param role The role of the current user (undefined if not logged in)
 * @returns An object containing access status and optional redirect path
 */
export const checkAccess = (pathname: string, role?: string) => {
    // 1. Check if the path is explicitly public
    const isPublic = PUBLIC_ROUTES.some(route => 
        pathname === route || pathname.startsWith(`${route}/`)
    );

    // AUTO-REDIRECT: If logged in as admin or partner and landing on root, redirect to their dashboard
    if (pathname === '/') {
        if (role === 'admin') return { allowed: false, redirectTo: '/admin/dashboard' };
        if (role === 'partner') return { allowed: false, redirectTo: '/partner/dashboard' };
    }

    if (isPublic) return { allowed: true };

    // 2. Check if it's an Auth route (login/signup)
    const isAuthRoute = AUTH_ROUTES.some(route => pathname === route);
    
    // If logged in and trying to access login/signup, redirect to their respective dashboard
    if (isAuthRoute) {
        if (role === 'admin') return { allowed: false, redirectTo: '/admin' };
        if (role === 'partner') return { allowed: false, redirectTo: '/partner/dashboard' };
        if (role === 'user') return { allowed: false, redirectTo: '/' }; // Standard users stay on home or their booking page
        return { allowed: true };
    }

    // 3. If the user is not logged in and the route is not public, deny access
    if (!role) {
        return { allowed: false, redirectTo: '/' };
    }

    // 4. Check against protected route rules
    // We use find to catch the first rule that matches the start of the pathname
    const rule = PROTECTED_ROUTES.find(r => 
        pathname === r.path || pathname.startsWith(`${r.path}/`)
    );

    // If no specific rule exists, default to allowed for authenticated users
    if (!rule) return { allowed: true };

    // Check if the user's role is in the allowed list for this path
    const hasRole = rule.allowedRoles.includes(role as UserRole);

    if (hasRole) {
        return { allowed: true };
    }

    // If role is not allowed, redirect to a safe default page
    const redirectTo = role === 'admin' ? '/admin' : 
                       role === 'partner' ? '/partner/dashboard' : '/';
    
    return { 
        allowed: false, 
        redirectTo
    };
};
