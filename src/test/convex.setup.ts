import { createConvexTest, renderWithConvex } from "convex-test-provider";
import schema from "../../convex/schema";

export const modules = import.meta.glob("../../convex/**/!(*.*.*)*.*s");
export const test = createConvexTest(schema, modules);
export { renderWithConvex };
