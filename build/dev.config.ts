import { defineConfig } from "rolldown";
import path from "path";

const ROOT_DIR = process.cwd();

const libIndex = path.join(ROOT_DIR, "src", "index.ts");

// gui test build
export default defineConfig({
    input: libIndex,
    output: {
        format: "esm",
    }
});
