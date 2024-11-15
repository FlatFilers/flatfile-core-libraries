import { Flatfile } from "@flatfile/api";

export const workbook: Pick<
  Flatfile.CreateWorkbookConfig,
  "name" | "labels" | "sheets" | "actions"
> = {
  name: "All Data",
  labels: ["pinned"],
  sheets: [
    {
      name: "Contacts",
      slug: "contacts",
      fields: [
        {
          key: "firstName",
          type: "string",
          label: "First Name",
        },
        {
          key: "lastName",
          type: "string",
          label: "Last Name",
        },
        {
          key: "email",
          type: "string",
          label: "Email",
        },
      ],
    },
  ],
  actions: [
    {
      operation: "submitActionFg",
      mode: "foreground",
      label: "Submit foreground",
      description: "Submit data to webhook.site",
      primary: true,
    },
  ],
};
