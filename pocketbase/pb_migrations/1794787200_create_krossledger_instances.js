/// One accepted KrossLedger per PocketBase user.
/// Copy this file into the server pb_migrations directory and restart PocketBase.

migrate((app) => {
  const users = app.findCollectionByNameOrId("users");

  const collection = new Collection({
    type: "base",
    name: "krossledger_instances",
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      {
        name: "user",
        type: "relation",
        required: true,
        collectionId: users.id,
        cascadeDelete: true,
        minSelect: 1,
        maxSelect: 1,
      },
      {
        name: "name",
        type: "text",
        required: true,
        min: 1,
        max: 39,
      },
      {
        name: "accepted_at",
        type: "date",
        required: true,
      },
      {
        name: "operation_id",
        type: "text",
        required: false,
        max: 128,
      },
      {
        name: "operation_status",
        type: "text",
        required: false,
        max: 64,
      },
      {
        name: "alert_sent",
        type: "bool",
        required: false,
      },
      {
        name: "healthy_at",
        type: "date",
        required: false,
      },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_krossledger_instances_user ON krossledger_instances (user)",
    ],
  });

  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("krossledger_instances");
  app.delete(collection);
});
