import '@testing-library/jest-dom';
import { configure } from '@testing-library/dom';

// Increase default waitFor and findBy* timeout from 1000ms to 8000ms to avoid flaky timeouts in JSDOM under parallel test runs
configure({ asyncUtilTimeout: 8000 });
