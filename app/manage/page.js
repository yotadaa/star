import ManageCockpit from "@/app/manage/ManageCockpit";
import { getNalaSettings } from "@/lib/backend/featureStore";
import requireOwner from "@/lib/requireOwner";

export const dynamic = "force-dynamic";

const DEFAULT_SETTINGS = {
  enabled: true,
  model: "nvidia/nemotron-3-ultra-550b-a55b:free",
  systemPromptSupplement: "",
  temperature: 0.25,
  maxTokens: 620,
  updatedAt: null,
  persisted: false,
};

export default async function ManagePage() {
  await requireOwner();

  let settings = DEFAULT_SETTINGS;
  let configWarning = "";
  try {
    settings = await getNalaSettings();
  } catch {
    configWarning = "Konfigurasi Convex belum dapat dibaca. Nilai runtime default ditampilkan tanpa menyimpan data baru.";
  }

  return (
    <ManageCockpit
      initialSettings={settings}
      keyConfigured={Boolean(process.env.NALA_KEY)}
      configWarning={configWarning}
      guardLabel="Owner session"
    />
  );
}
