// whiteboard controller hook

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  useWorkspaceWhiteboard,
  useUpdateWhiteboard,
  useUpdateWhiteboardSettings,
} from '@/hooks/useWhiteboardData';

import type {
  WhiteboardAppState,
  WhiteboardElements,
  WhiteboardTheme,
} from '../components/WhiteboardCanvas';

import type {
  Whiteboard,
  WhiteboardRole,
  WhiteboardSettings,
} from '@/types/whiteboard';

import type { WhiteboardSaveStatus } from '../components/WhiteboardHeader';

import {
  pickPersistedAppState,
  readWhiteboardContent,
} from '../utils/whiteboard.utils';

import { useDebounce } from '@/hooks/useDebounce';

interface WhiteboardDraft {
  boardId: string;
  elements: WhiteboardElements;
  appState: WhiteboardAppState;
}

interface UseWhiteboardControllerResult {
  whiteboard: Whiteboard | undefined;
  role: WhiteboardRole | undefined;
  canEdit: boolean;
  elements: WhiteboardElements;
  appState: WhiteboardAppState;
  isLoading: boolean;
  isError: boolean;
  isReadOnly: boolean;
  saveStatus: WhiteboardSaveStatus;
  setIsReadOnly: (value: boolean) => void;
  retryLoading: () => void;
  handleChange: (
    nextElements: WhiteboardElements,
    nextAppState: WhiteboardAppState,
  ) => void;
  handleThemeChange: (theme: WhiteboardTheme) => void;
}

export function useWhiteboardController(
  workspaceId: string,
): UseWhiteboardControllerResult {
  const whiteboardQuery = useWorkspaceWhiteboard(workspaceId);
  const updateWhiteboard = useUpdateWhiteboard(workspaceId);
  const updateWhiteboardSettings = useUpdateWhiteboardSettings(workspaceId);

  // ua: API повертає дошку разом із роллю поточного користувача
  const whiteboard: Whiteboard | undefined = whiteboardQuery.data?.whiteboard;

  const role = whiteboardQuery.data?.role;

  // ua: редагувати дошку можуть лише Owner, Admin та Editor
  const canEdit = role === 'Owner' || role === 'Admin' || role === 'Editor';

  const [draft, setDraft] = useState<WhiteboardDraft | null>(null);
  const [manualReadOnly, setManualReadOnly] = useState(false);
  const [saveStatus, setSaveStatus] = useState<WhiteboardSaveStatus>('saved');

  // ua: режим перегляду примусово вмикається для користувачів без прав редагування
  const isReadOnly = !canEdit || manualReadOnly;

  const lastSavedElementsRef = useRef<string | null>(null);
  const lastSavedSettingsRef = useRef<string | null>(null);
  const savedBoardIdRef = useRef<string | null>(null);

  // ua: формуємо початковий стан із даних сервера без setState в ефекті
  const initialData = useMemo(() => {
    if (!whiteboard) {
      return null;
    }

    const content = readWhiteboardContent(whiteboard.elements);

    const initialAppState: WhiteboardAppState = {
      ...content.appState,
      ...(whiteboard.settings ?? {}),
    };

    const initialTheme: WhiteboardTheme =
      initialAppState.theme === 'dark' ? 'dark' : 'light';

    initialAppState.theme = initialTheme;

    return {
      boardId: whiteboard.id,
      elements: content.elements,
      appState: initialAppState,
    };
  }, [whiteboard]);

  // ua: використовуємо чернетку лише для поточної дошки
  const activeDraft = draft?.boardId === whiteboard?.id ? draft : null;

  const elements = activeDraft?.elements ?? initialData?.elements ?? [];

  const appState = activeDraft?.appState ?? initialData?.appState ?? {};

  // ua: чекаємо 2 секунди після останньої зміни перед збереженням
  const debouncedDraft = useDebounce(activeDraft, 2000);

  // ua: фіксуємо початкові знімки, не змінюючи React state в ефекті
  useEffect(() => {
    if (!initialData) {
      return;
    }

    if (savedBoardIdRef.current === initialData.boardId) {
      return;
    }

    savedBoardIdRef.current = initialData.boardId;

    lastSavedElementsRef.current = JSON.stringify(initialData.elements);

    lastSavedSettingsRef.current = JSON.stringify(
      pickPersistedAppState(initialData.appState),
    );
  }, [initialData]);

  // ua: автоматично зберігаємо елементи дошки лише за наявності прав редагування
  useEffect(() => {
    if (
      !canEdit ||
      !whiteboard ||
      !debouncedDraft ||
      debouncedDraft.boardId !== whiteboard.id ||
      savedBoardIdRef.current !== whiteboard.id ||
      updateWhiteboard.isPending
    ) {
      return;
    }

    const currentSnapshot = JSON.stringify(debouncedDraft.elements);

    if (currentSnapshot === lastSavedElementsRef.current) {
      return;
    }

    updateWhiteboard.mutate(
      {
        whiteboardId: whiteboard.id,
        elements: debouncedDraft.elements,
      },
      {
        onSuccess: () => {
          lastSavedElementsRef.current = currentSnapshot;
          setSaveStatus('saved');
        },
        onError: () => {
          setSaveStatus('error');
        },
      },
    );
  }, [canEdit, debouncedDraft, whiteboard, updateWhiteboard]);

  // ua: автоматично зберігаємо налаштування Excalidraw лише за наявності прав редагування
  useEffect(() => {
    if (
      !canEdit ||
      !whiteboard ||
      !debouncedDraft ||
      debouncedDraft.boardId !== whiteboard.id ||
      savedBoardIdRef.current !== whiteboard.id ||
      updateWhiteboardSettings.isPending
    ) {
      return;
    }

    const settings: WhiteboardSettings = pickPersistedAppState(
      debouncedDraft.appState,
    );

    const currentSnapshot = JSON.stringify(settings);

    if (currentSnapshot === lastSavedSettingsRef.current) {
      return;
    }

    updateWhiteboardSettings.mutate(
      {
        whiteboardId: whiteboard.id,
        settings,
      },
      {
        onSuccess: () => {
          lastSavedSettingsRef.current = currentSnapshot;
          setSaveStatus('saved');
        },
        onError: () => {
          setSaveStatus('error');
        },
      },
    );
  }, [canEdit, debouncedDraft, whiteboard, updateWhiteboardSettings]);

  // ua: оновлюємо локальну чернетку після змін на полотні
  const handleChange = useCallback(
    (nextElements: WhiteboardElements, nextAppState: WhiteboardAppState) => {
      if (!canEdit || isReadOnly || !initialData) {
        return;
      }

      setDraft((currentDraft) => {
        const currentState =
          currentDraft?.boardId === initialData.boardId
            ? currentDraft.appState
            : initialData.appState;

        const currentTheme: WhiteboardTheme =
          currentState.theme === 'dark' ? 'dark' : 'light';

        return {
          boardId: initialData.boardId,
          elements: nextElements,
          appState: {
            ...pickPersistedAppState(nextAppState),
            theme: currentTheme,
          },
        };
      });
    },
    [canEdit, initialData, isReadOnly],
  );

  // ua: тема оновлюється в чернетці й зберігається загальним механізмом
  const handleThemeChange = useCallback(
    (theme: WhiteboardTheme) => {
      if (!canEdit || !initialData) {
        return;
      }

      setDraft((currentDraft) => {
        const currentDraftForBoard =
          currentDraft?.boardId === initialData.boardId
            ? currentDraft
            : {
                boardId: initialData.boardId,
                elements: initialData.elements,
                appState: initialData.appState,
              };

        return {
          ...currentDraftForBoard,
          appState: {
            ...currentDraftForBoard.appState,
            theme,
          },
        };
      });
    },
    [canEdit, initialData],
  );

  // ua: користувач без прав редагування не може вимкнути режим перегляду
  const setIsReadOnly = useCallback(
    (value: boolean) => {
      if (!canEdit) {
        setManualReadOnly(true);
        return;
      }

      setManualReadOnly(value);
    },
    [canEdit],
  );

  const retryLoading = useCallback(() => {
    void whiteboardQuery.refetch();
  }, [whiteboardQuery]);

  // ua: статус збереження враховує обидві мутації
  const currentSaveStatus: WhiteboardSaveStatus =
    saveStatus === 'error'
      ? 'error'
      : updateWhiteboard.isPending || updateWhiteboardSettings.isPending
        ? 'saving'
        : saveStatus;

  return {
    whiteboard,
    role,
    canEdit,
    elements,
    appState,
    isLoading: whiteboardQuery.isLoading,
    isError: whiteboardQuery.isError,
    isReadOnly,
    saveStatus: currentSaveStatus,
    setIsReadOnly,
    retryLoading,
    handleChange,
    handleThemeChange,
  };
}
