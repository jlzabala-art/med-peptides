import crypto from 'node:crypto';

function jsonResponse(payload, { status = 200, headers = {} } = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
  });
}

async function defaultIsAdmin() {
  const { isAdminServerSession } = await import('../serverAdminAuth.js');
  return isAdminServerSession();
}

async function defaultResolveUser() {
  try {
    const [{ cookies }, { getTokens }, { serverConfig }] = await Promise.all([
      import('next/headers.js'),
      import('next-firebase-auth-edge'),
      import('../../authConfig.js'),
    ]);
    const cookieStore = await cookies();
    if (!cookieStore.has(serverConfig.cookieName)) return null;
    const tokens = await getTokens(cookieStore, {
      apiKey: serverConfig.firebaseApiKey,
      cookieName: serverConfig.cookieName,
      cookieSignatureKeys: serverConfig.cookieSignatureKeys,
      serviceAccount: serverConfig.serviceAccount,
    });
    return tokens?.decodedToken || null;
  } catch {
    return null;
  }
}

async function defaultGetDb() {
  const { adminDb } = await import('../firebaseAdmin.js');
  return adminDb;
}

/**
 * withApiHandler — Canonical Pillar 6 API Route Wrapper
 * ─────────────────────────────────────────────────────────────────────────────
 * Standardizes auth/role enforcement, DB availability checks, Zod validation,
 * requestId tracing, and uniform JSON error envelopes across App Router APIs.
 */
export function withApiHandler(handler, options = {}) {
  const {
    auth = 'public', // 'public' | 'authenticated' | 'admin' | string[] (roles)
    requireDb = false,
    bodySchema = null,
    querySchema = null,
    allowEmptyBody = true,
    deps = null,
  } = options;

  const getIsAdmin = deps?.isAdminServerSession || defaultIsAdmin;
  const getUser = deps?.resolveSessionUser || defaultResolveUser;
  const getDb = deps?.getDb || defaultGetDb;

  return async function apiRouteHandler(req, routeContext = {}) {
    const requestId =
      req?.headers?.get?.('x-request-id') ||
      (typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID().slice(0, 12)
        : crypto.randomBytes(6).toString('hex'));

    try {
      const urlObj = new URL(req?.url || 'http://localhost/');
      const searchParams = urlObj.searchParams;
      const params = routeContext?.params ? await routeContext.params : {};

      // 1. Auth & Role Enforcement
      const isAdmin = await getIsAdmin();
      let user = null;

      if (auth !== 'public') {
        if (auth === 'admin') {
          if (!isAdmin) {
            return jsonResponse(
              { ok: false, error: 'Admin authorization required', requestId },
              { status: 403, headers: { 'x-request-id': requestId } }
            );
          }
        } else {
          user = await getUser();
          if (!user && !isAdmin) {
            return jsonResponse(
              { ok: false, error: 'Authentication required', requestId },
              { status: 401, headers: { 'x-request-id': requestId } }
            );
          }
          if (Array.isArray(auth) && !isAdmin) {
            const role = String(user?.role || '').toLowerCase().trim();
            const allowed = auth.map((r) => String(r).toLowerCase().trim());
            if (!allowed.includes(role)) {
              return jsonResponse(
                { ok: false, error: 'Insufficient role permissions', requestId },
                { status: 403, headers: { 'x-request-id': requestId } }
              );
            }
          }
        }
      }

      // 2. DB Check
      const db = await getDb();
      if (requireDb && !db) {
        return jsonResponse(
          { ok: false, error: 'Database unavailable', requestId },
          { status: 503, headers: { 'x-request-id': requestId } }
        );
      }

      // 3. Query Validation
      let query = Object.fromEntries(searchParams.entries());
      if (querySchema) {
        const parsedQuery = querySchema.safeParse(query);
        if (!parsedQuery.success) {
          return jsonResponse(
            {
              ok: false,
              error: 'Invalid query parameters',
              issues: parsedQuery.error.issues,
              requestId,
            },
            { status: 400, headers: { 'x-request-id': requestId } }
          );
        }
        query = parsedQuery.data;
      }

      // 4. Body Parsing & Zod Validation
      let body = null;
      const method = String(req?.method || 'GET').toUpperCase();
      if (!['GET', 'HEAD'].includes(method)) {
        try {
          body = await req.json();
        } catch {
          body = allowEmptyBody ? {} : null;
        }
        if (bodySchema) {
          const parsedBody = bodySchema.safeParse(body ?? {});
          if (!parsedBody.success) {
            return jsonResponse(
              {
                ok: false,
                error: 'Validation failed',
                issues: parsedBody.error.issues,
                requestId,
              },
              { status: 400, headers: { 'x-request-id': requestId } }
            );
          }
          body = parsedBody.data;
        }
      }

      // 5. Execute Route Handler
      const result = await handler({
        req,
        params,
        searchParams,
        query,
        body,
        user,
        isAdmin,
        db,
        requestId,
      });

      if (result instanceof Response) {
        result.headers.set('x-request-id', requestId);
        return result;
      }

      return jsonResponse(
        {
          ok: true,
          ...(result && typeof result === 'object' ? result : { data: result }),
          requestId,
        },
        { status: 200, headers: { 'x-request-id': requestId } }
      );
    } catch (err) {
      console.error(`[API][${requestId}]`, err);
      return jsonResponse(
        { ok: false, error: err?.message || 'Internal server error', requestId },
        { status: err?.statusCode || 500, headers: { 'x-request-id': requestId } }
      );
    }
  };
}
