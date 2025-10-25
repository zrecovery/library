import { For, createSignal } from "solid-js";

interface SettingsFormProps {
  initialSettings?: Record<string, any>;
  onSave: (settings: Record<string, any>) => void;
}

interface SettingField {
  key: string;
  label: string;
  type: "text" | "number" | "boolean" | "select" | "textarea";
  options?: string[]; // For select type
  description?: string;
  defaultValue?: any;
}

const SettingsForm = (props: SettingsFormProps) => {
  const [settings, setSettings] = createSignal<Record<string, any>>(
    props.initialSettings || {},
  );

  // Define common settings fields
  const settingFields: SettingField[] = [
    {
      key: "theme",
      label: "Theme",
      type: "select",
      options: ["light", "dark", "auto"],
      description: "Choose your preferred theme",
      defaultValue: "auto",
    },
    {
      key: "language",
      label: "Language",
      type: "select",
      options: ["en", "es", "zh"],
      description: "Select your preferred language",
      defaultValue: "en",
    },
    {
      key: "itemsPerPage",
      label: "Items Per Page",
      type: "number",
      description: "Number of items to display per page",
      defaultValue: 10,
    },
    {
      key: "enableNotifications",
      label: "Enable Notifications",
      type: "boolean",
      description: "Receive notifications for updates",
      defaultValue: true,
    },
    {
      key: "dateFormat",
      label: "Date Format",
      type: "select",
      options: ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"],
      description: "Preferred date format",
      defaultValue: "MM/DD/YYYY",
    },
    {
      key: "customCSS",
      label: "Custom CSS",
      type: "textarea",
      description: "Add custom CSS styles",
      defaultValue: "",
    },
  ];

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    props.onSave(settings());
  };

  const renderField = (field: SettingField) => {
    const currentValue = settings()[field.key] ?? field.defaultValue;

    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            value={currentValue || ""}
            onInput={(e) =>
              handleSettingChange(field.key, e.currentTarget.value)
            }
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={currentValue || ""}
            onInput={(e) =>
              handleSettingChange(
                field.key,
                Number.parseInt(e.currentTarget.value) || 0,
              )
            }
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );

      case "boolean":
        return (
          <div class="flex items-center">
            <input
              type="checkbox"
              checked={!!currentValue}
              onChange={(e) =>
                handleSettingChange(field.key, e.currentTarget.checked)
              }
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span class="ml-2 text-sm text-gray-600">Enable</span>
          </div>
        );

      case "select":
        return (
          <select
            value={currentValue || field.defaultValue || ""}
            onChange={(e) =>
              handleSettingChange(field.key, e.currentTarget.value)
            }
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <For each={field.options}>
              {(option) => <option value={option}>{option}</option>}
            </For>
          </select>
        );

      case "textarea":
        return (
          <textarea
            value={currentValue || ""}
            onInput={(e) =>
              handleSettingChange(field.key, e.currentTarget.value)
            }
            rows={4}
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );

      default:
        return (
          <input
            type="text"
            value={currentValue || ""}
            onInput={(e) =>
              handleSettingChange(field.key, e.currentTarget.value)
            }
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-6">
      <For each={settingFields}>
        {(field) => (
          <div class="space-y-1">
            <div class="flex justify-between">
              <label class="block text-sm font-medium text-gray-700">
                {field.label}
              </label>
              {field.description && (
                <span class="text-sm text-gray-500">{field.description}</span>
              )}
            </div>
            {renderField(field)}
          </div>
        )}
      </For>

      <div class="flex justify-end pt-4">
        <button
          type="submit"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save Settings
        </button>
      </div>
    </form>
  );
};

export default SettingsForm;
