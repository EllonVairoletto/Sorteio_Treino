const database = require("../database/connection");
function active() { return database.prepare("SELECT id, group_name, draw_id FROM draw_groups WHERE deleted_at IS NULL ORDER BY id").all(); }
function markDeleted(ids) { return database.prepare(`UPDATE draw_groups SET deleted_at = CURRENT_TIMESTAMP WHERE id IN (${ids.map(() => "?").join(",")})`).run(...ids); }
module.exports = { active, markDeleted };
