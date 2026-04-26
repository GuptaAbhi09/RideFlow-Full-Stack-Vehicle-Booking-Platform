import { auth } from "./auth"
import { NextResponse } from "next/server"
import { checkAccess } from "./accessControl"

export default auth((req) => {
  const { nextUrl } = req
  // @ts-ignore - auth property is added by the wrapper
  const role = req.auth?.user?.role as string | undefined

  const { allowed, redirectTo } = checkAccess(nextUrl.pathname, role)

  if (!allowed && redirectTo) {
    return NextResponse.redirect(new URL(redirectTo, nextUrl))
  }

  return NextResponse.next()
})

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
