/// Adds instance_id for databases that already ran the first KrossLedger migration.
/// Copy this file into the server pb_migrations directory and restart PocketBase.

migrate((app) => {
  const collection = app.findCollectionByNameOrId("krossledger_instances");
  let existing = null;
  try {
    existing = collection.fields.getByName("instance_id");
  } catch (err) {
    existing = null;
  }
  if (existing) return;

  collection.fields.add(new TextField({
    name: "instance_id",
    required: false,
    max: 64,
  }));
  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("krossledger_instances");
  collection.fields.removeByName("instance_id");
  app.save(collection);
});
