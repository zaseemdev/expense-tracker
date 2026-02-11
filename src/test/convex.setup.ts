import { createElement } from "react";
import {
  createConvexTest,
  renderWithConvex as _renderWithConvex,
} from "convex-test-provider";
import { MemoryRouter } from "react-router";
import schema from "../../convex/schema";

export const modules = import.meta.glob("../../convex/**/!(*.*.*)*.*s");
export const test = createConvexTest(schema, modules);

// Wraps the original renderWithConvex with MemoryRouter so components
// using React Router hooks (useNavigate, etc.) work in tests without BrowserRouter.
export function renderWithConvex(
  ui: Parameters<typeof _renderWithConvex>[0],
  client: Parameters<typeof _renderWithConvex>[1],
  { initialEntries = ["/"] }: { initialEntries?: string[] } = {},
) {
  return _renderWithConvex(
    createElement(MemoryRouter, { initialEntries }, ui),
    client,
  );
}

