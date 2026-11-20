import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Моки для залежностей сторінки
const mocks = vi.hoisted(() => ({
  useWorkspaces: vi.fn(),
  workspaceCard: vi.fn(),
  createWorkspaceModal: vi.fn(),
  skeleton: vi.fn(),
  emptyState: vi.fn(),
}));

vi.mock('@/features/workspaces/hooks/useWorkspaces', () => ({
  useWorkspaces: mocks.useWorkspaces,
}));

vi.mock('@/features/workspaces/components/WorkspaceCard', () => ({
  // eslint-disable-next-line
  WorkspaceCard: (props: any) => {
    mocks.workspaceCard(props);

    return <div data-testid="workspace-card">{props.workspace.name}</div>;
  },
}));

vi.mock('@/features/workspaces/components/WorkspacesSkeleton', () => ({
  WorkspacesSkeleton: () => {
    mocks.skeleton();

    return <div data-testid="workspaces-skeleton">Loading...</div>;
  },
}));

vi.mock('@/features/workspaces/components/WorkspacesEmptyState', () => ({
  WorkspacesEmptyState: () => {
    mocks.emptyState();

    return <div data-testid="workspaces-empty-state">No workspaces</div>;
  },
}));

vi.mock('@/features/workspaces/components/CreateWorkspaceModal', () => ({
  // eslint-disable-next-line
  CreateWorkspaceModal: (props: any) => {
    mocks.createWorkspaceModal(props);

    if (!props.isOpen) {
      return null;
    }

    return (
      <div data-testid="create-workspace-modal">
        <button onClick={props.onClose}>Close modal</button>
      </div>
    );
  },
}));

import WorkspacesPage from './page';

describe('WorkspacesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockWorkspaces = [
    {
      id: 'workspace-1',
      name: 'Personal Workspace',
    },
    {
      id: 'workspace-2',
      name: 'Project Workspace',
    },
  ];

  test('renders loading skeleton while workspaces are loading', () => {
    mocks.useWorkspaces.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<WorkspacesPage />);

    expect(screen.getByTestId('workspaces-skeleton')).toBeTruthy();
    expect(screen.queryByTestId('workspaces-empty-state')).toBeNull();
    expect(screen.queryByText('Workspaces')).toBeNull();
  });

  test('renders empty state when workspaces are undefined', () => {
    mocks.useWorkspaces.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    render(<WorkspacesPage />);

    expect(screen.getByTestId('workspaces-empty-state')).toBeTruthy();
    expect(screen.queryByTestId('workspaces-skeleton')).toBeNull();
  });

  test('renders empty state when workspaces array is empty', () => {
    mocks.useWorkspaces.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<WorkspacesPage />);

    expect(screen.getByTestId('workspaces-empty-state')).toBeTruthy();
  });

  test('renders page heading and description when workspaces exist', () => {
    mocks.useWorkspaces.mockReturnValue({
      data: mockWorkspaces,
      isLoading: false,
    });

    render(<WorkspacesPage />);

    expect(screen.getByRole('heading', { name: 'Workspaces' })).toBeTruthy();
    expect(
      screen.getByText('Select a workspace to access your structured database'),
    ).toBeTruthy();
  });

  test('renders a WorkspaceCard for every workspace', () => {
    mocks.useWorkspaces.mockReturnValue({
      data: mockWorkspaces,
      isLoading: false,
    });

    render(<WorkspacesPage />);

    expect(screen.getAllByTestId('workspace-card').length).toBe(2);
    expect(screen.getByText('Personal Workspace')).toBeTruthy();
    expect(screen.getByText('Project Workspace')).toBeTruthy();
    expect(mocks.workspaceCard).toHaveBeenCalledTimes(2);
  });

  test('does not render create modal initially', () => {
    mocks.useWorkspaces.mockReturnValue({
      data: mockWorkspaces,
      isLoading: false,
    });

    render(<WorkspacesPage />);

    expect(screen.queryByTestId('create-workspace-modal')).toBeNull();
  });

  test('opens create modal after clicking New Workspace', () => {
    mocks.useWorkspaces.mockReturnValue({
      data: mockWorkspaces,
      isLoading: false,
    });

    render(<WorkspacesPage />);

    fireEvent.click(screen.getByRole('button', { name: /New Workspace/i }));

    expect(screen.getByTestId('create-workspace-modal')).toBeTruthy();
  });

  test('closes create modal after calling onClose', () => {
    mocks.useWorkspaces.mockReturnValue({
      data: mockWorkspaces,
      isLoading: false,
    });

    render(<WorkspacesPage />);

    fireEvent.click(screen.getByRole('button', { name: /New Workspace/i }));
    expect(screen.getByTestId('create-workspace-modal')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Close modal' }));

    expect(screen.queryByTestId('create-workspace-modal')).toBeNull();
  });
});
