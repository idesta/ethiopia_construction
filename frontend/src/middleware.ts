import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/admin") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const hostWithoutPort = hostname.split(":")[0];

  const rootDomains = [
    "localhost",
    "10.0.0.14", // Ubuntu VM local IP
    "196.188.249.162", // pfSense public IP
    "yourdomain.com", // replace when you get a domain
    "www.yourdomain.com",
  ];

  if (!rootDomains.includes(hostWithoutPort)) {
    const subdomain = hostWithoutPort.split(".")[0];
    if (subdomain && subdomain !== "www" && subdomain !== "admin") {
      url.pathname = `/sites/${subdomain}${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
