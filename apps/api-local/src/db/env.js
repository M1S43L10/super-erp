import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// __dirname = .../src/db  => subimos 2 niveles a .../api-local
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
