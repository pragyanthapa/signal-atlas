import 'dotenv/config';
import { getDriver, closeDriver } from '../db.js';

const statements = [
  'CREATE CONSTRAINT person_id IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE',
  'CREATE CONSTRAINT project_slug IF NOT EXISTS FOR (p:Project) REQUIRE p.slug IS UNIQUE',
  'CREATE CONSTRAINT skill_name IF NOT EXISTS FOR (s:Skill) REQUIRE s.name IS UNIQUE',
  `UNWIND $people AS person MERGE (p:Person {id: person.id}) SET p += person`,
  `UNWIND $skills AS name MERGE (:Skill {name: name})`,
  `UNWIND $projects AS project MERGE (p:Project {slug: project.slug}) SET p += project`,
  `UNWIND $rows AS row MATCH (p:Person {id: row[0]}), (s:Skill {name: row[1]}) MERGE (p)-[:CAN_HELP_WITH]->(s)`,
  `UNWIND $rows AS row MATCH (p:Person {id: row[0]}), (s:Skill {name: row[1]}) MERGE (p)-[:WANTS_TO_LEARN]->(s)`,
  `UNWIND $rows AS row MATCH (p:Person {id: row[0]}), (x:Project {slug: row[1]}) MERGE (p)-[:WORKS_ON]->(x)`,
  `UNWIND $rows AS row MATCH (a:Person {id: row[0]}), (b:Person {id: row[1]}) MERGE (a)-[:KNOWS]->(b)`
];
const people = [
  { id: 'maya', name: 'Maya Chen', role: 'Product designer', location: 'Singapore', avatar: 'MC', availability: 'Open to help' },
  { id: 'jordan', name: 'Jordan Lee', role: 'ML engineer', location: 'London', avatar: 'JL', availability: '2 hours/week' },
  { id: 'amina', name: 'Amina Yusuf', role: 'Climate founder', location: 'Nairobi', avatar: 'AY', availability: 'Open to help' },
  { id: 'diego', name: 'Diego Santos', role: 'Data engineer', location: 'Lisbon', avatar: 'DS', availability: 'Limited' },
  { id: 'elena', name: 'Elena Petrova', role: 'Community lead', location: 'Berlin', avatar: 'EP', availability: 'Open to help' },
  { id: 'sam', name: 'Sam Okafor', role: 'Full-stack engineer', location: 'Toronto', avatar: 'SO', availability: '3 hours/week' }
];
const help = [['maya','Product research'],['maya','Data visualization'],['jordan','Machine learning'],['jordan','Graph databases'],['amina','Climate tech'],['amina','Community building'],['diego','Graph databases'],['diego','Data visualization'],['elena','Community building'],['elena','Product research'],['sam','Machine learning'],['sam','Graph databases']];
const learn = [['maya','Graph databases'],['jordan','Climate tech'],['amina','Data visualization'],['diego','Community building'],['elena','Machine learning'],['sam','Product research']];

try {
  const session = getDriver().session();
  await session.run(statements[0]); await session.run(statements[1]); await session.run(statements[2]);
  await session.run(statements[3], { people });
  await session.run(statements[4], { skills: ['Product research','Graph databases','Machine learning','Community building','Data visualization','Climate tech'] });
  await session.run(statements[5], { projects: [{slug:'canopy',name:'Canopy',summary:'Local climate action network',stage:'Piloting'},{slug:'relay',name:'Relay',summary:'Peer-to-peer learning circles',stage:'Growing'},{slug:'lumen',name:'Lumen',summary:'Open civic data observatory',stage:'Research'}] });
  await session.run(statements[6], { rows: help }); await session.run(statements[7], { rows: learn });
  await session.run(statements[8], { rows: [['maya','canopy'],['jordan','lumen'],['amina','canopy'],['diego','lumen'],['elena','relay'],['sam','relay']] });
  await session.run(statements[9], { rows: [['maya','elena'],['elena','amina'],['amina','diego'],['diego','jordan'],['jordan','sam'],['sam','maya']] });
  await session.close(); console.log('Seeded Signal Atlas successfully.');
} catch (error) { console.error(`Seeding failed: ${error.message}`); process.exitCode = 1; }
finally { await closeDriver(); }
