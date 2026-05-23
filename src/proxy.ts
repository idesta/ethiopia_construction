import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const url = request.nextUrl.clone();

  const hostWithoutPort = hostname.split(":")[0];

  const rootDomains = ["localhost", "ethiopia-construction.pages.dev"];

  const isRootDomain = rootDomains.includes(hostWithoutPort);

  if (!isRootDomain) {
    const subdomain = hostWithoutPort.split(".")[0];

    if (subdomain && subdomain !== "www" && subdomain !== "admin") {
      url.pathname = `/sites/${subdomain}${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
