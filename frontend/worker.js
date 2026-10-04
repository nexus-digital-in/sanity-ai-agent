import agent from "./api/agent.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/agent") {
      return agent.fetch(request, env, ctx);
    }

    return env.ASSETS.fetch(request);
  },
};