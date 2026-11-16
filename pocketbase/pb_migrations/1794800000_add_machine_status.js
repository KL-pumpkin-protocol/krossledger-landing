/// Stores the fleet machine status on ledgers created before those fields existed.
/// Copy this file into the server pb_migrations directory and restart PocketBase.

migrate((app) => {
  const collection = app.findCollectionByNameOrId("krossledger_instances");

  function addText(name) {
    let existing = null;
    try {
      existing = collection.fields.getByName(name);
    } catch (err) {
      existing = null;
    }
    if (existing) return;
    collection.fields.add(new TextField({
      name: name,
      required: false,
      max: 32,
    }));
  }

  addText("provisioning_state");
  addText("readiness");
  addText("ec2_state");
  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("krossledger_instances");
  collection.fields.removeByName("provisioning_state");
  collection.fields.removeByName("readiness");
  collection.fields.removeByName("ec2_state");
  app.save(collection);
});