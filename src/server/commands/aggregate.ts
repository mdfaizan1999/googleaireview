import { AnalyticsAggregationService } from '../services/aggregation';

function parseArgs() {
  const args = process.argv.slice(2);
  const options: Record<string, string> = {};

  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      options[key] = value || 'true';
    }
  }
  return options;
}

function run() {
  const options = parseArgs();
  console.log('⚡ [ReviewFlow AI] Running Analytics Daily Aggregation...');
  console.log('   Parameters:', options);

  const start = Date.now();
  const result = AnalyticsAggregationService.aggregate({
    date: options.date,
    from: options.from,
    to: options.to,
    business_id: options.business
  });

  const durationMs = Date.now() - start;

  console.log('✅ Aggregation Completed Successfully:');
  console.log(`   - Raw Events Processed: ${result.processedEvents}`);
  console.log(`   - Daily Records Upserted: ${result.dailyRecordsUpserted}`);
  console.log(`   - Dates Covered: ${result.datesCovered.join(', ') || 'None'}`);
  console.log(`   - Execution Time: ${durationMs}ms`);
}

run();
