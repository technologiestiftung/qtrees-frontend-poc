// src/mocks/handlers.js

import { rest } from "msw";

export const handlers = [
  // Handles a POST /login request

  // Handles a GET /user request

  rest.get("http://localhost:9999/trees", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: 1, type: "cypress" },
        { id: 2, type: "maple" },
      ])
    );
  }),
];
