import { z } from "zod";

export const ManifestSchema = z.object({
  topics: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        dataUrl: z.string().startsWith("/"),
      })
    )
    .length(3),
});

export type Manifest = z.infer<typeof ManifestSchema>;
