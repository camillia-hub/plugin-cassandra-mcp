// plugin-cassandra-mcp
// Queries an Apache Cassandra cluster.
// Grant requested: comment-task (the plugin only ever returns comment operations).

const MCP_SERVER_KEY = "cassandra";
const MCP_SERVER_CONFIG = {
  "command": "npx",
  "args": [
    "-y",
    "cassandra-mcp",
    "--contact-points",
    "<host>",
    "--port",
    "9042",
    "--keyspace",
    "<keyspace>"
  ]
};
const SETUP_STEPS = [
  "Create a role with SELECT on the keyspace.",
  "Store the credentials in the workspace secrets store.",
  "Add the entry to the workspace MCP configuration."
];
const DOCS_URL = "https://www.npmjs.com/package/cassandra-mcp";
const MAX_COMMENT_LENGTH = 10000;

function asString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : "";
}

export function buildSetupComment(event) {
  const lines = [];
  lines.push("### Cassandra MCP — workspace configuration");
  lines.push("");
  lines.push("This workspace has the **Cassandra MCP** plugin installed.");
  lines.push("It installs and configures the Cassandra MCP server: the agent can then inspect keyspaces and tables, run CQL and check partition health on Cassandra.");
  const title = asString(event && event.taskTitle);
  if (title) {
    lines.push("");
    lines.push("Task: **" + title + "**");
  }
  lines.push("");
  lines.push("Add this entry to the workspace `mcp.servers` configuration:");
  lines.push("");
  lines.push("```json");
  lines.push(JSON.stringify({ [MCP_SERVER_KEY]: MCP_SERVER_CONFIG }, null, 2));
  lines.push("```");
  lines.push("");
  lines.push("**Setup**");
  for (let i = 0; i < SETUP_STEPS.length; i++) {
    lines.push((i + 1) + ". " + SETUP_STEPS[i]);
  }
  lines.push("");
  lines.push("Docs: " + DOCS_URL);
  let text = lines.join("\n");
  if (text.length > MAX_COMMENT_LENGTH) {
    text = text.slice(0, MAX_COMMENT_LENGTH - 3) + "...";
  }
  return text;
}

export async function taskCreated(event) {
  const text = buildSetupComment(event);
  if (!text) return [];
  return [{ type: "comment", value: text }];
}

export const hooks = {
  "task.created": taskCreated,
};
