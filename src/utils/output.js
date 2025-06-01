/**
 * Console output made readable for humans
 * @param {'success'|'error'|'info'} type - Message type
 * @param {string} message - Main message content
 * @param {string} [entity] - Optional entity identifier (e.g., "team@123")
 */
function humanOutput(type, message, entity="") {
  const prefixes = {
    success: "[SUCCESS]",
    error: "[ERROR]",
    info: "[INFO]"
  };

  const entityPart = entity ? `${entity} ` : '';
  console.log(`${prefixes[type] || '[ ]'} ${entityPart}${message}`);
}

modules.export = { humanOutput };