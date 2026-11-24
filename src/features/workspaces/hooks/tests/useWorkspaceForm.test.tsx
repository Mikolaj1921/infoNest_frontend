// ai tests - hook useWorkspaceForm

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { useWorkspaceForm } from '../useWorkspaceForm';
import { WorkspaceVisibility } from '@/types/workspace';

describe('useWorkspaceForm', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useWorkspaceForm());

    expect(result.current.getValues()).toEqual({
      name: '',
      visibility: WorkspaceVisibility.PRIVATE,
    });
  });

  it('should update the workspace name', () => {
    const { result } = renderHook(() => useWorkspaceForm());

    act(() => {
      result.current.setValue('name', 'My Workspace');
    });

    expect(result.current.getValues('name')).toBe('My Workspace');
  });

  it('should update the workspace visibility', () => {
    const { result } = renderHook(() => useWorkspaceForm());

    act(() => {
      result.current.setValue('visibility', WorkspaceVisibility.PUBLIC);
    });

    expect(result.current.getValues('visibility')).toBe(
      WorkspaceVisibility.PUBLIC,
    );
  });

  it('should reject an empty workspace name', async () => {
    const { result } = renderHook(() => useWorkspaceForm());

    // ua: підписуємося на помилки форми до запуску валідації
    // eslint-disable-next-line
    const errors = result.current.formState.errors;

    let isValid = true;

    await act(async () => {
      isValid = await result.current.trigger('name');
    });

    expect(isValid).toBe(false);
    expect(result.current.formState.errors.name).toBeDefined();
  });

  it('should accept a valid workspace name', async () => {
    const { result } = renderHook(() => useWorkspaceForm());

    act(() => {
      result.current.setValue('name', 'My Workspace');
    });

    let isValid = false;

    await act(async () => {
      isValid = await result.current.trigger('name');
    });

    expect(isValid).toBe(true);
    expect(result.current.formState.errors.name).toBeUndefined();
  });

  it('should validate the complete form', async () => {
    const { result } = renderHook(() => useWorkspaceForm());

    act(() => {
      result.current.setValue('name', 'My Workspace');
      result.current.setValue('visibility', WorkspaceVisibility.PRIVATE);
    });

    let isValid = false;

    await act(async () => {
      isValid = await result.current.trigger();
    });

    expect(isValid).toBe(true);
    expect(result.current.formState.errors).toEqual({});
  });
});
