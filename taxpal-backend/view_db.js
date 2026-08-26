const { connectDB, query } = require('./src/config/db');

const table = process.argv[2];

async function main() {
  await connectDB();
  
  if (!table) {
    console.log('\n================ AVAILABLE TABLES ================');
    const tables = await query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    for (const t of tables) {
      const countRes = await query(`SELECT COUNT(*) as count FROM ${t.name}`);
      console.log(`- ${t.name.padEnd(20)} (${countRes[0].count} rows)`);
    }
    console.log('\nUsage: node view_db.js <table_name>');
    console.log('Example: node view_db.js users');
    console.log('Example: node view_db.js transactions\n');
    process.exit(0);
  }

  console.log(`\n================ TABLE: [${table.toUpperCase()}] ================`);
  const rows = await query(`SELECT * FROM ${table}`);
  if (rows.length === 0) {
    console.log('No records found in this table.');
  } else {
    console.table(rows);
  }
  console.log('===================================================\n');
  process.exit(0);
}

main().catch(err => {
  console.error('Error querying database:', err.message);
  process.exit(1);
});
