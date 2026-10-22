// ai tests - whiteboard utils

import { describe, test, expect } from 'vitest';
import {
  PERSISTED_APP_STATE_KEYS,
  pickPersistedAppState,
  readWhiteboardContent,
} from './whiteboard.utils';
import type {
  WhiteboardAppState,
  WhiteboardElements,
} from '../components/WhiteboardCanvas';

describe('whiteboard.utils', () => {
  describe('pickPersistedAppState', () => {
    test('1. Зберігає лише дозволені налаштування Excalidraw', () => {
      const state = {
        theme: 'dark',
        viewBackgroundColor: '#ffffff',
        gridSize: 20,
        viewModeEnabled: true,
        collaborators: ['user-1'],
        selectedElementIds: { element1: true },
      } as unknown as WhiteboardAppState;

      const result = pickPersistedAppState(state);

      expect(result).toEqual({
        theme: 'dark',
        viewBackgroundColor: '#ffffff',
        gridSize: 20,
      });

      expect(result).not.toHaveProperty('viewModeEnabled');
      expect(result).not.toHaveProperty('collaborators');
      expect(result).not.toHaveProperty('selectedElementIds');
    });

    test('2. Повертає порожній об’єкт, якщо немає збережуваних налаштувань', () => {
      expect(pickPersistedAppState({})).toEqual({});
    });

    test('3. Не включає налаштування зі значенням undefined', () => {
      const state = {
        theme: undefined,
        gridSize: 20,
      } as unknown as WhiteboardAppState;

      expect(pickPersistedAppState(state)).toEqual({ gridSize: 20 });
    });

    test('4. Підтримує всі визначені ключі налаштувань', () => {
      const state = Object.fromEntries(
        PERSISTED_APP_STATE_KEYS.map((key) => [key, 'test-value']),
      ) as unknown as WhiteboardAppState;

      const result = pickPersistedAppState(state);

      expect(Object.keys(result)).toEqual([...PERSISTED_APP_STATE_KEYS]);
    });
  });

  describe('readWhiteboardContent', () => {
    test('5. Підтримує старий формат, де збережено лише масив елементів', () => {
      const elements = [{ id: 'element-1' }] as unknown as WhiteboardElements;

      expect(readWhiteboardContent(elements)).toEqual({
        elements,
        appState: {},
      });
    });

    test('6. Підтримує новий формат elements + appState', () => {
      const elements = [{ id: 'element-1' }] as unknown as WhiteboardElements;
      const appState = { theme: 'dark', gridSize: 20 };

      expect(readWhiteboardContent({ elements, appState })).toEqual({
        elements,
        appState,
      });
    });

    test('7. Використовує порожній appState, якщо він відсутній', () => {
      const elements = [{ id: 'element-1' }] as unknown as WhiteboardElements;

      expect(readWhiteboardContent({ elements })).toEqual({
        elements,
        appState: {},
      });
    });

    test('8. Повертає порожні дані для null', () => {
      expect(readWhiteboardContent(null)).toEqual({
        elements: [],
        appState: {},
      });
    });

    test('9. Повертає порожні дані для некоректного об’єкта', () => {
      expect(readWhiteboardContent({ appState: { theme: 'dark' } })).toEqual({
        elements: [],
        appState: {},
      });
    });

    test('10. Повертає порожні дані для рядка', () => {
      expect(readWhiteboardContent('invalid')).toEqual({
        elements: [],
        appState: {},
      });
    });

    test('11. Повертає порожні дані, якщо elements не є масивом', () => {
      expect(
        readWhiteboardContent({ elements: 'invalid', appState: {} }),
      ).toEqual({
        elements: [],
        appState: {},
      });
    });
  });
});
