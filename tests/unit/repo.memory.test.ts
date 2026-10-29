import { MemoryRepo } from "@/server/repo/memory";
import { repoContract } from "./repo.contract";

repoContract("memory", async () => new MemoryRepo());
