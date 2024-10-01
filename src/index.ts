import 'dotenv/config';
import { connectMongoose, syncData } from './sync/controller';

connectMongoose().then(async () => {

  try {
    // await syncData('video-card');
    // await syncData('cpu');
    // await syncData('case-accessory');
    // await syncData('case-fan');
    // await syncData('case');
    await syncData('cpu-cooler');




    console.log('done')

  } catch (e) {
    console.log('mongo write read error', e);
    process.exit(1)
  } finally {
  }

}).catch(e => console.log('in mongoose boot', e))

