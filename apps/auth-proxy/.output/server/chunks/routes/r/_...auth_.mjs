import { Auth } from '@auth/core';
import Google from '@auth/core/providers/google';
import { e as eventHandler, t as toWebRequest } from '../../runtime.mjs';
import 'node:http';
import 'node:https';
import 'node:fs';
import 'node:path';
import 'node:url';

const ____auth_ = eventHandler(
  async (event) => Auth(toWebRequest(event), {
    basePath: "/r",
    secret: process.env.AUTH_SECRET,
    trustHost: !!process.env.VERCEL,
    redirectProxyUrl: process.env.AUTH_REDIRECT_PROXY_URL,
    providers: [
      Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET
      })
    ]
  })
);

export { ____auth_ as default };
//# sourceMappingURL=_...auth_.mjs.map
