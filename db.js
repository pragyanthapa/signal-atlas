import neo4j from 'neo4j-driver';
import 'dotenv/config';

let driver;
export const configured = () => Boolean(process.env.COGNODB_URI && process.env.COGNODB_PASSWORD);
export function getDriver() {
  if (!configured()) throw new Error('CognoDB is not configured. Add COGNODB_URI and COGNODB_PASSWORD to .env.');
  if (!driver) driver = neo4j.driver(process.env.COGNODB_URI, neo4j.auth.basic(process.env.COGNODB_USERNAME || 'cognodb', process.env.COGNODB_PASSWORD), { maxConnectionPoolSize: 20 });
  return driver;
}
export async function runRead(cypher, params = {}) {
  const session = getDriver().session({ defaultAccessMode: neo4j.session.READ });
  try { return await session.run(cypher, params); } finally { await session.close(); }
}
export async function closeDriver() { if (driver) await driver.close(); }
