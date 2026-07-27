const routes = [];

export function registerRoute(pattern, handler, title) {
  routes.push({ pattern, handler, title });
}

export function navigate(path) {
  window.location.hash = `#${path}`;
}

export function getCurrentPath() {
  const raw = window.location.hash.replace(/^#/, "");
  return raw || "/dashboard";
}

function matchRoute(pattern, path) {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = path.split("/").filter(Boolean);

  if (patternParts.length !== pathParts.length) return null;

  return patternParts.reduce((params, part, index) => {
    if (params === null) return null;
    if (part.startsWith(":")) {
      params[part.slice(1)] = decodeURIComponent(pathParts[index]);
      return params;
    }
    return part === pathParts[index] ? params : null;
  }, {});
}

export function resolveRoute(path = getCurrentPath()) {
  for (const route of routes) {
    const params = matchRoute(route.pattern, path);
    if (params) return { ...route, params };
  }
  return routes.find((route) => route.pattern === "/dashboard");
}

export function refreshRoute() {
  const route = resolveRoute();
  if (!route) return;
  route.handler(route.params);
  updateActiveNav(getCurrentPath());
  updatePageTitle(route.title);
}

function updateActiveNav(path) {
  const section = `/${path.split("/").filter(Boolean)[0] || "dashboard"}`;
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.dataset.route === section);
  });
}

function updatePageTitle(title) {
  const titleNode = document.querySelector("#page-title");
  if (titleNode) titleNode.textContent = title || "Dashboard";
}

export function startRouter() {
  window.addEventListener("hashchange", refreshRoute);
  if (!window.location.hash) {
    navigate("/dashboard");
  } else {
    refreshRoute();
  }
}

