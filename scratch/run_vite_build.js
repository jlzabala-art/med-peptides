import { build } from 'vite';
build()
  .then(() => console.log('Build succeeded'))
  .catch((err) => {
    console.error('Build failed with error:');
    console.error(err);
    if (err.stack) {
      console.error(err.stack);
    }
    process.exit(1);
  });
