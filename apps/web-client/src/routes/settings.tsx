import { createSignal, onMount } from "solid-js";
import { Title } from "@solidjs/meta";
import SettingsForm from "../components/SettingsForm";

interface Setting {
  id: number;
  userId: number | null;
  key: string;
  value: string | number | boolean | object;
  type: "string" | "number" | "boolean" | "json";
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const Settings = () => {
  const [appSettings, setAppSettings] = createSignal<Record<string, any>>({});
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  // Load settings on mount
  onMount(async () => {
    await loadSettings();
  });

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/settings");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Setting[] = await response.json();

      // Convert to key-value format for the form
      const settingsObj: Record<string, any> = {};
      data.forEach((setting) => {
        settingsObj[setting.key] = setting.value;
      });

      setAppSettings(settingsObj);
      setError(null);
    } catch (err) {
      console.error("Error loading settings:", err);
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (settings: Record<string, any>) => {
    try {
      // Update each setting individually
      for (const [key, value] of Object.entries(settings)) {
        // First check if setting exists
        const response = await fetch(
          `/api/settings/key/null/${encodeURIComponent(key)}`,
          {
            method: "GET",
          },
        );

        if (response.ok) {
          // Setting exists, update it
          const settingData = await response.json();
          await fetch(`/api/settings/${settingData.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              key,
              value,
            }),
          });
        } else {
          // Setting doesn't exist, create it
          await fetch("/api/settings", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              key,
              value,
              type: typeof value as "string" | "number" | "boolean" | "json",
            }),
          });
        }
      }

      // Reload settings after saving
      await loadSettings();
      alert("Settings saved successfully!");
    } catch (err) {
      console.error("Error saving settings:", err);
      setError("Failed to save settings");
    }
  };

  return (
    <div class="container mx-auto p-4">
      <Title>Settings</Title>

      <h1 class="text-2xl font-bold mb-6">Application Settings</h1>

      {error() && (
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error()}
        </div>
      )}

      <div class="bg-white p-6 rounded-lg shadow-md max-w-3xl">
        {loading() ? (
          <p>Loading settings...</p>
        ) : (
          <SettingsForm initialSettings={appSettings()} onSave={handleSave} />
        )}
      </div>
    </div>
  );
};

export default Settings;
