/**
 * Copyright (c) 2025 Capital One
*/

import "@testing-library/jest-dom";
import "jest-canvas-mock";
import { TextDecoder as NodeTextDecoder } from 'util';
import { TextEncoder as NodeTextEncoder } from 'util';

global.TextEncoder = NodeTextEncoder as typeof TextEncoder;
global.TextDecoder = NodeTextDecoder as typeof TextDecoder;

(global as any).URL.createObjectURL = jest.fn(() => 'mock-url');